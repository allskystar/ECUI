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
        function (el, options) {
            _super(el, options);

            el = this.getMain();
            this.$Checkbox = core.$fastCreate(
                this.Checkbox,
                el.insertBefore(
                    dom.create({className: ui.Checkbox.CLASS}),
                    el.firstChild
                ),
                this,
                Object.assign({}, options, {id: undefined})
            );

            if (options.subject) {
                this.getChildren().forEach(
                    function (item) {
                        item.$Checkbox.setSubject(this.$Checkbox);
                    },
                    this
                );
            }
        },
        {
            protected: {
                $Checkbox: undefined
            },

            final: ['$Checkbox'],

            /**
             * 复选框部件。
             * @unit
             */
            Checkbox: core.inherits(
                ui.Checkbox,
                {
                    $click: function (event) {
                        _super.$click(event);
                        event.stopPropagation();
                    }
                }
            ),

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
                return this.$Checkbox.getValue();
            },

            /**
             * 判断树控件是否选中。
             * @public
             *
             * @return {boolean} 是否选中
             */
            isChecked: function () {
                return this.$Checkbox.isChecked();
            },

            /**
             * 设置当前树控件复选框选中状态。
             * @public
             *
             * @param {boolean} 是否选中当前树控件复选框
             */
            setChecked: function (status) {
                this.$Checkbox.setChecked(status);
            }
        }
    );
//{if 0}//
}());
//{/if}//