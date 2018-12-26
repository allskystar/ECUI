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
_bError        - 是否出错
_eInput        - INPUT对象
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        isToucher = document.ontouchstart !== undefined,
        iosVersion = /(iPhone|iPad).+OS (\d+)/i.test(navigator.userAgent) ?  +(RegExp.$2) : undefined,
        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
//{/if}//
    var timer = util.blank,
        // INPUT事件集合对象
        events = {
            /**
             * 输入结束事件处理。
             * @private
             */
            compositionend: iosVersion ? util.blank : function (event) {
                event = core.wrapEvent(event);
                var control = event.target.getControl();
                core.dispatchEvent(control, 'input', event);
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
            compositionstart: iosVersion ? util.blank : function (event) {
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
             * 输入内容事件处理。
             * @private
             */
            input: function (event) {
                event = core.wrapEvent(event);
                var control = event.target.getControl();
                if (!control._bIME) {
                    core.dispatchEvent(control, 'input', event);
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
                        core.dispatchEvent(event.target.getControl(), 'input', event);
                    }
                }
            }
        };

    if (isToucher) {
        events.focusin = focus;
        events.focusout = blur;
    } else {
        events.blur = blur;
        events.focus = focus;
    }

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
     * INPUT 失去焦点的处理。
     * @private
     *
     * @param {Event} event 事件对象
     */
    function blur(event) {
        var control = core.wrapEvent(event).target.getControl();
        // INPUT失去焦点，但控件未失去焦点，不需要触发blur，例如Select的Input失去焦点不需要触发
        if (control.contain(core.getFocused())) {
            util.timer(function () {
                // 键盘操作焦点移向了另一个输入框
                var tagName = document.activeElement.tagName;
                if (tagName === 'INPUT' || tagName === 'SELECT' || tagName === 'TEXTAREA' || tagName === 'BUTTON') {
                    control.blur();
                }
            }, 10);
        } else {
            control.blur();
        }
    }

    /**
     * INPUT 获得焦点的处理。
     * @private
     *
     * @param {Event} event 事件对象
     */
    function focus(event) {
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
            if (!isToucher || document.activeElement !== el) {
                control.focus();
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

        var elements = dom.toArray(this.elements);

        elements.forEach(function (item) {
            if (item.getControl) {
                core.dispatchEvent(item.getControl(), 'submit', event);
            }
        });

        if (event.returnValue !== false) {
            ui.InputControl.saveToDefault(elements);
        }
    }

    /**
     * 表单复位事件处理。
     * @private
     */
    function resetHandler() {
        dom.toArray(this.elements).forEach(function (item) {
            if (item.getControl) {
                core.dispatchEvent(item.getControl(), 'reset');
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

            ui.Control.call(this, el, options);

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

                if (!isToucher) {
                    if (events.blur) {
                        dom.removeEventListener(this._eInput, 'blur', events.blur);
                    }
                    try {
                        this._eInput.blur();
                    } catch (ignore) {
                    }
                    if (events.blur) {
                        dom.addEventListener(this._eInput, 'blur', events.blur);
                    }
                }

                if (this._bBlur) {
                    core.dispatchEvent(this, 'validate');
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
             * 控件格式校验错误的默认处理。
             * @protected
             *
             * @param {ECUIEvent} event 事件对象
             * @return {boolean} 是否由控件自身处理错误
             */
            $error: function () {
                for (var control = this; control = control.getParent(); ) {
                    if (control instanceof ui.InputGroup) {
                        core.dispatchEvent(control, 'error');
                        return false;
                    }
                }
                this._bError = true;
                this.alterSubType('error');
            },

            /**
             * @override
             */
            $focus: function (event) {
                ui.Control.prototype.$focus.call(this, event);

                for (var control = this; control = control.getParent(); ) {
                    if (control instanceof ui.InputGroup) {
                        control.alterSubType('');
                        break;
                    }
                }
                if (this._bError) {
                    this.alterSubType('');
                    this._bError = false;
                }

                if (!isToucher) {
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
                }
            },

            /**
             * 内容改变事件。
             * @event
             */
            $input: util.blank,

            /**
             * @override
             */
            $ready: function (event) {
                ui.Control.prototype.$ready.call(this, event);
                this.saveToDefault();
            },

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
                    if (parent.getControl === undefined) {
                        dom.addEventListener(parent, 'submit', submitHandler);
                        dom.addEventListener(parent, 'reset', resetHandler);
                        parent.getControl = null;
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
                if (!core.dispatchEvent(this, 'validate')) {
                    event.preventDefault();
                }
            },

            /**
             * 输入格式校验事件。
             * @event
             */
            $validate: util.blank,

            /**
             * 获取控件进行提交的名称，默认使用 getName 的返回值。
             * @public
             *
             * @return {string} 控件的表单名称
             */
            getFormName: function () {
                return this.getName();
            },

            /**
             * 获取控件进行提交的值，默认使用 getValue 的返回值。
             * @public
             *
             * @return {string} 控件的表单值
             */
            getFormValue: function () {
                return this.getValue();
            },

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
             * 保存控件的值为默认值，供form表单的reset方法使用。
             * @public
             */
            saveToDefault: function () {
                this._eInput.defaultValue = this._eInput.value;
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

    /**
     * 设置控件的默认值。
     * 如果表单元素类型是 radio 或者 checkbox，不进行 ECUI 控件化是无法真正设置成默认值的。
     * @public
     *
     * @param {Array} element 全部的表单元素
     */
    ui.InputControl.saveToDefault = function (elements) {
        elements.forEach(function (item) {
            if (item.getControl) {
                var control = item.getControl();
                if (control.saveToDefault) {
                    control.saveToDefault();
                }
            } else if (item.type === 'radio' || item.type === 'checkbox') {
                item.defaultChecked = item.checked;
            } else {
                item.defaultValue = item.value;
            }
        });
    };
}());
