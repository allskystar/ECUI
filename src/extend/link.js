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
    var linkElement = dom.create('A');

    ext.link = {
        Events: {
            click: function (event) {
                // link嵌套只处理最内层
                if (!event.__ECUI_Link__) {
                    var href = dom.getAttribute(this.getMain(), 'href');
                    if (href) {
                        linkElement.href = href;
                        location.href = linkElement.href;
                        event.__ECUI_Link__ = true;
                    }
                }
            }
        }
    };
}());
