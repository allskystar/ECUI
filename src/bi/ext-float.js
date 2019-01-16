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

    /**
     * 获取dom元素距离body顶部的距离。
     * @private
     *
     * @param {HTMLElement} el  获取位置的 Element 对象
     */
    function getOffset(el) {

        var top = 0,
            left = 0;
        for (; el !== document.body; ) {
            top += el.offsetTop;
            left += el.offsetLeft;
            if (el.tagName === 'TD' || el.tagName === 'TH' || el.tagName === 'TR' || el.tagName === 'TBODY' || el.tagName === 'THEAD') {
                el = dom.parent(el);
            } else {
                el = el.offsetParent;
            }
        }
        return { left: left, top: top };
    }

    ext.floatTop = {
        /**
         * esr数据名跟踪插件初始化。
         * @public
         *
         * @param {string} value 插件的参数，格式为 变量名@#模板名 或 变量名@js函数名 ，表示指定的变量变化时，需要刷新控件内部HTML
         */
        constructor: function (options) {
            this._sExtFloat = true;
            this._sFloatTop = options.floattop || 0;
        },

        Events: {
            scroll: function () {
                var el = dom.parent(dom.parent(this.getMain())),
                    offset = getOffset(el),
                    top = window.scrollY + this._sFloatTop - offset.top;
                // 设置偏移量
                if (top > 0) {
                    el.style.transform = 'translateY(' + top + 'px)';
                    el.style.MozTransform = 'translateY(' + top + 'px)';
                    el.style.MsTransform = 'translateY(' + top + 'px)';
                    el.style.webkitTransform = 'translateY(' + top + 'px)';
                } else {
                    el.style.transform = '';
                    el.style.MozTransform = '';
                    el.style.MsTransform = '';
                    el.style.webkitTransform = '';
                }
            }
        }
    };
}());
