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
*/
/*ignore*/
/*
@fields
_aFloors - 层元素的数组
_nPos    - 节点临时的位置，以根节点为0
*/
/*end*/
(function () {
//{if 0}//
    var core = ecui,
        util = core.util,
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
            var lastNode = null;

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
            if (options.reverse) {
                dom.addClass(el, 'ui-pyramid-tree-reverse');
            }
            el = dom.first(el);
            this._uTree = core.$fastCreate(this.TreeView, el, this, Object.assign({}, core.getOptions(el), {reverse: options.reverse}));
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
                        dom.insertHTML(el, 'afterEnd', '<div class="ui-pyramid-tree-floor ui-pyramid-tree-floor-0"><ul></ul></div>')
                        options.root._aFloors = [el.nextSibling];
                        options.floor = 1;
                    }

                    if (!options.root._aFloors[options.floor] && el.tagName === 'UL') {
                        options.root._aFloors[options.floor] = dom.create({className: 'ui-pyramid-tree-floor ui-pyramid-tree-floor-' + options.floor});
                        dom[options.reverse ? 'insertBefore' : 'insertAfter'](options.root._aFloors[options.floor], options.root._aFloors[options.floor - 1]);
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
                        })
                    },

                    /**
                     * @override
                     */
                    $insertContainer: function () {
                        if (this.isReady()) {
                            for (var control = this, floor = 0, parent;; control = parent) {
                                parent = control.getParent();
                                if (parent instanceof ui.PyramidTree) {
                                    break;
                                }
                                floor++;
                            }
                            if (floor > 1) {
                                parent = this.getParent();
                                var index = 0;
                                parent.getChildren().forEach(function (item) {
                                    if (this === item) {
                                        control._aFloors[floor].insertBefore(this.getContainer(), dom.children(control._aFloors[floor])[index]);
                                    } else if (item.getContainer()) {
                                        index++;
                                    }
                                }, this);
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
}());
