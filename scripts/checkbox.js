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
_nStatus   - 复选框当前的状态，0--全选，1--未选，2--半选
_cSuperior - 复选框的上级管理者
_aInferior - 所有的下级复选框
*/
//{if 0}//
(function () {

    var core = ecui,
        array = core.array,
        ui = core.ui,
        util = core.util,

        remove = array.remove,
        inherits = util.inherits,

        INIT = core.INIT,

        $connect = core.$connect,
        getKey = core.getKey,
        getStatus = core.getStatus,

        UI_EDIT = ui.Edit,
        UI_EDIT_CLASS = UI_EDIT.prototype;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化复选框控件。
     * params 参数支持的属性如下：
     * checked  控件是否默认选中
     * superior 管理复选框的 id
     * @public
     *
     * @param {Element} el 关联的 Element 对象
     * @param {Object} params 初始化参数
     */
    //__gzip_original__UI_CHECKBOX
    var UI_CHECKBOX =
        ui.Checkbox = function (el, params) {
            params.hidden = true;
            params.input = 'checkbox';

            UI_EDIT.call(this, el, params);
            if (params.checked) {
                this.getInput().checked = true;
            }

            this._aInferior = [];

            $connect(this, this.setSuperior, params.superior);
        },
        UI_CHECKBOX_CLASS = inherits(UI_CHECKBOX, UI_EDIT);
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
            control.getInput().checked = !status;

            // 如果有上级复选框，刷新上级复选框的状态
            if (control._cSuperior) {
                UI_CHECKBOX_FLUSH(control._cSuperior);
            }

            control.change();
        }
    }

    /**
     * 复选框控件刷新，计算所有从复选框，根据它们的选中状态计算自身的选中状态。
     * @private
     *
     * @param {ecui.ui.Checkbox} control 复选框控件
     */
    function UI_CHECKBOX_FLUSH(control) {
        for (var i = 0, status, o; o = control._aInferior[i++]; ) {
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
        UI_EDIT_CLASS.$click.call(this, event);
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
        UI_EDIT_CLASS['$' + event.type].call(this, event);
        if (event.which == 32) {
            if (event.type == 'keyup' && getKey() == 32) {
                this.setChecked(!!this._nStatus);
            }
            return false;
        }
    };

    /**
     * 控件自动渲染全部完成后的处理。
     * 页面刷新时，部分浏览器会回填输入框的值，需要在回填结束后触发设置控件的状态。
     * @protected
     */
    UI_CHECKBOX_CLASS.$ready = function () {
        if (!this._aInferior.length) {
            UI_CHECKBOX_CHANGE(this, this.getInput().checked ? 0 : 1);
        }
    };

    /**
     * 设置当前控件的父控件。
     * 复选框控件改变父控件时，还需要同步清除主从附属关系。
     * @public
     *
     * @param {ecui.ui.Control|HTMLElement} parent 父控件对象/父 Element 对象，忽略参数则将控件移出 DOM 树
     */
    UI_CHECKBOX_CLASS.$setParent = function (parent) {
        UI_EDIT_CLASS.$setParent.call(this, parent);
        if (!parent && getStatus() != INIT) {
            this.setSuperior();
        }
    };

    /**
     * 获取全部的从属复选框。
     * 复选框控件调用 setSuperior 方法指定了上级复选框控件后，它就是上级复选框控件的从属复选框控件之一。
     * @public
     *
     * @return {Array} 复选框控件数组
     */
    UI_CHECKBOX_CLASS.getInferiors = function () {
        return this._aInferior.slice();
    };

    /**
     * 获取上级复选框。
     * getSuperior 方法返回调用 setSuperior 方法指定的上级复选框控件。
     * @public
     *
     * @return {ecui.ui.Checkbox} 复选框控件
     */
    UI_CHECKBOX_CLASS.getSuperior = function () {
        return this._cSuperior || null;
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
     * @param {boolean} status 是否选中，默认选中
     */
    UI_CHECKBOX_CLASS.setChecked = function (status) {
        UI_CHECKBOX_CHANGE(this, status !== false ? 0 : 1);
        // 如果有下级复选框，全部改为与当前复选框相同的状态
        for (var i = 0, o; o = this._aInferior[i++]; ) {
            o.setChecked(status);
        }
    };

    /**
     * 设置上级复选框。
     * setSuperior 方法指定上级复选框控件后，可以通过访问上级复选框控件的 getInferiors 方法获取列表，列表中即包含了当前的控件。
     * @public
     *
     * @param {ecui.ui.Checkbox} superior 上级复选框控件
     */
    UI_CHECKBOX_CLASS.setSuperior = function (superior) {
        var oldSuperior = this._cSuperior;
        if (oldSuperior != superior) {
            this._cSuperior = superior;

            // 已经设置过上级复选框，需要先释放
            if (oldSuperior) {
                remove(oldSuperior._aInferior, this);
                UI_CHECKBOX_FLUSH(oldSuperior);
            }

            if (superior) {
                superior._aInferior.push(this);
                UI_CHECKBOX_FLUSH(superior);
            }
        }
    };
//{/if}//
//{if 0}//
})();
//{/if}//