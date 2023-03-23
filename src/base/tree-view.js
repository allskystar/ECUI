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

    function initChildren(tree) {
        if (tree._aChildren[0] && !(tree._aChildren[0] instanceof ui.TreeView)) {
            var children = tree._aChildren;
            tree._aChildren = [];
            children.forEach(function (item) {
                tree.add(item);
            });
        }
    }

    /**
     * 树视图控件刷新，根据子树视图控件的数量及显示的状态设置样式。
     * @private
     *
     * @param {ecui.ui.TreeView} tree 树控件
     */
    function refresh(tree) {
        if (tree._eContainer !== null) {
            if (tree._aChildren instanceof Array) {
                tree.alterSubType(tree._aChildren.length ? (tree._bCollapsed ? 'collapsed' : 'expanded') : 'empty');
            } else {
                tree.alterSubType(tree._aChildren ? 'collapsed' : 'empty');
            }
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
        function (el, options) {
            this._bCollapsed = !!options.collapsed;
            if (el.tagName === 'UL') {
                dom.addClass(el, this.getUnitClass(ui.TreeView, 'children'));

                if (options.collapsed) {
                    dom.addClass(el, 'ui-hide');
                } else if (el.classList.contains('ui-hide')) {
                    this._bCollapsed = true;
                }

                this._eContainer = el;
                el = dom.insertBefore(el.firstElementChild, el);
            }

            _super(el, options);

            if (this._eContainer) {
                    // 初始化子控件
                this._aChildren = dom.children(this._eContainer).map(
                    function (item) {
                        return core.$fastCreate(this.constructor, item, this, Object.assign({}, options, {id: undefined, ext: undefined}, core.getOptions(item) || {}));
                    },
                    this
                );
            } else {
                this._aChildren = options.children ? options.children instanceof Array ? options.children : +options.children : [];
                if (this._aChildren > 0 || this._aChildren[0]) {
                    this._eContainer = dom.create('UL', {className: this.getUnitClass(ui.TreeView, 'children')});
                }
            }

            refresh(this);
        },
        {
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
                this._bCollapsed = true;
                dom.addClass(this._eContainer, 'ui-hide');
                refresh(this);
            },

            /**
             * @override
             */
            $dispose: function () {
                if (this._eContainer) {
                    core.dispose(this._eContainer);
                }
                _super.$dispose();
                this._eContainer = null;
            },

            /**
             * 展开当前树视图控件的子树区域的默认处理。
             * @protected
             */
            $expand: function () {
                if (this._aChildren instanceof Array) {
                    initChildren(this);
                    this._bCollapsed = false;
                    dom.removeClass(this._eContainer, 'ui-hide');
                    core.cacheAtShow();
                    refresh(this);
                } else {
                    // TODO: 动态取子树信息
                }
            },

            /**
             * 隐藏树视图控件的同时需要将子树区域也隐藏。
             * @override
             */
            $hide: function () {
                _super.$hide();

                if (this._eContainer) {
                    dom.addClass(this._eContainer, 'ui-hide');
                }
            },

            /**
             * 插入子节点区域。
             */
            $insertContainer: function () {
                dom.insertAfter(this._eContainer, this.getMain());
            },

            /**
             * @override
             */
            $mouseout: function (event) {
                _super.$mouseout(event);

                if (hovered) {
                    if (!this.contains(hovered)) {
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
                    if (this.contains(hovered)) {
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
                if (this._eContainer) {
                    if (this.isCollapsed()) {
                        this.expand();
                    } else {
                        this.collapse();
                    }
                }

                this.getRoot().setActived(this);
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
                var root = this.getRoot();
                if (root !== this) {
                    if (this.contains(root.getActived())) {
                        root.setActived();
                    }

                    var oldParent = this.getParent();
                    util.remove(oldParent._aChildren, this);
                    refresh(oldParent);
                }

                _super.$setParent(parent);

                // 将子树区域显示在主元素之后
                if (this._eContainer) {
                    this.$insertContainer();
                }
            },

            /**
             * 显示树视图控件的同时需要将子树视图区域也显示。
             * @override
             */
            $show: function () {
                _super.$show();

                if (this._eContainer && !this._bCollapsed) {
                    dom.removeClass(this._eContainer, 'ui-hide');
                }
            },

            /**
             * 添加子树视图控件。
             * @public
             *
             * @param {object|ecui.ui.TreeView} item 控件的初始化选项/树视图控件
             * @param {number} index 子树视图控件需要添加的位置序号，不指定将添加在最后
             * @return {ecui.ui.TreeView} 添加的树视图控件
             */
            add: function (item, index) {
                if (this._aChildren instanceof Array) {
                    // 动态树没有展开前不允许添加子节点
                    initChildren(this);

                    if (!(item instanceof ui.TreeView)) {
                        if (typeof item === 'string') {
                            item = { main: dom.create('LI', { innerHTML: item }) };
                        } else if (!item.main) {
                            item.main = dom.create('LI', {innerHTML: item[core.TEXTNAME]});
                        }
                        item = core.$fastCreate(this.constructor, item.main, null, Object.assign({}, item, {id: ''}));
                    }

                    // 这里需要先 setParent，否则 getRoot 的值将不正确
                    if (!this._eContainer) {
                        this._eContainer = dom.create('UL', {className: this.getUnitClass(ui.TreeView, 'children')});
                        this.$insertContainer();
                    }
                    item.setParent(this);

                    if (item.getParent()) {
                        var el = item.getMain();
                        if (this._aChildren[index]) {
                            dom.insertBefore(el, this._aChildren[index].getMain());
                            this._aChildren.splice(index, 0, item);
                        } else {
                            this._eContainer.appendChild(el);
                            this._aChildren.push(item);
                        }
                        if (item._eContainer) {
                            item.$insertContainer();
                        }
                    }

                    refresh(this);

                    return item;
                }
            },

            /**
             * 收缩当前树视图控件的子树区域。
             * @public
             */
            collapse: function () {
                if (this._eContainer && !this._bCollapsed) {
                    core.dispatchEvent(this, 'collapse');
                }
            },

            /**
             * 展开当前树视图控件的子树区域。
             * @public
             */
            expand: function () {
                if (this._eContainer && this._bCollapsed) {
                    core.dispatchEvent(this, 'expand');
                }
            },

            /**
             * 遍历所有的树控件节点。
             * @public
             *
             * @param {Function} fn 遍历时用于节点处理的函数，不返回值正常遍历，返回 false 时不遍历当前节点的子节点，返回其它值时直接终止遍历并返回结果。
             * @param {object} thisArg this指针
             */
            forEach: function (fn, thisArg) {
                for (var i = 0, nodes = [this], floor = 0, len = 1, node; (node = nodes[i++]);) {
                    var ret = fn.call(thisArg, node, floor);
                    if (ret === undefined) {
                        if (node._aChildren instanceof Array) {
                            initChildren(node);
                            Array.prototype.push.apply(nodes, node._aChildren);
                        }
                    } else if (ret !== false) {
                        return ret;
                    }
                    if (i === len) {
                        len = nodes.length;
                        floor++;
                    }
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
                if (this._aChildren instanceof Array) {
                    initChildren(this);
                }
                return this._aChildren[index] || null;
            },

            /**
             * 获取当前树视图控件的所有子树视图控件。
             * @public
             *
             * @return {Array} 树视图控件列表
             */
            getChildren: function () {
                if (this._aChildren instanceof Array) {
                    initChildren(this);
                    return this._aChildren.slice();
                }
                return [];
            },

            /**
             * 获取当前树视图控件的子节点区域DOM。
             * @public
             *
             * @return {HTMLElement} 当前树视图控件的子节点区域DOM
             */
            getContainer: function () {
                return this._eContainer;
            },

            /**
             * 获取当前树视图控件的根控件。
             * @public
             *
             * @return {ecui.ui.TreeView} 树视图控件的根控件
             */
            getRoot: function () {
                // 这里需要考虑Tree位于上一个Tree的节点内部
                for (var control = this, parent;; control = parent) {
                    parent = control.getParent();
                    if (!(parent instanceof ui.TreeView) || parent.getChildren().indexOf(control) < 0) {
                        break;
                    }
                }
                return control;
            },

            /**
             * 当前子树区域是否收缩。
             * @public
             *
             * @return {boolean} true 表示子树区域收缩，false 表示子树区域展开
             */
            isCollapsed: function () {
                return !this._eContainer || !this._aChildren || !this._aChildren.length || this._bCollapsed;
            },

            /**
             * 移除一个子选项。
             * @public
             *
             * @param {number} index 需要移除的选项序号
             * @return {ecui.ui.TreeView|object} 子树控件或数据项
             */
            remove: function (index) {
                if (this._aChildren instanceof Array) {
                    var item = this._aChildren[index];
                    if (item) {
                        if (item instanceof ui.TreeView) {
                            item.setParent();
                        } else {
                            this._aChildren.splice(index, 1);
                        }
                    }
                    return item;
                }
                return null;
            },

            /**
             * 移除所有子选项控件。
             * @public
             *
             * @param {boolean} dispose 子控件是否在移除过程中自动释放
             */
            removeAll: function (dispose) {
                if (this._aChildren[0] instanceof ui.TreeView) {
                    if (dispose) {
                        if (this._eContainer) {
                            core.dispose(this._eContainer);
                            this._eContainer.innerHTML = '';
                        }
                    } else {
                        this._aChildren.slice().forEach(function (item) {
                            item.setParent();
                        });
                    }
                }
                this._aChildren = [];
            }
        },
        ui.Control.defineProperty('actived')
    );
})();
