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
        ui = core.ui;
//{/if}//
    /**
     * 文件上传回调事件。
     * @private
     */
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
     * 文件上传控件。
     * 内部必须包含<input type="file">的标签，可以包含或不包含进度控件，如果包含就会自动设置进度控件参数。
     * @control
     */
    ui.Upload = core.inherits(
        ui.Control,
        'ui-upload',
        function (el, options) {
            ui.Control.constructor.call(this, el, options);
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
            $ready: function (event) {
                ui.Control.prototype.$ready.call(this, event);
                dom.addEventListener(this._eFile, 'change', fileChangeHandler.bind(this));
            }
        }
    );
}());
