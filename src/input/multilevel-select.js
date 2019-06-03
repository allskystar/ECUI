/*
@example
<div ui="type:multilevel-select">
    <select name="province"></select>
    <select name="city"></select>
</div>
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
            SUPER_OPTIONS: {
                inputType: 'hidden'
            },

            private: {
                selects: undefined
            },

            /**
             * 下拉框部件。
             * @unit
             */
            Select: core.inherits(
                ui.Select,
                function (el, options) {
                    _super(el, options);
                    this.url = options.url;
                },
                {
                    private: {
                        children: undefined
                    },

                    /**
                     * 选项部件。
                     * @unit
                     */
                    Item: core.inherits(
                        ui.Select.prototype.Item,
                        function (el, options) {
                            _super(el, options);
                            this.children = options.children;
                        },
                        {
                            /**
                             * @override
                             */
                            $dispose: function () {
                                if (this.children && ui.Item.isInstance(this.children[0]) && !this.children[0].getParent()) {
                                    this.children.forEach(function (item) {
                                        item.dispose();
                                    });
                                }
                                _super.$dispose();
                            }
                        }
                    ),

                    /**
                     * @override
                     */
                    $change: function (event) {
                        _super.$change(event);
                        core.dispatchEvent(this.getParent(), 'change', event);
                    },

                    /**
                     * @override
                     */
                    setSelected: function (item) {
                        _super.setSelected(item);

                        var parent = this.getParent(),
                            index = parent.selects.indexOf(this);

                        parent.$setValue(this.getValue());

                        if (item) {
                            var select = parent.selects[++index];
                            if (item.children) {
                                if (select) {
                                    select.removeAll();
                                    if (ui.Item.isInstance(item.children[0])) {
                                        select.add(item.children);
                                    } else {
                                        core.dispatchEvent(parent, 'request', {data: item.children, owner: select});
                                        select.add(item.children);
                                        item.children = select.getItems();
                                    }
                                }
                            } else if (select) {
                                if (select.url) {
                                    var args = [select.url];
                                    parent.selects.forEach(function (item) {
                                        args.push(item.getValue());
                                    });

                                    select.removeAll();

                                    var selected = this.getSelected(),
                                        currSelect = select;
                                    core.request(
                                        util.stringFormat.apply(null, args),
                                        function (data) {
                                            if (selected === this.getSelected()) {
                                                currSelect.removeAll();
                                                core.dispatchEvent(parent, 'request', {data: data, owner: currSelect});
                                                currSelect.add(data);
                                                item.children = currSelect.getItems();
                                                currSelect.setValue(currSelect.getValue());
                                            }
                                        }.bind(this)
                                    );
                                }
                            }
                        }

                        // 清除后续多级联动项
                        for (; select = parent.selects[++index]; ) {
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
            $ready: function () {
                _super.$ready();

                var el = this.getMain();
                this.selects = [];
                dom.toArray(el.all || el.getElementsByTagName('*')).forEach(
                    function (item) {
                        if (item.getControl) {
                            item = item.getControl();
                            if (ui.Select.isInstance(item) && this.selects.indexOf(item) < 0) {
                                this.selects.push(item);
                            }
                        } else if (item.tagName === 'SELECT') {
                            item.className += this.Select.CLASS;
                            item = core.$fastCreate(this.Select, item, this, core.getOptions(item));
                            this.selects.push(item);
                        }
                    },
                    this
                );
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
                return this.selects[index] || null;
            },

            /**
             * 设置多级联动的数据。
             * @public
             *
             * @param {object} data 多级联动数据，是一个数组，每一项都包含code,value属性，children属性可以不包含，如果包含，结构与data相同
             */
            setData: function (data) {
                this.selects.forEach(function (item) {
                    item.removeAll(true);
                });
                core.dispatchEvent(this, 'request', {data: data, owner: this.selects[0]});
                this.selects[0].add(data);
            },

            /**
             * 设置初始值，注意如果是动态获取数据的多级联动组件需要重新实现此方法。
             * @public
             *
             * @param {string} value 多级联动数据
             */
            setValue: function (value) {
                function find(items) {
                    for (var i = 0, item; item = items[i++]; ) {
                        if (ui.Select.prototype.Item.isInstance(item) ? item.getValue() === value : item.value === value) {
                            result.push(value);
                            return true;
                        }
                        if (item.children && find(item.children)) {
                            result.push(ui.Select.prototype.Item.isInstance(item) ? item.getValue() : item.value);
                            return true;
                        }
                    }
                }

                var result = [];
                _super.setValue(value);
                find(this.selects[0].getItems());
                result.reverse().forEach(
                    function (value, index) {
                        this.selects[index].setValue(value);
                    },
                    this
                );
            }
        }
    );
//{if 0}//
}());
//{/if}//
