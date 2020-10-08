//画布环境初始化设置需要的参数
var canvas;
var gl;
var program;
//计算复合变换矩阵需要的参数和矩阵
var theta = 10.0;  //旋转量
var shearfacter=0.1;//错切因子
var CompositeMatrix = new mat4(  
    [1.0, 0.0, 0.0, 0.0],
    [0.0, 1.0, 0.0, 0.0],
    [0.0, 0.0, 1.0, 0.0],
    [0.0, 0.0, 0.0, 1.0]
);//复合变换矩阵

//var centerchageflag=false;//变换中心原点是否改变
var u_centerX, u_centerY;
var centerX = 0.0;
var centerY = 0.0;

//场景中的物体：X轴，Y轴，一个三角形
var vertextsXYT = new Float32Array([
    -0.9,  0.0,     //X轴
     0.9,  0.0,
     0.9,  0.0,
    0.87, 0.03,
     0.9,  0.0,
    0.87,-0.03,
    
      0.0,  0.9,    //Y轴
      0.0, -0.9,
      0.0,  0.9,
     0.03, 0.87,
      0.0,  0.9,
    -0.03, 0.87,

    0.2 , 0.2,      //图形
    -0.2, 0.2,
    -0.2 , -0.2,
	0.2, -0.2
]);

//向GPU传送的数据和绑定的变量
var bufferId;
var a_vPosition;
var u_CompositeMatrix;
var u_vColor;
var u_flag;



/***窗口加载时调用----绘图环境初始化程序********/
window.onload = function() {
	canvas = document.getElementById( "canvas" ); //创建画布
    gl = WebGLUtils.setupWebGL( canvas );    //创建webgl画图环境
    if ( !gl ) { alert( "WebGL isn't available" ); }
	
	canvas.width = document.body.clientWidth;   //获取画布宽度       
    canvas.height = document.body.clientHeight; //获取画布高度  
    wh= canvas.width / canvas.height; //纵横比
	gl.viewport( 0, 0, canvas.width, canvas.height );//设置视口大小同画布大小
	
	
	gl.enable(gl.DEPTH_TEST); //设置背景颜色
    gl.clearColor(1.0, 1.0, 1.0, 1.0); //设置背景色      
    gl.clear( gl.COLOR_BUFFER_BIT );  //用背景色填充帧缓存

    program = initShaders( gl, "vertex-shader", "fragment-shader" );//初始化shader
    gl.useProgram( program );

    //初始化数据缓冲区，并关联shader变量 
    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );	
    gl.bufferData( gl.ARRAY_BUFFER, vertextsXYT, gl.STATIC_DRAW );
	
    // Associate out shader variables with our data buffer
	//顶点数组关联
    a_vPosition = gl.getAttribLocation( program, "a_vPosition" );
    gl.vertexAttribPointer( a_vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( a_vPosition );	
	
	//全局变量关联
	u_centerX=gl.getUniformLocation(program,"u_centerX");
	u_centerY=gl.getUniformLocation(program,"u_centerY");	
    u_CompositeMatrix = gl.getUniformLocation(program,"u_CompositeMatrix");//当前变换矩阵
    u_vColor = gl.getUniformLocation(program,"u_vColor");//当前图元颜色
    u_flag = gl.getUniformLocation(program, "u_flag");//当前图元标志
	
	//*******canvas位置点击监听*******************
	canvas.addEventListener("click", function(event){
		var x = event.clientX;
		var y = event.clientY;
		var rect = event.target.getBoundingClientRect();
        //下面是进行将(x,y)进行视区窗区映射，计算出VC窗口中的对应坐标后，以它为中心重新渲染图形
        //console.log(x);console.log(y);console.log(rect.left);console.log(rect.top);
        centerX = (x - rect.left)/(canvas.width)*2-1;
        centerY = 1 - (y-rect.top)/(canvas.height)*2;
        render();
        
   });       
   
    render();//调用绘制函数
}

/*************绘制函数render********************/
function render(){	
    //清屏
    gl.clear( gl.COLOR_BUFFER_BIT );
	
    //传递图形中心参数
    //alert(centerX);	alert(centerY);
	gl.uniform1f(u_centerX, centerX);
	gl.uniform1f(u_centerY, centerY);
	
    //标志位为0，用顶点绘制坐标系
    gl.uniform1i(u_flag, 0);                    
    gl.uniform4f(u_vColor, 0.0, 0.0, 0.0, 1.0);   //X轴为黑色
    gl.drawArrays(gl.LINES, 0, 6)               //绘制X轴
    gl.uniform4f(u_vColor, 0.0, 0.0, 0.0, 1.0);   //y轴为黑色
    gl.drawArrays(gl.LINES, 6, 6);               //绘制y轴
	
    //标志位为1，用顶点绘制图形
    gl.uniform1i(u_flag, 1);                   
    gl.uniformMatrix4fv(u_CompositeMatrix, false, flatten(CompositeMatrix));//传递变换矩阵
    gl.uniform4f(u_vColor, 1.0, 0.0, 0.0, 1.0);   //图形为红色
	
    gl.drawArrays(gl.LINE_LOOP, 12, 4);         //绘制图形部分

}
//===========================================================================

