/*
Tab - 定义分页选项卡的操作。
选项卡控件，继承自基础控件，实现了选项组接口。每一个选项卡都包含一个头部区域与容器区域，选项卡控件存在互斥性，只有唯一的一个选项卡能被选中并显示容器区域。

直接初始化选项卡控件的例子
<div ui="type:tab;selected:1">
    <!-- 包含容器的选项卡 -->
    <div>
        <strong>标题1</strong>
        <!-- 这里是容器 -->
        ...
    </div>
    <!-- 仅有标题的选项卡，以下selected定义与控件定义是一致的，可以忽略其中之一 -->
    <strong ui="selected:true">标题2</strong>
</div>

属性
_cSelected       - 当前选中的选项卡

Item属性
_eContainer      - 容器 DOM 元素
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 移除容器 DOM 元素。
     * @private
     *
     * @param {ecui.ui.Tab} tab 选项卡控件
     */
    function removeContainer(tab) {
        if (tab._eContainer) {
            var parent = tab.getParent();
            if (parent) {
                if (parent.getItems().every(function (item) {
                        return item === tab || item._eContainer !== tab._eContainer;
                    })) {
                    dom.remove(tab._eContainer);
                }
            }
        }
    }

    /**
     * 初始化选项卡控件。
     * options 对象支持的特定属性如下：
     * selected 选中的选项序号，默认为0
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.Tab = core.inherits(
        ui.Control,
        'ui-tab',
        function (el, options) {
            var titleEl = el;
            el = dom.insertBefore(
                dom.create(
                    {
                        className: el.className,
                        style: {
                            cssText: titleEl.style.cssText
                        }
                    }
                ),
                el
            );
            titleEl.className = options.classes.join('-title ');
            titleEl.style.cssText = '';
            el.appendChild(titleEl);

            ui.Control.call(this, el, options);

            this.$setBody(titleEl);
            this.$initItems();
        },
        {
            /**
             * 初始化选项卡控件的选项部件。
             * options 对象支持的特定属性如下：
             * container 容器的id，如果通过这里设置，不允许改变关联容器
             * selected 当前项是否被选中
             * @protected
             *
             * @param {Object} options 初始化选项
             */
            Item: core.inherits(
                ui.Item,
                'ui-tab-item',
                function (el, options) {
                    if (el.tagName !== 'STRONG') {
                        var containerEl = el;
                        el = dom.first(el);
                        el.className = containerEl.className;
                        containerEl.className = '';
                    }

                    ui.Item.call(this, el, options);

                    if (containerEl) {
                        if (options.parent) {
                            options.parent.getBody().insertBefore(el, containerEl);
                        } else {
                            containerEl.removeChild(el);
                        }
                        this._eContainer = containerEl;
                    }

                    if (options.container) {
                        this._eContainer = core.$(options.container);
                    }

                    if (this._eContainer && !options.selected) {
                        dom.addClass(this._eContainer, 'ui-hide');
                        this.getMain().appendChild(this._eContainer);
                    }

                    if (parent && options.selected) {
                        options.parent.setSelected(this);
                    }
                },
                {
                    /**
                     * @override
                     */
                    $dispose: function () {
                        this._eContainer = null;
                        ui.Item.prototype.$dispose.call(this);
                    },

                    /**
                     * @override
                     */
                    $setParent: function (parent) {
                        if (!parent) {
                            removeContainer(this);
                        } else if (this._eContainer && dom.getParent(this._eContainer) !== parent.getMain()) {
                            parent.getMain().appendChild(this._eContainer);
                        }

                        ui.Item.prototype.$setParent.call(this, parent);
                    },

                    /**
                     * 获取选项卡对应的容器元素。
                     * @public
                     *
                     * @return {HTMLElement} 选项卡对应的容器元素
                     */
                    getContainer: function () {
                        return this._eContainer;
                    },

                    /**
                     * 设置选项卡对应的容器元素。
                     * @public
                     *
                     * @param {HTMLElement} el 选项卡对应的容器元素
                     */
                    setContainer: function (el) {
                        var parent = this.getParent();

                        removeContainer(this);
                        if (this._eContainer = el) {
                            parent.getMain().appendChild(el);
                            // 如果当前节点被选中需要显示容器元素，否则隐藏
                            if (parent._cSelected === this) {
                                dom.removeClass(el, 'ui-hide');
                            } else {
                                dom.addClass(el, 'ui-hide');
                            }
                        }
                    }
                }
            ),

            /**
             * @override
             */
            $alterItems: util.blank,

            /**
             * @override
             */
            $itemclick: function (event, target) {
                this.setSelected(target);
                core.triggerEvent(this, 'change');
            },

            /**
             * @override
             */
            $ready: function (options) {
                ui.Control.prototype.$ready.call(this, options);

                if (!this._cSelected) {
                    this.setSelected(+(options.selected || 0));
                }
            },

            /**
             * @override
             */
            $remove: function (child) {
                if (this._cSelected === child) {
                    var list = this.getItems(),
                        index = list.indexOf(child);

                    // 跳到被删除项的后一项
                    this.setSelected(index === list.length - 1 ? index - 1 : index + 1);
                }

                ui.Control.prototype.$remove.call(this, child);
            },

            /**
             * 获得当前选中的选项卡控件。
             *
             * @return {ecui.ui.Tab.Item} 选中的选项卡控件
             */
            getSelected: function () {
                return this._cSelected;
            },

            /**
             * 设置被选中的选项卡。
             * @public
             *
             * @param {number|ecui.ui.Tab.Item} 选项卡子选项的索引/选项卡子选项控件
             */
            setSelected: function (item) {
                if ('number' === typeof item) {
                    item = this.getItems()[item];
                }

                if (this._cSelected !== item) {
                    if (this._cSelected) {
                        this._cSelected.alterClass('-selected');
                        if (this._cSelected._eContainer && (!item || this._cSelected._eContainer !== item._eContainer)) {
                            dom.addClass(this._cSelected._eContainer, 'ui-hide');
                        }
                    }

                    if (item) {
                        item.alterClass('+selected');
                        if (item._eContainer && (!this._cSelected || this._cSelected._eContainer !== item._eContainer)) {
                            dom.removeClass(item._eContainer, 'ui-hide');
                        }
                    }

                    this._cSelected = item;
                }
            }
        },
        ui.Items
    );
}());
