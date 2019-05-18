/*
@example
<div ui="type:tab;selected:1">
    <div>
        <strong>标题1</strong>
        标题1文本内容
    </div>
    <strong ui="selected:true">标题2</strong>
</div>

@fields
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
     * 选项卡控件。
     * 每一个选项卡都包含一个头部区域与容器区域，选项卡控件存在互斥性，只有唯一的一个选项卡能被选中并显示容器区域。
     * options 属性：
     * selected    选中的选项序号，默认为0
     * @control
     */
    ui.Tab = core.inherits(
        ui.Control,
        'ui-tab',
        function (el, options) {
            var titleEl = dom.create({className: this.getUnitClass(ui.Tab, 'title')}),
                containerEl = dom.create({className: this.getUnitClass(ui.Tab, 'container')});

            for (; el.firstChild; ) {
                titleEl.appendChild(el.firstChild);
            }
            el.appendChild(titleEl);
            this._eContainer = el.appendChild(containerEl);

            _super(el, options);

            this.$setBody(titleEl);

            this._nSelected = +options.selected;
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

                    _super(el, options);

                    if (containerEl) {
                        if (options.parent) {
                            if (dom.parent(containerEl)) {
                                options.parent.getBody().insertBefore(el, containerEl);
                            } else {
                                options.parent.getBody().appendChild(el);
                            }
                        } else {
                            containerEl.removeChild(el);
                        }
                        this._eContainer = containerEl;

                        core.$bind(containerEl, this);
                    }

                    if (options.container) {
                        this._eContainer = core.$(options.container);
                    }

                    if (this._eContainer) {
                        dom.addClass(this._eContainer, this.getType());
                        if (options.parent) {
                            options.parent._eContainer.appendChild(this._eContainer);
                        }
                    }

                    if (options.selected && options.parent) {
                        options.parent._nSelected = options.index;
                    }
                },
                {
                    /**
                     * @override
                     */
                    $dispose: function () {
                        if (this._eContainer) {
                            this._eContainer.getControl = null;
                            this._eContainer = null;
                        }
                        _super.$dispose();
                    },

                    /**
                     * @override
                     */
                    $setParent: function (parent) {
                        if (!parent) {
                            removeContainer(this);
                        } else if (this._eContainer && dom.parent(this._eContainer) !== parent._eContainer) {
                            parent.getMain().appendChild(this._eContainer);
                        }

                        _super.$setParent(parent);
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
                            if (parent.getSelected() === this) {
                                dom.addClass(el, this.getType() + '-selected');
                            } else {
                                dom.removeClass(el, this.getType() + '-selected');
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
                this._eContainer = null;
                _super.$dispose();
            },

            /**
             * @override
             */
            $itemclick: function (event) {
                if (dom.contain(event.item.getBody(), event.target)) {
                    if (core.dispatchEvent(this, 'titleclick', event)) {
                        if (event.item !== this.getSelected()) {
                            this.setSelected(event.item);
                            core.dispatchEvent(this, 'change');
                        }
                    }
                } else {
                    core.dispatchEvent(this, 'containerclick', event);
                }
            },

            /**
             * 属性改变事件的默认处理。
             * @event
             */
            $propertychange: function (event) {
                if (event.name === 'selected') {
                    if (event.history) {
                        if (event.history._eContainer && (!event.item || event.history._eContainer !== event.item._eContainer)) {
                            dom.removeClass(event.history._eContainer, event.history.getType() + '-selected');
                        }
                    }

                    if (event.item) {
                        if (event.item._eContainer && (!event.history || event.history._eContainer !== event.item._eContainer)) {
                            dom.addClass(event.item._eContainer, event.item.getType() + '-selected');
                            core.cacheAtShow(event.item._eContainer);
                        }
                    }
                }
            },

            /**
             * @override
             */
            $ready: function () {
                _super.$ready();
                this.setSelected(this._nSelected || 0);
                delete this._nSelected;
            },

            /**
             * @override
             */
            $remove: function (event) {
                if (this.getSelected() === event.child) {
                    var list = this.getItems(),
                        index = list.indexOf(event.child);

                    // 跳到被删除项的后一项
                    this.setSelected(index === list.length - 1 ? index - 1 : index + 1);
                }

                _super.$remove(event);
            },

            /**
             * 获取选项卡对应的容器元素。
             * @public
             *
             * @return {HTMLElement} 选项卡对应的容器元素
             */
            getContainer: function () {
                return this._eContainer;
            }
        },
        ui.Items
    );

    ui.Items.defineProperty(ui.Tab, 'selected');
}());
