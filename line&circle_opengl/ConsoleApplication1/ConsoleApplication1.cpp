#include "pch.h"
#include <stdlib.h>
#include <GL/glut.h>         /* glut.h includes gl.h and glu.h*/
#include <math.h>


int xm, ym, xmm, ymm;
int first = 0;

void draw_pixel(int ix, int iy)
{
	glBegin(GL_POINTS);
	glVertex2i(ix, iy);
	glEnd();
}
void swap(int& a, int& b) {
	int c = a;
	a = b;
	b = c;
}

void bres(int x1, int y1, int x2, int y2)
{//传入 起始点与中点  画线
	
	if (x1 > x2) {//保证x1始终取小值 从左到右判断
		swap(x1, x2);//swap 交换两个函数的值
		swap(y1, y2);
	}

	int a, b, deta1, deta2, d, x, y;
	a = y1 - y2;	
	b = x2 - x1;	//直线方程中的a，b
	
	//if (-a <= b) {//斜率绝对值小于1
		x = x1;
		y = y1;
		if (a <= 0) {//斜率大于0 向上增长
			d = 2 * a + b;  //初始增量
			deta1 = 2 * a;	//d大于0时候的增量
			deta2 = 2 * (a + b);//小于0时候的增量
			while (x <= x2) {
				draw_pixel(x, y);
				if (d <= 0) {
					++x; ++y;
					d += deta2;
				}
				else {
					++x;
					d += deta1;
				}
			}
		}
		else {//斜率小于0，向下增长
			d = 2 * a - b;
			deta1 = 2 * a;
			deta2 = 2 * (a - b);	//向下画线时候变量符号改变
			while (x <= x2) {
				draw_pixel(x, y);
				if (d <= 0) {
					x++;
					d += deta1;
				}
				else {
					++x; --y; //y向下增长
					d += deta2;
				}
			}
		}
	//}
	/*else { //绝对值大于1
		if (y1 > y2) {//保证x1始终取小值 从左到右判断
			swap(x1, x2);
			swap(y1, y2);
		}
		x = x1; y = y1;
		a = y1 - y2;
		b = x2 - x1;
		if (b >= 0) {//斜率大于0 向上增长
			d = 2 * b + a;  //初始增量
			deta1 = 2 * b;	//d大于0时候的增量
			deta2 = 2 * (a + b);//小于0时候的增量
			while (y1 <= y2) {
				draw_pixel(x, y);
				if (d <= 0) {
					++x; ++y;
					d += deta2;
				}
				else {
					++y;
					d += deta1;
				}
			}
		}
		else {//斜率小于0，向下增长
			d = 2 * b - a;
			deta1 = 2 * b;
			deta2 = 2 * (b - a);	
			while (y1 <= y2) {
				draw_pixel(x, y);
				if (d <= 0) {
					y++;
					d += deta1;
				}
				else {
					++x; --y;
					d += deta2;
				}
			}
		}
	}*/
	
}


void mouse(int btn, int state, int x, int y)
{
	if (btn == GLUT_LEFT_BUTTON && state == GLUT_DOWN && first==0)
	{
		xm = x;
		ym = (700 - y);
		glColor3f(1.0, 1.0, 1.0);
		first = 1;
	}
	else if (btn == GLUT_LEFT_BUTTON && state == GLUT_DOWN && first==1 )
	{
		
		xmm = x;
		ymm = (700 - y);
		glColor3f(1.0, 1.0, 1.0);
		bres(xm, ym, xmm, ymm);
		glFlush();
		glLogicOp(GL_COPY);
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
		bres(xm, ym, xmm, ymm);
		glFlush();

	}

	/*获取新的移动坐标，绘制圆，并计数器标志定为1*/
	xmm = x;
	ymm = (700 - y);
	glColor3f(1.0, 1.0, 1.0);
	bres(xm, ym, xmm, ymm);
	glFlush();
	first = 1;
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
	glutCreateWindow("Line");

	init();
	glutDisplayFunc(display);

	/*注册需要的两个鼠标回调函数*/
	
	glutMouseFunc(mouse);
	//glutMotionFunc(move);
	glutMainLoop();

}
