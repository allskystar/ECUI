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
    /**
     * 组合框控件。
     * 组合框可以在下拉选项中选择，也可以输入内容。
     * @control
     */
    ui.Combox = core.inherits(
        ui.Select,
        '*ui-combox',
        function (el, options) {
            _super(el, Object.assign({readOnly: false}, options));

            el = this.$Text.getBody();

            var placeholder = options.placeholder || dom.getAttribute(this.getInput(), 'placeholder') || '';
            this.getInput().setAttribute('placeholder', placeholder);
            // ie10的placeholder的内容会被当成value
            el.innerHTML = ieVersion < 10 ? '<div class="ui-placeholder">' + placeholder + '</div><input>' : '<input placeholder="' + util.encodeHTML(placeholder) + '">';
            this.textInput = el.lastChild;
            this.$bindEvent(this.textInput);
        },
        {
            private: {
                textInput: undefined,

                _refresh: function () {
                    var text = this.textInput.value.toUpperCase();

                    this.getItems().forEach(function (item) {
                        if (item.getContent().toUpperCase().indexOf(text) < 0) {
                            dom.addClass(item.getMain(), 'ui-hide');
                        } else {
                            dom.removeClass(item.getMain(), 'ui-hide');
                        }
                    });
                    this.alterItems();
                }
            },

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
                if (!this.$Options.isShow()) {
                    _super.$click(event);
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
                _super.$disable();
                this.textInput.disabled = true;
            },

            /**
             * @override
             */
            $dispose: function () {
                this.textInput.getControl = null;
                this.textInput  = null;
                _super.$dispose();
            },

            /**
             * @override
             */
            $enable: function () {
                _super.$enable();
                this.textInput.disabled = false;
            },

            /**
             * @override
             */
            $input: function (event) {
                _super.$input(event);
                this.popup();

                var text = this.textInput.value,
                    selected;

                this.getItems().forEach(function (item) {
                    if (item.getContent() === text) {
                        selected = item;
                    }
                });

                if (selected) {
                    this.setSelected(selected);
                } else {
                    selected = this.getSelected();
                    if (selected) {
                        selected.alterStatus('-selected');
                        this.$setSelected(null);
                    }
                }
                this.$setPlaceholder();
                this._refresh();
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
                    this.alterStatus(this.getInput().value || this.getText() ? '-placeholder' : '+placeholder');
                }
            },

            /**
             * @override
             */
            getText: function () {
                return this.textInput.value;
            },

            /**
             * @override
             */
            setText: function (text) {
                this.textInput.value = util.decodeHTML(text);
            }
        }
    );
}());
