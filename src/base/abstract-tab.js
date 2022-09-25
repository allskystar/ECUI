/*
@fields
_eContainer      - 容器 DOM 元素
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    /**
     * 移除容器 DOM 元素。
     * @private
     */
    function removeContainer() {
        if (this._eContainer) {
            var parent = this.getParent();
            if (parent) {
                if (parent.getItems().every(function (item) {
                    return item === this || item._eContainer !== this._eContainer;
                })) {
                    dom.remove(this._eContainer);
                }
            }
        }
    }

    /**
     * 选项卡控件虚基类，为类似的选项卡操作提供基本支持。
     * 每一个选项卡都包含一个头部区域与容器区域，选项卡控件存在互斥性，只有唯一的一个选项卡能被选中并显示容器区域。
     * @control
     */
    ui.$AbstractTab = core.inherits(
        ui.Control,
        function (el, options) {
            var titleEl = dom.create({className: this.getUnitClass(ui.$AbstractTab, 'title')}),
                containerEl = dom.create({className: this.getUnitClass(ui.$AbstractTab, 'container')});

            for (; el.firstChild;) {
                titleEl.appendChild(el.firstChild);
            }
            el.appendChild(titleEl);
            this._eContainer = el.appendChild(containerEl);

            ui.Control.call(this, el, options);

            this.$setBody(titleEl);
        },
        {
            /**
             * 选项部件。
             * options 属性：
             * container   容器的id，如果通过这里设置，不允许改变关联容器
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
                    } else if (this._eContainer) {
                        dom.addClass(this._eContainer, this.getType());
                        if (options.parent) {
                            options.parent._eContainer.appendChild(this._eContainer);
                        }
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
                        ui.Item.prototype.$dispose.call(this);
                    },

                    /**
                     * @override
                     */
                    $setParent: function (parent) {
                        if (parent) {
                            var container = parent.getContainer();
                            if (this._eContainer && dom.parent(this._eContainer) !== container) {
                                container.appendChild(this._eContainer);
                            }
                        } else {
                            removeContainer.call(this);
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

                        removeContainer.call(this);
                        if ((this._eContainer = el)) {
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
            $dispose: function () {
                this._eContainer = null;
                ui.Control.prototype.$dispose.call(this);
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
})();
