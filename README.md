# 初始 ECUI

## 什么是 ECUI

ECUI 是以 js es5、css 语法为基础，基于面向对象理念设计的一套企业级前端开发语言。

### ECUI 的特点与优势

- 支持一套代码多平台发布，开发者编写一套代码，可发布到iOS、Android、Web（响应式）等多个平台；
- 控件对象化处理，支持对象封装、继承、接口等抽象模式，既保证了较高的扩展性，同时使得对象间解耦，减少多人开发导致的控件冲突等问题；
- 支持单页应用 开发，支持 ES6+ 语法。（打包工具已采用 uglify-es ）
- 提供了 pc 和 移动端 开发 常用控件(自带默认样式)；
- 通过src/esr.js来统一管理路由；
- 通过src/core.js来对事件与状态进行统一管理；
- 通过src/etpl.js 来实现模板渲染；
- 通过src/adapter.js 来兼容第三方库；
- 通过src/control 来扩展原生 DOM 节点的标准事件；

## 快速上手

这里 只介绍在mac环境下 如何快速 从0搭建一个 ecui 项目，并着手进行日常开发。

### 环境准备

- node/v9.3.0 以上版本 请用户自行百度安装
- npm/6.1.0 以上版本 请用户自行百度安装
- nginx 请用户自行百度安装

#### 构建依赖

前置假定 node 已安装好，从环境中可以找到node (无论是位于 /usr/local/bin/node 还是PATH中能找到)

``` bash
 >>> npm install jslint@0.12.0 -g     ### js 代码检测器 node-jslint version: 0.12.0  JSLint edition 2013-08-26; 稍后需用欧阳改造后的 lib/jslint.js
 >>> npm install lesshint@5.1.0 -g    ### css 检测器
 >>> npm install lessc@2.7.3 -g       ### css 语法高亮 
 >>> npm install uglify-es@3.3.9 -g   ### 高效率压缩 js 文件 ，打包工具，参见 https://github.com/mishoo/UglifyJS2/tree/harmony
```

安装完jslint后，找到安装路径（mac下默认安装路径：/usr/local/lib/node_modules），使用ECUI项目下的ECUI/tools/jslint.js替换掉安装的jslint中lib目录下的jslint.js文件（
/usr/local/lib/node_modules/jslint/lib/jslint.js）

#### nginx配置

若您的项目不直接在 ECUI 框架根目录下，则需要配置 nginx ，以便您的本地项目可以访问到 ECUI 控件库。
nginx 安装成功以后，在 mac 中打开终端, 执行以下命令：

```
// 打开 nginx.conf 配置文件后，参照 附录 中的 nginx配置示例, 修改 框架和项目 root 路径和文件名即可。
open /usr/local/etc/nginx/nginx.conf
// 第一次启动，需要root 权限，输入密码
sudo nginx
// 若是启动不成功，则需要多次需改nginx.conf，使用如下命令 重启
sudo nginx -s reload
```

### 获取 框架源码

建议先创建一个工作目录，把框架源码和项目代码 都放在该目录下：

```
// 创建并进入该目录
mkdir work && cd work
// 下载源码
git clone https://github.com/allskystar/ECUI.git
```

### 本地生成文档

cd ECUI
在ECUI项目目录下执行 java -jar ecui-doc.jar

### 创建 项目目录

您可采用以下几种方式，完成您的项目创建

- 使用脚本 ：使用 ECUI下的 generator-ecui.sh 脚本创建项目（脚本长久未维护，可能存在问题）
- 解压 ECUI下的 ecui-demo.zip 文件，作为您的初试项目
- 手动按照框架对目录和文件命名的要求一一创建：
- 您也可以在您已有项目中引用 ECUI 框架

#### 使用脚本 创建 项目目录

打开终端，在 work目录下执行以下命令：

```
// 初始化项目并且创建路由 demo.list 和 demo.detail，并且在index中添加路由的链接
./ECUI/generator-ecui.sh  -i -r demo.list,demo.detail

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

## HTML引入 ECUI 示例

``` html

    <link rel="stylesheet/less" type="text/css" href="ecui.css" />
	<link rel="stylesheet/less" type="text/css" href="index.css">
    <script type="text/javascript" src="options.js"></script>
    <script type="text/javascript" src="ecui.js"></script>
    <script type="text/javascript" src="index.js"></script>
