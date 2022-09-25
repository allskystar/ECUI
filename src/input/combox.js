//{if $css}//
__ControlStyle__('\
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
        position: absolute !important;\
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
        combox.alterItems();
    }

    /**
     * 组合框控件。
     * 组合框可以在下拉选项中选择，也可以输入内容。
     * @control
     */
    ui.Combox = core.inherits(
        ui.Select,
        '*ui-combox',
        function (el, options) {
            ui.Select.call(this, el, Object.assign({readOnly: false}, options));

            el = this.$getSection('Text').getBody();

            var placeholder = options.placeholder || dom.getAttribute(this.getInput(), 'placeholder') || '';
            this.getInput().setAttribute('placeholder', placeholder);
            el.innerHTML = ieVersion < 10 ? '<div class="ui-placeholder">' + placeholder + '</div><input>' : '<input placeholder="' + util.encodeHTML(placeholder) + '">';
            this._eTextInput = el.lastChild;
            this.$bindEvent(this._eTextInput);
        },
        {
            /**
             * 选项部件。
             * @unit
             */
            Item: core.inherits(
                ui.Select.prototype.Item,
                '*ui-combox-item'
            ),

            /**
             * @override
             */
            $click: function (event) {
                if (this.$getSection('Options').isShow()) {
                    this.$Popup.$click.call(this, event);
                } else {
                    ui.Select.prototype.$click.call(this, event);
                    this.getItems().forEach(function (item) {
                        dom.removeClass(item.getMain(), 'ui-hide');
                    });
                    this.alterItems();
                }
            },

            /**
             * @override
             */
            $disable: function () {
                ui.Select.prototype.$disable.call(this);
                this._eTextInput.disabled = true;
            },

            /**
             * @override
             */
            $dispose: function () {
                this._eTextInput.getControl = null;
                this._eTextInput  = null;
                ui.Select.prototype.$dispose.call(this);
            },

            /**
             * @override
             */
            $enable: function () {
                ui.Select.prototype.$enable.call(this);
                this._eTextInput.disabled = false;
            },

            /**
             * @override
             */
            $input: function (event) {
                ui.Select.prototype.$input.call(this, event);
                this.popup();

                var text = this._eTextInput.value,
                    selected;

                this.getItems().forEach(function (item) {
                    if (item.getContent() === text) {
                        selected = item;
                    }
                });

                if (selected) {
                    this.setSelected(selected);
                    core.dispatchEvent(this, 'change', event);
                } else {
                    selected = this.getSelected();
                    if (selected) {
                        selected.alterStatus('-selected');
                        this.$setSelected(null);
                        this.$setValue('');
                        core.dispatchEvent(this, 'change', event);
                    }
                }
                this.$setPlaceholder();
                refresh(this);
                this.updatePosition();
            },

            /**
             * @override
             */
            $keydown: function (event) {
                ui.Select.prototype.$keydown.call(this, event);
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
                    this.alterStatus(this.getInput().value || this.getText() ? '-placeholder' : '+placeholder');
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
            setText: function (text) {
                this._eTextInput.value = util.decodeHTML(text);
            }
        }
    );
})();
