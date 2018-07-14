//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 多选框控件。
     * 类似<select>的复选模式，可以选择多项数据。
     * @control
     */
    ui.MultiSelect = core.inherits(
        ui.Control,
        'ui-multi-select',
        function (el, options) {
            var optionsEl = el;
            el = dom.insertBefore(
                dom.create({
                    className: el.className,
                    style: {
                        cssText: el.style.cssText
                    }
                }),
                el
            );
            optionsEl.className = ui.Listbox.CLASS + options.classes.join('-options ') + 'ui-popup ui-hide';
            optionsEl.style.cssText = '';
            ui.Control.call(this, el, options);
            this.setPopup(core.$fastCreate(ui.Listbox, optionsEl, this, {name: options.name}));
            this._sName = options.name || '';
        },
        {
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