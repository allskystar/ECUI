/*
Edit - 定义输入数据的基本操作。
输入框控件，继承自基础控件，实现了对原生 InputElement 的功能扩展，包括光标的控制、输入事件的实时响应(每次改变均触发事
件)，以及 IE 下不能动态改变输入框的表单项名称的模拟处理。输入框控件默认使用文本输入框，对于需要使用加密框的场景，可以
使用 &lt;input type="password" ecui="type:edit"&gt; 的方式初始化。

输入框控件直接HTML初始化的例子:
<input ecui="type:edit" name="test" value="test" />
或:
<div ecui="type:edit;name:test;value:test">
    <!-- 如果ec中不指定name,value，也可以在input中指定 -->
    <input name="test" value="test" />
</div>

属性
_bHidden - 输入框是否为hidden类型
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
        getParent = dom.getParent,
        insertBefore = dom.insertBefore,
        removeChild = dom.removeChild,
        setInput = dom.setInput,
        setStyle = dom.setStyle,
        encodeHTML = string.encodeHTML,
        attachEvent = util.attachEvent,
        blank = util.blank,
        detachEvent = util.detachEvent,
        inherits = util.inherits,
        timer = util.timer,

        $bind = core.$bind,
        findControl = core.findControl,
        loseFocus = core.loseFocus,
        setFocused = core.setFocused,
        standardEvent = core.event,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化输入框控件。
     * params 参数支持的属性如下：
     * name  输入框的名称
     * value 输入框的默认值
     * input 输入框的类型，默认为 text
     * hidden 输入框是否隐藏，隐藏状态下将不会绑定键盘事件
     * @public
     *
     * @param {Element} el 关联的 Element 对象
     * @param {Object} params 初始化参数
     */
    //__gzip_original__UI_EDIT
    var UI_EDIT =
        ui.Edit = function (el, params) {
            var input = el;
            if (params.value === 0) {
                params.value = '0';
            }

            if (el.tagName == 'INPUT') {
                // 检查是否存在Input，如果没有生成一个Input
                input = setInput(input, params.name, params.input);

                el = createDom(input.className, input.style.cssText + ';overflow:hidden');

                input.className = '';
                input.style.cssText = 'border:0px';
                insertBefore(el, input).appendChild(input);
            }
            else {
                el.style.overflow = 'hidden';
                if (!(input = el.getElementsByTagName('input')[0])) {
                    input = setInput(null, params.name, params.input);
                    input.defaultValue = input.value = params.value || '';
                    el.appendChild(input);
                }
                input.style.border = '0px';
            }
            if (this._bHidden = params.hidden) {
                input.style.display = 'none';
            }
            setStyle(el, 'display', 'inline-block');

            this._eInput = input;
            UI_EDIT_BIND_EVENT(this);

            UI_CONTROL.call(this, el, params);
        },
        UI_EDIT_CLASS = inherits(UI_EDIT, UI_CONTROL),

        UI_EDIT_INPUT = {};
