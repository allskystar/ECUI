//{if $css}//
ecui.__ControlStyle__('\
.ui-select {\
    position: relative;\
\
    .ui-select-text {\
        position: absolute !important;\
        overflow: hidden !important;\
    }\
\
    input {\
        position: absolute !important;\
        z-index: -1 !important;\
        opacity: 0 !important;\
    }\
}\
\
.ui-select-options {\
    overflow: auto !important;\
    overflow-x: hidden !important;\
}\
');
//{/if}//
/*
@example
<select ui="type:select;placeholder:请选择" name="sex">
    <option value="male" selected="selected">男</option>
    <option value="female">女</option>
</select>
或
<div ui="type:select;name:sex;value:male;placeholder:请选择">
    <div ui="value:male">男</div>
    <div ui="value:female">女</div>
</div>
或
<div ui="type:select">
    <input type="text" class="ui-hide" name="sex" value="male" placeholder="请选择">
    <div ui="value:male">男</div>
    <div ui="value:female">女</div>
</div>

@fields
_nOptionSize  - 下接选择框可以用于选择的条目数量
*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui,

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
//{/if}//
    /**
     * 下拉框刷新。
     * @private
     */
    function refresh(options) {
        var item = options.getSelected();
        if (item) {
            options.setSelecting(item);
            options.getBody().scrollTop = item.getMain().offsetTop;
        }
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
        ui.abstractSelect,
        'ui-select',
        function (el, options) {
            _super(el, options);
            // 初始化下拉区域最多显示的选项数量
            this._nOptionSize = options.optionSize || 10;
        },
        {
            /**
             * 选项框部件。
             * @unit
             */
            Options: core.inherits(
                ui.abstractSelect.prototype.Options,
                {
                    /**
                     * 选项部件。
                     * @unit
                     */
                    Item: core.inherits(
                        ui.abstractSelect.prototype.Options.prototype.Item,
                        'ui-select-item'
                    ),

                    /**
                     * 选项控件发生变化的处理。
                     * @protected
                     */
                    $alterItems: function () {
                        var select = this.getParent();
                        // 设置options框的大小，如果没有元素，至少有一个单位的高度
                        this.$setSize(select.getWidth(), (Math.min(this.getItems().filter(function (item) {
                            // 只有处于显示状态的选项才计入高度
                            return item.isShow();
                        }).length, select._nOptionSize) || 1) * select.getClientHeight() + this.getMinimumHeight());
                    },

                    /**
                     * @override
                     */
                    $show: function () {
                        _super.$show();
                        refresh(this);
                    }
                }
            ),

            /**
             * 通过上下键与回车键操作下拉框。
             * @override
             */
            $keydown: function (event) {
                _super.$keydown(event);

                if (event.which === 13 || event.which === 27 || event.which === 38 || event.which === 40) {
                    event.exit();
                }
            },

            /**
             * 通过上下键与回车键操作下拉框。
             * @override
             */
            $keypress: function (event) {
                _super.$keypress(event);

                if (event.which === 13 || event.which === 27 || event.which === 38 || event.which === 40) {
                    event.exit();
                }
            },

            /**
             * 通过上下键与回车键操作下拉框。
             * @override
             */
            $keyup: function (event) {
                _super.$keyup(event);

                var which = event.which,
                    options = this.getPopup(),
                    list = options.getItems(),
                    step = this.getClientHeight(),
                    selecting = options.getSelecting(),
                    selected = options.getSelected();

                if (which === core.getKey()) {
                    // 当前不能存在鼠标操作，否则屏蔽按键
                    if (which === 40 || which === 38) {
                        if (list.length) {
                            if (options.isShow()) {
                                if (!selecting.isHovered()) {
                                    // 鼠标悬停时不允许切换
                                    options.setSelecting(list[which = Math.min(Math.max(0, list.indexOf(selecting) + which - 39), list.length - 1)]);
                                    which -= this.getBody().scrollTop / step;
                                    this.getBody().scrollTop += (which < 0 ? which : which >= this._nOptionSize ? which - this._nOptionSize + 1 : 0) * step;
                                }
                            } else {
                                var oldIndex = list.indexOf(selected),
                                    index = Math.min(Math.max(0, oldIndex + which - 39), list.length - 1);
                                if (oldIndex !== index) {
                                    options.setSelected(index);
                                    core.dispatchEvent(this, 'change', event);
                                }
                            }
                        }
                        event.exit();
                    } else if (which === 27 || (which === 13 && options.isShow())) {
                        // 回车键选中，ESC键取消
                        if (which === 13) {
                            if (selecting && selected !== selecting) {
                                options.setSelected(selecting);
                                core.dispatchEvent(this, 'change', event);
                            }
                        }
                        options.hide();
                        event.exit();
                    }
                }
            },

            /**
             * @override
             */
            $mousewheel: function (event) {
                _super.$mousewheel(event);
                var body = this.getBody(),
                    target = event.getTarget();
                if (ieVersion < 9 || (target && body.contains(target.getMain()) && ((!body.scrollTop && event.deltaY < 0) || (body.scrollTop === body.scrollHeight - body.clientHeight && event.deltaY > 0)))) {
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
                var options = this.getPopup();
                this._nOptionSize = value;
                options.alterItems();
                if (options.isShow()) {
                    refresh(options);
                }
            }
        },
        ui.iPopup
    );
})();
