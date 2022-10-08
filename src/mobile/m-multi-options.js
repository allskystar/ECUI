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
            var popupEl = dom.create({
                    className: this.getUnitClass(ui.MMultiOptions, 'popup') + ' ui-popup ui-hide'
                }),
                children = dom.children(el).filter(function (item) {
                    return item.tagName !== 'INPUT';
                });

            el.appendChild(dom.create({
                className: this.getUnitClass(ui.MMultiOptions, 'text')
            }));
            this._eText = el.lastChild;

            ui.InputControl.call(this, el, Object.assign({inputType: 'hidden'}, options));

            this.setPopup(core.$fastCreate(this.Popup, popupEl, this));

            this._aOptions = [];
            children.forEach(
                function (item) {
                    dom.addClass(item, this.Options.CLASS);
                    popupEl.getControl().getBody().appendChild(item);
                    this._aOptions.push(core.$fastCreate(this.Options, item, this, core.getOptions(item)));
                },
                this
            );

            var source = this._sFormat = options.format || '',
                des = '';
            this._aMap = [];

            for (;;) {
                if (/\{([0-9]+)\}/.test(source)) {
                    source = RegExp.rightContext;
                    this._aMap.push(+RegExp.$1);
                    var text = RegExp.leftContext;
                    des += util.encodeRegExp(text) + '(.*)';
                } else {
                    des += util.encodeRegExp(source);
                    break;
                }
            }

            this._oRegExp = new RegExp(des);

            options.enter = 'bottom';
            options.mask = 0.5;
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
             * options 属性：
             * format  文本用于显示的样式
             */
            Options: core.inherits(
                ui.Control,
                [
                    function (el, options) {
                        if (options.value !== undefined) {
                            this.setValue(options.value);
                        }
                    },
                    function (el, options) {
                        ui.Control.call(this, el, options);

                        var values = options.values;
                        this._sPrefix = '';

                        if (typeof values === 'string') {
                            if (values.indexOf(',') < 0) {
                                var ret = /^([0-9]+)-([0-9]+)(:([0-9]+))?(\|(.+))?$/.exec(values);
                                this._sPrefix = ret[6] || '';
                                ret = [+ret[1], +ret[2], +ret[4] || 1];
                                values = [];
                                for (var i = ret[0]; i <= ret[1]; i += ret[2]) {
                                    values.push(i);
                                }
                            } else {
                                values = values.split(',');
                            }
                        }

                        this.getBody().innerHTML = values.map(
                            function (item) {
                                return '<div ui="value:' + (this._sPrefix + item).slice(-this._sPrefix.length) + '" class="' + this.getUnitClass(ui.MMultiOptions.prototype.Options, 'item') + ' ui-item">' + (options.format ? util.formatString(options.format, item) : item) + '</div>';
                            },
                            this
                        ).join('');

                        this.setOptionSize(3);

                    }
                ],
                {
                    /**
                     * 选项部件。
                     * @unit
                     */
                    Item: core.inherits(
                        ui.Item,
                        function (el, options) {
                            ui.Item.call(this, el, options);
                            this._sValue = options.value || this.getContent();
                        }
                    ),

                    /**
                     * @override
                     */
                    $alterItems: util.blank,

                    /**
                     * @override
                     */
                    $initStructure: function (width, height) {
                        ui.Control.prototype.$initStructure.call(this, width, height);
                        this.setPosition(0, (3 - this.getItems().indexOf(this.getSelected())) * this.$$itemHeight);
                    },

                    /**
                     * 获取选中控件的值。
                     * @public
                     *
                     * @return {string} 选中控件的值
                     */
                    getValue: function () {
                        var selected = this.getSelected();
                        return selected ? selected._sValue : '';
                    },

                    /**
                     * 设置控件的值，如果不存在，选中空数据。
                     * @public
                     *
                     * @param {string} value 控件的值
                     */
                    setValue: function (value) {
                        value = (this._sPrefix + value).slice(-this._sPrefix.length);
                        for (var i = 0, item; (item = this.getItem(i)); i++) {
                            if (item._sValue === value) {
                                if (this.isCached()) {
                                    this.setPosition(0, (3 - i) * this.$$itemHeight);
                                }
                                this.setSelected(item);
                                return;
                            }
                        }
                        this.setSelected();
                    }
                },
                ui.MOptions,
                ui.Items,
                {
                    /**
                     * @override
                     */
                    $dragend: function (event) {
                        ui.MScroll.$dragend.call(this, event);
                        core.dispatchEvent(this.getParent(), 'change');
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
             * @override
             */
            $click: function (event) {
                ui.InputControl.prototype.$click.call(this, event);
                if (dom.contain(this.getMain(), event.target)) {
                    var ret = this._oRegExp.exec(this.getValue());
                    if (ret) {
                        ret.slice(1).forEach(
                            function (value, index) {
                                this._aOptions[this._aMap[index]].setValue(value);
                            },
                            this
                        );
                    }
                }
            },

            /**
             * 确认事件的默认处理。
             * @event
             */
            $confirm: function () {
                var oldValue = this.getValue(),
                    value = this.getOptionsValue();

                if (oldValue !== value) {
                    this.setValue(value);
                    core.dispatchEvent(this, 'change');
                }
            },

            /**
             * @override
             */
            $dispose: function () {
                this._eText = null;
                ui.InputControl.prototype.$dispose.call(this);
            },

            /**
             * @override
             */
            init: function () {
                ui.InputControl.prototype.init.call(this);
                var value = this.getOptionsValue();
                this.setValue(value);
            },

            /**
             * @override
             */
            $setValue: function (value) {
                ui.InputControl.prototype.$setValue.call(this, value);
                if (value) {
                    this.alterStatus('-placeholder');
                } else {
                    this.alterStatus('+placeholder');
                    value = dom.getAttribute(this.getInput(), 'placeholder') || '';
                }
                this._eText.innerHTML = util.encodeHTML(value);
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
             * 获取选项控件 value。
             * @public
             *
             * @return {string} format格式的value
             */
            getOptionsValue: function () {
                return util.formatString.apply(
                    null,
                    [this._sFormat].concat(this._aOptions.map(function (options) {
                        return options.getValue();
                    }))
                );
            }
        },
        ui.MPopup
    );
//{if 0}//
})();
//{/if}//
