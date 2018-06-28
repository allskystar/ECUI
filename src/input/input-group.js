/*
@example
<div ui="type:input-group">
    <!-- 这里放表单元素 -->
    ...
</div>
*/
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui;
//{/if}//
    /**
     * 表单元素组，用于验证失败时的错误处理。
     * @control
     */
    ui.InputGroup = core.inherits(
        ui.Control,
        'ui-input-group',
        {
            /**
             * 控件组格式校验错误的默认处理。
             * @event
             */
            $error: function () {
                this.alterSubType('error');
            }
        }
    );
//{if 0}//
}());
//{/if}//
