//{if $css}//
__ControlStyle__('\
.ui-pyramid-tree {\
    position: relative;\
    text-align: left;\
    font-size: 0;\
    white-space: nowrap;\
\
    ul,\
    li {\
        position: relative;\
        display: inline-block;\
        vertical-align: top;\
        white-space: nowrap;\
    }\
    ul {\
        padding: 30px 0px;\
    }\
    ul:before {\
        content: " ";\
        position: absolute;\
        top: 0;\
        left: 0;\
        height: 1px;\
        width: 100%;\
    }\
    li:first-child:last-child:after,\
    li:before {\
        content: " ";\
        position: absolute;\
        top: -30px;\
        left: 0;\
        width: 100%;\
        height: 1px;\
        z-index: 1;\
    }\
    li:first-child:before {\
        width: 50%;\
        z-index: 2;\
    }\
    li:last-child:before {\
        width: calc(~"50% - 1px");\
        right: 0;\
        left: unset;\
        z-index: 2;\
    }\
    li:first-child:last-child:after {\
        width: calc(~"50% - 1px");\
        right: 0;\
        z-index: 2;\
    }\
}\
.ui-pyramid-tree-reverse {\
\
    ul,\
    li {\
        vertical-align: bottom;\
    }\
    li:before {\
        bottom: -30px;\
        top: unset;\
    }\
\
    li:first-child:last-child:after {\
        bottom: -30px;\
        top: unset;\
    }\
    .ui-pyramid-tree-floor-0 {\
        .tree-item:before {\
            display: block;\
        }\
        .tree-item:after {\
            display: none;\
        }\
    }\
    .tree-item:before {\
        top: -31px;\
    }\
    .tree-item:after {\
        bottom: -31px;\
    }\
\
    ul:before {\
        top: unset;\
        bottom: 0;\
    }\
}\
');
//{/if}//


