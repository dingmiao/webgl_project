//画布环境初始化设置需要的参数
var canvas;
var gl;
var program;

//需要从界面获取的参数，初始化值
var theta = 0;
var phi = 90;
var xyzflag=0; //0-x,1-y,2-z;根据交互得到图形那个方向进行缩放
var scalefactor=1.0;//根据交互得到是放大还是缩小,设置单一次缩放的比例因子1.1或者0.9
var fov = 120; //perspective的俯仰角，越大图投影越小
var isOrth= true ;//默认是正投影
//初始化值
var  ModelMatrix = mat4();//单位阵
var  ViewMatrix=mat4();//单位阵
var  ProjectionMatrix=mat4();//单位矩阵

//对应shader里的变量
var  u_ModelMatrix,u_ViewMatrix, u_ProjectionMatrix;
var u_flag;//区分坐标轴还是图形


/***窗口加载时调用:程序环境初始化程序********/
window.onload = function() {
	canvas = document.getElementById( "canvas" ); //创建画布
    gl = WebGLUtils.setupWebGL( canvas );    //创建webgl画图环境
    if ( !gl ) { alert( "WebGL isn't available" ); }
	
	program = initShaders( gl, "vertex-shader", "fragment-shader" );//初始化shader
    gl.useProgram( program );	//启用
	
	canvas.width = document.body.clientWidth;   //获取画布宽度       
    canvas.height = document.body.clientHeight; //获取画布高度  
	gl.viewport( 0, 0, canvas.width, canvas.height );//设置视口大小同画布大小	
	
	gl.enable(gl.DEPTH_TEST); //开启深度缓存
    //gl.clearColor(0.737255, 0.745098, 0.752941, 1.0); //设置背景色 
    gl.clearColor(1.0, 1.0,1.0, 1.0); //设置背景色  
	
	
	//---------------------------生成顶点数据并保存到顶点属性数组---------------------
    vertextsXYZ();  //生成XYZ坐标轴需要的顶点位置和颜色到points[],colors[]
	//colorCube();    //生成立方体需要的顶点位置和颜色到points[],colors[]
	//colorHat();
	honoluluMeshData(128);
	
	
    //------Associate out shader variables with our data buffer and variable-------
    var vBuffer = gl.createBuffer();//为points存储的缓存
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );  //flatten：MV.js里函数，扁平化
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	var cBuffer = gl.createBuffer();//为colors存储的缓存
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW ); //flatten：MV.js里函数，扁平化
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
	
    u_ModelMatrix = gl.getUniformLocation(program,"u_ModelMatrix");
	u_ViewMatrix = gl.getUniformLocation( program, "u_ViewMatrix" );
    u_ProjectionMatrix = gl.getUniformLocation( program, "u_ProjectionMatrix" );
    u_flag = gl.getUniformLocation(program, "u_flag");

	//---------------------------------------------------------------------------------
    render();//调用绘制函数
}


/******绘制函数render************/
function render(){	
    //清屏
	gl.clear( gl.COLOR_BUFFER_BIT );  //用背景色清屏
	
	//视点和投影必须一起作，并且位置放在render里恰当！
	formViewMatrix();
	formProjectMatrix();
    
    //传递变换矩阵	
	gl.uniformMatrix4fv(u_ModelMatrix, false, flatten(ModelMatrix));//传递模型变换矩阵	
	gl.uniformMatrix4fv( u_ViewMatrix, false, flatten(ViewMatrix) );//传递视点变换矩阵
    gl.uniformMatrix4fv( u_ProjectionMatrix, false, flatten(ProjectionMatrix) );//传递投影变换矩阵
	/////////////////////////////////////////////////////////////////////////////////////
	
	//alert(numVertices);  //所有顶点应该是18+36=54
     //标志位为0，用顶点绘制坐标系
    gl.uniform1i(u_flag, 0);     
    gl.drawArrays(gl.LINES, 0, 6)               //绘制X轴，从0开始，读6个点
    gl.drawArrays(gl.LINES, 6, 6);               //绘制y轴，从6开始，读6个点
    gl.drawArrays(gl.LINES, 12, 6);               //绘制z轴，从12开始，读6个点		

	//标志位为1，用顶点绘制面单色立方体
    gl.uniform1i(u_flag, 1);     
	gl.drawArrays( gl.TRIANGLES, 18, points.length-18 );//绘制立方体,读取余下的点应该是36个	
	
	/*
    for(var i=18; i<points.length; i+=4) {
        gl.drawArrays(gl.TRIANGLE_FAN, i, 4);//绘制规则四边形网格图形
        gl.drawArrays(gl.LINE_LOOP, i, 4);
    }
	*/
}

/*********绘图界面随窗口交互缩放而相应变化**************/
window.onresize = function(){
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    gl.viewport( 0, 0, canvas.width, canvas.height );		
	render();
}

