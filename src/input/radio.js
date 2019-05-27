/*
@example
<input ui="type:radio" name="city" value="beijing" checked="checked" type="radio">
或
<div ui="type:radio;name:city;value:beijing;checked:true"></div>
或
<div ui="type:radio">
    <input name="city" value="beijing" checked="checked" type="radio">
</div>

@fields
_bDefault  - 默认的选中状态
_bRequired - 是否必须选择
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    /**
     * 为控件的 INPUT 节点绑定事件。
     * @private
     */
    function change(event) {
        setChecked(core.wrapEvent(event).target.getControl(), true);
    }

    /**
     * 单选框控件刷新。
     * @private
     *
     * @param {ecui.ui.Radio} radio 单选框控件
     * @param {boolean} checked 新的状态，如果忽略表示不改变当前状态
     */
    function refresh(radio, checked) {
        if (checked !== undefined) {
            radio.getInput().checked = checked;
        }
        radio.alterSubType(radio.isChecked() ? 'checked' : '');
    }

    /**
     * 设置单选框选中状态。
     * @private
     *
     * @param {ecui.ui.Radio} radio 单选框控件
     * @param {boolean} checked 新的状态，如果忽略表示不改变当前状态
     */
    function setChecked(radio, checked) {
        radio.$clearErrorStyle();
        if (checked) {
            radio.getItems().forEach(function (item) {
                refresh(item, item === radio);
            });
        } else {
            refresh(radio, false);
        }
    }

    /**
     * 单选框控件。
     * 实现了对原生 InputElement 单选框的功能扩展，支持对选中的图案的选择。单选框控件适用所有在一组中只允许选择一个目标的交互，并不局限于此分组的表现形式(文本、图片等)。
     * options 属性：
     * required    是否必须选择
     * @control
     */
    ui.Radio = core.inherits(
        ui.InputControl,
        'ui-radio',
        function (el, options) {
            _super(el, Object.assign({inputType: 'radio'}, options));

            // 保存节点选中状态，用于修复IE6/7下移动DOM节点时选中状态发生改变的问题
            this._bDefault = this.getInput().defaultChecked;
            this._bRequired = !!options.required;
            dom.addEventListener(this.getInput(), 'change', change);
        },
        {
            /**
             * 控件点击时将控件设置成为选中状态，同时取消同一个单选框控件组的其它控件的选中状态。
             * @override
             */
            $click: function (event) {
                _super.$click(event);
                this.setChecked(true);
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
                        this.setChecked(true);
                    }
                    event.exit();
                }
            },

            /**
             * @override
             */
            $ready: function (options) {
                _super.$ready(options);
                refresh(this);
            },

            /**
             * @override
             */
            $reset: function () {
                // 修复IE6/7下移动DOM节点时选中状态发生改变的问题
                this.setChecked(this._bDefault);
                _super.$reset();
            },

            /**
             * @override
             */
            $validate: function (event) {
                _super.$validate(event);

                if (this._bRequired) {
                    var name = this.getName(),
                        form = this.getInput().form,
                        nochecked = true,
                        group = core.query(function (item) {
                            if (ui.Radio.isInstance(item) && item.getName() === name && item.getInput().form === form) {
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
             * 获取与当前单选框同组的全部单选框。
             * getItems 方法返回包括当前单选框在内的与当前单选框同组的全部单选框，同组的单选框选中状态存在唯一性。
             * @public
             *
             * @return {Array} 单选框控件数组
             */
            getItems: function () {
                var inputEl = this.getInput(),
                    result = [];

                if (!inputEl.name) {
                    return [this];
                }
                if (inputEl.form) {
                    // 必须 name 也不为空，否则 form[o] 的值在部分浏览器下将是空
                    dom.toArray(inputEl.form[inputEl.name]).forEach(function (item) {
                        if (item.getControl) {
                            result.push(item.getControl());
                        }
                    });
                    return result;
                }
                return core.query(function (item) {
                    return ui.Radio.isInstance(item) && !item.getInput().form && item.getName() === inputEl.name;
                });
            },

            /**
             * 判断控件是否选中。
             * @public
             *
             * @return {boolean} 是否选中
             */
            isChecked: function () {
                return this.getInput().checked;
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
                this._bDefault = this.getInput().defaultChecked = this.isChecked();
            },

            /**
             * 设置单选框控件选中状态。
             * 将控件设置成为选中状态，会取消同一个单选框控件组的其它控件的选中状态。
             * @public
             *
             * @param {boolean} checked 是否选中
             */
            setChecked: function (checked) {
                if (this.isChecked() !== checked) {
                    setChecked(this, checked);
                }
            }
        }
    );

    /**
     * 获取单选框控件的值。
     * @public
     *
     * @param {string} name 单选框控件的名称
     * @return {string} 单选框控件的值，没有选中的项返回null
     */
    ui.Radio.getValue = function (name) {
        var control = core.query(function (item) {
                return ui.Radio.isInstance(item) && item.getName() === name && item.isChecked();
            })[0];
        return control ? control.getValue() : null;
    };

    /**
     * 设置单选框控件的值。
     * @public
     *
     * @param {string} name 单选框控件的名称
     * @param {string} value 单选框控件的值
     */
    ui.Radio.setValue = function (name, value) {
        value = String(value);
        core.query(function (item) {
            return ui.Radio.isInstance(item) && item.getName() === name && item.getValue() === value;
        }).forEach(function (item) {
            item.setChecked(true);
        });
    };
}());
