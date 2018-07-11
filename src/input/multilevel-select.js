/*
@example
<div ui="type:multilevel-select">
    <select name="province"></select>
    <select name="city"></select>
</div>

@fields
_aSelect - 全部的下拉框控件列表
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 多级联动下拉框控件。
     * @control
     */
    ui.MultilevelSelect = core.inherits(
        ui.InputControl,
        function (el, options) {
            ui.InputControl.call(this, el, options);

            this._aSelect = [];
            Array.prototype.slice.call(el.getElementsByTagName('SELECT')).forEach(function (item) {
                item.className += this.Select.CLASS;
                this._aSelect.push(core.$fastCreate(this.Select, item, this));
            }, this);
        },
        {
            /**
             * 下拉框部件。
             * @unit
             */
            Select: core.inherits(
                ui.Select,
                function (el, options) {
                    this._sUrl = dom.getAttribute(el, 'href');
                    ui.Select.call(this, el, options);
                },
                {
                    /**
                     * 选项部件。
                     * @unit
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
                        core.dispatchEvent(this.getParent(), 'change', event);
                    },

                    /**
                     * @override
                     */
                    setSelected: function (item) {
                        ui.Select.prototype.setSelected.call(this, item);

                        var parent = this.getParent(),
                            index = parent._aSelect.indexOf(this);

                        parent.$setValue(this.getValue());

                        if (item) {
                            var select = parent._aSelect[++index];
                            if (item._aChildren) {
                                if (select) {
                                    select.removeAll();
                                    select.add(item._aChildren);
                                    if (!(item._aChildren[0] instanceof ui.Item)) {
                                        item._aChildren = select.getItems();
                                    }
                                }
                            } else if (select) {
                                var args = [select._sUrl];
                                if (args[0]) {
                                    parent._aSelect.forEach(function (item) {
                                        args.push(item.getValue());
                                    });

                                    select = parent._aSelect[++index];
                                    select.removeAll();
                                    core.request(util.stringFormat.apply(null, args), function (data) {
                                        select.add(data);
                                        item._aChildren = select.getItems();
                                    });
                                }
                            }
                        }

                        // 清除后续多级联动项
                        for (; select = parent._aSelect[++index]; ) {
                            select.removeAll();
                        }
                    }
                }
            ),

            /**
             * 选项变化事件。
             * @event
             */
            $change: util.blank,

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
             * @param {object} data 多级联动数据，是一个数组，每一项都包含code,value属性，children属性可以不包含，如果包含，结构与data相同
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
