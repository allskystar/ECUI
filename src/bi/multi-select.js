/*
多选下拉控件初始化的例子:
<div class="search-input" ui="type:b-multi-select;">
    <label><div ui="type:checkbox;value:2;"></div>行政部</label>
    <label><div ui="type:checkbox;value:3;"></div>人事部</label>
    <label><div ui="type:checkbox;value:4;"></div>财务部</label>
    <label><div ui="type:checkbox;value:5;"></div>市场部</label>
    <label><div ui="type:checkbox;value:6;"></div>销售部</label>
    <label><div ui="type:checkbox;value:7;"></div>技术部</label>
    <div class="ui-operate">
        <button type="button" class="ui-button cancel">取消</button>
        <button type="button"  class="ui-button sure">确定</button>
    </div>
</div>

*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = ecui.util;
//{/if}//
    /**
     * 多选下拉控件。
     * options 属性：
     * @control
     */
    ui.BMultiSelect = core.inherits(
        ui.InputControl,
        'ui-custome-check-box',
        function (el, options) {
            util.setDefault(options, 'readOnly', true);
            util.setDefault(options, 'inputType', 'text');
            var oldEl = el;
            el = dom.insertBefore(
                dom.create(
                    {
                        className: el.className + ' ui-custome-check-box-input',
                        innerHTML: '<div class="ui-custome-check-box-text"></div>',
                        style: {
                            cssText: el.style.cssText
                        }
                    }
                ),
                el
            );
            ui.InputControl.call(this, el, options);

            oldEl.className += ' ui-custome-check-box-popup ui-popup ui-hide';
            this._uPopup = core.$fastCreate(ui.Control, oldEl, this);

            this.$setBody(oldEl);
            // 初始化下拉区域最多显示的选项数量
            this.setPopup(this._uPopup);
            this._cValue = [];
        },
        {
            VALUEHTML: '已选 {0} 个',
            $click: function (event) {
                var target = event.target;
                var _this = this, value = [];
                if (target.tagName === 'BUTTON') {
                    this._uPopup.hide();
                    if (ecui.dom.hasClass(target, 'sure')) {
                        var checkBox = ecui.query(function (item) {
                            return item instanceof ecui.ui.Checkbox && item.getParent() === this.getPopup();
                        }, this);
                        // this._cValue = [];
                        var content = [];
                        checkBox.forEach(function (item) {
                            if (item.isChecked()) {
                                if (!_this._cValue.includes(item.getValue())) {
                                    value.push(item.getValue());
                                    content.push(ecui.dom.getParent(item.getMain()).innerText);
                                }
                            }
                        }, this);

                        // 添加选项的value
                        this._cValue = this._cValue.concat(value);
                        // 添加选项的text
                        this.getMain().firstChild.innerHTML = util.formatString(this.VALUEHTML, this._cValue.length || 0);
                        // 将改变的值通过event.value传给回调函数
                        event.changeValue = value;
                        core.triggerEvent(this, 'change', event);
                    }
                }
            },
            getValue: function () {
                return this._cValue;
            },
            deleteValue: function (value) {
                if (value !== undefined) {
                    var index = this._cValue.indexOf(value),
                        str;
                    if (index !== -1) {
                        this._cValue.splice(index, 1);
                        str = this.getMain().firstChild.innerHTML.split('，');
                        str.splice(index, 1);
                        this.getMain().firstChild.innerHTML = str.join('，');
                    }
                } else {
                    this._cValue = [];
                }
            }
        },
        ui.Popup
    );
})();
