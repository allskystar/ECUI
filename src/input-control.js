/*
@example
<input ui="type:input-control" type="password" name="passwd" value="1111">
或:
<div ui="type:input-control;name:passwd;value:1111;inputType:password"></div>
或:
<div ui="type:input-control">
    <input type="password" name="passwd" value="1111">
</div>

@fields
_bBlur         - 失去焦点时是否需要校验
_eInput        - INPUT对象
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
//{/if}//
    var timer = util.blank,
        // INPUT事件集合对象
        events = {
            /**
             * 失去焦点事件处理。
             * @private
             */
            blur: function (event) {
                var control = core.wrapEvent(event).target.getControl();
                // INPUT失去焦点，但控件未失去焦点，不需要触发blur
                if (!control.contain(core.getFocused())) {
                    control.blur();
                }
            },

            /**
             * 输入结束事件处理。
             * @private
             */
            compositionend: function (event) {
                event = core.wrapEvent(event);
                var control = event.target.getControl();
                core.triggerEvent(control, 'input', event);
                timer = util.timer(
                    function () {
                        control._bIME = false;
                    }
                );
            },

            /**
             * 输入开始事件处理。
             * @private
             */
            compositionstart: function (event) {
                timer();
                core.wrapEvent(event).target.getControl()._bIME = true;
            },

            /**
             * 拖拽内容到输入框的事件处理。
             * 为了增加可控性，阻止该行为。[todo] firefox下无法阻止，后续升级
             * @private
             *
             * @param {Event} event 事件对象
             */
            dragover: function (event) {
                core.wrapEvent(event).exit();
            },

            /**
             * 拖拽内容到输入框时的事件处理。
             * 为了增加可控性，阻止该行为。[todo] firefox下无法阻止，后续升级
             * @private
             *
             * @param {Event} event 事件对象
             */
            drop: function (event) {
                core.wrapEvent(event).exit();
            },

            /**
             * 获得焦点事件处理。
             * @private
             */
            focus: function (event) {
                var el = core.wrapEvent(event).target,
                    control = el.getControl();
                if (control.isDisabled()) {
                    dom.removeEventListener(el, 'blur', events.blur);
                    try {
                        el.blur();
                    } catch (ignore) {
                    }
                    dom.addEventListener(el, 'blur', events.blur);
                } else {
                    control.focus();
                }
            },

            /**
             * 输入内容事件处理。
             * @private
             */
            input: function (event) {
                event = core.wrapEvent(event);
                var control = event.target.getControl();
                if (!control._bIME) {
                    core.triggerEvent(control, 'input', event);
                }
            },

            /**
             * 输入内容事件处理，兼容IE6-8。
             * @private
             *
             * @param {Event} event 事件对象
             */
            propertychange: function (event) {
                if (ieVersion < 9) {
                    if (event.propertyName === 'value' && core.wrapEvent(event).target.type !== 'hidden') {
                        event = core.wrapEvent(event);
                        core.triggerEvent(event.target.getControl(), 'input', event);
                    }
                }
            }
        };

    /**
     * 为控件的 INPUT 节点绑定事件。
     * @private
     *
     * @param {ecui.ui.InputControl} input 基础输入控件
     */
    function bindEvent(input) {
        core.$bind(input._eInput, input);
        if (input._eInput.type !== 'hidden') {
            // 对于IE或者textarea的变化，需要重新绑定相关的控件事件
            for (var name in events) {
                if (events.hasOwnProperty(name)) {
                    dom.addEventListener(input._eInput, name, events[name]);
                }
            }
        }
    }

    /**
     * 表单提交事件处理。
     * @private
     *
     * @param {Event} event 事件对象
     */
    function submitHandler(event) {
        event = core.wrapEvent(event);

        Array.prototype.forEach.call(this.elements, function (item) {
            if (item.getControl) {
                core.triggerEvent(item.getControl(), 'submit', event);
            }
        });
    }

    /**
     * 表单复位事件处理。
     * @private
     */
    function resetHandler() {
        Array.prototype.forEach.call(this.elements, function (item) {
            if (item.getControl) {
                core.triggerEvent(item.getControl(), 'reset');
            }
        });
    }

    /**
     * 基础输入控件。
     * 实现了对原生 InputElement 的功能扩展，包括输入事件的实时响应(每次改变均触发事件)，以及 IE 下不能动态改变输入框的表单项名称的模拟处理。
     * options 属性：
     * name         输入框的名称
     * value        输入框的默认值
     * checked      输入框是否默认选中(radio/checkbox有效)
     * inputType    输入框的类型，默认为 text
     * readOnly     输入框是否只读
     * valid        在什么情况下校验，表单提交时一定会校验，blur表示需要在失去焦点时校验
     * @control
     */
    ui.InputControl = core.inherits(
        ui.Control,
        'ui-input',
        function (el, options) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                // 根据表单项初始化
                var inputEl = el;
                el = dom.insertBefore(
                    dom.create(
                        {
                            className: el.className,
                            style: {
                                cssText: inputEl.style.cssText
                            }
                        }
                    ),
                    el
                );
                inputEl.className = '';
                inputEl.style.cssText = '';
                el.appendChild(inputEl);
            } else {
                inputEl = el.getElementsByTagName('INPUT')[0] || el.getElementsByTagName('TEXTAREA')[0];
                if (!inputEl) {
                    inputEl = dom.setInput(null, options.name, options.inputType);
                    inputEl.defaultValue = inputEl.value = options.value || '';
                    el.appendChild(inputEl);
                }
            }

            if (options.readOnly) {
                inputEl.readOnly = true;
            }
            if (options.checked) {
                inputEl.defaultChecked = inputEl.checked = true;
            }

            ui.Control.constructor.call(this, el, options);

            this._eInput = inputEl;
            bindEvent(this);

            if (options.valid) {
                options = options.valid.split(',');
                if (options.indexOf('blur') >= 0) {
                    this._bBlur = true;
                }
            }
        },
        {
            /**
             * @override
             */
            $blur: function (event) {
                ui.Control.prototype.$blur.call(this, event);

                dom.removeEventListener(this._eInput, 'blur', events.blur);
                try {
                    this._eInput.blur();
                } catch (ignore) {
                }
                dom.addEventListener(this._eInput, 'blur', events.blur);

                if (this._bBlur) {
                    core.triggerEvent(this, 'validate');
                }
            },

            /**
             * 控件失效，阻止输入框提交。
             * @override
             */
            $disable: function () {
                ui.Control.prototype.$disable.call(this);
                this._eInput.disabled = true;
            },

            /**
             * @override
             */
            $dispose: function () {
                this._eInput.getControl = null;
                this._eInput = null;
                ui.Control.prototype.$dispose.call(this);
            },

            /**
             * 控件解除失效，需要将输入框设置为可提交。
             * @override
             */
            $enable: function () {
                ui.Control.prototype.$enable.call(this);
                this._eInput.disabled = false;
            },

            /**
             * @override
             */
            $focus: function (event) {
                ui.Control.prototype.$focus.call(this, event);

                util.timer(
                    function () {
                        dom.removeEventListener(this._eInput, 'focus', events.focus);
                        try {
                            this._eInput.focus();
                        } catch (ignore) {
                        }
                        dom.addEventListener(this._eInput, 'focus', events.focus);
                    },
                    0,
                    this
                );
            },

            /**
             * 内容改变事件。
             * @event
             */
            $input: util.blank,

            /**
             * 重置事件。
             * @event
             */
            $reset: function (event) {
                this.$ready(event);
            },

            /**
             * @override
             */
            $setParent: function (parent) {
                ui.Control.prototype.$setParent.call(this, parent);
                if (parent = this._eInput.form) {
                    if (!parent.getControl) {
                        dom.addEventListener(parent, 'submit', submitHandler);
                        dom.addEventListener(parent, 'reset', resetHandler);
                        parent.getControl = util.blank;
                    }
                }
            },

            /**
             * 设置控件的值。
             * setValue 方法设置提交时表单项的值，使用 getValue 方法获取设置的值。
             * @protected
             *
             * @param {string} value 控件的值
             */
            $setValue: function (value) {
                var func = events.propertychange;

                // 停止事件，避免重入引发死循环
                if (func) {
                    dom.removeEventListener(this._eInput, 'propertychange', func);
                }
                this._eInput.value = value;
                if (func) {
                    dom.addEventListener(this._eInput, 'propertychange', func);
                }
            },

            /**
             * 输入提交事件。
             * @event
             */
            $submit: function (event) {
                ui.Control.prototype.$submit.call(this, event);
                if (!core.triggerEvent(this, 'validate')) {
                    event.preventDefault();
                }
            },

            /**
             * 输入格式校验事件。
             * @event
             */
            $validate: util.blank,

            /**
             * 获取控件的输入元素。
             * @public
             *
             * @return {HTMLElement} InputElement 对象
             */
            getInput: function () {
                return this._eInput;
            },

            /**
             * 获取控件的名称。
             * 输入控件可以在表单中被提交，getName 方法返回提交时用的表单项名称，表单项名称可以使用 setName 方法改变。
             * @public
             *
             * @return {string} INPUT 对象名称
             */
            getName: function () {
                return this._eInput.name;
            },

            /**
             * 获取控件的值。
             * getValue 方法返回提交时表单项的值，使用 setValue 方法设置。
             * @public
             *
             * @return {string} 控件的值
             */
            getValue: function () {
                return this._eInput.value;
            },

            /**
             * 设置控件的名称。
             * 输入控件可以在表单中被提交，setName 方法设置提交时用的表单项名称，表单项名称可以使用 getName 方法获取。
             * @public
             *
             * @param {string} name 表单项名称
             */
            setName: function (name) {
                var el = dom.setInput(this._eInput, name || '');
                if (this._eInput !== el) {
                    this._eInput = el;
                    bindEvent(this);
                }
            },

            /**
             * 设置控件的值。
             * setValue 方法设置提交时表单项的值，使用 getValue 方法获取设置的值。
             * @public
             *
             * @param {string} value 控件的值
             */
            setValue: function (value) {
                this.$setValue(value);
            }
        }
    );
}());
