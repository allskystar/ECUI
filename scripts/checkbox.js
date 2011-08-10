/*
Checkbox - 定义单个设置项选择状态的基本操作。
复选框控件，继承自输入框控件，实现了对原生 InputElement 复选框的功能扩展，支持复选框之间的主从关系定义。当一个复选框的
“从复选框”选中一部分时，“主复选框”将处于半选状态，这种状态逻辑意义上等同于未选择状态，但显示效果不同，复选框的主从关系
可以有多级。

复选框控件直接HTML初始化的例子:
<input ecui="type:checkbox;checked:true" type="checkbox" name="test" value="test" checked="checked" />
也可以使用其它标签初始化:
<div ecui="type:checkbox;checked:true;name:test">
    <!-- 如果ec中不指定name，也可以在input中指定 -->
    <input name="test" />
</div>

属性
_bDefault        - 默认的选中状态
_nStatus         - 复选框当前的状态，0--全选，1--未选，2--半选
_cParentCheckbox - 父复选框
_aChildCheckboxs - 所有的子复选框
*/
//{if 0}//
(function () {

    var core = ecui,
        array = core.array,
        ui = core.ui,

        remove = array.remove,

        $connect = core.$connect,
        getKey = core.getKey,
        inheritsControl = core.inherits,

        UI_INPUT_CONTROL = ui.InputControl,
        UI_INPUT_CONTROL_CLASS = UI_INPUT_CONTROL.prototype;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化复选框控件。
     * options 对象支持的属性如下：
     * checked        控件是否默认选中
     * parentCheckbox 管理复选框的 id
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ///__gzip_original__UI_CHECKBOX
    ///__gzip_original__UI_CHECKBOX_CLASS
    var UI_CHECKBOX = ui.Checkbox =
        inheritsControl(
            UI_INPUT_CONTROL,
            'ui-checkbox',
            function (el, options) {
                el = this.getInput();

                if (options.checked) {
                    el.defaultChecked = el.checked = true;
                }

                // 保存节点选中状态，用于修复IE6/7下移动DOM节点时选中状态发生改变的问题
                this._bDefault = el.defaultChecked;
                this._aChildCheckboxs = [];

                $connect(this, this.setParentCheckbox, options.parentCheckbox);
            },
            function (el, options) {
                options.hidden = true;
                options.input = 'checkbox';
            }
        ),
        UI_CHECKBOX_CLASS = UI_CHECKBOX.prototype;
//{else}//
    /**
     * 改变复选框状态。
     * @private
     *
     * @param {ecui.ui.Checkbox} control 复选框对象
     * @param {number} status 新的状态，0--全选，1--未选，2--半选
     */
    function UI_CHECKBOX_CHANGE(control, status) {
        if (status !== control._nStatus) {
            // 状态发生改变时进行处理
            control.setClass(control.getBaseClass() + ['-checked', '', '-part'][status]);

            control._nStatus = status;

            var el = control.getInput();
            el.defaultChecked = el.checked = !status;

            // 如果有父复选框，刷新父复选框的状态
            if (control._cParentCheckbox) {
                UI_CHECKBOX_FLUSH(control._cParentCheckbox);
            }
        }
    }

    /**
     * 复选框控件刷新，计算所有从复选框，根据它们的选中状态计算自身的选中状态。
     * @private
     *
     * @param {ecui.ui.Checkbox} control 复选框控件
     */
    function UI_CHECKBOX_FLUSH(control) {
        for (var i = 0, status, o; o = control._aChildCheckboxs[i++]; ) {
            if (status !== undefined && status != o._nStatus) {
                status = 2;
                break;
            }
            status = o._nStatus;
        }

        if (status !== undefined) {
            UI_CHECKBOX_CHANGE(control, status);
        }
    }

    /**
     * 鼠标单击控件事件的默认处理。
     * 控件点击时将改变当前的选中状态。如果控件处于可操作状态(参见 isEnabled)，click 方法触发 onclick 事件，如果事件返回值不为 false，则调用 $click 方法。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_CHECKBOX_CLASS.$click = function (event) {
        UI_INPUT_CONTROL_CLASS.$click.call(this, event);
        this.setChecked(!!this._nStatus);
    };

    /**
     * 控件拥有焦点时，键盘事件的默认处理。
     * 屏蔽空格键按下事件。Opera 下仅用 keydown 不能屏蔽空格键事件，还需要在 keypress 中屏蔽。如果控件处于可操作状态(参见 isEnabled)，keydown/keypress/keyup 方法触发 onkeydown/onkeypress/onkeyup 事件，如果事件返回值不为 false，则调用 $keydown/$keypress/$keyup 方法。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_CHECKBOX_CLASS.$keydown = UI_CHECKBOX_CLASS.$keypress = UI_CHECKBOX_CLASS.$keyup = function (event) {
        UI_INPUT_CONTROL_CLASS['$' + event.type].call(this, event);
        if (getKey() == 32) {
            // 屏蔽空格键，防止屏幕发生滚动
            if (event.type == 'keyup') {
                this.setChecked(!!this._nStatus);
            }
            event.exit();
        }
    };

    /**
     * 控件自动渲染全部完成后的处理。
     * 页面刷新时，部分浏览器会回填输入框的值，需要在回填结束后触发设置控件的状态。
     * @protected
     */
    UI_CHECKBOX_CLASS.$ready = function () {
        if (!this._aChildCheckboxs.length) {
            // 如果控件是父复选框，应该直接根据子复选框的状态来显示自己的状态
            UI_CHECKBOX_CHANGE(this, this.getInput().checked ? 0 : 1);
        }
    };

    /**
     * 输入框控件重置的默认处理。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_CHECKBOX_CLASS.$reset = function (event) {
        // 修复IE6/7下移动DOM节点时选中状态发生改变的问题
        this.getInput().checked = this._bDefault;
        UI_INPUT_CONTROL_CLASS.$reset.call(this, event);
    };

    /**
     * 获取全部的子复选框。
     * 复选框控件调用 setParentCheckbox 方法指定了父复选框后，它就是父复选框的子复选框之一。
     * @public
     *
     * @return {Array} 复选框控件数组
     */
    UI_CHECKBOX_CLASS.getChildCheckboxs = function () {
        return this._aChildCheckboxs.slice();
    };

    /**
     * 获取父复选框。
     * getParentCheckbox 方法返回调用 setParentCheckbox 方法指定的父复选框控件。
     * @public
     *
     * @return {ecui.ui.Checkbox} 复选框控件
     */
    UI_CHECKBOX_CLASS.getParentCheckbox = function () {
        return this._cParentCheckbox || null;
    };

    /**
     * 判断控件是否选中。
     * @public
     *
     * @return {boolean} 是否选中
     */
    UI_CHECKBOX_CLASS.isChecked = function () {
        return !this._nStatus;
    };

    /**
     * 设置复选框控件选中状态。
     * @public
     *
     * @param {boolean} checked 是否选中，默认选中
     */
    UI_CHECKBOX_CLASS.setChecked = function (checked) {
        UI_CHECKBOX_CHANGE(this, checked !== false ? 0 : 1);
        // 如果有子复选框，全部改为与当前复选框相同的状态
        for (var i = 0, o; o = this._aChildCheckboxs[i++]; ) {
            o.setChecked(checked);
        }
    };

    /**
     * 设置父复选框。
     * setParentCheckbox 方法指定父复选框控件后，可以通过访问父复选框控件的 getChildCheckboxs 方法获取列表，列表中即包含了当前的控件。
     * @public
     *
     * @param {ecui.ui.Checkbox} parent 父复选框
     */
    UI_CHECKBOX_CLASS.setParentCheckbox = function (parent) {
        var oldParent = this._cParentCheckbox;
        if (oldParent != parent) {
            this._cParentCheckbox = parent;

            if (oldParent) {
                // 已经设置过父复选框，需要先释放引用
                remove(oldParent._aChildCheckboxs, this);
                UI_CHECKBOX_FLUSH(oldParent);
            }

            if (parent) {
                parent._aChildCheckboxs.push(this);
                UI_CHECKBOX_FLUSH(parent);
            }
        }
    };
//{/if}//
//{if 0}//
})();
//{/if}//