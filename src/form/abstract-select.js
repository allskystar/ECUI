/*
@fields
_uText        - 下拉框的文本框
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    var ItemsProxy = {};
    ['add', 'getItem', 'getItems', 'getLength', 'getSelected', 'getSelecting', 'remove', 'removeAll', 'setSelected', 'setSelecting'].forEach(function (name) {
//{if 0}//
        ItemsProxy[name] = new Function('var o=this.getPopup();return o.' + name + '.apply(o,arguments)');
//{else}//        ItemsProxy[name] = new Function('var o=this.__ECUI__this.getPopup();return o.' + name + '.apply(o,arguments)');
//{/if}//
    });
    ItemsProxy = core.interfaces(ui.iItems.NAME.substring(1), ItemsProxy);

    /**
     * 下拉框控件虚基类。
     * 扩展了原生 SelectElement 的功能，允许指定下拉选项框的最大选项数量，在屏幕显示不下的时候，会自动显示在下拉框的上方。在没有选项时，下拉选项框有一个选项的高度。下拉框控件允许使用键盘与滚轮操作，在下拉选项框打开时，可以通过回车键或鼠标点击选择，上下键选择选项的当前条目，在关闭下拉选项框后，只要拥有焦点，就可以通过滚轮上下选择选项。
     * options 属性：
     * optionSize     下拉框最大允许显示的选项数量，默认为5
     * placeholder    未选择时的提示信息
     * required       是否必须选择
     * @control
     */
    ui.abstractSelect = core.inherits(
        ui.abstractInput,
        function (el, options) {
            options = Object.assign({readOnly: true}, options);

            if (el.tagName === 'SELECT') {
                options.name = el.name;
                options.value = el.value;

                var optionsEl = dom.create(
                    {
                        innerHTML: dom.toArray(el.options).map(
                            function (item) {
                                var optionText = item.getAttribute(core.getAttributeName());
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
                for (; el.firstChild;) {
                    optionsEl.appendChild(el.firstChild);
                }
            }

            el.innerHTML = '<div class="' + this.getUnitClass(ui.abstractSelect, 'text') + '"></div>';
            if (input) {
                el.appendChild(input);
            }

            _super(el, options);
            optionsEl.className = this.getUnitClass(ui.abstractSelect, 'options');

            this._uText = core.$fastCreate(ui.Item, el.firstChild, this, {capturable: false, title: options.title});
            options = core.$fastCreate(this.Options, optionsEl, this, {focusable: false, title: options.title});

            el = this.getInput();
            if (el.getAttribute('placeholder') === null) {
                el.setAttribute('placeholder', this.PLACEHOLDER);
            }

            this.setPopup(options);
            this.$setBody(options.getBody());
        },
        {
            PLACEHOLDER: '请选择',
            ERROR: '请选择{Name}',

            /**
             * 选项框部件。
             * @unit
             */
            Options: core.inherits(
                ui.Options,
                {
                    /**
                     * 选项部件。
                     * @unit
                     */
                    Item: core.inherits(
                        ui.Options.prototype.Item,
                        function (el, options) {
                            options.focusable = false;
                            _super(el, options);
                            this._sValue = options.value === undefined ? el.textContent : String(options.value);
                        },
                        {
                            /**
                             * @override
                             */
                            $click: function (event) {
                                _super.$click(event);
                                this.getParent().hide();
                            },

                            /**
                             * @override
                             */
                            $mouseover: function (event) {
                                _super.$mouseover(event);
                                this.getParent().setSelecting(this);
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
                                    parent.getParent().$setValue(value);
                                }
                            }
                        }
                    ),

                    /**
                     * 选中项改变事件的默认处理。
                     * @event
                     */
                    $change: function (event) {
                        core.dispatchEvent(this.getParent(), 'change', event);
                    },

                    /**
                     * 属性改变事件的默认处理。
                     * @event
                     */
                    $propertychange: function (event) {
                        if (event.name === 'selected') {
                            var select = this.getParent();
                            if (event.item) {
                                select.setText(event.item.getContent());
                                select.$setValue(event.item._sValue);
                                if (this.isShow()) {
                                    core.setFocused(event.item);
                                }
                            } else {
                                select.setText('');
                                select.$setValue('');
                                if (select.contains(core.getFocused())) {
                                    core.setFocused(select);
                                }
                            }
                        }
                    },

                    /**
                     * @override
                     */
                    $show: function () {
                        _super.$show();
                        if (this._bAlterItems) {
                            this.$alterItems();
                            this._bAlterItems = false;
                        }
                    },

                    /**
                     * 选项控件发生变化的处理。
                     * @public
                     */
                    alterItems: function () {
                        if (this.getMain().parentElement && this.isShow()) {
                            this.$alterItems();
                            this._bAlterItems = false;
                        } else {
                            this._bAlterItems = true;
                        }
                    }
                },
                ui.Control.defineProperty('selecting')
            ),

            /**
             * 选项控件发生变化的处理。
             * @protected
             */
            // $alterItems: function () {
            //     this.getPopup().alterItems();
            // },

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
                _super.$initStructure(width, height);
                // 设置文本区域
                if (this._uText.isCached()) {
                    this._uText.$setSize(width, height);
                }
            },

            /**
             * @override
             */
            $ready: function () {
                _super.$ready();
                this.setValue(this.getInput().value);
                this._bAlterItems = true;
            },

            /**
             * @override
             */
            $reset: function () {
                var el = this.getInput();
                el.value = el.defaultValue;
                _super.$reset();
            },

            /**
             * 设置placeholder信息。
             * @protected
             */
            $setPlaceholder: function () {
                var placeholder = this.getInput().getAttribute('placeholder');
                if (this.getInput().value || this._uText.getMain().firstElementChild) {
                    this.alterStatus('-placeholder');
                } else {
                    this.alterStatus('+placeholder');
                    this._uText.setContent(placeholder || '');
                }
            },

            /**
             * @override
             */
            $setValue: function (value) {
                _super.$setValue(value);
                this.$setPlaceholder();
            },

            /**
             * @override
             */
            $validate: function (event) {
                if (!(_super.$validate(event) !== false && (!this.isRequired() || !!this.getValue()))) {
                    event.addError(this.ERROR);
                    return false;
                }
            },

            /**
             * @override
             */
            cache: function (force) {
                _super.cache(force);
                this._uText.cache(force);
            },

            /**
             * 获取控件显示的文本。
             * @public
             *
             * @return {string} 用于显示的文本
             */
            getText: function () {
                return this._uText.getBody().firstElementChild.innerHTML;
            },

            /**
             * 设置控件显示的文本。
             * @public
             *
             * @param {string} text 用于显示的文本
             */
            setText: function (text) {
                this._uText.getBody().innerHTML = text ? '<div class="' + this.Options.prototype.Item.CLASS + '">' + text + '</div>' : '';
            },

            /**
             * 设置控件的值。
             * setValue 方法设置控件的值，设置的值必须与一个子选项的值相等，否则将被设置为空，使用 getValue 方法获取设置的值。
             * @public
             *
             * @param {string} value 需要选中的值
             */
            setValue: function (value) {
                var options = this.getPopup();
                if (options.getItems().every(
                    function (item) {
                        if (item._sValue === value) {
                            options.setSelected(item);
                            return false;
                        }
                        return true;
                    },
                    this
                )) {
                    // 找不到满足条件的项，将选中的值清除
                    options.setSelected();
                }
            }
        },
        ItemsProxy
    );
})();
