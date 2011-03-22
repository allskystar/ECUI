/*
Progress - 定义进度显示的基本操作。
进度条控件，继承自基础控件，面向用户显示一个任务执行的程度。

进度条控件直接HTML初始化的例子:
<div ecui="type:progress;rate:0.5"></div>

属性
_eText - 内容区域
_eMask - 完成的进度比例内容区域
*/
//{if 0}//
(function () {

    var core = ecui,
        ui = core.ui,
        util = core.util,

        MATH = Math,
        FLOOR = MATH.floor,
        MAX = MATH.max,
        MIN = MATH.min,
        ROUND = MATH.round,

        inherits = util.inherits,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化进度条控件。
     * params 参数支持的属性如下：
     * rate 初始的百分比
     * @public
     *
     * @param {Element} el 关联的 Element 对象
     * @param {Object} params 初始化参数
     */
    //__gzip_original__UI_PROGRESS
    var UI_PROGRESS =
        ui.Progress = function (el, params) {
            UI_CONTROL.call(this, el, params);

            var text = el.innerHTML;

            el.innerHTML = '<div class="' + params.base +
                '-text" style="position:absolute;top:0px;left:0px"></div><div class="' + params.base +
                '-mask" style="position:absolute;top:0px;left:0px"></div>';
            this._eText = el.firstChild;
            this._eMask = el.lastChild;

            this.setText(params.rate || 0, text);
        },
        UI_PROGRESS_CLASS = inherits(UI_PROGRESS, UI_CONTROL);
//{else}//
    /**
     * 销毁控件的默认处理。
     * @protected
     */
    UI_PROGRESS_CLASS.$dispose = function () {
        this._eText = this._eMask = null;
        UI_CONTROL_CLASS.$dispose.call(this);
    };

    /**
     * 设置控件的大小。
     * @protected
     *
     * @param {number} width 宽度，如果不需要设置则将参数设置为等价于逻辑非的值
     * @param {number} height 高度，如果不需要设置则省略此参数
     */
    UI_PROGRESS_CLASS.$setSize = function (width, height) {
        UI_CONTROL_CLASS.$setSize.call(this, width, height);
        this.$locate();

        //__gzip_original__style1
        //__gzip_original__style2
        var style1 = this._eText.style,
            style2 = this._eMask.style;
        style1.width = style2.width = this.getBodyWidth() + 'px';
        style1.height = style2.height = this.getBodyHeight() + 'px';
    };

    /**
     * 设置进度的比例以及需要显示的文本。
     * @protected
     *
     * @param {number} rate 进度比例，在0-1之间
     * @param {number} text 显示的文本，如果省略将显示成 xx%
     */
    UI_PROGRESS_CLASS.setText = function (rate, text) {
        rate = MIN(MAX(0, rate), 1);
        if (text !== undefined) {
            this._eText.innerHTML = this._eMask.innerHTML = text || ROUND(rate * 100) + '%';
        }
        this._eMask.style.clip =
            'rect(0px,' + FLOOR(rate * this.getBodyWidth()) + 'px,' + this.getBodyHeight() + 'px,0px)';
    };
//{/if}//
//{if 0}//
})();
//{/if}//