/*********绘图界面随窗口交互缩放而相应变化**************/
window.onresize = function(){
    canvas.width = document.body.clientWidth;   //获取画布宽度       
    canvas.height = document.body.clientHeight; //获取画布高度  
	gl.viewport( 0, 0, canvas.width, canvas.height );//设置视口大小同画布大小
}

/*********注册键盘按键事件*******************************/

window.onkeydown = function(e){
    let code = e.keyCode;
    switch (code) {
        case 32:    // 空格-重置
		    //alert(e.keyCode);
            resetXY();
            break;			
        case 87:    // W-Y轴正向移动
		    incY();
            break;
        case 83:    // S-Y轴负向移动
            decY();
            break;
		case 65:    // A-X轴负向移动
            decX();
            break;
        case 68:    // D-X轴正向移动
            incX();
            break;
			
        case 82:    // R-逆时针旋转
		    antiClockwise();   
            break;
        case 85:    //U-顺时针旋转
            Clockwise();    
            break;
			
			
        case 74:       // J-缩放X-放大
            xLarger();
            break;
		case 76:       // L-缩放X-缩小
		    xSmaller();
            break;
		case 73:       // I-缩放Y-放大
            yLarger();
            break;
		case 75:       // K-缩放Y-缩小
            ySmaller();
            break;	
			
		case 88:       // X轴反射
            xReflex();
            break;
		case 89:       // Y轴反射
            yReflex();
            break;
		case 79:       // 原点反射
            OReflex();
            break;
			
		case 86:       // V-错切X:x=x+my
            xShearInc();
            break;
		case 66:       // B-错切X:x=x-my
		    xShearDec();
            break;
		case 78:       // N-错切Y:y=y+mx
            yShearInc();
            break;
		case 77:       // M-错切Y:y=y-mx
            yShearDec();
            break;		

    }	
	render();//交互后需要调用render重新绘制
}


/*********重置复位******************/
function resetXY(){
	centerX=0.0;
	centerY=0.0;
    CompositeMatrix = mat4(
        [1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
    );
}

/*********X,Y方向的错切***********************/
function xShearInc(){
    var temp = mat4(
        [1.0, 0.0, 0.0, 0.0],
        [0.1, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
    );
    CompositeMatrix = mult(temp,CompositeMatrix);
}

function xShearDec(){
    var temp = mat4(
        [1.0, 0.0, 0.0, 0.0],
        [-0.1, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
    );
    CompositeMatrix = mult(temp,CompositeMatrix);
}

function yShearInc(){
    var temp = mat4(
        [1.0, 0.1, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
    );
    CompositeMatrix = mult(temp,CompositeMatrix);
}

function yShearDec(){
    var temp = mat4(
        [1.0, -0.1, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
    );
    CompositeMatrix = mult(temp,CompositeMatrix);
}

/*********X,Y,O 反射/对称************************/
function xReflex(){
    var temp = mat4(
        [1.0, 0.0, 0.0, 0.0],
        [0.0, -1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
    );
    CompositeMatrix = mult(temp,CompositeMatrix);
}

function yReflex(){
    var temp = mat4(
        [-1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
    );
    CompositeMatrix = mult(temp,CompositeMatrix);
}

function OReflex(){
    var temp = mat4(
        [-1.0, 0.0, 0.0, 0.0],
        [0.0, -1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
    );
    CompositeMatrix = mult(temp,CompositeMatrix);
}

/*********X,Y方向的缩放************************/
function xLarger(){
    var temp = mat4(
        [1.1, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
    );
    CompositeMatrix = mult(temp,CompositeMatrix);
}

function xSmaller(){
    var temp = mat4(
        [0.9, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
    );
    CompositeMatrix = mult(temp,CompositeMatrix);
}

function yLarger(){
    var temp = mat4(
        [1.0, 0.0, 0.0, 0.0],
        [0.0, 1.1, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
    );
    CompositeMatrix = mult(temp,CompositeMatrix);
}

function ySmaller(){
    var temp = mat4(
        [1.0, 0.0, 0.0, 0.0],
        [0.0, 0.9, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
    );
    CompositeMatrix = mult(temp,CompositeMatrix);
}

/*********旋转--注意角度转换为弧度值***************/
function Clockwise(){
    var temp = mat4(
        [Math.cos(theta/360), Math.sin(theta/360), 0.0, 0.0],
        [-Math.sin(theta/360), Math.cos(theta/360), 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
    );
    CompositeMatrix = mult(temp,CompositeMatrix);
}

function antiClockwise(){
    var temp = mat4(
        [Math.cos(theta/360), -Math.sin(theta/360), 0.0, 0.0],
        [Math.sin(theta/360), Math.cos(theta/360), 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
    );
    CompositeMatrix = mult(temp,CompositeMatrix);
}


/*********X,Y方向的平移***********************/
function decX(){
    var temp = mat4(
        [1.0, 0.0, 0.0, -0.1],
        [0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
    );
    CompositeMatrix = mult(temp,CompositeMatrix);
}

function incX(){
    var temp = mat4(
        [1.0, 0.0, 0.0, 0.1],
        [0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
    );
    CompositeMatrix = mult(temp,CompositeMatrix);
}

function incY(){
    var temp = mat4(
        [1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.1],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
    );
    CompositeMatrix = mult(temp,CompositeMatrix);
}

function decY(){
    var temp = mat4(
        [1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, -0.1],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
    );
    CompositeMatrix = mult(temp,CompositeMatrix);
}
