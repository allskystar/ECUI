/*
@example
<ul ui="type:tree-view;collapsed:false">
    <li>根节点</li>

    <li>子节点一</li>
    <li>子节点二</li>
    <ul class="ui-hide">
        <li>子节点三</li>

        <li>孙节点一</li>
        <li>孙节点二</li>
        <li>孙节点三</li>
    </ul>
</ul>

@fields
_bCollapsed    - 是否收缩子树
_eChildren     - 子控件区域Element对象
_aChildren     - 子控件集合
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    var hovered;

    /**
     * 树视图控件刷新，根据子树视图控件的数量及显示的状态设置样式。
     * @private
     *
     * @param {ecui.ui.TreeView} tree 树控件
     */
    function refresh(tree) {
        if (tree._eChildren) {
            tree.alterSubType(tree._aChildren.length ? (tree._bCollapsed ? 'collapsed' : 'expanded') : 'empty');
        }
    }

    /**
     * 树控件。
     * 包含普通子控件或者子树视图控件，普通子控件显示在它的文本区域，如果是子树视图控件，将在专门的子树视图控件区域显示。子树视图控件区域可以被收缩隐藏或是展开显示，默认情况下点击树视图控件就改变子树视图控件区域的状态。
     * options 属性：
     * collapsed      子树区域是否收缩，默认为展开
     * @control
     */
    ui.TreeView = core.inherits(
        ui.Control,
        'ui-treeview',
        [
            function (el, options) {
                if (this._eChildren) {
                    // 初始化子控件
                    this._aChildren = dom.children(this._eChildren).map(
                        function (item) {
                            return core.$fastCreate(this.constructor, item, this, Object.assign({}, options, {id: undefined}, core.getOptions(item) || {}));
                        },
                        this
                    );
                } else {
                    this._aChildren = [];
                }

                refresh(this);
            },
            function (el, options) {
                this._bCollapsed = !!options.collapsed;

                if (el.tagName === 'UL') {
                    dom.addClass(el, this.getUnitClass(ui.TreeView, 'children'));

                    if (options.collapsed) {
                        dom.addClass(el, 'ui-hide');
                    } else if (dom.hasClass(el, 'ui-hide')) {
                        this._bCollapsed = true;
                    }

                    this._eChildren = el;
                    el = dom.insertBefore(dom.first(el), el);
                }

                ui.Control.call(this, el, options);
            }
        ],
        {
            /**
             * 控件点击时改变子树视图控件的显示/隐藏状态。
             * @override
             */
            $click: function (event) {
                ui.Control.prototype.$click.call(this, event);

                for (var control = event.getControl(); control !== this; control = control.getParent()) {
                    if (control instanceof ui.TreeView) {
                        return;
                    }
                }
                core.dispatchEvent(this, 'nodeclick', event);
            },

            /**
             * 收缩当前树视图控件的子树区域的默认处理。
             * @protected
             */
            $collapse: function () {
                this._bCollapsed = true;
                dom.addClass(this._eChildren, 'ui-hide');
                refresh(this);
            },

            /**
             * @override
             */
            $dispose: function () {
                this._eChildren = null;
                ui.Control.prototype.$dispose.call(this);
            },

            /**
             * 展开当前树视图控件的子树区域的默认处理。
             * @protected
             */
            $expand: function () {
                this._bCollapsed = false;
                dom.removeClass(this._eChildren, 'ui-hide');
                core.cacheAtShow(this._eChildren);
                refresh(this);
            },

            /**
             * 隐藏树视图控件的同时需要将子树区域也隐藏。
             * @override
             */
            $hide: function () {
                ui.Control.prototype.$hide.call(this);

                if (this._eChildren) {
                    dom.addClass(this._eChildren, 'ui-hide');
                }
            },

            /**
             * @override
             */
            $mouseout: function (event) {
                ui.Control.prototype.$mouseout.call(this, event);

                if (hovered) {
                    if (!this.contain(hovered)) {
                        return;
                    }
                    for (var control = event.getControl(); control; control = control.getParent()) {
                        if (control instanceof ui.TreeView) {
                            core.dispatchEvent(control, 'nodeover', event);
                            break;
                        }
                    }
                    core.dispatchEvent(hovered, 'nodeout', event);
                    hovered = control;
                }
            },

            /**
             * @override
             */
            $mouseover: function (event) {
                ui.Control.prototype.$mouseover.call(this, event);

                if (hovered) {
                    if (this.contain(hovered)) {
                        return;
                    }
                    core.dispatchEvent(hovered, 'nodeout', event);
                }
                core.dispatchEvent(this, 'nodeover', event);
                hovered = this;
            },

            /**
             * 节点点击事件。
             * @event
             */
            $nodeclick: function () {
                var root = this.getRoot();

                if (this._eChildren) {
                    if (this.isCollapsed()) {
                        this.expand();
                        core.dispatchEvent(this, 'expand');
                    } else {
                        this.collapse();
                        core.dispatchEvent(this, 'collapse');
                    }
                }

                if (root._cSelected !== this) {
                    if (root._cSelected) {
                        root._cSelected.alterStatus('-selected');
                    }
                    this.alterStatus('+selected');
                    root._cSelected = this;
                }
            },

            /**
             * 节点移出事件。
             * 鼠标移出节点区域时，控件解除悬停状态，移除状态样式 -nodehover。与 mouseout 不同的是， nodeout 没有与父结点关联。
             * @event
             */
            $nodeout: function () {
                this.alterStatus('-nodehover');
            },

            /**
             * 节点移入事件。
             * 鼠标移入节点区域时，控件获得悬停状态，添加状态样式 -nodehover。与 mouseover 不同的是， nodeover 没有与父结点关联。
             * @event
             */
            $nodeover: function () {
                this.alterStatus('+nodehover');
            },

            /**
             * 树视图控件改变位置时，需要将自己的子树区域显示在主元素之后。
             * @override
             */
            $setParent: function (parent) {
                var oldParent = this.getParent();

                if (oldParent) {
                    var root = this.getRoot();
                    if (this.contain(root._cSelected)) {
                        root._cSelected.alterStatus('-selected');
                        root._cSelected = null;
                    }

                    util.remove(oldParent._aChildren, this);
                    refresh(oldParent);
                }

                ui.Control.prototype.$setParent.call(this, parent);

                // 将子树区域显示在主元素之后
                if (this._eChildren) {
                    dom.insertAfter(this._eChildren, this.getMain());
                }
            },

            /**
             * 显示树视图控件的同时需要将子树视图区域也显示。
             * @override
             */
            $show: function () {
                ui.Control.prototype.$show.call(this);

                if (this._eChildren && !this._bCollapsed) {
                    dom.removeClass(this._eChildren, 'ui-hide');
                }
            },

            /**
             * 添加子树视图控件。
             * @public
             *
             * @param {string|ecui.ui.TreeView} item 子树视图控件的 html 内容/树视图控件
             * @param {number} index 子树视图控件需要添加的位置序号，不指定将添加在最后
             * @param {object} options 子树视图控件初始化选项
             * @return {ecui.ui.TreeView} 添加的树视图控件
             */
            add: function (item, index, options) {
                var list = this._aChildren,
                    el;

                if ('string' === typeof item) {
                    el = dom.create('LI', {innerHTML: item});
                    item = core.$fastCreate(this.constructor, el, null, Object.assign({}, options, {id: ''}, core.getOptions(el) || {}));
                }

                // 这里需要先 setParent，否则 getRoot 的值将不正确
                if (!this._eChildren) {
                    this._eChildren = dom.create('UL', {className: this.getPrimary() + '-children ' + this.getType() + '-children'});
                    dom.insertAfter(this._eChildren, this.getMain());
                }
                item.setParent(this);

                if (item.getParent()) {
                    el = item.getMain();
                    util.remove(list, item);
                    if (list[index]) {
                        dom.insertBefore(el, list[index].getMain());
                        list.splice(index, 0, item);
                    } else {
                        this._eChildren.appendChild(el);
                        list.push(item);
                    }
                    if (item._eChildren) {
                        dom.insertAfter(item._eChildren, el);
                    }
                }

                refresh(this);

                return item;
            },

            /**
             * 收缩当前树视图控件的子树区域。
             * @public
             */
            collapse: function () {
                if (this._eChildren && !this._bCollapsed) {
                    this.$collapse();
                }
            },

            /**
             * 展开当前树视图控件的子树区域。
             * @public
             */
            expand: function () {
                if (this._eChildren && this._bCollapsed) {
                    this.$expand();
                }
            },

            /**
             * 遍历所有的树控件节点。
             * @public
             *
             * @param {Function} fn 遍历时用于节点处理的函数
             */
            forEach: function (fn) {
                for (var i = 0, nodes = [this.getRoot()], node; node = nodes[i++]; ) {
                    fn(node);
                    nodes = nodes.concat(node._aChildren);
                }
            },

            /**
             * 获取当前树视图控件的指定子树视图控件。
             * @public
             *
             * @param {number} index 子树视图控件的序号
             * @return {ecui.ui.TreeView} 树视图控件列表
             */
            getChild: function (index) {
                return this._aChildren[index] || null;
            },

            /**
             * 获取当前树视图控件的所有子树视图控件。
             * @public
             *
             * @return {Array} 树视图控件列表
             */
            getChildren: function () {
                return this._aChildren.slice();
            },

            /**
             * 获取当前树视图控件的根控件。
             * @public
             *
             * @return {ecui.ui.TreeView} 树视图控件的根控件
             */
            getRoot: function () {
                // 这里需要考虑Tree位于上一个Tree的节点内部
                for (var control = this, parent; (parent = control.getParent()) instanceof ui.TreeView && parent._aChildren.indexOf(control) >= 0; control = parent) {}
                return control;
            },

            /**
             * 当前子树区域是否收缩。
             * @public
             *
             * @return {boolean} true 表示子树区域收缩，false 表示子树区域展开
             */
            isCollapsed: function () {
                return !this._eChildren || this._bCollapsed;
            },

            /**
             * 获取当前树视图控件的所有子树视图控件。
             * @public
             *
             * @param {number} index 需要移除的项的序号
             */
            remove: function (index) {
                this._aChildren[index].setParent();
            }
        }
    );
}());
