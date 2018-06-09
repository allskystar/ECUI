/*
@example
<select ui="type:select" name="sex">
    <option value="male" selected="selected">男</option>
    <option value="female">女</option>
</select>
或
<div ui="type:select;name:sex;value:male">
    <div ui="value:male">男</div>
    <div ui="value:female">女</div>
</div>

@fields
_nOptionSize  - 下接选择框可以用于选择的条目数量
_cSelected    - 当前选中的选项
_uText        - 下拉框的文本框
_uOptions     - 下拉选择框
_bRequired    - 是否必须选择
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
//{/if}//
    /**
     * 下拉框刷新。
     * @private
     *
     * @param {ecui.ui.Select} select 下拉框控件
     */
    function refresh(select) {
        if (select._cSelected) {
            core.setFocused(select._cSelected);
        }
        select._uOptions.getBody().scrollTop = select.getBodyHeight() * select.getItems().indexOf(select._cSelected);
    }

    /**
     * 下拉框控件。
     * 扩展了原生 SelectElement 的功能，允许指定下拉选项框的最大选项数量，在屏幕显示不下的时候，会自动显示在下拉框的上方。在没有选项时，下拉选项框有一个选项的高度。下拉框控件允许使用键盘与滚轮操作，在下拉选项框打开时，可以通过回车键或鼠标点击选择，上下键选择选项的当前条目，在关闭下拉选项框后，只要拥有焦点，就可以通过滚轮上下选择选项。
     * options 属性：
     * optionSize     下拉框最大允许显示的选项数量，默认为5
     * required       是否必须选择
     * @control
     */
    ui.Select = core.inherits(
        ui.$select,
        'ui-select',
        function (el, options) {
            // 初始化下拉区域最多显示的选项数量
            this._nOptionSize = options.optionSize || 10;
            ui.$select.call(this, el, options);
        },
        {

            /**
             * 选项框部件。
             * @unit
             */
            Options: core.inherits(
                ui.Control,
                {
                    /**
                     * @override
                     */
                    $show: function () {
                        ui.Control.prototype.$show.call(this);
                        refresh(this.getParent());
                    }
                }
            ),

            /**
             * 选项控件发生变化的处理。
             * 在 选项组接口 中，选项控件发生添加/移除操作时调用此方法。虚方法，子控件必须实现。
             * @protected
             */
            $alterItems: function () {
                var step = this.getBodyHeight(),
                    width = this.getWidth(),
                    itemLength = this.getItems().length;

                if (dom.getParent(this._uOptions.getOuter())) {
                    // 为了设置激活状态样式, 因此必须控制下拉框中的选项必须在滚动条以内
                    this.setItemSize(width - this._uOptions.getMinimumWidth() - (itemLength > this._nOptionSize ? core.getScrollNarrow() : 0), step);
                    // 设置options框的大小，如果没有元素，至少有一个单位的高度
                    this._uOptions.$setSize(width, (Math.min(itemLength, this._nOptionSize) || 1) * step + this._uOptions.getMinimumHeight());
                }
            },

            /**
             * 弹出层初始化。
             * @protected
             */
            $initPopup: function () {
                this.alterItems();
            },


            /**
             * 通过上下键与回车键操作下拉框。
             * @override
             */
            $keydown: function (event) {
                ui.InputControl.prototype.$keydown.call(this, event);

                if (event.which === 13 || event.which === 27 || event.which === 38 || event.which === 40) {
                    event.exit();
                }
            },

            /**
             * 通过上下键与回车键操作下拉框。
             * @override
             */
            $keypress: function (event) {
                ui.InputControl.prototype.$keypress.call(this, event);

                if (event.which === 13 || event.which === 27 || event.which === 38 || event.which === 40) {
                    event.exit();
                }
            },

            /**
             * 通过上下键与回车键操作下拉框。
             * @override
             */
            $keyup: function (event) {
                ui.InputControl.prototype.$keyup.call(this, event);

                var which = event.which,
                    list = this.getItems(),
                    step = this.getBodyHeight(),
                    focus = core.getFocused();

                if (which === core.getKey()) {
                    if (this.isFocused()) {
                        // 当前不能存在鼠标操作，否则屏蔽按键
                        if (which === 40 || which === 38) {
                            if (list.length) {
                                if (this._uOptions.isShow()) {
                                    core.setFocused(list[which = Math.min(Math.max(0, list.indexOf(focus) + which - 39), list.length - 1)]);
                                    which -= this.getBody().scrollTop / step;
                                    this.getBody().scrollTop += (which < 0 ? which : which >= this._nOptionSize ? which - this._nOptionSize + 1 : 0) * step;
                                } else {
                                    var oldIndex = list.indexOf(this._cSelected),
                                        index = Math.min(Math.max(0, oldIndex + which - 39), list.length - 1);
                                    if (oldIndex !== index) {
                                        this.setSelectedIndex(index);
                                        core.dispatchEvent(this, 'change', event);
                                    }
                                }
                            }
                            event.exit();
                        } else if (which === 27 || (which === 13 && this._uOptions.isShow())) {
                            // 回车键选中，ESC键取消
                            if (which === 13) {
                                if (focus.getParent() === this && this._cSelected !== focus) {
                                    this.setSelected(focus);
                                    core.dispatchEvent(this, 'change', event);
                                }
                            }
                            this._uOptions.hide();
                            event.exit();
                        }
                    }
                }
            },

            /**
             * @override
             */
            $mousewheel: function (event) {
                ui.InputControl.prototype.$mousewheel.call(this, event);
                var body = this.getBody(),
                    target = event.getTarget();
                if (ieVersion < 9 || (target && dom.contain(body, target.getOuter()) && ((!body.scrollTop && event.deltaY < 0) || (body.scrollTop === body.scrollHeight - body.clientHeight && event.deltaY > 0)))) {
                    event.preventDefault();
                }
                event.stopPropagation();
            },

            /**
             * 设置下拉框允许显示的选项数量。
             * 如果实际选项数量小于这个数量，没有影响，否则将出现垂直滚动条，通过滚动条控制其它选项的显示。
             * @public
             *
             * @param {number} value 显示的选项数量，必须大于 1
             */
            setOptionSize: function (value) {
                this._nOptionSize = value;
                this.alterItems();
                if (this._uOptions.isShow()) {
                    refresh(this);
                    this.setPopupPosition();
                }
            }
        },
        ui.Popup
    );
}());