//{else}//
    /**
     * 表单提交事件处理。
     * @private
     *
     * @param {Event} event 事件对象
     */
    function UI_EDIT_FORM_SUBMIT(event) {
        event = standardEvent(event);

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
    function UI_EDIT_FORM_RESET(event) {
        event = standardEvent(event);

        timer(function () {
            //__transform__elements_list
            //__transform__el_o
            for (var i = 0, elements = event.target.elements, el; el = elements[i++]; ) {
                if (el.getControl) {
                    if (!(el.onreset && el.onreset(event) === false)) {
                        el.getControl().$reset(event);
                    }
                }
            }
        });
    }

    /**
     * 为控件的 INPUT 节点绑定事件。
     * @private
     *
     * @param {ecui.ui.Edit} control 输入框控件对象
     */
    function UI_EDIT_BIND_EVENT(control) {
        if ($bind(control._eInput, control)) {
            if (!control._bHidden) {
                for (var name in UI_EDIT_INPUT) {
                    attachEvent(control._eInput, name, UI_EDIT_INPUT[name]);
                }
            }
        }
    }

    /**
     * 输入框失去/获得焦点事件处理函数。
     * @private
     *
     * @param {Event} event 事件对象
     */
    UI_EDIT_INPUT.blur = UI_EDIT_INPUT.focus = function (event) {
        //__gzip_original__type
        var type = event.type;

        event = findControl(standardEvent(event).target);
        // 设置默认失去焦点事件，阻止在blur/focus事件中再次回调
        event['$' + type] = UI_CONTROL_CLASS['$' + type];
        if (type == 'blur') {
            loseFocus(event);
        }
        else {
            // 如果控件处于不可操作状态，不允许获得焦点
            if (event.isEnabled()) {
                setFocused(event);
            }
            else {
                event._eInput.blur();
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
    UI_EDIT_INPUT.dragover = UI_EDIT_INPUT.drop = function (event) {
        event = standardEvent(event);
        event.stopPropagation();
        event.preventDefault();
    };

    /**
     * 输入框输入内容事件处理函数。
     * @private
     *
     * @param {Event} event 事件对象
     */
    if (ieVersion) {
        UI_EDIT_INPUT.propertychange = function (event) {
            if (event.propertyName == 'value') {
                findControl(standardEvent(event).target).change();
            }
        };
    }
    else {
        UI_EDIT_INPUT.input = function () {
            findControl(this).change();
        };
    }

    /**
     * 销毁控件的默认处理。
     * 页面卸载时将销毁所有的控件，释放循环引用，防止在 IE 下发生内存泄漏，$dispose 方法的调用不会受到 ondispose 事件返回值的影响。
     * @protected
     */
    UI_EDIT_CLASS.$dispose = function () {
        this._eInput.getControl = undefined;
        this._eInput = null;
        UI_CONTROL_CLASS.$dispose.call(this);
    };

    /**
     * 输入框控件重置的默认处理。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_EDIT_CLASS.$reset = function (event) {
        this.$ready();
    };

    /**
     * 直接设置父控件。
     * @protected
     *
     * @param {ecui.ui.Control} parent ECUI 控件对象
     */
    UI_EDIT_CLASS.$setParent = function (parent) {
        UI_CONTROL_CLASS.$setParent.call(this, parent);
        if (parent = this._eInput.form) {
            if (!parent.getControl) {
                attachEvent(parent, 'submit', UI_EDIT_FORM_SUBMIT);
                attachEvent(parent, 'reset', UI_EDIT_FORM_RESET);
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
    UI_EDIT_CLASS.$setSize = function (width, height) {
        UI_CONTROL_CLASS.$setSize.call(this, width, height);
        this._eInput.style.width = this.getBodyWidth() + 'px';
        this._eInput.style.height = this.getBodyHeight() + 'px';
    };

    /**
     * 输入框控件提交前的默认处理。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_EDIT_CLASS.$submit = blank;

    /**
     * 获取控件外层的 InputElement 对象。
     * @public
     *
     * @return {HTMLElement} InputElement 对象
     */
    UI_EDIT_CLASS.getInput = function () {
        return this._eInput;
    };

    /**
     * 获取控件的表单项名称。
     * 输入框控件可以在表单中被提交，getName 方法返回提交时用的表单项名称，表单项名称可以使用 setName 方法改变。
     * @public
     *
     * @return {string} INPUT 对象名称
     */
    UI_EDIT_CLASS.getName = function () {
        return this._eInput.name;
    };

    /**
     * 获得当前当前选区的结束位置。
     * @public
     *
     * @return {number} 输入框当前选区的结束位置
     */
    UI_EDIT_CLASS.getSelectionEnd = ieVersion ? function () {
        var range = DOCUMENT.selection.createRange().duplicate();

        range.moveStart('character', -this._eInput.value.length);
        return range.text.length;
    } : function () {
        return this._eInput.selectionEnd;
    };

    /**
     * 获得当前选区的起始位置，即当前光标的位置。
     * @public
     *
     * @return {number} 输入框当前选区的起始位置，即输入框当前光标的位置
     */
    UI_EDIT_CLASS.getSelectionStart = ieVersion ? function () {
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
     * getValue 方法返回提交时用的表单项的值，使用 setValue 方法设置。
     * @public
     *
     * @return {string} 控件的值
     */
    UI_EDIT_CLASS.getValue = function () {
        return this._eInput.value;
    };

    /**
     * 设置输入框光标的位置。
     * @public
     *
     * @param {number} pos 位置索引
     */
    UI_EDIT_CLASS.setCaret = ieVersion ? function (pos) {
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
     * 设置控件的可操作状态。
     * 如果控件设置为不可操作，调用 alterClass 方法为控件添加扩展样式 -disabled，同时自动失去焦点；如果设置为可操作，移除控件的扩展样式 -disabled。setEnabled 方法只是设置控件自身的可操作状态，然后控件设置为可操作，并不代表调用 isEnabled 方法返回的值一定是 true，控件的可操作状态还受到父控件的可操作状态的影响。
     * @public
     *
     * @param {boolean} status 控件是否可操作，默认为 true
     * @return {boolean} 状态是否发生改变
     */
    UI_EDIT_CLASS.setEnabled = function (status) {
        if (UI_CONTROL_CLASS.setEnabled.call(this, status)) {
            var body = this.getBody();

            if (this.isEnabled()) {
                if (getParent(this._eInput)) {
                    this._eInput.disabled = false;
                }
                else {
                    body.innerHTML = '';
                    body.appendChild(this._eInput);
                }
            }
            else {
                if (this._eInput.offsetWidth) {
                    body.removeChild(this._eInput);
                    body.innerHTML = encodeHTML(this._eInput.value);
                }
                else {
                    this._eInput.disabled = true;
                }
            }

            return true;
        }

        return false;
    };

    /**
     * 设置控件的表单项名称。
     * 输入框控件可以在表单中被提交，setName 方法设置提交时用的表单项名称，表单项名称可以使用 getName 方法获取。
     * @public
     *
     * @param {string} name 表单项名称
     */
    UI_EDIT_CLASS.setName = function (name) {
        this._eInput = setInput(this._eInput, name || '');
        UI_EDIT_BIND_EVENT(this);
    };

    /**
     * 设置控件的值。
     * setValue 方法设置提交时用的表单项的值，使用 getValue 方法获取设置的值。
     * @public
     *
     * @param {string} value 控件的值
     */
    UI_EDIT_CLASS.setValue = function (value) {
        //__gzip_original__input
        var input = this._eInput,
            func = UI_EDIT_INPUT.propertychange;
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
            UI_EDIT_CLASS['$' + name] = function () {
                UI_CONTROL_CLASS['$' + name].call(this);

                timer(function () {
                    //__gzip_original__input
                    var input = this._eInput;
                    if (input) {
                        detachEvent(input, name, UI_EDIT_INPUT.blur);
                        try {
                            input[name]();
                        }
                        catch (e) {
                        }
                        attachEvent(input, name, UI_EDIT_INPUT.blur);
                    }
                }, 0, this);
            };
        }

        build('blur');
        build('focus');
    })();
//{/if}//
//{if 0}//
})();
//{/if}//