/*
link - 链接插件，使用ext-link使用，具体的跳转地址写在DOM元素的href属性中(与A标签类似)，点击完成跳转。
@example:
<div ui="ext-link" href="...">...</div>
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ext = core.ext;
//{/if}//
    function onclick(event) {
        // link嵌套只处理最内层
        if (!event.__Link__) {
            var href = dom.getAttribute(this.getMain(), 'href');
            if (href) {
                linkElement.href = href;
                location.href = linkElement.href;
                event.__Link__ = true;
            }
        }
    }

    var linkElement = dom.create('A');

    /**
     * 链接插件加载。
     * @public
     *
     * @param {ecui.ui.Control} control 需要应用插件的控件
     * @param {string} value 插件的参数
     */
    ext.link = function (control) {
        core.addEventListener(control, 'click', onclick);
    };
}());
