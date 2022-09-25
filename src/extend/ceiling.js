/*
ceiling - 吸顶插件，使用ext-ceiling的方式引用，指定的吸顶时距离顶部的位置。
@example:
[HTML]:<div ui="ext-ceiling:0">...</div>
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ext = core.ext,
        util = core.util,

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
//{/if}//
    var configures = {};

    ext.ceiling = {

        /**
         * 吸顶插件初始化。
         * @public
         *
         * @param {string} value 插件的参数，表示吸顶的位置
         */
        constructor: function (value) {
            configures[this.getUID()] = {
                top: +value,
                oldTop: 0
            };

            if (ieVersion < 9) {
                this.getMain().style.position = 'relative';
            }
        },

        Events: {
            dispose: function () {
                delete configures[this.getUID()];
            },

            scroll: function () {
                var configure = configures[this.getUID()],
                    el = this.getMain(),
                    top = Math.max(configure.top - dom.getPosition(el).top + configure.oldTop + util.getView().top, 0);

                configure.oldTop = top;
                if (ieVersion < 9) {
                    el.style.top = top + 'px';
                } else {
                    el.style[ieVersion === 9 ? 'msTransform' : 'transform'] = 'translateY(' + top + 'px)';
                }
            }
        }
    };
})();
