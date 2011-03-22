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
_aCol        - 表头的列控件对象
_aRow        - 表格数据行对象
_uHead       - 表头区域

表头列属性
$cache$pos   - 列的坐标

行属性
$cache$pos   - 行的坐标
_aCol        - 行的列Element对象，如果当前列需要向左合并为null，需要向上合并为false
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
            'pressstart', 'pressover', 'pressmove', 'pressout', 'pressend',
            'click', 'focus', 'blur', 'keydown', 'keypress', 'keyup', 'mousewheel',
            'change', 'resize', 'create', 'init'
        ],

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_SCROLL_CLASS = ui.Scroll.prototype,
        UI_VSCROLL = ui.VScroll,
        UI_PANEL = ui.Panel,
        UI_PANEL_CLASS = UI_PANEL.prototype;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化表格控件。
     * @public
     *
     * @param {HTMLElement} el 关联的 Element 对象
     * @param {Object} params 初始化参数
     */
    //__gzip_original__UI_TABLE
    //__gzip_original__UI_TABLE_ROW
    //__gzip_original__UI_TABLE_COL
    //__gzip_original__UI_TABLE_CELL
    var UI_TABLE =
        ui.Table = function (el, params) {
            //__gzip_original__baseClass
            //__gzip_original__typeClass
            var i = 0,
                baseClass = params.base,
                typeClass = params.type,
                rows = this._aRow = [],
                cols = this._aCol = [],
                tableEl = first(el),
                list = children(tableEl),
                head = list[0],
                j,
                o;

            removeDom(tableEl);
            params.wheelDelta = 1;
            UI_PANEL.call(this, el, params);

            // 以下使用 el 表示 head 的 body 元素
            if (head.tagName != 'THEAD') {
                el = insertBefore(createDom('', '', 'thead'), head).appendChild((list = children(head)).shift());
                head = getParent(el);
            }
            else {
                list = children(list[1]);
                el = last(head);
            }

            tableEl.setAttribute('cellSpacing', '0');

            // 设置滚动条操作
            if (o = this.$getSection('VScroll')) {
                o.setValue = UI_TABLE_SCROLL_SETVALUE;
            }
            if (o = this.$getSection('HScroll')) {
                o.setValue = UI_TABLE_SCROLL_SETVALUE;
            }

            // 初始化表头区域
            o = createDom(typeClass + '-area ' + baseClass + '-area', 'position:absolute;top:0px;overflow:hidden');
            o.innerHTML =
                '<div style="white-space:nowrap;position:absolute"><table cellspacing="0"><tbody>' +
                    '</tbody></table></div>';
            (this._uHead = $fastCreate(UI_CONTROL, this.getBase().appendChild(o), this)).$setBody(el);

            for (j = findConstructor(this, 'Row'); o = list[i]; i++) {
                o.className = typeClass + '-row ' + (trim(o.className) || baseClass + '-row');
                list[i] = first(o);
                (rows[i] = $fastCreate(j, o, this))._aCol = [];
            }

            // 以下使用 head 表示所有的列标签集合
            for (i = 0, head = children(el); head[i]; i++) {
                for (j = 0; rows[j]; j++) {
                    o = list[j];
                    if (rows[j]._aCol[i] === undefined) {
                        rows[j]._aCol[i] = o;
                        list[j] = next(o);

                        var rowspan = toNumber(o.getAttribute('rowSpan')) || 1,
                            colspan = toNumber(o.getAttribute('colSpan')) || 1;

                        while (rowspan--) {
                            if (!rowspan) {
                                colspan--;
                            }
                            for (o = colspan; o--; ) {
                                rows[j + rowspan]._aCol.push(rowspan ? false : null);
                            }
                        }
                    }
                }
            }

            for (i = 0; el = head[i]; i++) {
                o = el.className.split(/\s+/);
                o = o[0] || o[1] || baseClass;
                el.className = typeClass + '-head ' + (trim(el.className) || o + '-head');

                cols[i] = $fastCreate(UI_TABLE_COL, el, this);
                // 以下使用 list 代替行控件对象
                for (j = 0; list = rows[j]; j++) {
                    if (el = list._aCol[i]) {
                        el.className = typeClass + '-item ' + (trim(el.className) || o + '-item');
                        el.getControl = ieVersion == 8 ? UI_TABLE_INIT_GETCONTROL() : UI_TABLE_INIT_GETCONTROL;
                    }
                }
            }

            this.getBody().appendChild(tableEl);
        },
        UI_TABLE_CLASS = inherits(UI_TABLE, UI_PANEL),

        /**
         * 初始化表格控件的行部件。
         * @public
         *
         * @param {HTMLElement} el 关联的 Element 对象
         * @param {Object} params 初始化参数
         */
        UI_TABLE_ROW = UI_TABLE.Row = function (el, params) {
            UI_CONTROL.call(this, el, params);
        },
        UI_TABLE_ROW_CLASS = inherits(UI_TABLE_ROW, UI_CONTROL),

        /**
         * 初始化表格控件的列部件。
         * @public
         *
         * @param {HTMLElement} el 关联的 Element 对象
         * @param {Object} params 初始化参数
         */
        UI_TABLE_COL = UI_TABLE.Col = function (el, params) {
            UI_CONTROL.call(this, el, params);
        },
        UI_TABLE_COL_CLASS = inherits(UI_TABLE_COL, UI_CONTROL),

        /**
         * 初始化表格控件的单元格部件。
         * @public
         *
         * @param {HTMLElement} el 关联的 Element 对象
         * @param {Object} params 初始化参数
         */
        UI_TABLE_CELL = UI_TABLE.Cell = function (el, params) {
            UI_CONTROL.call(this, el, params);
        },
        UI_TABLE_CELL_CLASS = inherits(UI_TABLE_CELL, UI_CONTROL),

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
                    control = $fastCreate(UI_TABLE_CELL, this, getParent(this).getControl());
                }
                return control;
            };
        } : function () {
            this.getControl = null;
            return $fastCreate(UI_TABLE_CELL, this, getParent(this).getControl());
        };
