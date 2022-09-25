/*
@fields
_bRequired    - 是否必须选择
_uText        - 下拉框的文本框
_uOptions     - 下拉选择框
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 下拉框控件虚基类。
     * 扩展了原生 SelectElement 的功能，允许指定下拉选项框的最大选项数量，在屏幕显示不下的时候，会自动显示在下拉框的上方。在没有选项时，下拉选项框有一个选项的高度。下拉框控件允许使用键盘与滚轮操作，在下拉选项框打开时，可以通过回车键或鼠标点击选择，上下键选择选项的当前条目，在关闭下拉选项框后，只要拥有焦点，就可以通过滚轮上下选择选项。
     * options 属性：
     * optionSize     下拉框最大允许显示的选项数量，默认为5
     * placeholder    未选择时的提示信息
     * required       是否必须选择
     * @control
     */
    ui.$AbstractSelect = core.inherits(
        ui.InputControl,
        function (el, options) {
            options = Object.assign({readOnly: true}, options);

            if (el.tagName === 'SELECT') {
                options.name = el.name;
                options.value = el.value;

                var optionsEl = dom.create(
                    {
                        innerHTML: dom.toArray(el.options).map(
                            function (item) {
                                var optionText = dom.getAttribute(item, core.getAttributeName());
                                return '<div ' + core.getAttributeName() + '="value:' + util.encodeHTML(item.value) + (optionText ? ';' + util.encodeHTML(optionText) : '') + '">' + util.encodeHTML(item.text) + '</div>';
                            }
                        ).join('')
                    }
                );

                el = dom.insertBefore(
                    dom.create(
                        {
                            className: el.className,
                            style: {
                                cssText: el.style.cssText
                            }
                        }
                    ),
                    el
                );

                dom.remove(el.nextSibling);
            } else {
                optionsEl = dom.create('DIV');
                var input = el.getElementsByTagName('INPUT')[0];
                for (; el.firstChild; ) {
                    optionsEl.appendChild(el.firstChild);
                }
            }

            el.innerHTML = '<div class="' + this.getUnitClass(ui.$AbstractSelect, 'text') + '"></div>';
            if (input) {
                el.appendChild(input);
            }

            ui.InputControl.call(this, el, options);
            optionsEl.className = this.getUnitClass(ui.$AbstractSelect, 'options') + ' ui-popup ui-hide ';

            this._uText = core.$fastCreate(ui.Item, el.firstChild, this, {capturable: false});
            this._uOptions = core.$fastCreate(this.Options, optionsEl, this, {focusable: false});
/*ignore*/
            this._bRequired = !!options.required;
/*end*/
            this.setPopup(this._uOptions);
            this.$setBody(this._uOptions.getBody());
        },
        {
            /**
             * 选项框部件。
             * @unit
             */
            Options: core.inherits(
                ui.Control,
                {
                    /**
                     * @override
                     */
                    $show: function () {
                        ui.Control.prototype.$show.call(this);
                        var select = this.getParent();
                        if (select._bAlterItems) {
                            this.$alterItems();
                            select._bAlterItems = false;
                        }
                    }
                }
            ),

            /**
             * 选项部件。
             * @unit
             */
            Item: core.inherits(
                ui.Options.prototype.Item,
                function (el, options) {
                    options.focusable = false;
                    ui.Options.prototype.Item.call(this, el, options);
                    this._sValue = options.value === undefined ? dom.getText(el) : String(options.value);
                },
                {
                    /**
                     * @override
                     */
                    $click: function (event) {
                        ui.Options.prototype.Item.prototype.$click.call(this, event);
                        this.getParent()._uOptions.hide();
                    },

                    /**
                     * @override
                     */
                    $mouseover: function (event) {
                        ui.Options.prototype.Item.prototype.$mouseover.call(this, event);
                        var parent = this.getParent();
                        if (parent) {
                            parent.setSelecting(this);
                        }
                    },

                    /**
                     * 获取选项的值。
                     * getValue 方法返回选项控件的值，即选项选中时整个下拉框控件的值。
                     * @public
                     *
                     * @return {string} 选项的值
                     */
                    getValue: function () {
                        return this._sValue;
                    },

                    /**
                     * 设置选项的值。
                     * setValue 方法设置选项控件的值，即选项选中时整个下拉框控件的值。
                     * @public
                     *
                     * @param {string} value 选项的值
                     */
                    setValue: function (value) {
                        var parent = this.getParent();
                        this._sValue = value;
                        if (parent && this === parent.getSelected()) {
                            // 当前被选中项的值发生变更需要同步更新控件的值
                            ui.InputControl.prototype.setValue.call(parent, value);
                        }
                    }
                }
            ),

            /**
             * 选项控件发生变化的处理。
             * @protected
             */
            $alterItems: function () {
                if (dom.parent(this._uOptions.getMain()) && this._uOptions.isShow()) {
                    this._uOptions.$alterItems();
                    this._bAlterItems = false;
                } else {
                    this._bAlterItems = true;
                }
            },

            /**
             * 选项改变事件。
             * @event
             */
            $change: function () {
                this.$correct();
            },

            /**
             * @override
             */
            $initStructure: function (width, height) {
                ui.InputControl.prototype.$initStructure.call(this, width, height);
                // 设置文本区域
                if (this._uText.isCached()) {
                    this._uText.$setSize(width, height);
                }
            },

            /**
             * 属性改变事件的默认处理。
             * @event
             */
            $propertychange: function (event) {
                if (event.name === 'selected') {
                    if (event.item) {
                        this.setText(event.item.getContent());
                        this.$setValue(event.item._sValue);
                        if (this._uOptions.isShow()) {
                            core.setFocused(event.item);
                        }
                    } else {
                        this.setText('');
                        this.$setValue('');
                        if (this.contain(core.getFocused())) {
                            core.setFocused(this);
                        }
                    }
                }
            },

            /**
             * @override
             */
            $reset: function () {
                var el = this.getInput();
                el.value = el.defaultValue;
                ui.InputControl.prototype.$reset.call(this);
            },

            /**
             * 设置placeholder信息。
             * @protected
             */
            $setPlaceholder: function () {
                if (this.getInput().value || this.getText()) {
                    this.alterStatus('-placeholder');
                } else {
                    this.alterStatus('+placeholder');
                    this.setText(dom.getAttribute(this.getInput(), 'placeholder') || '');
                }
            },

            /**
             * @override
             */
            $setValue: function (value) {
                ui.InputControl.prototype.$setValue.call(this, value);
                this.$setPlaceholder();
            },

            /**
             * @override
             */
            $validate: function (event) {
                return ui.InputControl.prototype.$validate.call(this, event) !== false && (!this._bRequired || !!this.getValue());
            },

            /**
             * @override
             */
            cache: function (force) {
                this._uText.cache(force);
                ui.InputControl.prototype.cache.call(this, force);
            },

            /**
             * 获取控件显示的文本。
             * @public
             *
             * @return {string} 用于显示的文本
             */
            getText: function () {
                return this._uText.getContent();
            },

            /**
             * @override
             */
            init: function () {
                ui.InputControl.prototype.init.call(this);
                this.setValue(this.getInput().value);
                this._bAlterItems = true;
            },

            /**
             * 设置控件显示的文本。
             * @public
             *
             * @param {string} text 用于显示的文本
             */
            setText: function (text) {
                this._uText.getBody().innerHTML = text;
            },

            /**
             * 设置控件的值。
             * setValue 方法设置控件的值，设置的值必须与一个子选项的值相等，否则将被设置为空，使用 getValue 方法获取设置的值。
             * @public
             *
             * @param {string} value 需要选中的值
             */
            setValue: function (value) {
                if (this.getItems().every(
                    function (item) {
                        if (item._sValue === value) {
                            this.setSelected(item);
                            return false;
                        }
                        return true;
                    },
                    this
                )) {
                    // 找不到满足条件的项，将选中的值清除
                    this.setSelected();
                }
            }
        },
        ui.Items,
        ui.Control.defineProperty('selected')
    );
})();
