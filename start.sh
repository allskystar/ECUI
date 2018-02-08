#!/bin/bash
if [ $2 ]
then
	http-server -s -p $2 &
else
	http-server -s &
fi
./check.sh $1 &
