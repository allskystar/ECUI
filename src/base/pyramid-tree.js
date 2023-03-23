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
                if (!ul.classList.contains('ui-hide')) {
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
                    parent = el.parentElement;
                // 计算整个树的位置，将整个树移动到可见区域
                if (parent.firstElementChild === el) {
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
            _super(el, options);
            this._bReverse = !!options.reverse;
            if (options.reverse) {
                dom.addClass(el, 'ui-pyramid-tree-reverse');
            }
            el = el.firstElementChild;
            el.insertAdjacentHTML('afterEnd', '<div class="ui-pyramid-tree-floor ui-pyramid-tree-floor-0"><ul></ul></div>');
            this._aFloors = [el.nextSibling];
            this._uTree = core.$fastCreate(this.TreeView, el, this, Object.assign({}, core.getOptions(el), { root: this, floor: 0 }));
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
                    }

                    if (el.tagName === 'UL') {
                        initFloor(options.root, options.floor);
                    }

                    _super(el, options);

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
                        _super.$collapse();
                        refresh(this);
                        this.getChildren().forEach(function (item) {
                            item.collapse();
                        });
                    },

                    /**
                     * @override
                     */
                    $dispose: function () {
                        _super.$dispose();
                        this._aFloors = null;
                    },

                    /**
                     * @override
                     */
                    $expand: function () {
                        _super.$expand();
                        refresh(this);
                    },

                    /**
                     * @override
                     */
                    $hide: function () {
                        this.forEach(function (item) {
                            item.$hide();
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
                                        if (this.contains(node)) {
                                            list = [floor, node];
                                        }
                                    } else if (list[0] === floor) {
                                        if (this.contains(node)) {
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
                _super.$ready();
                refresh(this._uTree);
            }
        }
    );
})();
