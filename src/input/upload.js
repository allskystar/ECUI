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
            var reader = new FileReader(),
                file = this._eFile.files[0],
                progress = core.query(
                    function (item) {
                        return item instanceof ui.Progress && item.getParent() === this;
                    },
                    this
                )[0];

            // 取消选择时 file 为空，过滤file不正常的情况
            if (file) {
                reader.readAsDataURL(file);
                reader.onload = function () {
                    var data = new FormData();
                    data.append(this._eFile.name, file);

                    io.ajax(this._sUrl, {
                        method: 'POST',
                        headers: this._oHeaders,
                        xhrFields: this._oXhrFields,
                        data: data,
                        onupload: progress ? function (event) {
                            progress.setMax(event.total);
                            progress.setValue(event.loaded);
                        } : undefined,
                        onsuccess: this.onupload ? this.onupload.bind(this) : util.blank,
                        onerror: this.onerror ? this.onerror.bind(this) : util.blank
                    });
                }.bind(this);
            } else {
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
        },
        {
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
}());
