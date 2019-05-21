/*
选项组接口，是对选项进行操作的方法的集合，提供了基本的增/删操作，通过将 ecui.ui.Items 对象下的方法复制到类的 prototype 属性下继承接口。
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 选项控件。
     * 用于弹出菜单、下拉框、交换框等控件的单个选项，通常不直接初始化。选项控件必须用在使用选项组接口(Items)的控件中。
     * @control
     */
    ui.Item = core.inherits(
        ui.Control,
        'ui-item',
        {
            /**
             * @override
             */
            $click: function (event) {
                ui.Control.prototype.$click.call(this, event);
                var parent = this.getParent();
                if (parent) {
                    event.item = this;
                    event.index = parent.getItems().indexOf(this);
                    core.dispatchEvent(parent, 'itemclick', event);
                }
            },

            /**
             * @override
             */
            $hide: function (event) {
                ui.Control.prototype.$hide.call(this, event);
                var parent = this.getParent();
                if (parent) {
                    parent.alterItems();
                }
            },

            /**
             * @override
             */
            $show: function (event) {
                ui.Control.prototype.$show.call(this, event);
                var parent = this.getParent();
                if (parent) {
                    parent.alterItems();
                }
            },

            /**
             * 选项控件的父控件必须实现 Items 接口，同时选项控件有父控件时不能设置别的父控件。
             * @override
             */
            setParent: function (parent) {
                var oldParent = this.getParent();
                if (parent) {
                    if (parent.isInstance(ui.Items) && !oldParent) {
                        parent.add(this);
                    }
                } else if (oldParent) {
                    oldParent.remove(this);
                }
            }
        }
    );

    ui.Items = _interface(
        function () {
            this.items = [];

            this.preventAlterItems();

            // 初始化选项控件
            this.add(dom.children(this.getBody()));

            this.premitAlterItems();
        },
        {
            'private': {
                items: undefined,
                prevent: 0
            },

            /**
             * 选项组只允许添加选项控件，添加成功后会自动调用 alterItems 方法。
             * @override
             */
            $append: function (event) {
                // 检查待新增的控件是否为选项控件
                if (event.child instanceof (this.Item || ui.Item)) {
                    if (event.returnValue !== false) {
                        this.items.push(event.child);
                        this.alterItems();
                    }
                }
            },

            /**
             * @override
             */
            $ready: function () {
                if (this.isCached()) {
                    this.alterItems();
                }
            },

            /**
             * 选项组移除子选项后会自动调用 alterItems 方法。
             * @override
             */
            $remove: function (event) {
                core.$clearState(event.child);
                if (event.returnValue !== false) {
                    util.remove(this.items, event.child);
                }
            },

            /**
             * 添加子选项控件。
             * add 方法中如果位置序号不合法，子选项控件将添加在末尾的位置。
             * @public
             *
             * @param {string|Object|HTMLElement|ecui.ui.Item|Array} item 控件的 html 内容/控件的初始化参数对象/控件对应的主元素对象/选项控件/前面四项组合成的数组
             * @param {number} index 子选项控件需要添加的位置序号
             * @return {Array} 子选项控件数组
             */
            add: function (item, index) {
                if (!index || index > this.items.length) {
                    index = this.items.length;
                }
                var items = [],
                    UIClass = this.Item || ui.Item,
                    el = this.items[index] ? this.items[index].getMain() : null,
                    body = this.getBody();

                this.preventAlterItems();

                (item instanceof Array ? item : [item]).forEach(
                    function (item) {
                        if (item instanceof ui.Item) {
                            // 选项控件位于其它items对象中，先进行移除
                            var parent = item.getParent();
                            if (parent && !parent.remove(item)) {
                                // 不允许移除子控件，直接结束
                                return;
                            }
                        } else {
                            // 根据是字符串还是Element对象选择不同的初始化方式
                            if (dom.isElement(item)) {
                                var text = dom.getAttribute(item, core.getAttributeName()),
                                    options = core.getOptions(item) || {};
                                if (options.type) {
                                    item.setAttribute(core.getAttributeName(), text);
                                    options = {};
                                }
                            } else {
                                if ('string' === typeof item) {
                                    options = {};
                                    options[this.TEXTNAME || '#text'] = item;
                                } else {
                                    options = item;
                                }
                                item = dom.create(
                                    {
                                        innerHTML: options[this.TEXTNAME]
                                    }
                                );
                            }

                            options.parent = this;
                            options.primary = UIClass.CLASS;
                            options.index = index++;
                            item = core.$fastCreate(UIClass, item, null, options);
                        }

                        // 选项控件，直接添加
                        if (core.dispatchEvent(this, 'append', {child: item})) {
                            body.appendChild(item.getMain());
                            item.$setParent(this);
                            items.push(item);
                        }
                    },
                    this
                );

                // 改变选项控件的位置
                if (el) {
                    this.items.splice(this.items.length - items.length, items.length);
                    items.forEach(function (item) {
                        dom.insertBefore(item.getMain(), el);
                    });
                    Array.prototype.splice.apply(this.items, [index, 0].concat(items));
                }

                this.premitAlterItems();
                this.alterItems();

                if (this.isReady()) {
                    core.init(body);
                    core.init(this.getMain());
                }
                return items;
            },

            /**
             * 选项控件发生变化的处理。
             * @public
             */
            alterItems: function () {
                if (!this.prevent) {
                    if (this.isReady() && !this.isShow()) {
                        this.clearCache();
                    } else {
                        this.$alterItems();
                    }
                }
            },

            /**
             * @override
             */
            cache: function (force) {
                this.items.forEach(function (item) {
                    item.cache(force);
                });
                if (this.isReady()) {
                    this.$alterItems();
                }
            },

            /**
             * 获取指定的子选项控件。
             * @public
             *
             * @param {Number} index 子选项控件编号
             * @return {ecui.ui.Item} 子选项控件
             */
            getItem: function (index) {
                return this.items[index] || null;
            },

            /**
             * 获取全部的子选项控件。
             * @public
             *
             * @return {Array} 子选项控件数组
             */
            getItems: function () {
                return this.items.slice();
            },

            /**
             * 获取子选项的数量。
             * @public
             *
             * @return {Number} 子选项数量
             */
            getLength: function () {
                return this.items.length;
            },

            /**
             * 允许执行 alterItems 方法，针对多次阻止，需要全部 premitAlterItems 后才执行 alterItems 方法。
             * @public
             */
            premitAlterItems: function () {
                this.prevent--;
            },

            /**
             * 阻止执行 alterItems 方法，针对多次阻止，需要全部 premitAlterItems 后才执行 alterItems 方法。
             * @public
             */
            preventAlterItems: function () {
                this.prevent++;
            },

            /**
             * 移除子选项控件。
             * @public
             *
             * @param {number|ecui.ui.Item} item 选项控件的位置序号/选项控件
             * @return {ecui.ui.Item} 被移除的子选项控件
             */
            remove: function (item) {
                if ('number' === typeof item) {
                    item = this.items[item];
                }
                if (item) {
                    this.preventAlterItems();
                    if (core.dispatchEvent(this, 'remove', {child: item})) {
                        dom.remove(item.getMain());
                        item.$setParent();
                        this.premitAlterItems();
                        this.alterItems();
                    } else {
                        this.premitAlterItems();
                        item = null;
                    }
                }
                return item || null;
            },

            /**
             * 移除所有子选项控件。
             * @public
             *
             * @param {boolean} dispose 选项控件是否在移除过程中自动释放
             */
            removeAll: function (dispose) {
                this.preventAlterItems();
                this.getItems().forEach(
                    function (item) {
                        if (this.remove(item) && dispose) {
                            item.dispose();
                        }
                    },
                    this
                );
                this.premitAlterItems();
                this.alterItems();
            }
        }
    );

    var definedInterface = {};

    ui.Items.defineProperty = function (name) {
        if (definedInterface[name]) {
            return definedInterface[name];
        }

        var propertyName = '$set' + name.charAt(0).toUpperCase() + name.slice(1),
            methods = {
                'private': {
                    value: undefined
                }
            };

        // item移除时选项组需要释放状态
        methods.$remove = function (event) {
            if (this.value === event.child) {
                this[propertyName.slice(1)]();
            }
        };

        // 底层的$setXXXX方法
        methods[propertyName] = function (item) {
            item = item || null;
            var oldItem = this.value;
            if (oldItem !== item) {
                if (oldItem) {
                    oldItem.alterStatus('-' + name);
                }
                if (item) {
                    item.alterStatus('+' + name);
                }
                this.value = item;
                return oldItem || null;
            }
        };

        // setXXXX方法，会发送propertychange事件
        methods[propertyName.slice(1)] = function (item) {
            if ('number' === typeof item) {
                item = this.getItem(item);
            }

            var oldItem = this[propertyName](item);
            if (oldItem !== undefined) {
                core.dispatchEvent(this, 'propertychange', {name: name, item: item, history: oldItem});
            }
        };

        // getXXXX方法，获取属性的值
        methods['g' + propertyName.slice(2)] = function () {
            return this.value || null;
        };

        return definedInterface[name] = _interface(methods);
    };
}());
