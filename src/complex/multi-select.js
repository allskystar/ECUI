//{if $css}//
ecui.__ControlStyle__('\
.ui-multi-select {\
    cursor: pointer;\
    position: relative;\
\
    .ui-multi-select-text {\
        position: relative !important;\
        z-index: 2 !important;\
        overflow: hidden !important;\
        display: flex !important;\
        flex: auto;\
        flex-wrap: wrap;\
        .ui-search-text-input {\
            position: relative !important;\
            flex: 1;\
        }\
    }\
\
    input {\
        position: absolute !important;\
        top: 0;\
        left: 0;\
        z-index: 1;\
        display: none !important;\
    }\
    &.ui-input-placeholder {\
        input {\
            display: block;\
        }\
    }\
}\
\
.ui-multi-select-options {\
    .ui-item {\
        .inline-block();\
    }\
    .ui-multi-select-options-operate {\
        display: block;\
        .ui-button {\
            display: inline-block;\
        }\
    }\
}\
');
//{/if}//
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
        ui.Text,
        'ui-multi-select',
        function (el, options) {
            var optionsEl = dom.create({'className': this.getUnitClass(ui.MultiSelect, 'listbox')});
            for (; el.firstChild;) {
                optionsEl.appendChild(el.firstChild);
            }
            _super(el, options);
            this.getInput().readOnly = true;
            dom.insertBefore(
                this._eText = dom.create('DIV', { 'className': this.getUnitClass(ui.MultiSelect, 'text') }),
                el.lastElementChild
            );
            this._uText = core.$fastCreate(this.Options, this._eText, this);
            var popupEl = dom.create(
                'DIV',
                {
                    'className': this.getUnitClass(ui.MultiSelect, 'options ') + (this.iPopup || ui.iPopup).CLASS,
                    'innerHTML': util.formatString('<input class="{0}" placeholder="{1}">', (this.iPopup || ui.iPopup).CLASS + ' ui-multi-select-search-input', options.placeholder || '搜索')
                }
            );
            popupEl.appendChild(optionsEl);
            this.setPopup(core.$fastCreate(this.Popup, popupEl, this, { name: options.name }));
            this._sName = options.name || '';
            this._bRequired = !!options.required;
        },
        {
            TEXT: '已选{0}个',
            PLACEHOLDER: '请选择',
            ERROR: '请选择{Name}',

            Popup: core.inherits(
                ui.Control,
                function (el, options) {
                    _super(el, options);
                    this._uSearchInput = core.$fastCreate(this.SearchInput, el.firstElementChild, this);
                    this._uOptions = core.$fastCreate(this.Options, el.lastElementChild, this);
                },
                {
                    SearchInput: core.inherits(
                        ui.Text,
                        {
                            oninput: function () {
                                this.getParent().searchItems(this.getValue())
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
                                        _super.$click(event);
                                        core.dispatchEvent(this.getParent().getParent().getParent(), 'change', event);
                                    }
                                }
                            )
                        }
                    ),
                    searchItems: function (text) {
                        this._uOptions.getItems().forEach(function (item) {
                            if (item.getBody().innerText.indexOf(text) >= 0) {
                                item.show();
                            } else {
                                item.hide();
                            }
                        });
                    }
                }
            ),

            Options: ecui.inherits(
                ui.Control,
                function (el, options) {
                    _super(el, options);
                    this._eText = dom.create('DIV', { 'className': 'ui-search-text-input' });
                    el.appendChild(this._eText);
                    this._uSearchInput = core.$fastCreate(this.SearchInput, el.firstElementChild, this);
                    this._uSearchInput.getInput().placeholder = '搜索内容';
                },
                {
                    /**
                     * 选项部件。
                     * @unit
                     */
                    Item: core.inherits(
                        ui.Item,
                        function (el, options) {
                            ui.Item.call(this, el, options);
                            this._sValue = options.value;
                            this._sCode = options.code;
                            var elDelete = dom.create('span', { className: 'delete' });
                            el.appendChild(elDelete);
                            this._uDelete = core.$fastCreate(this.Delete, elDelete, this);
                        },
                        {
                            Delete: ecui.inherits(
                                ui.Control,
                                function (el, options) {
                                    ui.Control.call(this, el, options);
                                    this._bIsDelete = true;
                                },
                                {
                                    onclick: function (event) {
                                        var item = this.getParent(),
                                            mulitSelect = item.getParent().getParent(),
                                            value = item._sValue;
                                        mulitSelect.getOptions().getItems().forEach(function (_item) {
                                            if (_item.getValue() === value) {
                                                _item.setSelected(false);
                                            }
                                        });
                                        item.getParent().remove(item);
                                        event.value = value;
                                        core.dispatchEvent(mulitSelect, 'change', event);
                                        event.stopPropagation();
                                    }
                                }
                            )
                        }
                    ),
                    SearchInput: core.inherits(
                        ui.Text,
                        {
                            oninput: function () {
                                this.getParent().getParent().getPopup().searchItems(this.getValue())
                            }
                        }
                    ),
                    $alterItems: util.blank
                },
                ui.iItems
            ),
            /**
             * 选项改变事件。
             * @event
             */
            $change: function (event) {
                if (event.item) {
                    if (event.item.isSelected()) {

                    } else {

                    }
                } else {
                    // 删除按钮
                }
                this.changeHandler(event);
            },
            /**
             * 选项改变事件。
             * @event
             */
            changeHandler: function (event, isInit) {
                var value = this.getValue(), data = [], items = this._uText.getItems(), dataMap = {};
                var popup = this.getPopup();
                this.getOptions().getItems().forEach(function (item) {
                    dataMap[item.getValue()] = {
                        code: item.getBody().innerText.trim(),
                        value: item.getValue()
                    };
                });
                if (event) {
                    var deleteValue = '';
                    if (event.item) {
                        if (event.item.isSelected()) {
                            value.push(event.item.getValue());
                            this._uText.add({
                                code: event.item.getBody().innerText.trim(),
                                value: event.item.getValue()
                            }, this._uText.getItems().length);
                        } else {
                            deleteValue = event.item.getValue();
                        }
                    } else if (event.value) {
                        deleteValue = event.value;
                    }

                    if (deleteValue) {
                        value.splice(value.indexOf(deleteValue), 1);
                        var _item = items.filter(function (item) { return item._sValue === deleteValue; });
                        _item.forEach(function (item) {
                            this._uText.remove(item);
                        }, this);
                    }
                }
                this.$setValue(value.join(','));
                this.$setPlaceholder();
                this.$correct();
                this._uText.getBody().appendChild(this._uText._uSearchInput.getMain());
                this.repaint();
                core.dispatchEvent(this.getPopup(), 'resize');
            },

            /**
             * @override
             */
            $dispose: function () {
                _super.$dispose();
                this._eText = null;
            },

            /**
             * @override
             */
            init: function () {
                _super.init();
                util.timer(function () {
                    var values = this.getValue();
                    var valueMap = {};
                    this.getOptions().getItems().forEach(function (item) {
                        valueMap[item.getValue()] = {
                            code: item.getBody().innerText.trim(),
                            value: item.getValue()
                        };
                        if (values.includes(item.getValue())) {
                            item.setSelected(true);
                        }
                    });
                    values = values.map(function (item) {
                        return valueMap[item];
                    });
                    // this.changeHandler(null, true);

                    // this._uText.removeAll();
                    this._uText.add(values);
                    this._uText.getBody().appendChild(this._uText._uSearchInput.getMain());
                    this.repaint();
                    core.dispatchEvent(this.getPopup(), 'resize');
                }, 10, this);
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
                    // this._eText.innerHTML = this.getInput().getAttribute('placeholder') || '';
                }
            },

            /**
             * @override
             */
            $validate: function (event) {
                if (_super.$validate(event) === false || (this._bRequired && !this.getValue().length)) {
                    event.addError(this.ERROR);
                    return false;
                }
            },

            getOptions: function () {
                return this.getPopup()._uOptions;
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
                var value = _super.getValue().trim();
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
        ui.iPopup
    );
//{if 0}//
})();
//{/if}//
