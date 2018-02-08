#! /bin/bash
function scandir() {
    for file in `ls`
    do
        if [ -d $file ]
        then
            cd $file
            scandir $1
            cd ..
        else
            if [ "${file##*.}" = "css" ]
            then
                if [ $1 = 'clean' ]
                then
                    if [ -f $file".html" ]
                    then
                        echo "remove "$file".html"
                        rm $file".html"
                    fi
                else
                    if [ ! -f $file".html" ]
                    then
                        echo $file"->"$file".html"
                        ln $file $file".html"
                    fi
                fi
            fi
        fi
    done
}

if [ $1 ]
then
    scandir $1
else
    scandir build
fi
