#!/bin/bash
if [ $1 ]
then
	delay=$1
else
	delay=3
fi

while :
do
	if [ -f update.html ]
	then
		let secs=(`date +"%s"`-`stat -f "%m" update.html`)+1;
	else
		let secs=(`date +"%s"`)+1;
	fi

	if [ `find . -type f -name "*" -mtime -${secs}s | wc -l` -gt 1 ]
	then
		echo -e "/*<script>window.onload=function(){value=document.getElementsByTagName('TEXTAREA')[0].value;parent.postMessage({url:location.href.slice(7),text:value.slice(value.indexOf('\\\\n')+1).replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&')},'*');}</script><textarea>*/\n"`date +"%s"` > update.html
	fi
	sleep $delay
done
