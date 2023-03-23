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
    function changeHandler(event) {
        var control = core.wrapEvent(event).target.getControl();
        if (control.isDisabled()) {
            control.$restoreChange();
            return;
        }
        control.setChecked(event.target.checked);
        core.dispatchEvent(control, 'change');
    }

    /**
     * 选项框控件，(单选框和复选框的基类)。
     * @control
     */
    ui.abstractItemInput = core.inherits(
        ui.abstractInput,
        function (el, options) {
            _super(el, options);
            if (options.checked) {
                this.getInput().checked = true;
            }
            dom.addEventListener(this.getInput(), 'change', changeHandler);
        },
        {
            ERROR: '请选择{Name}',

            /**
             * @override
             */
            $disable: function (event) {
                _super.$disable(event);
                this.getInput().disable = true;
            },

            /**
             * @override
             */
            $enable: function (event) {
                _super.$enable(event);
                this.getInput().disable = false;
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
             * @override
             */
            $validate: function (event) {
                if (_super.$validate(event) === false) {
                    return false;
                }

                if (this.isRequired()) {
                    if (!this.getItems().filter(function (item) {
                        return item.isChecked();
                    }).length) {
                        event.addError(this.ERROR);
                        return false;
                    }
                }
            },

            /**
             * 获取同组的全部控件。
             * @public
             *
             * @return {Array} 同组的全部控件数组
             */
            getItems: function () {
                var constructor = this.constructor,
                    name = this.getName(),
                    form = this.getInput().form;

                if (form) {
                    var ret = [];
                    dom.toArray(form[name]).forEach(function (item) {
                        item = item.getControl && item.getControl();
                        if (item instanceof constructor) {
                            ret.push(item);
                        }
                    });
                    return ret;
                }
                return core.query(function (item) {
                    return item instanceof constructor && item.getName() === name && !item.getInput().form;
                });
            },

            /**
             * 判断控件在默认时是否选中。
             * @public
             *
             * @return {boolean} 是否选中
             */
            isDefaultChecked: function () {
                return this.getInput().defaultChecked;
            },

            /**
             * 判断控件在提交时是否选中，默认返回 isChecked 的值。
             * @public
             *
             * @param {boolean} useDefault 是否使用缺省值
             * @return {boolean} 是否选中
             */
            isFormChecked: function (useDefault) {
                return this[useDefault ? 'isDefaultChecked' : 'isChecked']();
            },

            /**
             * @override
             */
            saveToDefault: function () {
                var el = this.getInput();
                el.defaultChecked = el.checked;
            },

            /**
             * 清除控件同组的校验状态。
             * @public
             */
            setChecked: function () {
                this.getItems().forEach(function (item) {
                    item.$correct();
                });
            }
        }
    );
})();
