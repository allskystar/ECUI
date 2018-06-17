/*
cities - 地区联动下拉框控件。
地区联动下拉框控件，继承自multilevel-select控件。

多级联动下拉框控件直接HTML初始化的例子:
省市二级联动：
<div ui="type:cities;mutli:2"></div>
省市区三级联动：
<div ui="type:cities;multi:3"></div>

*/
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = ecui.util;

    /**
     * 初始化多项选择控件。
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.MultiSelect = core.inherits(
        ui.Text,
        'ui-multi-select',
        function (el, options) {
            util.setDefault(options, 'readOnly', true);
            util.setDefault(options, 'inputType', 'text');

            var oldEl = el;
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

            if (oldEl.tagName === 'SELECT') {
                options.name = oldEl.name;
                options.value = oldEl.value;

                var optionsEl = dom.create(
                    {
                        className: options.classes.join('-options ') + 'ui-popup ui-hide',
                        innerHTML: Array.prototype.map.call(
                            oldEl.options,
                            function (item) {
                                var optionText = dom.getAttribute(item, core.getAttributeName());
                                return '<div ' + core.getAttributeName() + '="value:' + util.encodeHTML(item.value) + (optionText ? ';' + util.encodeHTML(optionText) : '') + '">' + util.encodeHTML(item.text) + '</div>';
                            }
                        ).join('')
                    }
                );
            } else {
                optionsEl = oldEl;
                optionsEl.className = options.classes.join('-options ') + 'ui-popup ui-hide';
                oldEl.style.cssText = '';
            }

            dom.remove(oldEl);

            el.innerHTML = '<div class="' + options.classes.join('-text ') + '"></div>';
            this._uText = el.firstChild;
            console.log(this._uText);
            ui.InputControl.call(this, el, options);
            this.getInput().readOnly = true;
            this._uOptions = core.$fastCreate(this.Options, optionsEl, this);
            this._uOptions._cSelected = [];
            this.$setBody(optionsEl);
            // 初始化下拉区域最多显示的选项数量
            this.setPopup(this._uOptions);

            this._cSelected = [];
        },
        {
            $change: function (event) {
                var text = [], value = [];
                this._cSelected.forEach(function (item) {
                    text.push(item.getContent());
                    value.push(item.getValue());
                });
                this._uText.innerHTML = text.join('，');
                this.getInput().value = JSON.stringify(value);
            },
            getValue: function () {
                return JSON.parse(this.getInput().value);
            },
            /**
             * 选项部件。
             * @unit
             */
            Item: core.inherits(
                ui.Item,
                'ui-select-item',
                function (el, options) {
                    ui.Item.call(this, el, options);
                    this._sValue = options.value === undefined ? dom.getText(el) : String(options.value);
                },
                {
                    /**
                     * @override
                     */
                    $click: function (event) {
                        ui.Item.prototype.$click.call(this, event);
                        var parent = this.getParent(),
                            index = parent._uOptions._cSelected.indexOf(this);
                        if (index === -1) {
                            parent._uOptions._cSelected.push(this);
                        } else {
                            parent._uOptions._cSelected.splice(index, 1);
                        }
                        this.alterClass((index === -1) ? '+selected' : '-selected');
                        // core.triggerEvent(parent, 'change', event);
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
                        if (parent && this === parent._cSelected) {
                            // 当前被选中项的值发生变更需要同步更新控件的值
                            ui.InputControl.prototype.setValue.call(parent, value);
                        }
                    }
                }
            ),

            /**
             * 选项框部件。
             * @unit
             */
            Options: core.inherits(
                ui.Control,
                function (el, options) {
                    ui.Control.call(this, el, options);
                    el = this.getMain();

                    // 生成操作按钮
                    dom.insertHTML(
                        el,
                        'BEFOREEND',
                        '<div class="' + options.classes.join('-operate ') + '"><div class="' +
                            options.classes.join('-cancel ') + 'ui-button">取消</div><div class="' +
                            options.classes.join('-sure ') + 'ui-button">确定</div></div>'
                    );
                    var buttons = dom.children(el.lastChild);
                    this._uCancel = core.$fastCreate(this.Button, buttons[0], this);
                    this._uSure = core.$fastCreate(this.Button, buttons[1], this);
                },
                {
                    /**
                     * 多项选择操作按钮控件。
                     * options 属性：
                     * move    前进后退月份的偏移值，需要改变一年设置为12
                     * @unit
                     */
                    Button: core.inherits(
                        ui.Button,
                        function (el, options) {
                            ui.Button.call(this, el, options);
                        },
                        {
                            /**
                             * @override
                             */
                            $click: function (event) {
                                ui.Button.prototype.$click.call(this, event);
                                var parent = this.getParent();
                                if (this === parent._uCancel) {
                                    parent._cSelected = [].concat(parent.getParent()._cSelected);
                                } else {
                                    parent.getParent()._cSelected = [].concat(parent._cSelected);
                                    core.triggerEvent(parent.getParent(), 'change', event);
                                }
                                parent.hide();
                            }
                        }
                    ),
                }
            ),

            /**
             * 选项控件发生变化的处理。
             * 在 选项组接口 中，选项控件发生添加/移除操作时调用此方法。虚方法，子控件必须实现。
             * @protected
             */
            $alterItems: function () {
                if (dom.getParent(this._uOptions.getOuter())) {
                    var step = this.getBodyHeight(),
                        width = this.getWidth(),
                        itemLength = this.getLength();

                    // 为了设置激活状态样式, 因此必须控制下拉框中的选项必须在滚动条以内
                    this.setItemSize(width - this._uOptions.getMinimumWidth() - (itemLength > this._nOptionSize ? core.getScrollNarrow() : 0), step);
                    // 设置options框的大小，如果没有元素，至少有一个单位的高度
                    this._uOptions.$setSize(width, (Math.min(itemLength, this._nOptionSize) || 1) * step + this._uOptions.getMinimumHeight());
                }
            },
        },
        ui.Popup,
        ui.Items
    );
}());
