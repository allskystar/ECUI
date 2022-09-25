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
    ui.Phone = core.inherits(
        ui.Number,
        function (el, options) {
            options.decimal = 0;
            ui.Number.call(this, el, options);
            this._bNational = !!options.national;
            this.setTest();
        },
        {
            setTest: function () {
                this._oTest = new RegExp('^' + (this._bNational ? '\\d{0,11}' : '$|^1\\d{0,10}') + '$');
            },
            setNational: function (isNational) {
                this._bNational = isNational;
                this.setTest();
            }
        }
    );

})();
