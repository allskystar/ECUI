//{if $css}//
__ControlStyle__('\
.ui-mobile-options {\
    .m-width100rate();\
\
    .ui-mobile-options-mask {\
        position: absolute !important;\
        .m-width100rate();\
        z-index: 2 !important;\
        height: 100% !important;\
        pointer-events: none !important;\
    }\
\
    .ui-mobile-options-view {\
        position: absolute;\
        overflow: hidden;\
        z-index: 1;\
        width: 100%;\
    }\
}\
');
//{/if}//
/*
选项框操作集合。
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    function getItems(options) {
        return dom.children(options.getBody()).map(function (item) {
            return item.getControl();
        }).filter(function (item) {
            return item.isShow();
        });
    }

    ui.MOptions = core['interface']('MOptions', [ui.Control.defineProperty('selected'), ui.MScroll], {
        constructor: function (el) {
            dom.addClass(el, 'ui-mobile-options');
            var body = this.getBody();
            dom.insertHTML(body, 'beforeBegin', '<div class="' + this.getUnitClass(ui.Control, 'mask') + ' ui-mobile-options-mask"></div><div class="' + this.getUnitClass(ui.Control, 'view') + ' ui-mobile-options-view"><div></div></div>');
            this.$MOptionsData.view = body.previousSibling;
            this.$MOptionsData.mask = this.$MOptionsData.view.previousSibling;
        },

        /**
         * 选项控件发生变化的处理。
         * @protected
         */
        $alterItems: function () {
            var top = -this.$$itemHeight * (getItems(this).length - this._nOptionSize - 1),
                bottom = this.$$itemHeight * this._nOptionSize;

            this.setScrollRange(
                {
                    top: top - this.$$itemHeight * 2,
                    right: 0,
                    bottom: bottom + this.$$itemHeight * 2,
                    left: 0
                }
            );
            this.setRange({
                top: top,
                bottom: bottom,
                stepY: this.$$itemHeight
            });

            this.$MOptionsData.view.firstChild.innerHTML = this.getBody().innerHTML;
            this.$MOptionsData.view.style.top = this.$$itemHeight * this._nOptionSize + 'px';
            this.$MOptionsData.view.style.height = this.$$itemHeight + 'px';
        },

        /**
         * @override
         */
        $cache: function (style) {
/*ignore*/
            this.$MOptions.$cache.call(this, style);
/*end*/
            this.$$itemHeight = util.toNumber(dom.getStyle(style, 'item-height'));
        },

        /**
         * 拖拽的惯性时间计算。
         * @protected
         *
         * @param {object} speed 速度对象，x/y 值分别表示 x/y 方向上的速度分量
         */
        $draginertia: function (speed) {
            speed = speed.y;
            if (!speed) {
                return 0;
            }

            var y = util.toNumber(this.getBody().style.top),
                sy = speed * 0.5 / 2,  // 计划0.5秒动画结束
                expectY = Math.round(y + sy),
                scrollRange = this.getScrollRange(),
                range = this.getRange();

            if (expectY < range.top) {
                expectY = Math.max(scrollRange.top, expectY);
            } else if (expectY > range.bottom) {
                expectY = Math.min(scrollRange.bottom, expectY);
            } else {
                expectY = Math.round(expectY / this.$$itemHeight) * this.$$itemHeight;
            }
            //计算实际结束时间
            return (expectY - y) * 2 / speed;
        },

        /**
         * @override
         */
        $dragmove: function (event) {
/*ignore*/
            this.$MOptions.$dragmove.call(this, event);
/*end*/
            this.setSelected(getItems(this)[Math.round(-event.y / this.$$itemHeight) + this._nOptionSize]);
        },

        /**
         * @override
         */
        $show: function () {
/*ignore*/
            this.$MOptions.$show.call(this);
/*end*/
            var height = this.$$itemHeight * (this._nOptionSize * 2 + 1);
            dom.parent(this.getBody()).style.height = height + 'px';
            this.$$height = height + this.getMinimumHeight();
        },

        /**
         * 设置下拉框允许显示的选项数量。
         * @public
         *
         * @param {number} value 显示的选项数量，必须大于 1
         */
        setOptionSize: function (value) {
            this._nOptionSize = value;
        },

        /**
         * @override
         */
        setPosition: function (x, y) {
/*ignore*/
            this.$MOptions.setPosition.call(this, x, y);
/*end*/
            this.$MOptionsData.mask.style.top = this.getMain().scrollTop + 'px';
            this.$MOptionsData.view.firstChild.className = this.getBody().className;
            this.$MOptionsData.view.firstChild.style.transform = 'translate3d(0px,' + (y - this.$$itemHeight * this._nOptionSize) + 'px,0px)';
        }
    });
})();
