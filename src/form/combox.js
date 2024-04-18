//{if $css}//
ecui.__ControlStyle__('\
.ui-combox {\
    position: relative;\
\
    .ui-combox-text {\
        position: absolute !important;\
        overflow: hidden !important;\
        .width100rate();\
        .height100rate();\
\
        input {\
            left: 0;\
            top: 0;\
            display: block !important;\
        }\
    }\
\
    input {\
        position: absolute;\
        display: none !important;\
        .width100rate();\
        outline: none !important;\
    }\
}\
\
/* 为不支持placeholder的浏览器提供兼容样式 */\
.ui-combox-placeholder {\
    input {\
        .opacity0();\
        background-color: transparent;\
    }\
}\
\
.ui-combox-options {\
    overflow: auto !important;\
    overflow-x: hidden !important;\
}\
');
//{/if}//
/*
@example
<select ui="type:combox;placeholder:请输入" name="age">
    <option value="20">20</option>
    <option value="21" selected>21</option>
    <option value="22">22</option>
</select>
或
<div ui="type:combox;name:age;value:21">
    <div ui="value:20">20</div>
    <div ui="value:21">21</div>
    <div ui="value:22">22</div>
</div>
或
<div ui="type:combox">
    <input name="age" value="21" placeholder="请输入">
    <div ui="value:20">20</div>
    <div ui="value:21">21</div>
    <div ui="value:22">22</div>
</div>

@fields
_bCustom    - 是否允许用户自己输入内容，如果不允许，不选择的输入失焦会自动清除
_sUrl       - 服务器获取筛选内容的请求地址
_sRequest   - 当前正在请求的值
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
//{/if}//
    function refresh(combox) {
        var text = combox._eTextInput.value.toUpperCase();

        combox.getItems().forEach(function (item) {
            if (item.getContent().toUpperCase().indexOf(text) < 0) {
                dom.addClass(item.getMain(), 'ui-hide');
            } else {
                dom.removeClass(item.getMain(), 'ui-hide');
            }
        });
        combox.getPopup().alterItems();
    }

    function request() {
        this._sRequest = this._eTextInput.value;
        var args = [this._sUrl, this._sRequest];
        core.request(
            util.formatString.apply(null, args),
            function (data) {
                var text = this._eTextInput.value;
                if (this._sRequest !== text) {
                    // 数据请求过程中输入框又产生了变化，重新请求
                    if (text) {
                        util.timer(request, 1000, this);
                    }
                } else {
                    delete this._sRequest;
                    this.add(data);
                }
            }.bind(this)
        );
    }

    /**
     * 组合框控件。
     * 组合框可以在下拉选项中选择，也可以输入内容。
     * options 属性：
     * custom     是否允许用户自己输入内容，如果不允许，不选择的输入失焦会自动清除，默认为允许
     * @control
     */
    ui.Combox = core.inherits(
        ui.Select,
        '*ui-combox',
        function (el, options) {
            _super(el, Object.assign({readOnly: false}, options));
            el = this.$getSection('Text').getBody();
            var placeholder = options.placeholder || this.getInput().getAttribute('placeholder') || '';
            this.getInput().setAttribute('placeholder', placeholder);
            el.innerHTML = ieVersion < 10 ? '<div class="ui-placeholder">' + placeholder + '</div><input>' : '<input placeholder="' + util.encodeHTML(placeholder) + '">';
            this._eTextInput = el.lastChild;
            this.$bindEvent(this._eTextInput);
            this._bCustom = options.custom !== false;
        },
        {
            /**
             * 选项框部件。
             * @unit
             */
            Options: core.inherits(
                ui.Select.prototype.Options,
                {
                    /**
                     * 选项部件。
                     * @unit
                     */
                    Item: core.inherits(
                        ui.Select.prototype.Options.prototype.Item,
                        '*ui-combox-item'
                    )
                }
            ),

            /**
             * @override
             */
            $blur: function (event) {
                _super.$blur(event);
                if (!this._bCustom && !this.getSelected()) {
                    this.$setValue('');
                }
            },

            /**
             * @override
             */
            $click: function (event) {
                var options = this.getPopup();
                if ((this._sUrl && !this._eTextInput.value) || options.isShow()) {
                    this.$Popup.$click.call(this, event);
                } else {
                    _super.$click(event);
                    options.getItems().forEach(function (item) {
                        dom.removeClass(item.getMain(), 'ui-hide');
                    });
                    options.alterItems();
                }
            },

            /**
             * @override
             */
            $dispose: function () {
                _super.$dispose();
                this._eTextInput.getControl = null;
                this._eTextInput = null;
            },

            /**
             * @override
             */
            $input: function (event) {
                _super.$input(event);

                var text = this._eTextInput.value,
                    options = this.getPopup(),
                    selected;

                if (this._sUrl) {
                    if (!this._sRequest) {
                        this.removeAll(true);
                        util.timer(request, 1000, this);
                    }
                    if (text) {
                        this.popup();
                    } else {
                        options.hide();
                    }
                } else {
                    this.popup();
                    options.getItems().forEach(function (item) {
                        if (item.getContent() === text && !item.isDisabled()) {
                            selected = item;
                        }
                    });

                    if (selected) {
                        options.setSelected(selected);
                        core.dispatchEvent(this, 'change', event);
                    } else {
                        selected = options.getSelected();
                        if (selected) {
                            selected.alterStatus('-selected');
                            options.$setSelected(null);
                            this.$setValue('');
                            core.dispatchEvent(this, 'change', event);
                        }
                    }
                    this.$setPlaceholder();
                    refresh(this);
                }
            },

            /**
             * @override
             */
            $keydown: function (event) {
                _super.$keydown(event);
                util.timer(
                    function () {
                        this.$setPlaceholder();
                    },
                    0,
                    this
                );
            },

            /**
             * @override
             */
            $setPlaceholder: function () {
                if (ieVersion < 10) {
                    this.alterStatus(this.getValue() ? '-placeholder' : '+placeholder');
                }
            },

            /**
             * @override
             */
            getText: function () {
                return this._eTextInput.value;
            },

            /**
             * @override
             */
            getValue: function () {
                return this._bCustom ? _super.getValue() || this._eTextInput.value : _super.getValue();
            },

            /**
             * @override
             */
            setText: function (text) {
                this._eTextInput.value = text;
            }
        }
    );
})();
