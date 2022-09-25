//{if $css}//
__ControlStyle__('\
.ui-mobile-select {\
    position: relative;\
\
    input {\
        position: absolute !important;\
        display: none !important;\
        top: 0px !important;\
        z-index: -1 !important;\
        opacity: 0 !important;\
    }\
\
    .ui-mobile-select-text {\
        overflow: hidden !important;\
    }\
}\
');
//{/if}//
/*
@example
<select ui="type:m-select" name="sex">
    <option value="male" selected="selected">男</option>
    <option value="female">女</option>
</select>
或
<div ui="type:m-select;name:sex;value:male">
    <div ui="value:male">男</div>
    <div ui="value:female">女</div>
</div>

@fields
_cSelected    - 当前选中的选项
_uText        - 下拉框的文本框
_uOptions     - 下拉选择框
*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui;
//{/if}//
    /**
     * 下拉框控件。
     * 扩展了原生 SelectElement 的功能，允许指定下拉选项框的最大选项数量，在屏幕显示不下的时候，会自动显示在下拉框的上方。在没有选项时，下拉选项框有一个选项的高度。下拉框控件允许使用键盘与滚轮操作，在下拉选项框打开时，可以通过回车键或鼠标点击选择，上下键选择选项的当前条目，在关闭下拉选项框后，只要拥有焦点，就可以通过滚轮上下选择选项。
     * options 属性：
     * optionSize     下拉框最大允许显示的选项数量，默认为5
     * required       是否必须选择
     * @control
     */
    ui.MSelect = core.inherits(
        ui.$AbstractSelect,
        'ui-mobile-select',
        function (el, options) {
            ui.$AbstractSelect.call(this, el, Object.assign({inputType: 'hidden'}, options));

            this.$getSection('Options').setOptionSize(options.optionSize || 3);

            options.enter = 'bottom';
            options.mask = 0.5;
        },
        {
            /**
             * 选项框部件。
             * @unit
             */
            Options: core.inherits(
                ui.$AbstractSelect.prototype.Options,
                {
                    /**
                     * @override
                     */
                    $show: function () {
                        ui.$AbstractSelect.prototype.Options.prototype.$show.call(this);

                        var select = this.getParent(),
                            item = select.getSelected();

                        this.setPosition(0, this.$$itemHeight * (this._nOptionSize - select.getItems().indexOf(item)));

                        if (item) {
                            this.setSelected(item);
                            core.setFocused(item);
                        }
                    },
                    $propertychange: function (event) {
                        if (event.name === 'selected') {
                            if (event.item) {
                                this._cPreSelected = event.item;
                            }
                        }
                    }

                },
                ui.MOptions,
                ui.MConfirm
            ),

            /**
             * 选项部件。
             * @unit
             */
            Item: core.inherits(
                ui.$AbstractSelect.prototype.Item,
                {
                    /**
                     * @override
                     */
                    $activate: function (event) {
                        ui.$AbstractSelect.prototype.Item.prototype.$activate.call(this, event);
                        core.dispatchEvent(this.getParent().$getSection('Options'), 'activate', event);
                    }
                }
            ),

            /**
             * 确认事件的默认处理。
             * @event
             */
            $confirm: function (event) {
                var item = this.getPopup()._cPreSelected;
                if ((item === null || item instanceof this.Item) && this.getSelected() !== item) {
                    this.getPopup().setSelected(item);
                    this.setSelected(item);
                    core.dispatchEvent(this, 'change', event);
                }
            }
        },
        ui.MPopup
    );
})();
