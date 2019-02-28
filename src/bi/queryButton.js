/*
queryButton - 查询按钮控件。
定制查询按钮控件，继承自button控件

查询按钮控件HTML初始化的例子:
<div ui="type:QueryButton;></div>

*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui;
//{/if}//
    ui.BQueryButton = core.inherits(
        ui.Button,
        'ui-query-button',
        function (el, options) {
            ui.Button.call(this, el, options);
        },
        {
            /**
             * 输入提交事件。
             * @event
             */
            $submit: function (event) {
                event.preventDefault();
            },
            $click: function (event) {
                ui.Button.prototype.$click.call(this, event);
                var route = ecui.esr.findRoute(this);
                var children = ecui.esr.getRoute(route.children);
                children.searchParm = {};
                ecui.esr.parseObject(this.getForm(), children.searchParm);
                // ecui.ui.BTableListRoute.prototype.setSearchParam(children.searchParm, this.getForm());
                // children.searchParm.pageNo = 1;
                ecui.esr.callRoute(route.children + '~pageNo=1', true);
            },
        }
    );
}());
