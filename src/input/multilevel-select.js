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
        {
            /**
             * 下拉框部件。
             * @unit
             */
            Select: core.inherits(
                ui.Select,
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
                                    if (item._aChildren[0] instanceof ui.Item) {
                                        select.add(item._aChildren);
                                    } else {
                                        core.dispatchEvent(parent, 'request', {data: item._aChildren, owner: select});
                                        select.add(item._aChildren);
                                        item._aChildren = select.getItems();
                                    }
                                }
                            } else if (select) {
                                var args = [dom.getAttribute(select.getMain(), 'href')];
                                if (args[0]) {
                                    parent._aSelect.forEach(function (item) {
                                        args.push(item.getValue());
                                    });

                                    select.removeAll();

                                    var selected = this.getSelected(),
                                        currSelect = select;
                                    core.request(util.stringFormat.apply(null, args), function (data) {
                                        if (selected === this.getSelected()) {
                                            currSelect.removeAll();
                                            core.dispatchEvent(parent, 'request', {data: data, owner: currSelect});
                                            currSelect.add(data);
                                            item._aChildren = currSelect.getItems();
                                            currSelect.setValue(currSelect.getValue());
                                        }
                                    }.bind(this));
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
             * @override
             */
            $ready: function (event) {
                ui.InputControl.prototype.$ready.call(this, event);

                var el = this.getMain();
                this._aSelect = [];
                Array.prototype.slice.call(el.all || el.getElementsByTagName('*')).forEach(function (item) {
                    if (item.getControl) {
                        item = item.getControl();
                        if (item instanceof ui.Select && this._aSelect.indexOf(item) < 0) {
                            this._aSelect.push(item);
                        }
                    } else if (item.tagName === 'SELECT') {
                        var href = dom.getAttribute(item, 'href');
                        item.className += this.Select.CLASS;
                        item = core.$fastCreate(this.Select, item, this, core.getOptions(item));
                        item.getMain().setAttribute('href', href);
                        this._aSelect.push(item);
                    }
                }, this);
            },

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
