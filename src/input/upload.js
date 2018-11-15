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
    var fileChangeHandler = ieVersion < 9 ? function () {
            var name = this.getUID(),
                iframe = dom.create('IFRAME', {
                    name: name,
                    className: 'ui-hide'
                }),
                form = dom.create('FORM', {
                    action: this._sUrl,
                    method: 'POST',
                    enctype: 'multipart/form-data',
                    target: name
                });
            document.body.appendChild(iframe);
            document.body.appendChild(form);
            iframe.onreadystatechange = function () {
                if (iframe.readyState === 'complete') {
                    var text = iframe.contentDocument.body.innerHTML;
                    iframe.onreadystatechange = null;
                    document.body.removeChild(form);
                    document.body.removeChild(iframe);
                    this.onupload(text);
                }
            };
            form.appendChild(this._eFile.cloneNode(false));
            form.submit();
        } : function () {
            var reader = new FileReader(),
                file = this._eFile.files[0],
                progress = core.query(function (item) {
                    return item instanceof ui.Progress && item.getParent() === this;
                }, this)[0];

            reader.readAsDataURL(file);
            reader.onload = function () {
                var data = new FormData();
                data.append(this._eFile.name, file);

                io.ajax(this._sUrl, {
                    method: 'POST',
                    data: data,
                    onupload: progress ? function (event) {
                        progress.setMax(event.total);
                        progress.setValue(event.loaded);
                    } : undefined,
                    onsuccess: this.onupload.bind(this),
                    onerror: this.onerror ? this.onerror.bind(this) : util.blank
                });
            }.bind(this);
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

            core.$bind(this._eFile, this);
        },
        {
            /**
             * @override
             */
            $dispose: function () {
                this._eFile.getControl = null;
                this._eFile = null;
                ui.Control.prototype.$dispose.call(this);
            },

            /**
             * @override
             */
            $ready: function (event) {
                ui.Control.prototype.$ready.call(this, event);
                dom.addEventListener(this._eFile, 'change', fileChangeHandler.bind(this));
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
