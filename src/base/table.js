/*
@example
<!-- 如果需要滚动条，请设置div的width/height以及table的width样式，其中table的width如果大于div的width将出现横向滚动条，如果table的高度大于div的height将出现纵向滚动条 -->
<div ui="type:table">
    <table>
    <!-- 表头区域 -->
    <thead>
        <tr>
            <th style="width:200px;">公司名</th>
            <th style="width:200px;">url</th>
            <th style="width:250px;">地址</th>
            <th style="width:100px;">创办时间</th>
        </tr>
    </thead>
    <!-- 内容行区域 -->
    <tbody>
        <tr>
            <td>百度</td>
            <td>www.baidu.com</td>
            <td>中国北京中关村</td>
            <td>1999</td>
        </tr>
    </tbody>
    </table>
</div>
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
//{/if}//
    /**
     * 表格控件。
     * 对基本的 TableElement 功能进行了扩展，表头固定，不会随表格的垂直滚动条滚动而滚动，在行列滚动时，支持整行整列移动，允许直接对表格的数据进行增加/删除/修改操作。表格控件针对有滚动条的鼠标设备和无滚动条的触控设备进行了不同的处理。
     * options 属性：
     * head-float     表头允许飘浮，默认不允许
     * @control
     */
    ui.Table = core.inherits(
        ui.Control,
        'ui-table',
        function (el, options) {
            if (el.tagName === 'TABLE') {
                var table = el;
                el = dom.insertBefore(
                    dom.create(
                        {
                            className: table.className,
                            style: {
                                width: options.width,
                                height: options.height
                            }
                        }
                    ),
                    table
                );
                table.className = '';
            } else {
                table = el.getElementsByTagName('TABLE')[0];
            }

            var i = 0,
                list = dom.children(table),
                head = list[0],
                body = list[1],
                headRowCount = 1,
                o = head,
                rowClass = ' ' + this.getUnitClass(ui.Table, 'row'),
                hcellClass = ' ' + this.getUnitClass(ui.Table, 'hcell'),
                cellClass = ' ' + this.getUnitClass(ui.Table, 'cell'),
                rows = this.rows = [],
                cols = this.hcells = [],
                colspans = [];

            table.setAttribute('cellSpacing', '0');

            if (head.tagName !== 'THEAD') {
                body = head;
                dom.insertBefore(head = dom.create('THEAD'), o).appendChild((list = dom.children(o))[0]);
            } else {
                o = dom.children(head);
                headRowCount = o.length;
                list = o.concat(dom.children(list[1]));
            }

            // 以下初始化所有的行控件
            for (; o = list[i++]; ) {
                o.className += rowClass;
                for (var j = 0, colList = dom.children(o); o = colList[j++]; ) {
                    o.className += i <= headRowCount ? hcellClass : cellClass;
                }
            }

            _super(el, options);

            o = '<div class="' + this.getUnitClass(ui.Table, 'body') + '"></div><div class="' + this.getUnitClass(ui.Table, 'head') + '"><table cellspacing="0" class="' + table.className + '" style="' + table.style.cssText + '"><tbody></tbody></table></div>';
            if (core.getScrollNarrow()) {
                dom.insertHTML(el, 'beforeEnd', '<div class="' + this.getUnitClass(ui.Table, 'layout') + '"><div class="' + this.getUnitClass(ui.Table, 'layout-body') + '"></div></div>' + o);
                o = el.lastChild;
                this.layout = o.previousSibling.previousSibling;
            } else {
                dom.insertHTML(el, 'beforeEnd', '<div class="' + this.getUnitClass(ui.Table, 'layout') + '">' + o + '</div>');
                this.layout = el.lastChild;
                o = this.layout.lastChild;
            }

            o.previousSibling.appendChild(table);
            // 初始化表格区域
            this.$setBody(body);
            (this.$Head = core.$fastCreate(ui.Control, o, this)).$setBody(head);

            // 以下初始化所有的行控件
            for (i = 0; o = list[i]; i++) {
                // list[i] 保存每一行的当前需要处理的列元素
                list[i] = dom.first(o);
                colspans[i] = 0;
                (rows[i] = core.$fastCreate(this.Row, o, this, core.getOptions(o))).elements = [];
            }

            for (j = 0;; j++) {
                for (i = 0; o = rows[i]; i++) {
                    if (colspans[i] > 0) {
                        colspans[i]--;
                    } else if (el = list[i]) {
                        if (o.elements[j] === undefined) {
                            o.elements[j] = el;
                            // 当前元素处理完成，将list[i]指向下一个列元素
                            list[i] = dom.next(el);

                            var rowspan = +dom.getAttribute(el, 'rowSpan') || 1,
                                colspan = +dom.getAttribute(el, 'colSpan') || 1;

                            colspans[i] = colspan - 1;

                            while (rowspan--) {
                                if (rowspan) {
                                    colspans[i + rowspan] += colspan;
                                } else {
                                    colspan--;
                                }
                                for (o = colspan; o--; ) {
                                    rows[i + rowspan].elements.push(rowspan ? false : null);
                                }
                            }
                        }
                    } else {
                        // 当前行处理完毕，list[i]不再保存行内需要处理的下一个元素
                        for (j = 0;; j++) {
                            options = {};
                            for (i = 0; o = rows[i]; i++) {
                                el = o.elements[j];
                                if (el === undefined) {
                                    this.headRows = this.rows.splice(0, headRowCount);
                                    return;
                                }
                                if (el) {
                                    if (i < headRowCount) {
                                        Object.assign(options, core.getOptions(el));
                                        cols[j] = core.$fastCreate(this.HCell, el, this);
                                    } else {
                                        el.getControl = getControlIfNeeded;
                                    }
                                }
                            }
                            cols[j].options = options;
                        }
                    }
                }
            }
        },
        {
            DEFAULT_OPTIONS: {
                headFloat: function (value) {
                    return value === undefined ? undefined : value === true ? 0 : +value;
                },
                headMargin: Number(0)
            },

            private: {
                rows: undefined,
                layout: undefined,
                row: undefined,
                hcells: undefined,
                headRows: undefined,
                handler: undefined
            },

            final: {
                $Head: undefined
            },

            static: {
                /**
                 * 初始化单元格。
                 * @private
                 *
                 * @return {ecui.ui.Table.Cell} 单元格控件
                 */
                _getControlIfNeeded: function () {
                    // 获取单元格所属的行控件
                    var row = dom.parent(this).getControl(),
                        table = row.getParent();

                    return core.$fastCreate(table.Cell, this, row, Object.assign({}, table.getHCell(row.elements.indexOf(this)).options));
                }
            },

            /**
             * 单元格部件。
             * @unit
             */
            Cell: core.inherits(
                ui.Control,
                'ui-table-cell',
                {
                    /**
                     * @override
                     */
                    $click: function (event) {
                        _super.$click(event);
                        event.cell = this;
                        core.dispatchEvent(this.getParent().getParent(), 'cellclick', event);
                    },

                    /**
                     * @override
                     */
                    getHeight: function () {
                        return this.getMain().offsetHeight;
                    },

                    /**
                     * @override
                     */
                    getWidth: function () {
                        return this.getMain().offsetWidth;
                    }
                }
            ),

            /**
             * 列部件。
             * @unit
             */
            HCell: core.inherits(
                ui.Control,
                'ui-table-hcell',
                {
                    private: {
                        options: undefined
                    },

                    /**
                     * @override
                     */
                    $hide: function () {
                        _super.$hide();
                        this.$setStyles('display', 'none');
                    },

                    /**
                     * 设置整列的样式。
                     * $setStyles 方法批量设置一列所有单元格的样式。
                     * @protected
                     *
                     * @param {string} name 样式的名称
                     * @param {string} value 样式的值
                     * @param {number} widthRevise 改变样式后表格宽度的变化，如果省略表示没有变化
                     */
                    $setStyles: function (name, value) {
                        var table = this.getParent(),
                            body = this.getMain(),
                            cols = table.getHCells(),
                            index = cols.indexOf(this);

                        body.style[name] = value;

                        table.headRows.concat(table.rows).forEach(function (item) {
                            // 以下使用 body 表示列元素列表
                            body = item.elements;
                            item = body[index];
                            if (item) {
                                item.style[name] = value;
                            }
                            if (item !== false) {
                                for (var i = index; !(item = body[i]); i--) {}

                                var width = -cols[i].getMinimumWidth(),
                                    colspan = 0;

                                do {
                                    if (!cols[i].getMain().style.display) {
                                        width += cols[i].getWidth();
                                        colspan++;
                                    }
                                } while (body[++i] === null);

                                if (width > 0) {
                                    item.style.display = '';
                                    item.style.width = width + 'px';
                                    item.setAttribute('colSpan', colspan);
                                } else {
                                    item.style.display = 'none';
                                }
                            }
                        });
                    },

                    /**
                     * @override
                     */
                    $show: function () {
                        _super.$show();
                        this.$setStyles('display', '');
                    },

                    /**
                     * 获取单元格控件。
                     * @public
                     *
                     * @param {number} rowIndex 行序号，从0开始
                     * @return {ecui.ui.Table.Cell} 单元格控件
                     */
                    getCell: function (rowIndex) {
                        var parent = this.getParent();
                        return parent.getCell(rowIndex, parent.getHCells().indexOf(this));
                    },

                    /**
                     * 获取全部单元格控件。
                     * @public
                     *
                     * @return {Array} 单元格控件数组
                     */
                    getCells: function () {
                        var result = [],
                            i = this.getParent().getHCells().indexOf(this);
                        this.rows.forEach(function (item, index) {
                            result[index] = item.getCell(i);
                        });
                        return result;
                    },

                    /**
                     * @override
                     */
                    setSize: function (width) {
                        // 首先对列表头控件设置宽度，否则在计算合并单元格时宽度可能错误
                        this.$setSize(width);
                        this.$setStyles('width', (width - this.$getBasicWidth()) + 'px');
                    }
                }
            ),

            /**
             * 行部件。
             * @unit
             */
            Row: core.inherits(
                ui.Control,
                {
                    DEFAULT_OPTIONS: {
                        merge: Boolean(false)
                    },

                    private: {
                        elements: undefined
                    },

                    /**
                     * @override
                     */
                    $click: function (event) {
                        _super.$click(event);
                        event.row = this;
                        core.dispatchEvent(this.getParent(), 'rowclick', event);
                    },

                    /**
                     * @override
                     */
                    $dispose: function () {
                        this.elements = null;
                        _super.$dispose();
                    },

                    /**
                     * 获取一行内所有单元格的主元素。
                     * $getElement 方法返回的主元素数组可能包含 false/null 值，分别表示当前单元格被向上或者向左合并。
                     * @protected
                     *
                     * @return {Array} 主元素数组
                     */
                    $getElements: function () {
                        return this.elements.slice();
                    },

                    /**
                     * @override
                     */
                    $hide: function () {
                        var table = this.getParent(),
                            index = table.rows.indexOf(this),
                            nextRow = table.rows[index + 1],
                            cell;

                        for (var i = 0, o; table.getHCell(i); i++) {
                            o = this.elements[i];
                            if (o === false) {
                                o = table.$getElement(index - 1, i);
                                // 如果单元格向左被合并，cell == o
                                if (cell !== o) {
                                    o.setAttribute('rowSpan', +dom.getAttribute(o, 'rowSpan') - 1);
                                    cell = o;
                                }
                            } else if (o && (j = +dom.getAttribute(o, 'rowSpan')) > 1) {
                                // 如果单元格包含rowSpan属性，需要将属性添加到其它行去
                                o.setAttribute('rowSpan', j - 1);
                                for (var j = i + 1;; ) {
                                    cell = nextRow.elements[j++];
                                    if (cell || cell === undefined) {
                                        break;
                                    }
                                }

                                o.getControl().$setParent(nextRow);
                                nextRow.getBody().insertBefore(o, cell || null);
                            }
                        }

                        _super.$hide();
                    },

                    /**
                     * @override
                     */
                    $initStructure: function () {
                        for (var i = 0, list = this.getParent().getHCells(), el, item; item = list[i]; ) {
                            if ((el = this.elements[i++]) && el !== item.getMain()) {
                                var width = item.getWidth() - item.getMinimumWidth();
                                while (this.elements[i] === null) {
                                    width += list[i++].getWidth();
                                }
                                el.style.width = width + 'px';
                            }
                        }
                    },

                    /**
                     * @override
                     */
                    $restoreStructure: function () {
                        this.elements.forEach(function (item) {
                            if (item) {
                                item.style.width = '';
                            }
                        });
                    },

                    /**
                     * @override
                     */
                    $show: function () {
                        var table = this.getParent(),
                            index = table.rows.indexOf(this),
                            nextRow = table.rows[index + 1],
                            cell;

                        for (var i = 0, o; table.getHCell(i); i++) {
                            o = this.elements[i];
                            if (o === false) {
                                o = table.$getElement(index - 1, i);
                                // 如果单元格向左被合并，cell == o
                                if (cell !== o) {
                                    o.setAttribute('rowSpan', +dom.getAttribute(o, 'rowSpan') + 1);
                                    cell = o;
                                }
                            } else if (o && nextRow && nextRow.elements[i] === false) {
                                // 如果单元格包含rowSpan属性，需要从其它行恢复
                                o.setAttribute('rowSpan', +dom.getAttribute(o, 'rowSpan') + 1);
                                for (var j = i + 1;; ) {
                                    cell = this.elements[j++];
                                    if (cell || cell === undefined) {
                                        break;
                                    }
                                }

                                o.getControl().$setParent(this);
                                this.getBody().insertBefore(o, cell || null);
                            }
                        }

                        _super.$show();
                    },

                    /**
                     * 获取单元格控件。
                     * @public
                     *
                     * @param {number} colIndex 列序号，从0开始
                     * @return {ecui.ui.Table.Cell} 单元格控件
                     */
                    getCell: function (colIndex) {
                        return this.elements[colIndex] ? this.elements[colIndex].getControl() : null;
                    },

                    /**
                     * 获取全部单元格控件。
                     * @public
                     *
                     * @return {Array} 单元格控件数组
                     */
                    getCells: function () {
                        for (var i = this.elements.length, result = []; i--; ) {
                            result[i] = this.getCell(i);
                        }
                        return result;
                    },

                    /**
                     * 设置单元格尾部合并属性。
                     * @public
                     *
                     * @param {boolean} flag 单元格尾部是否需要合并(针对新增的列)
                     */
                    setMerge: function (flag) {
                        this.merge = flag;
                    },

                    /**
                     * @override
                     */
                    setSize: function (width, height) {
                        for (var i = this.elements.length; i--; ) {
                            if (this.elements[i]) {
                                this.elements[i].getControl().$setSize(null, height);
                            }
                        }
                    }
                }
            ),

            /**
             * @override
             */
            $beforescroll: function (event) {
                _super.$beforescroll(event);
                // if (ieVersion < 7) {
                //     return;
                // }

                if (!(ieVersion < 9)) {
                    for (var el = this.$Head.getMain(); el !== document.body; el = dom.parent(el)) {
                        if (dom.getStyle(el, 'transform') !== 'none') {
                            return;
                        }
                    }
                }

                var style = this.$Head.getMain().style,
                    pos = dom.getPosition(this.layout),
                    view = util.getView(),
                    top = pos.top - view.top,
                    main = this.getMain();

                this.$$fixedTop = Math.min(this.getClientHeight() - this.$$paddingTop - this.headMargin + top, Math.max(this.headFloat || 0, top));

                if (this.headFloat !== undefined) {
                    if (event.deltaY) {
                        if (this.isShow() && (this.$$fixedTop <= this.headFloat || (dom.contain(main, event.target) && main.scrollHeight !== main.clientHeight))) {
                            if (this.handler) {
                                this.handler();
                                this.handler = null;
                            }
                            style.position = 'fixed';
                            style.top = this.$$fixedTop + 'px';
                            if (core.getScrollNarrow()) {
                                style.left = pos.left + 'px';
                            } else {
                                style.left = (pos.left - view.left - this.layout.scrollLeft) + 'px';
                                style.clip = 'rect(0px ' + (this.layout.scrollLeft + this.getClientWidth() - this.$$scrollFixed[0]) + 'px ' + this.$$paddingTop + 'px ' + this.layout.scrollLeft + 'px)';
                            }
                            return;
                        }
                    }
                    if (!this.handler) {
                        this.handler = util.timer(this.$headscroll, -1, this);
                    }
                }
            },

            /**
             * @override
             */
            $cache: function (style) {
                _super.$cache(style);

                this.$$paddingTop = this.$Head.getBody().offsetHeight;

                var table = dom.parent(this.getBody());
                this.$$tableWidth = table.offsetWidth;
                this.$$tableHeight = table.offsetHeight;

                if (!this.getClientHeight()) {
                    this.$$height = this.getMinimumHeight() + this.$$tableHeight + (this.$$tableWidth > this.getClientWidth() ? core.getScrollNarrow() : 0);
                }
            },

            /**
             * 单元格点击事件。
             * @event
             */
            $cellclick: util.blank,

            /**
             * @override
             */
            $dispose: function () {
                this.layout = null;
                _super.$dispose();
            },

            /**
             * 获取单元格主元素。
             * $getElement 方法在合法的行列序号内一定会返回一个 Element 对象，如果当前单元格被合并，将返回合并后的 Element 对象。
             * @protected
             *
             * @param {number} rowIndex 单元格的行数，从0开始
             * @param {number} colIndex 单元格的列数，从0开始
             * @return {HTMLElement} 单元格主元素对象
             */
            $getElement: function (rowIndex, colIndex) {
                if (rowIndex < 0) {
                    var rows = this.headRows;
                    rowIndex += this.headRows.length;
                } else {
                    rows = this.rows;
                }

                var cols = rows[rowIndex] && rows[rowIndex].elements,
                    col = cols && cols[colIndex];

                if (!col) {
                    for (; col === false; col = (cols = rows[--rowIndex].elements)[colIndex]) {}
                    for (; !col; col = cols[--colIndex]) {}
                }
                return col;
            },

            /**
             * 头部滚动处理。
             * @protected
             */
            $headscroll: function () {
                if (core.getScrollNarrow()) {
                    var el = dom.parent(dom.parent(this.getBody()));
                    this.$Head.getMain().scrollLeft = this.layout.scrollLeft;
                    el.scrollLeft = this.layout.scrollLeft;
                    el.scrollTop = this.layout.scrollTop;
                }

                if (this.headFloat !== undefined) {
                    var style = this.$Head.getMain().style;
                    style.position = '';
                    style.top = (Math.min(this.getClientHeight() - this.$$paddingTop - this.headMargin, Math.max(0, this.headFloat + util.getView().top - dom.getPosition(this.getMain()).top))) + 'px';
                    style.left = '0px';
                    if (!core.getScrollNarrow()) {
                        style.clip = ieVersion < 8 ? 'rect(0,100%,100%,0)' : 'auto';
                    }
                }
            },

            /**
             * @override
             */
            $initStructure: function (width, height) {
                _super.$initStructure(width, height);

                this.hcells.forEach(function (item) {
                    item.$setSize(item.getWidth());
                });
                this.headRows.forEach(function (item) {
                    item.$initStructure();
                });
                this.rows.forEach(function (item) {
                    item.$initStructure();
                });

                dom.insertBefore(this.$Head.getBody(), this.$Head.getMain().lastChild.lastChild);

                var narrow = core.getScrollNarrow(),
                    style = dom.parent(dom.parent(this.getBody())).style;

                if (narrow) {
                    this.layout.style.width = width + 'px';
                    this.layout.style.height = height + 'px';
                    this.layout.lastChild.style.width = this.$$tableWidth + 'px';
                    this.layout.lastChild.style.height = this.$$tableHeight + 'px';

                    style.top = this.$$paddingTop + 'px';
                    style.width = this.$Head.getMain().style.width = (width - (this.$$tableHeight > height || (this.$$tableHeight + narrow > height && this.$$tableWidth > width) ? narrow : 0)) + 'px';
                    style.height = (height - this.$$paddingTop - (this.$$tableWidth > width || (this.$$tableWidth + narrow > width && this.$$tableHeight > height) ? narrow : 0)) + 'px';
                } else {
                    style.marginTop = this.$$paddingTop + 'px';
                    style.width = this.$$tableWidth + 'px';
                    if (this.$$tableHeight > height) {
                        style.height = (height - this.$$paddingTop) + 'px';
                    }
                    if (this.getMain().style.height) {
                        this.layout.style.height = height + 'px';
                    }
                }

                this.$$scrollFixed = [
                    this.$$tableHeight - (this.$$tableWidth > width ? narrow : 0) > height ? narrow : 0,
                    this.$$tableWidth - (this.$$tableHeight > height ? narrow : 0) > width ? narrow : 0
                ];

                util.timer(this.$scroll, 0, this);
            },

            /**
             * @override
             */
            $mousewheel: function (event) {
                _super.$mousewheel(event);

                var el = this.layout,
                    left = Math.min(el.scrollWidth - el.clientWidth, Math.max(0, el.scrollLeft + event.deltaX)),
                    top = Math.min(el.scrollHeight - el.clientHeight, Math.max(0, el.scrollTop + event.deltaY));

                if (el.scrollLeft !== left || el.scrollTop !== top) {
                    el.scrollLeft = left;
                    el.scrollTop = top;
                    event.preventDefault();
                }
            },

            /**
             * @override
             */
            $restoreStructure: function (event) {
                _super.$restoreStructure(event);

                this.headRows.forEach(function (item) {
                    item.$restoreStructure();
                });
                this.rows.forEach(function (item) {
                    item.$restoreStructure();
                });
                this.hcells.forEach(function (item) {
                    item.$restoreStructure();
                });

                dom.insertBefore(this.$Head.getBody(), this.getBody());

                var style = dom.parent(dom.parent(this.getBody())).style;

                if (core.getScrollNarrow()) {
                    this.layout.style.width = '';
                    this.layout.lastChild.style.width = '';
                    this.layout.lastChild.style.height = '';

                    style.top = '';
                } else {
                    style.marginTop = '';
                }

                style.width = '';
                style.height = '';
                this.layout.style.height = '';
            },

            /**
             * 行点击事件。
             * @event
             */
            $rowclick: util.blank,

            /**
             * @override
             */
            $scroll: function (event) {
                _super.$scroll(event);
                if (this.handler) {
                    this.handler();
                    this.handler = null;
                }
                this.$headscroll();
            },

            /**
             * 增加一列。
             * options 对象对象支持的属性如下：
             * width   {number} 列的宽度
             * primary {string} 列的基本样式
             * title   {string} 列的标题
             * @public
             *
             * @param {object} options 列的初始化选项
             * @param {number} index 被添加的列的位置序号，如果不合法将添加在末尾
             * @return {ecui.ui.Table.HCell} 表头单元格控件
             */
            addColumn: function (options, index) {
                var headRowCount = this.headRows.length,
                    rows = this.headRows.concat(this.rows),
                    primary = options.primary || '',
                    el = dom.create(
                        'TH',
                        {
                            className: primary + ' ' + this.getUnitClass(ui.Table, 'hcell'),
                            innerHTML: options.title
                        }
                    ),
                    col = core.$fastCreate(this.HCell, el, this),
                    row;

                if (!this.hcells[index]) {
                    index = this.hcells.length;
                }

                primary += ' ' + this.getUnitClass(ui.Table, 'cell');
                for (var i = 0, o; row = rows[i]; i++) {
                    o = row.elements[index];
                    if ((o === undefined && row.merge) || o === null) {
                        o = null;
                        // 出现跨列的插入列操作，需要修正colspan的属性值
                        var cell = this.$getElement(i - headRowCount, index),
                            j = +dom.getAttribute(cell, 'rowSpan') || 1;

                        cell.setAttribute('colSpan', +dom.getAttribute(cell, 'colSpan') + 1);
                        row.elements.splice(index, 0, o);
                        for (; --j; ) {
                            rows[++i].elements.splice(index, 0, false);
                        }
                    } else {
                        // 没有出现跨列的插入列操作
                        for (j = index; !o; ) {
                            o = row.elements[++j];
                            if (o === undefined) {
                                break;
                            }
                        }
                        if (i < headRowCount) {
                            row.elements.splice(index, 0, row.getBody().insertBefore(el, o));
                            el.setAttribute('rowSpan', headRowCount - i);
                            this.hcells.splice(index, 0, col);
                            i = headRowCount - 1;
                        } else {
                            row.elements.splice(
                                index,
                                0,
                                o = row.getBody().insertBefore(
                                    dom.create(
                                        'TD',
                                        {
                                            className: primary,
                                            getControl: getControlIfNeeded
                                        }
                                    ),
                                    o
                                )
                            );
                        }
                    }
                }

                col.setSize(options.width);
                col.options = Object.assign({}, options);

                return col;
            },

            /**
             * 增加一行。
             * @public
             *
             * @param {Array} data 数据源(一维数组)
             * @param {number} index 被添加的行的位置序号，如果不合法将添加在最后
             * @return {ecui.ui.Table.Row} 行控件
             */
            addRow: function (data, index) {
                var j = 1,
                    body = this.getBody(),
                    html = ['<table><tbody><tr class="' + this.getUnitClass(ui.Table, 'row') + '">'],
                    rowCols = [],
                    row = this.rows[index],
                    col;

                if (!row) {
                    index = this.rows.length;
                }

                for (var i = 0; col = this.hcells[i]; ) {
                    if ((row && row.elements[i] === false) || data[i] === false) {
                        rowCols[i++] = false;
                    } else {
                        // 如果部分列被隐藏，colspan/width 需要动态计算
                        rowCols[i] = true;
                        html[j++] = '<td class="' + this.getUnitClass(ui.Table, 'cell') + '" style="';
                        for (var o = i, colspan = col.isShow() ? 1 : 0, width = col.getWidth() - col.getMinimumWidth(); (col = this.hcells[++i]) && (data[i] === null || data[i] === undefined); ) {
                            rowCols[i] = null;
                            if (col.isShow()) {
                                colspan++;
                                width += col.getWidth();
                            }
                        }
                        rowCols[o] = true;
                        html[j++] = (colspan ? 'width:' + width + 'px" colSpan="' + colspan : 'display:none') + '">' + (data[o] || '') + '</td>';
                    }
                }

                html[j] = '</tr></tbody></table>';
                var el = dom.create(
                        {
                            innerHTML: html.join('')
                        }
                    ).lastChild.lastChild.lastChild;

                body.insertBefore(el, row ? row.getMain() : null);
                row = core.$fastCreate(this.Row, el, this);
                this.rows.splice(index--, 0, row);

                // 以下使用 col 表示上一次执行了rowspan++操作的单元格，同一个单元格只需要增加一次
                for (i = 0, el = el.firstChild, col = null; this.hcells[i]; i++) {
                    if (o = rowCols[i]) {
                        rowCols[i] = el;
                        el.getControl = getControlIfNeeded;
                        el = el.nextSibling;
                    } else if (o === false) {
                        o = this.$getElement(index, i);
                        if (o !== col) {
                            o.setAttribute('rowSpan', (+dom.getAttribute(o, 'rowSpan') || 1) + 1);
                            col = o;
                        }
                    }
                }

                row.elements = rowCols;
                return row;
            },

            /**
             * @override
             */
            cache: function (force) {
                this.hcells.forEach(function (item) {
                    item.cache(force);
                });
                _super.cache(force);
            },

            /**
             * 获取单元格控件。
             * @public
             *
             * @param {number} rowIndex 行序号，从0开始
             * @param {number} colIndex 列序号，从0开始
             * @return {ecui.ui.Table.Cell} 单元格控件
             */
            getCell: function (rowIndex, colIndex) {
                rowIndex = this.rows[rowIndex];
                return (rowIndex && rowIndex.getCell(colIndex)) || null;
            },

            /**
             * 获取表格列的数量。
             * @public
             *
             * @return {number} 表格列的数量
             */
            getColumnCount: function () {
                return this.hcells.length;
            },

            /**
             * 获取表头单元格控件。
             * 表头单元格控件提供了一些针对整列进行操作的方法，包括 hide、setSize(仅能设置宽度) 与 show 方法等。
             * @public
             *
             * @param {number} index 列序号，从0开始
             * @return {ecui.ui.Table.HCell} 表头单元格控件
             */
            getHCell: function (index) {
                return this.hcells[index] || null;
            },

            /**
             * 获取全部的表头单元格控件。
             * @public
             *
             * @return {Array} 表头单元格控件数组
             */
            getHCells: function () {
                return this.hcells.slice();
            },

            /**
             * 获取头部的行控件。
             * @public
             *
             * @return {Array} 头部的行控件列表
             */
            getHeadRows: function () {
                return this.headRows;
            },

            /**
             * 获取全部的表头行控件。
             * @public
             *
             * @return {Array} 表头行控件数组
             */
            getHRows: function () {
                return this.headRows.slice();
            },

            /**
             * 获取定位的 DOM 元素。
             * @public
             *
             * @return {HTMLElement} 定位的 DOM 元素
             */
            getLayout: function () {
                return this.layout;
            },

            /**
             * 获取行控件。
             * @public
             *
             * @param {number} index 行数，从0开始
             * @return {ecui.ui.Table.Row} 行控件
             */
            getRow: function (index) {
                return this.rows[index] || null;
            },

            /**
             * 获取表格行的数量。
             * @public
             *
             * @return {number} 表格行的数量
             */
            getRowCount: function () {
                return this.rows.length;
            },

            /**
             * 获取全部的行控件。
             * @public
             *
             * @return {Array} 行控件列表
             */
            getRows: function () {
                return this.rows.slice();
            },

            /**
             * 移除全部的行。
             * @public
             *
             * @param {number} index 列序号，从0开始计数
             */
            removeAll: function () {
                for (var i = this.rows.length; i--; ) {
                    this.removeRow(i);
                }
            },

            /**
             * 移除一列并释放占用的空间。
             * @public
             *
             * @param {number} index 列序号，从0开始计数
             */
            removeColumn: function (index) {
                var cols = this.hcells,
                    col = cols[index];

                if (col) {
                    col.hide();

                    dom.remove(col.getMain());
                    core.dispose(col);
                    cols.splice(index, 1);

                    this.rows.forEach(
                        function (item) {
                            cols = item.elements;
                            if (item = cols[index]) {
                                if (cols[index + 1] === null) {
                                    // 如果是被合并的列，需要保留
                                    cols.splice(index + 1, 1);
                                } else {
                                    dom.remove(item);
                                    if (item.getControl !== getControlIfNeeded) {
                                        core.dispose(item.getControl());
                                    }
                                    cols.splice(index, 1);
                                }
                            } else {
                                cols.splice(index, 1);
                            }
                        },
                        this
                    );
                }
            },

            /**
             * 移除一行并释放占用的空间。
             * @public
             *
             * @param {number} index 行序号，从0开始计数
             * @return {ui.Table.Row} 被删除的行控件，如果不存在返回undefined
             */
            removeRow: function (index) {
                var i = 0,
                    row = this.rows[index],
                    rowNext = this.rows[index + 1],
                    body = row.getBody(),
                    o;

                if (row) {
                    row.hide();
                    for (; this.hcells[i]; i++) {
                        if (o = row.elements[i]) {
                            if (dom.parent(o) !== body) {
                                rowNext.elements[i] = o;
                                for (; row.elements[++i] === null; ) {
                                    rowNext.elements[i] = null;
                                }
                                i--;
                            }
                        }
                    }

                    dom.remove(row.getMain());
                    core.dispose(row);
                    this.rows.splice(index, 1);

                    return row;
                }
            },

            /**
             * 设置表头飘浮的位置。
             * @public
             *
             * @param {number|undefine} value 表头漂浮的位置
             */
            setHeadFloat: function (value) {
                this.headFloat = value;
            }
        }
    );

    var getControlIfNeeded = ui.Table._getControlIfNeeded;
    delete ui.Table._getControlIfNeeded;
}());
