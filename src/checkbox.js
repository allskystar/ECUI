/*
@example
<input ui="type:checkbox;subject:china" name="city" value="beijing" checked="checked" type="checkbox">
或
<div ui="type:checkbox;name:city;value:beijing;checked:true;subject:china"></div>
或
<div ui="type:checkbox;subject:china">
    <input name="city" value="beijing" checked="checked" type="checkbox">
</div>

@fields
_bDefault        - 缺省的选中状态
_nStatus         - 复选框当前的状态，0--全选，1--未选，2--半选
_cSubject        - 主复选框
_aDependents     - 全部的从属复选框
_bRequired       - 是否必须选择
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 为控件的 INPUT 节点绑定事件。
     * @private
     */
    function changeHandler(event) {
        var control = core.wrapEvent(event).target.getControl();
        control.setChecked(control.getInput().checked);
    }

    /**
     * 复选框控件刷新，计算所有从复选框，根据它们的选中状态计算自身的选中状态。
     * @private
     *
     * @param {ecui.ui.Checkbox} checkbox 复选框控件
     */
    function refresh(checkbox) {
        var status;
        checkbox._aDependents.forEach(function (item) {
            if (status !== undefined && status !== item._nStatus) {
                status = 2;
            } else {
                status = item._nStatus;
            }
        });

        if (status !== undefined) {
            setStatus(checkbox, status);
        }
    }

    /**
     * 改变复选框状态。
     * @private
     *
     * @param {ecui.ui.Checkbox} checkbox 复选框控件
     * @param {number} status 新的状态，0--全选，1--未选，2--半选
     */
    function setStatus(checkbox, status) {
        if (status !== checkbox._nStatus) {
            // 状态发生改变时进行处理
            checkbox.alterSubType(['checked', '', 'part'][status]);

            checkbox._nStatus = status;

            var el = checkbox.getInput();
            el.defaultChecked = el.checked = !status;

            // 如果有主复选框，刷新主复选框的状态
            if (checkbox._cSubject) {
                refresh(checkbox._cSubject);
            }
            core.triggerEvent(checkbox, 'change');
        }
    }

    /**
     * 复选框控件。
     * 实现了对原生 InputElement 复选框的功能扩展，支持复选框之间的主从关系定义。当一个复选框的“从复选框”选中一部分时，“主复选框”将处于半选状态，这种状态逻辑意义上等同于未选择状态，但显示效果不同，复选框的主从关系可以有多级。复选框控件适用所有在一组中允许选择多个目标的交互，并不局限于此分组的表现形式(文本、图片等)。
     * options 属性：
     * subject     主复选框 ID，会自动与主复选框建立关联后，作为主复选框的从属复选框之一
     * required    是否必须选择
     * @control
     */
    ui.Checkbox = core.inherits(
        ui.InputControl,
        'ui-checkbox',
        function (el, options) {
            util.setDefault(options, 'inputType', 'checkbox');

            ui.InputControl.call(this, el, options);

            // 保存节点选中状态，用于修复IE6/7下移动DOM节点时选中状态发生改变的问题
            this._bDefault = this.getInput().defaultChecked;
            this._aDependents = [];

            core.delegate(options.subject, this, this.setSubject);
            dom.addEventListener(this.getInput(), 'change', changeHandler);

            this._bRequired = !!options.required;
        },
        {
            /**
             * 控件点击时改变当前的选中状态。
             * @override
             */
            $click: function (event) {
                ui.InputControl.prototype.$click.call(this, event);
                for (var el = this.getMain(); el; el = dom.getParent(el)) {
                    if (el.tagName === 'LABEL') {
                        return;
                    }
                }
                this.setChecked(!!this._nStatus);
            },

            /**
             * @override
             */
            $dispose: function () {
                this.setSubject();
                this._aDependents.forEach(function (item) {
                    item._cSubject = null;
                });
                ui.InputControl.prototype.$dispose.call(this);
            },

            /**
             * 空格键按下时选中。
             * @override
             */
            $keydown: function (event) {
                ui.InputControl.prototype.$keydown.call(this, event);
                if (event.which === 32) {
                    event.preventDefault();
                }
            },

            /**
             * 空格键按下时选中。
             * @override
             */
            $keypress: function (event) {
                ui.InputControl.prototype.$keypress.call(this, event);
                if (event.which === 32) {
                    event.preventDefault();
                }
            },

            /**
             * 空格键按下时选中。
             * @override
             */
            $keyup: function (event) {
                ui.InputControl.prototype.$keyup.call(this, event);
                if (event.which === 32) {
                    if (core.getKey() === 32) {
                        this.setChecked(!!this._nStatus);
                    }
                    event.preventDefault();
                }
            },

            /**
             * @override
             */
            $ready: function (event) {
                ui.InputControl.prototype.$ready.call(this, event);
                if (!this._aDependents.length) {
                    // 如果控件是主复选框，应该直接根据从属复选框的状态来显示自己的状态
                    setStatus(this, this.getInput().checked ? 0 : 1);
                }
            },

            /**
             * @override
             */
            $reset: function () {
                // 修复IE6/7下移动DOM节点时选中状态发生改变的问题
                this.getInput().checked = this._bDefault;
                ui.InputControl.prototype.$reset.call(this);
            },

            /**
             * @override
             */
            $validate: function (event) {
                ui.InputControl.prototype.$validate.call(this, event);

                if (this._bRequired) {
                    var name = this.getName(),
                        form = this.getInput().form,
                        nochecked = true,
                        group = core.query(function (item) {
                            if (item instanceof ui.Checkbox && item.getName() === name && item.getInput().form === form) {
                                if (item.isChecked()) {
                                    nochecked = false;
                                }
                                return true;
                            }
                        });

                    if (nochecked) {
                        for (var control = this; control = control.getParent(); ) {
                            if (control instanceof ui.InputGroup) {
                                core.triggerEvent(control, 'error');
                                return false;
                            }
                        }
                        group.forEach(function (item) {
                            core.triggerEvent(item, 'error');
                        });
                    }
                }
            },

            /**
             * 获取全部的从属复选框。
             * 复选框控件调用 setSubject 方法指定了主复选框后，它就是主复选框的从属复选框之一。
             * @public
             *
             * @return {Array} 复选框控件数组
             */
            getDependents: function () {
                return this._aDependents.slice();
            },

            /**
             * 获取主复选框。
             * getSubject 方法返回调用 setSubject 方法指定的主复选框控件。
             * @public
             *
             * @return {ecui.ui.Checkbox} 复选框控件
             */
            getSubject: function () {
                return this._cSubject || null;
            },

            /**
             * 判断控件是否选中。
             * @public
             *
             * @return {boolean} 是否选中
             */
            isChecked: function () {
                return !this._nStatus;
            },

            /**
             * 设置复选框控件选中状态。
             * @public
             *
             * @param {boolean} checked 是否选中
             */
            setChecked: function (checked) {
                setStatus(this, checked ? 0 : 1);
                // 如果有从属复选框，全部改为与当前复选框相同的状态
                this._aDependents.forEach(function (item) {
                    item._cSubject = null;
                    item.setChecked(checked);
                    item._cSubject = this;
                }, this);
            },

            /**
             * 设置主复选框。
             * setSubject 方法指定主复选框控件后，可以通过访问主复选框控件的 getDependents 方法获取列表，列表中即包含了当前的控件。请注意，控件从 DOM 树上被移除时，不会自动解除主从关系，联动可能出现异常，此时请调用 setSubject 方法传入空参数解除主从关系。
             * @public
             *
             * @param {ecui.ui.Checkbox} checkbox 主复选框
             */
            setSubject: function (checkbox) {
                if (this._cSubject !== checkbox) {
                    if (this._cSubject) {
                        // 已经设置过主复选框，需要先释放引用
                        util.remove(this._cSubject._aDependents, this);
                        refresh(this._cSubject);
                    }

                    if (checkbox) {
                        checkbox._aDependents.push(this);
                        refresh(checkbox);
                    }

                    this._cSubject = checkbox;
                }
            }
        }
    );
}());
