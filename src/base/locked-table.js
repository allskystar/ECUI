/*
@example
<div ui="type:locked-table;left-lock:1" style="width:600px">
    <table style="width:750px">
        <thead>
            <tr>
                <th style="width:200px;">公司名</th>
                <th style="width:200px;">url</th>
                <th style="width:250px;">地址</th>
                <th style="width:100px;">创办时间</th>
            </tr>
        </thead>
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

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined,
        safariVersion = !/(chrome|crios|ucbrowser)/i.test(navigator.userAgent) && /(\d+\.\d)(\.\d)?\s+.*safari/i.test(navigator.userAgent) ? +RegExp.$1 : undefined;
//{/if}//
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
            _super(el, options);

            this.tableWidth = dom.parent(this.getBody()).style.width;

            var i = 0,
                headRows = this.getHRows(),
                rows = this.getRows(),
                totalRows = headRows.concat(rows),
                layout = this.getLayout(),
                list = [],
                o;

            this.rightLock = this.getColumnCount() - (options.rightLock || 0);

            totalRows.forEach(function (item, index) {
                item = item.getMain();
                list[index] = '<tr class="' + item.className + '" style="' + item.style.cssText + '"><td class="ui-locked-table-empty"></td></tr>';
            });

            o = '<table cellspacing="0" class="' + this.getUnitClass(ui.LockedTable, '{0}') + ' ' + this.getUnitClass(ui.LockedTable, 'body') + ' ' + dom.parent(this.getBody()).className + '"><tbody>' + list.splice(headRows.length, rows.length).join('') + '</tbody></table><table cellspacing="0" class="' + this.getUnitClass(ui.LockedTable, '{0}') + ' ' + this.$getSection('Head').getMain().className + '"><thead>' + list.join('') + '</thead></table>';
            if (core.getScrollNarrow()) {
                layout = el;
            }
            dom.insertHTML(
                layout,
                'beforeEnd',
                '<div class="' + this.getUnitClass(ui.LockedTable, 'fill') + '"></div>' + util.stringFormat(o, 'right') + util.stringFormat(o, 'left')
            );
            el = layout.lastChild;
            for (i = 0; i < 4; i++) {
                list[i] = el;
                el = el.previousSibling;
            }
            this.fill = el;

            var left = this.$LeftHead = core.$fastCreate(ui.Control, list[0], this),
                right = this.$RightHead = core.$fastCreate(ui.Control, list[2], this);

            left.$setBody(left = left.getMain().firstChild);
            right.$setBody(right = right.getMain().firstChild);

            for (i = 0, left = dom.children(left), right = dom.children(right); el = left[i]; ) {
                headRows[i]._init(el, right[i++]);
            }

            left = this.$LeftBody = core.$fastCreate(ui.Control, list[1], this);
            right = this.$RightBody = core.$fastCreate(ui.Control, list[3], this);
            left.$setBody(left = left.getMain().lastChild);
            right.$setBody(right = right.getMain().lastChild);

            for (i = 0, left = dom.children(left), right = dom.children(right); el = left[i]; ) {
                ui.LockedTable.prototype.Row._cast(rows[i])._init(el, right[i++]);
            }
        },
        {
            DEFAULT_OPTIONS: {
                leftLock: Number(0)
            },

            private: {
                tableWidth: undefined
            },

            protected: {
                $LockedHead: undefined,
                $LeftHead: undefined,
                $LeftBody: undefined,
                $RightHead: undefined,
                $RightBody: undefined
            },

            final: ['$LockedHead', '$LeftHead', '$LeftBody', '$RightHead', '$RightBody'],

            /**
             * 行部件。
             * @unit
             */
            Row: core.inherits(
                ui.Table.prototype.Row,
                {
                    private: {
                        left: undefined,
                        right: undefined,
                        empty: false,

                        /**
                         * 建立锁定行控件。
                         * @private
                         *
                         * @param {HTMLElement} left 左侧锁定行的 Element 元素
                         * @param {HTMLElement} right 右侧锁定行的 Element 元素
                         */
                        _init: function (left, right) {
                            core.$bind(left, this);
                            core.$bind(right, this);
                            this.left = left;
                            this.right = right;
                        }
                    },

                    /**
                     * @override
                     */
                    $click: function (event) {
                        _super.$click(event);
                        dom.parent(this.left).className = dom.parent(this.right).className = this.getMain().className;
                    },

                    /**
                     * @override
                     */
                    $dispose: function () {
                        this.left = this.right = null;
                        _super.$dispose();
                    },

                    /**
                     * @override
                     */
                    $initStructure: function (width, height) {
                        _super.$initStructure(width, height);

                        var table = this.getParent(),
                            elements = this.$getElements(),
                            body = this.getBody();

                        table.getHCells().forEach(
                            function (item, index) {
                                if (item = elements[index]) {
                                    if (index < ui.LockedTable._cast(table).leftLock) {
                                        this.left.insertBefore(item, this.left.lastChild);
                                    } else if (index >= table.rightLock) {
                                        this.right.appendChild(item);
                                    }
                                }
                            },
                            this
                        );

                        if (body.innerHTML.trim()) {
                            this.left.lastChild.style.width = (table.getClientWidth() - table.$$leftTDWidth - table.$$paddingLeft) + 'px';
                        } else {
                            this.empty = dom.getAttribute(this.left.lastChild.previousSibling, 'colSpan') || ' ';
                            this.left.lastChild.previousSibling.setAttribute('colSpan', 2);
                            dom.addClass(this.left.lastChild, 'ui-hide');
                            if (ieVersion < 9) {
                                body.appendChild(dom.create('TD', {className: table.getUnitClass(ui.Table, table.getHRows().indexOf(this) < 0 ? 'cell' : 'hcell')}));
                            } else {
                                body.innerHTML = '<td class="' + table.getUnitClass(ui.Table, table.getHRows().indexOf(this) < 0 ? 'cell' : 'hcell') + '"></td>';
                            }
                        }

                        this.left.style.height = this.right.style.height = this.getMain().style.height = this.getHeight() + 'px';
                    },

                    /**
                     * @override
                     */
                    $restoreStructure: function () {
                        var table = this.getParent(),
                            elements = this.$getElements(),
                            el = this.getBody(),
                            row = this.getMain();

                        this.left.style.height = this.right.style.height = this.getMain().style.height = '';

                        if (this.empty) {
                            this.left.lastChild.previousSibling.setAttribute('colSpan', this.empty);
                            dom.removeClass(this.left.lastChild, 'ui-hide');
                            delete this.empty;
                            if (ieVersion < 9) {
                                el.removeChild(el.firstChild);
                            } else {
                                el.innerHTML = '';
                            }
                        }

                        el = row.firstChild;

                        table.getHCells().forEach(function (item, index) {
                            if (item = elements[index]) {
                                if (index < ui.LockedTable._cast(table).leftLock) {
                                    row.insertBefore(item, el);
                                } else if (index >= table.rightLock) {
                                    row.appendChild(item);
                                }
                            }
                        });

                        _super.$restoreStructure();
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
                var layout = this.getLayout(),
                    pos = dom.getPosition(layout),
                    view = util.getView(),
                    top = pos.top - view.top,
                    left = pos.left - view.left,
                    leftHeadStyle = this.$LeftHead.getMain().style,
                    rightHeadStyle = this.$RightHead.getMain().style,
                    leftMainStyle = this.$LeftBody.getMain().style,
                    rightMainStyle = this.$RightBody.getMain().style,
                    fixed = dom.contain(this.getMain(), event.target) && event.deltaY;

                if (this.$getSection('Head').getMain().style.position === 'fixed' || fixed) {
                    leftHeadStyle.position = rightHeadStyle.position = 'fixed';
                    leftHeadStyle.top = rightHeadStyle.top = this.$$fixedTop + 'px';
                    leftHeadStyle.left = left + 'px';
                    rightHeadStyle.left = (Math.min(this.getClientWidth(), this.$$tableWidth) - this.$$paddingRight + left - this.$$rightTDWidth - this.$$scrollFixed[0]) + 'px';
                }

                if (fixed) {
                    leftMainStyle.position = rightMainStyle.position = 'fixed';
                    leftMainStyle.left = leftHeadStyle.left;
                    rightMainStyle.left = rightHeadStyle.left;
                    var scrollTop = (core.getScrollNarrow() ? layout.scrollTop : layout.firstChild.scrollTop) - this.$$paddingTop;
                    leftMainStyle.top = rightMainStyle.top = top - scrollTop + 'px';
                    leftMainStyle.clip = 'rect(' + scrollTop + 'px ' + this.$$paddingLeft + 'px ' + (scrollTop + this.getClientHeight() - this.$$scrollFixed[1]) + 'px 0px)';
                    rightMainStyle.clip = 'rect(' + scrollTop + 'px ' + this.$$paddingRight + 'px ' + (scrollTop + this.getClientHeight() - this.$$scrollFixed[1]) + 'px 0px)';
                }
            },

            /**
             * @override
             */
            $cache: function (style) {
                _super.$cache(style);

                this.$$paddingLeft = 0;

                for (var i = 0, list = this.getHCells(); i < this.leftLock; ) {
                    this.$$paddingLeft += list[i++].getWidth();
                }

                this.$$paddingRight = 0;
                for (i = this.rightLock; i < list.length; ) {
                    this.$$paddingRight += list[i++].getWidth();
                }

                this.$$leftTDWidth = (safariVersion ? 1 : 0) + this.$LeftHead.$$border[1] + this.$LeftHead.$$border[3];
                this.$$rightTDWidth = (safariVersion ? 1 : 0) + this.$RightHead.$$border[1] + this.$RightHead.$$border[3];
            },

            /**
             * @override
             */
            $dispose: function () {
                this.fill = null;
                _super.$dispose();
            },

            /**
             * @override
             */
            $headscroll: function () {
                _super.$headscroll();

                var leftHeadStyle = this.$LeftHead.getMain().style,
                    rightHeadStyle = this.$RightHead.getMain().style,
                    leftMainStyle = this.$LeftBody.getMain().style,
                    rightMainStyle = this.$RightBody.getMain().style;

                leftHeadStyle.position = rightHeadStyle.position = leftMainStyle.position = rightMainStyle.position = '';
                leftHeadStyle.top = rightHeadStyle.top = this.$getSection('Head').getMain().style.top;

                if (core.getScrollNarrow()) {
                    leftHeadStyle.left = leftMainStyle.left = '0px';
                    rightHeadStyle.left = rightMainStyle.left = (Math.min(this.getWidth(), this.$$tableWidth) - this.$$paddingRight - this.$$rightTDWidth - this.$$scrollFixed[0]) + 'px';
                    leftMainStyle.top = rightMainStyle.top = (this.$$paddingTop - this.getLayout().scrollTop) + 'px';
                } else {
                    leftHeadStyle.left = leftMainStyle.left = this.getLayout().scrollLeft + 'px';
                    rightHeadStyle.left = rightMainStyle.left = (Math.min(this.getWidth(), this.$$tableWidth) - this.$$paddingRight + this.getLayout().scrollLeft - this.$$rightTDWidth - this.$$scrollFixed[0]) + 'px';
                    leftMainStyle.top = rightMainStyle.top = (this.$$paddingTop - this.getLayout().firstChild.scrollTop - dom.parent(this.$getSection('Head').getMain()).scrollTop) + 'px';
                    leftMainStyle.clip = rightMainStyle.clip = ieVersion < 8 ? 'rect(0,100%,100%,0)' : 'auto';
                }
            },

            /**
             * @override
             */
            $initStructure: function (width, height) {
                _super.$initStructure(width, height);

                var table = dom.parent(this.getBody()),
                    head = this.$getSection('Head').getMain().lastChild,
                    layout = this.getLayout();

                this.fill.style.width = this.$$tableWidth + 'px';
                this.$LeftHead.getMain().style.width = this.$LeftBody.getMain().style.width = (width - (layout.scrollHeight > layout.clientHeight ? core.getScrollNarrow() : 0)) + 'px';
                this.$RightHead.getMain().style.width = this.$RightBody.getMain().style.width = (this.$$rightTDWidth + this.$$paddingRight) + 'px';
                table.style.marginLeft = head.style.marginLeft = this.$$paddingLeft + 'px';
                table.style.width = head.style.width = (this.$$tableWidth - this.$$paddingLeft - this.$$paddingRight) + 'px';
                //dom.parent(head).style.width = this.$$tableWidth + 'px';
            },

            /**
             * @override
             */
            $restoreStructure: function (event) {
                _super.$restoreStructure(event);

                var leftHead = this.$LeftHead.getMain(),
                    rightHead = this.$RightHead.getMain(),
                    leftMain = this.$LeftBody.getMain(),
                    rightMain = this.$RightBody.getMain(),
                    table = dom.parent(this.getBody()),
                    head = this.$getSection('Head').getMain();

                this.fill.style.width = '';
                leftHead.style.width = leftMain.style.width = '';
                rightHead.style.width = rightMain.style.width = '';
                table.style.marginLeft = head.style.marginLeft = '';
                table.style.width = head.style.width = this.tableWidth;
                leftHead.style.left = leftMain.style.left = '';
                rightHead.style.left = rightMain.style.left = '';
                leftMain.style.top = rightMain.style.top = '';
            },

            /**
             * @override
             */
            addColumn: function (options, index) {
                if (index >= 0) {
                    if (index < this.leftLock) {
                        this.leftLock++;
                    }
                    if (index < this.rightLock) {
                        this.rightLock++;
                    }
                }
                return _super.addColumn(options, index);
            },

            /**
             * @override
             */
            addRow: function (data, index) {
                var row = _super.addRow(data, index),
                    el = row.getMain(),
                    leftBody = this.$LeftBody.getBody(),
                    rightBody = this.$RightBody.getBody(),
                    o = '<tr class="' + el.className + '" style="' + el.style.cssText + '"><td class="ui-locked-table-empty"></td></tr>';

                index = this.getRows().indexOf(row);
                o = dom.create(
                    {
                        innerHTML: '<table cellspacing="0"><tbody>' + o + o + '</tbody></table>'
                    }
                ).lastChild.lastChild;

                ui.LockedTable.prototype.Row._cast(row)._init(o.firstChild, o.lastChild);
                leftBody.insertBefore(o.firstChild, dom.children(leftBody)[index]);
                rightBody.insertBefore(o.firstChild, dom.children(rightBody)[index]);
                row.$initStructure();

                return row;
            },

            /**
             * @override
             */
            cache: function (force) {
                this.$LeftHead.cache(force);
                this.$RightHead.cache(force);
                this.getHeadRows().forEach(function (item) {
                    item.cache(force);
                });
                this.getRows().forEach(function (item) {
                    item.cache(force);
                });
                _super.cache(force);
            },

            /**
             * @override
             */
            removeColumn: function (index) {
                _super.removeColumn(index);
                if (index >= 0) {
                    if (index < this.leftLock) {
                        this.leftLock--;
                    }
                    if (index < this.rightLock) {
                        this.rightLock--;
                    }
                }
            },

            /**
             * @override
             */
            removeRow: function (index) {
                var row = this.getRow(index);
                if (row) {
                    row.$restoreStructure();

                    var leftBody = this.$LeftBody.getBody(),
                        rightBody = this.$RightBody.getBody();

                    leftBody.removeChild(dom.children(leftBody)[index]);
                    rightBody.removeChild(dom.children(rightBody)[index]);

                    return _super.removeRow(index);
                }
            }
        }
    );
}());