/*
@example
<div ui="type:pyramid-tree">
    <ul ui="collapsed:false">
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
</div>

@fields
_bReverse - 金字塔是否翻转
_nPos     - 节点临时的位置，以根节点为0
_aFloors  - 层元素的数组
*/
(function () {
//{if 0}//
    var core = ecui,
        ui = ecui.ui,
        dom = ecui.dom;
//{/if}//
    function refresh(tree) {
        var root = tree.getRoot(),
            nodes = [];

        root._nPos = 0;

        for (var floor = 0, minPos = 0;; floor++) {
            var hasExpand = false,
                lastNode = null;

            nodes[floor] = [];
            
            dom.children(root.getParent()._aFloors[floor]).forEach(function (ul) {
                if (!dom.hasClass(ul, 'ui-hide')) {
                    for (var i = 0, list = dom.children(ul), li; li = list[i]; i++) {
                        nodes[floor].push(li.getControl());
                    }
                }
            });
            
            nodes[floor].forEach(function (currNode) {
                if (lastNode) {
                    // 如果子节点重叠，需要向右移动
                    var offset = lastNode._nPos + lastNode.getWidth() - currNode._nPos;
                    if (offset > 0) {
                        currNode._nPos += offset;
                    }
                } else {
                    minPos = Math.min(minPos, currNode._nPos);
                }
                lastNode = currNode;

                if (!currNode.isCollapsed()) {
                    var children = currNode.getChildren();
                    // 计算子节点的pos值，相对于父节点居中对齐

                    offset = currNode._nPos - (children.reduce(function (sum, item) { return sum + item.getWidth(); }, 0) - currNode.getWidth()) / 2;

                    children.forEach(function (item) {
                        item._nPos = offset;
                        offset += item.getWidth()
                    });
                    hasExpand = true;
                }
            });
            if (!hasExpand) {
                break;
            }
        }

        for (var maxFloor = floor; floor; floor--) {
            lastNode = null;

            // eslint-disable-next-line no-loop-func
            nodes[floor].forEach(function (currNode) {
                if (!currNode.isCollapsed()) {
                    var children = currNode.getChildren(),
                        first = children[0],
                        last = children[children.length - 1];
                    currNode._nPos = first._nPos + (last._nPos + last.getWidth() - first._nPos - currNode.getWidth()) / 2;
                }

                if (lastNode) {
                    var offset = lastNode._nPos + lastNode.getWidth() - currNode._nPos;
                    if (offset > 0) {
                        // 如果结点移动后还出现重叠，需要整体带子树一起右移
                        currNode.forEach(function (item) {
                            item._nPos += offset;
                        });
                    }
                }

                lastNode = currNode;
            });
        }

        for (; floor <= maxFloor; floor++) {
            // eslint-disable-next-line no-redeclare
            var lastNode = null;

            // eslint-disable-next-line no-loop-func
            nodes[floor].forEach(function (currNode) {
                var el = currNode.getMain(),
                    parent = dom.parent(el);
                // 计算整个树的位置，将整个树移动到可见区域
                if (dom.first(parent) === el) {
                    el = parent;
                }
                el.style.marginLeft = currNode._nPos - (lastNode ? lastNode._nPos + lastNode.getWidth() : minPos) + 'px';
                lastNode = currNode;
            });
        }
    }

    function initFloor(pyramid, floor) {
        if (!pyramid._aFloors[floor]) {
            pyramid._aFloors[floor] = dom.create({className: 'ui-pyramid-tree-floor ui-pyramid-tree-floor-' + floor});
            dom[pyramid._bReverse ? 'insertBefore' : 'insertAfter'](pyramid._aFloors[floor], pyramid._aFloors[floor - 1]);
        }
    }

    /**
     * 金字塔控件。
     * options 属性：
     * reverse      是否为倒金字塔s
     * @control
     */
    ui.PyramidTree = core.inherits(
        ui.Control,
        'ui-pyramid-tree',
        function (el, options) {
            ui.Control.call(this, el, options);
            this._bReverse = !!options.reverse;
            if (options.reverse) {
                dom.addClass(el, 'ui-pyramid-tree-reverse');
            }
            el = dom.first(el);
            this._uTree = core.$fastCreate(this.TreeView, el, this, Object.assign({}, core.getOptions(el)));
        },
        {
            /**
             * 金字塔控件的树部件。
             * @control
             */
            TreeView: core.inherits(
                ui.TreeView,
                function (el, options) {
                    if (options.root) {
                        options.floor++;
                    } else {
                        options.root = core.findControl(dom.parent(el));
                        dom.insertHTML(el, 'afterEnd', '<div class="ui-pyramid-tree-floor ui-pyramid-tree-floor-0"><ul></ul></div>');
                        options.root._aFloors = [el.nextSibling];
                        options.floor = 1;
                    }

                    if (el.tagName === 'UL') {
                        initFloor(options.root, options.floor);
                    }

                    ui.TreeView.call(this, el, options);

                    if (options.floor === 1) {
                        options.root._aFloors[0].lastChild.appendChild(this.getMain());
                    }
                    if (this.getContainer()) {
                        options.root._aFloors[options.floor].appendChild(this.getContainer());
                    }
                    options.floor--;
                },
                {
                    /**
                     * @override
                     */
                    $collapse: function () {
                        ui.TreeView.prototype.$collapse.call(this);
                        refresh(this);
                        this.getChildren().forEach(function (item) {
                            item.collapse();
                        });
                    },

                    /**
                     * @override
                     */
                    $dispose: function () {
                        ui.TreeView.prototype.$dispose.call(this);
                        this._aFloors = null;
                    },

                    /**
                     * @override
                     */
                    $expand: function () {
                        ui.TreeView.prototype.$expand.call(this);
                        refresh(this);
                    },

                    /**
                     * @override
                     */
                    $hide: function () {
                        this.forEach(function (item) {
                            ui.TreeView.prototype.$hide.call(item);
                        });
                    },

                    /**
                     * @override
                     */
                    $insertContainer: function () {
                        function clear(node) {
                            var parent = pyramid._aFloors[list.splice(0, 1)[0] + 1];
                            list.forEach(function (item) {
                                if ((item = item.getContainer())) {
                                    parent.insertBefore(item, node);
                                }
                            });
                            list = undefined;
                        }

                        if (this.isReady()) {
                            var root = this.getRoot(),
                                pyramid = root.getParent(),
                                list;
                            if (pyramid && pyramid instanceof ui.PyramidTree) {
                                // 不在金字塔树节点上的节点不处理
                                root.forEach(function (node, floor) {
                                    if (list === undefined) {
                                        // 找到当前层的第一个节点
                                        if (this.contain(node)) {
                                            list = [floor, node];
                                        }
                                    } else if (list[0] === floor) {
                                        if (this.contain(node)) {
                                            // 找到当前层的所有节点
                                            list.push(node);
                                        } else if ((node = node.getContainer())) {
                                            // 将当前层的所有节点插入指定的位置
                                            clear(node);
                                        }
                                    } else {
                                        // 当前层到末尾也没有找到合适的位置，直接插入尾部
                                        initFloor(pyramid, floor);
                                        clear(null);
                                    }
                                }, this);

                                if (list) {
                                    // 当前层到末尾也没有找到合适的位置，直接插入尾部
                                    initFloor(pyramid, list[0] + 1);
                                    clear(null);
                                }
                            }
                        }
                    }
                }
            ),

            /**
             * @override
             */
            $ready: function () {
                ui.Control.prototype.$ready.call(this);
                refresh(this._uTree);
            }
        }
    );
})();
