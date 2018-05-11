/*
@example
<ul ui="type:m-select;option-size:7;value:2">
  <li>1</li>
  <li>2</li>
  ...
</ul>
或
<div ui="type:m-select;option-size:7;values:1-12;value:2"></div>

@fields
_nRadius       - 上下元素数量
_nItemHeight   - 单个选项高度
_nNormalTop    - 正常顶部坐标
_nMinTop       - 滚动时的最小顶部坐标
_nNormalBottom - 正常底部坐标
_nMaxBottom    - 滚动时的最大底部坐标
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    function setSelected(select, item) {
        if (select._cSelected !== item) {
            if (select._cSelected) {
                select._cSelected.alterClass('-selected');
                select._cSelected = null;
            }
            if (item) {
                item.alterClass('+selected');
                select._cSelected = item;
            }
        }
    }

    /**
     * 移动端下拉框控件。
     * options 属性：
     * option-size  最大显示的选项数量，需要奇数
     * values       数值型选项缩写，第1项表示开始的数字，第2项表示结束的数字，第3项表示累计值
     * value        默认选中的值
     * @control
     */
    ui.MSelect = core.inherits(
        ui.MScroll,
        'ui-mobile-select',
        function (el, options) {
            ui.MScroll.call(this, el, options);

            var values = options.values;

            if (values) {
                if ('string' === typeof values) {
                    values = values.split(/[\-,]/);
                }
                values[0] = +values[0];
                values[1] = +values[1];
                if (values[2]) {
                    values[2] = +values[2];
                } else {
                    values[2] = 1;
                }
                for (var i = values[0], ret = [];; i += values[2]) {
                    ret.push('<div>' + i + '</div>');
                    if (i === values[1]) {
                        break;
                    }
                }
                this.setContent(ret.join(''));
            }
            dom.insertBefore(dom.create({
                className: options.classes.join('-mask ')
            }), this.getBody());

            this._nRadius = Math.floor(options.optionSize / 2);
        },
        {
            /**
             * 移动端下拉框选项控件。
             * @control
             */
            Item: core.inherits(
                ui.Item,
                'ui-mobile-select-item'
            ),

            /**
             * @override
             */
            $alterItems: function () {
                var top = this._nNormalTop = -this._nItemHeight * (this.getLength() - this._nRadius - 1),
                    bottom = this._nNormalBottom = this._nItemHeight * this._nRadius;

                this.setScrollRange(
                    {
                        top: this._nMinTop = top - this._nItemHeight * 2,
                        right: 0,
                        bottom: this._nMaxBottom = bottom + this._nItemHeight * 2,
                        left: 0
                    }
                );
                this.setRange({
                    top: top,
                    bottom: bottom,
                    stepY: this._nItemHeight
                });

                if (!this.isReady()) {
                    // 控件初始化时设置的显示位置
                    this.getBody().style.top = (bottom + this._nItemHeight) + 'px';
                }
            },

            /**
             * @override
             */
            $cache: function (style, cacheSize) {
                ui.MScroll.prototype.$cache.call(this, style, cacheSize);
                this._nItemHeight = this.getItem(0).getMain().offsetHeight;
            },

            /**
             * 拖拽的惯性时间计算。
             * @protected
             *
             * @param {Object} speed 速度对象，x/y 值分别表示 x/y 方向上的速度分量
             */
            $draginertia: function (speed) {
                speed = speed.y;
                if (!speed) {
                    return 0;
                }

                var y = util.toNumber(this.getBody().style.top),
                    sy = speed * 0.5 / 2,  // 计划0.5秒动画结束
                    expectY = Math.round(y + sy);

                if (expectY < this._nNormalTop) {
                    expectY = Math.max(this._nMinTop, expectY);
                } else if (expectY > this._nNormalBottom) {
                    expectY = Math.min(this._nMaxBottom, expectY);
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
                ui.MScroll.prototype.$dragmove.call(this, event);
                setSelected(this, this.getItem(Math.round(-event.y / this._nItemHeight) + this._nRadius));
            },

            /**
             * @override
             */
            $initStructure: function (width, height) {
                height = this._nItemHeight * (this._nRadius * 2 + 1);
                this.getMain().style.height = height + 'px';
                ui.MScroll.prototype.$initStructure.call(this, width, height);
            },

            /**
             * @override
             */
            $ready: function (event) {
                ui.MScroll.prototype.$ready.call(this, event);
                this.setValue(event.options.value);
            },

            /**
             * @override
             */
            $resize: function () {
                ui.MScroll.prototype.$resize.call(this);
                this.getMain().style.height = '';
            },

            /**
             * 获取选中的值。
             * @public
             *
             * @return {string} 选中的值
             */
            getValue: function () {
                return this._cSelected ? this._cSelected.getContent() : null;
            },

            /**
             * 设置选中的值。
             * @public
             *
             * @param {string} value 选中的值
             */
            setValue: function (value) {
                if (value !== undefined) {
                    value = String(value);
                    for (var i = 0, items = this.getItems(); i < items.length; i++) {
                        if (items[i].getContent() === value) {
                            setSelected(this, items[i]);
                            this.getBody().style.top = (this._nNormalBottom - this._nItemHeight * i) + 'px';
                            return;
                        }
                    }
                }
                setSelected(this, null);
                this.getBody().style.top = (this._nNormalBottom + this._nItemHeight) + 'px';
            }
        },
        ui.Items
    );
}());
