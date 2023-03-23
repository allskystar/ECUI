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
//{if 0}//
(function () {
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
        'ui-email',
        function (el, options) {
            options.pattern = '[\\w-.]+@[\\w-.]+';
            options.filter = '\\w-.';
            options.once = '@';
            _super(el, options);
        }
    );
//{if 0}//
})();
//{/if}//
