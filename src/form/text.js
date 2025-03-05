//{if $css}//
ecui.__ControlStyle__('\
.ui-text {\
    .ui-placeholder {\
        position: absolute !important;\
        display: none !important;\
        .width100rate();\
    }\
\
    input {\
        .width100rate();\
        .height100rate();\
    }\
}\
\
.ui-text-empty,\
.ui-text-error {\
    .ui-placeholder {\
        display: block !important;\
        z-index: 1 !important;\
    }\
}\
');
//{/if}//
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
_oFilter      - 允许输入的字符
_sOnce        - 只允许输入一次的字符
_sFormat      - 格式化字符
_oPattern     - 允许提交的格式正则表达式
_ePlaceHolder - 为空时的提示信息标签
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    function placeholder(control) {
        if (control.getValue().length) {
            control.alterStatus('-placeholder');
        } else {
            control.alterStatus('+placeholder');
        }
    }

    var charset = [
        {start: 48, value: '0123456789', shift: ')!@#$%^&*('},
        {start: 65, value: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', shift: 'abcdefghijklmnopqrstuvwxyz'},
        {start: 96, value: '0123456789*+', shift: '0123456789*+'}, // 数字键盘
        {start: 109, value: '-./', shift: '-./' }, // 数字键盘
        {start: 186, value: ';=,-./`', shift: ':+<_>?~'},
        {start: 219, value: '[\\]\'', shift: '{|}"'}
    ];

    /**
     * 文本输入框控件。
     * 扩展 InputELement 标签的功能，提供对低版本 IE 的 placeholder 的兼容。
     * options 属性：
     * trim     是否进行前后空格过滤，默认为 true (注：粘贴内容也会进行前后空格过滤)
     * len      aaa-bbb表示数字允许的最小(aaa)/最大(bbb)长度
     * filter   允许输入的字符
     * once     只允许输入一次的字符，第二次输入直接落在之前的位置
     * format   格式化字符，光标移动会跳过
     * pattern  用于校验输入的正则表达式，自动在两端添加^与$
     * @control
     */
    ui.Text = core.inherits(
        ui.abstractInput,
        'ui-text',
        function (el, options) {
            _super(el, options);

            var inputEl = this.getInput();
            if (!inputEl.getAttribute('autocomplete')) {
                inputEl.setAttribute('autocomplete', 'off');
            }

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
            if (_super.isRequired() && !this._nMinLength) {
                this._nMinLength = 1;
            }
            if (options.filter) {
                this._oFilter = new RegExp('[' + options.filter + ']');
            }
            this._sOnce = options.once;
            this._sFormat = options.format;
            if (options.pattern) {
                this._oPattern = new RegExp('^' + options.pattern + '$');
            }

            if (inputEl.getAttribute('placeholder') === null) {
                if (this._nMaxLength) {
                    inputEl.setAttribute(
                        'placeholder',
                        util.formatString(
                            this._nMinLength > 1 ?
                                this._nMinLength === this._nMaxLength ?
                                    this.PLACEHOLDER_LENGTH2 :
                                    this.PLACEHOLDER_LENGTH :
                                this.PLACEHOLDER_MAXLENGTH,
                            this._nMaxLength, this._nMinLength
                        )
                    );
                } else if (this.PLACEHOLDER) {
                    inputEl.setAttribute('placeholder', this.PLACEHOLDER);
                }
            }
        },
        {
            PLACEHOLDER_MAXLENGTH: '请输入{0}个以内的字符',
            PLACEHOLDER_LENGTH: '请输入{1}-{0}个字符',
            PLACEHOLDER_LENGTH2: '请输入{0}个字符',
            ERROR_MINLENGTH1: '请输入{Name}',
            ERROR_MINLENGTH2: '{Name}需要输入至少{0}个字符',
            ERROR_MAXLENGTH: '{Name}只能输入最多{0}个字符',
            ERROR_PATTERN: '{Name}格式不正确',

            /**
             * @override
             */
            $input: function (event) {
                _super.$input(event);
                if (this._oFilter && event.ime) {
                    var value = this.getValue();
                    this.setValue(value.substring(0, event.ime) + value.substring(this.getSelectionEnd()));
                    this.setSelection(event.ime);
                }
                placeholder(this);
            },

            /**
             * @override
             */
            $keydown: function (event) {
                _super.$keydown(event);
                if (event.which === 8 || event.which === 46 || (event.which >= 37 && event.which <= 40)) {
                    if (this._sFormat && !event.ctrlKey && !event.altKey && !event.metaKey) {
                        var el = this.getInput(),
                            start = dom.getSelectionStart(el),
                            end = dom.getSelectionEnd(el);
                        if (start === end) {
                            if (event.which === 37 && start > 1 && this._sFormat.indexOf(el.value.charAt(start - 2)) >= 0) {
                                dom.setSelection(el, start - 1);
                            } else if ((event.which === 39 || event.which === 46) && this._sFormat.indexOf(el.value.charAt(start)) >= 0) {
                                dom.setSelection(el, start + 1);
                                if (event.which === 46) {
                                    event.preventDefault();
                                }
                            }
                        }
                    }
                    return;
                }
                if (this._oFilter && !event.ctrlKey && !event.altKey && !event.metaKey && event.which !== 9) {
                    if (event.key) {
                        item = event.key;
                    } else {
                        for (var i = 0, item; (item = charset[i++]);) {
                            item = event.shiftKey ? item.shift.charAt(event.which - item.start) : item.value.charAt(event.which - item.start);
                            if (item) {
                                break;
                            }
                        }
                    }
                    if (item) {
                        if (this._oFilter.test(item)) {
                            return;
                        }
                        if (this._sOnce && this._sOnce.indexOf(item) >= 0) {
                            item = this.getValue().indexOf(item);
                            if (item < 0 || (item >= this.getSelectionStart() && item < this.getSelectionEnd())) {
                                return;
                            }
                            this.setSelection(item + 1);
                        }
                    }
                    event.preventDefault();
                }
            },

            /**
             * @override
             */
            $ready: function () {
                placeholder(this);
            },

            /**
             * @override
             */
            $validate: function (event) {
                var result = _super.$validate(event);
                if (result === false) {
                    return result;
                }

                var value = this.getFormValue(),
                    length = value.length;
                if (this._nMinLength > length) {
                    event.addError(this._nMinLength > 1 ? util.formatString(this.ERROR_MINLENGTH2, this._nMinLength) : this.ERROR_MINLENGTH1);
                    return false;
                }
                if (this._nMaxLength < length) {
                    event.addError(util.formatString(this.ERROR_MAXLENGTH, this._nMaxLength));
                    return false;
                }
                if (this._oPattern && !this._oPattern.test(value)) {
                    event.addError(this.ERROR_PATTERN);
                    return false;
                }
            },

            /**
             * 获取当前选区的最大输入长度。
             * @public
             *
             * @return {number} 当前选区的最大输入长度
             */
            getMaxLength: function () {
                return this._nMaxLength;
            },

            /**
             * 获取当前选区的结束位置。
             * @public
             *
             * @return {number} 输入框当前选区的结束位置
             */
            getSelectionEnd: function () {
                return dom.getSelectionEnd(this.getInput());
            },

            /**
             * 获取当前选区的起始位置。
             * @public
             *
             * @return {number} 输入框当前选区的起始位置，即输入框当前光标的位置
             */
            getSelectionStart: function () {
                return dom.getSelectionStart(this.getInput());
            },

            /**
             * @override
             */
            getValue: function () {
                var value = _super.getValue();
                if (this._bTrim) {
                    value = value.trim();
                }
                return value;
            },

            /**
             * @override
             */
            isRequired: function () {
                return !!this._nMinLength;
            },

            /**
             * 设置输入框选中的区域，如果不指定结束的位置，将直接设置光标的位置。
             * @public
             *
             * @param {number} startPos 选中区域开始位置索引
             * @param {number} endPos 选中区域结束位置索引，如果省略，等于开始的位置
             */
            setSelection: function (startPos, endPos) {
                dom.setSelection(this.getInput(), startPos, endPos);
            }
        }
    );
})();
