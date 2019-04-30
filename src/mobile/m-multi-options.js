/*
@example
<div ui="type:m-multi-options">
...
</div>

@fields
_sFormat     - 格式化字符串
_aOptions    - 选项框数组
_eText       - 文本框
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 多选项输入框控件。
     * @control
     * options 属性：
     * format  选中时的字符串格式
     */
    ui.MMultiOptions = core.inherits(
        ui.InputControl,
        function (el, options) {
            util.setDefault(options, 'enter', 'bottom');
            util.setDefault(options, 'mask', '0.5');
            util.setDefault(options, 'readOnly', true);
            util.setDefault(options, 'inputType', 'hidden');

            var popupEl = dom.create({
                    className: options.classes.join('-popup ') + 'ui-popup ui-hide'
                }),
                children = dom.children(el).filter(function (item) {
                    return item.tagName !== 'INPUT';
                });

            el.appendChild(dom.create({
                className: options.classes.join('-text ')
            }));
            this._eText = el.lastChild;

            ui.InputControl.call(this, el, options);

            this.setPopup(core.$fastCreate(this.Popup, popupEl, this));

            this._aOptions = [];
            children.forEach(function (item) {
                dom.addClass(item, this.Options.CLASS);
                popupEl.getControl().getBody().appendChild(item);
                this._aOptions.push(core.$fastCreate(this.Options, item, this, core.getOptions(item)));
            }, this);

            this._sFormat = options.format;
        },
        {
            /**
             * 弹出层部件。
             * @unit
             */
            Popup: core.inherits(
                ui.Control,
                {
                    /**
                     * @override
                     */
                    cache: function (force) {
                        this.getParent()._aOptions.forEach(function (item) {
                            item.cache(force);
                        });
                        ui.Control.prototype.cache.call(this, force);
                    }
                },
                ui.MConfirm
            ),

            /**
             * 选项框部件。
             * @unit
             */
            Options: core.inherits(
                ui.Control,
                function (el, options) {
                    ui.Control.call(this, el, options);

                    var values = options.values;

                    if ('string' === typeof values) {
                        values = values.split(/[\-,]/);
                    }
                    values[0] = +values[0];
                    values[1] = +values[1];
                    if (values[2]) {
                        values[2] = +values[2];
                    } else {
                        values[2] = 1;
                    }
                    for (var i = values[0], ret = [];; i += values[2]) {
                        ret.push('<div ui="value:' + i + '" class="' + options.classes.join('-item ') + 'ui-item">' + (options.format ? util.stringFormat(options.format, i) : i) + '</div>');
                        if (i === values[1]) {
                            break;
                        }
                    }
                    this.getBody().innerHTML = ret.join('');

                    this._aItems = [];
                    dom.children(el).forEach(function (item) {
                        this._aItems.push(core.$fastCreate(this.Item, item, this, core.getOptions(item)));
                    }, this);

                    this.setOptionSize(3);
                },
                {
                    /**
                     * 选项部件。
                     * @unit
                     */
                    Item: core.inherits(
                        ui.Control,
                        function (el, options) {
                            ui.Control.call(this, el, options);
                            this._sValue = options.value || this.getContent();
                        }
                    )
                },
                ui.MOptions,
                {
                    /**
                     * @override
                     */
                    $dragend: function (event) {
                        ui.MScroll.Methods.$dragend.call(this, event);
                        core.dispatchEvent(this.getParent(), 'change');
                    },

                    /**
                     * 获取选中控件的值。
                     * @public
                     *
                     * @return {string} 选中控件的值
                     */
                    getValue: function () {
                        return this._cSelect ? this._cSelect._sValue : '';
                    },

                    /**
                     * 设置控件的值，如果不存在，选中空数据。
                     * @public
                     *
                     * @param {string} value 控件的值
                     */
                    setValue: function (value) {
                        value = String(value);
                        for (var i = 0, item; item = this._aItems[i]; i++) {
                            if (item._sValue === value) {
                                this.setPosition(0, (3 - i) * this.$$itemHeight);
                                this.setSelected(item);
                                return;
                            }
                        }
                        this.setSelected();
                    }
                }
            )
        },
        {
            /**
             * @override
             */
            $blur: function (event) {
                this.getPopup().hide();
                ui.InputControl.prototype.$blur.call(this, event);
            },

            /**
             * 确认事件的默认处理。
             * @event
             */
            $confirm: function () {
                this.setValue(
                    util.stringFormat.apply(
                        null,
                        [this._sFormat].concat(this._aOptions.map(function (options) {
                            return options.getValue();
                        }))
                    )
                );
            },

            /**
             * @override
             */
            $dispose: function () {
                this._eText = null;
                ui.InputControl.prototype.$dispose.call(this);
            },

            /**
             * 获取选项控件。
             * @public
             *
             * @param {number} index 选项编号
             * @return {ecui.ui.MMultiOptions.Options} 选项控件
             */
            getOptions: function (index) {
                return this._aOptions[index];
            },

            /**
             * @override
             */
            getValue: function () {
                return util.decodeHTML(this._eText.innerHTML);
            },

            /**
             * @override
             */
            setValue: function (value) {
                this._eText.innerHTML = util.encodeHTML(value);
            }
        },
        ui.MPopup
    );
//{if 0}//
}());
//{/if}//
