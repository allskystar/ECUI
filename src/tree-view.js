/*
TreeView - 定义树形视图的基本操作。
树视图控件，继承自基础控件，不可以被改变大小，可以包含普通子控件或者子树视图控件，普通子控件显示在它的文本区域，如果是子树视图控件，将在专门的子树视图控件区域显示。子树视图控件区域可以被收缩隐藏或是展开显示，默认情况下点击树视图控件就改变子树视图控件区域的状态。

树视图控件直接HTML初始化的例子:
<ul ui="type:tree-view;">
  <!-- 显示的文本，如果没有label整个内容就是节点的文本 -->
  <div>公司</div>
  <!-- 子控件 -->
  <li>董事会</li>
  <li>监事会</li>
  <ul>
    <div>总经理</div>
    <li>行政部</li>
    <li>人事部</li>
    <li>财务部</li>
    <li>市场部</li>
    <li>销售部</li>
    <li>技术部</li>
  </ul>
</ul>

属性
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
        if (tree._aChildren) {
            tree.alterSubType(tree._aChildren.length ? (tree._bCollapsed ? 'collapsed' : 'expanded') : (!tree._eChildren || tree._bAutoType ? 'leaf' : 'empty'));
        }
    }

    /**
     * 建立子树视图控件。
     * @private
     *
     * @param {HTMLElement} el 子树的 Element 对象
     * @param {ecui.ui.TreeView} parent 父树视图控件
     * @param {Object} options 初始化选项，参见 create 方法
     * @return {ecui.ui.TreeView} 子树视图控件
     */
    function createChild(el, parent, options) {
        el.className += parent.constructor.CLASS;
        return core.$fastCreate(parent.constructor, el, null, util.extend(util.extend({}, options), core.getOptions(el) || {}));
    }

    /**
     * 初始化树视图控件。
     * options 对象支持的属性如下：
     * collapsed      子树区域是否收缩，默认为展开
     * autoType       是否自动根据子节点数量转换节点的状态(叶子节点/非叶子节点)
     * expandSelected 是否展开选中的节点，如果不自动展开，需要点击左部的小区域图标才有效，默认自动展开
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.TreeView = core.inherits(
        ui.Control,
        'ui-treeview',
        function (el, options) {
            if (el.tagName === 'UL') {
                var childrenEl = this._eChildren = el;
                el = dom.insertBefore(dom.first(el), el);
                el.className = childrenEl.className;
                childrenEl.className = options.classes.join('-children ');

                var list = dom.children(childrenEl);

                if (options.collapsed) {
                    dom.addClass(childrenEl, 'ui-hide');
                }
            }

            ui.Control.call(this, el, options);

            this._bCollapsed = !!options.collapsed;
            this._bAutoType = options.autoType;

            // 初始化子控件
            this._aChildren = list ? list.map(function (item) {
                item = createChild(item, this, options);
                item.$setParent(this);
                return item;
            }, this) : [];

            refresh(this);
        },
        {
            /**
             * @override
             */
            $cache: function (style, cacheSize) {
                ui.Control.prototype.$cache.call(this, style, cacheSize);
                this._aChildren.forEach(function (item) {
                    item.cache(true, true);
                });
            },

            /**
             * 控件点击时改变子树视图控件的显示/隐藏状态。
             * @override
             */
            $click: function (event) {
                ui.Control.prototype.$click.call(this, event);

                if (event.getControl() === this) {
                    if (this._eChildren) {
                        if (this.isCollapsed()) {
                            this.expand();
                            core.triggerEvent(this, 'expand');
                        } else {
                            this.collapse();
                            core.triggerEvent(this, 'collapse');
                        }
                    }
                    core.triggerEvent(this, 'nodeclick', event);
                }
            },

            /**
             * @override
             */
            $dispose: function () {
                this._eChildren = null;
                ui.Control.prototype.$dispose.call(this);
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
                            core.triggerEvent(control, 'nodeover', event);
                            break;
                        }
                    }
                    core.triggerEvent(hovered, 'nodeout', event);
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
                    core.triggerEvent(hovered, 'nodeout', event);
                }
                core.triggerEvent(this, 'nodeover', event);
                hovered = this;
            },

            /**
             * 节点点击事件的默认处理。
             * @protected
             *
             * @param {ECUIEvent} event 事件对象
             */
            $nodeclick: function () {
                var root = this.getRoot();
                if (root._cSelected !== this) {
                    if (root._cSelected) {
                        root._cSelected.alterClass('-selected');
                    }
                    this.alterClass('+selected');
                    root._cSelected = this;
                }
            },

            /**
             * 节点移出事件的默认处理。
             * 鼠标移出节点区域时，控件解除悬停状态，移除状态样式 -nodehover。与 mouseout 不同的是， nodeout 没有与父结点关联。
             * @protected
             *
             * @param {ECUIEvent} event 事件对象
             */
            $nodeout: function () {
                this.alterClass('-nodehover');
            },

            /**
             * 节点移入事件的默认处理。
             * 鼠标移入节点区域时，控件获得悬停状态，添加状态样式 -nodehover。与 mouseover 不同的是， nodeover 没有与父结点关联。
             * @protected
             *
             * @param {ECUIEvent} event 事件对象
             */
            $nodeover: function () {
                this.alterClass('+nodehover');
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
                        root._cSelected.alterClass('-selected');
                        root._cSelected = null;
                    }

                    util.remove(oldParent._aChildren, this);
                    refresh(oldParent);
                }

                ui.Control.prototype.$setParent.call(this, parent);

                // 将子树区域显示在主元素之后
                if (this._eChildren) {
                    dom.insertAfter(this._eChildren, this.getOuter());
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
             * @param {Object} options 子树视图控件初始化选项
             * @return {ecui.ui.TreeView} 添加的树视图控件
             */
            add: function (item, index, options) {
                var list = this._aChildren,
                    el;

                if ('string' === typeof item) {
                    el = dom.create('LI', {innerHTML: item});
                    item = createChild(el, this, options);
                }

                // 这里需要先 setParent，否则 getRoot 的值将不正确
                if (!this._eChildren) {
                    this._eChildren = dom.create('UL', {className: this.getPrimary() + '-children ' + this.getType() + '-children'});
                    dom.insertAfter(this._eChildren, this.getOuter());
                }
                item.setParent(this);

                if (item.getParent()) {
                    el = item.getOuter();
                    util.remove(list, item);
                    if (list[index]) {
                        dom.insertBefore(el, list[index].getOuter());
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
                    this._bCollapsed = true;
                    dom.addClass(this._eChildren, 'ui-hide');
                    refresh(this);
                }
            },

            /**
             * 展开当前树视图控件的子树区域。
             * @public
             */
            expand: function () {
                if (this._eChildren && this._bCollapsed) {
                    this._bCollapsed = false;
                    dom.removeClass(this._eChildren, 'ui-hide');
                    refresh(this);
                }
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
             * @override
             */
            init: function (options) {
                ui.Control.prototype.init.call(this, options);
                this._aChildren.forEach(function (item) {
                    item.init(options);
                });
            },

            /**
             * 当前子树区域是否收缩。
             * @public
             *
             * @return {boolean} true 表示子树区域收缩，false 表示子树区域展开
             */
            isCollapsed: function () {
                return !this._eChildren || this._bCollapsed;
            }
        }
    );
}());
