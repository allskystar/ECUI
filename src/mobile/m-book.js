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
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    /**
     * 移动端书册控件。
     * @control
     */
    ui.MBook = core.inherits(
        ui.MPanel,
        'ui-mobile-book',
        {
            /**
             * @override
             */
            $cache: function (style) {
                _super.$cache(style);
                this._aLabel = [];
                dom.children(this.getBody()).forEach(
                    function (item) {
                        if (item.tagName === 'STRONG') {
                            this._aLabel.push({
                                el: item,
                                top: item.offsetTop,
                                height: item.offsetHeight
                            });
                        }
                    },
                    this
                );
            },

            /**
             * @override
             */
            $dispose: function () {
                _super.$dispose();
                this._aLabel = this._cSelected = null;
            },

            /**
             * 移动到指定名称的书签。
             *
             * @param {string} name 书签名称
             */
            moveTo: function (name) {
                for (var i = 0, item; (item = this._aLabel[i++]);) {
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
                _super.setPosition(x, y);
                for (var top = this.getBody().scrollHeight, selected = this._aLabel[0], i = 1, next; (next = this._aLabel[i++]);) {
                    if (next.top > -y) {
                        top = next.top;
                        break;
                    }
                    selected = next;
                }
                selected.el.style.transform = 'translate(0px,' + Math.min(-y - selected.top, top - selected.top - selected.height) + 'px)';

                if (this._cSelected !== selected) {
                    if (this._cSelected) {
                        this._cSelected.el.style.transform = '';
                    }
                    this._cSelected = selected;
                    core.dispatchEvent(this, 'change', {item: selected});
                }
            }
        }
    );
//{if 0}//
})();
//{/if}//
