
#include <sys/wait.h>
#include <iostream>
#include <unistd.h>
#include <fcntl.h>
#include <cstring>
#include <string>
#include <sstream>
#include <fstream>
#define STDIN 0
#define STDOUT 1

int main(int argc,char* argv[]){
    /*
	   execute ./main main input.txt
	*/
//	for(int i=0;i< argc;i++)
//		std::cout<<i<<" argument: "<<argv[i]<<"\n";;
	int p[2];
	
	int ff=open(argv[3],O_RDONLY);
	std::ifstream file(argv[3]);
	
	if ( pipe(p) == -1 ) {
		std::cout << "pipe failed" << std::endl;
		return 0;
	}
	
	pid_t pid= fork();
	if(!pid) {
		dup2(p[STDIN],0);
		close(p[STDOUT]);
		execl(argv[1], argv[2],NULL);
	} else {
		dup2(ff,0);
		std::string str;
		
		std::string file_contents;
		while (std::getline(file, str))
		{
			  file_contents += str;
			    file_contents.push_back('\n');
		} 

		write(p[STDOUT],file_contents.c_str(),file_contents.size());
	//	close(p[STDOUT]);
	}
		
	int status;
	waitpid(pid,&status,0);
	return 0;
}