//{else}//
    /**
     * 表格控件初始化一行的宽度。
     * @private
     *
     * @param {ecui.ui.Table.Row} row 行控件
     */
    function UI_TABLE_ROW_INIT(row) {
        for (var i = 0, list = row.getParent()._aCol, el, o; o = list[i]; ) {
            if (el = row._aCol[i++]) {
                o = o.getWidth() - o.getInvalidWidth();
                while (row._aCol[i] === null) {
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
            list = this.getParent()[this instanceof UI_VSCROLL ? '_aRow' : '_aCol'],
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

        UI_SCROLL_CLASS.setValue.call(this, list[i].$cache$pos);
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
        this._aCol = null;
        UI_CONTROL_CLASS.$dispose.call(this);
    };

    /**
     * 获取一行中单元格的 Element 对象数组。
     * @protected
     *
     * @return {Array} 单元格的 Element 对象数组
     */
    UI_TABLE_ROW_CLASS.$getCols = function () {
        return this._aCol.slice();
    };

    /**
     * 获取一行中的单元格控件。
     * @public
     *
     * @return {ecui.ui.Control} 单元格控件
     */
    UI_TABLE_ROW_CLASS.getCol = function (index) {
        return this._aCol[index] ? this._aCol[index].getControl() : null;
    };

    /**
     * 获取一行中的全部单元格控件。
     * @public
     *
     * @return {Array} 单元格控件数组
     */
    UI_TABLE_ROW_CLASS.getCols = function () {
        for (var i = this._aCol.length, result = []; i--; ) {
            result[i] = this.getCol(i);
        }

        return result;
    };

    /**
     * 隐藏整列。
     * @protected
     */
    UI_TABLE_COL_CLASS.$hide = function () {
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
    UI_TABLE_COL_CLASS.$setStyles = function (name, value, widthRevise) {
        //__gzip_original__cols
        var i = 0,
            table = this.getParent(),
            body = this.getBody(),
            cols = table._aCol,
            index = indexOf(cols, this),
            o = getParent(getParent(getParent(body))).style,
            j;

        body.style[name] = value;
        if (widthRevise) {
            o.width = first(table.getBody()).style.width = toNumber(o.width) + widthRevise + 'px';
        }

        for (; o = table._aRow[i++]; ) {
            // 以下使用 body 表示列元素列表
            body = o._aCol;
            o = body[index];
            if (o) {
                o.style[name] = value;
            }
            if (widthRevise && o !== false) {
                for (j = index; !(o = body[j]); j--) {};

                var width = -cols[j].getInvalidWidth(),
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
            table.paint();
        }
    };

    /**
     * 显示整列。
     * @protected
     */
    UI_TABLE_COL_CLASS.$show = function () {
        this.$setStyles('display', '', this.getWidth());
    };

    /**
     * 设置整列的宽度。
     * @public
     *
     * @param {number} width 列的宽度
     */
    UI_TABLE_COL_CLASS.setSize = function (width) {
        var oldWidth = this.getWidth();

        this.$setSize(width);
        this.$setStyles('width', width - this.getInvalidWidth(true) + 'px', width - oldWidth);
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
        this.$cache$mainHeight -= this.$cache$paddingTop = getParent(this._uHead.getBody()).offsetHeight;
        for (var i = 0, pos = 0; style = this._aRow[i++]; ) {
            style.$cache$pos = pos;
            style.cache(true, true);
            if (!style.getOuter().style.display) {
                pos += style.getHeight();
            }
        }
        for (i = 0, pos = 0; style = this._aCol[i++]; ) {
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
     * $getCell 方法在合法的行列序号内一定会返回一个 DOM 元素，如果当前单元格被合并，将返回合并后的 DOM 元素。
     * @protected
     *
     * @param {number} rowIndex 单元格的行数，从0开始
     * @param {number} colIndex 单元格的列数，从0开始
     * @return {HTMLElement} 单元格 DOM 元素
     */
    UI_TABLE_CLASS.$getCell = function (rowIndex, colIndex) {
        //__gzip_original__rows
        var rows = this._aRow,
            cols = rows[rowIndex] && rows[rowIndex]._aCol,
            col = cols && cols[colIndex];

        if (col === undefined) {
            col = null;
        }
        else if (!col) {
            for (; col === false; col = (cols = rows[--rowIndex]._aCol)[colIndex]) {};
            for (; !col; col = cols[--colIndex]) {};
        }
        return col;
    };

    /**
     * 控件渲染完成后初始化的默认处理。
     * $init 方法在控件渲染完成后调用，参见 create 与 init 方法。
     * @protected
     */
    UI_TABLE_CLASS.$init = function () {
        UI_PANEL_CLASS.$init.call(this);

        for (var i = 0, o; o = this._aCol[i++]; ) {
            o.$setSize(o.getWidth());
        }
        for (i = 0; o = this._aRow[i++]; ) {
            UI_TABLE_ROW_INIT(o);
        }
        insertBefore(getParent(this._uHead.getBody()), this._uHead.getBase().lastChild.lastChild.firstChild);
    };

    /**
     * 表格控件对显示记录滚动。
     * @protected
     */
    UI_TABLE_CLASS.$scroll = function () {
        UI_PANEL_CLASS.$scroll.call(this);
        this._uHead.getBase().lastChild.style.left = this.getBody().style.left;
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
            vscroll = this.$getSection('VScroll'),
            hscroll = this.$getSection('HScroll'),
            mainWidth = this.$cache$mainWidth,
            mainHeight = this.$cache$mainHeight,
            vsWidth = vscroll && vscroll.getWidth(),
            hsHeight = hscroll && hscroll.getHeight(),
            invalidWidth = this.getInvalidWidth(true),
            invalidHeight = this.getInvalidHeight(true),
            mainWidthRevise = mainWidth + invalidWidth,
            mainHeightRevise = mainHeight + invalidHeight,
            bodyWidth = width - invalidWidth,
            bodyHeight = height - invalidHeight,
            o;

        this.getBase().style.paddingTop = this.$cache$paddingTop + 'px';
        first(body).style.width = this._uHead.getBase().lastChild.lastChild.style.width = mainWidth + 'px';

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
     * params 参数对象支持的属性如下：
     * width   {number} 列的宽度
     * base    {string} 列的基本样式
     * title   {string} 列的标题
     * @public
     *
     * @param {Object} params 列的初始化参数
     * @param {number} index 被添加的列的位置序号，如果不合法将添加在末尾
     * @return {ecui.ui.Table.Col} 列控件
     */
    UI_TABLE_CLASS.addCol = function (params, index) {
        //__gzip_original__width
        var i = 0,
            typeClass = this.getType(),
            baseClass = params.base || this.getBaseClass(),
            el = createDom(typeClass + '-head ' + baseClass + '-head', '', 'th'),
            col = $fastCreate(UI_TABLE_COL, el, this),
            o = this._aCol[index],
            width = params.width,
            row;

        if (o) {
            o = o.getOuter();
        }
        else {
            index = this._aCol.length;
        }

        this._aCol.splice(index, 0, col);
        el.innerHTML = params.title || '';
        this._uHead.getBody().insertBefore(el, o);

        typeClass = typeClass + '-item ' + baseClass + '-item';
        for (; row = this._aRow[i]; i++) {
            o = row._aCol[index];
            if (o !== null) {
                // 没有出现跨列的插入列操作
                for (j = index; !o; ) {
                    o = row._aCol[++j];
                    if (o === undefined) {
                        break;
                    }
                }
                row._aCol.splice(index, 0, o = row.getBody().insertBefore(createDom(typeClass, '', 'td'), o));
                o.getControl = UI_TABLE_INIT_GETCONTROL;
            }
            else {
                // 出现跨列的插入列操作，需要修正colspan的属性值
                var cell = this.$getCell(i, index),
                    j = toNumber(cell.getAttribute('rowspan')) || 1;

                cell.setAttribute('colSpan', toNumber(cell.getAttribute('colSpan')) + 1);
                row._aCol.splice(index, 0, o);
                for (; --j; ) {
                    this._aRow[++i]._aCol.splice(index, 0, false);
                }
            }
        }

        col.$setSize(width);
        col.$setStyles('width', el.style.width, width);

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
            body = this.getBody().lastChild.lastChild,
            typeClass = this.getType(),
            el = createDom(),
            html = ['<table><tbody><tr class="' + typeClass + '-row ' + this.getBaseClass() + '-row">'],
            rowCols = [],
            row = this._aRow[index],
            col;

        if (!row) {
            index = this._aRow.length;
        }

        for (; col = this._aCol[i]; ) {
            if (row && row._aCol[i] === false || data[i] === false) {
                rowCols[i++] = false;
            }
            else {
                // 如果部分列被隐藏，colspan/width 需要动态计算
                rowCols[i] = true;
                html[j++] = '<td class="' + typeClass + '-item ' + col.getBaseClass().slice(0, -5) + '-item" style="';
                for (
                    var o = i,
                        colspan = col.isShow() ? 1 : 0,
                        width = -col.getInvalidWidth();
                    (col = this._aCol[++i]) && data[i] === null;
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

        body.insertBefore(el, row && row.getOuter());
        row = $fastCreate(findConstructor(this, 'Row'), el, this);
        this._aRow.splice(index--, 0, row);

        // 以下使用 col 表示上一次执行了rowspan++操作的单元格，同一个单元格只需要增加一次
        for (i = 0, el = el.firstChild, col = null; this._aCol[i]; i++) {
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

        row._aCol = rowCols;
        this.paint();

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
        rowIndex = this._aRow[rowIndex];
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
        return this._aCol[index] || null;
    };

    /**
     * 获取列控件的数量。
     * @public
     *
     * @return {number} 列控件数量
     */
    UI_TABLE_CLASS.getColCount = function () {
        return this._aCol.length;
    };

    /**
     * 获取全部的列控件。
     * @public
     *
     * @return {Array} 列控件数组
     */
    UI_TABLE_CLASS.getCols = function () {
        return this._aCol.slice();
    };

    /**
     * 获取行控件。
     * @public
     *
     * @param {number} index 行数，从0开始
     * @return {ecui.ui.Table.Row} 行控件
     */
    UI_TABLE_CLASS.getRow = function (index) {
        return this._aRow[index] || null;
    };

    /**
     * 获取行控件的数量。
     * @public
     *
     * @return {number} 行控件数量
     */
    UI_TABLE_CLASS.getRowCount = function () {
        return this._aRow.length;
    };

    /**
     * 获取表格中所有的行控件。
     * @public
     *
     * @return {Array} 行控件列表
     */
    UI_TABLE_CLASS.getRows = function () {
        return this._aRow.slice();
    };

    /**
     * 移除一列并释放占用的空间。
     * @public
     *
     * @param {number} index 列的序号，从0开始计数
     */
    UI_TABLE_CLASS.removeCol = function (index) {
        var i = 0,
            cols = this._aCol,
            o = cols[index];

        if (o) {
            o.hide();

            removeDom(o.getOuter());
            disposeControl(o);
            cols.splice(index, 1);

            for (; o = this._aRow[i++]; ) {
                cols = o._aCol;
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
            remove = this._aRow[index],
            cols = remove._aCol,
            row = this._aRow[index + 1],
            cell,
            j,
            o;

        if (remove) {
            for (; this._aCol[i]; i++) {
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
                    row._aCol[i++] = o;
                    for (; cols[i] === null; ) {
                        row._aCol[i++] = null;
                    }
                    for (j = i--; ; ) {
                        cell = row._aCol[j++];
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
            this._aRow.splice(index, 1);

            this.paint();
        }
    };

    // 初始化事件转发信息
    (function () {
        function build(name) {
            var type = name.slice(5);

            UI_TABLE_ROW_CLASS[name] = function (event) {
                var parent = this.getParent();
                if (!(parent['onrow' + type] && parent['onrow' + type](event) === false)) {
                    UI_CONTROL_CLASS[name].call(this, event);
                }
            };

            UI_TABLE_CELL_CLASS[name] = function (event) {
                var parent = this.getParent().getParent();
                if (!(parent['oncell' + type] && parent['oncell' + type](event) === false)) {
                    UI_CONTROL_CLASS[name].call(this, event);
                }
            };
        }

        for (var i = 0; i < 5; ) {
            build(eventNames[i++]);
        }
    })();
//{/if}//
//{if 0}//
})();
//{/if}//