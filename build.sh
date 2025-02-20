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
    assign_html="awk '{if(NR==1){print \"<!--{assign var=$2 value=true}-->\"}print}' |"
fi

js_write_repl="sed -e \"s/document.write('<script type=\\\"text\/javascript\\\" src=\([^>]*\)><\/script>');/\/\/{include file=\1}\/\//g\""
js_merge=$assign_js' java -jar $libpath/smarty4j.jar --left //{ --right }// --charset utf-8'
# js_compress="uglifyjs -c -m | sed -e \"s/\\.super\([^A-Za-z0-9_\$]\)/['super']\1/g\" | sed -e \"s/\\.this\([^A-Za-z0-9_\$]\)/['this']\1/g\" | sed -e \"s/\\.extends\([^A-Za-z0-9_\$]\)/['extends']\1/g\" | sed -e \"s/\\.for\([^A-Za-z0-9_\$]\)/['for']\1/g\""
js_parse='node $libpath/tools/parse.js'
busi_js_compress=$js_parse' | uglifyjs -c -m'
js_compress='java -jar $libpath/webpacker.jar --charset utf-8'
css_merge=$assign_css' java -jar $libpath/smarty4j.jar --left /\*{ --right }\*/ --charset utf-8'
css_compile='lessc - --plugin=less-plugin-clean-css | python3 $libpath/less-funcs.py "$3"'
html_merge=$assign_html' java -jar $libpath/smarty4j.jar --left \<!--{ --right }--\> --charset utf-8'
html_compress="sed -e \"s/stylesheet\/less[^\\\"]*/stylesheet/g\" -e \"s/[[:space:]]/ /g\" -e \"s/^ *//g\" -e \"s/ *$//g\" -e \"/^ *$/d\" -e \"/<script>window.onload=/d\""

build_core() {
    if [ $2 ]
    then
        version='-'$2
    fi
    echo "process ecui.js"
    cat ecui.js | eval $js_write_repl | eval $js_merge | eval $js_parse | eval $js_compress > $1'/ecui'$version'.js'
    echo "process ecui.css"
    cat ecui.css | eval $css_compile > $1'/ecui'$version'.css'
    echo "//{assign var=css value=true}//
ecui.__ControlStyle__('
@import (less) 'ecui.css';
');
" | cat - ecui.js | eval $js_write_repl | eval $js_merge | sed -n -e "/ecui\.__ControlStyle__('/,/');/p" | sed -n -e 'H;${x;s/\\\n//g;p;}' | sed -e "s/ecui\.__ControlStyle__('//g" -e "s/');//g" | eval $css_compile >> $1'/ecui'$version'.css'
    echo "process options.js"
    cat options.js | eval $busi_js_compress > "$1/options.js"
    for file in `find static -name "*.js"`
    do
        echo "process file-$file"
        if [ ! -d "$1/${file%/*}"} ]
        then
            mkdir -p "$1/${file%/*}"
        fi
        cat $file | eval $js_write_repl | eval $js_merge | eval $busi_js_compress > "$1/$file"
    done
    for file in `find static -name "*.css"`
    do
        echo "process file-$file"
        if [ ! -d "$1/${file%/*}"} ]
        then
            mkdir -p "$1/${file%/*}"
        fi
        cat $file | eval $css_compile > "$1/$file"
    done
}

