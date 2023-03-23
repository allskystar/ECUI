//{if $css}//
ecui.__ControlStyle__('\
.ui-radio {\
    input {\
        position: relative !important;\
        left: -12px !important;\
        width: 10px !important;\
        border-radius: 0px;\
        opacity: 0 !important;\
    }\
}\
');
//{/if}//
/*
@example
<input ui="type:radio" name="city" value="beijing" checked="checked" type="radio">
或
<div ui="type:radio;name:city;value:beijing;checked:true"></div>
或
<div ui="type:radio">
    <input name="city" value="beijing" checked="checked" type="radio">
</div>

@fields
*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui;
//{/if}//
    /**
     * 单选框控件刷新。
     * @private
     *
     * @param {ecui.ui.Radio} radio 单选框控件
     * @param {boolean} checked 新的状态，如果忽略表示不改变当前状态
     */
    function refresh(radio, checked) {
        if (checked !== undefined) {
            radio.getInput().checked = checked;
        }
        radio.alterSubType(radio.isChecked() ? 'checked' : '');
    }

    /**
     * 设置单选框选中状态。
     * @private
     *
     * @param {ecui.ui.Radio} radio 单选框控件
     * @param {boolean} checked 新的状态，如果忽略表示不改变当前状态
     */
    function setChecked(radio, checked) {
        if (checked) {
            radio.getItems().forEach(function (item) {
                if (item !== radio) {
                    if (item.getSubType() === 'checked') {
                        refresh(item, false);
                        core.dispatchEvent(item, 'change');
                    }
                }
            });
        }
        refresh(radio, checked);
    }

    /**
     * 单选框控件。
     * 实现了对原生 InputElement 单选框的功能扩展，支持对选中的图案的选择。单选框控件适用所有在一组中只允许选择一个目标的交互，并不局限于此分组的表现形式(文本、图片等)。
     * options 属性：
     * required    是否必须选择
     * @control
     */
    ui.Radio = core.inherits(
        ui.abstractItemInput,
        'ui-radio',
        function (el, options) {
            _super(el, Object.assign({inputType: 'radio'}, options));
        },
        {
            /**
             * 控件点击时将控件设置成为选中状态，同时取消同一个单选框控件组的其它控件的选中状态。
             * @override
             */
            $click: function (event) {
                _super.$click(event);
                if (!this.isChecked()) {
                    this.setChecked(true);
                    core.dispatchEvent(this, 'change');
                }
            },

            /**
             * 空格键按下时选中。
             * @override
             */
            $keyup: function (event) {
                _super.$keyup(event);
                if (event.which === 32) {
                    if (core.getKey() === 32) {
                        this.setChecked(true);
                    }
                    event.exit();
                }
            },

            /**
             * @override
             */
            $ready: function (options) {
                _super.$ready(options);
                refresh(this);
            },

            /**
             * 失效的控件，被Label标签触发状态改变时的恢复。
             * @protected
             */
            $restoreChange: function () {
                this.getItems().forEach(function (item) {
                    item.getInput().checked = item.getSubType() === 'checked';
                });
            },

            /**
             * 判断控件是否选中。
             * @public
             *
             * @return {boolean} 是否选中
             */
            isChecked: function () {
                return this.getInput().checked;
            },

            /**
             * 设置单选框控件选中状态。
             * 将控件设置成为选中状态，会取消同一个单选框控件组的其它控件的选中状态。
             * @public
             *
             * @param {boolean} checked 是否选中
             */
            setChecked: function (checked) {
                _super.setChecked(checked);
                setChecked(this, checked);
            }
        }
    );
})();
