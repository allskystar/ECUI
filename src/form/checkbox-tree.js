/*
@example
<ul ui="type:checkbox-tree;name:name">
    <li>根节点</li>

    <li>子节点一</li>
    <li>子节点二</li>
    <ul class="ui-hide" ui="subject:true">
        <li>子节点三</li>

        <li>孙节点一</li>
        <li>孙节点二</li>
        <li>孙节点三</li>
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
     * subject 如果为 true 表示与所有子节点的复选框进行联动，其它等价 false 的值表示不联动
     * @control
     */
    ui.CheckboxTree = core.inherits(
        ui.TreeView,
        'ui-checkbox-tree',
        {
            /**
             * 复选框部件。
             * @unit
             */
            Checkbox: core.inherits(
                ui.Checkbox,
                {
                    /**
                     * @override
                     */
                    $click: function (event) {
                        _super.$click(event);
                        event.stopPropagation();
                        core.dispatchEvent(this.getParent().getRoot(), 'change', { item: this });
                    }
                }
            ),

            /**
             * @override
             */
            $create: function (options) {
                _super.$create(options);
                var el = this.getMain();
                this._uCheckbox = core.$fastCreate(
                    this.Checkbox,
                    el.insertBefore(dom.create({className: ui.Checkbox.CLASS}), el.firstChild),
                    this,
                    Object.assign({}, options, { id: undefined, subject: undefined, ext: undefined, primary: undefined })
                );

                if (options.subject) {
                    this.getChildren().forEach(
                        function (item) {
                            item._uCheckbox.setSubject(this._uCheckbox);
                        },
                        this
                    );
                }
            },

            /**
             * @override
             */
            getContent: function () {
                return _super.getContent().substring(this._uCheckbox.getMain().outerHTML.length);
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
            isSelected: function () {
                return this._uCheckbox.isChecked();
            },

            /**
             * 设置当前树控件复选框选中状态。
             * @public
             *
             * @param {boolean} 是否选中当前树控件复选框
             */
            setSelected: function (status) {
                this._uCheckbox.setChecked(status);
            },

            /**
             * @override
             */
            setContent: function (html) {
                var el = this.getMain();
                this._uCheckbox.setParent();
                _super.setContent(html);
                this._uCheckbox.$setParent(this);
                el.insertBefore(this._uCheckbox.getMain(), el.firstChild);
            }
        },
        ui.iSelector
    );
//{if 0}//
})();
//{/if}//
