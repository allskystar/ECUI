#! /bin/bash
function scandir() {
    for file in `ls $1`
    do
        if [ ! $1 = "." ]
        then
            file=$1"/"$file
        fi
        if [ -d $file ]
        then
            cd $file
            scandir .
            cd ..
        else
            if [ "${file##*.}" = "css" ]
            then
                echo $file"->"$file".html"
                rm $file".html"
                ln $file $file".html"
            fi
        fi
    done
}

scandir .
