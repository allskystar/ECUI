/*
<input ui="type:phone" name="test" />
或:
<div ui="type:phone;name:national:true">
    <!-- 如果ec中不指定name,value，也可以在input中指定 -->
    <input name="test" value="13243433232" />
</div>

@fields
_bNational   定义是否是国际手机号输入
*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui;
//{/if}//
    /**
     * 手机号输入框控件。
     * options 属性：
     * national  是否是国际手机号输入框
     * @control
     */
    ui.Email = core.inherits(
        ui.Text,
        function (el, options) {
            ui.Text.call(this, el, options);
            this._oTest = new RegExp('^[a-zA-Z0-9\\-\\~_.]*$|^[a-zA-Z0-9\\-\\~_.]+@[a-zA-Z0-9\\-\\~_-]*$|^[a-zA-Z0-9\\-\\~_.]+@[a-zA-Z0-9\\-\\~_-]+(\\.[a-zA-Z0-9_-]*)*$');
        },
        {
            /**
             * @override
             */
            $input: function (event) {
                ui.Text.prototype.$input.call(this, event);

                var value = this.getValue();
                if (this._oTest && this._oTest.test(value)) {
                    this._sLastValue = value;
                    return;
                }
                this.setValue(this._sLastValue || '');
            },

            /**
             * @override
             */
            $ready: function () {
                ui.Text.prototype.$ready.call(this);
                this._sLastValue = this.getValue();
            },

            /**
             * @override
             */
            $setValue: function (value) {
                ui.Text.prototype.$setValue.call(this, value);
                this._sLastValue = value;
            }
        }
    );
})();
