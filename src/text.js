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
_nMinValue    - 允许提交的最小值
_nMaxValue    - 允许提交的最大值
_sErrValue    - 检验错误的文本值
_oRegExp      - 允许提交的格式正则表达式
_ePlaceHolder - 为空时的提示信息标签
*/
//{if 0}//
(function () {
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
     * trim    是否进行前后空格过滤，默认为 true (注：粘贴内容也会进行前后空格过滤)
     * len     [aaa,bbb]表示数字允许的最小(aaa)/最大(bbb)长度
     * num     [aaa,bbb]表示数字允许的最小(aaa)/最大(bbb)值
     * regexp  正则表达式，自动在两端添加^与$
     * @control
     */
    ui.Text = core.inherits(
        ui.InputControl,
        'ui-text',
        function (el, options) {
            ui.InputControl.constructor.call(this, el, options);

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
            if (options.num) {
                el = options.num.split('-');
                if (el.length === 1) {
                    el[1] = el[0];
                    el[0] = 0;
                }
                this._nMinValue = +el[0];
                this._nMaxValue = +el[1];
            }
            if (options.regexp) {
                this._oRegExp = new RegExp('^' + options.regexp + '$');
            }

            if (ieVersion < 10) {
                el = this.getInput();
                options = dom.getAttribute(el, 'placeholder');
                if (options) {
                    this._ePlaceHolder = dom.insertBefore(
                        dom.create(
                            {
                                className: 'ui-placeholder',
                                innerHTML: options
                            }
                        ),
                        el
                    );
                }
            }
        },
        {
            /**
             * @override
             */
            $cache: function (style, cacheSize) {
                ui.InputControl.prototype.$cache.call(this, style, cacheSize);
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
                body.appendChild(this.getInput());
            },

            /**
             * 控件格式校验错误的默认处理。
             * @protected
             */
            $error: function () {
                this.alterSubType('error');

                var el = this.getInput();
                this._sErrValue = el.value;
                el.value = '';
            },

            /**
             * @override
             */
            $focus: function () {
                ui.InputControl.prototype.$focus.call(this);
                this.alterSubType('');

                if (this._sErrValue !== undefined) {
                    var el = this.getInput();
                    el.value = this._sErrValue;
                    delete this._sErrValue;
                }
            },

            /**
             * @override
             */
            $initStructure: function (width, height) {
                ui.InputControl.prototype.$initStructure.call(this, width, height);
                var input = this.getInput();
                input.style.width = width + 'px';
                input.style.height = height + 'px';
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
                    this.alterClass(this.getValue() ? '-empty' : '+empty');
                }
            },

            /**
             * @override
             */
            $ready: function () {
                ui.InputControl.prototype.$ready.call(this);
                if (this._ePlaceHolder) {
                    this.alterClass(this.getValue() ? '-empty' : '+empty');
                }
            },

            /**
             * @override
             */
            $validate: function () {
                ui.InputControl.prototype.$validate.call(this);

                var value = this.getValue(),
                    length = value.length,
                    result = true;

                value = +value;
                if (this._nMinLength > length) {
                    result = false;
                }
                if (this._nMaxLength < length) {
                    result = false;
                }
                if (this._nMinValue > value) {
                    result = false;
                }
                if (this._nMaxValue < value) {
                    result = false;
                }
                if ((this._oRegExp && !this._oRegExp.test(value)) || (isNaN(value) && (this._nMinValue !== undefined || this._nMaxValue !== undefined))) {
                    result = false;
                }

                if (!result) {
                    core.triggerEvent(this, 'error');
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
                return this.getInput().selectionEnd;
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
                return this.getInput().selectionStart;
            },

            /**
             * 设置输入框光标的位置。
             * @public
             *
             * @param {number} pos 位置索引
             */
            setCaret: ieVersion ? function (pos) {
                var range = this.getInput().createTextRange();
                range.collapse();
                range.select();
                range.moveStart('character', pos);
                range.collapse();
                range.select();
            } : function (pos) {
                this.getInput().setSelectionRange(pos, pos);
            }
        }
    );
//{if 0}//
}());
//{/if}//
