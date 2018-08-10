/*
@example
<input ui="type:form-input" type="password" name="passwd" value="1111">
*/
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 表单项控件。
     * 用于将表单项控件化以重新定义相关的 getFormName/getFormValue/isFormChecked 等方法，是 InputControl 的简化版。
     * options 属性：
     * name         输入框的名称
     * @control
     */
    ui.FormInput = core.inherits(
        ui.Control,
        function (el, options) {
            ui.Control.call(this, el, options);
            this._sName = options.name;
        },
        {
            /**
             * 获取控件进行提交的名称，默认使用 getName 的返回值。
             * @public
             *
             * @return {string} 控件的表单名称
             */
            getFormName: function () {
                return this._sName || this.getMain().name;
            },

            /**
             * 获取控件进行提交的值，默认使用 getValue 的返回值。
             * @public
             *
             * @return {string} 控件的表单值
             */
            getFormValue: function () {
                return this.getMain().value;
            },

            /**
             * 保存控件的值为默认值，直接忽略。
             * @public
             */
            saveToDefault: util.blank
        }
    );
//{if 0}//
}());
//{/if}//
