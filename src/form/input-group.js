//{if $css}//
ecui.__ControlStyle__('\
.ui-input-group {\
    position: relative;\
}\
');
//{/if}//
/*
@example
<div ui="type:input-group">
    <!-- 这里放表单元素 -->
    ...
</div>

@fields
_bError  -  是否是错误状态
_sLabel  -  输入项标题
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ext = core.ext,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 表单元素组，用于验证失败时的错误处理。
     * options 属性：
     * label 标签名称
     * @control
     */
    ui.InputGroup = core.inherits(
        ui.Control,
        'ui-input-group',
        function (el, options) {
            _super(el, options);
            this._sLabel = options.label;
            if (this._sLabel) {
                if (!el.querySelector('.ui-input-label')) {
                    el.insertBefore(
                        dom.create(
                            'DIV',
                            { className: 'ui-input-label', innerHTML: this._sLabel }
                        ),
                        el.firstChild
                    );
                }
            }
            this._eTip = el.appendChild(dom.create('DIV', { className: 'ui-input-tip' }));
        },
        {
            /**
             * 控件组格式校验正确的处理。
             * @protected
             */
            $correct: function () {
                if (this._bError) {
                    this.alterSubType('');
                    this._bError = false;
                }
            },

            /**
             * 控件组格式校验错误的默认处理。
             * @event
             */
            $error: function (event) {
                this._bError = false;
                this.alterSubType('error');
                util.timer(function () {
                    this._bError = true;
                    this._eTip.innerHTML = event.getError()[0].replace(/{Name}/g, this._sLabel);
                }, 0, this);
            },

            /**
             * @override
             */
            init: function () {
                _super.init();
                var el = this.getBody(),
                    required;
                if (this._sLabel) {
                    dom.toArray(el.querySelectorAll('.ui-input')).forEach(function (item) {
                        item = item.getControl();
                        if (item.isRequired()) {
                            required = true;
                        } else if (item instanceof ui.abstractSelect && item instanceof ui.Text) {
                            core.$callExtend(item, ext.clear);
                        }
                    });
                    if (required) {
                        el.firstChild.insertAdjacentHTML('afterBegin', '<span class="ui-input-required">*</span>');
                    }
                }
            }
        }
    );
//{if 0}//
})();
//{/if}//
