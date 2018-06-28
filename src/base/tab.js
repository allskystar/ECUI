/*
@example
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

@fields
_cSelected       - 当前选中的选项卡
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
     * 滑动事件处理。
     * @private
     *
     * @param {ECUIEvent} event ECUI 事件对象
     */
    function swipe(event) {
        var items = this.getItems(),
            index = items.indexOf(this._cSelected);
        if (event.type === 'swiperight') {
            if (index) {
                index--;
            }
        } else if (event.type === 'swipeleft') {
            if (index < items.length - 1) {
                index++;
            }
        }
        if (items[index] !== this._cSelected) {
            this.setSelected(items[index]);
            core.dispatchEvent(this, 'change');
            var el = this._cSelected.getMain();
            if (el && el.tagName === 'A' && el.href) {
                location.href = el.href;
            }
        }
    }

    /**
     * 选项卡控件。
     * 每一个选项卡都包含一个头部区域与容器区域，选项卡控件存在互斥性，只有唯一的一个选项卡能被选中并显示容器区域。
     * options 属性：
     * selected    选中的选项序号，默认为0
     * gesture     是否支持手势切换，默认为true
     * @control
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
        },
        {
            /**
             * 选项部件。
             * options 属性：
             * container   容器的id，如果通过这里设置，不允许改变关联容器
             * selected    当前项是否被选中
             * @unit
             */
            Item: core.inherits(
                ui.Item,
                'ui-tab-item',
                function (el, options) {
                    if (el.tagName !== 'STRONG') {
                        var containerEl = el;
                        el = dom.first(el);
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
            $dispose: function () {
                core.removeGestureListeners(this);
                ui.Control.prototype.$dispose.call(this);
            },

            /**
             * @override
             */
            $itemclick: function (event) {
                if (event.item !== this._cSelected) {
                    this.setSelected(event.item);
                    core.dispatchEvent(this, 'change');
                }
            },

            /**
             * @override
             */
            $ready: function (event) {
                ui.Control.prototype.$ready.call(this, event.options);

                if (!this._cSelected && event.options.selected !== 'none') {
                    this.setSelected(+(event.options.selected) || 0);
                }

                if (event.options.gesture !== false) {
                    core.addGestureListeners(this, {
                        swipeleft: swipe,
                        swiperight: swipe
                    });
                }
            },

            /**
             * @override
             */
            $remove: function (event) {
                if (this._cSelected === event.child) {
                    var list = this.getItems(),
                        index = list.indexOf(event.child);

                    // 跳到被删除项的后一项
                    this.setSelected(index === list.length - 1 ? index - 1 : index + 1);
                }

                ui.Control.prototype.$remove.call(this, event);
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
             * @param {number|ecui.ui.Tab.Item} item 选项卡子选项的索引/选项卡子选项控件
             */
            setSelected: function (item) {
                if ('number' === typeof item) {
                    item = this.getItem(item);
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
