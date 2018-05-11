/*
选项组接口，是对选项进行操作的方法的集合，提供了基本的增/删操作，通过将 ecui.ui.Items 对象下的方法复制到类的 prototype 属性下继承接口。
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        eventNames = ['mousedown', 'mouseover', 'mousemove', 'mouseout', 'mouseup', 'click', 'dblclick', 'focus', 'blur', 'activate', 'deactivate'];
//{/if}//
    var namedMap = {};

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
             * 选项控件的父控件必须实现 Items 接口，同时选项控件有父控件时不能设置别的父控件。
             * @override
             */
            setParent: function (parent) {
                var oldParent = this.getParent();
                if (parent) {
                    if (parent.$Items && !oldParent) {
                        parent.add(this);
                    }
                } else if (oldParent) {
                    oldParent.remove(this);
                }
            }
        }
    );

    ui.Items = {
        NAME: '$Items',

        constructor: function () {
            (namedMap[this.getUID()] = []).preventCount = 0;

            this.preventAlterItems();

            // 初始化选项控件
            this.add(dom.children(this.getBody()));

            this.premitAlterItems();
        },

        Methods: {
            // 选项控件的文本在 options 中的名称
            TEXTNAME: '#text',

            /**
             * 选项组只允许添加选项控件，添加成功后会自动调用 alterItems 方法。
             * @override
             */
            $append: function (event) {
                // 检查待新增的控件是否为选项控件
                if (event.child instanceof (this.Item || ui.Item)) {
                    this.$Items.$append.call(this, event);
                    if (event.returnValue !== false) {
                        namedMap[this.getUID()].push(event.child);
                        this.alterItems();
                    }
                }
            },

            /**
             * @override
             */
            $cache: function (style, cacheSize) {
                this.$Items.$cache.call(this, style, cacheSize);

                namedMap[this.getUID()].forEach(function (item) {
                    item.cache(true, true);
                });
            },

            /**
             * @override
             */
            $dispose: function () {
                delete namedMap[this.getUID()];
                this.$Items.$dispose.call(this);
            },

            /**
             * @override
             */
            $ready: function (event) {
                this.$Items.$ready.call(this, event);
                this.alterItems();
                this.getItems().forEach(function (item) {
                    core.triggerEvent(item, 'ready');
                });
            },

            /**
             * 选项组移除子选项后会自动调用 alterItems 方法。
             * @override
             */
            $remove: function (event) {
                core.$clearState(event.child);
                this.$Items.$remove.call(this, event);
                if (event.returnValue !== false) {
                    util.remove(namedMap[this.getUID()], event.child);
                    this.alterItems();
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
                var list = namedMap[this.getUID()],
                    items = [],
                    UIClass = this.Item || ui.Item,
                    el = list[index] ? list[index].getOuter() : null,
                    body = this.getBody();

                this.preventAlterItems();

                (item instanceof Array ? item : [item]).forEach(function (item) {
                    if (!(item instanceof ui.Item)) {
                        // 根据是字符串还是Element对象选择不同的初始化方式
                        if (dom.isElement(item)) {
                            var options = core.getOptions(item) || {};
                        } else {
                            if ('string' === typeof item) {
                                options = {};
                                options[this.TEXTNAME] = item;
                            } else {
                                options = item;
                            }
                            item = dom.create(
                                {
                                    className: options.primary,
                                    innerHTML: options[this.TEXTNAME]
                                }
                            );
                        }

                        item.className += UIClass.CLASS;

                        options.parent = this;
                        item = core.$fastCreate(UIClass, item, null, options);
                    }

                    // 选项控件，直接添加
                    if (core.triggerEvent(this, 'append', {child: item})) {
                        body.appendChild(item.getOuter());
                        item.$setParent(this);
                        items.push(item);
                    }
                }, this);

                // 改变选项控件的位置
                if (el) {
                    list.splice(list.length - items.length, items.length);
                    items.forEach(function (item) {
                        dom.insertBefore(item.getOuter(), el);
                    });
                    Array.prototype.splice.apply(list, [index, 0].concat(items));
                }

                this.premitAlterItems();
                this.alterItems();

                return items;
            },

            /**
             * 选项控件发生变化的处理。
             * @public
             */
            alterItems: function () {
                if (!namedMap[this.getUID()].preventCount) {
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
                return namedMap[this.getUID()][index] || null;
            },

            /**
             * 获取全部的子选项控件。
             * @public
             *
             * @return {Array} 子选项控件数组
             */
            getItems: function () {
                return namedMap[this.getUID()].slice();
            },

            /**
             * 获取子选项的数量。
             * @public
             *
             * @return {Number} 子选项数量
             */
            getLength: function () {
                return namedMap[this.getUID()].length;
            },

            /**
             * 允许执行 alterItems 方法，针对多次阻止，需要全部 premitAlterItems 后才执行 alterItems 方法。
             * @public
             */
            premitAlterItems: function () {
                namedMap[this.getUID()].preventCount--;
            },

            /**
             * 阻止执行 alterItems 方法，针对多次阻止，需要全部 premitAlterItems 后才执行 alterItems 方法。
             * @public
             */
            preventAlterItems: function () {
                namedMap[this.getUID()].preventCount++;
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
                    item = namedMap[this.getUID()][item];
                }
                if (item) {
                    if (core.triggerEvent(this, 'remove', {child: item})) {
                        dom.remove(item.getOuter());
                        item.$setParent();
                    } else {
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
                this.getItems().forEach(function (item) {
                    this.remove(item);
                    if (dispose) {
                        item.dispose();
                    }
                }, this);
                this.premitAlterItems();
                this.alterItems();
            },

            /**
             * 设置控件内所有子选项控件的大小。
             * @public
             *
             * @param {number} itemWidth 子选项控件的宽度
             * @param {number} itemHeight 子选项控件的高度
             */
            setItemSize: function (itemWidth, itemHeight) {
                namedMap[this.getUID()].forEach(function (item) {
                    item.cache();
                });
                namedMap[this.getUID()].forEach(function (item) {
                    item.$setSize(itemWidth, itemHeight);
                });
            }
        }
    };

    // 初始化事件转发信息
    eventNames.slice(0, 7).forEach(function (item) {
        ui.Item.prototype['$' + item] = function (event) {
            ui.Control.prototype['$' + item].call(this, event);

            var parent = this.getParent();

            if (parent) {
                event.item = this;
                event.index = namedMap[parent.getUID()].indexOf(this);
                core.triggerEvent(parent, 'item' + item.replace('mouse', ''), event);
            }
        };
    });
}());
