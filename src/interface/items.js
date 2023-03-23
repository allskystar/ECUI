//{if $css}//
ecui.__ControlStyle__('\
.ui-item {\
    overflow: hidden !important;\
    margin: 0px !important;\
}\
');
//{/if}//
//{if 0}//
(function () {
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
                _super.$click(event);
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
                _super.$hide(event);
                var parent = this.getParent();
                if (parent) {
                    parent.alterItems();
                }
            },

            /**
             * @override
             */
            $show: function (event) {
                _super.$show(event);
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
                    if (ui.iItems.isInstance(parent) && !oldParent) {
                        parent.add(this);
                    }
                } else if (oldParent) {
                    oldParent.remove(this);
                }
            }
        }
    );

    /**
     * 选项组接口，是对选项进行操作的方法的集合，提供了基本的增/删操作。
     * @interface
     */
    ui.iItems = core.interfaces('Items', {
        /**
         * 选项组只允许添加选项控件，添加成功后会自动调用 alterItems 方法。
         * @override
         */
        $append: function (event) {
            // 检查待新增的控件是否为选项控件
            if (event.child instanceof (this.Item || ui.Item)) {
                _class.$append(event);
            } else {
                event.preventDefault();
            }
        },

        /**
         * @override
         */
        $create: function (options) {
            this._aItems = [];
            this._nPrevent = 0;
            _class.$create(options);
            this.preventAlterItems();
            // 初始化选项控件
            this.add(dom.children(this.getBody()).filter(function (item) {
                return !item.getControl;
            }));
            this.premitAlterItems();
        },

        /**
         * @override
         */
        $ready: function () {
            _class.$ready();
            this.$alterItems();
        },

        /**
         * 选项组移除子选项后会自动调用 alterItems 方法。
         * @override
         */
        $remove: function (event) {
            core.$clearState(event.child);
            _class.$remove(event);
            if (event.returnValue !== false) {
                util.remove(this._aItems, event.child);
            }
        },

        /**
         * 添加子选项控件。
         * add 方法中如果位置序号不合法，子选项控件将添加在末尾的位置。
         * @public
         *
         * @param {string|Object|HTMLElement|ecui.ui.Item|Array} child 控件的 html 内容/控件的初始化参数对象/控件对应的主元素对象/选项控件/前面四项组合成的数组
         * @param {number|ecui.ui.Item} index 子选项控件需要添加的位置序号或需要插入的元素位置
         * @return {Array} 子选项控件数组
         */
        add: function (child, index) {
            if (typeof index === 'number') {
                index = this._aItems[index];
            }
            child = (child instanceof Array ? child : [child]).filter(function (item) {
                if (item instanceof ui.Item) {
                    // 选项控件位于其它items对象中，先进行移除
                    var parent = item.getParent();
                    if (parent && !parent.remove(item)) {
                        // 不允许移除子控件，直接结束
                        return false;
                    }
                } else if (item instanceof HTMLElement) {
                    var options = core.getOptions(item) || {};
                    item.__ECUI__options = options;
                    if (options.type) {
                        // 指定了初始化的类型，直接不处理跳过
                        return false;
                    }
                }
                return true;
            });
            if (index) {
                index = this._aItems.indexOf(index);
                if (index < 0) {
                    index = this._aItems.length;
                }
            } else {
                index = this._aItems.length;
            }
            var UIClass = this.Item || ui.Item,
                ret = [],
                isEmpty = !this._aItems.length;

            this.preventAlterItems();
//{if 0}//
            core._globalProxy(function () {
//{/if}//
                child.forEach(
                    function (item) {
                        if (!(item instanceof ui.Item)) {
                            // 根据是字符串还是Element对象选择不同的初始化方式
                            if (item instanceof HTMLElement) {
                                var options = core.getOptions(item);
                            } else {
                                if (typeof item === 'string') {
                                    options = {};
                                    options[core.TEXTNAME] = item;
                                } else {
                                    options = item;
                                }
                                item = dom.create(
                                    {
                                        innerHTML: options[core.TEXTNAME]
                                    }
                                );
                            }

                            options.parent = this;
                            options.primary = UIClass.CLASS;
                            options.index = index;
                            item = core.$fastCreate(UIClass, item, null, options);
                        }

                        if (item && core.dispatchEvent(this, 'append', {child: item})) {
                            var items = ui.iItems.getData(this)._aItems;
                            if (isEmpty) {
                                if (this.isInited()) {
                                    this.getBody().appendChild(item.getMain());
                                }
                                items.push(item);
                            } else if (index < items.length) {
                                dom.insertBefore(item.getMain(), items[index].getMain());
                                items.splice(index, 0, item);
                            } else {
                                this.getBody().appendChild(item.getMain());
                                items.push(item);
                            }
                            index++;
                            item.$setParent(this);
                            ret.push(item);
                        }
                    },
                    this
                );
//{if 0}//
            }).bind(this)();
//{/if}//
            this.premitAlterItems();
            this.alterItems();

            return ret;
        },

        /**
         * 选项控件发生变化的处理。
         * @public
         */
        alterItems: function () {
            if (!this._nPrevent) {
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
            _class.cache(force);
            this._aItems.forEach(function (item) {
                item.cache(force);
            });
        },

        /**
         * 遍历所有的子控件节点。
         * @public
         *
         * @param {Function} fn 遍历时用于节点处理的函数，不返回值正常遍历，返回 false 时不遍历当前节点的子节点，返回其它值时直接终止遍历并返回结果。
         * @param {object} thisArg this指针
         */
        forEach: function (fn, thisArg) {
            for (var i = 0, item; (item = this._aItems[i]); i++) {
                var ret = fn.call(thisArg, item, i);
                if (ret !== undefined && ret !== false) {
                    return ret;
                }
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
            return this._aItems[index] || null;
        },

        /**
         * 获取全部的子选项控件。
         * @public
         *
         * @return {Array} 子选项控件数组
         */
        getItems: function () {
            return this._aItems.slice();
        },

        /**
         * 获取子选项的数量。
         * @public
         *
         * @return {Number} 子选项数量
         */
        getLength: function () {
            return this._aItems.length;
        },

        /**
         * 允许执行 alterItems 方法，针对多次阻止，需要全部 premitAlterItems 后才执行 alterItems 方法。
         * @public
         */
        premitAlterItems: function () {
            this._nPrevent--;
        },

        /**
         * 阻止执行 alterItems 方法，针对多次阻止，需要全部 premitAlterItems 后才执行 alterItems 方法。
         * @public
         */
        preventAlterItems: function () {
            this._nPrevent++;
        },

        /**
         * 移除子选项控件。
         * @public
         *
         * @param {number|ecui.ui.Item} item 选项控件的位置序号/选项控件
         * @return {ecui.ui.Item} 被移除的子选项控件
         */
        remove: function (item) {
            if (typeof item === 'number') {
                item = this._aItems[item];
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
    });
//{if 0}//
})();
//{/if}//
