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
_aLockedRow  - 用于显示锁定区域的行控件数组
_uLockedHead - 锁定的表头区
_uLockedMain - 锁定的行内容区

表格行与锁定行属性
_cJoint      - 行(锁定行)对应的锁定行(行)控件
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
        findConstructor = util.findConstructor,
        inherits = util.inherits,
        toNumber = util.toNumber,

        $fastCreate = core.$fastCreate,

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
    var UI_LOCKED_TABLE =
        ui.LockedTable = function (el, options) {
            UI_TABLE.call(this, el, options);

            var i = 0,
                rows = this.getRows(),
                lockedEl = createDom('', 'position:absolute;top:0px;left:0px;overflow:hidden'),
                list = [],
                lockedRows = this._aLockedRow = [],
                o;

            this._nLeft = options.leftLock || 0;
            this._nRight = this.getColCount() - (options.rightLock || 0);

            // 以下使用 options 代替 rows
            for (; el = rows[i]; ) {
                el = el.getBase();
                list[i++] =
                    '<tr class="' + el.className + '" style="' + el.style.cssText +
                        '"><td style="padding:0px;border:0px"></td></tr>';
            }

            lockedEl.innerHTML =
                '<div class="' + options.type + '-area ' + options.base +
                    '-area"><div style="white-space:nowrap;position:absolute"><table cellspacing="0"><thead><tr><td style="padding:0px;border:0px"></td></tr></thead></table></div></div><div class="' + options.type + '-layout ' + options.base +
                    '-layout" style="position:relative;overflow:hidden"><div style="white-space:nowrap;position:absolute;top:0px;left:0px"><table cellspacing="0"><tbody>' + list.join('') + '</tbody></table></div></div>';
            // 初始化锁定的表头区域，以下使用 list 表示临时变量
            o = this._uLockedHead = $fastCreate(UI_CONTROL, lockedEl.firstChild, this);
            o.$setBody(o.getBase().lastChild.lastChild.firstChild.lastChild);
            o._cJoint = this.$getSection('Head');
            o._eFill = o.getBody().lastChild;

            o = this._uLockedMain = $fastCreate(UI_CONTROL, el = lockedEl.lastChild, this);
            o.$setBody(el = el.lastChild);

            for (i = 0, list = children(el.lastChild.lastChild); o = list[i]; ) {
                lockedRows[i] = UI_LOCKED_TABLE_CREATE_LOCKEDROW(this, o, rows[i++]);
            }
            insertBefore(lockedEl, getParent(this.getBody()));
        },
        UI_LOCKED_TABLE_CLASS = inherits(UI_LOCKED_TABLE, UI_TABLE),

        /**
         * 初始化高级表格控件的行部件。
         * @public
         *
         * @param {Object} options 初始化选项
         */
        UI_LOCKED_TABLE_ROW = UI_LOCKED_TABLE.Row = function (el, options) {
            UI_TABLE_ROW.call(this, el, options);
        },
        UI_LOCKED_TABLE_ROW_CLASS = inherits(UI_LOCKED_TABLE_ROW, UI_TABLE_ROW);
