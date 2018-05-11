/*
@example
<div ui="type:locked-table;left-lock:2;right-lock:1">
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

@fields
_nLeft       - 最左部未锁定列的序号
_nRight      - 最右部未锁定列的后续序号，即未锁定的列序号+1
_uLockedHead - 锁定的表头区
_uLockedMain - 锁定的行内容区
_eLeft       - 左侧锁定行的Element元素
_eRight      - 右侧乐定行的Element元素
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        firefoxVersion = /firefox\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined,
        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined,
        safariVersion = /(\d+\.\d)(\.\d)?\s+.*safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent) ? +RegExp.$1 : undefined,

        eventNames = ['mousedown', 'mouseover', 'mousemove', 'mouseout', 'mouseup', 'click', 'dblclick', 'focus', 'blur', 'activate', 'deactivate'];
//{/if}//
    /**
     * 建立锁定行控件。
     * @private
     *
     * @param {ecui.ui.Table.Row} row 表格基本行控件
     * @param {HTMLElement} left 左侧锁定行的 Element 元素
     * @param {HTMLElement} right 右侧锁定行的 Element 元素
     */
    function initLockedRow(row, left, right) {
        core.$bind(left, row);
        core.$bind(right, row);
        row._eLeft = left;
        row._eRight = right;
    }

    /**
     * 恢复行内的单元格到锁定列或基本列中。
     * @private
     *
     * @param {ecui.ui.LockedTable} table 锁定表格控件
     * @param {ecui.ui.LockedTable.Row} row 锁定表头控件或者锁定行控件
     */
    function restoreRow(table, row) {
        var elements = row.$getElements(),
            first;

        row._eLeft.firstChild.style.height = row._eRight.firstChild.style.height = '';

        row = row.getMain();
        first = row.firstChild;

        table.getHCells().forEach(function (item, index) {
            if (item = elements[index]) {
                if (index < table._nLeft) {
                    row.insertBefore(item, first);
                } else if (index >= table._nRight) {
                    row.appendChild(item);
                }
            }
        });
    }

    /**
     * 拆分行内的单元格到锁定列或基本列中。
     * @private
     *
     * @param {ecui.ui.LockedTable} table 锁定表格控件
     * @param {ecui.ui.LockedTable.Row} row 锁定表头控件或者锁定行控件
     */
    function splitRow(table, row) {
        var elements = row.$getElements();

        table.getHCells().forEach(function (item, index) {
            if (item = elements[index]) {
                if (index < table._nLeft) {
                    row._eLeft.insertBefore(item, row._eLeft.lastChild);
                } else if (index >= table._nRight) {
                    row._eRight.appendChild(item);
                }
            }
        });

        row._eLeft.lastChild.style.height = row._eRight.firstChild.style.height = row.getHeight() + 'px';
    }

    /**
     * 锁定式表格控件。
     * 允许锁定左右两列的高级表格控件。
     * options 属性：
     * left-lock  左边需要锁定的列数
     * right-lock 右边需要锁定的列数
     * @control
     */
    ui.LockedTable = core.inherits(
        ui.Table,
        'ui-locked-table',
        function (el, options) {
            ui.Table.call(this, el, options);

            this._sTableWidth = dom.getParent(this.getBody()).style.width;

            var i = 0,
                headRows = this.getHRows(),
                rows = this.getRows(),
                totalRows = headRows.concat(rows),
                layout = this.getLayout(),
                list = [],
                o;

            this._nLeft = options.leftLock || 0;
            this._nRight = this.getColumnCount() - (options.rightLock || 0);

            totalRows.forEach(function (item, index) {
                item = item.getMain();
                list[index] = '<tr class="' + item.className + '" style="' + item.style.cssText + '"><td class="ui-locked-table-height"></td></tr>';
            });

            o = '<table cellspacing="0" class="ui-locked-table-{0} ui-locked-table-body ' + dom.getParent(this.getBody()).className + '"><tbody>' + list.splice(headRows.length, rows.length).join('') + '</tbody></table><table cellspacing="0" class="ui-locked-table-{0} ui-locked-table-head ' + this.$getSection('Head').getMain().className + '"><thead>' + list.join('') + '</thead></table>';
            dom.insertHTML(
                layout,
                'beforeEnd',
                '<div class="ui-locked-table-fill"></div>' + util.stringFormat(o, 'right') + util.stringFormat(o, 'left')
            );

            el = layout.lastChild;
            for (i = 0; i < 4; i++) {
                list[i] = el;
                el = el.previousSibling;
            }
            this._eFill = el;

            var left = this._uLeftHead = core.$fastCreate(ui.Control, list[0], this),
                right = this._uRightHead = core.$fastCreate(ui.Control, list[2], this);
            left.$setBody(left = left.getMain().lastChild);
            right.$setBody(right = right.getMain().lastChild);

            for (i = 0, left = dom.children(left), right = dom.children(right); el = left[i]; ) {
                initLockedRow(headRows[i], el, right[i++]);
            }

            left = this._uLeftMain = core.$fastCreate(ui.Control, list[1], this);
            right = this._uRightMain = core.$fastCreate(ui.Control, list[3], this);
            left.$setBody(left = left.getMain().lastChild);
            right.$setBody(right = right.getMain().lastChild);

            for (i = 0, left = dom.children(left), right = dom.children(right); el = left[i]; ) {
                initLockedRow(rows[i], el, right[i++]);
            }
        },
        {
            /**
             * 行部件。
             * @unit
             */
            Row: core.inherits(
                ui.Table.prototype.Row,
                {
                    /**
                     * @override
                     */
                    $dispose: function () {
                        this._eLeft = this._eRight = null;
                        ui.Table.prototype.Row.prototype.$dispose.call(this);
                    }
                }
            ),

            /**
             * @override
             */
            $beforescroll: function (event) {
                ui.Table.prototype.$beforescroll.call(this, event);

                if (firefoxVersion || ieVersion < 7) {
                    return;
                }
                var layout = this.getLayout(),
                    pos = dom.getPosition(layout),
                    view = util.getView(),
                    top = pos.top - view.top,
                    left = pos.left - view.left,
                    leftHeadStyle = this._uLeftHead.getOuter().style,
                    rightHeadStyle = this._uRightHead.getOuter().style,
                    leftMainStyle = this._uLeftMain.getOuter().style,
                    rightMainStyle = this._uRightMain.getOuter().style,
                    fixed = dom.contain(this.getMain(), event.target) && Math.abs(event.deltaX) >= Math.abs(event.deltaY);

                if (this.$getSection('Head').getMain().style.position === 'fixed' || fixed) {
                    leftHeadStyle.position = rightHeadStyle.position = 'fixed';
                    leftHeadStyle.top = rightHeadStyle.top = (Math.min(this.getBodyHeight() - this.$$paddingTop + top, Math.max(0, top))) + 'px';
                    leftHeadStyle.left = left + 'px';
                    rightHeadStyle.left = (Math.min(this.getBodyWidth(), this.$$tableWidth) - this.$$paddingRight + left - this.$$rightTDWidth - this.$$scrollFixed[0]) + 'px';
                }

                if (fixed) {
                    leftMainStyle.position = rightMainStyle.position = 'fixed';
                    leftMainStyle.left = leftHeadStyle.left;
                    rightMainStyle.left = rightHeadStyle.left;
                    var scrollTop = layout.scrollTop - this.$$paddingTop;
                    leftMainStyle.top = rightMainStyle.top = top - scrollTop + 'px';
                    leftMainStyle.clip = 'rect(' + scrollTop + 'px ' + this.$$paddingLeft + 'px ' + (scrollTop + this.getBodyHeight() - this.$$scrollFixed[1]) + 'px 0px)';
                    rightMainStyle.clip = 'rect(' + scrollTop + 'px ' + this.$$paddingRight + 'px ' + (scrollTop + this.getBodyHeight() - this.$$scrollFixed[1]) + 'px 0px)';
                }
            },

            /**
             * @override
             */
            $cache: function (style, cacheSize) {
                ui.Table.prototype.$cache.call(this, style, cacheSize);

                this.$$paddingLeft = 0;

                for (var i = 0, list = this.getHCells(); i < this._nLeft; ) {
                    this.$$paddingLeft += list[i++].getWidth();
                }

                this.$$paddingRight = 0;
                for (i = this._nRight; i < list.length; ) {
                    this.$$paddingRight += list[i++].getWidth();
                }

                this._uLeftHead.cache(false, true);
                this._uRightHead.cache(false, true);
                this._uLeftMain.cache(false, true);
                this._uRightMain.cache(false, true);

                this.$$leftTDWidth = (safariVersion ? 1 : 0) + this._uLeftHead.$$border[1] + this._uLeftHead.$$border[3];
                this.$$rightTDWidth = (safariVersion ? 1 : 0) + this._uRightHead.$$border[1] + this._uRightHead.$$border[3];
            },

            /**
             * @override
             */
            $dispose: function () {
                this._eFill = null;
                ui.Table.prototype.$dispose.call(this);
            },

            /**
             * @override
             */
            $initStructure: function (width, height) {
                ui.Table.prototype.$initStructure.call(this, width, height);

                this._aHeadRows.forEach(function (item) {
                    splitRow(this, item);
                }, this);
                this._aRows.forEach(function (item) {
                    splitRow(this, item);
                }, this);

                var table = dom.getParent(this.getBody()),
                    head = this.$getSection('Head').getMain().lastChild;

                this._eFill.style.width = this.$$tableWidth + 'px';
                this._uLeftHead.getMain().style.width = this._uLeftMain.getMain().style.width = (this.$$leftTDWidth + this.$$paddingLeft) + 'px';
                this._uRightHead.getMain().style.width = this._uRightMain.getMain().style.width = (this.$$rightTDWidth + this.$$paddingRight) + 'px';
                table.style.marginLeft = head.style.marginLeft = this.$$paddingLeft + 'px';
                table.style.width = head.style.width = (this.$$tableWidth - this.$$paddingLeft - this.$$paddingRight) + 'px';
                dom.getParent(head).style.width = this.$$tableWidth + 'px';
            },

            /**
             * @override
             */
            $resize: function () {
                ui.Table.prototype.$resize.call(this);

                this._aHeadRows.forEach(function (item) {
                    restoreRow(this, item);
                }, this);
                this._aRows.forEach(function (item) {
                    restoreRow(this, item);
                }, this);

                var leftHead = this._uLeftHead.getMain(),
                    rightHead = this._uRightHead.getMain(),
                    leftMain = this._uLeftMain.getMain(),
                    rightMain = this._uRightMain.getMain(),
                    table = dom.getParent(this.getBody()),
                    head = this.$getSection('Head').getMain();

                this._eFill.style.width = '';
                leftHead.style.width = leftMain.style.width = '';
                rightHead.style.width = rightMain.style.width = '';
                table.style.marginLeft = head.style.marginLeft = '';
                table.style.width = head.style.width = this._sTableWidth;
                leftHead.style.left = leftMain.style.left = '';
                rightHead.style.left = rightMain.style.left = '';
                leftMain.style.top = rightMain.style.top = '';
            },

            /**
             * @override
             */
            $scroll: function (event) {
                ui.Table.prototype.$scroll.call(this, event);

                var leftHeadStyle = this._uLeftHead.getOuter().style,
                    rightHeadStyle = this._uRightHead.getOuter().style,
                    leftMainStyle = this._uLeftMain.getOuter().style,
                    rightMainStyle = this._uRightMain.getOuter().style;

                leftHeadStyle.position = rightHeadStyle.position = leftMainStyle.position = rightMainStyle.position = '';

                leftHeadStyle.top = rightHeadStyle.top = this.$getSection('Head').getOuter().style.top;

                leftHeadStyle.left = leftMainStyle.left = this.getLayout().scrollLeft + 'px';
                rightHeadStyle.left = rightMainStyle.left = (Math.min(this.getWidth(), this.$$tableWidth) - this.$$paddingRight + this.getLayout().scrollLeft - this.$$rightTDWidth - this.$$scrollFixed[0]) + 'px';
                leftMainStyle.top = rightMainStyle.top = (this.$$paddingTop + this.getLayout().scrollTop - dom.getParent(this.$getSection('Head').getOuter()).scrollTop) + 'px';
                leftMainStyle.clip = rightMainStyle.clip = ieVersion < 8 ? 'rect(0,100%,100%,0)' : 'auto';
            },

            /**
             * @override
             */
            addColumn: function (options, index) {
                if (index >= 0) {
                    if (index < this._nLeft) {
                        this._nLeft++;
                    }
                    if (index < this._nRight) {
                        this._nRight++;
                    }
                }
                return ui.Table.prototype.addColumn.call(this, options, index);
            },

            /**
             * @override
             */
            addRow: function (data, index) {
                var row = ui.Table.prototype.addRow.call(this, data, index),
                    el = row.getMain(),
                    leftBody = this._uLeftMain.getBody(),
                    rightBody = this._uRightMain.getBody(),
                    o = '<tr class="' + el.className + '" style="' + el.style.cssText + '"><td style="padding:0px;border:0px;width:0px"></td></tr>';

                index = this.getRows().indexOf(row);
                o = dom.create(
                    {
                        innerHTML: '<table cellspacing="0"><tbody>' + o + o + '</tbody></table>'
                    }
                ).lastChild.lastChild;

                initLockedRow(row, o.firstChild, o.lastChild);
                leftBody.insertBefore(o.firstChild, dom.children(leftBody)[index]);
                rightBody.insertBefore(o.firstChild, dom.children(rightBody)[index]);
                splitRow(this, row);

                return row;
            },

            /**
             * @override
             */
            removeColumn: function (index) {
                ui.Table.prototype.removeColumn.call(this, index);
                if (index >= 0) {
                    if (index < this._nLeft) {
                        this._nLeft--;
                    }
                    if (index < this._nRight) {
                        this._nRight--;
                    }
                }
            },

            /**
             * @override
             */
            removeRow: function (index) {
                var row = this.getRow(index);
                if (row) {
                    restoreRow(this, row);

                    var leftBody = this._uLeftMain.getBody(),
                        rightBody = this._uRightMain.getBody();

                    leftBody.removeChild(dom.children(leftBody)[index]);
                    rightBody.removeChild(dom.children(rightBody)[index]);

                    return ui.Table.prototype.removeRow.call(this, index);
                }
            }
        }
    );

    /**
     * 初始化需要执行关联控制的行控件鼠标事件的默认处理。
     * 行控件鼠标事件发生时，需要通知关联的行控件也同步产生默认的处理。
     */
    eventNames.forEach(function (item) {
        ui.LockedTable.prototype.Row.prototype['$' + item] = function (event) {
            ui.Table.prototype.Row.prototype['$' + item].call(this, event);
            dom.getParent(this._eLeft).className = dom.getParent(this._eRight).className = this.getMain().className;
        };
    });
}());
