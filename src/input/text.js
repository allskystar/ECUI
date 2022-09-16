/*
@example
<input ui="type:text" name="test" />
或:
<div ui="type:text;name:test;value:test">
    <!-- 如果ec中不指定name,value，也可以在input中指定 -->
    <input name="test" value="test" />
</div>

@fields
_bTrim        - 字符串是否需要过滤两端空白
_nMinLength   - 允许提将近最小长度
_nMaxLength   - 允许提交的最大长度
_oRegExp      - 允许提交的格式正则表达式
_ePlaceHolder - 为空时的提示信息标签
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
//{/if}//
    /**
     * 文本输入框控件。
     * 扩展 InputELement 标签的功能，提供对低版本 IE 的 placeholder 的兼容。
     * options 属性：
     * trim     是否进行前后空格过滤，默认为 true (注：粘贴内容也会进行前后空格过滤)
     * len      aaa-bbb表示数字允许的最小(aaa)/最大(bbb)长度
     * regexp   正则表达式，自动在两端添加^与$
     * @control
     */
    ui.Text = core.inherits(
        ui.InputControl,
        'ui-text',
        function (el, options) {
            ui.InputControl.call(this, el, options);

            this._bTrim = options.trim !== false;
            if (options.len) {
                el = options.len.split('-');
                if (el.length === 1) {
                    el[1] = el[0];
                    el[0] = 0;
                }
                this._nMinLength = +el[0];
                this._nMaxLength = +el[1];
            }

            if (options.regexp) {
                this._oRegExp = new RegExp('^' + options.regexp + '$');
            }

            el = this.getInput();
            if (ieVersion < 10) {
                this._ePlaceHolder = dom.insertBefore(
                    dom.create(
                        {
                            className: 'ui-placeholder',
                            innerHTML: dom.getAttribute(el, 'placeholder') || ''
                        }
                    ),
                    el
                );
            }
        },
        {
            /**
             * @override
             */
            $cache: function (style) {
                ui.InputControl.prototype.$cache.call(this, style);
                if (this._ePlaceHolder) {
                    style = dom.getStyle(this._ePlaceHolder);
                    this.$$placeholder = [util.toNumber(style.paddingTop), util.toNumber(style.paddingRight), util.toNumber(style.paddingBottom), util.toNumber(style.paddingLeft)];
                }
            },

            /**
             * 控件失效，阻止输入框提交
             * @override
             */
            $disable: function () {
                ui.InputControl.prototype.$disable.call(this);

                var body = this.getBody(),
                    input = this.getInput();

                this._oBodyChildList = dom.children(body);
                body.removeChild(input);
                if (input.type === 'password') {
                    // 如果输入框是密码框需要直接隐藏，不允许将密码显示在浏览器中
                    var value = '';
                    for (var i = this.getValue().length; i--; ) {
                        value += '*';
                    }
                    body.innerHTML = value;
                } else {
                    body.innerHTML = util.encodeHTML(input.value);
                }
            },

            /**
             * @override
             */
            $dispose: function () {
                this._ePlaceHolder = null;
                ui.InputControl.prototype.$dispose.call(this);
            },

            /**
             * 控件解除失效，需要将输入框设置为可提交
             * @override
             */
            $enable: function () {
                ui.InputControl.prototype.$enable.call(this);

                var body = this.getBody();
                body.innerHTML = '';
                // body.appendChild(this.getInput());
                (this._oBodyChildList || []).forEach(function (item) {
                    body.appendChild(item);
                });
            },

            /**
             * @override
             */
            $focus: function () {
                ui.InputControl.prototype.$focus.call(this);

                var el = this.getInput(),
                    textAlign = dom.getStyle(el, 'textAlign');

                if (textAlign === 'end' || textAlign === 'right') {
                    util.timer(
                        function () {
                            if (!this.getSelectionStart()) {
                                this.setSelection(el.value.length);
                            }
                        },
                        400,
                        this
                    );
                }
            },

            /**
             * @override
             */
            $initStructure: function (width, height) {
                ui.InputControl.prototype.$initStructure.call(this, width, height);
                var input = this.getInput();
                if (ieVersion < 9 && input.tagName === 'INPUT') {
                    input.style.lineHeight = height + 'px';
                }
                if (this._ePlaceHolder) {
                    this._ePlaceHolder.style.width = width - this.$$placeholder[1] - this.$$placeholder[3] + 'px';
                    this._ePlaceHolder.style.height = height - this.$$placeholder[0] - this.$$placeholder[2] + 'px';
                }
            },

            /**
             * 控件内容改变事件的默认处理。
             * @protected
             */
            $input: function () {
                ui.InputControl.prototype.$input.call(this);
                if (this._ePlaceHolder) {
                    this.alterStatus(this.getValue() ? '-empty' : '+empty');
                }
            },

            /**
             * @override
             */
            $ready: function () {
                ui.InputControl.prototype.$ready.call(this);
                if (this._ePlaceHolder) {
                    this.alterStatus(this.getValue() ? '-empty' : '+empty');
                }
            },

            /**
             * @override
             */
            $validate: function (event) {
                ui.InputControl.prototype.$validate.call(this, event);

                var value = this.getValue(),
                    length = value.length,
                    result = true;

                if (this._bTrim) {
                    value = value.trim();
                }

                if (this._nMinLength > length) {
                    result = false;
                }
                if (this._nMaxLength < length) {
                    result = false;
                }
                if (this._oRegExp && !this._oRegExp.test(value)) {
                    result = false;
                }

                return result;
            },

            /**
             * 获取当前当前选区的结束位置。
             * @public
             *
             * @return {number} 输入框当前选区的结束位置
             */
            getSelectionEnd: ieVersion ? function () {
                var range = document.selection.createRange().duplicate();

                range.moveStart('character', -this.getInput().value.length);
                return range.text.length;
            } : function () {
                var input = this.getInput(),
                    type = input.type,
                    ret;

                if ('number' === typeof input.selectionEnd) {
                    return input.selectionEnd;
                }
                input.type = 'text';
                ret = input.selectionEnd;
                input.type = type;
                return ret;
            },

            /**
             * 获取当前选区的起始位置。
             * @public
             *
             * @return {number} 输入框当前选区的起始位置，即输入框当前光标的位置
             */
            getSelectionStart: ieVersion ? function () {
                var range = document.selection.createRange().duplicate(),
                    length = this.getInput().value.length;

                range.moveEnd('character', length);
                return length - range.text.length;
            } : function () {
                var input = this.getInput(),
                    type = input.type,
                    ret;

                if ('number' === typeof input.selectionStart) {
                    return input.selectionStart;
                }
                input.type = 'text';
                ret = input.selectionStart;
                input.type = type;
                return ret;
            },

            /**
             * @override
             */
            getValue: function () {
                var value = ui.InputControl.prototype.getValue.call(this);
                if (this._bTrim) {
                    value = value.trim();
                }
                return value;
            },

            /**
             * 设置输入框选中的区域，如果不指定结束的位置，将直接设置光标的位置。
             * @public
             *
             * @param {number} startPos 选中区域开始位置索引
             * @param {number} endPos 选中区域结束位置索引，如果省略，等于开始的位置
             */
            setSelection: function (startPos, endPos) {
                endPos = endPos === undefined ? startPos : Math.max(startPos, endPos);

                var input = this.getInput();

                if (ieVersion) {
                    var range = input.createTextRange();
                    range.collapse();
                    range.select();
                    range.moveStart('character', startPos);
                    range.moveEnd('character', endPos);
                    range.select();
                } else {
                    var type = input.type;

                    if ('number' === typeof input.selectionStart) {
                        input.setSelectionRange(startPos, endPos);
                    } else {
                        input.type = 'text';
                        input.setSelectionRange(startPos, endPos);
                        input.type = type;
                    }
                }
            }
        }
    );
}());
