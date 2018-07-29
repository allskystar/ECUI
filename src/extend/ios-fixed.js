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

    /**
     * IOS fixed定位插件加载。
     * @public
     *
     * @param {ecui.ui.Control} control 需要应用插件的控件
     * @param {string} value 插件的参数
     */
    ext.iosFixed = function (control, value) {
        if (value === 'bottom') {
            bottomList.push(control);
        } else {
            topList.push(control);
        }

        core.addEventListener(control, 'dispose', function () {
            util.remove(topList, this);
            util.remove(bottomList, this);
        });
    };

    /**
     * 获取当前处于显示状态的控件。
     * @public
     *
     * @return {Array} 控件列表，每一个元素包含{control: [ecui.ui.Control], top: [boolean]}
     */
    ext.iosFixed.getVisibles = function () {
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
    };
}());