if [ $1 ]
then
    if [ $1 = 'ecui' ]
    then
        echo "build ecui-2.0.0"
        libpath="."
        if [ ! -d release ]
        then
            mkdir release
        fi
        cat ecui.js | eval $js_write_repl | eval $js_merge | eval $js_parse > release/ecui-2.0.0-all.js
        build_core 'release' '2.0.0'
        exit 0
    fi

    if [ $1 = 'ecui-svg-min' ]
    then
        if [ ! -d release ]
        then
            mkdir release
        fi
        echo "build ecui-svg-min"
        libpath="."
        cat svg.css | eval $css_compile > release/ecui-svg-min.css
        cat svg.js | eval $js_write_repl | eval $js_merge | eval $js_parse | eval $js_compress > release/ecui-svg-min.js
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
    base=${file%/*}
    if [ $base = "." ]
    then
        module=""
    else
        base=${base#*/}
        module=${base//./-}
        module=${module//_/-}
        module=${module//\//_}"_"
        while [ ! -f ${base}/_define_.js ]
        do
            if [ $base = ${base%/*} ]
            then
                echo "The _define_.js isn't found"
                exit -1;
            fi
            base=${base%/*}
            module=${module%_*}"-"${module##*_}
        done
    fi
    name=${file##*layer.}
    name=${name%.*}
    name=${name//./-}
    name=${name//_/-}
    layer_repl="-e \"s/ui=\\\"type:NS\\./ui=\\\"type:ecui.ns._${module}.ui./g\" -e \"s/<header/<div style=\\\"display:none\\\"/g\" -e \"s/<\/header/<\/div/g\" -e \"s/<container\([^>]*\)>/<div id=\\\"${module}${name}\\\" ui=\\\"type:ecui.esr.AppLayer\\\" style=\\\"display:none\\\"\1>"
    eval "sed -e \"s/<\!--/<<</g\" -e \"s/-->/>>>/g\" $layer_repl<\!--/g\" -e \"s/<\/container/--><\/div/g\" $file" >> .layers.html
done


find . -type f -name "layer.*.css" | awk '{input=$1;sub(/\/layer\./,"/");gsub(/(^\.\/|\.css$)/,"");gsub(/[\._]/,"-");gsub(/\//,"_");print "#"$1" {\n    @import (less) \""input"\";\n}"}' > .layers.css

echo "(function (NS) {" > .layers.js
for file in `find . -type f -name "layer.*.js"`
do
    base=${file%/*}
    if [ $base = "." ]
    then
        module="_"
    else
        base=${base#*/}
        module=${base//./-}
        module=${module//_/-}
        module="_"${module//\//_}"_"
        while [ ! -f ${base}/_define_.js ]
        do
            if [ $base = ${base%/*} ]
            then
                echo "The _define_.js isn't found"
                exit -1;
            fi
            base=${base%/*}
            module=${module%_}
            module=${module%_}"_"
        done
    fi
    if [ ! "$module" = "$last" ]
    then
        echo "    NS = ecui.ns['$module'] = ecui.ns['$module'] || {};
    NS.data = NS.data || {};
    NS.ui = NS.ui || {};
" >> .layers.js
        if [ -f ${base}/_layer_.js ]
        then
           cat ${base}/_layer_.js >> .layers.js 
        fi
    fi
    last=$module
    cat $file >> .layers.js
done
echo "}());" >> .layers.js

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

    text=`cat _define_.js | eval $busi_js_compress`
    ns=${module//./-}
    ns=${ns//_/-}
    ns=${ns//\//_}
    echo "(function(NS){$text}(ecui.ns['_$ns']));" | sed -e "s/ecui\.esr\.loadRoute(\"\([^.\"]*\)\")\([,;]\)*/\/\/{include file='route.\1.js'}\/\//g" -e "s/ecui\.esr\.loadRoute(\"\([^.\"]*\.\)*[^.\"]*\")\([,;]\)*/\\
&\\
/g" -e "s/ecui\.esr\.loadClass(\"\([^\"]*\)\")\([,;]\)*/\/\/{include file='class.\1.js'}\/\//g" | awk '{if(gsub(/(^ecui\.esr\.loadRoute\("|"\)([,;])*$)/,"")){match($1,/.*\./);value=substr($1,1,RLENGTH);tmp=value;gsub(/\./,"/",tmp);print "//{include file=\""tmp"route."substr($1,RLENGTH+1)".js\" assign=\"tpl\"}////{\$tpl|regex_replace:\"\.esr\.addRoute\\\((.)\":\".esr.addRoute(\$1"value"\"}//"}else{print}}' | eval $js_merge | eval $busi_js_compress > $outpath/${module}_define_.js

    text=`echo "$text" | awk '{gsub(/ecui\.esr\.loadRoute\("([^"]*)"\)([,;])?/,"&\n");print}' | grep "ecui.esr.loadRoute("`
    if [ -f "_define_.css" ]
    then
        prefix=".module-"${ns%_*}"{"
        cont=`cat _define_.css | eval $css_compile`
        echo "${prefix}${cont}}" | eval $css_compile >> "$outpath/${module}_define_.css"
    fi
    for file in `echo "$text" | sed -e "s/.*ecui\.esr\.loadRoute(\"\([^\"]*\)\").*/\1/"`
    do
        cont=`echo "$file" | awk '{if(match($1,/.*\./)){gsub(/\./,"/",$1);printf substr($1,1,RLENGTH)"route."substr($1,RLENGTH+1)}else{printf "route."$1}print ".css"'}`
        cont=`cat ${cont} | eval $css_compile`

        name=${module}${file}
        name=${name//./-}
        name=${name//_/-}
        name=${name//\//_}
        echo ".$name{$cont}" | eval $css_compile >> "$outpath/${module}_define_.css"
    done

    if [ -f "_define_.html" ]
    then
        cat _define_.html | sed -e "s/ui=\"type:NS\./ui=\"type:ecui.ns._$ns.ui./g" | eval $html_compress > "$outpath/${module}_define_.html"
    fi

    echo "$text" | awk '{if(gsub(/(.*ecui\.esr\.loadRoute\("|"\)([,;])*$)/,"")){match($1,/.*\./);value=$1;gsub(/\./,"/");print "//{include file=\""substr($1,1,RLENGTH)"route."substr($1,RLENGTH+1)".html\" assign=\"tpl\"}////{\$tpl|regex_replace:\"<!--\\s*target:\\s*([^>]+)\\s*-->\":\"<!-- target: "substr(value,1,RLENGTH)"\$1 -->\"}//"}else{print $0}}' | sed -e "s/.*ecui.esr.loadRoute(\"\([^\"]*\)\").*/\/\/{include file='route.\1.html'}\/\//g" | eval $js_merge | sed -e "s/ui=\"type:NS\./ui=\"type:ecui.ns._$ns.ui./g" | eval $html_compress >> "$outpath/${module}_define_.html"

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
                cat $file | eval $js_write_repl | eval $js_merge | eval $busi_js_compress > "$output/$file"
            fi
        else
            if [ $ext = "css" ]
            then
                cat $file | eval $css_merge | eval $css_compile > "$output/$file"
            else
                if [ $ext = "html" ]
                then
                    cat $file | eval $html_merge | sed -e "s/[[:space:]]*<\!--[[:space:]]*import:[[:space:]]*\([A-Za-z0-9._\/-]*\)[[:space:]]*-->/\<\!--\\
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
    build_core $output

    cd ..
    cd $1
    rm "common"

    cd $output
    cp index.html home.html
    tar -zcvf "../$1.tar.gz" *
else
    cd $output
    cp index.html home.html
    tar -zcvf "../output.tar.gz" *
fi
