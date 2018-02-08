# ECUI
> 企业级Web UI控件库。

## 使用
> 引入ecui.js资源，使用nginx服务转发获取到本地文件资源。

> html:

``` html

    <link rel="stylesheet/less" type="text/css" href="ecui.css" />
    <link rel="stylesheet/less" type="text/css" href="common.css">
	<link rel="stylesheet/less" type="text/css" href="index.css">
    <script type="text/javascript" src="options.js"></script>
    <script type="text/javascript" src="ecui.js"></script>
    <script type="text/javascript" src="common.js"></script>
    <script type="text/javascript" src="index.js"></script>
```
> nginx.conf:

``` nginx

#user  nobody;
worker_processes  1;

error_log  /tmp/nginx_error.log  info;  # notice;

events {
    worker_connections  1024;
}


http {
    include       mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    sendfile        on;

    upstream upstream_dev {
 	  server xxx.com:80;
    }

    server {
        listen       80;
        server_name  localhost;

        location ~ /auction/ {
            if (!-f $request_filename) {
                rewrite '^/auction(.*)' $1;
            }
            root   /xxx/source;
            index  index.html index.htm;
        }

        location ~ ^/admin/[/\w-]+$ {
            proxy_pass http://upstream_dev;
        }
        location ~ /admin/ {
            if (!-f $request_filename) {
                rewrite '^/admin(.*)' $1;
            }
            root   /xxx/source;
            index  index.html index.htm;
        }
   
        root   /xxx/project;
        index  index.html index.htm;
        location = / {
            root   /xxx/project;
            index  login.html index.htm;
        }
        location ~* .ecui.js {
            proxy_pass http://127.0.0.1:8000;
        }
        location = /ie-es5.js {
            proxy_pass http://127.0.0.1:8000;
        }
        location = /options.js {
            proxy_pass http://127.0.0.1:8000;
        }
        location = /ecui.css {
            proxy_pass http://127.0.0.1:8000;
        }
        location ^~ /tools/ {
            proxy_pass http://127.0.0.1:8000;
        }
        location ^~ /src/ {
            proxy_pass http://127.0.0.1:8000;
        }
        location ^~ /css/ {
            proxy_pass http://127.0.0.1:8000;
        }
        location ^~ /images/ecui/ {
            proxy_pass http://127.0.0.1:8000;
        }
        location = /common.js {
            proxy_pass http://127.0.0.1:8000;
        }
        location = /common.css {
            proxy_pass http://127.0.0.1:8000;
        }
        location ^~ /common/ {
            proxy_pass http://127.0.0.1:8000;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }

    
    server {
        listen       8000;

        location / {
            root   /xxx/lib-fe;
            index  index.html index.htm;
        }
    }
}



```

