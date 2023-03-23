//{if $css}//
ecui.__ControlStyle__('\
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
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//

    function getItems(options) {
        return options.getItems().filter(function (item) {
            return item.isShow();
        });
    }

//{if 0}//
    function setPosition(item) {
//{/if}//
//{capture assign="MOptions_setPosition"}//
        this.setPosition(0, this._nItemHeight * this._nOptionSize - (item ? item.getMain().offsetTop : 0));
//{/capture}//
//{if 0}//
    }
//{/if}//

    /**
     * 移动端选项框接口。支持类似Select的选择交互。
     * @interface
     */
    ui.iMOptions = core.interfaces('MOptions', [ui.Control.defineProperty('selecting'), ui.iItems, ui.iMScroll], {
        constructor: function (el) {
            dom.addClass(el, 'ui-mobile-options');
            var body = this.getBody();
            body.insertAdjacentHTML('beforeBegin', '<div class="' + this.getUnitClass(ui.Control, 'mask') + ' ui-mobile-options-mask"></div><div class="' + this.getUnitClass(ui.Control, 'view') + ' ui-mobile-options-view"><div></div></div>');
            this._eView = body.previousSibling;
            this._eMask = this._eView.previousSibling;
        },


        initView: function () {
            var height = this._nItemHeight * (this._nOptionSize * 2 + 1);
            this.setSize(undefined, height + this.getMinimumHeight());
            this._eView.style.top = this._nItemHeight * this._nOptionSize + 'px';
            this._eView.style.height = this._nItemHeight + 'px';
        },

        /**
         * 选项控件发生变化的处理。
         * @protected
         */
        $alterItems: function () {
            var top = -this._nItemHeight * (getItems(this).length - this._nOptionSize - 1),
                bottom = this._nItemHeight * this._nOptionSize;
            this.setScrollRange(
                {
                    top: top - this._nItemHeight * 2,
                    right: 0,
                    bottom: bottom + this._nItemHeight * 2,
                    left: 0
                }
            );
            this.setRange({
                top: top,
                bottom: bottom,
                stepY: this._nItemHeight
            });
        },

        /**
         * @override
         */
        $cache: function (style) {
            _class.$cache(style);
            this._nItemHeight = this._eView.firstChild.firstElementChild.offsetHeight;
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

            var y = dom.toPixel(this.getBody().style.top),
                sy = speed * 0.5 / 2,  // 计划0.5秒动画结束
                expectY = Math.round(y + sy),
                scrollRange = this.getScrollRange(),
                range = this.getRange();

            if (expectY < range.top) {
                expectY = Math.max(scrollRange.top, expectY);
            } else if (expectY > range.bottom) {
                expectY = Math.min(scrollRange.bottom, expectY);
            } else {
                expectY = Math.round(expectY / this._nItemHeight) * this._nItemHeight;
            }
            //计算实际结束时间
            return (expectY - y) * 2 / speed;
        },

        /**
         * @override
         */
        $dragmove: function (event) {
            _class.$dragmove(event);
            this.setSelecting(getItems(this)[Math.round(-event.y / this._nItemHeight) + this._nOptionSize]);
        },

        /**
         * @override
         */
        $ready: function () {
            _class.$ready();
            this.initView();
        },

        /**
         * @override
         */
        $show: function (event) {
            _class.$show(event);
            var item = this.getSelected() || this.getItem(0);
            this.setSelecting(item);
//{if 0}//
            setPosition.call(this, item);
//{else}//
//{$MOptions_setPosition}//
//{/if}//
        },

        /**
         * @override
         */
        alterItems: function () {
            this._eView.firstChild.innerHTML = this.getLength() ? this.getBody().innerHTML : '<div class="' + this.getUnitClass(this.constructor, 'item') + ' ui-empty">&lt; 无 &gt;</div>';
            _class.alterItems();
        },

        /**
         * 获取下拉框选项高度。
         * @public
         *
         * @return {number} 下拉框选项高度
         */
        getItemHeight: function () {
            return this._nItemHeight;
        },

        /**
         * 获取下拉框允许显示的选项数量，实际显示的数量是这个值乘以2加1。
         * @public
         *
         * @param {number} 显示的选项数量，必须大于 1
         */
        getOptionSize: function () {
            return this._nOptionSize;
        },

        /**
         * 设置下拉框允许显示的选项数量，实际显示的数量是这个值乘以2加1。
         * @public
         *
         * @param {number} value 显示的选项数量，必须大于 1
         */
        setOptionSize: function (value) {
            this._nOptionSize = value;
            if (this.isReady() && this.isShow()) {
                this.initView();
            }
        },

        /**
         * @override
         */
        setPosition: function (x, y) {
            _class.setPosition(x, y);
            this._eMask.style.top = this.getMain().scrollTop + 'px';
            this._eView.firstChild.className = this.getBody().className;
            this._eView.firstChild.style.transform = 'translate3d(0px,' + (y - this._nItemHeight * this._nOptionSize) + 'px,0px)';
        },

        /**
         * @override
         */
        setSelected: function (item) {
            _class.setSelected(item);
            if (this.isShow()) {
//{if 0}//
                setPosition.call(this, item);
//{else}//
//{$MOptions_setPosition}//
//{/if}//
            }
        }
    });
})();
