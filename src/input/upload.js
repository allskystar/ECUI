/*
@example
<label ui="type:upload">
    <input type="file" name="file">
    <div ui="type:progress-bar"></div>
</label>
或
<label ui="type:upload">
    <input type="file" name="file">
    <div ui="type:progress-circle"></div>
</label>
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        io = core.io,
        ui = core.ui,
        util = core.util,

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
//{/if}//
    /**
     * 文件上传回调事件。
     * @private
     */
    var fileChangeHandler = ieVersion < 11 ? function () {
        var name = this.getUID(),
            iframe = dom.create('IFRAME', {
                name: name,
                className: 'ui-hide'
            });

        document.body.appendChild(iframe);
        dom.insertHTML(document.body, 'beforeEnd', '<form action="' + this._sUrl + '" method="POST" enctype="multipart/form-data" target="' + name + '"></form>');
        var form = document.body.lastChild;
        iframe.onreadystatechange = function () {
            if (iframe.contentDocument.body && iframe.readyState === 'complete') {
                var text = iframe.contentDocument.body.innerHTML;
                iframe.onreadystatechange = null;
                document.body.removeChild(form);
                document.body.removeChild(iframe);
                this.onupload(text);
            }
        }.bind(this);
        var cloned = this._eFile.cloneNode(false);
        cloned.lastValue = this._eFile.value;
        dom.insertBefore(cloned, this._eFile);
        form.appendChild(this._eFile);
        this._eFile = cloned;
        form.submit();
    } : function () {
        var files = this._eFile.files,
            name = this._eFile.name,
            url = this._sUrl,
            progress = core.query(
                function (item) {
                    return item instanceof ui.Progress && item.getParent() === this;
                },
                this
            )[0],
            count = files.length;

        this.onbeforeupload();
        if (count) {
            files = Array.prototype.slice.call(files, 0);
            files.forEach(function (file) {
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function () {
                    var data = new FormData();
                    data.append(name, file);

                    io.ajax(url, {
                        method: 'POST',
                        headers: this._oHeaders,
                        xhrFields: this._oXhrFields,
                        data: data,
                        onupload: progress ? function (event) {
                            progress.setMax(event.total);
                            progress.setValue(event.loaded);
                        } : undefined,
                        onsuccess: function (res) {
                            if (this.onupload) {
                                this.onupload(res);
                            }
                            count--;
                            if (count <= 0) {
                                this.onfinishupload();
                            }
                        }.bind(this),
                        onerror: function (err) {
                            if (this.onerror) {
                                this.onerror(err);
                            }
                            count--;
                            if (count <= 0) {
                                this.onfinishupload();
                            }
                        }.bind(this)
                    });
                }.bind(this);
            }, this);
        } else {
            // 取消选择时 files 长度为0，过滤files不正常的情况，直接触发error回调
            this.onerror();
        }
    };

    /**
     * 文件上传控件。
     * 内部必须包含<input type="file">的标签，可以包含或不包含进度控件，如果包含就会自动设置进度控件参数。
     * @control
     */
    ui.Upload = core.inherits(
        ui.Control,
        'ui-upload',
        function (el, options) {
            ui.Control.call(this, el, options);
            this._sUrl = options.url;
            this._eFile = el.getElementsByTagName('INPUT')[0];
            this._eInput = el.getElementsByTagName('INPUT')[1];
            this._eImg = el.getElementsByTagName('IMG')[0];
            this._eName = el.getElementsByTagName('DIV')[0];
        },
        {

            /**
             * @override
             */
            $click: function (event) {
                ui.Control.prototype.$click.call(this);
                if (event.target !== this._eFile) {
                    this._eFile.click();
                }
            },

            /**
             * @override
             */
            $dispose: function () {
                this._eFile = null;
                ui.Control.prototype.$dispose.call(this);
            },

            /**
             * @override
             */
            $ready: function () {
                ui.Control.prototype.$ready.call(this);
                dom.addEventListener(this._eFile, 'change', fileChangeHandler.bind(this));
            },

            /**
             * 上传文件前，添加一些 loading 效果
             * @public
             *
             */
            onbeforeupload: function () {
                dom.addClass(this.getMain(), 'ui-uploading');
            },

            /**
             * 上传失败后的处理
             * @public
             *
             */
            onerror: function () {
                // 清空 file input value， 解决失败后重新上传同一文件时，不触发input事件的问题
                this._eFile.value = '';
            },

            /**
             * 所有选择的文件上传结束
             * @public
             *
             */
            onfinishupload: function () {
                dom.removeClass(this.getMain(), 'ui-uploading');
            },

            /**
             * 上传成功后的处理
             * @public
             *
             * @param {object} res 上传文件接口返回的结果
             */
            onupload: function (res) {
                try {
                    res = JSON.parse(res);
                    if (res.code === 0) { // 显示上传的图片
                        // 设置文件id
                        if (this._eInput) {
                            this._eInput.value = res.data.id;
                        }
                        // 设置图片预览
                        if (this._eImg) {
                            this._eImg.src = res.data.path;
                        }
                        // 设置文件名
                        if (this._eName) {
                            this._eName.innerHTML = res.data.name;
                        }
                    }
                } catch (e) {}
            },

            /**
             * 设置上传文件请求的 headers。
             * @public
             *
             * @param {object} headers 文件上传请求的请求头信息
             */
            setHeaders: function (headers) {
                this._oHeaders = headers;
            },

            /**
             * 设置上传文件请求的 xhr 自定义配置。
             * @public
             *
             * @param {object} xhrFields 文件上传请求的 xhr 自定义配置
             */
            setXhrFields: function (xhrFields) {
                this._oXhrFields = xhrFields;
            },

            /**
             * 设置控件上传文件路径。
             * @public
             *
             * @param {string} url 文件上传路径
             */
            setUrl: function (url) {
                this._sUrl = url;
            }
        }
    );

    /**
     * 上传多个文件控件。
     * 内部必须包含<input type="file">的标签，可以包含或不包含进度控件，如果包含就会自动设置进度控件参数。
     * @control
     */
    ui.Uploads = core.inherits(
        ui.Control,
        'ui-uploads',
        function (el, options) {
            ui.Control.call(this, el, options);

            this._sUrl = options.url;
            this._sName = options.name;
            var children = dom.children(el);

            dom.addClass(children[0], 'ui-upload');
            this._uUpload = core.$fastCreate(this.Upload, children[0], this, { url: this._sUrl });
            dom.addClass(children[1], 'ui-file-list');
            this._uFileList = core.$fastCreate(this.FileList, children[1], this, { name: this._sName });
        },
        {
            FileList: core.inherits(
                ui.Control,
                'ui-file-list',
                function (el, options) {
                    ui.Control.call(this, el, options);
                    this._sName = options.name;
                },
                {
                    Item: core.inherits(
                        ui.Item,
                        'ui-file-item',
                        function (el, options) {
                            ui.Item.call(this, el, options);
                            core.$fastCreate(this.Delete, dom.last(el), this, {});
                        },
                        {
                            Delete: core.inherits(
                                ui.Control,
                                {
                                    onclick: function () {
                                        var item = this.getParent();
                                        item.getParent().remove(item);
                                    }
                                }
                            )

                        }
                    ),
                    $alterItems: util.blank
                },
                ui.Items
            ),
            Upload: core.inherits(
                ui.Upload,
                {

                    /**
                     * 上传成功后的处理
                     * @public
                     *
                     * @param {object} res 上传文件接口返回的结果
                     */
                    onupload: function (res) {
                        try {
                            res = JSON.parse(res);
                            if (res.code === 0) { // 显示上传的图片
                                this.getParent().addFiles([res.data]);
                            }
                        } catch (e) {}
                    },

                    /**
                     * 上传失败后的处理
                     * @public
                     *
                     */
                    onerror: function () {
                        // 清空 file input value， 解决失败后重新上传同一文件时，不触发input事件的问题
                        this._eFile.value = '';
                    }
                }
            ),

            /**
             * 添加文件到文件列表中
             * @public
             *
             * @param {Array} data 添加的文件数据
             */
            addFiles: function (data) {
                this._uFileList.add(this.formatter(data));
            },

            /**
             * 对添加的内容格式化
             * @public
             *
             * @param {array} data 添加的文件数据
             */
            formatter: function (data) {
                return data.map(function (item) {
                    return dom.create('div', {
                        innerHTML:
                            '<input name="' + this._sName + '" value="' + item.id + '" class="ui-hide">\
                            <span class="icon"></span>\
                            <span class="name">' + item.name + '</span>\
                            <span class="delete"></span>'
                    });
                });
            }
        }
    );
})();
