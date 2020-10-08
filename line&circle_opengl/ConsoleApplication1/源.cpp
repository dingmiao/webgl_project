#include"pch.h" //vs17 
#include <stdlib.h>
#include <GL/glut.h>         /* glut.h includes gl.h and glu.h*/
#include <math.h>


int xm, ym, xmm, ymm;
int first = 0;
void putdot(int x0, int y0, int x, int y)

{
	glBegin(GL_POINTS);

	glVertex2f(x0 + x, y0 + y);

	glVertex2f(x0 + x, y0 - y);

	glVertex2f(x0 - x, y0 + y);

	glVertex2f(x0 - x, y0 - y);

	glVertex2f(x0 + y, y0 + x);

	glVertex2f(x0 + y, y0 - x);

	glVertex2f(x0 - y, y0 + x);

	glVertex2f(x0 - y, y0 - x);

	glEnd();

}

void CircleBres(int x0, int y0)

{//中点画圆算法
	int r = sqrt((xm - x0)*(xm - x0) + (ym - y0)*(ym - y0)); //计算半径
	int d = 1 - r;//初始增量
	int x = 0, y = r;//所画点距圆心值
	while (x <= y) {//截止条件 八分之一画完
		putdot(x0, y0, x, y);//八个点 对称画圆
		if (d < 0) {//中点在下
			d += 2 * x + 3;
			x++;
		}
		else {//中点在上
			d += 2 * (x - y) + 5;
			x++;
			y--;
		}
	}


}


void mouse(int btn, int state, int x, int y)
{
	if (btn == GLUT_LEFT_BUTTON && state == GLUT_DOWN)
	{
		xm = x;
		ym = (700 - y);
		xmm = x;
		ymm = (700 - y);
		glColor3f(1.0, 1.0, 1.0);
		first = 0;
	}
	if (btn == GLUT_LEFT_BUTTON && state == GLUT_UP)
	{
		/*先用XOR模式清除刚才的圆*/
		glLogicOp(GL_XOR);
		CircleBres(xmm, ymm);

		/*绘制确定的圆*/
		xmm = x;
		ymm = (700 - y);
		glColor3f(1.0, 1.0, 1.0);
		glLogicOp(GL_COPY);  //注意应该是画之前设置这个模式，不能放后面
		CircleBres(xmm, ymm);
		glFlush();
		first = 0;
	}
}

void move(int x, int y)
{
	/*非0，需要XOR清除刚才画的圆*/
	if (first == 1)
	{
		glLogicOp(GL_XOR);
		//glRectf(xm, ym, xmm, ymm);
		CircleBres(xmm, ymm);



		/*获取新的移动坐标，绘制圆，并计数器标志定为1*/
		xmm = x;
		ymm = (700 - y);
		glColor3f(1.0, 1.0, 1.0);
		CircleBres(xmm, ymm);
	}
	else
	{
		first = 1;
	}
	glFlush();

}

void display()
{
	glFlush();
}


void init()
{

	/* 设置背景色是黑色 */
	glClearColor(0, 0, 0, 0);
	glClear(GL_COLOR_BUFFER_BIT);

	/*开启逻辑运算功能！！！*/
	glEnable(GL_COLOR_LOGIC_OP);

	/*设置缓冲模式*/
	/*glutInitDisplayMode(GLUT_SINGLE | GLUT_RGB);*/


	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
	/*裁剪窗口是一个单位正方形，坐标原点位于正方形的左下角*/
	//glOrtho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0);
	gluOrtho2D(0, 700, 0, 700);
}

int main(int argc, char** argv)
{


	glutInit(&argc, argv);          // Initialize GLUT function callings
	glutInitWindowSize(700, 700);
	glutInitWindowPosition(0, 0);
	glutCreateWindow("circle");

	init();


	/*注册需要的两个鼠标回调函数*/

	glutMouseFunc(mouse);
	glutMotionFunc(move);
	glutDisplayFunc(display);
	glutMainLoop();

}