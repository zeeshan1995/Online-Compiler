
#include <iostream>
#include <string>
#include <sstream>


int main()
{
	std::string a="1000" ,b="400";

	std::stringstream x;
	x << a <<' '<<b;
	int u,v;
	x>> u >> v;

	std::cout<<u-v<<"\n";
}
