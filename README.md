# ECUI
企业级Web UI控件库：
- 通过src/core.js来对事件与状态进行统一管理；
- 通过src/esr.js来统一管理路由；
- 通过src/etpl.js 来实现模板渲染；
- 通过src/adapter.js 来兼容第三方库；
- 通过src/control 来扩展原生 DOM 节点的标准事件；
- 并提供了 pc 和 移动端 开发 常用的控件(自带默认样式)；
- 支持 单页应用 开发，支持 ES6+ 语法。（打包工具已采用 uglify-es ）

## 快速开始
这里 只介绍 在公司内部 在mac环境下 如何快速 从0搭建一个 ecui 项目，并着手进行日常的开发，这里只接受 最常用 使用nginx进行开发的过程：

### 构建依赖

注意：构建服务器上采用的 node/v9.3.0  npm/6.1.0  如希望尽量减少和构建服务器的差异，可尽量安装同样的版本 以消除不确定性

``` bash
>>> ## 打包工具 build.sh 不再使用 webpack.jar ；现在用 uglify-es 打包压缩；构建服务器上版本是 uglify-es@3.3.9
>>> uglifyjs --version
uglify-es 3.3.9  ## 请注意这里是输出的是 uglify-es 表明是 UglifyJS2 （ harmony 分支）

```

如果输出的是 uglify-js 3.3.x 表示`安装不正确`； uglify-js 和 uglify-es 不一样， uglify-es 支持ES6+， 目前应采用的是 uglify-es

build.sh 里使用了几项常见的linux 程序（还依赖于jdk - 像 smarty4j.jar ），包括 awk、sed、python （构建服务器上 Python 2.6.6 一般 Python 2.7.x 也可以）
另外 需要一些node js里常用的工具。参见 内网说明文件 开发环境安装node、jslint

前置假定 node 已安装好，从环境中可以找到node (无论是位于 /usr/local/bin/node 还是PATH中能找到)

``` bash
 >>> ## npm/6.1.0 node/v9.3.0 
 >>> npm install jslint@0.12.0 -g     ### js 代码检测器 node-jslint version: 0.12.0  JSLint edition 2013-08-26; 稍后需用欧阳改造后的 lib/jslint.js
 >>> npm install lesshint@5.1.0 -g    ### css 检测器
 >>> npm install lessc@2.7.3 -g       ### css 语法高亮 
 >>> npm install uglify-es@3.3.9 -g   ### 高效率压缩 js 文件 参见 https://github.com/mishoo/UglifyJS2/tree/harmony
```

安装完jslint后，找到安装路径（mac下默认安装路径：/usr/local/lib/node_modules），使用lib-fe项目下的lib-fe/tools/jslint.js替换掉安装的jslint中lib目录下的jslint.js文件（ /usr/local/lib/node_modules/jslint/lib/jslint.js） 


### 获取 框架源码
建议先创建一个工作目录，把框架源码和项目代码 都放在该目录下：
```
// 创建并进入该目录
mkdir work && cd work
// 下载源码
git clone http://devops.biz.taoche.com/gitlab/lib/lib-fe.git
```
### 创建 项目目录
可以使用 lib-fe下的 generator-ecui 脚本创建项目，也可以自己手动按照框架对目录和文件命名的要求一一创建：
#### 使用脚本
打开终端，在 work目录下执行以下命令：
```
// 初始化项目并且创建路由 demo.list 和 demo.detail，并且在index中添加路由的链接
./lib-fe/generator-ecui.sh  -i -r demo.list,demo.detail

```
#### 手动搭建
在 work 按照以下目录层次创建对应文件，并按照实例 引入 ecui 相关文件：

```
demo(项目目录)
           |
           |_ _ _
                |_ _ _ _  helloworld
                |       |
                |       |_ _ _ _  helloworld.js
                |       |
                |       |_ _ _ _  route.helloworld.demo.html
                |       |
                |       |_ _ _ _  route.helloworld.demo.js
                |       |
                |       |_ _ _ _  route.helloworld.demo.css
                |
                |_ _ _ _  index.html
                |
                |_ _ _ _  index.js
                |
                |_ _ _ _  index.css

```
### 安装并配置 nginx
安装 请直接去问百度，安装成功以后，然后在 mac 中打开终端, 执行以下命令：
```
// 打开 nginx.conf 配置文件后，参照 附录 中的 nginx配置示例, 修改 框架和项目 root 路径和文件名即可。
open /usr/local/etc/nginx/nginx.conf
// 第一次启动，需要root 权限，输入密码
sudo nginx
// 若是启动不成功，则需要多次需改nginx.conf，使用如下命令 重启
sudo nginx -s reload
```

