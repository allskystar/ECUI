/*
Table - 定义由行列构成的表格的基本操作。
表格控件，继承自截面控件，内部包含一个部件——标题区(基础控件)。表格控件对基本的 TableElement 功能进行了扩展，表头固定，
不会随表格的垂直滚动条滚动而滚动，在行列滚动时，支持整行整列移动，允许直接对表格的数据进行增加/删除/修改操作。

表格控件直接HTML初始化的例子:
<div ecui="type:table">
    <table>
        <!-- 当前节点的列定义，如果有特殊格式，需要使用width样式 -->
        <thead>
            <tr>
                <th>标题</th>
                ...
            </tr>
        </thead>
        <tbody>
            <!-- 这里放单元格序列 -->
            <tr>
                <td>单元格一</td>
                ...
            </tr>
            ...
        </tbody>
    </table>
</div>

属性
_aCols        - 表头的列控件对象
_aRows        - 表格数据行对象
_uHead       - 表头区域

表头列属性
$cache$pos   - 列的坐标

行属性
$cache$pos   - 行的坐标
_aCols        - 行的列Element对象，如果当前列需要向左合并为null，需要向上合并为false
*/
//{if 0}//
(function () {

    var core = ecui,
        array = core.array,
        dom = core.dom,
        string = core.string,
        ui = core.ui,
        util = core.util,

        DOCUMENT = document,
        MATH = Math,
        REGEXP = RegExp,
        MAX = MATH.max,
        MIN = MATH.min,

        USER_AGENT = navigator.userAgent,
        ieVersion = /msie (\d+\.\d)/i.test(USER_AGENT) ? DOCUMENT.documentMode || (REGEXP.$1 - 0) : undefined,

        indexOf = array.indexOf,
        children = dom.children,
        createDom = dom.create,
        first = dom.first,
        getParent = dom.getParent,
        insertBefore = dom.insertBefore,
        last = dom.last,
        next = dom.next,
        removeDom = dom.remove,
        trim = string.trim,
        findConstructor = util.findConstructor,
        inherits = util.inherits,
        toNumber = util.toNumber,

        $fastCreate = core.$fastCreate,
        disposeControl = core.dispose,

        eventNames = [
            'mousedown', 'mouseover', 'mousemove', 'mouseout', 'mouseup',
            'click', 'focus', 'blur', 'activate', 'deactivate',
            'keydown', 'keypress', 'keyup', 'mousewheel'
        ];

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_SCROLLBAR_CLASS = ui.Scrollbar.prototype,
        UI_VSCROLLBAR = ui.VScrollbar,
        UI_PANEL = ui.Panel,
        UI_PANEL_CLASS = UI_PANEL.prototype;
//{/if}//
//{if $phase == "define"}//
    //__gzip_original__UI_TABLE
    //__gzip_original__UI_TABLE_ROW
    //__gzip_original__UI_TABLE_COL
    //__gzip_original__UI_TABLE_CELL
    /**
     * 初始化表格控件。
     * @public
     *
     * @param {Object} options 初始化选项
     */
    var UI_TABLE = ui.Table =
        inheritsControl(
            UI_PANEL,
            'ui-table',
            function (el, options) {
                var i = 0,
                    type = this.getType(),
                    rowClass = findConstructor(this, 'Row'),
                    hcellClass = findConstructor(this, 'HCell'),
                    cellClass = findConstructor(this, 'Cell'),
                    rows = this._aRows = [],
                    cols = this._aCols = [],
                    tableEl = el.getElementsByTagName('table')[0],
                    list = children(tableEl),
                    head = list[0],
                    headRowCount = 1,
                    j,
                    o;

                if (head.tagName != 'THEAD') {
                    insertBefore(head = createDom('', '', 'thead'), list[0])
                        .appendChild((list = children(list[0]))[0]);
                }
                else {
                    j = children(list[0]);
                    headRowCount = j.length;
                    list = j.concat(children(list[1]));
                }

                tableEl.setAttribute('cellSpacing', '0');

                // 设置滚动条操作
                if (o = this.$getSection('VScrollbar')) {
                    o.setValue = UI_TABLE_SCROLL_SETVALUE;
                }
                if (o = this.$getSection('HScrollbar')) {
                    o.setValue = UI_TABLE_SCROLL_SETVALUE;
                }

                // 初始化表头区域
                o = createDom(type + '-head' + UI_CONTROL.TYPES, 'position:absolute;top:0px;overflow:hidden');
                o.innerHTML =
                    '<div style="white-space:nowrap;position:absolute"><table cellspacing="0"><tbody>' +
                        '</tbody></table></div>';
                (this._uHead = $fastCreate(UI_CONTROL, this.getMain().appendChild(o), this)).$setBody(head);

                // 以下初始化所有的行控件
                for (; o = list[i]; i++) {
                    o.className = trim(o.className) + rowClass.TYPES;
                    // list[i] 保存每一行的当前需要处理的列元素
                    list[i] = first(o);
                    (rows[i] = $fastCreate(rowClass, o, this))._aCols = [];
                }

                for (j = 0; ; j++) {
                    for (i = 0; o = rows[i]; i++) {
                        if (el = list[i]) {
                            if (o._aCols[j] === undefined) {
                                o._aCols[j] = el;
                                // 当前元素处理完成，将list[i]指向下一个列元素
                                list[i] = next(el);

                                var rowspan = toNumber(el.getAttribute('rowSpan')) || 1,
                                    colspan = toNumber(el.getAttribute('colSpan')) || 1;

                                while (rowspan--) {
                                    if (!rowspan) {
                                        colspan--;
                                    }
                                    for (o = colspan; o--; ) {
                                        rows[i + rowspan]._aCols.push(rowspan ? false : null);
                                    }
                                }
                            }
                        }
                        else {
                            for (j = 0; ; j++) {
                                for (i = 0; o = rows[i]; i++) {
                                    el = o._aCols[j];
                                    if (el === undefined) {
                                        this._aHeadRows = this._aRows.splice(0, headRowCount);
                                        return;
                                    }
                                    else if (el) {
                                        if (i < headRowCount) {
                                            el.className = trim(el.className) + hcellClass.TYPES;
                                            cols[j] = $fastCreate(hcellClass, el, this);
                                        }
                                        else {
                                            el.className = trim(el.className) + cellClass.TYPES;
                                            el.getControl =
                                                ieVersion == 8 ?
                                                    UI_TABLE_INIT_GETCONTROL() : UI_TABLE_INIT_GETCONTROL;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            function (el, options) {
                options.wheelDelta = 1;
            }
        ),
        UI_TABLE_CLASS = UI_TABLE.prototype,

        /**
         * 初始化表格控件的行部件。
         * @public
         *
         * @param {Object} options 初始化选项
         */
        UI_TABLE_ROW_CLASS = (UI_TABLE.Row = inheritsControl(UI_CONTROL, 'ui-table-row')).prototype,

        /**
         * 初始化表格控件的列部件。
         * @public
         *
         * @param {Object} options 初始化选项
         */
        UI_TABLE_HCELL_CLASS = (UI_TABLE.HCell = inheritsControl(UI_CONTROL, 'ui-table-hcell')).prototype,

        /**
         * 初始化表格控件的单元格部件。
         * @public
         *
         * @param {Object} options 初始化选项
         */
        UI_TABLE_CELL_CLASS = (UI_TABLE.Cell = inheritsControl(UI_CONTROL, 'ui-table-cell')).prototype,

        /**
         * 在需要时初始化单元格控件。
         * 表格控件的单元格控件不是在初始阶段生成，而是在单元格控件第一次被调用时生成，参见核心的 getControl 方法。
         * @private
         *
         * @return {ecui.ui.Control} 单元格控件
         */
        UI_TABLE_INIT_GETCONTROL = ieVersion == 8 ? function () {
            // 为了防止写入getControl属性而导致的reflow如此处理
            var control;
            return function () {
                if (!control) {
                    control = $fastCreate(UI_TABLE.Cell, this, getParent(this).getControl());
                }
                return control;
            };
        } : function () {
            this.getControl = null;
            return $fastCreate(UI_TABLE.Cell, this, getParent(this).getControl());
        };
//{else}//
    /**
     * 表格控件初始化一行的宽度。
     * @private
     *
     * @param {ecui.ui.Table.Row} row 行控件
     */
    function UI_TABLE_ROW_INIT(row) {
        for (var i = 0, list = row.getParent()._aCols, el, o; o = list[i]; ) {
            if ((el = row._aCols[i++]) && el != o.getMain()) {
                o = o.getWidth() - o.getMinimumWidth();
                while (row._aCols[i] === null) {
                    o += list[i++].getWidth();
                }
                el.style.width = o + 'px';
            }
        }
    }

    /**
     * 表格控件改变显示区域值。
     * 表格控件改变显示区域时，每次尽量移动一个完整的行或列的距离。
     * @private
     *
     * @param {number} value 控件的当前值
     */
    function UI_TABLE_SCROLL_SETVALUE(value) {
        //__gzip_original__length
        var i = 1,
            list = this.getParent()[this instanceof UI_VSCROLLBAR ? '_aRows' : '_aCols'],
            length = list.length,
            oldValue = this.getValue();

        value = MIN(MAX(0, value), this.getTotal());

        if (value == oldValue) {
            return;
        }

        if (value > oldValue) {
            if (length == 1) {
                UI_SCROLL_CLASS.setValue.call(this, this.getTotal());
                return;
            }
            for (; ; i++) {
                // 计算后移的新位置
                if (value <= list[i].$cache$pos) {
                    if (oldValue < list[i - 1].$cache$pos) {
                        i--;
                    }
                    break;
                }
            }
        }
        else {
            for (i = length; i--; ) {
                // 计算前移的新位置
                if (value >= list[i].$cache$pos) {
                    if (i < length - 1 && oldValue > list[i + 1].$cache$pos) {
                        i++;
                    }
                    break;
                }
            }
        }

        UI_SCROLLBAR_CLASS.setValue.call(this, list[i].$cache$pos);
    }

    /**
     * 鼠标单击控件事件的默认处理。
     * 如果控件处于可操作状态(参见 isEnabled)，click 方法触发 onclick 事件，如果事件返回值不为 false，则调用 $click 方法。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_TABLE_ROW_CLASS.$click = function (event) {
        var table = this.getParent();
        if (!(table.onrowclick && table.onrowclick(event) === false)) {
            UI_CONTROL_CLASS.$click.call(this, event);
        }
    };

    /**
     * 销毁控件的默认处理。
     * 页面卸载时将销毁所有的控件，释放循环引用，防止在 IE 下发生内存泄漏，$dispose 方法的调用不会受到 ondispose 事件返回值的影响。
     * @protected
     */
    UI_TABLE_ROW_CLASS.$dispose = function () {
        this._aCols = null;
        UI_CONTROL_CLASS.$dispose.call(this);
    };

    /**
     * 获取一行中单元格的 Element 对象数组。
     * @protected
     *
     * @return {Array} 单元格的 Element 对象数组
     */
    UI_TABLE_ROW_CLASS.$getCols = function () {
        return this._aCols.slice();
    };

    /**
     * 获取一行中的单元格控件。
     * @public
     *
     * @return {ecui.ui.Control} 单元格控件
     */
    UI_TABLE_ROW_CLASS.getCol = function (index) {
        return this._aCols[index] ? this._aCols[index].getControl() : null;
    };

    /**
     * 获取一行中的全部单元格控件。
     * @public
     *
     * @return {Array} 单元格控件数组
     */
    UI_TABLE_ROW_CLASS.getCols = function () {
        for (var i = this._aCols.length, result = []; i--; ) {
            result[i] = this.getCol(i);
        }

        return result;
    };

    /**
     * 隐藏整列。
     * @protected
     */
    UI_TABLE_HCELL_CLASS.$hide = function () {
        this.$setStyles('display', 'none', -this.getWidth());
    };

    /**
     * 设置整列的样式。
     * $setStyles 方法批量设置一列所有单元格的样式。
     * @protected
     *
     * @param {string} name 样式的名称
     * @param {string} value 样式的值
     * @param {number} widthRevise 改变样式后表格宽度的变化，如果省略表示没有变化
     */
    UI_TABLE_HCELL_CLASS.$setStyles = function (name, value, widthRevise) {
        //__gzip_original__cols
        var i = 0,
            table = this.getParent(),
            rows = table._aHeadRows.concat(table._aRows),
            body = this.getBody(),
            cols = table._aCols,
            index = indexOf(cols, this),
            o = getParent(getParent(getParent(body))).style,
            j;

        body.style[name] = value;
        if (widthRevise) {
            o.width = first(table.getBody()).style.width = toNumber(o.width) + widthRevise + 'px';
        }

        for (; o = rows[i++]; ) {
            // 以下使用 body 表示列元素列表
            body = o._aCols;
            o = body[index];
            if (o) {
                o.style[name] = value;
            }
            if (widthRevise && o !== false) {
                for (j = index; !(o = body[j]); j--) {};

                var width = -cols[j].getMinimumWidth(),
                    colspan = 0;

                do {
                    if (!cols[j].getOuter().style.display) {
                        width += cols[j].getWidth();
                        colspan++;
                    }
                }
                while (body[++j] === null);

                if (width > 0) {
                    o.style.display = '';
                    o.style.width = width + 'px';
                    o.setAttribute('colSpan', colspan);
                }
                else {
                    o.style.display = 'none';
                }
            }
        }
        if (widthRevise > 0) {
            table.resize();
        }
        else {
            table.repaint();
        }
    };

    /**
     * 显示整列。
     * @protected
     */
    UI_TABLE_HCELL_CLASS.$show = function () {
        this.$setStyles('display', '', this.getWidth());
    };

    /**
     * 设置整列的宽度。
     * @public
     *
     * @param {number} width 列的宽度
     */
    UI_TABLE_HCELL_CLASS.setSize = function (width) {
        var oldWidth = this.getWidth();

        this.$setSize(width);
        this.$setStyles('width', width - this.$getBasicWidth() + 'px', width - oldWidth);
    };

    /**
     * 鼠标单击控件事件的默认处理。
     * 如果控件处于可操作状态(参见 isEnabled)，click 方法触发 onclick 事件，如果事件返回值不为 false，则调用 $click 方法。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_TABLE_CELL_CLASS.$click = function (event) {
        var table = this.getParent().getParent();
        if (!(table.oncellclick && table.oncellclick(event) !== false)) {
            UI_CONTROL_CLASS.$click.call(this, event);
        }
    };

    /**
     * 获取控件区域的高度。
     * @public
     *
     * @return {number} 控件的高度
     */
    UI_TABLE_CELL_CLASS.getHeight = function () {
        return this.getOuter().offsetHeight;
    };

    /**
     * 获取控件区域的宽度。
     * @public
     *
     * @return {number} 控件的宽度
     */
    UI_TABLE_CELL_CLASS.getWidth = function () {
        return this.getOuter().offsetWidth;
    };

    /**
     * 计算控件的缓存。
     * 控件缓存部分核心属性的值，提高控件属性的访问速度，在子控件或者应用程序开发过程中，如果需要避开控件提供的方法(setSize、alterClass 等)直接操作 Element 对象，操作完成后必须调用 clearCache 方法清除控件的属性缓存，否则将引发错误。
     * @protected
     *
     * @param {CssStyle} style 基本 Element 对象的 Css 样式对象
     * @param {boolean} cacheSize 是否需要缓存控件大小，如果控件是另一个控件的部件时，不缓存大小能加快渲染速度，默认缓存
     */
    UI_TABLE_CLASS.$cache = function (style, cacheSize) {
        UI_PANEL_CLASS.$cache.call(this, style, cacheSize);

        this._uHead.cache(false, true);

        // 以下使用 style 表示临时对象 o
        this.$cache$mainHeight += this.$cache$paddingTop;
        this.$cache$mainHeight -= this.$cache$paddingTop = this._uHead.getBody().offsetHeight;

        for (var i = 0, pos = 0; style = this._aRows[i++]; ) {
            style.$cache$pos = pos;
            style.cache(true, true);
            if (!style.getOuter().style.display) {
                pos += style.getHeight();
            }
        }
        for (i = 0, pos = 0; style = this._aCols[i++]; ) {
            style.$cache$pos = pos;
            style.cache(true, true);
            if (!style.getOuter().style.display) {
                pos += style.getWidth();
            }
        }
        this.$cache$mainWidth = pos;
    };

    /**
     * 获取单元格元素。
     * $getCell 方法在合法的行列序号内一定会返回一个 Element 对象，如果当前单元格被合并，将返回合并后的 Element 对象。
     * @protected
     *
     * @param {number} rowIndex 单元格的行数，从0开始
     * @param {number} colIndex 单元格的列数，从0开始
     * @return {HTMLElement} 单元格 Element 对象
     */
    UI_TABLE_CLASS.$getCell = function (rowIndex, colIndex) {
        //__gzip_original__rows
        var rows = this._aRows,
            cols = rows[rowIndex] && rows[rowIndex]._aCols,
            col = cols && cols[colIndex];

        if (col === undefined) {
            col = null;
        }
        else if (!col) {
            for (; col === false; col = (cols = rows[--rowIndex]._aCols)[colIndex]) {};
            for (; !col; col = cols[--colIndex]) {};
        }
        return col;
    };

    UI_TABLE_CLASS.init = function () {
        insertBefore(this._uHead.getBody(), this._uHead.getMain().lastChild.lastChild.firstChild);
        this.$cache$mainHeight -= this.$cache$paddingTop;

        UI_PANEL_CLASS.init.call(this);

        for (var i = 0, o; o = this._aCols[i++]; ) {
            o.$setSize(o.getWidth());
        }
        for (i = 0; o = this._aHeadRows[i++]; ) {
            UI_TABLE_ROW_INIT(o);
        }
        for (i = 0; o = this._aRows[i++]; ) {
            UI_TABLE_ROW_INIT(o);
        }
    };

    /**
     * 表格控件对显示记录滚动。
     * @protected
     */
    UI_TABLE_CLASS.$scroll = function () {
        UI_PANEL_CLASS.$scroll.call(this);
        this._uHead.getMain().lastChild.style.left = this.getBody().style.left;
    };

    /**
     * 设置控件的大小。
     * @protected
     *
     * @param {number} width 宽度，如果不需要设置则将参数设置为等价于逻辑非的值
     * @param {number} height 高度，如果不需要设置则省略此参数
     */
    UI_TABLE_CLASS.$setSize = function (width, height) {
        var body = this.getBody(),
            vscroll = this.$getSection('VScrollbar'),
            hscroll = this.$getSection('HScrollbar'),
            mainWidth = this.$cache$mainWidth,
            mainHeight = this.$cache$mainHeight,
            vsWidth = vscroll && vscroll.getWidth(),
            hsHeight = hscroll && hscroll.getHeight(),
            basicWidth = this.$getBasicWidth(),
            basicHeight = this.$getBasicHeight(),
            mainWidthRevise = mainWidth + basicWidth,
            mainHeightRevise = mainHeight + basicHeight,
            bodyWidth = width - basicWidth,
            bodyHeight = height - basicHeight,
            o;

        this.getMain().style.paddingTop = this.$cache$paddingTop + 'px';
        first(body).style.width = this._uHead.getMain().lastChild.lastChild.style.width = mainWidth + 'px';

        // 计算控件的宽度与高度自动扩展
        if (mainWidth <= bodyWidth && mainHeight <= bodyHeight) {
            width = mainWidthRevise;
            height = mainHeightRevise;
        }
        else if (!(vscroll && hscroll &&
            mainWidth > bodyWidth - vsWidth && mainHeight > bodyHeight - hsHeight)
        ) {
            o = mainWidthRevise + (!vscroll || bodyHeight >= mainHeight ? 0 : vsWidth);
            width = hscroll ? MIN(width, o) : o;
            o = mainHeightRevise + (!hscroll || bodyWidth >= mainWidth ? 0 : hsHeight);
            height = vscroll ? MIN(height, o) : o;
        }

        UI_PANEL_CLASS.$setSize.call(this, width, height);

        this._uHead.$setSize(toNumber(getParent(body).style.width), this.$cache$paddingTop);
    };

    /**
     * 增加一列。
     * options 对象对象支持的属性如下：
     * width   {number} 列的宽度
     * base    {string} 列的基本样式
     * caption {string} 列的标题
     * @public
     *
     * @param {Object} options 列的初始化选项
     * @param {number} index 被添加的列的位置序号，如果不合法将添加在末尾
     * @return {ecui.ui.Table.Col} 列控件
     */
    UI_TABLE_CLASS.addCol = function (options, index) {
        var i = 0,
            headRowCount = this._aHeadRows.length,
            rows = this._aHeadRows.concat(this._aRows),
            type = this.getType(),
            primary = options.primary || '',
            hcellClass = findConstructor(this, 'HCell'),
            el = createDom(primary + hcellClass.TYPES, '', 'td'),
            col = $fastCreate(hcellClass, el, this),
            row;

        el.innerHTML = options.caption || '';

        primary += findConstructor(this, 'Cell').TYPES;
        for (; row = rows[i]; i++) {
            o = row._aCols[index];
            if (o !== null) {
                // 没有出现跨列的插入列操作
                for (j = index; !o; ) {
                    o = row._aCols[++j];
                    if (o === undefined) {
                        break;
                    }
                }
                if (i < headRowCount) {
                    row._aCols.splice(index, 0, row.getBody().insertBefore(el, o));
                    el.setAttribute('rowSpan', headRowCount - i);
                    this._aCols.splice(index, 0, col);
                    i = headRowCount - 1;
                }
                else {
                    row._aCols.splice(index, 0, o = row.getBody().insertBefore(createDom(primary, '', 'td'), o));
                    o.getControl = UI_TABLE_INIT_GETCONTROL;
                }
            }
            else {
                // 出现跨列的插入列操作，需要修正colspan的属性值
                var cell = this.$getCell(i, index),
                    j = toNumber(cell.getAttribute('rowspan')) || 1;

                cell.setAttribute('colSpan', toNumber(cell.getAttribute('colSpan')) + 1);
                row._aCols.splice(index, 0, o);
                for (; --j; ) {
                    rows[++i]._aCols.splice(index, 0, false);
                }
            }
        }

        col.cache();
        col.$setSize(options.width);
        col.$setStyles('width', el.style.width, options.width);

        return col;
    };

    /**
     * 增加一行。
     * @public
     *
     * @param {Array} data 数据源(一维数组)
     * @param {number} index 被添加的行的位置序号，如果不合法将添加在最后
     * @return {ecui.ui.Table.Row} 行控件
     */
    UI_TABLE_CLASS.addRow = function (data, index) {
        var i = 0,
            j = 1,
            rowClass = findConstructor(this, 'Row'),
            cellClass = findConstructor(this, 'Cell'),
            body = this.getBody().lastChild.lastChild,
            el = createDom(),
            html = ['<table><tbody><tr class="' + rowClass.TYPES + '">'],
            rowCols = [],
            row = this._aRows[index],
            col;

        if (!row) {
            index = this._aRows.length;
        }

        for (; col = this._aCols[i]; ) {
            if (row && row._aCols[i] === false || data[i] === false) {
                rowCols[i++] = false;
            }
            else {
                // 如果部分列被隐藏，colspan/width 需要动态计算
                rowCols[i] = true;
                html[j++] = '<td class="' + cellClass.TYPES + '" style="';
                for (
                    var o = i,
                        colspan = col.isShow() ? 1 : 0,
                        width = col.getWidth() - col.getMinimumWidth();
                    (col = this._aCols[++i]) && data[i] === null;
                ) {
                    rowCols[i] = null;
                    if (col.isShow()) {
                        colspan++;
                        width += col.getWidth();
                    }
                }
                rowCols[o] = true;
                html[j++] = (colspan ? 'width:' + width + 'px" colSpan="' + colspan : 'display:none') + '">' +
                    data[o] + '</td>';
            }
        }

        html[j] = '</tr></tbody></table>';
        el.innerHTML = html.join('');
        el = el.lastChild.lastChild.lastChild;

        body.insertBefore(el, row ? row.getOuter() : null);
        row = $fastCreate(rowClass, el, this);
        this._aRows.splice(index--, 0, row);

        // 以下使用 col 表示上一次执行了rowspan++操作的单元格，同一个单元格只需要增加一次
        for (i = 0, el = el.firstChild, col = null; this._aCols[i]; i++) {
            if (o = rowCols[i]) {
                rowCols[i] = el;
                el.getControl = UI_TABLE_INIT_GETCONTROL;
                el = el.nextSibling;
            }
            else if (o === false) {
                o = this.$getCell(index, i);
                if (o != col) {
                    o.setAttribute('rowSpan', (toNumber(o.getAttribute('rowSpan')) || 1) + 1);
                    col = o;
                }
            }
        }

        row._aCols = rowCols;
        this.resize();
        return row;
    };

    /**
     * 获取单元格控件。
     * @public
     *
     * @param {number} rowIndex 单元格的行数，从0开始
     * @param {number} colIndex 单元格的列数，从0开始
     * @return {ecui.ui.Control} 单元格控件
     */
    UI_TABLE_CLASS.getCell = function (rowIndex, colIndex) {
        rowIndex = this._aRows[rowIndex];
        return rowIndex && rowIndex.getCol(colIndex) || null;
    };

    /**
     * 获取列控件/列 Element 对象。
     * 列控件只是通常的称呼，实际上就是普通的基础控件，提供了一些针对整列进行操作的方法，包括 hide、setSize(仅能设置宽度) 与 show 方法等。
     * @public
     *
     * @param {number} index 列数，从0开始
     * @return {ecui.ui.Table.Col} 列控件
     */
    UI_TABLE_CLASS.getCol = function (index) {
        return this._aCols[index] || null;
    };

    /**
     * 获取列控件的数量。
     * @public
     *
     * @return {number} 列控件数量
     */
    UI_TABLE_CLASS.getColCount = function () {
        return this._aCols.length;
    };

    /**
     * 获取全部的列控件。
     * @public
     *
     * @return {Array} 列控件数组
     */
    UI_TABLE_CLASS.getCols = function () {
        return this._aCols.slice();
    };

    /**
     * 获取行控件。
     * @public
     *
     * @param {number} index 行数，从0开始
     * @return {ecui.ui.Table.Row} 行控件
     */
    UI_TABLE_CLASS.getRow = function (index) {
        return this._aRows[index] || null;
    };

    /**
     * 获取行控件的数量。
     * @public
     *
     * @return {number} 行控件数量
     */
    UI_TABLE_CLASS.getRowCount = function () {
        return this._aRows.length;
    };

    /**
     * 获取表格中所有的行控件。
     * @public
     *
     * @return {Array} 行控件列表
     */
    UI_TABLE_CLASS.getRows = function () {
        return this._aRows.slice();
    };

    /**
     * 移除一列并释放占用的空间。
     * @public
     *
     * @param {number} index 列的序号，从0开始计数
     */
    UI_TABLE_CLASS.removeCol = function (index) {
        var i = 0,
            cols = this._aCols,
            o = cols[index];

        if (o) {
            o.hide();

            removeDom(o.getOuter());
            disposeControl(o);
            cols.splice(index, 1);

            for (; o = this._aRows[i++]; ) {
                cols = o._aCols;
                if (o = cols[index]) {
                    if (cols[index + 1] === null) {
                        // 如果是被合并的列，需要保留
                        cols.splice(index + 1, 1);
                        continue;
                    }
                    removeDom(o);
                    if (o.getControl != UI_TABLE_INIT_GETCONTROL) {
                        disposeControl(o.getControl());
                    }
                }
                cols.splice(index, 1);
            }
        }
    };

    /**
     * 移除一行并释放占用的空间。
     * @public
     *
     * @param {number} index 行的序号，从0开始计数
     */
    UI_TABLE_CLASS.removeRow = function (index) {
        //__gzip_original__cols
        var i = 0,
            remove = this._aRows[index],
            cols = remove._aCols,
            row = this._aRows[index + 1],
            cell,
            j,
            o;

        if (remove) {
            for (; this._aCols[i]; i++) {
                o = cols[i];
                if (o === false) {
                    o = this.$getCell(index - 1, i);
                    if (cell != o) {
                        o.setAttribute('rowSpan', toNumber(o.getAttribute('rowSpan')) - 1);
                        cell = o;
                    }
                }
                else if (o && (j = toNumber(o.getAttribute('rowSpan'))) > 1) {
                    o.setAttribute('rowSpan', j - 1);
                    row._aCols[i++] = o;
                    for (; cols[i] === null; ) {
                        row._aCols[i++] = null;
                    }
                    for (j = i--; ; ) {
                        cell = row._aCols[j++];
                        if (cell || cell === undefined) {
                            break;
                        }
                    }

                    row.getBody().insertBefore(o, cell);
                    if (o.getControl != UI_TABLE_INIT_GETCONTROL) {
                        o.getControl().$setParent(row);
                    }
                }
            }

            removeDom(remove.getOuter());
            disposeControl(remove);
            this._aRows.splice(index, 1);

            this.repaint();
        }
    };

    // 初始化事件转发信息
    (function () {
        function build(name) {
            var type = name.slice(5);

            UI_TABLE_ROW_CLASS[name] = function (event) {
                triggerEvent(this.getParent(), 'row' + type, event);
            };

            UI_TABLE_CELL_CLASS[name] = function (event) {
                triggerEvent(this.getParent().getParent(), 'cell' + type, event);
            };
        }

        for (var i = 0; i < 6; ) {
            build(eventNames[i++]);
        }
    })();
//{/if}//
//{if 0}//
})();
//{/if}//