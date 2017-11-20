/*
FormatEdit - 定义格式化输入数据的基本操作。
格式化输入框控件，继承自输入框控件，对输入的数据内容格式进行限制。

输入框控件直接HTML初始化的例子:
<input ecui="type:format-edit" name="test" />
或:
<div ecui="type:format-edit;name:test;value:test">
    <!-- 如果ec中不指定name,value，也可以在input中指定 -->
    <input name="test" value="test" />
</div>

属性
_bSymbol    - 是否自动进行全半角转换
_bTrim      - 字符串是否需要过滤两端空白
_nMinLength - 允许提交的最小长度
_nMaxLength - 允许提交的最大长度
_nMinValue  - 允许提交的最小值
_nMaxValue  - 允许提交的最大值
_sCharset   - 字节码编码集
_sInput     - 每次操作输入的字符串
_aSegment   - 每次操作左边/中间(被选中的)/右边的字符串
_oKeyMask   - 允许提交的字符限制正则表达式
_oFormat    - 允许提交的格式正则表达式
*/
//{if 0}//
(function () {

    var core = ecui,
        string = core.string,
        ui = core.ui,
        util = core.util,

        undefined,
        REGEXP = RegExp,

        getByteLength = string.getByteLength,
        sliceByte = string.sliceByte,
        toHalfWidth = string.toHalfWidth,
        trim = string.trim,
        inherits = util.inherits,

        triggerEvent = core.triggerEvent,

        UI_EDIT = ui.Edit,
        UI_EDIT_CLASS = UI_EDIT.prototype;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化格式化输入框控件。
     * options 对象支持的属性如下：
     * symbol 是否进行全角转半角操作，默认为 true
     * trim 是否进行前后空格过滤，默认为 true (注：粘贴内容也会进行前后空格过滤)
     * charset 字符编码，允许 utf8 与 gbk，如果不设置表示基于字符验证长度
     * keyMask 允许的字符集正则表达式
     * minLength 最小长度限制
     * maxLength 最大长度限制
     * minValue 数字允许的最小值
     * maxValue 数字允许的最大值
     * format 字符串的正则表达式，自动添加正则表达式的^$
     *
     * @public
     *
     * @param {Object} options 初始化选项
     */
    //__gzip_original__UI_FORMAT_EDIT
    var UI_FORMAT_EDIT =
        ui.FormatEdit = function (el, options) {
            UI_EDIT.call(this, el, options);

            this._bSymbol = options.symbol !== false;
            this._bTrim = options.trim !== false;
            this._sCharset = options.charset;
            this._oKeyMask = options.keyMask ? new REGEXP(options.keyMask, 'g') : null;
            this._nMinLength = options.minLength;
            this._nMaxLength = options.maxLength;
            this._nMinValue = options.minValue;
            this._nMaxValue = options.maxValue;
            this._oFormat = options.format ? new REGEXP('^' + options.format + '$') : null;

            this._aSegment = ['', '', ''];
        },
        UI_FORMAT_EDIT_CLASS = inherits(UI_FORMAT_EDIT, UI_EDIT);
//{else}//
    /**
     * 控件失去焦点事件的默认处理。
     * 控件失去焦点时默认调用 $blur 方法，删除控件在 $focus 方法中添加的扩展样式 -focus。如果控件处于可操作状态(参见 isEnabled)，blur 方法触发 onblur 事件，如果事件返回值不为 false，则调用 $blur 方法。
     * @protected
     */
    UI_FORMAT_EDIT_CLASS.$blur = function () {
        UI_EDIT_CLASS.$blur.call(this);
        this.validate();
    };

    /**
     * 获取当前输入的内容，如果是粘贴操作是一个长度超过1的字符串。
     * @protected
     *
     * @return {string} 当前输入的内容
     */
    UI_FORMAT_EDIT_CLASS.$getInputText = function () {
        return this._sInput;
    };

    /**
     * 控件拥有焦点时，键盘按下事件(鼠标在控件区域内移动事件)的默认处理。
     * 三种方式能改变输入框内容：1) 按键；2) 鼠标粘贴；3) 拖拽内容，keydown 在 change 事件前，因此按键改变内容方式时最适合记录 change 前光标信息，用于记录用户选择的内容。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_FORMAT_EDIT_CLASS.$keydown = UI_FORMAT_EDIT_CLASS.$mousemove = function (event) {
        UI_EDIT_CLASS['$' + event.type].call(this, event);

        var value = this.getInput().value,
            start = this.getSelectionStart(),
            end = this.getSelectionEnd();

        this._aSegment = [value.slice(0, start), value.slice(start, end), value.slice(end)];
    };

    /**
     * 输入框控件提交前的默认处理。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_FORMAT_EDIT_CLASS.$submit = function (event) {
        UI_EDIT_CLASS.$submit.call(this, event);
        if (!this.validate()) {
            event.preventDefault();
        }
    };

    /**
     * 控件内容改变时事件的处理。
     * @public
     */
    UI_FORMAT_EDIT_CLASS.change = function () {
        //__gzip_original__keyMask
        ///__gzip_original__length
        ///__gzip_original__max
        //__gzip_original__charsetName
        //__gzip_original__segments
        //__gzip_original__left
        //__gzip_original__right
        //__gzip_original__start
        var value = this.getValue(),
            keyMask = this._oKeyMask,
            length = this._nMaxLength,
            max = this._nMaxValue,
            charsetName = this._sCharset,
            segments = this._aSegment,
            left = segments[0],
            right = segments[2],
            start = left.length,
            end = value.length - right.length;

        // 如果是删除操作直接结束
        if (value = end < 0 ? undefined : value.slice(start, end)) {
            // 进行全角转半角操作
            if (this._bSymbol) {
                value = toHalfWidth(value);
            }

            // 过滤前后空格
            if (this._bTrim) {
                value = trim(value);
            }

            // 过滤不合法的字符集
            if (keyMask) {
                value = (value.match(keyMask) || []).join('');
            }

            // 当maxLength有值时，计算当前还能插入内容的长度
            if (length) {
                value = sliceByte(value, length - getByteLength(left + right, charsetName), charsetName);
            }

            if (!value) {
                this.restore();
                return;
            }

            // 如果存在_nMaxVal，则判断是否符合最大值
            if (!(max === undefined || max >= left + value + right - 0)) {
                value = segments[1];
            }

            this.setValue(left + value + right);
            this.setCaret(start + value.length);
        }
        this._sInput = value;

        UI_EDIT_CLASS.change.call(this);
    };

    /**
     * 恢复输入框的值。
     * @public
     */
    UI_FORMAT_EDIT_CLASS.restore = function () {
        this.setValue(this._aSegment.join(''));
        this.setCaret(this._aSegment[0].length);
    };

    /**
     * 检测输入框当前的值是否合法。
     * @public
     *
     * @return {boolean} 当前值是否合法
     */
    UI_FORMAT_EDIT_CLASS.validate = function () {
        //__gzip_original__minLength
        //__gzip_original__maxLength
        //__gzip_original__minValue
        //__gzip_original__maxValue
        //__gzip_original__format
        var err = {},
            minLength = this._nMinLength,
            maxLength = this._nMaxLength,
            minValue = this._nMinValue,
            maxValue = this._nMaxValue,
            format = this._oFormat,
            value = this.getValue(),
            length = getByteLength(value, this._sCharset),
            result = true;

        if (minLength > length) {
            err.minLength = minLength;
            result = false;
        }
        if (maxLength < length) {
            err.maxLength = maxLength;
            result = false;
        }
        if (minValue > value - 0) {
            err.minValue = minValue;
            result = false;
        }
        if (maxValue < value - 0) {
            err.maxValue = maxValue;
            result = false;
        }
        if (format && !format.test(value)) {
            err.format = true;
            result = false;
        }

        if (!result) {
            triggerEvent(this, 'error', null, [err]);
        }
        return result;
    };
//{/if}//
//{if 0}//
})();
//{/if}//