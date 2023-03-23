//{if $css}//
ecui.__ControlStyle__('\
.ui-input {\
    .inline-block();\
    overflow: hidden !important;\
\
    input,\
    textarea {\
        padding: 0px !important;\
        border: 0px !important;\
        margin: 0px !important;\
    }\
}\
');
//{/if}//
/*
@example
<input ui="type:input-control" type="password" name="passwd" value="1111" placeholder="请输入">
或:
<div ui="type:input-control;name:passwd;value:1111;inputType:password;placeholder:请输入"></div>
或:
<div ui="type:input-control">
    <input type="password" name="passwd" value="1111" placeholder="请输入">
</div>

@fields
_bIME          - 是否正在使用输入法
_bBlur         - 失去焦点时是否需要校验
_bInput        - 输入时是否需要校验
_bError        - 是否出错
_bRequired     - 是否必须
_nTabIndex     - Tab 触发顺序
_eInput        - INPUT对象
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        isToucher = document.ontouchstart !== undefined,
        iosVersion = /(iPhone|iPad).*?OS (\d+(_\d+)?)/i.test(navigator.userAgent) ? +(RegExp.$2.replace('_', '.')) : undefined;
//{/if}//
    var timer = util.blank,
        insertCompositionTextInput,
        // INPUT事件集合对象
        events = {
            /**
             * 输入结束事件处理。
             * @private
             */
            compositionend: function (event) {
                event = core.wrapEvent(event);
                var control = event.target.getControl();
                event.ime = event.target.__ECUI__ime;
                core.dispatchEvent(control, 'input', event);
                delete event.target.__ECUI__ime;
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
                event.target.__ECUI__ime = dom.getSelectionStart(event.target);
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
             * @private
             *
             * @param {Event} event 事件对象
             */
            drop: function (event) {
                event.clipboardData = event.dataTransfer;
                events.paste(event);
            },

            /**
             * 输入内容事件处理。
             * @private
             */
            input: function (event) {
                var el = document.activeElement;
                if (iosVersion && event.inputType === 'insertFromComposition' && insertCompositionTextInput !== el) {
                    // ios下中文输入，没有正常结束时切换input，拼音字母会被填充到两个input里面
                    var pos = el.selectionStart - event.data.length,
                        type = el.type;
                    if (type !== 'text') {
                        el.type = 'text';
                    }
                    el.value = el.value.slice(0, pos) + el.value.slice(el.selectionStart);
                    el.setSelectionRange(pos, pos);
                    if (type !== 'text') {
                        el.type = type;
                    }
                } else {
                    insertCompositionTextInput = el;
                }

                event = core.wrapEvent(event);
                var control = event.target.getControl();
                if (control._bIME) {
                    if (iosVersion) {
                        // ios点完成时，软键盘收起，input没有正常失去焦点
                        if (event.getNative().data === null) {
                            if (Date.now() - control._nTime > 30) {
                                control._nTime = -Date.now();
                            }
                        } else {
                            // eslint-disable-next-line no-lonely-if
                            if (Date.now() + control._nTime < 30) {
                                el.blur();
                            } else {
                                control._nTime = Date.now();
                            }
                        }
                    }
                } else {
                    // 防止ie11修改placeholder引起的input重入
                    control._bIME = true;
                    core.dispatchEvent(control, 'input', event);
                    util.timer(function () {
                        control._bIME = false;
                    });
                }
            },

            /**
             * 粘贴内容事件处理。
             * @private
             */
            paste: function (event) {
                event = core.wrapEvent(event);
                var control = event.target.getControl();

                if (control._bReadOnly) {
                    event.preventDefault();
                    return false;
                }
                var start = control.getSelectionStart(),
                    end = control.getSelectionEnd(),
                    value = event.target.value,
                    filter = event.getNative().clipboardData.getData('text/plain').split('').filter(function (c) {
                        event.key = c;
                        return core.dispatchEvent(control, 'keydown', event);
                    }).join('');
                if (start !== end || filter.length) {
                    control.setValue(value.substring(0, start) + filter + value.substring(end));
                    control.setSelection(start + filter.length);
                    core.dispatchEvent(control, 'input', event);
                }

                event.preventDefault();
            }
        },
        ValidateEvent = core.inheritsEvent({
            addError: function (msg) {
                if (!this._aError) {
                    this._aError = [];
                }
                this._aError.push(msg);
            },
            getError: function () {
                return this._aError;
            }
        });

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
     * required     是否必须
     * @control
     */
    ui.abstractInput = core.inherits(
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
//{if 0}//
                if ((options.inputType === 'textarea' && inputEl.tagName === 'TEXTAREA') || (options.inputType && inputEl.type !== options.inputType) || options.name !== undefined || options.value !== undefined || options.readOnly !== undefined || options.checked !== undefined || options.placeholder !== undefined) {
                    console.warn('显式定义了输入框不要再重复设置参数');
                }
//{/if}//
            } else {
                inputEl = el.getElementsByTagName('INPUT')[0] || el.getElementsByTagName('TEXTAREA')[0];
//{if 0}//
                if (inputEl && ((options.inputType === 'textarea' && inputEl.tagName === 'TEXTAREA') || (options.inputType && inputEl.type !== options.inputType) || options.name !== undefined || options.value !== undefined || options.readOnly !== undefined || options.checked !== undefined || options.placeholder !== undefined)) {
                    console.warn('显式定义了输入框不要再重复设置参数');
                }
//{/if}//
                if (!inputEl) {
                    el.insertAdjacentHTML('beforeEnd', '<' + (options.inputType === 'textarea' ? 'textarea' : 'input' + (options.inputType ? ' type="' + options.inputType + '"' : '') + (options.name ? ' name="' + options.name + '"' : '') + (options.readOnly ? ' readOnly' : '') + (options.checked ? ' checked' : '') + (options.placeholder ? ' placeholder="' + util.encodeHTML(options.placeholder) + '"' : '')) + '>');
                    inputEl = el.lastChild;
                    inputEl.defaultValue = inputEl.value = options.value || '';
                }
            }

            _super(el, options);

            this._bRequired = !!options.required;
            this._bReadOnly = !!options.readOnly;
            if (this._bReadOnly) {
                inputEl.readOnly = true;
            }
            this._eInput = inputEl;
            this.$bindEvent(inputEl);

            if (options.valid) {
                options = options.valid.split(',');
                if (options.indexOf('input') >= 0) {
                    this._bInput = true;
                } else if (options.indexOf('blur') >= 0) {
                    this._bBlur = true;
                }
            }
        },
        {
            /**
             * 为控件的 INPUT 节点绑定事件。
             * @public
             *
             * @param {InputElement} input 输入元素
             */
            $bindEvent: function (input) {
                core.$bind(input, this);
                if (input.type !== 'hidden') {
                    // 对于IE或者textarea的变化，需要重新绑定相关的控件事件
                    dom.addEventListeners(input, events);
                    input = null;
                }
            },

            /**
             * @override
             */
            $blur: function (event) {
                if (document.activeElement === this._eInput) {
                    if (isToucher) {
                        this._eInput.blur();
                        this._bIME = false; // ios 输入未走input事件
                    } else {
                        this._eInput.blur();
                    }
                }

                if (this._bBlur) {
                    this.validate();
                }

                _super.$blur(event);
            },

            /**
             * 清除错误样式。
             * @protected
             */
            $correct: function () {
                if (this._bError) {
                    this.alterSubType('');
                    this._bError = false;
                }
                for (var control = this; (control = control.getParent());) {
                    if (control instanceof ui.InputGroup) {
                        control.$correct();
                        break;
                    }
                }
            },

            /**
             * @override
             */
            $dispose: function () {
                _super.$dispose();
                this._eInput.getControl = null;
                this._eInput = null;
            },

            /**
             * 控件格式校验错误的默认处理。
             * @protected
             *
             * @param {ECUIEvent} event 事件对象
             * @return {boolean} 是否由控件自身处理错误
             */
            $error: function (event) {
                this._bError = true;
                this.alterSubType('error');
                for (var control = this; (control = control.getParent());) {
                    if (control instanceof ui.InputGroup) {
                        core.dispatchEvent(control, 'error', event);
                        return false;
                    }
                }
            },

            /**
             * @override
             */
            $focus: function (event) {
                _super.$focus(event);

                var active = document.activeElement;
                if (!active.getControl || active.getControl() !== this) {
                    if (active.tagName !== 'BODY') {
                        active.blur();
                    }
                    this._eInput.focus();
                }
            },

            /**
             * 内容改变事件。
             * @event
             */
            $input: function () {
                if (this._bInput) {
                    this.validate();
                } else {
                    this.$correct();
                }
            },

            /**
             * @override
             */
            $ready: function () {
                _super.$ready();
                this.saveToDefault();
            },

            /**
             * 重置事件。
             * @event
             */
            $reset: util.blank,

            /**
             * 设置控件的值。
             * 如果需要绕过控件的逻辑处理设置基础表单项的值，请使用此方法，不要直接对表单项进行 value 属性的设置。
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
                if (!this.validate()) {
                    event.preventDefault();
                }
            },

            /**
             * 输入格式校验事件。
             * @event
             */
            $validate: util.blank,

            /**
             * 获取控件的缺省值(用于reset)。
             * @public
             *
             * @return {string} 控件的缺省值
             */
            getDefaultValue: function () {
                return this._eInput.defaultValue;
            },

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
             * @param {boolean} useDefault 是否使用缺省值
             * @return {string} 控件的表单值
             */
            getFormValue: function (useDefault) {
                return this[useDefault ? 'getDefaultValue' : 'getValue']();
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
             * 判断输入框是否必填。
             * @public
             *
             * @return {boolean} 输入框是否必填
             */
            isRequired: function () {
                return this._bRequired;
            },

            /**
             * 保存控件的值为默认值，供form表单的reset方法使用。
             * @public
             */
            saveToDefault: function () {
                this._eInput.defaultValue = this.getValue();
            },

            /**
             * 设置控件的名称。
             * 输入控件可以在表单中被提交，setName 方法设置提交时用的表单项名称，表单项名称可以使用 getName 方法获取。
             * @public
             *
             * @param {string} name 表单项名称
             */
            setName: function (name) {
                this._eInput.name = name;
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
            },

            /**
             * 校验控件的值，如果正确调用$correct方法，如果错误向控件发送error事件。
             * @public
             *
             * @return {boolean} 校验是否通过
             */
            validate: function () {
                var event = new ValidateEvent();
                if (core.dispatchEvent(this, 'validate', event)) {
                    this.$correct();
                    return true;
                }
                core.dispatchEvent(this, 'error', event);
                return false;
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
    ui.abstractInput.saveToDefault = function (elements) {
        elements.forEach(function (item) {
            if (item.getControl) {
                var control = item.getControl();
                if (!control.isDisabled() && control.saveToDefault) {
                    control.saveToDefault();
                }
            } else if (!item.disabled) {
                if (item.type === 'radio' || item.type === 'checkbox') {
                    item.__ECUI__default = item.defaultChecked = item.checked;
                } else if (item.type !== 'button' && item.type !== 'submit' && item.type !== 'reset' && item.tagName !== 'BUTTON') {
                    item.defaultValue = item.value;
                }
            }
        });
    };
})();
