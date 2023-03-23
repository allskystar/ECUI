/*
@example
<ul ui="type:checkbox-tree;name:name">
    <li>根节点</li>

    <li ui="value:1">子节点一</li>
    <li ui="value:2">子节点二</li>
    <ul>
        <li>子节点三</li>

        <li ui="value:31">孙节点一</li>
        <li ui="value:32">孙节点二</li>
        <li ui="value:33">孙节点三</li>
    </ul>
</ul>

@fields
_bSort  - 选项框保持树结构初始的顺序
_bMerge - 当子选项全部选中时，是否需要合并为只选择父选项
_cItem  - 树节点对应的选项
_cItems - 树对应的选项组
*/
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui;
//{/if}//
    /**
     * 穿梭树控件。
     * options 属性：
     * items   选项组控件ID
     * sort    选项框保持树结构初始的顺序，默认不保持
     * merge   当子选项全部选中时，是否需要合并为只选择父选项，默认不合并
     * @control
     */
    ui.TransferTree = core.inherits(
        ui.CheckboxTree,
        'ui-transfer-tree',
        function (el, options) {
            this._bSort = options.sort === true;
            this._bMerge = options.merge === true;
            if (options.items) {
                core.delegate(options.items, this.setItems, this);
                delete options.items;
            }
            delete options.sort;
            delete options.merge;
            _super(el, options);
        },
        {
            /**
             * @override
             */
            $change: function () {
                var root = this.getRoot();
                root.forEach(function (node) {
                    if (node.isSelected()) {
                        if (node._cItem) {
                            if (root._bSort || !node._cItem.getParent()) {
                                root._cItems.add(node._cItem);
                            }
                        } else {
                            var value = node.getValue();
                            if (value) {
                                var options = { value: value, owner: node };
                                options[core.TEXTNAME] = node.getContent();
                                node._cItem = root._cItems.add(options)[0];
                            }
                        }
                        if (root._bMerge) {
                            // 清除所有子树的选项
                            node.forEach(function (child) {
                                if (child !== node && child._cItem) {
                                    child._cItem.setParent();
                                }
                            });
                            // 阻止子树继续遍历
                            return false;
                        }
                    } else if (node._cItem) {
                        if (node._cItem.getParent()) {
                            node._cItem.setParent();
                        }
                    }
                });
            },

            /**
             * @override
             */
            $dispose: function () {
                if (this._cItem) {
                    this._cItem.dispose();
                    this._cItem = null;
                }
                _super.$dispose();
            },

            /**
             * 设置穿梭树关联的选项组控件。
             * @public
             *
             * @param {ecui.ui.iItems} items 选项组控件
             */
            setItems: function (items) {
                this.getRoot()._cItems = items;
            }
        }
    );
//{if 0}//
})();
//{/if}//
