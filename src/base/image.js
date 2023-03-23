/*
@example
<img ui="type:image">

@fields
_nMinWidth 原始的宽度
_nRatio    原始的宽高比例
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    /**
     * 图片控件。
     * 扩展图片的功能，支持使用滚轮直接缩放图片的大小。
     * @control
     */
    ui.Image = core.inherits(
        ui.Control,
        'ui-image',
        function (el, options) {
            // firefox下点击图片会自动进入选中状态
            options.userSelect = false;
            _super(el, options);
            dom.imgLoad(el, function (event) {
                this._nMinWidth = event.target.width;
                this._nRatio = event.target.height / event.target.width;
                if (this.isReady()) {
                    this.cache();
                }
            }.bind(this));
        },
        {
            /**
             * @override
             */
            $mousewheel: function (event) {
                _super.$mousewheel(event);
                var delta = event.deltaY,
                    width = Math.max(this._nMinWidth, this.getWidth() - delta * 2);

                this.setSize(width, Math.round(width * this._nRatio));
                event.preventDefault();
            }
        }
    );
//{if 0}//
})();
//{/if}//
