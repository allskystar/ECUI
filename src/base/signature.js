/*
@example
*/
/*ignore*/
/*
@fields
_eContainer      - 容器 DOM 元素
*/
/*end*/
(function () {
    //{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
    //{/if}//

    /**
     * 选项卡控件。
     * 每一个选项卡都包含一个头部区域与容器区域，选项卡控件存在互斥性，只有唯一的一个选项卡能被选中并显示容器区域。
     * options 属性：
     * selected    选中的选项序号，默认为0
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
                this._oCtx.fillStyle = '#000000'
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
}());
    

