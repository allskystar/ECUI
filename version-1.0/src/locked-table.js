/*
LockedTable - 定义允许左右锁定若干列显示的高级表格的基本操作。
允许锁定左右两列的高级表格控件，继承自表格控件，内部包含两个部件——锁定的表头区(基础控件)与锁定的行内容区(基础控件)。

锁定列高级表格控件直接HTML初始化的例子:
<div ecui="type:locked-table;left-lock:2;right-lock:1">
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
_nLeft       - 最左部未锁定列的序号
_nRight      - 最右部未锁定列的后续序号，即未锁定的列序号+1
_uLockedHead - 锁定的表头区
_uLockedMain - 锁定的行内容区

表格行与锁定行属性
_eFill       - 用于控制中部宽度的单元格
*/
//{if 0}//
(function () {

    var core = ecui,
        array = core.array,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        MATH = Math,
        MAX = MATH.max,

        indexOf = array.indexOf,
        children = dom.children,
        createDom = dom.create,
        getParent = dom.getParent,
        insertBefore = dom.insertBefore,
        blank = util.blank,
        toNumber = util.toNumber,

        $fastCreate = core.$fastCreate,
        inheritsControl = core.inherits,

        eventNames = [
            'mousedown', 'mouseover', 'mousemove', 'mouseout', 'mouseup',
            'click', 'dblclick', 'focus', 'blur', 'activate', 'deactivate',
            'keydown', 'keypress', 'keyup', 'mousewheel'
        ],

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_TABLE = ui.Table,
        UI_TABLE_CLASS = UI_TABLE.prototype,
        UI_TABLE_ROW = UI_TABLE.Row,
        UI_TABLE_ROW_CLASS = UI_TABLE_ROW.prototype;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化高级表格控件。
     * options 对象支持的属性如下：
     * left-lock  左边需要锁定的列数
     * right-lock 右边需要锁定的列数
     * @public
     *
     * @param {Object} options 初始化选项
     */
    //__gzip_original__UI_LOCKED_TABLE
    //__gzip_original__UI_LOCKED_TABLE_ROW
    var UI_LOCKED_TABLE = ui.LockedTable =
        inheritsControl(
            UI_TABLE,
            '*locked-table',
            function (el, options) {
                var i = 0,
                    type = this.getType(),
                    headRows = this._aHeadRows,
                    rows = headRows.concat(this._aRows),
                    lockedEl = createDom('', 'position:absolute;top:0px;left:0px;overflow:hidden'),
                    list = [],
                    o;

                this._nLeft = options.leftLock || 0;
                this._nRight = this.getColumnCount() - (options.rightLock || 0);

                // 以下使用 options 代替 rows
                for (; el = rows[i]; ) {
                    el = el.getMain();
                    list[i++] =
                        '<tr class="' + el.className + '" style="' + el.style.cssText +
                            '"><td style="padding:0px;border:0px"></td></tr>';
                }

                lockedEl.innerHTML =
                    '<div class="' + type + '-head"><div style="white-space:nowrap;position:absolute"><table cellspacing="0"><thead>' + list.splice(0, headRows.length).join('') + '</thead></table></div></div><div class="' + type + '-layout" style="position:relative;overflow:hidden"><div style="white-space:nowrap;position:absolute;top:0px;left:0px"><table cellspacing="0"><tbody>' + list.join('') + '</tbody></table></div></div>';
                // 初始化锁定的表头区域，以下使用 list 表示临时变量
                o = this._uLockedHead = $fastCreate(UI_CONTROL, lockedEl.firstChild, this);
                o.$setBody(el = o.getMain().lastChild.lastChild.firstChild);

                for (i = 0, list = children(el); o = list[i]; ) {
                    UI_LOCKED_TABLE_CREATE_LOCKEDROW(o, headRows[i++]);
                }

                o = this._uLockedMain = $fastCreate(UI_CONTROL, el = lockedEl.lastChild, this);
                o.$setBody(el = el.lastChild);

                for (i = 0, list = children(el.lastChild.lastChild); o = list[i]; ) {
                    UI_LOCKED_TABLE_CREATE_LOCKEDROW(o, this._aRows[i++]);
                }
                insertBefore(lockedEl, getParent(this.getBody()));
            }
        );
        UI_LOCKED_TABLE_CLASS = UI_LOCKED_TABLE.prototype,

        /**
         * 初始化高级表格控件的行部件。
         * @public
         *
         * @param {Object} options 初始化选项
         */
        UI_LOCKED_TABLE_ROW_CLASS = (UI_LOCKED_TABLE_CLASS.Row = inheritsControl(UI_TABLE_CLASS.Row)).prototype;
//{else}//
    /**
     * 建立锁定行控件。
     * @private
     *
     * @param {HTMLElement} el 锁定行的 Element 元素
     * @param {ecui.ui.Table.Row} row 表格基本行控件
     */
    function UI_LOCKED_TABLE_CREATE_LOCKEDROW(el, row) {
        $bind(el, row);
        row._eFill = el.lastChild;
    }

    /**
     * 拆分行内的单元格到锁定列或基本列中。
     * @private
     *
     * @param {ecui.ui.LockedTable.LockedHead|ecui.ui.LockedTable.LockedRow} locked 锁定表头控件或者锁定行控件
     */
    function UI_LOCKED_TABLE_ROW_SPLIT(locked) {
        var i = 0,
            table = locked.getParent(),
            cols = table.getHCells(),
            list = locked.$getElements(),
            baseBody = locked.getBody(),
            lockedBody = getParent(locked._eFill),
            el = lockedBody.firstChild,
            o;

        for (; cols[i]; ) {
            if (i == table._nLeft) {
                el = baseBody.firstChild;
            }
            if (o = list[i++]) {
                if (el != o) {
                    (i <= table._nLeft || i > table._nRight ? lockedBody : baseBody).insertBefore(o, el);
                }
                else {
                    el = el.nextSibling;
                }
            }
            if (i == table._nRight) {
                el = locked._eFill.nextSibling;
            }
        }
    }

    /**
     * 拆分所有行内的单元格到锁定列或基本列中。
     * @private
     *
     * @param {ecui.ui.LockedTable} table 锁定式表格控件
     */
    function UI_LOCKED_TABLE_ALL_SPLIT(table) {
        for (var i = 0, o; o = table._aHeadRows[i++]; ) {
            UI_LOCKED_TABLE_ROW_SPLIT(o);
        }
        for (var i = 0, o; o = table._aRows[i++]; ) {
            UI_LOCKED_TABLE_ROW_SPLIT(o);
        }
    }

    /**
     * @override
     */
    UI_LOCKED_TABLE_ROW_CLASS.$dispose = function () {
        this._eFill = null;
        UI_TABLE_ROW_CLASS.$dispose.call(this);
    };

    /**
     * @override
     */
    UI_LOCKED_TABLE_CLASS.$cache = function (style, cacheSize) {
        UI_TABLE_CLASS.$cache.call(this, style, cacheSize);

        var i = 0,
            rows = this.getRows(),
            cols = this.getHCells(),
            pos = cols[this._nLeft].$$pos;

        this.$$paddingTop = MAX(this.$$paddingTop, this._uLockedHead.getBody().offsetHeight);
        this.$$mainWidth -=
            (this.$$paddingLeft = pos) +
                (this.$$paddingRight =
                    this._nRight < cols.length ? this.$$mainWidth - cols[this._nRight].$$pos : 0);

        // 以下使用 style 代替临时变量 o
        for (; style = cols[i++]; ) {
            style.$$pos -= pos;
        }

        for (i = 0, pos = 0; style = rows[i++]; ) {
            style.getCell(this._nLeft).cache(false, true);
            style.$$pos = pos;
            pos += MAX(style.getHeight(), style._eFill.offsetHeight);
        }

        this.$$mainHeight = pos;

        this._uLockedHead.cache(false, true);
        this._uLockedMain.cache(false, true);
    };

    /**
     * @override
     */
    UI_LOCKED_TABLE_CLASS.$pagescroll = function () {
        UI_TABLE_CLASS.$pagescroll.call(this);
        if (!this._uVScrollbar) {
            this._uLockedHead.getOuter().style.top = this._uHead.getOuter().style.top
        }
    };

    /**
     * @override
     */
    UI_LOCKED_TABLE_CLASS.$resize = function () {
        var o = this.getMain().style;
        o.paddingLeft = o.paddingRight = '';
        this.$$paddingLeft = this.$$paddingRight = 0;
        UI_TABLE_CLASS.$resize.call(this);
    };

    /**
     * @override
     */
    UI_LOCKED_TABLE_CLASS.$scroll = function () {
        UI_TABLE_CLASS.$scroll.call(this);
        this._uLockedMain.getBody().style.top = this.getBody().style.top;
    };

    /**
     * @override
     */
    UI_LOCKED_TABLE_CLASS.$setSize = function (width, height) {
        var o = this.getMain().style,
            i = 0,
            layout = getParent(this.getBody()),
            lockedHead = this._uLockedHead,
            style = getParent(getParent(lockedHead.getBody())).style;

        o.paddingLeft = this.$$paddingLeft + 'px';
        o.paddingRight = this.$$paddingRight + 'px';

        UI_TABLE_CLASS.$setSize.call(this, width, height);

        o = this._uHead.getWidth() + this.$$paddingLeft + this.$$paddingRight;
        lockedHead.$setSize(0, this.$$paddingTop);
        style.height = this.$$paddingTop + 'px';
        this._uLockedMain.$setSize(o, this.getBodyHeight());
        style.width = this._uLockedMain.getBody().lastChild.style.width = o + 'px';

        width = layout.style.width;

        style = layout.previousSibling.style;
        style.width = toNumber(width) + this.$$paddingLeft + this.$$paddingRight + 'px';
        style.height = toNumber(layout.style.height) + this.$$paddingTop + 'px';

        var rows = this._aHeadRows.concat(this._aRows);
        for (; o = rows[i++]; ) {
            o._eFill.style.width = width;

            style = MAX(o.getHeight(), o._eFill.offsetHeight);
            o._eFill.style.height = style + 'px';
            o.getCell(this._nLeft).$setSize(0, style);
        }
    };

    /**
     * @override
     */
    UI_LOCKED_TABLE_CLASS.addColumn = function (options, index) {
        if (index >= 0) {
            if (index < this._nLeft) {
                this._nLeft++;
            }
            if (index < this._nRight) {
                this._nRight++;
            }
        }
        return UI_TABLE_CLASS.addColumn.call(this, options, index);
    };

    /**
     * @override
     */
    UI_LOCKED_TABLE_CLASS.addRow = function (data, index) {
        this.repaint = blank;

        //__gzip_original__lockedRow
        var row = UI_TABLE_CLASS.addRow.call(this, data, index),
            index = indexOf(this.getRows(), row),
            lockedRow = this._aRows[index],
            el = row.getMain(),
            o = createDom();

        o.innerHTML = '<table cellspacing="0"><tbody><tr class="' + el.className + '" style="' + el.style.cssText +
            '"><td style="padding:0px;border:0px"></td></tr></tbody></table>';

        UI_LOCKED_TABLE_CREATE_LOCKEDROW(el = o.lastChild.lastChild.lastChild, row);
        this._uLockedMain.getBody().lastChild.lastChild.insertBefore(el, lockedRow && lockedRow.getOuter());
        UI_LOCKED_TABLE_ROW_SPLIT(row);

        delete this.repaint;
        this.repaint();

        return row;
    };

    /**
     * @override
     */
    UI_LOCKED_TABLE_CLASS.init = function () {
        UI_TABLE_CLASS.init.call(this);
        UI_LOCKED_TABLE_ALL_SPLIT(this);
    };

    /**
     * @override
     */
    UI_LOCKED_TABLE_CLASS.removeColumn = function (index) {
        UI_TABLE_CLASS.removeColumn.call(this, index);
        if (index >= 0) {
            if (index < this._nLeft) {
                this._nLeft--;
            }
            if (index < this._nRight) {
                this._nRight--;
            }
        }
    };

    /**
     * 初始化需要执行关联控制的行控件鼠标事件的默认处理。
     * 行控件鼠标事件发生时，需要通知关联的行控件也同步产生默认的处理。
     * @protected
     */
    (function () {
        function build(name) {
            UI_LOCKED_TABLE_ROW_CLASS[name] = function (event) {
                UI_CONTROL_CLASS[name].call(this, event);
                getParent(this._eFill).className = this.getMain().className;
            };
        }

        for (var i = 0; i < 11; ) {
            build('$' + eventNames[i++]);
        }
    })();
//{/if}//
//{if 0}//
})();
//{/if}//