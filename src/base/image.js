/*
@example
<img ui="type:image">

@fields
_nMinWidth 原始的宽度
_nRatio    原始的宽高比例
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    /**
     * 图片加载事件。
     * @private
     */
    function load(event) {
        var control = event.target.getControl();
        control._nMinWidth = event.target.width;
        control._nRatio = event.target.height / event.target.width;
        dom.removeEventListener(this, 'load', load);
        if (control.isReady()) {
            control.cache();
        }
    }

    /**
     * 图片控件。
     * 图片控件支持使用滚轮直接缩放图片的大小。
     * @control
     */
    ui.Image = core.inherits(
        ui.Control,
        'ui-image',
        function (el, options) {
            ui.Control.call(this, el, options);
            if (el.width) {
                load({target: el});
            } else {
                dom.addEventListener(el, 'load', load);
            }
        },
        {
            /**
             * @override
             */
            $activate: function (event) {
                ui.Control.prototype.$activate.call(this, event);
                core.drag(
                    this,
                    event,
                    {
                        absolute: true
                    }
                );
            },

            /**
             * @override
             */
            $cache: function (style) {
                ui.Control.prototype.$cache.call(this, style);
                this._nCenterX = ui.Control.prototype.getX.call(this) + this.getWidth() / 2;
                this._nCenterY = ui.Control.prototype.getY.call(this) + this.getHeight() / 2;
            },

            /**
             * @override
             */
            $mousewheel: function (event) {
                ui.Control.prototype.$mousewheel.call(this, event);
                var delta = event.deltaY,
                    width = Math.max(this._nMinWidth, this.getWidth() - delta * 2);

                this.setSize(width, Math.round(width * this._nRatio));
                this.setPosition(this.getX(), this.getY());

                event.preventDefault();
            },

            /**
             * @override
             */
            getX: function () {
                return this._nCenterX;
            },

            /**
             * @override
             */
            getY: function () {
                return this._nCenterY;
            },

            /**
             * @override
             */
            setPosition: function (x, y) {
                this._nCenterX = x;
                this._nCenterY = y;
                ui.Control.prototype.setPosition.call(this, Math.round(x - this.getWidth() / 2), Math.round(y - this.getHeight() / 2));
            }
        }
    );
}());
