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
        ui.Listbox,
        'ui-multi-select',
        function (el, options) {
            var optionsEl = dom.create({className: this.getUnitClass(ui.MultiSelect, 'options') + ' ui-popup ui-hide'});
            for (; el.firstChild; ) {
                optionsEl.appendChild(el.firstChild);
            }
            _super(el, options);
            this.$setBody(optionsEl);
            dom.insertBefore(
                this.text = dom.create('DIV', { className: this.getUnitClass(ui.MultiSelect, 'text') }),
                dom.last(el)
            );
            this.setPopup(core.$fastCreate(ui.Control, optionsEl, this, {name: options.name}));
        },
        {
            private: {
                text: undefined
            },

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
                        core.dispatchEvent(this.getParent(), 'change');
                    }
                }
            ),

            /**
             * 选项改变事件。
             * @event
             */
            $change: function () {
                var text = [], value = [];
                this.getSelected().forEach(function (item) {
                    text.push(item.getBody().innerText.trim());
                    value.push(item.getValue());
                });
                this.text.innerHTML = text.join(',');
                this.$setValue(value.join(','));
            },

            /**
             * @override
             */
            $dispose: function () {
                this.text = null;
                _super.$dispose();
            }
        },
        ui.Popup
    );
//{if 0}//
}());
//{/if}//