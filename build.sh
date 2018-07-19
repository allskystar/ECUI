#!/bin/bash
if [ ! $1 ] && [ ! -f smarty4j.jar ]
then
    echo "build.sh [ProjectName]"
    exit -1
fi

if [ $2 ]
then
    assign_js="awk '{if(NR==1){print \"//{assign var=$2 value=true}//\"}print}' |"
    assign_css="awk '{if(NR==1){print \"/*{assign var=$2 value=true}*/\"}print}' |"
fi

js_write_repl="sed -e \"s/document.write('<script type=\\\"text\/javascript\\\" src=\([^>]*\)><\/script>');/\/\/{include file=\1}\/\//g\""
js_merge=$assign_js' java -jar $libpath/smarty4j.jar --left //{ --right }// --charset utf-8'
js_compress='java -jar $libpath/webpacker.jar --mode 1 --charset utf-8'
css_merge=$assign_css' java -jar $libpath/smarty4j.jar --left /\*{ --right }\*/ --charset utf-8'
css_compile='lessc - --plugin=less-plugin-clean-css | python $libpath/less-funcs.py "$3"'
html_compress="sed -e \"s/stylesheet\/less[^\\\"]*/stylesheet/g\" -e \"s/[[:space:]]/ /g\" -e \"s/^ *//g\" -e \"s/ *$//g\" -e \"/^ *$/d\" -e \"/<script>window.onload=/d\""

if [ $1 ]
then
    if [ $1 = 'ecui' ]
    then
        if [ ! -d release ]
        then
            mkdir release
        fi
        echo "build ecui-2.0.0"
        libpath="."
        cat ecui.css | eval $css_compile > release/ecui-2.0.0.css
        cat ecui.js | eval $js_write_repl | eval $js_merge | eval $js_compress > release/ecui-2.0.0.js
        exit 0
    fi

    if [ -f smarty4j.jar ]
    then
        cd ..
    fi

    if [ ! -d $1 ]
    then
        echo "$1 doesn't exist"
        exit -2
    fi

    if [ ! -d "$1/common" ]
    then
        ln -s ../ECUI/common "$1/common"
    fi

    cd $1
    output="../output-$1"
    lib="../ECUI"
else
    output="../output"
    lib="."
fi
libpath="$lib"

rm -rf $output
mkdir $output