```

### 打开浏览器进行访问

根据 nginx.conf 配置的端口号和项目名称，然后在浏览器中输入，如：

```
http://localhost:9006
```

### 开始开发

使用您喜欢的编辑器 去打开 项目和框架目录即可，有时需要去 看一下框架 源码，这样避免在 业务代码中 做
重复的实现。对于pc和移动端开发的不同，请查看有关教程实例或者联系框架开发者！

# ECUI 的基本语法

## ECUI 的目录结构

请参考下图（DEMO 目录结构）：

``` ECUI 目录结构
demo(项目目录)
           |
           |_ _ _
                |_ _ _  demo（文件夹） ------------  demo 目录
                |     |
                |     |_ _ _  _define_.js  --------  demo 目录下全局js，可用于路由加载
                |     |
                |     |_ _ _  _define_.css  -------  demo 目录下全局css
                |     |
                |     |_ _ _  route.demo.html  ---  demo 页面
                |     |
                |     |_ _ _  route.demo.js  -----  demo 页面相应的js文件
                |     |
                |     |_ _ _  route.demo.css  ----  demo 页面相应的css样式
                |     | 
                |     |_ _ _ _ _ _ childdemo（文件夹）  ------------  childdemo子目录
                |                  |               
                |                  |_ _ _ _define_.js  -------------  demo子目录js
                |                  |               
                |                  |_ _ _ _define_.css  ------------  demo子目录css
                |                  |               
                |                  |_ _ _ route.childdemo.html
                |                  |               
                |                  |_ _ _ route.childdemo.js
                |                  |               
                |                  |_ _ _ route.childdemo.css                
                |
                |_ _ _  index.html --------------------- 首页 html
                |
                |_ _ _  index.js   --------------------- 首页对应的 js 文件，全局适用
                |
                |_ _ _  index.css  --------------------- 首页相应的 css 样式，全局适用

```

### 注意事项

- xxx.html、index.js、index.css 为该 xxx 页面的一组文件，请保持命名规范
- _define_.js 为必要文件，框架根据该文件进行路由扫描，请勿更改文件名
- childdemo 下页面问 demo 的子路由，同级路由写在同一文件夹下即可

## 路由管理

ECUI 支持路由与子路由操作，程序按照注册路由对应的目录结构实现路由模式。
ECUI 的路由在每次跳转（也即 url hash变化）时，计算当前路由以及目标路由。与 vue 框架不同的是，vue
仅支持页面级别的缓存，如果同一个页面复用，后面的缓存就会覆盖前者。而 ECUI
通过hash处理，每个页面均为独立的新路由，不会导致定义的复用页面的数据丢失或错乱。举个典型的例子，从列表访问详情页，详情页再打开列表，数次循环。
VUE 框架中，往往这时候 back 到第一个列表页时，当时页面填写的筛选数据等数据就丢失了。而 ECUI 每 i 次打开的列表页为 xxxx~
HISTORY=i ， 这个机制可以保存所有页面的缓存数据。
基于上述底层逻辑，ECUI 提供了自动缓存、回填的接口，无需任何额外开发，便可完成。

### 路由注册

如 demo 中所示，路由的注册仅需以下三步：

- 步骤一：在 xxx.js ( demo 中为 route.demo.js ) 中调用 ecui.esr.addRoute() 方法添加路由。

#### addRoute 方法代码介绍

```
        /**
         * 添加路由信息。
         * @public
         *
         * @param {string} name 路由名称
         * @param {object} route 路由对象
         */
        addRoute: function (name, route) {}
```

##### route 对象关键参数介绍

- route.model ： xxx
- route.main ： 页面所属容器
- route.view ： 页面所属试图
- route.onbeforerequest ： 页面发生请求前事件、方法集合
- route.onbeforerender ： 页面加载前事件、方法集合
- route.onafterrender ： 页面加载后事件、方法集合

#### addRoute 调用示例

```
ecui.esr.addRoute('demo', {
    model: [''],
    main: 'main',
    view: 'demo_demo',
    onbeforerequest: function (context) {
    },
    onbeforerender: function (context) {
    },
    onafterrender: function () {
        // ecui.get('button_demo').onclick = function () {
        //     ecui.esr.redirect('/demo/childdemo');
        // };
    },
});

```

- 步骤二：在 xxx.html 文件头，加上 “\<!-- target: **_视图名_** -->”，*
  *_视图名务必与第一步注册路由时，route.view 定义的视图名一致_**，如下：

``` xxx.html 文件头路由声明
<!-- target: demo_childdemo -->
<div class="assess-demo-content">
    <a href="#/demo/demo">go-demo</a>
</div>
```

- 步骤三：在同级目录的 _define_.js 中调用 ecui.esr.loadRoute() 方法 加载该路由，代码如下：

```
ecui.esr.loadRoute('childdemo');
```

#### 子路由

在 ECUI 框架中，子文件夹内注册的路由，自动视为子路由。逐级延伸。

### 路由跳转

您可以通过 a 标签跳转页面，或者调用 ecui.esr.redirect() 方法完成路由跳转。

#### a标签跳转路由代码示例：

```
    <a href="#/demo/childdemo/childdemo">go-childdemo</a>
