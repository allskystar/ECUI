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
container     - 子控件区域Element对象
children     - 子控件集合
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
     * 树控件。
     * 包含普通子控件或者子树视图控件，普通子控件显示在它的文本区域，如果是子树视图控件，将在专门的子树视图控件区域显示。子树视图控件区域可以被收缩隐藏或是展开显示，默认情况下点击树视图控件就改变子树视图控件区域的状态。
     * options 属性：
     * collapsed      子树区域是否收缩，默认为展开
     * @control
     */
    ui.TreeView = core.inherits(
        ui.Control,
        'ui-treeview',
        function (el, options) {
            this.collapsed = !!options.collapsed;

            if (el.tagName === 'UL') {
                dom.addClass(el, this.getUnitClass(ui.TreeView, 'children'));

                if (options.collapsed) {
                    dom.addClass(el, 'ui-hide');
                } else if (dom.hasClass(el, 'ui-hide')) {
                    this.collapsed = true;
                }

                this.container = el;
                el = dom.insertBefore(dom.first(el), el);
            }

            _super(el, options);

            delete options.id;

            el = this.getMain();
            if (this.container) {
                // 初始化子控件
                this.children = dom.children(this.container).map(
                    function (item) {
                        return core.$fastCreate(this.constructor, item, this, Object.assign({}, options, core.getOptions(item) || {}));
                    },
                    this
                );
            } else {
                this.children = [];
            }

            this._refresh();
        },
        {
            private: {
                children: undefined,
                collapsed: undefined,
                container: undefined,

                /**
                 * 树视图控件刷新，根据子树视图控件的数量及显示的状态设置样式。
                 * @private
                 */
                _refresh: function () {
                    if (this.container) {
                        this.alterSubType(this.children.length ? (this.collapsed ? 'collapsed' : 'expanded') : 'empty');
                    }
                }
            },

            /**
             * 控件点击时改变子树视图控件的显示/隐藏状态。
             * @override
             */
            $click: function (event) {
                _super.$click(event);

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
                this.collapsed = true;
                dom.addClass(this.container, 'ui-hide');
                this._refresh();
            },

            /**
             * @override
             */
            $dispose: function () {
                this.container = null;
                _super.$dispose();
            },

            /**
             * 展开当前树视图控件的子树区域的默认处理。
             * @protected
             */
            $expand: function () {
                this.collapsed = false;
                dom.removeClass(this.container, 'ui-hide');
                core.cacheAtShow(this.container);
                this._refresh();
            },

            /**
             * 隐藏树视图控件的同时需要将子树区域也隐藏。
             * @override
             */
            $hide: function () {
                _super.$hide();

                if (this.container) {
                    dom.addClass(this.container, 'ui-hide');
                }
            },

            /**
             * @override
             */
            $mouseout: function (event) {
                _super.$mouseout(event);

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
                _super.$mouseover(event);

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

                if (this.container) {
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

                    util.remove(oldParent.children, this);
                    ui.TreeView._cast(oldParent)._refresh();
                }

                _super.$setParent(parent);

                // 将子树区域显示在主元素之后
                if (this.container) {
                    dom.insertAfter(this.container, this.getMain());
                }
            },

            /**
             * 显示树视图控件的同时需要将子树视图区域也显示。
             * @override
             */
            $show: function () {
                _super.$show();

                if (this.container && !this.collapsed) {
                    dom.removeClass(this.container, 'ui-hide');
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
                var list = this.children,
                    el;

                if ('string' === typeof item) {
                    el = dom.create('LI', {innerHTML: item});
                    item = core.$fastCreate(this.constructor, el, null, Object.assign({}, options, {id: ''}, core.getOptions(el) || {}));
                }

                // 这里需要先 setParent，否则 getRoot 的值将不正确
                if (!this.container) {
                    this.container = dom.create('UL', {className: this.getPrimary() + '-children ' + this.getType() + '-children'});
                    dom.insertAfter(this.container, this.getMain());
                }
                item.setParent(this);

                if (item.getParent()) {
                    el = item.getMain();
                    util.remove(list, item);
                    if (list[index]) {
                        dom.insertBefore(el, list[index].getMain());
                        list.splice(index, 0, item);
                    } else {
                        this.container.appendChild(el);
                        list.push(item);
                    }
                    if (item.container) {
                        dom.insertAfter(item.container, el);
                    }
                }

                this._refresh();

                return item;
            },

            /**
             * 收缩当前树视图控件的子树区域。
             * @public
             */
            collapse: function () {
                if (this.container && !this.collapsed) {
                    this.$collapse();
                }
            },

            /**
             * 展开当前树视图控件的子树区域。
             * @public
             */
            expand: function () {
                if (this.container && this.collapsed) {
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
                    nodes = nodes.concat(node.children);
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
                return this.children[index] || null;
            },

            /**
             * 获取当前树视图控件的所有子树视图控件。
             * @public
             *
             * @return {Array} 树视图控件列表
             */
            getChildren: function () {
                return this.children.slice();
            },

            /**
             * 获取当前树视图控件的根控件。
             * @public
             *
             * @return {ecui.ui.TreeView} 树视图控件的根控件
             */
            getRoot: function () {
                // 这里需要考虑Tree位于上一个Tree的节点内部
                for (var control = this, parent; (parent = control.getParent()) instanceof ui.TreeView && ui.TreeView._cast(parent).children.indexOf(control) >= 0; control = parent) {}
                return control;
            },

            /**
             * 当前子树区域是否收缩。
             * @public
             *
             * @return {boolean} true 表示子树区域收缩，false 表示子树区域展开
             */
            isCollapsed: function () {
                return !this.container || this.collapsed;
            },

            /**
             * 获取当前树视图控件的所有子树视图控件。
             * @public
             *
             * @param {number} index 需要移除的项的序号
             */
            remove: function (index) {
                this.children[index].setParent();
            }
        }
    );
}());
