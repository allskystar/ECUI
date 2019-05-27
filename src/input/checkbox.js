/*
@example
<input ui="type:checkbox;subject:china" name="city" value="beijing" checked="checked" type="checkbox">
或
<div ui="type:checkbox;name:city;value:beijing;checked:true;subject:china"></div>
或
<div ui="type:checkbox;subject:china">
    <input name="city" value="beijing" checked="checked" type="checkbox">
</div>
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
            _super(el, options);

            var input = this.getInput();

            // 保存节点选中状态，用于修复IE6/7下移动DOM节点时选中状态发生改变的问题
            this.defaultChecked = input.defaultChecked;
            this.dependents = [];

            core.delegate(options.subject, this, this.setSubject);
            dom.addEventListener(input, 'change', changeHandler);
        },
        {
            SUPER_OPTIONS: {
                inputType: 'checkbox'
            },

            DEFAULT_OPTIONS: {
                required: Boolean(false)
            },

            private: {
                defaultChecked: undefined,
                dependents: undefined,
                subject: undefined,
                status: undefined,

                /**
                 * 复选框控件刷新，计算所有从复选框，根据它们的选中状态计算自身的选中状态。
                 * @private
                 */
                _refresh: function () {
                    var status;
                    this.dependents.forEach(function (item) {
                        if (status !== undefined && status !== item.status) {
                            status = 2;
                        } else {
                            status = item.status;
                        }
                    });

                    if (status !== undefined) {
                        this._setStatus(status);
                    }
                },

                /**
                 * 改变复选框状态。
                 * @private
                 *
                 * @param {number} status 新的状态，0--全选，1--未选，2--半选
                 */
                _setStatus: function (status) {
                    if (status !== this.status) {
                        this.$clearErrorStyle();
                        // 状态发生改变时进行处理
                        this.alterSubType(['checked', '', 'part'][status]);

                        this.status = status;

                        this.getInput().checked = !status;

                        // 如果有主复选框，刷新主复选框的状态
                        if (this.subject) {
                            this.subject._refresh();
                        }
                    }
                }
            },

            /**
             * 控件点击时改变当前的选中状态。
             * @override
             */
            $click: function (event) {
                _super.$click(event);
                for (var el = this.getMain(); el; el = dom.parent(el)) {
                    if (el.tagName === 'LABEL') {
                        return;
                    }
                }
                this.setChecked(!!this.status);
                core.dispatchEvent(this, 'change');
            },

            /**
             * @override
             */
            $dispose: function () {
                this.setSubject();
                this.dependents.forEach(function (item) {
                    item.subject = null;
                });
                _super.$dispose();
            },

            /**
             * 空格键按下时选中。
             * @override
             */
            $keydown: function (event) {
                _super.$keydown(event);
                if (event.which === 32) {
                    event.exit();
                }
            },

            /**
             * 空格键按下时选中。
             * @override
             */
            $keypress: function (event) {
                _super.$keypress(event);
                if (event.which === 32) {
                    event.exit();
                }
            },

            /**
             * 空格键按下时选中。
             * @override
             */
            $keyup: function (event) {
                _super.$keyup(event);
                if (event.which === 32) {
                    if (core.getKey() === 32) {
                        this.setChecked(!!this.status);
                        core.dispatchEvent(this, 'change');
                    }
                    event.exit();
                }
            },

            /**
             * @override
             */
            $reset: function () {
                // 修复IE6/7下移动DOM节点时选中状态发生改变的问题
                this.getInput().checked = this.defaultChecked;
                _super.$reset();
            },

            /**
             * @override
             */
            $validate: function (event) {
                _super.$validate(event);

                if (this.required) {
                    var name = this.getName(),
                        form = this.getInput().form,
                        nochecked = true,
                        group = core.query(function (item) {
                            if (ui.Checkbox.isInstance(item) && item.getName() === name && item.getInput().form === form) {
                                if (item.isChecked()) {
                                    nochecked = false;
                                }
                                return true;
                            }
                        });

                    if (nochecked) {
                        for (var control = this; control = control.getParent(); ) {
                            if (ui.InputGroup.isInstance(control)) {
                                core.dispatchEvent(control, 'error');
                                return false;
                            }
                        }
                        group.forEach(function (item) {
                            core.dispatchEvent(item, 'error');
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
                return this.dependents.slice();
            },

            /**
             * 获取主复选框。
             * getSubject 方法返回调用 setSubject 方法指定的主复选框控件。
             * @public
             *
             * @return {ecui.ui.Checkbox} 复选框控件
             */
            getSubject: function () {
                return this.subject || null;
            },

            /**
             * @override
             */
            init: function () {
                _super.init();
                if (!this.dependents.length) {
                    // 如果控件是主复选框，应该直接根据从属复选框的状态来显示自己的状态
                    this._setStatus(this.getInput().checked ? 0 : 1);
                }
            },

            /**
             * 判断控件是否选中。
             * @public
             *
             * @return {boolean} 是否选中
             */
            isChecked: function () {
                return !this.status;
            },

            /**
             * 判断控件在提交时是否选中，默认返回 isChecked 的值。
             * @public
             *
             * @return {boolean} 是否选中
             */
            isFormChecked: function () {
                return this.isChecked();
            },

            /**
             * @override
             */
            saveToDefault: function () {
                this.defaultChecked = this.getInput().defaultChecked = this.getInput().checked;
            },

            /**
             * 设置复选框控件选中状态。
             * @public
             *
             * @param {boolean} checked 是否选中
             */
            setChecked: function (checked) {
                this._setStatus(checked ? 0 : 1);
                // 如果有从属复选框，全部改为与当前复选框相同的状态
                this.dependents.forEach(
                    function (item) {
                        item.subject = null;
                        item.setChecked(checked);
                        item.subject = this;
                    },
                    this
                );
            },

            /**
             * 设置主复选框。
             * setSubject 方法指定主复选框控件后，可以通过访问主复选框控件的 getDependents 方法获取列表，列表中即包含了当前的控件。请注意，控件从 DOM 树上被移除时，不会自动解除主从关系，联动可能出现异常，此时请调用 setSubject 方法传入空参数解除主从关系。
             * @public
             *
             * @param {ecui.ui.Checkbox} checkbox 主复选框
             */
            setSubject: function (checkbox) {
                if (this.subject !== checkbox) {
                    if (this.subject) {
                        // 已经设置过主复选框，需要先释放引用
                        util.remove(this.subject.dependents, this);
                        this.subject._refresh();
                    }

                    if (checkbox) {
                        checkbox.dependents.push(this);
                        checkbox._refresh();
                    }

                    this.subject = checkbox;
                }
            }
        }
    );
}());
