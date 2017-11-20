/*
multilevel-select - 多级联动下拉框控件。
多级联动下拉框控件，继承自基础控件，内部包含的下拉框能够对指定的数据集合进行多级联动。

多级联动下拉框控件直接HTML初始化的例子:
<div ui="type:multilevel-select">
    <select name="province"></select>
    <select name="city"></select>
</div>

属性
_aSelect - 全部的下拉框控件列表
*/
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui;
//{/if}//
    /**
     * 初始化多级联动下拉框控件。
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.MultilevelSelect = core.inherits(
        ui.Control,
        function (el, options) {
            ui.Control.call(this, el, options);

            this._aSelect = [];
            Array.prototype.slice.call(el.getElementsByTagName('SELECT')).forEach(function (item) {
                item.className += this.Select.CLASS;
                this._aSelect.push(core.$fastCreate(this.Select, item, this));
            }, this);
        },
        {
            /**
             * 控件的下拉框部件。
             * @public
             */
            Select: core.inherits(
                ui.Select,
                {
                    /**
                     * 控件的选项部件。
                     * @public
                     */
                    Item: core.inherits(
                        ui.Select.prototype.Item,
                        function (el, options) {
                            ui.Select.prototype.Item.call(this, el, options);
                            this._aChildren = options.children;
                        }
                    ),

                    /**
                     * @override
                     */
                    $change: function (event) {
                        ui.Select.prototype.$change.call(this, event);

                        var selected = this.getSelected(),
                            selects = this.getParent()._aSelect,
                            index = selects.indexOf(this),
                            item;

                        if (selected._aChildren) {
                            item = selects[++index];
                            item.removeAll();
                            item.add(selected._aChildren);
                            if (!(selected._aChildren[0] instanceof ui.Item)) {
                                selected._aChildren = item.getItems();
                            }
                        }

                        // 清除后续多级联动项
                        for (; item = selects[++index]; ) {
                            item.removeAll();
                        }
                    }
                }
            ),

            /**
             * 获取指定的下拉框对象。
             * @public
             *
             * @param {number} index 下拉框对象的序号
             * @return {ecui.ui.Select} 下拉框对象，如果不存在返回null
             */
            getSelect: function (index) {
                return this._aSelect[index] || null;
            },

            /**
             * 设置多级联动的数据。
             * @public
             *
             * @param {Object} data 多级联动数据，是一个数组，每一项都包含code,value属性，children属性可以不包含，如果包含，结构与data相同
             */
            setData: function (data) {
                this._aSelect.forEach(function (item) {
                    item.removeAll(true);
                });
                this._aSelect[0].add(data);
            }
        }
    );
//{if 0}//
}());
//{/if}//
