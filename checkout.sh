#! /bin/bash
if [ ! $1 ]
then
    echo "checkout.sh <ProjectName> [git branch name]"
	exit -1
fi

if [ -d $1 ]
then
	echo $1" already existed"
	exit -2
fi

if [ -f smarty4j.jar ]
then
    flag=1
	cd ..
fi

git clone "http://192.168.155.56:8886/fe/"$1".git"
cd $1
if [ $2 ]
then
	git checkout -b $2 "origin/"$2
fi
cd ..

files=(common.css ecui.css common.js ecui.js ie-es5.js common css images src tools)
for file in ${files[@]}
do
	if [ ! -f $1"/"$file ] && [ ! -d $1"/"$file ]
	then
		ln -s "../lib-fe/"$file $1"/"$file
	fi
done

lib-fe/local.sh
if [ $flag ]
then
	cd lib-fe
fi
