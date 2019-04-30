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

                        if ('string' === typeof values) {
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

                        this.getBody().innerHTML = values.map(function (item) {
                            return '<div ui="value:' + (this._sPrefix + item).slice(-this._sPrefix.length) + '" class="' + options.classes.join('-item ') + 'ui-item">' + (options.format ? util.stringFormat(options.format, item) : item) + '</div>';
                        }.bind(this)).join('');

                        this._aItems = [];
                        dom.children(el).forEach(function (item) {
                            this._aItems.push(core.$fastCreate(this.Item, item, this, core.getOptions(item)));
                        }, this);

                        this.setOptionSize(3);
                    }
                ],
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
                    ),

                    /**
                     * @override
                     */
                    $initStructure: function (width, height) {
                        ui.Control.prototype.$initStructure.call(this, width, height);
                        this.setPosition(0, (3 - this._aItems.indexOf(this.getSelected())) * this.$$itemHeight);
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
                        for (var i = 0, item; item = this._aItems[i]; i++) {
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
                {
                    /**
                     * @override
                     */
                    $dragend: function (event) {
                        ui.MScroll.Methods.$dragend.call(this, event);
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
                        ret.slice(1).forEach(function (value, index) {
                            this._aOptions[this._aMap[index]].setValue(value);
                        }.bind(this));
                    }
                }
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
