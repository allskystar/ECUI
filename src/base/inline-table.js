/*
@example
<div ui="type:inline-table">
    <table>
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
            <tr class="ui-hide">
                <td colspan="4">百度（纳斯达克：BIDU），全球最大的中文搜索引擎、最大的中文网站。百度愿景是：成为最懂用户，并能帮助人们成长的全球顶级高科技公司。</td>
            </tr>
        </tbody>
    </table>
</div>
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    function initExtendRow(row) {
        dom.addClass(row.getMain(), row.getParent().getUnitClass(ui.InlineTable, 'extend-row'));
        row.setMerge(true);
        row.hide();
    }

    /**
     * 内联表格控件。
     * 允许表格行的详细内容在表格内展开，实际的两行对应逻辑上的一行数据。
     * @control
     */
    ui.InlineTable = core.inherits(
        ui.Table,
        'ui-inline-table',
        function (el, options) {
            _super(el, options);
            _super.getRows().forEach(function (item, index) {
                if (index % 2) {
                    initExtendRow(item);
                }
            });
        },
        {
            /**
             * @override
             */
            $rowclick: function (event) {
                _super.$rowclick(event);
                var rows = _super.getRows(),
                    index = rows.indexOf(event.row),
                    row;

                if (!(index % 2)) {
                    row = rows[index + 1];
                    if (row.isShow()) {
                        event.row.alterStatus('-expand');
                        row.hide();
                    } else {
                        event.row.alterStatus('+expand');
                        row.show();
                    }
                }
            },

            /**
             * @override
             */
            addRow: function (data, index) {
                if (data instanceof HTMLElement || (!(data[0] instanceof HTMLElement) && !(data[0] instanceof ui.Control))) {
                    var row = data,
                        extend = dom.create({ innerHTML: '<table><tbody><tr><td colspan="' + this.getHCells().filter(function (hcell) {
                            return hcell.isShow();
                        }).length + '"></td></tr></tbody></table>' }).lastChild.lastChild.lastChild;
                } else {
                    row = data[0];
                    extend = data[1];
                }
                row = _super.addRow(row, index * 2);
                initExtendRow(_super.addRow(extend, index * 2 + 1));
                return row;
            },

            /**
             * 获取扩展的行。
             * @public
             *
             * @return {ecui.ui.Table.Row} 扩展的行控件
             */
            getExtendRow: function (index) {
                return _super.getRow(index * 2 + 1);
            },

            /**
             * @override
             */
            getRow: function (index) {
                return _super.getRow(index * 2);
            },

            /**
             * @override
             */
            getRowCount: function () {
                return _super.getRowCount() / 2;
            },

            /**
             * @override
             */
            getRows: function () {
                return _super.getRows().filter(function (item, index) {
                    return index % 2;
                });
            },

            /**
             * @override
             */
            removeRow: function (index) {
                return [_super.removeRow(index * 2), _super.removeRow(index * 2)];
            }
        }
    );
})();
