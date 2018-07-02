#!/bin/bash
function usage() {
cat <<EOF

ECUI 项目创建工具

    -i    初始化项目，创建index，如果同时使用-r会把新创建的路由添加到index中
    -r    添加一个路由
          路由添加格式：模块.路由，多路由添加用逗号（英文逗号--','）隔开
          如：-r assess.list,assess.nav,purchase.detail
    -a    创建路由时候在index中添加默认的路由链接，建议在正式项目中不要使用该选项
    -h    帮助

使用示例：
    cd到ecui.sh文件所在目录

    初始化项目并且创建路由assess.list和purchase.detail，并且在index中添加路由的链接
    ./ecui.sh -i -r assess.list,purchase.detail

    创建新路由assess.nav和purchase.list，但不在index中添加链接，多用于正式项目
    ./ecui.sh -r assess.nav,purchase.list

    创建新路由assess.nav和purchase.list，并且在index中添加链接
    ./ecui.sh -a -r assess.nav,purchase.list

EOF
}

function create_index () {
    if [ -f index.html ]; then
        echo 'Error：项目已经进行过初始化'
        exit -1
    fi
    touch index.html index.css index.js
    cat>index.html<<EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <meta charset="UTF-8">
  <title>ecui-h5</title>
  <link rel="stylesheet/less" type="text/css" href="ecui.css" />
  <link rel="stylesheet/less" type="text/css" href="common.css" />
  <link rel="stylesheet/less" type="text/css" href="index.css" />
  <script type="text/javascript" src="options.js"></script>
  <script type="text/javascript" src="ecui.js"></script>
  <script type="text/javascript" src="common.js"></script>
  <script type="text/javascript" src="index.js"></script>
</head>
<body data-ecui="load:esr" id="main">
<!--
  <<< target:content >>>
  <div class="content" id="content">
  	<div class="wrapper" id="container">
  	</div>
  </div>
  <<< target:homepage >>>
  <div class="index-container">
    <div class="index-text">欢迎使用ECUI</div>
    <div>当前路由：<div>
  </div>
-->
<body>
<html>
EOF

    cat > index.js <<EOF
(function () {
ecui.esr.onready = function () {
    etpl.config({
        commandOpen: '<<<',
        commandClose: '>>>'
    });
    for (var el = document.getElementById('main').firstChild; el; el = el.nextSibling) {
        if (el.nodeType === 8) {
            etpl.compile(el.textContent || el.nodeValue);
        }
    }
    etpl.config({
        commandOpen: '<!--',
        commandClose: '-->'
    });
    return {
        model: [''],
        main: 'main',
        view: 'content',
        onbeforerequest: function () {
        },
        onbeforerender: function (context) {
        },
        onafterrender: function () {
        }
    };
};
ecui.esr.addRoute('index', {
    model: [''],
    main: 'container',
    view: 'homepage',
    onbeforerequest: function () {
    },
    onbeforerender: function (context) {
    },
    onafterrender: function () {
    }
});
}());
EOF
    cat > index.css <<EOF
@import (less) "common/css/UICONST.css";
/*基于750的设计稿，尺寸使用rem
@function px2rem($px, $base-font-size: 75px) {
  @return ($px / $base-font-size) * 1rem;
}*/
/*字体用px根据dpr适配
@mixin font-dpr($font-size){
  $font:$font-size/2;
  font-size: $font;
  [data-dpr="2"] & { font-size: $font+2px;}
  [data-dpr="3"] & { font-size: $font+4px;}
}*/
html{
    font-size:41px !important;
}
.content{
    display: flex;
    flex-direction: column;
    width:100%;
    height:100%;
    background: #f8f8f8;
}
EOF
    cat > README.md <<EOF
## 项目名

### 整个ERP系统项目干系人
- 项目负责人
- 产品
- 测试
- UI
- 后端
- 客户端
- 测试开发

### 项目原型图
-
-
## 开始开发

### 下载源码
 >git clone

### 通过浏览器访问

### 登录账号和验证码
登录号码
验证码获取地址为：[]()

### API

## 开发规范

### 合理命名
  变量和函数命名要内容功能意义对应，样式命名要符合我们的约定规范；

### 合理的目录

## 代码管理

### 提交代码

### 分支管理

## 发布上线
-
### 配置ngnix服务器
- 通过ngnix配置对应的规则控制不同项目静态文件的请求。
EOF
}

function create_router () {
    local i=0
    local router_html=''
    while [[ ${router_array[i]} ]]; do
        if [[ ${router_array[i]} != *.* ]];then
            echo 'Error：路由格式：模块.路由'
            exit -1
        fi

        local dir=${router_array[i]%%.*}
        if [ ! -d $dir ];then
            mkdir $dir
        fi
        cd $dir
        if [ -f route.${router_array[i]}.html ];then
            echo "Error：路由${router_array[i]}已经创建"
            exit -1
        fi
        if [ ! -f ${dir}.js ];then
              touch ${dir}.js
        fi
        echo "ecui.esr.loadRoute('${router_array[i]}');" >> ${dir}.js
        touch route.${router_array[i]}.js
        touch route.${router_array[i]}.css
        touch route.${router_array[i]}.html
        local router_name=${router_array[i]#*.}
        local targetName=${dir}_${router_name}
        cat > route.${router_array[i]}.html <<EOF
<!-- target: ${targetName} -->
<div class="assess-detail-content">
${targetName}
</div>
EOF
        cat > route.${router_array[i]}.js <<EOF
ecui.esr.addRoute('${router_array[i]}', {
    model: [''],
    main: 'container',
    view: '${targetName}',
    onbeforerequest: function (context) {
    },
    onbeforerender: function (context) {
    },
    onafterrender: function () {
    },
});
EOF
        cd ..
        if [[ $add_route == 1 ]]; then
            router_html=${router_html}"<div><a href='#${router_array[i]}'>${router_array[i]}</a></div>"
        fi
        echo "Info：创建新路由：${router_array[i]}"
        ((i++))
    done

    line=`sed -n '/当前路由/=' index.html | tail -n1`
    cat index.html > temp
    sed "${line}a\\
    ${router_html}" temp > index.html
    rm temp
}

# main
add_route=0
if [ $# = 0 ]; then
    usage
fi
while getopts 'ir:ha' OPT; do
    case $OPT in
        a)
            add_route=1
            ;;
        i)
            add_route=1
            create_index

            ;;

        r)
            if [ ! -f index.html ]; then
                echo '请先初始化工程'
                exit -1
            fi
            OLD_IFS="$IFS"
            #设置分隔符
            IFS=","
            #如下会自动分隔
            router_array=($OPTARG)
            #恢复原来的分隔符
            IFS="$OLD_IFS"
            if [ -n $router_array ];then
                create_router
            fi
            ;;
        h)
            usage
            ;;
        ?)
            usage
    esac
done
