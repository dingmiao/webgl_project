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

{//�е㻭Բ�㷨
	int r = sqrt((xm - x0)*(xm - x0) + (ym - y0)*(ym - y0)); //����뾶
	int d = 1 - r;//��ʼ����
	int x = 0, y = r;//�������Բ��ֵ
	while (x <= y) {//��ֹ���� �˷�֮һ����
		putdot(x0, y0, x, y);//�˸��� �Գƻ�Բ
		if (d < 0) {//�е�����
			d += 2 * x + 3;
			x++;
		}
		else {//�е�����
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
		/*����XORģʽ����ղŵ�Բ*/
		glLogicOp(GL_XOR);
		CircleBres(xmm, ymm);

		/*����ȷ����Բ*/
		xmm = x;
		ymm = (700 - y);
		glColor3f(1.0, 1.0, 1.0);
		glLogicOp(GL_COPY);  //ע��Ӧ���ǻ�֮ǰ�������ģʽ�����ܷź���
		CircleBres(xmm, ymm);
		glFlush();
		first = 0;
	}
}

void move(int x, int y)
{
	/*��0����ҪXOR����ղŻ���Բ*/
	if (first == 1)
	{
		glLogicOp(GL_XOR);
		//glRectf(xm, ym, xmm, ymm);
		CircleBres(xmm, ymm);



		/*��ȡ�µ��ƶ����꣬����Բ������������־��Ϊ1*/
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

	/* ���ñ���ɫ�Ǻ�ɫ */
	glClearColor(0, 0, 0, 0);
	glClear(GL_COLOR_BUFFER_BIT);

	/*�����߼����㹦�ܣ�����*/
	glEnable(GL_COLOR_LOGIC_OP);

	/*���û���ģʽ*/
	/*glutInitDisplayMode(GLUT_SINGLE | GLUT_RGB);*/


	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
	/*�ü�������һ����λ�����Σ�����ԭ��λ�������ε����½�*/
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


	/*ע����Ҫ���������ص�����*/

	glutMouseFunc(mouse);
	glutMotionFunc(move);
	glutDisplayFunc(display);
	glutMainLoop();

}