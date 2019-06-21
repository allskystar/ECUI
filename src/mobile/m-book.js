/*
@example
<div ui="type:m-book">
    <strong>A</strong>
    <div>安徽</div>
    <strong>B</strong>
    <div>北京</div>
    <strong>C</strong>
    <div>重庆</div>
    <strong>F</strong>
    <div>福建</div>
    <strong>G</strong>
    <div>广东</div>
    <div>甘肃</div>
    <div>广西</div>
    <div>贵州</div>
    <strong>H</strong>
    <div>河北</div>
    <div>湖北</div>
    <div>黑龙江</div>
    <div>河南</div>
    <div>湖南</div>
    <strong>J</strong>
    <div>吉林</div>
    <div>江苏</div>
    <div>江西</div>
    <strong>L</strong>
    <div>辽宁</div>
    <strong>N</strong>
    <div>内蒙古</div>
    <div>宁夏</div>
    <strong>S</strong>
    <div>四川</div>
    <div>山东</div>
    <div>上海</div>
    <div>山西</div>
    <div>陕西</div>
    <strong>T</strong>
    <div>天津</div>
    <strong>X</strong>
    <div>新疆</div>
    <div>西藏</div>
    <strong>Y</strong>
    <div>云南</div>
    <strong>Z</strong>
    <div>浙江</div>
</div>

@fields
_cSelected - 当前被选中的标签
_aLabel    - 标签信息数组
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    function setSelected(book, item) {
        if (book._cSelected !== item) {
            book._cSelected = item;
            core.dispatchEvent(book, 'change', {item: item});
        }
    }

    /**
     * 移动端书册控件。
     * @control
     */
    ui.MBook = core.inherits(
        ui.MPanel,
        'ui-mobile-book',
        [
            function () {
                this._aLabel = [];
                dom.children(this.getBody()).forEach(
                    function (item) {
                        if (item.tagName === 'STRONG') {
                            this._aLabel.push({
                                el: item
                            });
                        }
                    },
                    this
                );
            }
        ],
        {
            /**
             * @override
             */
            $cache: function (style) {
                ui.MPanel.prototype.$cache.call(this, style);
                this._aLabel.forEach(function (item) {
                    item.top = item.el.offsetTop;
                    item.height = item.el.offsetHeight;
                });
            },

            /**
             * @override
             */
            $dispose: function () {
                this._aLabel = null;
                ui.MPanel.prototype.$dispose.call(this);
            },

            /**
             * @override
             */
            $initStructure: function (width, height) {
                ui.MPanel.prototype.$initStructure.call(this, width, height);
                this.setScrollRange({top: -this._aLabel[this._aLabel.length - 1].top});
            },

            /**
             * @override
             */
            $ready: function (options) {
                ui.MPanel.prototype.$ready.call(this, options);
                setSelected(this, this._aLabel[0]);
            },

            /**
             * @override
             */
            $restoreStructure: function () {
                ui.MPanel.prototype.$restoreStructure.call(this);
                this._aLabel.forEach(function (item) {
                    item.el.style.transform = '';
                });
            },

            /**
             * 移动到指定名称的书签。
             *
             * @param {string} name 书签名称
             */
            moveTo: function (name) {
                for (var i = 0, item; item = this._aLabel[i++]; ) {
                    if (item.el.innerHTML === name) {
                        this.setPosition(0, -item.top);
                        break;
                    }
                }
            },

            /**
             * @override
             */
            setPosition: function (x, y) {
                ui.MPanel.prototype.setPosition.call(this, x, y);
                for (var selected = this._aLabel[0], i = 1, next; next = this._aLabel[i++]; ) {
                    if (next.top > -y) {
                        break;
                    }
                    selected = next;
                }

                this._aLabel.forEach(function (item) {
                    item.el.style.transform = next && item === selected ? 'translate(0px,' + Math.min(-y - item.top, next.top - item.top - selected.height) + 'px)' : '';
                });

                setSelected(this, selected);
            }
        }
    );
}());
