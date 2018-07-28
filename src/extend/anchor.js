/*
anchor - 锚点插件，使用ext-anchor的方式引用，指定的锚点名称可以被ext.anchor.go方法跳转，ext.anchor.find方法用于查找指定区域所有的锚点名称。
@example:
[HTML]:<div ui="ext-anchor:title">...</div>
[JS]:ext.anchor.go('title');
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ext = core.ext,

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined,
        operaVersion = /opera\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined;
//{/if}//
    var anchors = {};

    /**
     * 锚点插件加载。
     * @public
     *
     * @param {ecui.ui.Control} control 需要应用插件的控件
     * @param {string} value 插件的参数
     */
    ext.anchor = function (control, value) {
        anchors[value] = control;
    };

    /**
     * 跳转到指定的锚点。
     * @public
     *
     * @param {string} name 锚点的名称
     */
    ext.anchor.go = function (name) {
        var control = anchors[name];
        if (control) {
            if (control.getMain()) {
                if (control.isShow()) {
                    if (ieVersion < 8 || operaVersion) {
                        document.body.scrollTop = dom.getPosition(control.getOuter()).top;
                    } else {
                        control.getOuter().scrollIntoView();
                    }
                }
            } else {
                delete anchors[name];
            }
        }
    };

    /**
     * 获取指定区域的锚点名称。
     * @public
     *
     * @param {ecui.ui.Control} owner 指定的区域，如果忽略表示返回所有锚点名称。
     */
    ext.anchor.find = function (owner) {
        var ret = [];
        for (var key in anchors) {
            if (anchors.hasOwnProperty(key)) {
                var control = anchors[key];
                if (control.getMain()) {
                    if (!owner || owner.contain(anchors[key])) {
                        ret.push(key);
                    }
                } else {
                    delete anchors[key];
                }
            }
        }
        return ret;
    };
}());
