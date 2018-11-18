/*
@example
<!-- 如果需要滚动条，请设置div的width样式到合适的值，并且在div外部再包一个div显示滚动条 -->
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

@fields
_bHeadFloat  - 表头飘浮
_aHCells     - 表格头单元格控件对象
_aRows       - 表格数据行对象
_uHead       - 表头区域
_aElements   - 行控件属性，行的列Element对象，如果当前列需要向左合并为null，需要向上合并为false
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        firefoxVersion = /firefox\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined,
        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined,

        eventNames = ['mousedown', 'mouseover', 'mousemove', 'mouseout', 'mouseup', 'click', 'dblclick', 'focus', 'blur', 'activate', 'deactivate'];
//{/if}//
    /**
     * 初始化单元格。
     * @private
     *
     * @return {ecui.ui.Table.Cell} 单元格控件
     */
    function initCell() {
        this.getControl = null;
        return createCell(this);
    }

    /**
     * 建立单元格控件。
     * @private
     *
     * @param {HTMLElement} main 单元格控件主元素
     * @return {ecui.ui.Table.Cell} 单元格控件
     */
    function createCell(main) {
        // 获取单元格所属的行控件
        var row = dom.parent(main).getControl(),
            table = row.getParent();

        return core.$fastCreate(table.Cell, main, row, Object.assign({}, table._aHCells[row._aElements.indexOf(main)]._oOptions));
    }

    /**
     * 表格控件初始化一行。
     * @private
     *
     * @param {ecui.ui.Table} table 表格控件
     * @param {ecui.ui.Table.Row} row 行控件
     */
    function initRow(table, row) {
        for (var i = 0, list = table._aHCells, el, item; item = list[i]; ) {
            if ((el = row._aElements[i++]) && el !== item.getMain()) {
                var width = item.getWidth() - item.getMinimumWidth();
                while (row._aElements[i] === null) {
                    width += list[i++].getWidth();
                }
                el.style.width = width + 'px';
            }
        }
    }

    /**
     * 表格控件恢复一行。
     * @private
     *
     * @param {ecui.ui.Table.Row} row 行控件
     */
    function resizeRow(row) {
        row._aElements.forEach(function (item) {
            item.style.width = '';
        });
    }

    /**
     * 在需要时初始化单元格控件。
     * 表格控件的单元格控件不是在初始阶段生成，而是在单元格控件第一次被调用时生成，参见核心的 getControl 方法。
     * @private
     *
     * @return {Function} 初始化单元格函数
     */
    var getControlBuilder = ieVersion === 8 ? function () {
            // 为了防止写入getControl属性而导致的reflow如此处理
            var control;
            return function () {
                return (control = control || createCell(this));
            };
        } : function () {
            return initCell;
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

            this._bHeadFloat = options.headFloat;

            el.appendChild(
                this._eLayout = dom.create(
                    {
                        className: options.classes.join('-layout '),
                        innerHTML: '<div class="ui-table-layout-body"></div><div class="ui-table-body"></div><div class="ui-table-head"><table cellspacing="0" class="' + table.className + '" style="' + table.style.cssText + '"><tbody></tbody></table></div>'
                    }
                )
            );
            this._eLayout.lastChild.previousSibling.appendChild(table);

            var i = 0,
                list = dom.children(table),
                head = list[0],
                body = list[1],
                headRowCount = 1,
                o = head,
                rowClass = this._sRowClass = ' ' + options.classes.join('-row '),
                hcellClass = this._sHCellClass = ' ' + options.classes.join('-hcell '),
                cellClass = this._sCellClass = ' ' + options.classes.join('-cell '),
                rows = this._aRows = [],
                cols = this._aHCells = [],
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

            // 初始化表格区域
            this.$setBody(body);
            (this._uHead = core.$fastCreate(ui.Control, this._eLayout.lastChild, this)).$setBody(head);

            if (core.getScrollNarrow()) {
                el.appendChild(this._eLayout.lastChild);
                el.appendChild(this._eLayout.lastChild);
            } else {
                dom.remove(this._eLayout.firstChild);
            }

            // 以下初始化所有的行控件
            for (i = 0; o = list[i]; i++) {
                // list[i] 保存每一行的当前需要处理的列元素
                list[i] = dom.first(o);
                colspans[i] = 0;
                (rows[i] = core.$fastCreate(this.Row, o, this))._aElements = [];
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
                                        el.getControl = getControlBuilder();
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
                    getHeight: function () {
                        return this.getOuter().offsetHeight;
                    },

                    /**
                     * @override
                     */
                    getWidth: function () {
                        return this.getOuter().offsetWidth;
                    }
                }
            ),

            /**
             * 列部件。
             * @unit
             */
            HCell: core.inherits(
                ui.Control,
                {
                    /**
                     * @override
                     */
                    $hide: function () {
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
                            cols = table._aHCells,
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
                                    if (!cols[i].getOuter().style.display) {
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
                        return this.getParent().getCell(rowIndex, this._aHCells.indexOf(this));
                    },

                    /**
                     * 获取全部单元格控件。
                     * @public
                     *
                     * @return {Array} 单元格控件数组
                     */
                    getCells: function () {
                        var result = [],
                            i = this._aHCells.indexOf(this);
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
                {
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

                        for (var i = 0, o; table._aHCells[i]; i++) {
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
                    $show: function () {
                        var table = this.getParent(),
                            index = table._aRows.indexOf(this),
                            nextRow = table._aRows[index + 1],
                            cell;

                        for (var i = 0, o; table._aHCells[i]; i++) {
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
                if (firefoxVersion || ieVersion < 7) {
                    return;
                }
                if (this._bHeadFloat !== undefined && Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
                    var style = this._uHead.getOuter().style,
                        pos = dom.getPosition(this._eLayout),
                        view = util.getView(),
                        top = pos.top - view.top,
                        left = pos.left - view.left - this._eLayout.scrollLeft;

                    top = Math.min(this.getClientHeight() - this.$$paddingTop + top, Math.max(0, top));
                    if (!top || dom.contain(this.getMain(), event.target)) {
                        style.position = 'fixed';
                        style.top = top + 'px';
                        style.left = left + 'px';
                        style.clip = 'rect(0px ' + (this._eLayout.scrollLeft + this.getClientWidth() - this.$$scrollFixed[0]) + 'px ' + this.$$paddingTop + 'px ' + this._eLayout.scrollLeft + 'px)';
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
            },

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
                var rows = this._aRows,
                    cols = rows[rowIndex] && rows[rowIndex]._aElements,
                    col = cols && cols[colIndex];

                if (col === undefined) {
                    col = null;
                } else if (!col) {
                    for (; col === false; col = (cols = rows[--rowIndex]._aElements)[colIndex]) {}
                    for (; !col; col = cols[--colIndex]) {}
                }
                return col;
            },

            /**
             * @override
             */
            $initStructure: function (width, height) {
                ui.Control.prototype.$initStructure.call(this, width, height);

                this._aHCells.forEach(function (item) {
                    item.$setSize(item.getWidth());
                });
                this._aHeadRows.forEach(function (item) {
                    initRow(this, item);
                }, this);
                this._aRows.forEach(function (item) {
                    initRow(this, item);
                }, this);

                dom.insertBefore(this._uHead.getBody(), this._uHead.getMain().lastChild.lastChild);

                var narrow = core.getScrollNarrow();
                if (narrow) {
                    this._eLayout.style.width = width + 'px';
                    this._eLayout.style.height = height + 'px';
                    this._eLayout.lastChild.style.width = this.$$tableWidth + 'px';
                    this._eLayout.lastChild.style.height = this.$$tableHeight + 'px';

                    if (this.$$tableHeight > height || (this.$$tableHeight + narrow > height && this.$$tableWidth > width)) {
                        this._uHead.getMain().style.width = (width - narrow) + 'px';
                        dom.parent(dom.parent(this.getBody())).style.width = (width - narrow) + 'px';
                    }
                } else {
                    var el = dom.parent(dom.parent(this.getBody()));
                    el.style.marginTop = this.$$paddingTop + 'px';
                    el.style.width = this.$$tableWidth + 'px';
                    if (this.$$tableHeight > height) {
                        el.style.height = (height - this.$$paddingTop) + 'px';
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
            $resize: function (event) {
                ui.Control.prototype.$resize.call(this, event);

                this._aHeadRows.forEach(function (item) {
                    resizeRow(item);
                });
                this._aRows.forEach(function (item) {
                    resizeRow(item);
                });
                this._aHCells.forEach(function (item) {
                    item.$resize();
                });

                dom.insertBefore(this._uHead.getBody(), this.getBody());

                if (core.getScrollNarrow()) {
                    var el = dom.parent(dom.parent(this.getBody()));
                    el.style.marginTop = '';
                    el.style.width = '';
                    el.style.height = '';
                    this._eLayout.style.height = '';
                }
            },

            /**
             * @override
             */
            $scroll: function (event) {
                ui.Control.prototype.$scroll.call(this, event);

                if (core.getScrollNarrow()) {
                    var style = dom.parent(dom.parent(this.getBody())).style;
                    this._uHead.getOuter().style.left = -this._eLayout.scrollLeft + 'px';
                    style.top = -(this._eLayout.scrollTop - this.$$paddingTop) + 'px';
                    style.left = -this._eLayout.scrollLeft + 'px';
                }

                if (this._bHeadFloat !== undefined) {
                    style = this._uHead.getOuter().style;
                    style.position = '';
                    style.top = (Math.min(this.getClientHeight() - this.$$paddingTop, Math.max(0, util.getView().top - dom.getPosition(this.getOuter()).top)) + this._eLayout.scrollTop) + 'px';
                    style.left = '0px';
                    style.clip = ieVersion < 8 ? 'rect(0,100%,100%,0)' : 'auto';
                }
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
                            className: primary + this._sHCellClass,
                            innerHTML: options.title
                        }
                    ),
                    col = core.$fastCreate(this.HCell, el, this),
                    row;

                primary += this._sCellClass;
                for (var i = 0, o; row = rows[i]; i++) {
                    o = row._aElements[index];
                    if (o !== null) {
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
                            this._aHCells.splice(index, 0, col);
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
                                            getControl: getControlBuilder()
                                        }
                                    ),
                                    o
                                )
                            );
                        }
                    } else {
                        // 出现跨列的插入列操作，需要修正colspan的属性值
                        var cell = this.$getElement(i - headRowCount, index),
                            j = +dom.getAttribute(cell, 'rowSpan') || 1;

                        cell.setAttribute('colSpan', +dom.getAttribute(cell, 'colSpan') + 1);
                        row._aElements.splice(index, 0, o);
                        for (; --j; ) {
                            rows[++i]._aElements.splice(index, 0, false);
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
                    html = ['<table><tbody><tr class="' + this._sRowClass + '">'],
                    rowCols = [],
                    row = this._aRows[index],
                    col;

                if (!row) {
                    index = this._aRows.length;
                }

                for (var i = 0; col = this._aHCells[i]; ) {
                    if ((row && row._aElements[i] === false) || data[i] === false) {
                        rowCols[i++] = false;
                    } else {
                        // 如果部分列被隐藏，colspan/width 需要动态计算
                        rowCols[i] = true;
                        html[j++] = '<td class="' + this._sCellClass + '" style="';
                        for (var o = i, colspan = col.isShow() ? 1 : 0, width = col.getWidth() - col.getMinimumWidth(); (col = this._aHCells[++i]) && data[i] === null; ) {
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

                body.insertBefore(el, row ? row.getOuter() : null);
                row = core.$fastCreate(this.Row, el, this);
                this._aRows.splice(index--, 0, row);

                // 以下使用 col 表示上一次执行了rowspan++操作的单元格，同一个单元格只需要增加一次
                for (i = 0, el = el.firstChild, col = null; this._aHCells[i]; i++) {
                    if (o = rowCols[i]) {
                        rowCols[i] = el;
                        el.getControl = getControlBuilder();
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
                this._aHCells.forEach(function (item) {
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
                return this._aHCells.length;
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
                return this._aHCells[index] || null;
            },

            /**
             * 获取全部的表头单元格控件。
             * @public
             *
             * @return {Array} 表头单元格控件数组
             */
            getHCells: function () {
                return this._aHCells.slice();
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
                var cols = this._aHCells,
                    col = cols[index];

                if (col) {
                    col.hide();

                    dom.remove(col.getOuter());
                    core.dispose(col);
                    cols.splice(index, 1);

                    this._aRows.forEach(function (item) {
                        cols = item._aElements;
                        if (item = cols[index]) {
                            if (cols[index + 1] === null) {
                                // 如果是被合并的列，需要保留
                                cols.splice(index + 1, 1);
                            } else {
                                dom.remove(item);
                                if (item.getControl !== getControlBuilder()) {
                                    core.dispose(item.getControl());
                                }
                                cols.splice(index, 1);
                            }
                        } else {
                            cols.splice(index, 1);
                        }
                    });
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
                    for (; this._aHCells[i]; i++) {
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

                    dom.remove(row.getOuter());
                    core.dispose(row);
                    this._aRows.splice(index, 1);

                    return row;
                }
            }
        }
    );

    // 初始化事件转发信息
    eventNames.slice(0, 7).forEach(function (item) {
        var type = item.replace('mouse', '');

        item = '$' + item;

        ui.Table.prototype.Row.prototype[item] = function (event) {
            ui.Control.prototype[item].call(this, event);
            event.row = this;
            core.dispatchEvent(this.getParent(), 'row' + type, event);
        };

        ui.Table.prototype.Cell.prototype[item] = function (event) {
            ui.Control.prototype[item].call(this, event);
            event.cell = this;
            core.dispatchEvent(this.getParent().getParent(), 'cell' + type, event);
        };
    });
}());
