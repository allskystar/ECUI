/*
moduleLink - 无收缩功能树控件（特定需求下使用）。
无收缩功能树控件，继承自树控件，与基础树控件对比，在点击节点时不会收缩展开。
无收缩功能的树控件的例子:
<ul ui="type:tree-view;id:list-tree">
    <label>根</label>
    <ul class="cardealer-list">
        <label><a href="javascript:;">车商列表</a></label>
        <li class="cardealer-apply"><a href="javascript:;">车商新申请</a></li>
        <li class="cardealer-failed"><a href="javascript:;">车商未通过</a></li>
        <li class="cardealer-review"><a href="javascript:;">车商审核</a></li>
        <li class="cardealer-maintain"><a href="javascript:;">车商维护</a></li>
    </ul>
    <ul class="carsource-list">
        <label><a href="javascript:;">车源列表</a></label>
        <li class="carsource-estimate"><a href="javascript:;">评估列表</a></li>
        <li class="carsource-purchasing"><a href="javascript:;">采购列表</a></li>
    </ul>
</ul>
*/
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;

    ui.ModuleLink = core.inherits(
        ui.TreeView,
        '',
        {
            /*
             * @override
             *
             * 重写isCollapsed，强行将树节点，点击时判断是否收缩的返回值写死为true，让它点击时永远展开
             */
            isCollapsed: function () {
                return true;
            }
        }
    );
}());