### 打开浏览器进行访问
根据 nginx.conf 配置的端口号和项目名称，然后在浏览器中输入，如：
```
http://localhost:9006/demo/index.html
```
### 开始开发
使用您喜欢的编辑器 去打开 项目和框架目录即可，有时需要去 看一下框架 源码，这样避免在 业务代码中 做 重复的实现。对于pc和移动端开发的不同，请查看有关教程实例或者联系框架开发者！

## 附录
### HTML引入ecui示例
``` html

    <link rel="stylesheet/less" type="text/css" href="ecui.css" />
    <link rel="stylesheet/less" type="text/css" href="common.css">
	<link rel="stylesheet/less" type="text/css" href="index.css">
    <script type="text/javascript" src="options.js"></script>
    <script type="text/javascript" src="ecui.js"></script>
    <script type="text/javascript" src="common.js"></script>
    <script type="text/javascript" src="index.js"></script>
```
### nginx配置示例

请注意，不要把 filepath 、root 之类的目录位置原封不动的照抄！ 根据你实际情况来填写 

该配置示例要求 框架和业务项目的目录 在同一目录下，主要更改以下 两方面 的地方：
- 一是将 root 后面的路径 改为 您电脑上 ecui 框架或业务项目 的对应目录；
- 二是 添加类似 市场ERP 的匹配规则，将market 替换成您 项目所在的目录名；

### nginx 配置时小技巧

请各位同事在研发态 给本机 nginx 静态资源的 location 段加一下 Cache-Control 控制，研发时，一些 css html jpg 废不了太多流量

``` nginx
location ~ /你的路径规则   {
  add_header Cache-Control 'no-store,no-cache,must-revalidate';
  add_header xx-via   'developer-你的名' ;   ## 这样可以明确的从http响应头 感知到 静态资源来自你机器
  ……
}
``` 

下方是一个简易的配置文件（貌似已落后实际很多，并不完全这样配的）

``` nginx
#控制工作进程数
worker_processes  1;
error_log  /tmp/nginx_error.log  notice;
#包含nginx中所有处理连接的设置
events {
  #工作进程的最大连接数量
  worker_connections  1024;
}
#控制 nginx http处理的所有核心特性
http {
    #该文件内定义指定文件头所对应的文件格式
    include       mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    #指定 nginx 是否调用sendfile 函数（zero copy 方式）来输出文件,对于普通应用，必须设为on。
    #如果用来进行下载等应用磁盘IO重负载应用，可设置为off，以平衡磁盘与网络IO处理速度，降低系统负载
    sendfile        on;

    #keepalive_timeout 参数是一个请求完成之后还要保持连接多久，不是请求时间多久，
    #目的是保持长连接，减少创建连接过程给系统带来的性能损耗，类似于线程池，数据库连接池。
    keepalive_timeout  65;

    #upstream使nginx跨越单机的限制，完成网络数据的接收、处理和转发。
    #他不产生自己的内容，而是通过请求后端服务器得到内容
    upstream upstream_dev {
      #用于跨域请求 后端的数据
      server 192.168.155.26:80;
    }

    #本地开发时用于请求项目的静态文件，需要在hosts中配置 127.0.0.1 为localhost(Mac一般默认配置)
    #否则通过127.0.0.1加 文件路径进行访问
    server {
        listen       9006;      # 一般习惯设置80，但很多开发者 本机80端口常被占
        server_name  localhost; # 请确认是本机，最好解析为127 以免走入 ipv6型回路 

        #配置 demo 后台管理系统的静态资源请求规则
        location ~ ^/demo/[/\w-]+$ {
            proxy_pass http://upstream_dev;
        }
        location ~ /demo/ {
            if (!-f $request_filename) {
                #意思是当请求 ecui 框架相关的文件时，当下目录下不存在；
                #所以去掉 demo 目录名，去匹配后面的规则，$1取得是demo后面的所有内容
                #比如ecui.js，匹配到后面的规则后转到http://127.0.0.1:8000，nignx启的另一个server
                #来获取lib-fe,也就是ecui相关的文件，所以这个示例 要求框架和项目在同一层级目录
                rewrite '^/demo(.*)' $1;
            }
            root   /Users/kongwu/yxwork/;
            index  index.html index.htm;
        }


        #配置默认请求为 default 后台管理系统的静态资源
        root   /Users/kongwu/yxwork/default; #项目所在的路径
        index  index.html index.htm;#默认请求的文件
        location = / {
            root   /Users/kongwu/yxwork/default;
            index  login.html index.htm;
        }

        location ~ ^[/\w-]+$ {
          proxy_pass http://upstream_dev;
        }

        #配置项目中用到的所有ecui相关文件
        location ~ ^/(ecui\.|options\.|ie-es5\.|common\.|common/|tools/|css/|src/|images/ecui/).*$ {
          proxy_pass http://127.0.0.1:8000;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }

    #控制开发环境中用于请求的ecui有关文件
    server {
        listen       8000;
        location / {
            # 引入文件所在的路径
            root   /Users/kongwu/yxwork/lib-fe;
        }
    }
}

```
