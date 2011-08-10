/*
Tree - 定义树形结构的基本操作。
树控件，继承自基础控件，不可以被改变大小。树控件可以包含普通子控件或者子树控件，普通子控件显示在它的文本区域，如果是子
树控件，将在专门的子树控件区域显示。子树控件区域可以被收缩隐藏或是展开显示，默认情况下点击树控件就改变子树控件区域的状
态。

树控件直接HTML初始化的例子:
<div ecui="type:tree;fold:true">
    <!-- 当前节点的文本，如果没有整个内容就是节点的文本 -->
    <label>节点的文本</label>
    <!-- 这里放子控件，如果需要fold某个子控件，将子控件的style="display:none"即可 -->
    <li>子控件文本</li>
    ...
</div>

属性
_bFold         - 是否收缩子树
_eItems        - 子控件区域Element对象
_aTree         - 子控件集合
*/
//{if 0}//
(function () {

    var core = ecui,
        array = core.array,
        dom = core.dom,
        string = core.string,
        ui = core.ui,
        util = core.util,

        indexOf = array.indexOf,
        remove = array.remove,
        children = dom.children,
        createDom = dom.create,
        first = dom.first,
        insertAfter = dom.insertAfter,
        moveElements = dom.moveElements,
        removeDom = dom.remove,
        trim = string.trim,
        blank = util.blank,
        extend = util.extend,
        inherits = util.inherits,

        $fastCreate = core.$fastCreate,
        getParameters = core.getParameters,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化树控件。
     * options 对象支持的属性如下：
     * fold 子树是否收缩，默认为展开
     * @public
     *
     * @param {Object} options 初始化选项
     */
    //__gzip_original__UI_TREE
    var UI_TREE =
        ui.Tree = function (el, options) {
            var o = first(el),
                childTrees = this._aTree = [];

            UI_CONTROL.call(this, el, options);
            this._bFold = false;

            // 检查是否存在label标签，如果是需要自动初始化树的子结点
            if (o && o.tagName == 'LABEL') {
                // 初始化子控件
                for (
                    var i = 0,
                        list = children(el).slice(1),
                        el = UI_TREE_SETITEMS(this, createDom());
                    o = list[i];
                ) {
                    el.appendChild(o);
                    (childTrees[i++] = UI_TREE_CREATE_CHILD(o, this, options)).$setParent(this);
                }
            }

            // 改变默认的展开状态
            if (options.fold) {
                this.setFold();
            }
            else {
                UI_TREE_FLUSH(this);
            }
        },
        UI_TREE_CLASS = inherits(UI_TREE, UI_CONTROL);
//{else}//
    /**
     * 设置树控件的选项组 Element 对象。
     * @private
     *
     * @param {ecui.ui.Tree} tree 树控件
     * @param {HTMLElement} items 子树选项组的 Element 对象
     * @return {HTMLElement} items 子树选项组的 Element 对象
     */
    function UI_TREE_SETITEMS(tree, items) {
        tree._eItems = items;
        items.className = tree.getType() + '-items ' + tree.getBaseClass() + '-items';
        items.style.cssText = '';
        return items;
    }

    /**
     * 树控件刷新，根据子树控件的数量及显示的状态设置样式，分为 -empty(没有子树控件)、-fold(子树收缩)与普通样式三种。
     * @private
     *
     * @param {ecui.ui.Tree} control 树控件
     */
    function UI_TREE_FLUSH(control) {
        control.setClass(
            control.getBaseClass() + (control._aTree.length ? control._bFold ? '-fold' : '-nonleaf' : '')
        );
    }

    /**
     * 建立子树控件。
     * @private
     *
     * @param {HTMLElement} el 子树的 Element 对象
     * @param {ecui.ui.Tree} parent 父树控件
     * @param {Object} options 初始化选项，参见 create 方法
     * @return {ecui.ui.Tree} 子树控件
     */
    function UI_TREE_CREATE_CHILD(el, parent, options) {
        el.className = parent.getType() + ' ' + (trim(el.className) || parent.getBaseClass());
        return $fastCreate(parent.constructor, el, null, extend(extend({}, options), getParameters(el)));
    }

    /**
     * 设置树控件的显示/隐藏子树状态。
     * @private
     *
     * @param {ecui.ui.Tree} tree 树控件
     * @param {boolean} status 显示/隐藏子树状态
     */
    function UI_TREE_SET_FOLD(tree, status) {
        for (var i = 0, o; o = tree._aTree[i++]; ) {
            o.setFold(status);
            UI_TREE_SET_FOLD(o, status);
        }
    }

    /**
     * 鼠标单击控件事件的默认处理。
     * 控件点击时改变子树控件的显示/隐藏状态。如果控件处于可操作状态(参见 isEnabled)，click 方法触发 onclick 事件，如果事件返回值不为 false，则调用 $click 方法。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_TREE_CLASS.$click = function (event) {
        UI_CONTROL_CLASS.$click.call(this, event);
        this.setFold(!this.isFold());
    };

    /**
     * 无效，树控件禁止设置大小。
     * @protected
     */
    UI_TREE_CLASS.$cache = UI_TREE_CLASS.$resize = UI_TREE_CLASS.$setSize = blank;

    /**
     * 销毁控件的默认处理。
     * @protected
     */
    UI_TREE_CLASS.$dispose = function () {
        this._eItems = null;
        UI_CONTROL_CLASS.$dispose.call(this);
    };

    /**
     * 隐藏控件。
     * 隐藏树控件的同时需要将子树区域也隐藏。
     * @protected
     */
    UI_TREE_CLASS.$hide = function () {
        UI_CONTROL_CLASS.$hide.call(this);

        if (this._eItems) {
            this._eItems.style.display = 'none';
        }
    };

    /**
     * 控件渲染完成后初始化的默认处理。
     * $init 方法在控件渲染完成后调用，参见 create 与 init 方法。
     * @protected
     */
    UI_TREE_CLASS.$init = function () {
        UI_CONTROL_CLASS.$init.call(this);
        for (var i = 0, list = this._aTree, o; o = list[i++]; ) {
            o.$init();
        }
    };

     /**
     * 控件移除子控件事件的默认处理。
     * @protected
     *
     * @param {ecui.ui.Tree} child 子树控件
     */
    UI_TREE_CLASS.$setParent = function (parent) {
        var oldParent = this.getParent();

        UI_CONTROL_CLASS.$setParent.call(this, parent);

        if (oldParent instanceof UI_TREE) {
            remove(oldParent._aTree, this);
            UI_TREE_FLUSH(oldParent);
        }

        if (this._eItems) {
            insertAfter(this._eItems, this.getOuter());
        }
    };

    /**
     * 显示控件。
     * 显示树控件的同时需要将子树区域也显示。
     * @protected
     */
    UI_TREE_CLASS.$show = function () {
        UI_CONTROL_CLASS.$show.call(this);

        if (this._eItems && !this._bFold) {
            this._eItems.style.display = 'block';
        }

        for (var parent = this; parent = parent.getParent(); ) {
            parent.setFold(false);
        }
    };

    /**
     * 添加子树控件。
     * @public
     *
     * @param {string|ecui.ui.Tree} item 子树控件的 html 内容/树控件
     * @param {number} index 子树控件需要添加的位置序号，不指定将添加在最后
     * @param {Object} options 子树控件初始化选项
     * @return {ecui.ui.Tree} 树控件
     */
    UI_TREE_CLASS.add = function (item, index, options) {
        var list = this._aTree,
            o;

        if ('string' == typeof item) {
            o = createDom();
            o.innerHTML = item;
            item = UI_TREE_CREATE_CHILD(o, this, options);
        }

        if (o = list[index]) {
            o = o.getOuter();
        }
        else {
            index = list.length;
            o = null;
        }
        list.splice(index, 0, item);
        (this._eItems || UI_TREE_SETITEMS(this, createDom())).insertBefore(item.getOuter(), o);

        item.$setParent(this);
        UI_TREE_FLUSH(this);

        return item;
    };

    /**
     * 收缩当前树控件的所有子树控件。
     * collapse 方法将递归的调用子树控件的 collapse 方法。
     * @public
     */
    UI_TREE_CLASS.collapse = function () {
        UI_TREE_SET_FOLD(this);
    };

    /**
     * 展开当前树控件的所有子树控件。
     * expand 方法将递归的调用子树控件的 expand 方法。
     * @public
     */
    UI_TREE_CLASS.expand = function () {
        UI_TREE_SET_FOLD(this, false);
    };

    /**
     * 获取当前树控件的所有子树控件。
     * getTrees 方法返回使用 add 方法或 setParent 方法调用声明父子关系的树控件。
     * @public
     *
     * @return {Array} 树控件列表
     */
    UI_TREE_CLASS.getChildTrees = function () {
        return this._aTree.slice();
    };

    /**
     * 获取当前树控件的第一个子树控件。
     * @public
     *
     * @return {ecui.ui.Tree} 树控件，如果没有，返回 null
     */
    UI_TREE_CLASS.getFirst = function () {
        return this._aTree[0] || null;
    };

    /**
     * 获取当前树控件的最后一个子树控件。
     * @public
     *
     * @return {ecui.ui.Tree} 树控件，如果没有，返回 null
     */
    UI_TREE_CLASS.getLast = function () {
        return this._aTree[this._aTree.length - 1] || null;
    };

    /**
     * 获取当前树控件的后一个同级树控件。
     * @public
     *
     * @return {ecui.ui.Tree} 树控件，如果没有，返回 null
     */
    UI_TREE_CLASS.getNext = function () {
        var parent = this.getParent();
        return parent instanceof UI_TREE && parent._aTree[indexOf(parent._aTree, this) + 1] || null;
    };

    /**
     * 获取当前树控件的前一个同级树控件。
     * @public
     *
     * @return {ecui.ui.Tree} 树控件，如果没有，返回 null
     */
    UI_TREE_CLASS.getPrev = function () {
        var parent = this.getParent();
        return parent instanceof UI_TREE && parent._aTree[indexOf(parent._aTree, this) - 1] || null;
    };

    /**
     * 获取当前树控件的根。
     * @public
     *
     * @return {ecui.ui.Tree} 树控件的根
     */
    UI_TREE_CLASS.getRoot = function () {
        for (
            var o = this, parent;
            // 这里需要考虑Tree位于上一个Tree的节点内部
            (parent = o.getParent()) instanceof UI_TREE && indexOf(parent._aTree, o) >= 0;
            o = parent
        ) {};
        return o;
    };

    /**
     * 当前子控件区域是否显示/隐藏。
     * @public
     *
     * @return {boolean} true 表示子控件区域隐藏，false 表示子控件区域显示
     */
    UI_TREE_CLASS.isFold = function () {
        return !this._eItems || this._bFold;
    };

    /**
     * 显示/隐藏子控件区域。
     * setFold 方法将触发各级父树控件的 onchange 事件。
     * @public
     *
     * @param {boolean} status 如果为 false 表示显示子树控件，否则为隐藏子树控件
     */
    UI_TREE_CLASS.setFold = function (status) {
        if (this._eItems) {
            this._eItems.style.display = (this._bFold = status !== false) ? 'none' : 'block';
            UI_TREE_FLUSH(this);
        }
    };
//{/if}//
//{if 0}//
})();
//{/if}//