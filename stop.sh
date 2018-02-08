#!/bin/bash
ps -all | grep http-server | grep node | awk '{ print $2 }' | xargs kill -9
ps -all | grep check.sh | grep bash | awk '{ print $2 }' | xargs kill -9
