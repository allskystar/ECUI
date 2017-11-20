if [ ! $1 ]
then
    echo "build.sh [ProjectName]"
    exit -1
fi

if [ $1 = 'ecui' ]
then
    echo "build ecui-2.0.0"
    lessc --plugin=less-plugin-clean-css ecui.css > ecui-2.0.0.css
    sed -e "s/ *document.write('<script type=\"text\/javascript\" src=\([^>]*\)><\/script>');/\/\/{include file=\1}\/\//g" ecui.js | java -jar smarty4j.jar --left //{ --right }// --charset utf-8 | java -jar webpacker.jar --mode 1 --charset utf-8 -o "ecui-2.0.0.js"
    exit 0
fi

if [ -f smarty4j.jar ]
then
    flag=1
    cd ..
fi
ln -s ../lib-fe/common $1"/common"

output="output-"$1
if [ ! -d $output ]
then
    mkdir $output
fi

if [ ! -d $1 ]
then
    echo $1" doesn't exist"
    exit -2
fi

for file in `ls $1`
do
    if [ -d $1"/"$file ]
    then
    	if [ -f $1"/"$file"/"$file".js" ]
    	then
            echo "process module-"$file
	        if [ ! -d $output"/"$file ]
	        then
	            mkdir $output"/"$file
	        fi
	        cd $1"/"$file
	        sed -e "s/ecui.esr.loadRoute('/\/\/{include file='route./g" -e "s/ecui.esr.loadClass('/\/\/{include file='class./g" -e "s/');/.js'}\/\//g" $file".js" | java -jar ../../lib-fe/smarty4j.jar --left //{ --right }// --charset utf-8 | java -jar ../../lib-fe/webpacker.jar --mode 1 --charset utf-8 -o "../../"$output"/"$file"/"$file".js"
	        sed -e "s/ecui.esr.loadRoute('/\/\/{include file='route./g" -e "s/ecui.esr.loadClass(*//g" -e "s/');/.css'}\/\//g" $file".js" | java -jar ../../lib-fe/smarty4j.jar --left //{ --right }// --charset utf-8 | lessc - --plugin=less-plugin-clean-css > "../../"$output"/"$file"/"$file".css"
	        sed -e "s/ecui.esr.loadRoute('/\/\/{include file='route./g" -e "s/ecui.esr.loadClass(*//g" -e "s/');/.html'}\/\//g" $file".js" | java -jar ../../lib-fe/smarty4j.jar --left //{ --right }// --charset utf-8 | sed -e "/<\!--$/{N;s/\n/ /;}" -e "s/  / /g" -e "s/<\!-- *\!-->//g" -e "s/^[ ]*//g" -e "s/[ ]*$//g" -e "/^$/d" -e "/<script>window.onload=/d" > "../../"$output"/"$file"/"$file".html"
	        cd ../..
	    else
	    	if [ ! -f $1"/"$file"/.buildignore" ]
            then
                if [ ! -d $output"/"$file"/" ]
                then
                    mkdir $output"/"$file"/"
                fi
	    		cp -R $1"/"$file"/"* $output"/"$file"/"
	    	fi
	    fi
    else
        echo "process file-"$file
        if [ "${file##*.}" = "js" ]
        then
            cd $1
            sed -e "/ecui.esr.loadModule/d" -e "s/ *document.write('<script type=\"text\/javascript\" src=\([^>]*\)><\/script>');/\/\/{include file=\1}\/\//g" $file | java -jar ../lib-fe/smarty4j.jar --left //{ --right }// --charset utf-8 | java -jar ../lib-fe/webpacker.jar --mode 1 --charset utf-8 -o "../"$output"/"$file
            cd ..
        else
            if [ "${file##*.}" = "css" ]
            then
                lessc --plugin=less-plugin-clean-css $1"/"$file > $output"/"$file
            else
                if [ "${file##*.}" = "html" ]
                then
                    sed -e "s/stylesheet\/less/stylesheet/g" -e "/<\!--$/{N;s/\n/ /;}" -e "s/  / /g" -e "s/<\!-- *\!-->//g" -e "s/^[ ]*//g" -e "s/[ ]*$//g" -e "/^$/d" -e "/<script>window.onload=/d" $1"/"$file > $output"/"$file
                else
                    cp $1"/"$file $output"/"
                fi
            fi
        fi
    fi
done

cd lib-fe
lessc --plugin=less-plugin-clean-css common.css > "../"$output"/common.css"
lessc --plugin=less-plugin-clean-css ecui.css > "../"$output"/ecui.css"
sed -e "s/ *document.write('<script type=\"text\/javascript\" src=\([^>]*\)><\/script>');/\/\/{include file=\1}\/\//g" common.js | java -jar smarty4j.jar --left //{ --right }// --charset utf-8 | java -jar webpacker.jar --mode 1 --charset utf-8 -o "../"$output"/common.js"
sed -e "s/ *document.write('<script type=\"text\/javascript\" src=\([^>]*\)><\/script>');/\/\/{include file=\1}\/\//g" ecui.js | java -jar smarty4j.jar --left //{ --right }// --charset utf-8 | java -jar webpacker.jar --mode 1 --charset utf-8 -o "../"$output"/ecui.js"
java -jar webpacker.jar ie-es5.js --mode 1 --charset utf-8 -o "../"$output"/ie-es5.js"
if [ ! -d "../"$output"/images/" ]
then
    mkdir "../"$output"/images/"
fi
cp -R images/* "../"$output"/images/"
cd ..

cd $output
tar -zcvf "../"$1".tar.gz" *
cd ..

rm -rf $output

rm $1"/common"
if [ $flag ]
then
    cd lib-fe
fi
