/*
Upload - 文件上传控件。
文件上传控件，继承自基础控件，内部必须包含<input type="file">的标签，可以包含或不包含进度控件，如果包含就会自动设置进度控件参数。

标签控件直接HTML初始化的例子:
<label ui="type:upload">
    <input type="file" name="file">
    <div ui="type:progress-bar"></div>
</label>
或
<label ui="type:upload">
    <input type="file" name="file">
    <div ui="type:progress-circle"></div>
</label>

属性
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    function fileChangeHandler() {
        var reader = new FileReader(),
            file = this._eFile.files[0],
            progress = core.query(function (item) {
                return item instanceof ui.Progress && item.getParent() === this;
            }, this)[0];

        reader.readAsDataURL(file);
        reader.onload = function () {
            var data = new FormData();
            data.append(this._eFile.name, file);

            ecui.io.ajax(this._sUrl, {
                method: 'POST',
                data: data,
                onupload: progress ? function (event) {
                    progress.setMax(event.total);
                    progress.setValue(event.loaded);
                } : undefined,
                onsuccess: this.onupload,
                onerror: this.onerror
            });
        }.bind(this);
    }

    /**
     * 初始化标签控件。
     * options 对象支持的属性如下：
     * @public
     *
     * @param {Object} options 初始化选项
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
            $dispose: function () {
                this._eFile = null;
                ui.Control.prototype.$dispose.call(this);
            },

            init: function (options) {
                ui.Control.prototype.init.call(this, options);
                dom.addEventListener(this._eFile, 'change', fileChangeHandler.bind(this));
            }
        }
    );
}());
