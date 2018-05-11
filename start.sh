#!/bin/bash
http-server -s &
./check.sh $* &
