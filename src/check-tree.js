/*
@example
<ul ui="type:check-tree;fold:true;id:parent;name:part">
    <div>
        <!-- 当前节点的文本 -->
    </div>
    <!-- 下面放子控件，如果需要 fold 某个子控件，设置子控件样式 style="display:none" 即可 -->
    <li ui="subject:other">
        <!-- 复选框与 id 为 other 的复选框联动 -->
        <!-- 子控件文本 -->
    </li>
    <li ui="subject:true">
        <!-- 复选框与父节点的复选框联动 -->
        <!-- 子控件文本 -->
    </li>
    <ul>
        <!-- 非叶子节点，格式与根节点相同 -->
        ...
    </ul>
</ul>

@fields
_uCheckbox - 复选框控件
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    /**
     * 复选框树控件。
     * 树的每一个节点都包含一个复选框标识选中状态，除非特别的使用 subject 参数指定，否则子节点与父节点的复选框缺省设置联动。
     * options 属性：
     * name    复选框对应表单项的名称
     * value   复选框对应表单项的值
     * subject 父复选框的标识符，如果为 true 表示使用上级树节点的复选框作为父复选框，其它等价 false 的值表示不联动
     * @control
     */
    ui.CheckTree = core.inherits(
        ui.TreeView,
        'ui-checktree',
        function (el, options) {
            ui.TreeView.call(this, el, options);

            el = this.getMain();
            this._uCheckbox =
                core.$fastCreate(
                    ui.Checkbox,
                    el.insertBefore(
                        dom.create({className: options.classes.join('-checkbox ') + 'ui-input ui-checkbox'}),
                        el.firstChild
                    ),
                    this,
                    options
                );

            this.getChildren().forEach(function (item) {
                if (options.subject) {
                    if (options.subject === true) {
                        item._uCheckbox.setSubject(this._uCheckbox);
                    } else {
                        core.delegate(options.subject, item._uCheckbox, item._uCheckbox.setSubject);
                    }
                }
            }, this);
        },
        {
            /**
             * @override
             */
            $ready: function (event) {
                ui.TreeView.prototype.$ready.call(this, event);
                core.triggerEvent(this._uCheckbox, 'ready');
            },

            /**
             * 获取包括当前树控件在内的全部选中的子树控件。
             * @public
             *
             * @return {Array} 全部选中的树控件列表
             */
            getChecked: function () {
                var result = this.isChecked() ? [this] : [];
                this.getChildren().forEach(function (item) {
                    result = result.concat(item.getChecked());
                });
                return result;
            },

            /**
             * 获取当前树控件复选框的表单项的值。
             * @public
             *
             * @return {string} 表单项的值
             */
            getValue: function () {
                return this._uCheckbox.getValue();
            },

            /**
             * 判断树控件是否选中。
             * @public
             *
             * @return {boolean} 是否选中
             */
            isChecked: function () {
                return this._uCheckbox.isChecked();
            },

            /**
             * 设置当前树控件复选框选中状态。
             * @public
             *
             * @param {boolean} 是否选中当前树控件复选框
             */
            setChecked: function (status) {
                this._uCheckbox.setChecked(status);
            }
        }
    );
//{if 0}//
}());
//{/if}//