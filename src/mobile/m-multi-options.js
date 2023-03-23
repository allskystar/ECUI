/*
@example
<div ui="type:m-multi-options">
...
</div>

@fields
_sFormat     - 格式化字符串
_aOptions    - 选项框数组
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
        ui.abstractInput,
        function (el, options) {
            var popupEl = dom.create({
                    className: this.getUnitClass(ui.MMultiOptions, 'popup') + ' ui-mobile-popup ui-hide'
                }),
                children = dom.children(el).filter(function (item) {
                    return item.tagName !== 'INPUT';
                });

            _super(el, options);

            this.setPopup(core.$fastCreate(this.Popup, popupEl, this, options));

            this._aOptions = [];
            children.forEach(
                function (item) {
                    dom.addClass(item, this.Options.CLASS);
                    popupEl.getControl().getBody().appendChild(item);
                    this._aOptions.push(core.$fastCreate(this.Options, item, this, core.getOptions(item)));
                },
                this
            );
            var map = this._aMap = [];
            this._oRegExp = new RegExp(util.encodeRegExp(this._sFormat = options.format || '').replace(/\\\{([0-9]+)\\\}/g, function (match, index) {
                map.push(+index);
                return '(.*)';
            }));

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
                    $show: function () {
                        _super.$show();
                        this.getParent()._aOptions.forEach(function (item) {
                            core.dispatchEvent(item, 'show');
                        });
                    },

                    /**
                     * @override
                     */
                    cache: function (force) {
                        _super.cache(force);
                        this.getParent()._aOptions.forEach(function (item) {
                            item.cache(force);
                        });
                    }
                },
                ui.iMConfirm
            ),

            /**
             * 选项框部件。
             * @unit
             * options 属性：
             * format  文本用于显示的样式
             * values  值，格式为aaa-bbb:step|mask，例如1-12:1|00，这样1的值会被处理成01
             */
            Options: core.inherits(
                ui.Options,
                function (el, options) {
                    _super(el, options);

                    var values = options.values;
                    this._sMask = '';

                    if (typeof values === 'string') {
                        if (values.indexOf(',') < 0) {
                            var ret = /^([0-9]+)-([0-9]+)(:([0-9]+))?(\|(.+))?$/.exec(values);
                            this._sMask = ret[6] || '';
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
                            return '<div ui="value:' + (this._sMask + item).slice(-this._sMask.length) + '" class="' + this.getUnitClass(ui.MMultiOptions.prototype.Options, 'item') + ' ui-item">' + (options.format ? util.formatString(options.format, item) : item) + '</div>';
                        },
                        this
                    ).join('');
                    this.setOptionSize(3);
                },
                {
                    /**
                     * 选项部件。
                     * @unit
                     */
                    Item: core.inherits(
                        ui.Options.prototype.Item,
                        function (el, options) {
                            _super(el, options);
                            this._sValue = options.value || this.getContent();
                        }
                    ),

                    /**
                     * 选项改变事件的默认处理。
                     * @event
                     */
                    $propertychange: function (event) {
                        if (event.name === 'selecting') {
                            core.dispatchEvent(this.getParent(), 'change', event);
                        }
                    },

                    /**
                     * 获取选中控件的值。
                     * @public
                     *
                     * @return {string} 选中控件的值
                     */
                    getValue: function () {
                        var item = this.getSelecting();
                        if (!item || !item.isShow()) {
                            item = this.getSelected();
                        }
                        return item ? item._sValue : '';
                    },

                    /**
                     * 设置控件的值，如果不存在，选中空数据。
                     * @public
                     *
                     * @param {string} value 控件的值
                     */
                    setValue: function (value) {
                        value = (this._sMask + value).slice(-this._sMask.length);
                        for (var i = 0, item; (item = this.getItem(i)); i++) {
                            if (item._sValue === value) {
                                this.setSelected(item);
                                return;
                            }
                        }
                        this.setSelected();
                    }
                },
                ui.iMOptions
            ),

            /**
             * @override
             */
            $blur: function (event) {
                this.getPopup().hide();
                _super.$blur(event);
            },

            /**
             * @override
             */
            $click: function (event) {
                _super.$click(event);
                if (this.getMain().contains(event.target)) {
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
        ui.iMPopup
    );
//{if 0}//
})();
//{/if}//
