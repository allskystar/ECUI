/*
InputControl - 定义输入数据的基本操作。
输入控件，继承自基础控件，实现了对原生 InputElement 的功能扩展，包括光标的控制、输入事件的实时响应(每次改变均触发事件)，以及 IE 下不能动态改变输入框的表单项名称的模拟处理。

输入控件直接HTML初始化的例子:
<input ecui="type:input-control" type="password" name="passwd" value="1111">
或:
<div ecui="type:input-control;name:passwd;value:1111;inputType:password"></div>
或:
<div ecui="type:input-control"><input type="password" name="passwd" value="1111"></div>

属性
_bHidden - 输入框是否隐藏
_eInput  - INPUT对象
*/
//{if 0}//
(function () {

    var core = ecui,
        dom = core.dom,
        string = core.string,
        ui = core.ui,
        util = core.util,

        undefined,
        DOCUMENT = document,
        REGEXP = RegExp,

        USER_AGENT = navigator.userAgent,
        ieVersion = /msie (\d+\.\d)/i.test(USER_AGENT) ? DOCUMENT.documentMode || (REGEXP.$1 - 0) : undefined,

        createDom = dom.create,
        insertBefore = dom.insertBefore,
        setInput = dom.setInput,
        setStyle = dom.setStyle,
        encodeHTML = string.encodeHTML,
        attachEvent = util.attachEvent,
        blank = util.blank,
        detachEvent = util.detachEvent,
        timer = util.timer,

        $bind = core.$bind,
        findControl = core.findControl,
        inheritsControl = core.inherits,
        loseFocus = core.loseFocus,
        setFocused = core.setFocused,
        wrapperEvent = core.wrapperEvent,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化输入控件。
     * options 对象支持的属性如下：
     * name       输入框的名称
     * value      输入框的默认值
     * inputType  输入框的类型，默认为 text
     * hidden     输入框是否隐藏，隐藏状态下将不会绑定键盘事件
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ///__gzip_original__UI_INPUT_CONTROL
    ///__gzip_original__UI_INPUT_CONTROL_CLASS
    var UI_INPUT_CONTROL = ui.InputControl =
        inheritsControl(
            UI_CONTROL,
            'ui-input-control',
            function (el, options) {
                var input = el;

                if (el.type) {
                    // 根据表单项初始化
                    input = el;

                    el = createDom(input.className, input.style.cssText + ';overflow:hidden');

                    input.className = '';
                    insertBefore(el, input).appendChild(input);
                }
                else {
                    // 根据普通元素初始化
                    el.style.overflow = 'hidden';
                    if (!(input = el.getElementsByTagName('input')[0] || el.getElementsByTagName('textarea')[0])) {
                        input = setInput(null, options.name, options.inputType);
                        input.defaultValue = input.value = options.value === undefined ? '' : options.value.toString();
                        el.appendChild(input);
                    }
                }

                input.style.border = '0px';
                if (this._bHidden = options.hidden) {
                    input.style.display = 'none';
                }
                setStyle(el, 'display', 'inline-block');

                this._eInput = input;
                UI_INPUT_CONTROL_BIND_EVENT(this);

                UI_CONTROL.client.call(this, el, options);
            }
        ),
        UI_INPUT_CONTROL_CLASS = UI_INPUT_CONTROL.prototype,
        UI_INPUT_CONTROL_INPUT = {};
//{else}//
    /**
     * 表单提交事件处理。
     * @private
     *
     * @param {Event} event 事件对象
     */
    function UI_INPUT_CONTROL_FORM_SUBMIT(event) {
        event = wrapperEvent(event);

        //__transform__elements_list
        //__transform__el_o
        for (var i = 0, elements = event.target.elements, el; el = elements[i++]; ) {
            if (el.getControl) {
                el = el.getControl();
                if (!(el.onsubmit && el.onsubmit(event) === false)) {
                    el.$submit(event);
                }
            }
        }
    }

    /**
     * 表单复位事件处理。
     * @private
     *
     * @param {Event} event 事件对象
     */
    function UI_INPUT_CONTROL_FORM_RESET(event) {
        event = wrapperEvent(event);

        // 复位的处理延后执行，是为了能读取复位后的值
        timer(function () {
            //__transform__elements_list
            //__transform__el_o
            for (var i = 0, elements = event.target.elements, el; el = elements[i++]; ) {
                if (el.getControl) {
                    el = el.getControl();
                    if (!(el.onreset && el.onreset(event) === false)) {
                        el.$reset(event);
                    }
                }
            }
        });
    }

    /**
     * 为控件的 INPUT 节点绑定事件。
     * @private
     *
     * @param {ecui.ui.Edit} control 输入控件对象
     */
    function UI_INPUT_CONTROL_BIND_EVENT(control) {
        if ($bind(control._eInput, control) && !control._bHidden) {
            // 对于IE或者textarea的变化，需要重新绑定相关的控件事件
            for (var name in UI_INPUT_CONTROL_INPUT) {
                attachEvent(control._eInput, name, UI_INPUT_CONTROL_INPUT[name]);
            }
        }
    }

    /**
     * 输入框失去/获得焦点事件处理函数。
     * @private
     *
     * @param {Event} event 事件对象
     */
    UI_INPUT_CONTROL_INPUT.blur = UI_INPUT_CONTROL_INPUT.focus = function (event) {
        //__gzip_original__type
        var type = event.type;

        event = findControl(wrapperEvent(event).target);
        // 设置默认失去焦点事件，阻止在blur/focus事件中再次回调
        event['$' + type] = UI_CONTROL_CLASS['$' + type];
        if (type == 'blur') {
            loseFocus(event);
        }
        else {
            // 如果控件处于失效状态，不允许获得焦点
            if (event.isDisabled()) {
                event._eInput.blur();
            }
            else {
                setFocused(event);
            }
        }
        delete event['$' + type];
    };

    /**
     * 拖拽内容到输入框时处理函数。
     * 为了增加可控性，阻止该行为。[todo] firefox下无法阻止，后续升级
     * @private
     *
     * @param {Event} event 事件对象
     */
    UI_INPUT_CONTROL_INPUT.dragover = UI_INPUT_CONTROL_INPUT.drop = function (event) {
        wrapperEvent(event).exit();
    };

    /**
     * 输入框输入内容事件处理函数。
     * @private
     *
     * @param {Event} event 事件对象
     */
    if (ieVersion) {
        UI_INPUT_CONTROL_INPUT.propertychange = function (event) {
            if (event.propertyName == 'value') {
                event = findControl(wrapperEvent(event).target);
                if (event.onchange) {
                    event.onchange();
                }
            }
        };
    }
    else {
        UI_INPUT_CONTROL_INPUT.input = function (event) {
            event = findControl(this);
            if (event.onchange) {
                event.onchange();
            }
        };
    }

    /**
     * 销毁控件的默认处理。
     * 页面卸载时将销毁所有的控件，释放循环引用，防止在 IE 下发生内存泄漏，$dispose 方法的调用不会受到 ondispose 事件返回值的影响。
     * @protected
     */
    UI_INPUT_CONTROL_CLASS.$dispose = function () {
        this._eInput.getControl = undefined;
        this._eInput = null;
        UI_CONTROL_CLASS.$dispose.call(this);
    };

    /**
     * 输入重置事件的默认处理。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_INPUT_CONTROL_CLASS.$reset = function () {
        this.$ready();
    };

    /**
     * 直接设置父控件。
     * 相对于 setParent 方法，$setParent 方法仅设置控件对象逻辑上的父对象，不进行任何逻辑上的检查，用于某些特殊情况下的设定，如下拉框控件中的选项框子控件需要使用 $setParent 方法设置它的逻辑父控件为下拉框控件。
     * @protected
     *
     * @param {ecui.ui.Control} parent ECUI 控件对象
     */
    UI_INPUT_CONTROL_CLASS.$setParent = function (parent) {
        UI_CONTROL_CLASS.$setParent.call(this, parent);
        if (parent = this._eInput.form) {
            if (!parent.getControl) {
                attachEvent(parent, 'submit', UI_INPUT_CONTROL_FORM_SUBMIT);
                attachEvent(parent, 'reset', UI_INPUT_CONTROL_FORM_RESET);
                parent.getControl = blank;
            }
        }
    };

    /**
     * 设置控件的大小。
     * @protected
     *
     * @param {number} width 宽度，如果不需要设置则将参数设置为等价于逻辑非的值
     * @param {number} height 高度，如果不需要设置则省略此参数
     */
    UI_INPUT_CONTROL_CLASS.$setSize = function (width, height) {
        UI_CONTROL_CLASS.$setSize.call(this, width, height);
        this._eInput.style.width = this.getBodyWidth() + 'px';
        this._eInput.style.height = this.getBodyHeight() + 'px';
    };

    /**
     * 输入提交事件的默认处理。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_INPUT_CONTROL_CLASS.$submit = blank;

    /**
     * 控件获得失效状态。
     * 控件获得失效状态时，添加状态样式 -disabled(参见 alterClass 方法)。disable 方法导致控件失去激活、悬停、焦点状态，所有子控件的 isDisabled 方法返回 true，但不会设置子控件的失效状态样式。
     * @public
     *
     * @return {boolean} 控件失效状态是否变化
     */
    UI_INPUT_CONTROL_CLASS.disable = function () {
        if (UI_CONTROL_CLASS.disable.call(this)) {
            var body = this.getBody();

            if (this._bHidden) {
                this._eInput.disabled = true;
            }
            else {
                body.removeChild(this._eInput);
                if (this._eInput.type != 'password') {
                    // 如果输入框是密码框需要直接隐藏，不允许将密码显示在浏览器中
                    body.innerHTML = encodeHTML(this._eInput.value);
                }
            }

            return true;
        }
        return false;
    };

    /**
     * 控件解除失效状态。
     * 控件解除失效状态时，移除状态样式 -disabled(参见 alterClass 方法)。enable 方法仅解除控件自身的失效状态，如果其父控件失效，isDisabled 方法返回 true。
     * @public
     *
     * @return {boolean} 控件失效状态是否变化
     */
    UI_INPUT_CONTROL_CLASS.enable = function () {
        if (UI_CONTROL_CLASS.enable.call(this)) {
            var body = this.getBody();

            if (this._bHidden) {
                this._eInput.disabled = false;
            }
            else {
                body.innerHTML = '';
                body.appendChild(this._eInput);
            }

            return true;
        }
        return false;
    };

    /**
     * 获取控件的输入元素。
     * @public
     *
     * @return {HTMLElement} InputElement 对象
     */
    UI_INPUT_CONTROL_CLASS.getInput = function () {
        return this._eInput;
    };

    /**
     * 获取控件的名称。
     * 输入控件可以在表单中被提交，getName 方法返回提交时用的表单项名称，表单项名称可以使用 setName 方法改变。
     * @public
     *
     * @return {string} INPUT 对象名称
     */
    UI_INPUT_CONTROL_CLASS.getName = function () {
        return this._eInput.name;
    };

    /**
     * 获取当前当前选区的结束位置。
     * @public
     *
     * @return {number} 输入框当前选区的结束位置
     */
    UI_INPUT_CONTROL_CLASS.getSelectionEnd = ieVersion ? function () {
        var range = DOCUMENT.selection.createRange().duplicate();

        range.moveStart('character', -this._eInput.value.length);
        return range.text.length;
    } : function () {
        return this._eInput.selectionEnd;
    };

    /**
     * 获取当前选区的起始位置。
     * @public
     *
     * @return {number} 输入框当前选区的起始位置，即输入框当前光标的位置
     */
    UI_INPUT_CONTROL_CLASS.getSelectionStart = ieVersion ? function () {
        //__gzip_original__length
        var range = DOCUMENT.selection.createRange().duplicate(),
            length = this._eInput.value.length;

        range.moveEnd('character', length);
        return length - range.text.length;
    } : function () {
        return this._eInput.selectionStart;
    };

    /**
     * 获取控件的值。
     * getValue 方法返回提交时表单项的值，使用 setValue 方法设置。
     * @public
     *
     * @return {string} 控件的值
     */
    UI_INPUT_CONTROL_CLASS.getValue = function () {
        return this._eInput.value;
    };

    /**
     * 设置输入框光标的位置。
     * @public
     *
     * @param {number} pos 位置索引
     */
    UI_INPUT_CONTROL_CLASS.setCaret = ieVersion ? function (pos) {
        var range = this._eInput.createTextRange();
        range.collapse();
        range.select();
        range.moveStart('character', pos);
        range.collapse();
        range.select();
    } : function (pos) {
        this._eInput.setSelectionRange(pos, pos);
    };

    /**
     * 设置控件的名称。
     * 输入控件可以在表单中被提交，setName 方法设置提交时用的表单项名称，表单项名称可以使用 getName 方法获取。
     * @public
     *
     * @param {string} name 表单项名称
     */
    UI_INPUT_CONTROL_CLASS.setName = function (name) {
        this._eInput = setInput(this._eInput, name || '');
        UI_INPUT_CONTROL_BIND_EVENT(this);
    };

    /**
     * 设置控件的值。
     * setValue 方法设置提交时表单项的值，使用 getValue 方法获取设置的值。
     * @public
     *
     * @param {string} value 控件的值
     */
    UI_INPUT_CONTROL_CLASS.setValue = function (value) {
        //__gzip_original__input
        var input = this._eInput,
            func = UI_INPUT_CONTROL_INPUT.propertychange;

        // 停止事件，避免重入引发死循环
        if (func) {
            detachEvent(input, 'propertychange', func);
        }
        input.value = value;
        if (func) {
            attachEvent(input, 'propertychange', func);
        }
    };

    (function () {
        function build(name) {
            UI_INPUT_CONTROL_CLASS['$' + name] = function () {
                UI_CONTROL_CLASS['$' + name].call(this);

                //__gzip_original__input
                var input = this._eInput;

                detachEvent(input, name, UI_INPUT_CONTROL_INPUT[name]);
                try {
                    input[name]();
                }
                catch (e) {
                }
                attachEvent(input, name, UI_INPUT_CONTROL_INPUT[name]);
            };
        }

        build('blur');
        build('focus');
    })();
//{/if}//
//{if 0}//
})();
//{/if}//