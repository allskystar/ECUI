/*
@example
<canvas ui="type:signature"></canvas>

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
    function toPointer(signature, method, event) {
        var el = signature.getMain();
        signature._oCtx[method]((event.pageX - signature.getX()) / (signature.getClientWidth() / el.width), (event.pageY - signature.getY()) / (signature.getClientHeight() / el.height));
    }

    /**
     * 签名控件。
     * @control
     */
    ui.Signature = core.inherits(
        ui.Control,
        'ui-signature',
        function (el, options) {
            _super(el, options);
            this._oCtx = el.getContext('2d');
        },
        {
            /**
             * @override
             */
            $activate: function (event) {
                _super.$activate(event);
                this._bDraw = true;
                this._oCtx.beginPath();
                toPointer(this, 'moveTo', event);
            },

            /**
             * @override
             */
            $deactivate: function (event) {
                _super.$deactivate(event);
                delete this._bDraw;
            },

            /**
             * @override
             */
            $mousemove: function (event) {
                _super.$mousemove(event);
                if (this._bDraw) {
                    toPointer(this, 'lineTo', event);
                    this._oCtx.stroke();
                }
            },

            /**
             * 移出时需要结束绘制，否则从另一面移入会导致额外的连线。
             * @override
             */
            $mouseout: function (event) {
                _super.$mouseout(event);
                if (this._bDraw) {
                    this._bDraw = false;
                }
            },

            /**
             * 移入时重新设置绘制起始位置。
             * @override
             */
            $mouseover: function (event) {
                _super.$mouseover(event);
                if (this._bDraw === false) {
                    this._bDraw = true;
                    toPointer(this, 'moveTo', event);
                }
            },

            /**
             * @override
             */
            $ready: function () {
                _super.$ready();
                var el = this.getMain();
                el.width = this.getClientWidth();
                el.height = this.getClientHeight();
                this.clear();
            },

            /**
             * 清除签名
             */
            clear: function () {
                var el = this.getMain();
                this._oCtx.clearRect(0, 0, el.width, el.height);
                this._oCtx.fillStyle = dom.getStyle(el, 'backgroundColor');
                this._oCtx.fillRect(0, 0, el.width, el.height);
                this._oCtx.fillStyle = dom.getStyle(el, 'color');
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
