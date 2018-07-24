/*
@example
<select ui="type:select" name="sex">
    <option value="male" selected="selected">男</option>
    <option value="female">女</option>
</select>
或
<div ui="type:select;name:sex;value:male">
    <div ui="value:male">男</div>
    <div ui="value:female">女</div>
</div>

@fields
_cSelected    - 当前选中的选项
_uText        - 下拉框的文本框
_uOptions     - 下拉选择框
_bRequired    - 是否必须选择
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;

//{/if}//

    /**
     * 下拉框控件。
     * 扩展了原生 SelectElement 的功能，允许指定下拉选项框的最大选项数量，在屏幕显示不下的时候，会自动显示在下拉框的上方。在没有选项时，下拉选项框有一个选项的高度。下拉框控件允许使用键盘与滚轮操作，在下拉选项框打开时，可以通过回车键或鼠标点击选择，上下键选择选项的当前条目，在关闭下拉选项框后，只要拥有焦点，就可以通过滚轮上下选择选项。
     * options 属性：
     * optionSize     下拉框最大允许显示的选项数量，默认为5
     * required       是否必须选择
     * @control
     */
    ui.$select = core.inherits(
        ui.InputControl,
        function (el, options) {
            util.setDefault(options, 'readOnly', true);

            var oldEl = el;
            el = dom.insertBefore(
                dom.create(
                    {
                        className: el.className,
                        style: {
                            cssText: el.style.cssText
                        }
                    }
                ),
                el
            );

            if (oldEl.tagName === 'SELECT') {
                options.name = oldEl.name;
                options.value = oldEl.value;

                var optionsEl = dom.create(
                    {
                        innerHTML: Array.prototype.slice.call(oldEl.options).map(
                            function (item) {
                                var optionText = dom.getAttribute(item, core.getAttributeName());
                                return '<div ' + core.getAttributeName() + '="value:' + util.encodeHTML(item.value) + (optionText ? ';' + util.encodeHTML(optionText) : '') + '">' + util.encodeHTML(item.text) + '</div>';
                            }
                        ).join('')
                    }
                );
            } else {
                optionsEl = oldEl;
                oldEl.style.cssText = '';
            }
            optionsEl.className = options.classes.join('-options ') + 'ui-popup ui-hide';

            dom.remove(oldEl);

            el.innerHTML = '<div class="' + options.classes.join('-text ') + '"></div>';

            ui.InputControl.call(this, el, options);

            this._uText = core.$fastCreate(ui.Item, el.firstChild, this, {capturable: false});
            this._uOptions = core.$fastCreate(this.Options, optionsEl, this, {focusable: false});

            this._bRequired = !!options.required;
            this._cSelected = null;

            this.setPopup(this._uOptions);
            this.$setBody(this._uOptions.getBody());
        },
        {
            /**
             * 选项框部件。
             * @unit
             */
            Options: core.inherits(
                ui.Control,
                {
                    /**
                     * @override
                     */
                    $show: function () {
                        ui.Control.prototype.$show.call(this);
                        var select = this.getParent();
                        if (select._bAlterItems) {
                            this.$alterItems();
                            select._bAlterItems = false;
                        }
                    }
                }
            ),

            /**
             * 选项部件。
             * @unit
             */
            Item: core.inherits(
                ui.Item,
                function (el, options) {
                    ui.Item.call(this, el, options);
                    this._sValue = options.value === undefined ? dom.getText(el) : String(options.value);
                },
                {
                    /**
                     * @override
                     */
                    $click: function (event) {
                        ui.Item.prototype.$click.call(this, event);
                        var parent = this.getParent();
                        parent._uOptions.hide();
                        if (this._cSelected !== this) {
                            parent.setSelected(this);
                            core.dispatchEvent(parent, 'change', event);
                        }
                    },

                    /**
                     * 获取选项的值。
                     * getValue 方法返回选项控件的值，即选项选中时整个下拉框控件的值。
                     * @public
                     *
                     * @return {string} 选项的值
                     */
                    getValue: function () {
                        return this._sValue;
                    },

                    /**
                     * 设置选项的值。
                     * setValue 方法设置选项控件的值，即选项选中时整个下拉框控件的值。
                     * @public
                     *
                     * @param {string} value 选项的值
                     */
                    setValue: function (value) {
                        var parent = this.getParent();
                        this._sValue = value;
                        if (parent && this === parent._cSelected) {
                            // 当前被选中项的值发生变更需要同步更新控件的值
                            ui.InputControl.prototype.setValue.call(parent, value);
                        }
                    }
                }
            ),

            /**
             * 选项控件发生变化的处理。
             * @protected
             */
            $alterItems: function () {
                if (dom.parent(this._uOptions.getOuter()) && this._uOptions.isShow()) {
                    this._uOptions.$alterItems();
                    this._bAlterItems = false;
                } else {
                    this._bAlterItems = true;
                }
            },

            /**
             * @override
             */
            $blur: function (event) {
                this._uOptions.hide();
                ui.InputControl.prototype.$blur.call(this, event);
            },

            /**
             * @override
             */
            $cache: function (style) {
                ui.InputControl.prototype.$cache.call(this, style);
                this._uText.cache(true);
            },

            /**
             * 选项改变事件。
             * @event
             */
            $change: util.blank,

            /**
             * @override
             */
            $initStructure: function (width, height) {
                ui.InputControl.prototype.$initStructure.call(this, width, height);
                // 设置文本区域
                if (this._uText.isCached()) {
                    this._uText.$setSize(width, height);
                }
            },

            /**
             * @override
             */
            $ready: function (options) {
                ui.InputControl.prototype.$ready.call(this, options);
                this.setValue(this.getValue());
                this._bAlterItems = true;
            },

            /**
             * @override
             */
            $reset: function () {
                var el = this.getInput();
                el.value = el.defaultValue;
                ui.InputControl.prototype.$reset.call(this);
            },

            /**
             * 下拉框移除子选项时，如果选项被选中，需要先取消选中。
             * @override
             */
            $remove: function (event) {
                if (event.child === this._cSelected) {
                    this.setSelected();
                }
                ui.InputControl.prototype.$remove.call(this, event);
            },

            /**
             * @override
             */
            $validate: function () {
                ui.InputControl.prototype.$validate.call(this);

                if (this.getValue() === '' &&  this._bRequired) {
                    core.dispatchEvent(this, 'error');
                    return false;
                }
            },

            /**
             * 获取被选中的选项控件。
             * @public
             *
             * @return {ecui.ui.Item} 选项控件
             */
            getSelected: function () {
                return this._cSelected || null;
            },

            /**
             * 改变下拉框当前选中的项。
             * @private
             *
             * @param {ecui.ui.Select.Item} item 新选中的项
             */
            setSelected: function (item) {
                item = item || null;
                if (item !== this._cSelected) {
                    if (this._cSelected) {
                        this._cSelected.alterClass('-selected');
                    }
                    if (item) {
                        item.alterClass('+selected');
                        this._uText.setContent(item.getBody().innerHTML);
                        ui.InputControl.prototype.setValue.call(this, item._sValue);
                        if (this._uOptions.isShow()) {
                            core.setFocused(item);
                        }
                        this.alterClass(item._sValue === '' ? '+placeholder' : '-placeholder');
                    } else {
                        this._uText.setContent('');
                        ui.InputControl.prototype.setValue.call(this, '');
                        core.setFocused(this);
                    }
                    this._cSelected = item;
                }
            },

            /**
             * 根据序号选中选项。
             * @public
             *
             * @param {number} index 选项的序号
             */
            setSelectedIndex: function (index) {
                this.setSelected(this.getItems()[index]);
            },

            /**
             * 设置控件的值。
             * setValue 方法设置控件的值，设置的值必须与一个子选项的值相等，否则将被设置为空，使用 getValue 方法获取设置的值。
             * @public
             *
             * @param {string} value 需要选中的值
             */
            setValue: function (value) {
                if (this.getItems().every(function (item) {
                        if (item._sValue === value) {
                            this.setSelected(item);
                            return false;
                        }
                        return true;
                    }, this)) {
                    // 找不到满足条件的项，将选中的值清除
                    this.setSelected();
                }
            }
        },
        ui.Items
    );
}());
