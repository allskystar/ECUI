/*
@example
<svg ui="type:signature"></svg>

@fields
_bDraw - 是否开始跟踪绘制
_oCtx  - 画布对象
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    /**
     * 签名控件。
     * @control
     */
    ui.Signature = core.inherits(
        ui.Control,
        'ui-signature',
        function (el, options) {
            ui.Control.call(this, el, options);
            this._oCtx = el.getContext('2d');
        },
        {
            /**
             * @override
             */
            $activate: function (event) {
                ui.Control.prototype.$activate.call(this, event);
                this._bDraw = true;
                this._oCtx.beginPath();

                var el = this.getMain();
                this._oCtx.moveTo((event.pageX - this.getX()) / (this.getClientWidth() / el.width), (event.pageY - this.getY()) / (this.getClientHeight() / el.height));
            },

            /**
             * @override
             */
            $deactivate: function (event) {
                ui.Control.prototype.$deactivate.call(this, event);
                this._bDraw = false;
            },

            /**
             * @override
             */
            $mousemove: function (event) {
                ui.Control.prototype.$mousemove.call(this, event);
                if (this._bDraw) {
                    var el = this.getMain();
                    this._oCtx.lineTo((event.pageX - this.getX()) / (this.getClientWidth() / el.width), (event.pageY - this.getY()) / (this.getClientHeight() / el.height));
                    this._oCtx.stroke();
                }
            },

            /**
             * 清除签名
             */
            clear: function () {
                var el = this.getMain();
                this._oCtx.fillStyle = dom.getStyle(el, 'backgroundColor');
                this._oCtx.fillRect(0, 0, el.width, el.height);
                this._oCtx.fillStyle = '#000000';
            },

            /**
             * @override
             */
            init: function () {
                var el = this.getMain();
                el.width = this.getClientWidth();
                el.height = this.getClientHeight();
                this.clear();
            },

            /**
             * 生成基于URL处理的图片数据
             *
             * @return {String} 图片的URL字符串
             */
            toDataURL: function () {
                return this.getMain().toDataURL();
            }
        }
    );
})();
