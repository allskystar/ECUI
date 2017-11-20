/*
CheckTree - 定义包含复选框的树形结构的基本操作。
包含复选框的树控件，继承自树控件。每一个选项包含一个复选框进行选择，除非特别的指定，否则子节点的复选框与父节点的复选框
自动联动。

树控件直接HTML初始化的例子:
<ul ui="type:check-tree;fold:true;id:parent;name:part">
    <!-- 当前节点的文本，如果没有整个内容就是节点的文本 -->
    <div>节点的文本</div>
    <!-- 这里放子控件，如果需要fold某个子控件，将子控件的style="display:none"即可 -->
    <li ui="subject:other">子控件文本</li>
    <li ui="subject:true">直接关联父节点树的checkbox</li>
    ...
</ul>

属性
_uCheckbox - 复选框控件
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    /**
     * 初始化复选树控件。
     * options 对象支持的属性如下：
     * name 复选框的表单项的默认名称
     * value 复选框的表单项的值
     * subject 父复选框的标识，如果为true表示自动使用上级树节点作为父复选框，其它等价false的值表示不联动
     * @public
     *
     * @param {Object} options 初始化选项
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
                        dom.create({className: options.classes.join('-checkbox ') + 'ui-checkbox'}),
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
            $cache: function (style, cacheSize) {
                ui.TreeView.prototype.$cache.call(this, style, cacheSize);
                this._uCheckbox.cache(true, true);
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
             * @override
             */
            init: function (options) {
                ui.TreeView.prototype.init.call(this, options);
                this._uCheckbox.init(options);
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