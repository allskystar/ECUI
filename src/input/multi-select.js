/*
@example
<div ui="type:multi-select;name:test">
    <!-- 这里放选项内容 -->
    <div>选项</div>
    ...
</div>

@fields
_sName  - 多选框内所有input的名称
_eInput - 选项对应的input，form提交时使用
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
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
            var optionsEl = dom.create({className: this.Options.CLASS + options.classes.join('-options ') + 'ui-popup ui-hide'});
            for (; el.firstChild; ) {
                optionsEl.appendChild(el.firstChild);
            }
            ui.InputControl.call(this, el, options);
            dom.insertBefore(
                this._eText = dom.create('DIV', { className: options.classes.join('-text ') }),
                dom.last(el)
            );
            this.setPopup(core.$fastCreate(this.Options, optionsEl, this, {name: options.name}));
            this._sName = options.name || '';
        },
        {
            TEXT: '已选{0}个',
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
                                core.dispatchEvent(this.getParent().getParent(), 'change');
                            }
                        }
                    )
                }
            ),

            /**
             * 选项改变事件。
             * @event
             */
            $change: function () {
                var text = [], value = [];
                this.getSelected().map(function (item) {
                    text.push(item.getBody().innerText.trim());
                    value.push(item.getValue());
                });
                this._eText.innerHTML = text.join(',');
                this._eInput.value = value.join(',');
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
                return this.getPopup().getSelected();
            },
            getValue: function () {
                var value = this._eInput.value.split(',');
                return value.map(function (item) { return item; });
            },

            /**
             * 选中所有的选项。
             * 某些场景下，需要多选框控件的内容都可以被提交，可以在表单的 onsubmit 事件中调用 selectAll 方法全部选择。
             * @public
             */
            selectAll: function () {
                this.getPopup().selectAll();
            },

            /**
             * 设置控件的表单项名称。
             * 多选框控件可以在表单中被提交，setName 方法设置提交时用的表单项名称，表单项名称可以使用 getName 方法获取。
             * @public
             *
             * @param {string} name 提交用的名称
             */
            setName: function (name) {
                this.getPopup().setName(name);
            }
        },
        ui.Popup
    );
//{if 0}//
}());
//{/if}//