//{else}//
    /**
     * 建立锁定行控件。
     * @private
     *
     * @param {ecui.ui.LockedTable} table 锁定表控件
     * @param {HTMLElement} el 锁定行的 Element 元素
     * @param {ecui.ui.Table.Row} row 表格基本行控件
     */
    function UI_LOCKED_TABLE_CREATE_LOCKEDROW(table, el, row) {
        el = $fastCreate(findConstructor(table, 'Row'), el, table);
        el._eFill = el.getBase().lastChild;
        el._cJoint = row;
        row._cJoint = el;

        return el;
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
            flag = locked._cJoint.$getCols,
            cols = table.getCols(),
            list = flag ? locked._cJoint.$getCols() : cols,
            baseBody = locked._cJoint.getBody(),
            lockedBody = locked.getBody(),
            el = lockedBody.firstChild,
            o;

        for (; cols[i]; ) {
            if (i == table._nLeft) {
                el = baseBody.firstChild;
            }
            if (o = list[i++]) {
                if (!flag) {
                    o = o.getOuter();
                }
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
        UI_LOCKED_TABLE_ROW_SPLIT(table._uLockedHead);
        for (var i = 0, o; o = table._aLockedRow[i++]; ) {
            UI_LOCKED_TABLE_ROW_SPLIT(o);
        }
    }

    /**
     * 销毁控件的默认处理。
     * 页面卸载时将销毁所有的控件，释放循环引用，防止在 IE 下发生内存泄漏，$dispose 方法的调用不会受到 ondispose 事件返回值的影响。
     * @protected
     */
    UI_LOCKED_TABLE_ROW_CLASS.$dispose = function () {
        this._eFill = null;
        UI_TABLE_ROW_CLASS.$dispose.call(this);
    };

    /**
     * 计算控件的缓存。
     * 控件缓存部分核心属性的值，提高控件属性的访问速度，在子控件或者应用程序开发过程中，如果需要避开控件提供的方法(setSize、alterClass 等)直接操作 Element 对象，操作完成后必须调用 clearCache 方法清除控件的属性缓存，否则将引发错误。
     * @protected
     *
     * @param {CssStyle} style 基本 Element 对象的 Css 样式对象
     * @param {boolean} cacheSize 是否需要缓存控件大小，如果控件是另一个控件的部件时，不缓存大小能加快渲染速度，默认缓存
     */
    UI_LOCKED_TABLE_CLASS.$cache = function (style, cacheSize) {
        UI_TABLE_CLASS.$cache.call(this, style, cacheSize);

        var i = 0,
            rows = this.getRows(),
            cols = this.getCols(),
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
            style.getCol(this._nLeft).cache(false, true);
            style.$$pos = pos;
            style._cJoint.cache(true, true);
            pos += MAX(style.getHeight(), style._cJoint.getHeight());
        }

        this.$$mainHeight = pos;
    };

    /**
     * 销毁控件的默认处理。
     * 页面卸载时将销毁所有的控件，释放循环引用，防止在 IE 下发生内存泄漏，$dispose 方法的调用不会受到 ondispose 事件返回值的影响。
     * @protected
     */
    UI_LOCKED_TABLE_CLASS.$dispose = function () {
        this._uLockedHead._eFill = null;
        UI_TABLE_CLASS.$dispose.call(this);
    };

    /**
     * 控件渲染完成后初始化的默认处理。
     * $init 方法在控件渲染完成后调用，参见 create  与 init 方法。
     * @protected
     */
    UI_LOCKED_TABLE_CLASS.$init = function () {
        UI_TABLE_CLASS.$init.call(this);
        UI_LOCKED_TABLE_ALL_SPLIT(this);
    };

    /**
     * 控件大小发生变化的默认处理。
     * @protected
     */
    UI_LOCKED_TABLE_CLASS.$resize = function () {
        var o = this.getBase().style;
        o.paddingLeft = o.paddingRight = '';
        this.$$paddingLeft = this.$$paddingRight = 0;
        UI_TABLE_CLASS.$resize.call(this);
    };

    /**
     * 表格控件滚动条滚动时的显示区域刷新。
     * @protected
     */
    UI_LOCKED_TABLE_CLASS.$scroll = function () {
        UI_TABLE_CLASS.$scroll.call(this);
        this._uLockedMain.getBody().style.top = this.getBody().style.top;
    };

    /**
     * 设置控件的大小。
     * @protected
     *
     * @param {number} width 宽度，如果不需要设置则将参数设置为等价于逻辑非的值
     * @param {number} height 高度，如果不需要设置则省略此参数
     */
    UI_LOCKED_TABLE_CLASS.$setSize = function (width, height) {
        var o = this.getBase().style,
            i = 0,
            layout = getParent(this.getBody()),
            lockedHead = this._uLockedHead,
            style = getParent(getParent(lockedHead.getBody())).style;

        o.paddingLeft = this.$$paddingLeft + 'px';
        o.paddingRight = this.$$paddingRight + 'px';

        UI_TABLE_CLASS.$setSize.call(this, width, height);

        o = lockedHead._cJoint.getWidth() + this.$$paddingLeft + this.$$paddingRight;
        lockedHead.$setSize(0, this.$$paddingTop);
        style.height = this.$$paddingTop + 'px';
        this._uLockedMain.$setSize(o, this.getBodyHeight());
        style.width = this._uLockedMain.getBody().lastChild.style.width = o + 'px';

        width = layout.style.width;
        lockedHead._eFill.style.width = width;

        style = layout.previousSibling.style;
        style.width = toNumber(width) + this.$$paddingLeft + this.$$paddingRight + 'px';
        style.height = toNumber(layout.style.height) + this.$$paddingTop + 'px';

        for (; o = this._aLockedRow[i++]; ) {
            o._eFill.style.width = width;

            style = MAX(o.getHeight(), o._cJoint.getHeight());
            o._eFill.style.height = style + 'px';
            o._cJoint.getCol(this._nLeft).$setSize(0, style);
        }
    };

    /**
     * 增加一列。
     * options 对象对象支持的属性如下：
     * width   {number}  列的宽度
     * base    {string}  列的基本样式
     * title   {string}  列的标题
     * @public
     *
     * @param {Object} options 列的初始化选项
     * @param {number} index 被添加的列的位置序号，如果不合法将添加在末尾
     * @return {ecui.ui.Table.Col} 列控件
     */
    UI_LOCKED_TABLE_CLASS.addCol = function (options, index) {
        if (index >= 0) {
            if (index < this._nLeft) {
                this._nLeft++;
            }
            if (index < this._nRight) {
                this._nRight++;
            }
        }
        return UI_TABLE_CLASS.addCol.call(this, options, index);
    };

    /**
     * 增加一行。
     * @public
     *
     * @param {Array} data 数据源(一维数组)
     * @param {number} index 被添加的行的位置序号，如果不合法将添加在最后
     * @return {ecui.ui.Table.Row} 行控件
     */
    UI_LOCKED_TABLE_CLASS.addRow = function (data, index) {
        this.repaint = blank;

        //__gzip_original__lockedRow
        var row = UI_TABLE_CLASS.addRow.call(this, data, index),
            index = indexOf(this.getRows(), row),
            lockedRow = this._aLockedRow[index],
            el = row.getBase(),
            o = createDom();

        o.innerHTML = '<table cellspacing="0"><tbody><tr class="' + el.className + '" style="' + el.style.cssText +
            '"><td style="padding:0px;border:0px"></td></tr></tbody></table>';

        o = UI_LOCKED_TABLE_CREATE_LOCKEDROW(this, el = o.lastChild.lastChild.lastChild, row);
        this._uLockedMain.getBody().lastChild.lastChild.insertBefore(el, lockedRow && lockedRow.getOuter());
        this._aLockedRow.splice(index, 0, o);
        UI_LOCKED_TABLE_ROW_SPLIT(o);

        delete this.repaint;
        this.repaint();

        return row;
    };

    /**
     * 移除一列并释放占用的空间。
     * @public
     *
     * @param {number} index 列的序号，从0开始计数
     */
    UI_LOCKED_TABLE_CLASS.removeCol = function (index) {
        UI_TABLE_CLASS.removeCol.call(this, index);
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
                UI_CONTROL_CLASS[name].call(this._cJoint, event);
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