/*********注册键盘按键事件**********************/
window.onkeydown = function(e){
    let code = e.keyCode;
    switch (code) {
        case 32:    // 空格-重置
            initViewingParameters();//恢复相机初始位置，MVP矩阵单位化，投影方式为正投影
            break;	
			
        //WS/AD-相机绕X/Y轴旋转,重新计算EYE和UP			
        case 87:    // W-视点绕X轴顺时针旋转5度
                phi -=5;
                break;
		case 83:    // S-视点绕X轴逆时针旋转5度
                phi +=5;
                break;
		case 65:    // A-视点绕Y轴顺时针旋转5度
                theta -=5;
                break;
        case 68:    // D-视点绕Y轴逆时针旋转5度
                theta += 5;
                break;
				
	    //P-切换投影方式
			case 80:     //P-切换投影方式
				isOrth=!isOrth;
			    break;
				
			case 77://M   //放大俯仰角
				fov+=5;
                break;
				
			case 78://N  //较小俯仰角
			    fov-=5;
                break; 
			     

		//JL/IK/UO-物体缩放X/Y/Z
        case 74:       // J-缩放X-放大
            xyzflag=0;
			scalefactor=1.1;
			formModelMatrix();
			break;
		case 76:       // L-缩放X-缩小
			xyzflag=0;
			scalefactor=0.9;
			formModelMatrix();
            break;
		case 73:       // I-缩放Y-放大
            xyzflag=1;
			scalefactor=1.1;
			formModelMatrix();
			break;
		case 75:       // K-缩放Y-缩小
			xyzflag=1;
			scalefactor=0.9;
			formModelMatrix();
            break;	
		case 85:       // U-缩放Z-放大
			xyzflag=2;
			scalefactor=1.1;
			formModelMatrix();
            break;
		case 79:       // O-缩放Z-缩小
			xyzflag=2;
			scalefactor=0.9;
            formModelMatrix();			
            break;	
    }	
	
	render();//交互后需要调用render重新绘制
}



//////////////////////////////////////////////////////////////////////////////////////////////////////
/*复位：模型变换矩阵参数复原，恢复相机初始位置，投影方式为正投影*/
function initViewingParameters(){
	//需要从界面获取的参数，初始化值
	//需要从界面获取的参数，初始化值
	theta = 0;
	phi = 90;
	xyzflag=0; //0-x,1-y,2-z;根据交互得到图形那个方向进行缩放
	scalefactor=1.0;//根据交互得到是放大还是缩小,设置单一次缩放的比例因子1.1或者0.9

	isOrth= true ;//默认是正投影
	fov = 120; //perspective的俯仰角，越大图投影越小
	//初始化值
	ModelMatrix = mat4();//单位阵
	ViewMatrix=mat4();//单位阵
	ProjectionMatrix=mat4();//单位矩阵
	
};


/*生成模型变换矩阵*/
function formModelMatrix(){
	//根据xyzflag，构造当前这一次操作的缩放矩阵，再和之前的模型矩阵左乘，得到累乘的模型变换矩阵ModelMatrix
	if(xyzflag==0){
	var temp = mat4(
        [scalefactor,0.0 , 0.0, 0.0],
        [0.0 , 1.0 , 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]
    );
	ModelMatrix = mult(temp,ModelMatrix);
	}
	else if(xyzflag==1){
		var temp = mat4(
			[1.0 , 0.0 , 0.0, 0.0],
			[0.0 ,scalefactor , 0.0, 0.0],
			[0.0, 0.0, 1.0, 0.0],
			[0.0, 0.0, 0.0, 1.0]
		);
		ModelMatrix = mult(temp,ModelMatrix);
	}
	else if(xyzflag==2){
		var temp = mat4(
			[1.0 , 0.0 , 0.0, 0.0],
			[0.0 ,1.0 , 0.0, 0.0],
			[0.0, 0.0, scalefactor, 0.0],
			[0.0, 0.0, 0.0, 1.0]
		);
		ModelMatrix = mult(temp,ModelMatrix);
	}
}

/*将角度转换为弧度表示*/
function toRad(deg){
    return deg * Math.PI / 180;//JS三角函数需要输入的参数是弧度，将角度转换为弧度
};


/*生成观察变换矩阵/相机变换矩阵/视点变换矩阵*/
function formViewMatrix(){
var radius=2.0;//眼睛绕X和Y轴转动所依球的半径.模型坐标都先需要规约到（-1..1）之间
var eye=vec3(0.0,0.0,radius);
var up=vec3(0.0,1.0,0.0);
const at = vec3(0.0, 0.0, 0.0); //本例中没有交互修改的参数
	
	//计算出眼睛EYE的位置:绕X和Y轴旋转运动后的位置(phi绕X轴转动后累积角度，theta是绕Y轴后转动累积角度)	
	eye = vec3( radius * Math.sin(toRad(phi)) * Math.sin(toRad(theta)), 
                radius * Math.cos(toRad(phi)), 
                radius * Math.sin(toRad(phi)) * Math.cos(toRad(theta)));
	//计算出眼睛所在位置的向上的向量UP
	up = vec3(  2 * radius * Math.sin(toRad(phi-60)) * Math.sin(toRad(theta)), 
	2 * radius * Math.cos(toRad(phi-60)), 
	2 * radius * Math.sin(toRad(phi-60)) * Math.cos(toRad(theta)));
	
			  
	//用LOOKAT函数生成观察变换矩阵
	ViewMatrix = lookAt(eye, at, up); 
};



/* 生成规范化投影变换矩阵 	*/
function formProjectMatrix(){
const left = -1.0; 
const right = 1.0;
const bottom = -1.0;
const ytop = 1.0;
const near = 0.1;//这个值要小比较好
const far = 10;
var aspect;
    //设置aspect=canvas的纵横比
	aspect= canvas.height/canvas.height;
	//判定isOrth，true-正投影,false-透视投影
	if(isOrth){
		ProjectionMatrix = ortho(left, right, bottom, ytop, near, far);
	}
	else{
		ProjectionMatrix = perspective(fov, aspect, near, far);
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////








