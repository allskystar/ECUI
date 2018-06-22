if [ ! $1 ] && [ ! -f smarty4j.jar ]
then
    echo "build.sh [ProjectName]"
    exit -1
fi

css_proc='lessc - --plugin=less-plugin-clean-css | python $libpath/less-funcs.py "$2"'
tpl_proc='java -jar $libpath/smarty4j.jar --left //{ --right }// --charset utf-8'
compress_proc='java -jar $libpath/webpacker.jar --mode 1 --charset utf-8'
reg_script="-e \"s/document.write('<script type=\\\"text\/javascript\\\" src=\([^>]*\)><\/script>');/\/\/{include file=\1}\/\//g\""
reg_comment="-e \"s/[[:space:]]/ /g\" -e \"s/^ *//g\" -e \"s/ *$//g\" -e \"/^ *$/d\" -e \"/<\!-- *$/{N;s/\\n//;}\" -e \"s/<\!-- *-->//g\" -e \"/^ *$/d\" -e \"/<script>window.onload=/d\""

if [ $1 ]
then
    if [ $1 = 'ecui' ]
    then
        if [ ! -d release ]
        then
            mkdir release
        fi
        echo "build ecui-2.0.0"
        path=""
        cat ecui.css | eval $css_proc > release/ecui-2.0.0.css
        eval "sed $reg_script ecui.js" | eval $tpl_proc | eval $compress_proc > release/ecui-2.0.0.js
        exit 0
    fi

    if [ -f smarty4j.jar ]
    then
        flag=1
        cd ..
    fi

    if [ ! -d $1 ]
    then
        echo "$1 doesn't exist"
        exit -2
    fi

    if [ ! -d "$1/common" ]
    then
        ln -s ../lib-fe/common "$1/common"
    fi

    cd $1
    output="../output-$1"
    lib="../lib-fe"
else
    flag=1
    output="../output"
    lib="."
fi
libpath="$lib"

rm -rf $output
mkdir $output

find . -type f -name "layer.*" | sed -e "s/\(\.\/\)\(.*\)/\<\!--{include file=\"\2\"}--\>/" > .layers

for file in `ls`
do
    if [ -d "$file" ]
    then
        cd $file
        libpath="../$lib"
    	if [ -f "$file.js" ]
    	then
            echo "process module-$file"
	        if [ ! -d "../$output/$file" ]
	        then
	            mkdir "../$output/$file"
	        fi
	        sed -e "s/\([^A-Za-z0-9_]*\)ecui.esr.loadRoute('\([^']*\)');/\1\/\/{include file='route.\2.js'}\/\//g" -e "s/\([^A-Za-z0-9_]*\)ecui.esr.loadClass('\([^']*\)');/\1\/\/{include file='class.\2.js'}\/\//g" "$file.js" | eval $tpl_proc | eval $compress_proc > "../$output/$file/$file.js"
            if [ -f "$file.css" ]
            then
                value="/*{include file=\"$file.css\"}*/\
"
            else
                value=""
            fi
            echo $value | cat /dev/stdin "$file.js" | sed -e "s/\/\/.*//g" -e "s/\([^A-Za-z0-9_]\)\(ecui.esr.loadRoute('\([^']*\)');\)/\1\\
\2\\
/g" | grep -E "((^|[^A-Za-z0-9_])ecui.esr.loadRoute\('[^']*'\)|/\*{include file=\"[^\"]*\"}\*/)" | sed -e "s/\/\*\({include file=\"[^\"]*\"}\)\*\//\/\/\1\/\//g" -e "/ecui.esr.loadRoute(/{
h
s/ecui.esr.loadRoute('\([^']*\)');/\1/
s/\./-/g
s/.*/.&{/
G
s/\([^A-Za-z0-9_]\)ecui.esr.loadRoute('\([^']*\)');/\1\/\/{include file=\"route.\2.css\"}\/\/\\
}/
}" | eval $tpl_proc | eval $css_proc > "../$output/$file/$file.css"
	        sed -e "s/\/\/.*//g" -e "s/\([^A-Za-z0-9_]\)\(ecui.esr.loadRoute('\([^']*\)');\)/\1\\
\2\\
/g" "$file.js" | grep "ecui.esr.loadRoute" | sed -e "s/\([^A-Za-z0-9_]*\)ecui.esr.loadRoute('\([^']*\)');/\1\/\/{include file='route.\2.html'}\/\//g" | eval $tpl_proc | eval "sed $reg_comment" > "../$output/$file/$file.html"
	    else
	    	if [ ! -f ".buildignore" ]
            then
                if [ ! -d "../$output/$file/" ]
                then
                    mkdir "../$output/$file/"
                fi
                echo "copy $file/"
	    		cp -R * "../$output/$file/"
	    	fi
	    fi
        libpath="$lib"
        cd ..
    else
        if [ ! $1 ]
        then
            if [ "${file##*.}" = "jar" ] || [ "${file##*.}" = "sh" ] || [ "${file##*.}" = "py" ] || [ $file = "README.md" ]
            then
                continue
            fi
        fi
        echo "process file-$file"
        if [ "${file##*.}" = "js" ]
        then
            name="${file%.*}"
            if [ "${name##*.}" = "min" ]
            then
                cp "$file" "$output/"
            else
                eval "sed $reg_script $file" | eval $tpl_proc | eval $compress_proc > "$output/$file"
            fi
        else
            if [ "${file##*.}" = "css" ]
            then
                cat "$file" | eval $css_proc > "$output/$file"
            else
                if [ "${file##*.}" = "html" ]
                then
                    sed -e "s/<body.*data-ecui=.*app=true.*/&<!--{include file=\".app-container.html\"}-->/g" "$file" | java -jar "$libpath/smarty4j.jar" --left \<\!--{ --right }--\> --charset utf-8 | eval "sed -e \"s/stylesheet\/less[^\\\"]*/stylesheet/g\" -e \"s/<header/<div style=\\\"display:none\\\"/g\" -e \"s/<\/header/<\/div/g\" -e \"s/<container/<div ui=\\\"type:ecui.esr.AppLayer\\\" style=\\\"display:none\\\"/g\" -e \"s/<\/container/<\/div/g\" $reg_comment" > "$output/$file"
                else
                    cp "$file" "$output/"
                fi
            fi
        fi
    fi
done

if [ $1 ]
then
    cd $lib

    if [ ! -d "$output/images/" ]
    then
        mkdir "$output/images/"
    fi
    echo "copy lib-fe/images/"
    cp -R images/* "$output/images/"

    for file in `ls`
    do
        if [ -f $file ]
        then
            path=""
            if [ "${file##*.}" = "js" ]
            then
                echo "process file-$file"
                cat $file | eval "sed $reg_script" | eval $tpl_proc | eval $compress_proc > "$output/$file"
            else
                if [ "${file##*.}" = "css" ]
                then
                    echo "process file-$file"
                    cat $file | eval $css_proc > "$output/$file"
                fi
            fi
        fi
    done
    cd ..

    cd $1
    rm "common"

    cd $output
    tar -zcvf "../$1.tar.gz" *
else
    cd $output
    tar -zcvf "../output.tar.gz" *
fi

cd ..
if [ $flag ]
then
    cd lib-fe
fi
