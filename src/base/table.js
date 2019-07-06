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
/*ignore*/
/*
@fields
_nHeadFloat  - 表头飘浮的位置
_nHeadMargin - 表头距离表底的高度
_aHCells     - 表格头单元格控件对象
_aRows       - 表格数据行对象
_uHead       - 表头区域
_aElements   - 行控件属性，行的列Element对象，如果当前列需要向左合并为null，需要向上合并为false
_bMerge      - 行控件属性，是否在表格最后一列添加新列时自动合并
*/
/*end*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
//{/if}//
    /**
     * 在需要时初始化单元格控件。
     * 表格控件的单元格控件不是在初始阶段生成，而是在单元格控件第一次被调用时生成，参见核心的 getControl 方法。
     * @private
     *
     * @return {Function} 初始化单元格函数
     */
    function getControlBuilder() {
        // 获取单元格所属的行控件
        var row = dom.parent(this).getControl(),
            table = row.getParent();

        return core.$fastCreate(table.Cell, this, row, Object.assign({}, table.getHCell(row.$getElements().indexOf(this)).$getOptions()));
    };

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

            this._nHeadFloat = options.headFloat === undefined ? undefined : options.headFloat === true ? 0 : +options.headFloat;
/*ignore*/
            this._nHeadMargin = options.headMargin || 0;