```

#### redirect 跳转路由代码示例：

```
    ecui.get('button_demo').onclick = function () {
        ecui.esr.redirect('/demo/childdemo/childdemo');//路由构成为 文件夹路径+路由名
    };
```

## 控件的定义和继承

ECUI通过core.js实现继承和接口处理能力。
调用 core.js 的 inherits(）方法定义控件对象，并指定其继承对象。
子类可以直接拥有父类的所有方法，以及可以使用父类定义的全局变量。要想重写父类方法，只需在声明子类时，在“子控件的构造函数”
constructor 参数中定义即可。子类若想调用父类的方法，可通过 super.xxx() 进行调用。

### inherits 方法代码介绍

```
        /**
         * 控件继承。
         * 如果不指定类型样式，表示使用父控件的类型样式，如果指定的类型样式以 * 符号开头，表示移除父控件的类型样式并以之后的类型样式代替。生成的子类构造函数已经使用了 constructor/TYPES/CLASS 三个属性，TYPES 属性是控件的全部类型样式，CLASS 属性是控件的全部类型样式字符串。
         * @public
         *
         * @param {function} superClass 父控件类
         * @param {boolean} singleton 是否单例
         * @param {string} type 子控件的类型样式
         * @param {function} constructor 子控件的标准构造函数，如果忽略将直接调用父控件类的构造函数
         * @param {object} ... 控件扩展的方法
         * @return {function} 新控件的构造函数
         */
        inherits: function (superClass, singleton, type, constructor) {}
```

### 控件的定义代码示例一

ui.Control 控件

```
    /**
     * 基础控件。
     * 基础控件 与 ECUI状态与事件控制器 共同构成 ECUI核心。基础控件扩展了原生 DOM 节点的标准事件，提供对控件基础属性的操作，是所有控件实现的基础。
     * options 属性：
     * id          名称，指定后可以使用 ecui.get([id]) 的方式获取控件
     * uid         唯一标识符，不可自行定义，系统自动生成
     * primary     主元素需要绑定的样式
     * capturable  是否接收交互事件，如果设置不接收交互事件，交互事件由控件的父控件处理，缺省值为 true
     * disabled    是否失效，如果设置失效，控件忽略所有事件，缺省值为 false
     * focusable   是否允许获取焦点，如果设置不允许获取焦点，控件的交互事件不会改变当前拥有焦点的控件，用于自定义滚动条，缺省值为 true
     * userSelect  是否允许选中内容，缺省值为 true
     * @control
     */
    ui.Control = core.inherits(
        null, //Control 是所有控件对象的父类，它没有父类对象
        function (el, options) {
            this._eMain = this._eBody = el;
            if (options.primary) {
                el.className = (options.id || '') + ' ' + el.className + options.primary;
            }
            // svg classname 是数组 不能做trim操作
            if (typeof el.className === 'string') {
                this._sClass = el.classList[0];
            }
            this._bDisabled = !!options.disabled;
            this._bCapturable = options.capturable !== false;
            this._bUserSelect = options.userSelect !== false;
            this._bFocusable = options.focusable;
            this._bGesture = true;
            this._sSubType = '';
            this._aStatus = ['', ' '];
            this._sWidth = el.style.width;
            this._sHeight = el.style.height;
            this._hResize = util.blank;
            if (!options.main) {
                this._UIControl_oHandler = unitReadyHandler.bind(this);
            }
        },
        {} //此处为 Control 组件定义的事件触发，因代码过长，不在此处展示。
    );
```

### 控件的定义代码示例二

Title控件

``` Title控件
    /**
     * 标题栏部件。
     * 继承自 ui.Control（所有控件均为 ui.Control 的子类）
     * 
     * @unit
     */
    Title: core.inherits( //通过core.inherits() 实现空间继承
        ui.Control,
        {
            /**
             * 标题栏激活时触发拖动，如果当前窗体未得到焦点则得到焦点。
             * @override
             */
            $activate: function (event) {
                _super.$activate(event);
                core.drag(this.getParent(), event);
            }
        }
    )
