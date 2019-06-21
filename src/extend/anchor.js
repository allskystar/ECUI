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
        util = core.util,

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined,
        operaVersion = /opera\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined;
//{/if}//
    var anchors = {};

    ext.anchor = {

        /**
         * 锚点插件初始化。
         * @public
         *
         * @param {string} value 插件的参数，表示锚点的名称
         */
        constructor: function (value) {
            if (!anchors[value]) {
                anchors[value] = [];
            }
            anchors[value].push(this);
        },

        Events: {
            dispose: function () {
                for (var key in anchors) {
                    if (anchors.hasOwnProperty(key)) {
                        util.remove(anchors[key], this);
                        if (!anchors[key].length) {
                            delete anchors[key];
                        }
                    }
                }
            }
        },

        /**
         * 跳转到指定的锚点。
         * @public
         *
         * @param {string} name 锚点的名称
         */
        go: function (name) {
            var controls = anchors[name];
            if (controls) {
                controls.forEach(function (item) {
                    if (item.isShow()) {
                        if (operaVersion) {
                            document.body.scrollTop = dom.getPosition(item.getMain()).top;
                        } else {
                            item.getMain().scrollIntoView();
                        }
                    }
                });
            }
        },

        /**
         * 获取指定区域的锚点名称。
         * @public
         *
         * @param {ecui.ui.Control} owner 指定的区域，如果忽略表示返回所有锚点名称。
         */
        find: function (owner) {
            var ret = [];
            for (var key in anchors) {
                if (anchors.hasOwnProperty(key)) {
                    for (var i = 0, item; item = anchors[key][i++]; ) {
                        if (!owner || owner.contain(item)) {
                            ret.push(key);
                            break;
                        }
                    }
                }
            }
            return ret;
        }
    };
}());
