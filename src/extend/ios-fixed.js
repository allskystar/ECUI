/*
ios-fixed - ios下的fixed定位插件，修复软键盘不能正确定位的问题。
@example:
<div ui="ext-ios-fixed:[top|bottom]">...</div>
*/
(function () {
//{if 0}//
    var core = ecui,
        ext = core.ext,
        util = core.util;
//{/if}//
    var topList = [],
        bottomList = [];

    ext.iosFixed = {
        /**
         * IOS fixed定位插件加载。
         * @public
         *
         * @param {string} value 插件的参数，表示定位的位置，top或者是bottom
         */
        constructor: function (value) {
            if (value === 'bottom') {
                bottomList.push(this);
            } else {
                topList.push(this);
            }
        },

        Events: {
            dispose: function () {
                util.remove(topList, this);
                util.remove(bottomList, this);
            },

            mousemove: function (event) {
                event.preventDefault();
            }
        },

        /**
         * 获取当前处于显示状态的控件。
         * @public
         *
         * @return {Array} 控件列表，每一个元素包含{control: [ecui.ui.Control], top: [boolean]}
         */
        getVisibles: function () {
            return topList.filter(function (item) {
                return item.isShow();
            }).map(function (item) {
                return {control: item, top: true};
            }).concat(
                bottomList.filter(function (item) {
                    return item.isShow();
                }).map(function (item) {
                    return {control: item, top: false};
                })
            );
        }
    };
}());