```

## 接口

ECUI中定义的接口，是指抽象出对象的共有行为（也就是抽象出各种方法），在对象定义的时候，它实现了哪些接口，相当于直接拥有了这些接口的方法。以此实现控件方法的横向扩展，减少重复造轮子的同时，便于一次维护，多方受用。
控件扩展的方法遵循后声明覆盖前者标准，即，相同方法，仅后声明的生效。

### 接口声明

调用 core.js 的 interfaces（）方法声明接口

#### interfaces 方法代码介绍

``` 接口声明
    /**
     * 接口声明。
     * @public
     *
     * @param {string} name 接口名称
     * @param {Array} superClass 接口的基类的数组
     * @param {object} methods 接口的方法集合
     * @param {function} interceptor 拦截器
     * @return {Interface} 接口定义
     */
    interfaces: function (name, superClass, methods, interceptor) {
```

### 接口实现

接口某种意义上，就是控件的扩展方法。所以，在定义控件的inherits(）方法，将接口传入“控件扩展的方法”即可实现该接口。同时，可以通过继续传入自定义方法，来实现接口方法的重写。
可使用 _class.xxx() 调用接口链上之前接口里的方法。

#### 接口实现代码示例

``` 接口实现代码示例
    /**
     * 下拉框控件。
     * 扩展了原生 SelectElement 的功能，允许指定下拉选项框的最大选项数量，在屏幕显示不下的时候，会自动显示在下拉框的上方。在没有选项时，下拉选项框有一个选项的高度。下拉框控件允许使用键盘与滚轮操作，在下拉选项框打开时，可以通过回车键或鼠标点击选择，上下键选择选项的当前条目，在关闭下拉选项框后，只要拥有焦点，就可以通过滚轮上下选择选项。
     * options 属性：
     * optionSize     下拉框最大允许显示的选项数量，默认为5
     * required       是否必须选择
     * @control
     */
    ui.Select = core.inherits(
        ui.abstractSelect,
        'ui-select',
        function (el, options) {
            _super(el, options);
            // 初始化下拉区域最多显示的选项数量
            this._nOptionSize = options.optionSize || 10;
        },
        {},
        ui.iPopup, ui.iResource,//这里实现了 ui.iPopup、ui.iResource 两个接口
        {}//这里可以传入方法重写ui.iPopup的方法。同时可以自定义控件方法
    );
```

## 私有变量

通过在属性名前加 下划线“_”（如 _name），可将该属性定义为私有变量，私有变量仅改类可以访问，其子类无法访问。因此，为避免程序异常，请勿在该类方法之外的地方引用私有变量。
顺带一提，框架通过以下两种方式实现变量的绝对私有，保障私有变量隔离：

- 调试过程中，框架提供了pushCaller与popCaller方法检查私有化属性
- 打包编译后，私有化属性会重新命名

## 全局变量

将变量命名以_ECUI_开头，即可认定为全局变量，全局变量可作用于该对象及其所有子类访问。

# 附录

## nginx配置示例

请注意，不要把 filepath 、root 之类的目录位置原封不动的照抄！ 根据你实际情况来填写

该配置示例要求 框架和业务项目的目录 在同一目录下，主要更改以下地方：

- 将 root 后面的路径 改为 您电脑上 ecui 框架或业务项目 的对应目录；

## nginx 配置时小技巧

请各位同事在研发态 给本机 nginx 静态资源的 location 段加一下 Cache-Control 控制，研发时，一些 css html jpg 废不了太多流量

``` nginx
location ~ /你的路径规则   {
  add_header Cache-Control 'no-store,no-cache,must-revalidate';
  add_header xx-via   'developer-你的名' ;   ## 这样可以明确的从http响应头 感知到 静态资源来自你机器
  ……
}
``` 

下方是一个简易的配置文件

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

    #本地开发时用于请求项目的静态文件，需要在hosts中配置 127.0.0.1 为localhost(Mac一般默认配置)
    #否则通过127.0.0.1加 文件路径进行访问

    server {
        listen       9006;      # 一般习惯设置80，但很多开发者 本机80端口常被占
        server_name  localhost; # 请确认是本机，最好解析为127 以免走入 ipv6型回路
        #配置默认请求为 ecui-demo 的静态资源
        set $root '/Users/chentiancheng/IdeaProjects/ecui-demo';
        set $ecui_root '/Users/chentiancheng/IdeaProjects/ECUI';
        root   $root; #项目所在的路径
        index  index.html index.htm;#默认请求的文件

        # ECUI文件本地调试
        location ~ ^/(ie-es5\.|ecui\.|compatible-2\.0\.0|options\.|common\.|update\.|common/|tools/|css/|src/|images/ecui/).*$ {
            if ( !-f $document_root$uri ) {
                  proxy_pass http://localhost:8000;
            }
            root $root;
            index index.html index.htm;
        }

        location ~ /(_layer_\.js|_define_\.(css|html)|layer\.[^/]+\.(js|css|html))$ {
            if ( !-f $document_root$uri ) {
                # default_type text/html;
                add_header Content-Type 'text/html; charset=utf-8';
                return 200 '';
            }
            root $root;
        }

        # 打包后工程访问
        location ~ ^/output-.*/[/\w-]+$ {
            rewrite /output-(.*) /$1;
        }

        location = / {
            root   $root;
            index  index.html index.htm;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }

    }

    #控制开发环境中用于请求的ecui有关文件
    server {
        listen       8000;

        set $root '/Users/chentiancheng/IdeaProjects/ecui-demo';
        set $ecui_root '/Users/chentiancheng/IdeaProjects/ECUI';

        location / {
            # 引入文件所在的路径
            root   $ecui_root;
        }
    }

}

```
