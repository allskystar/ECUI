/*
@example
<div ui="type:multi-select;name:test">
    <div>选项一</div>
    <div>选项二</div>
    <div>选项三</div>
</div>
或
<div ui="type:multi-select">
    <input name="test">
    <div>选项一</div>
    <div>选项二</div>
    <div>选项三</div>
</div>

@fields
_sName  - 多选框内所有input的名称
_eInput - 选项对应的input，form提交时使用
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        util = core.util,
        ui = core.ui;
//{/if}//
    /**
     * 多选下拉框控件。
     * 类似<select>的复选模式，可以选择多项数据。
     * @control
     */
    ui.MultiSelect = core.inherits(
        ui.InputControl,
        'ui-multi-select',
        function (el, options) {
            var optionsEl = dom.create({'className': this.getUnitClass(ui.MultiSelect, 'listbox')});
            for (; el.firstChild; ) {
                optionsEl.appendChild(el.firstChild);
            }
            ui.InputControl.call(this, el, options);
            dom.insertBefore(
                this._eText = dom.create('DIV', { 'className': this.getUnitClass(ui.MultiSelect, 'text') }),
                dom.last(el)
            );

            var popupEl = dom.create(
                'DIV',
                {
                    'className': this.getUnitClass(ui.MultiSelect, 'options') + this.Popup.CLASS + ' ui-popup ui-hide',
                    'innerHTML': util.formatString('<input class="{0}" placeholder="{1}">', this.Popup.CLASS + ' ui-multi-select-search-input', options.placeholder || '搜索')
                }
            );
            popupEl.appendChild(optionsEl);
            this.setPopup(core.$fastCreate(this.Popup, popupEl, this, { name: options.name }));
            this._sName = options.name || '';
            this._bRequired = !!options.required;
        },
        {
            TEXT: '已选{0}个',

            Popup: core.inherits(
                ui.Control,
                function (el, options) {
                    ui.Control.call(this, el, options);
                    this._uSearchInput = core.$fastCreate(this.SearchInput, dom.first(el), this);
                    this._uOptions = core.$fastCreate(this.Options, dom.last(el), this);
                },
                {
                    SearchInput: core.inherits(
                        ui.Text,
                        {
                            $input: function (event) {
                                this.searchItems();
                            },
                            searchItems: function () {
                                var value = this.getValue(),
                                    parent = this.getParent(),
                                    uOptions = parent._uOptions;

                                uOptions.getItems().forEach(function (item) {
                                    if (item.getBody().innerText.indexOf(value) >= 0) {
                                        item.show();
                                    } else {
                                        item.hide();
                                    }
                                });
                            }
                        }
                    ),
                    /**
                     * 选项框部件。
                     * @unit
                     */
                    Options: core.inherits(
                        ui.Listbox,
                        {
                            /**
                             * 选项部件。
                             * @unit
                             */
                            Item: core.inherits(
                                ui.Listbox.prototype.Item,
                                {
                                    /**
                                     * @override
                                     */
                                    $click: function (event) {
                                        ui.Listbox.prototype.Item.prototype.$click.call(this, event);
                                        core.dispatchEvent(this.getParent().getParent().getParent(), 'change');
                                    }
                                }
                            )
                        }
                    )  
                }
            ),

            /**
             * 选项改变事件。
             * @event
             */
            $change: function () {
                this.changeHandler();
            },

            /**
             * @override
             */
            $dispose: function () {
                this._eText = null;
                ui.InputControl.prototype.$dispose.call(this);
            },

            /**
             * 设置placeholder信息。
             * @protected
             */
            $setPlaceholder: function () {
                if (this.getValue().length) {
                    this.alterStatus('-placeholder');
                } else {
                    this.alterStatus('+placeholder');
                    this._eText.innerHTML = dom.getAttribute(this.getInput(), 'placeholder') || '';
                }
            },

            /**
             * @override
             */
            $validate: function (event) {
                return ui.InputControl.prototype.$validate.call(this, event) !== false && (!this._bRequired || !!this.getValue());
            },

            getOptions: function () {
                return this.getPopup()._uOptions;
            },

            /**
             * @override
             */
            onready: function () {
                var values = this.getValue();
                this.getOptions().getItems().forEach(function (item) {
                    if (values.indexOf(item.getValue()) > -1) {
                        item.setSelected(true);
                    }
                });
                this.changeHandler();
            },

            changeHandler: function () {
                var text = [], value = [];
                this.getSelected().forEach(function (item) {
                    text.push(item.getBody().innerText.trim());
                    value.push(item.getValue());
                });
                this._eText.innerHTML = text.join(',');
                this.$setValue(value.join(','));
                this.$setPlaceholder();
            },

            /**
             * 获取控件的表单项名称。
             * 多选框控件可以在表单中被提交，getName 方法返回提交时用的表单项名称，表单项名称可以使用 setName 方法改变。
             * @public
             *
             * @return {string} 表单项名称
             */
            getName: function () {
                return this._sName;
            },

            /**
             * 获取所有选中的选项。
             * @public
             *
             * @return {Array} 选项数组
             */
            getSelected: function () {
                return this.getOptions().getSelected();
            },

            /**
             * 获取所有选中项的value。
             * @public
             *
             * @return {Array} 选项数组
             */
            getValue: function () {
                var value = ui.InputControl.prototype.getValue.call(this).trim();
                return value !== '' ? value.split(',') : [];
            },

            /**
             * 选中所有的选项。
             * 某些场景下，需要多选框控件的内容都可以被提交，可以在表单的 onsubmit 事件中调用 selectAll 方法全部选择。
             * @public
             */
            selectAll: function () {
                this.getOptions().selectAll();
            },

            /**
             * 设置控件的表单项名称。
             * 多选框控件可以在表单中被提交，setName 方法设置提交时用的表单项名称，表单项名称可以使用 getName 方法获取。
             * @public
             *
             * @param {string} name 提交用的名称
             */
            setName: function (name) {
                this.getOptions().setName(name);
            }
        },
        ui.Popup
    );
//{if 0}//
}());
//{/if}//