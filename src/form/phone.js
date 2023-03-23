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
    ui.Phone = core.inherits(
        ui.Number,
        function (el, options) {
            options.decimal = 0;
            options.pattern = options.national ? '\\d{0,11}' : '$|^1\\d{0,10}';
            _super(el, options);
        },
        {
            /**
             * @override
             */
            $validate: function (event) {
                var result = _super.$validate(event);

                var value = +this.getValue();
                if ((this._nMin !== undefined && !(value >= this._nMin)) || (this._nMax !== undefined && !(value <= this._nMax))) {
                    result = false;
                }

                return result;
            }
        }
    );
//{if 0}//
})();
//{/if}//