echo "" > .layers.html
for file in `find . -type f -name "layer.*.html"`
do
    module=${file%/*}"/"
    module=${module#*/}
    module=${module//./-}
    module=${module//_/-}
    module=${module//\//_}
    name=${file##*layer.}
    name=${name%.*}
    name=${name//./-}
    name=${name//_/-}
    n=`cat $file | grep "\-\->" | wc -l`
    layer_repl="-e \"s/ui=\\\"type:NS\./ui=\\\"type:ecui.ns._${module}.ui./g\" -e \"s/<header/<div style=\\\"display:none\\\"/g\" -e \"s/<\/header/<\/div/g\" -e \"s/<container\([^>]*\)>/<div id=\\\"${module}${name}\\\" ui=\\\"type:ecui.esr.AppLayer\\\" style=\\\"display:none\\\"\1>"
    if [ $n = 0 ]
    then
        eval "sed $layer_repl/g\" -e \"s/<\/container/<\/div/g\" $file" >> .layers.html
    else
        eval "sed -e \"s/<\!--/<<</g\" -e \"s/-->/>>>/g\" $layer_repl<\!--/g\" -e \"s/<\/container/--><\/div/g\" $file" >> .layers.html
    fi
done

find . -type f -name "layer.*.css" | awk '{input=$1;sub(/\/layer\./,"/");gsub(/(^\.\/|\.css$)/,"");gsub(/[\._]/,"-");gsub(/\//,"_");print "#"$1" {\n    @import (less) \""input"\";\n}"}' > .layers.css

echo -e "(function (NS) {" > .layers.js
for file in `find . -type f -name "layer.*.js"`
do
    name=${file%/*}"/"
    name=${name#*/}
    name=${name//./-}
    name=${name//_/-}
    name="_"${name//\//_}
    if [ ! "$name" = "$last" ]
    then
        echo -e "    NS = ecui.ns['$name'] = ecui.ns['$name'] || {};\n    NS.data = NS.data || {};" >> .layers.js
    fi
    last=name
    cat $file >> .layers.js
done
echo -e "}());" >> .layers.js

for module in `find . -type f -name "_define_.js"`
do
    module=${module%/*}"/"
    module=${module#*/}
    libpath="`echo $module | sed -e "s/[^/]*\//..\//g"`$lib"
    outpath="`echo $module | sed -e "s/[^/]*\//..\//g"`$output"

    if [ $module ]
    then
        echo "process module-$module"
        cd $module
    else
        echo "process module-[ROOT]"
    fi

    if [ ! -d "$outpath/$module" ] && [ $module ]
    then
        mkdir -p "$outpath/$module"
    fi

    text=`cat _define_.js | eval $js_compress`
    ns=${module//./-}
    ns=${ns//_/-}
    ns=${ns//\//_}
    echo "(function(NS){$text}(ecui.ns['_$ns']));" | sed -e "s/ecui\.esr\.loadRoute(\"\([^.\"]*\)\")\(;\)*/\/\/{include file='route.\1.js'}\/\//g" -e "s/ecui\.esr\.loadRoute(\"\([^.\"]*\.\)*[^.\"]*\")\(;\)*/\\
&\\
/g" -e "s/ecui\.esr\.loadClass(\"\([^\"]*\)\")\(;\)*/\/\/{include file='class.\1.js'}\/\//g" | awk '{if(gsub(/(^ecui\.esr\.loadRoute\("|"\)(;)*$)/,"")){match($1,/.*\./);value=substr($1,1,RLENGTH);tmp=value;gsub(/\./,"/",tmp);print "//{include file=\""tmp"route."substr($1,RLENGTH+1)".js\" assign=\"tpl\"}////{\$tpl|regex_replace:\"ecui\.esr\.addRoute\\\((.)\":\"ecui.esr.addRoute(\$1"value"\"}//"}else{print}}' | eval $js_merge | eval $js_compress > $outpath/${module}_define_.js

    reg=${module//\//\\/}
    if [ -f "_define_.css" ]
    then
        file="//{include file=\"_define_.css\"}//"
    else
        file=""
    fi

    text=`echo "$text" | awk '{gsub(/ecui\.esr\.loadRoute\("([^"]*)"\)(;)?/,"&\n");print}' | grep "ecui.esr.loadRoute("`
    echo -e "$file\n$text" | sed -e "s/.*ecui\.esr\.loadRoute(\"\([^\"]*\)\").*/$reg\1 \1/" | awk '{if(substr($1,1,2)!="//" && $2){gsub(/[\._]/,"-",$1);gsub(/\//,"_",$1);printf "."$1"{//{include file=\"";if(match($2,/.*\./)){gsub(/\./,"/",$2);printf substr($2,1,RLENGTH)"route."substr($2,RLENGTH+1)}else{printf "route."$2}print ".css\"}//}"}else{print}}' | eval $js_merge | eval $css_compile > "$outpath/${module}_define_.css"
    echo "$text" | awk '{if(gsub(/(.*ecui\.esr\.loadRoute\("|"\)(;)*$)/,"")){match($1,/.*\./);value=$1;gsub(/\./,"/");print "//{include file=\""substr($1,1,RLENGTH)"route."substr($1,RLENGTH+1)".html\" assign=\"tpl\"}////{\$tpl|regex_replace:\"<!--\\s*target:\\s*([^>]+)\\s*-->\":\"<!-- target: "substr(value,1,RLENGTH)"\$1 -->\"}//"}else{print "//{include file=\""$1".html\"}//"}}' | sed -e "s/.*ecui.esr.loadRoute(\"\([^\"]*\)\").*/\/\/{include file='route.\1.html'}\/\//g" | eval $js_merge | eval "sed -e \"s/ui=\\\"type:NS\./ui=\\\"type:ecui.ns._$ns.ui./g\"" | eval $html_compress > "$outpath/${module}_define_.html"

    if [ $module ]
    then
        cd `echo $module | sed -e "s/[^/]*\//..\//g"`
    fi
    libpath="$lib"
done

for file in `ls`
do
    if [ -d "$file" ]
    then
        cd $file
    	if [ -f ".buildcopy" ]
        then
            if [ ! -d "../$output/$file/" ]
            then
                mkdir "../$output/$file/"
            fi
            echo "copy $file/"
    		cp -R * "../$output/$file/"
    	fi
        cd ..
    else
        ext=${file##*.}
        type=${file%%.*}
        if [ $ext = "jar" ] || [ $ext = "sh" ] || [ $ext = "py" ] || [ $file = "README.md" ] || [ $type = "route" ] || [ $type = "layer" ] || [ $type = "_define_" ]
        then
            continue
        fi
        echo "process file-$file"
        if [ $ext = "js" ]
        then
            name="${file%.*}"
            if [ "${name##*.}" = "min" ]
            then
                cp "$file" "$output/"
            else
                cat $file | eval $js_write_repl | eval $js_merge | eval $js_compress > "$output/$file"
            fi
        else
            if [ $ext = "css" ]
            then
                cat $file | eval $css_merge | eval $css_compile > "$output/$file"
            else
                if [ $ext = "html" ]
                then
                    cat $file | sed -e "s/[[:space:]]*<\!--[[:space:]]*import:[[:space:]]*\([A-Za-z0-9._\/-]*\)[[:space:]]*-->/\<\!--\\
\<\!--{include file='\1' assign=\"tpl\"}-->\\
\<\!--{\$tpl|replace:\"\<\!--\":\"\<\<\<\"|replace:\"--\>\":\"\>\>\>\"}-->\\
--\>/g" -e "s/\<body.*data-ecui=.*app=true.*/&\\
\<\!--{include file='.app-container.html'}-->/g" | java -jar $libpath/smarty4j.jar --left \<\!--{ --right }--\> --charset utf-8 | eval $html_compress > "$output/$file"
                else
                    cp $file $output/
                fi
            fi
        fi
    fi
done

if [ ! -d "$output/images/" ]
then
    mkdir "$output/images/"
fi
echo "copy ECUI/images/"
cp -R $lib/images/* "$output/images/"

if [ $1 ]
then
    cd $lib

    for file in `ls`
    do
        if [ -f $file ]
        then
            if [ ! $file = "ecui.js" ] && [ ! $file = "ecui.css" ] && [ ! $file = "common.js" ] && [ ! $file = "common.css" ] && [ ! $file = "ie-es5.js" ] && [ ! $file = "options.js" ]
            then
                continue
            fi

            path=""
            if [ "${file##*.}" = "js" ]
            then
                echo "process file-$file"
                cat $file | eval $js_write_repl | eval $js_merge | eval $js_compress > "$output/$file"
            else
                if [ "${file##*.}" = "css" ]
                then
                    echo "process file-$file"
                    cat $file | eval $css_compile > "$output/$file"
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