/*end*/
            var i = 0,
                list = dom.children(table),
                head = list[0],
                body = list[1],
                headRowCount = 1,
                o = head,
                rowClass = ' ' + this.getUnitClass(ui.Table, 'row'),
                hcellClass = ' ' + this.getUnitClass(ui.Table, 'hcell'),
                cellClass = ' ' + this.getUnitClass(ui.Table, 'cell'),
                rows = this._aRows = [],
                cols = this._aHeadCells = [],
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

            ui.Control.call(this, el, options);

            o = '<div class="' + this.getUnitClass(ui.Table, 'body') + '"></div><div class="' + this.getUnitClass(ui.Table, 'head') + '"><table cellspacing="0" class="' + table.className + '" style="' + table.style.cssText + '"><tbody></tbody></table></div>';
            if (core.getScrollNarrow()) {
                dom.insertHTML(el, 'beforeEnd', '<div class="' + this.getUnitClass(ui.Table, 'layout') + '"><div class="' + this.getUnitClass(ui.Table, 'layout-body') + '"></div></div>' + o);
                o = el.lastChild;
                this._eLayout = o.previousSibling.previousSibling;
            } else {
                dom.insertHTML(el, 'beforeEnd', '<div class="' + this.getUnitClass(ui.Table, 'layout') + '">' + o + '</div>');
                this._eLayout = el.lastChild;
                o = this._eLayout.lastChild;
            }

            o.previousSibling.appendChild(table);
            // 初始化表格区域
            this.$setBody(body);
            (this._uHead = core.$fastCreate(ui.Control, o, this)).$setBody(head);

            // 以下初始化所有的行控件
            for (i = 0; o = list[i]; i++) {
                // list[i] 保存每一行的当前需要处理的列元素
                list[i] = dom.first(o);
                colspans[i] = 0;
                (rows[i] = core.$fastCreate(this.Row, o, this, core.getOptions(o)))._aElements = [];
            }

            for (j = 0;; j++) {
                for (i = 0; o = rows[i]; i++) {
                    if (colspans[i] > 0) {
                        colspans[i]--;
                    } else if (el = list[i]) {
                        if (o._aElements[j] === undefined) {
                            o._aElements[j] = el;
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
                                    rows[i + rowspan]._aElements.push(rowspan ? false : null);
                                }
                            }
                        }
                    } else {
                        // 当前行处理完毕，list[i]不再保存行内需要处理的下一个元素
                        for (j = 0;; j++) {
                            options = {};
                            for (i = 0; o = rows[i]; i++) {
                                el = o._aElements[j];
                                if (el === undefined) {
                                    this._aHeadRows = this._aRows.splice(0, headRowCount);
                                    return;
                                }
                                if (el) {
                                    if (i < headRowCount) {
                                        Object.assign(options, core.getOptions(el));
                                        cols[j] = core.$fastCreate(this.HCell, el, this);
                                    } else {
                                        el.getControl = getControlBuilder;
                                    }
                                }
                            }
                            cols[j]._oOptions = options;
                        }
                    }
                }
            }
        },
        {
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
                        ui.Control.prototype.$click.call(this, event);
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
                    /**
                     * 获取列的初始化参数。
                     * @protected
                     *
                     * @return {object} 列的初始化参数
                     */
                    $getOptions: function () {
                        return this._oOptions;
                    },

                    /**
                     * @override
                     */
                    $hide: function () {
                        ui.Control.prototype.$hide.call(this);
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
                            cols = table._aHeadCells,
                            index = cols.indexOf(this);

                        body.style[name] = value;

                        table._aHeadRows.concat(table._aRows).forEach(function (item) {
                            // 以下使用 body 表示列元素列表
                            body = item._aElements;
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
                        ui.Control.prototype.$show.call(this);
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
                        return parent.getCell(rowIndex, parent._aHeadCells.indexOf(this));
                    },

                    /**
                     * 获取全部单元格控件。
                     * @public
                     *
                     * @return {Array} 单元格控件数组
                     */
                    getCells: function () {
                        var result = [],
                            i = this.getParent()._aHeadCells.indexOf(this);
                        this._aRows.forEach(function (item, index) {
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
                function (el, options) {
                    ui.Control.call(this, el, options);
/*ignore*/
                    this._bMerge = !!options.merge;
/*end*/
                },
                {
                    /**
                     * @override
                     */
                    $click: function (event) {
                        ui.Control.prototype.$click.call(this, event);
                        event.row = this;
                        core.dispatchEvent(this.getParent(), 'rowclick', event);
                    },

                    /**
                     * @override
                     */
                    $dispose: function () {
                        this._aElements = null;
                        ui.Control.prototype.$dispose.call(this);
                    },

                    /**
                     * 获取一行内所有单元格的主元素。
                     * $getElement 方法返回的主元素数组可能包含 false/null 值，分别表示当前单元格被向上或者向左合并。
                     * @protected
                     *
                     * @return {Array} 主元素数组
                     */
                    $getElements: function () {
                        return this._aElements.slice();
                    },

                    /**
                     * @override
                     */
                    $hide: function () {
                        var table = this.getParent(),
                            index = table._aRows.indexOf(this),
                            nextRow = table._aRows[index + 1],
                            cell;

                        for (var i = 0, o; table._aHeadCells[i]; i++) {
                            o = this._aElements[i];
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
                                    cell = nextRow._aElements[j++];
                                    if (cell || cell === undefined) {
                                        break;
                                    }
                                }

                                o.getControl().$setParent(nextRow);
                                nextRow.getBody().insertBefore(o, cell || null);
                            }
                        }

                        ui.Control.prototype.$hide.call(this);
                    },

                    /**
                     * @override
                     */
                    $initStructure: function () {
                        for (var i = 0, list = this.getParent().getHCells(), el, item; item = list[i]; ) {
                            if ((el = this._aElements[i++]) && el !== item.getMain()) {
                                var width = item.getWidth() - item.getMinimumWidth();
                                while (this._aElements[i] === null) {
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
                        this._aElements.forEach(function (item) {
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
                            index = table._aRows.indexOf(this),
                            nextRow = table._aRows[index + 1],
                            cell;

                        for (var i = 0, o; table._aHeadCells[i]; i++) {
                            o = this._aElements[i];
                            if (o === false) {
                                o = table.$getElement(index - 1, i);
                                // 如果单元格向左被合并，cell == o
                                if (cell !== o) {
                                    o.setAttribute('rowSpan', +dom.getAttribute(o, 'rowSpan') + 1);
                                    cell = o;
                                }
                            } else if (o && nextRow && nextRow._aElements[i] === false) {
                                // 如果单元格包含rowSpan属性，需要从其它行恢复
                                o.setAttribute('rowSpan', +dom.getAttribute(o, 'rowSpan') + 1);
                                for (var j = i + 1;; ) {
                                    cell = this._aElements[j++];
                                    if (cell || cell === undefined) {
                                        break;
                                    }
                                }

                                o.getControl().$setParent(this);
                                this.getBody().insertBefore(o, cell || null);
                            }
                        }

                        ui.Control.prototype.$show.call(this);
                    },

                    /**
                     * 获取单元格控件。
                     * @public
                     *
                     * @param {number} colIndex 列序号，从0开始
                     * @return {ecui.ui.Table.Cell} 单元格控件
                     */
                    getCell: function (colIndex) {
                        return this._aElements[colIndex] ? this._aElements[colIndex].getControl() : null;
                    },

                    /**
                     * 获取全部单元格控件。
                     * @public
                     *
                     * @return {Array} 单元格控件数组
                     */
                    getCells: function () {
                        for (var i = this._aElements.length, result = []; i--; ) {
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
                        this._bMerge = flag;
                    },

                    /**
                     * @override
                     */
                    setSize: function (width, height) {
                        for (var i = this._aElements.length; i--; ) {
                            if (this._aElements[i]) {
                                this._aElements[i].getControl().$setSize(null, height);
                            }
                        }
                    }
                }
            ),

            /**
             * @override
             */
            $beforescroll: function (event) {
                ui.Control.prototype.$beforescroll.call(this, event);
/*ignore*/
                if (ieVersion < 7) {
                    return;
                }
/*end*/
                if (!(ieVersion < 9)) {
                    for (var el = this._uHead.getMain(); el !== document.body; el = dom.parent(el)) {
                        if (dom.getStyle(el, 'transform') !== 'none') {
                            return;
                        }
                    }
                }

                var style = this._uHead.getMain().style,
                    pos = dom.getPosition(this._eLayout),
                    view = util.getView(),
                    top = pos.top - view.top,
                    main = this.getMain();

                this.$$fixedTop = Math.min(this.getClientHeight() - this.$$paddingTop - this._nHeadMargin + top, Math.max(this._nHeadFloat || 0, top));

                if (this._nHeadFloat !== undefined) {
                    if (event.deltaY) {
                        if (this.isShow() && (this.$$fixedTop <= this._nHeadFloat || (dom.contain(main, event.target) && main.scrollHeight !== main.clientHeight))) {
                            if (this._UITable_oHandler) {
                                this._UITable_oHandler();
                                this._UITable_oHandler = null;
                            }
                            style.position = 'fixed';
                            style.top = this.$$fixedTop + 'px';
                            if (core.getScrollNarrow()) {
                                style.left = pos.left + 'px';
                            } else {
                                style.left = (pos.left - view.left - this._eLayout.scrollLeft) + 'px';
                                style.clip = 'rect(0px ' + (this._eLayout.scrollLeft + this.getClientWidth() - this.$$scrollFixed[0]) + 'px ' + this.$$paddingTop + 'px ' + this._eLayout.scrollLeft + 'px)';
                            }
                            return;
                        }
                    }
                    if (!this._UITable_oHandler) {
                        this._UITable_oHandler = util.timer(this.$headscroll, -1, this);
                    }
                }
            },

            /**
             * @override
             */
            $cache: function (style) {
                ui.Control.prototype.$cache.call(this, style);

                this.$$paddingTop = this._uHead.getBody().offsetHeight;

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
                this._eLayout = null;
                ui.Control.prototype.$dispose.call(this);
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
                    var rows = this._aHeadRows;
                    rowIndex += this._aHeadRows.length;
                } else {
                    rows = this._aRows;
                }

                var cols = rows[rowIndex] && rows[rowIndex]._aElements,
                    col = cols && cols[colIndex];

                if (!col) {
                    for (; col === false; col = (cols = rows[--rowIndex]._aElements)[colIndex]) {}
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
                    this._uHead.getMain().scrollLeft = this._eLayout.scrollLeft;
                    el.scrollLeft = this._eLayout.scrollLeft;
                    el.scrollTop = this._eLayout.scrollTop;
                }

                if (this._nHeadFloat !== undefined) {
                    var style = this._uHead.getMain().style;
                    style.position = '';
                    style.top = (Math.min(this.getClientHeight() - this.$$paddingTop - this._nHeadMargin, Math.max(0, this._nHeadFloat + util.getView().top - dom.getPosition(this.getMain()).top))) + 'px';
                    style.left = '0px';
                    if (!core.getScrollNarrow()) {
                        style.clip =/*ignore*/ ieVersion < 8 ? 'rect(0,100%,100%,0)' :/*end*/ 'auto';
                    }
                }
            },

            /**
             * @override
             */
            $initStructure: function (width, height) {
                ui.Control.prototype.$initStructure.call(this, width, height);

                this._aHeadCells.forEach(function (item) {
                    item.$setSize(item.getWidth());
                });
                this._aHeadRows.forEach(function (item) {
                    item.$initStructure();
                });
                this._aRows.forEach(function (item) {
                    item.$initStructure();
                });

                dom.insertBefore(this._uHead.getBody(), this._uHead.getMain().lastChild.lastChild);

                var narrow = core.getScrollNarrow(),
                    style = dom.parent(dom.parent(this.getBody())).style;

                if (narrow) {
                    this._eLayout.style.width = width + 'px';
                    this._eLayout.style.height = height + 'px';
                    this._eLayout.lastChild.style.width = this.$$tableWidth + 'px';
                    this._eLayout.lastChild.style.height = this.$$tableHeight + 'px';

                    style.top = this.$$paddingTop + 'px';
                    style.width = this._uHead.getMain().style.width = (width - (this.$$tableHeight > height || (this.$$tableHeight + narrow > height && this.$$tableWidth > width) ? narrow : 0)) + 'px';
                    style.height = (height - this.$$paddingTop - (this.$$tableWidth > width || (this.$$tableWidth + narrow > width && this.$$tableHeight > height) ? narrow : 0)) + 'px';
                } else {
                    style.marginTop = this.$$paddingTop + 'px';
                    style.width = this.$$tableWidth + 'px';
                    if (this.$$tableHeight > height) {
                        style.height = (height - this.$$paddingTop) + 'px';
                    }
                    if (this.getMain().style.height) {
                        this._eLayout.style.height = height + 'px';
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
                ui.Control.prototype.$mousewheel.call(this, event);

                var el = this._eLayout,
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
            $restoreStructure: function () {
                ui.Control.prototype.$restoreStructure.call(this);

                this._aHeadRows.forEach(function (item) {
                    item.$restoreStructure();
                });
                this._aRows.forEach(function (item) {
                    item.$restoreStructure();
                });
                this._aHeadCells.forEach(function (item) {
                    item.$restoreStructure();
                });

                dom.insertBefore(this._uHead.getBody(), this.getBody());

                var style = dom.parent(dom.parent(this.getBody())).style;

                if (core.getScrollNarrow()) {
                    this._eLayout.style.width = '';
                    this._eLayout.lastChild.style.width = '';
                    this._eLayout.lastChild.style.height = '';

                    style.top = '';
                } else {
                    style.marginTop = '';
                }

                style.width = '';
                style.height = '';
                this._eLayout.style.height = '';
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
                ui.Control.prototype.$scroll.call(this, event);
                if (this._UITable_oHandler) {
                    this._UITable_oHandler();
                    this._UITable_oHandler = null;
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
                var headRowCount = this._aHeadRows.length,
                    rows = this._aHeadRows.concat(this._aRows),
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

                if (!this._aHeadCells[index]) {
                    index = this._aHeadCells.length;
                }

                primary += ' ' + this.getUnitClass(ui.Table, 'cell');
                for (var i = 0, o; row = rows[i]; i++) {
                    o = row._aElements[index];
                    if ((o === undefined && row._bMerge) || o === null) {
                        o = null;
                        // 出现跨列的插入列操作，需要修正colspan的属性值
                        var cell = this.$getElement(i - headRowCount, index),
                            j = +dom.getAttribute(cell, 'rowSpan') || 1;

                        cell.setAttribute('colSpan', +dom.getAttribute(cell, 'colSpan') + 1);
                        row._aElements.splice(index, 0, o);
                        for (; --j; ) {
                            rows[++i]._aElements.splice(index, 0, false);
                        }
                    } else {
                        // 没有出现跨列的插入列操作
                        for (j = index; !o; ) {
                            o = row._aElements[++j];
                            if (o === undefined) {
                                break;
                            }
                        }
                        if (i < headRowCount) {
                            row._aElements.splice(index, 0, row.getBody().insertBefore(el, o));
                            el.setAttribute('rowSpan', headRowCount - i);
                            this._aHeadCells.splice(index, 0, col);
                            i = headRowCount - 1;
                        } else {
                            row._aElements.splice(
                                index,
                                0,
                                o = row.getBody().insertBefore(
                                    dom.create(
                                        'TD',
                                        {
                                            className: primary,
                                            getControl: getControlBuilder
                                        }
                                    ),
                                    o
                                )
                            );
                        }
                    }
                }

                col.setSize(options.width);
                col._oOptions = Object.assign({}, options);

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
                    row = this._aRows[index],
                    col;

                if (!row) {
                    index = this._aRows.length;
                }

                for (var i = 0; col = this._aHeadCells[i]; ) {
                    if ((row && row._aElements[i] === false) || data[i] === false) {
                        rowCols[i++] = false;
                    } else {
                        // 如果部分列被隐藏，colspan/width 需要动态计算
                        rowCols[i] = true;
                        html[j++] = '<td class="' + this.getUnitClass(ui.Table, 'cell') + '" style="';
                        for (var o = i, colspan = col.isShow() ? 1 : 0, width = col.getWidth() - col.getMinimumWidth(); (col = this._aHeadCells[++i]) && (data[i] === null || data[i] === undefined); ) {
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
                this._aRows.splice(index--, 0, row);

                // 以下使用 col 表示上一次执行了rowspan++操作的单元格，同一个单元格只需要增加一次
                for (i = 0, el = el.firstChild, col = null; this._aHeadCells[i]; i++) {
                    if (o = rowCols[i]) {
                        rowCols[i] = el;
                        el.getControl = getControlBuilder;
                        el = el.nextSibling;
                    } else if (o === false) {
                        o = this.$getElement(index, i);
                        if (o !== col) {
                            o.setAttribute('rowSpan', (+dom.getAttribute(o, 'rowSpan') || 1) + 1);
                            col = o;
                        }
                    }
                }

                row._aElements = rowCols;
                return row;
            },

            /**
             * @override
             */
            cache: function (force) {
                this._aHeadCells.forEach(function (item) {
                    item.cache(force);
                });
                ui.Control.prototype.cache.call(this, force);
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
                rowIndex = this._aRows[rowIndex];
                return (rowIndex && rowIndex.getCell(colIndex)) || null;
            },

            /**
             * 获取表格列的数量。
             * @public
             *
             * @return {number} 表格列的数量
             */
            getColumnCount: function () {
                return this._aHeadCells.length;
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
                return this._aHeadCells[index] || null;
            },

            /**
             * 获取全部的表头单元格控件。
             * @public
             *
             * @return {Array} 表头单元格控件数组
             */
            getHCells: function () {
                return this._aHeadCells.slice();
            },

            /**
             * 获取头部的行控件。
             * @public
             *
             * @return {Array} 头部的行控件列表
             */
            getHeadRows: function () {
                return this._aHeadRows;
            },

            /**
             * 获取全部的表头行控件。
             * @public
             *
             * @return {Array} 表头行控件数组
             */
            getHRows: function () {
                return this._aHeadRows.slice();
            },

            /**
             * 获取定位的 DOM 元素。
             * @public
             *
             * @return {HTMLElement} 定位的 DOM 元素
             */
            getLayout: function () {
                return this._eLayout;
            },

            /**
             * 获取行控件。
             * @public
             *
             * @param {number} index 行数，从0开始
             * @return {ecui.ui.Table.Row} 行控件
             */
            getRow: function (index) {
                return this._aRows[index] || null;
            },

            /**
             * 获取表格行的数量。
             * @public
             *
             * @return {number} 表格行的数量
             */
            getRowCount: function () {
                return this._aRows.length;
            },

            /**
             * 获取全部的行控件。
             * @public
             *
             * @return {Array} 行控件列表
             */
            getRows: function () {
                return this._aRows.slice();
            },

            /**
             * 移除全部的行。
             * @public
             *
             * @param {number} index 列序号，从0开始计数
             */
            removeAll: function () {
                for (var i = this._aRows.length; i--; ) {
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
                var cols = this._aHeadCells,
                    col = cols[index];

                if (col) {
                    col.hide();

                    dom.remove(col.getMain());
                    core.dispose(col);
                    cols.splice(index, 1);

                    this._aRows.forEach(
                        function (item) {
                            cols = item._aElements;
                            if (item = cols[index]) {
                                if (cols[index + 1] === null) {
                                    // 如果是被合并的列，需要保留
                                    cols.splice(index + 1, 1);
                                } else {
                                    dom.remove(item);
                                    if (item.getControl !== getControlBuilder) {
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
                    row = this._aRows[index],
                    rowNext = this._aRows[index + 1],
                    body = row.getBody(),
                    o;

                if (row) {
                    row.hide();
                    for (; this._aHeadCells[i]; i++) {
                        if (o = row._aElements[i]) {
                            if (dom.parent(o) !== body) {
                                rowNext._aElements[i] = o;
                                for (; row._aElements[++i] === null; ) {
                                    rowNext._aElements[i] = null;
                                }
                                i--;
                            }
                        }
                    }

                    dom.remove(row.getMain());
                    core.dispose(row);
                    this._aRows.splice(index, 1);

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
                this._nHeadFloat = value;
            }
        }
    );
}());
