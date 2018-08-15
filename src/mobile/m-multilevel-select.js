/*
@example
<div ui="type:m-multilevel-select">
    <ul name="province"></ul>
    <ul name="city"></ul>
</div>

@fields
_aSelect - 全部的下拉框控件列表
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        effect = core.effect,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 移动端多级联动选择控件。
     * @control
     */
    ui.MMultilevelSelect = core.inherits(
        ui.Control,
        function (el, options) {
            ui.Control.call(this, el, options);

            this._aSelect = [];
            dom.children(el).forEach(function (item, index) {
                item.className += this.Select.CLASS + (index ? 'ui-hide' : '');
                this._aSelect.push(core.$fastCreate(this.Select, item, this));
            }, this);
        },
        {
            /**
             * 选择框部件。
             * @unit
             */
            Select: core.inherits(
                ui.MPanel,
                function (el, options) {
                    ui.MPanel.call(this, el, options);
                    this._sUrl =  dom.getAttribute(el, 'href');
                    this._cSelected = null;
                },
                {
                    /**
                     * 选择框选项部件。
                     * @unit
                     */
                    Item: core.inherits(
                        ui.Item,
                        function (el, options) {
                            ui.Item.call(this, el, options);
                            this._sValue = options.value;
                            this._aChildren = options.children;
                        },
                        {
                            /**
                             * @override
                             */
                            $click: function (event) {
                                ui.Item.prototype.$click.call(this, event);

                                var select = this.getParent(),
                                    multi = select.getParent(),
                                    parent = multi.getParent(),
                                    items = [];

                                if (parent && multi._aSelect.indexOf(select) === multi._aSelect.length - 1) {
                                    multi._aSelect.forEach(function (item, index) {
                                        if (index) {
                                            item.hide();
                                        }
                                        items.push(item.getSelected());
                                    });
                                    items[items.length - 1] = this;
                                    core.dispatchEvent(parent, 'confirm', {item: this, items: items});
                                } else {
                                    select.setSelected(this);
                                }
                            },

                            /**
                             * 获取选项的值。
                             * @public
                             *
                             * @return {string} 选项的值
                             */
                            getValue: function () {
                                return this._sValue;
                            }
                        }
                    ),

                    $alterItems: util.blank,

                    /**
                     * 设置选中的项。
                     * @public
                     *
                     * @param {ecui.ui.Item} item 选中的项
                     */
                    setSelected: function (item) {
                        item = item || null;
                        if (this._cSelected !== item) {
                            var parent = this.getParent(),
                                index = parent._aSelect.indexOf(this);

                            if (this._cSelected) {
                                this._cSelected.alterStatus('-selected');
                            }
                            if (item) {
                                item.alterStatus('+selected');

                                var select = parent._aSelect[++index];
                                if (item._aChildren) {
                                    if (select) {
                                        select.removeAll();
                                        if (item._aChildren[0] instanceof ui.Item) {
                                            select.add(item._aChildren);
                                        } else {
                                            core.dispatchEvent(parent, 'request', {data: item._aChildren, owner: select});
                                            select.add(item._aChildren);
                                            item._aChildren = select.getItems();
                                        }
                                        select.show();
                                        effect.grade('this.style.left=#100->' + (25 * index) + '%#', 400, { $: select.getOuter() });
                                    }
                                } else if (select) {
                                    var args = [select._sUrl];
                                    if (args[0]) {
                                        parent._aSelect.forEach(function (item) {
                                            args.push(item.getValue());
                                        });

                                        var selected = this.getSelected();
                                        core.request(util.stringFormat.apply(null, args), function (data) {
                                            if (selected === this.getSelected() && !select.getLength()) {
                                                select.removeAll();
                                                core.dispatchEvent(parent, 'request', {data: data, owner: select});
                                                select.add(data);
                                                item._aChildren = select.getItems();
                                                select.show();
                                                effect.grade('this.style.left=#100->' + (25 * index) + '%#', 400, { $: select.getOuter() });
                                            }
                                        });
                                    }
                                }
                            }
                            this._cSelected = item;

                            // 清除后续多级联动项
                            for (; select = parent._aSelect[++index]; ) {
                                select.hide();
                            }
                        }
                    },

                    /**
                     * 获取选中的项。
                     * @public
                     *
                     * @return {ecui.ui.Item} 选中的项
                     */
                    getSelected: function () {
                        return this._cSelected;
                    }
                },
                ui.Items
            ),

            /**
             * 请求返回事件，如果数据需要进行处理，请在此实现。
             * @event
             */
            $request: util.blank,

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
                core.dispatchEvent(this, 'request', {data: data, owner: this._aSelect[0]});
                this._aSelect[0].add(data);
            }
        }
    );
//{if 0}//
}());
//{/if}//