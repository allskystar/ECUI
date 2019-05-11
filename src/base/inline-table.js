/*
@example
<div ui="type:inline-table">
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
      <tr>
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
            ui.Table.call(this, el, options);
            ui.Table.prototype.getRows.call(this).forEach(function (item, index) {
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
                ui.Table.prototype.$rowclick.call(this, event);
                var rows = ui.Table.prototype.getRows.call(this),
                    index = rows.indexOf(event.row),
                    row;

                if (!(index % 2)) {
                    row = rows[index + 1];
                    if (row.isShow()) {
                        row.hide();
                    } else {
                        row.show();
                    }
                }
            },

            /**
             * @override
             */
            addColumn: function (options, index) {
                ui.Table.prototype.addColumn.call(this, options, index);
            },

            /**
             * @override
             */
            addRow: function (data, index) {
                var row = ui.Table.prototype.addRow.call(this, data.slice(1), index * 2);
                initExtendRow(ui.Table.prototype.addRow.call(this, [data[0]], index * 2 + 1));
                return row;
            },

            /**
             * 获取扩展的行。
             * @public
             *
             * @return {ecui.ui.Table.Row} 扩展的行控件
             */
            getExtendRow: function (index) {
                return ui.Table.prototype.getRow.call(this, index * 2 + 1);
            },

            /**
             * @override
             */
            getRow: function (index) {
                return ui.Table.prototype.getRow.call(this, index * 2);
            },

            /**
             * @override
             */
            getRowCount: function () {
                return ui.Table.prototype.getRowCount.call(this) / 2;
            },

            /**
             * @override
             */
            getRows: function () {
                return ui.Table.prototype.getRows.call(this).filter(function (item, index) {
                    return index % 2;
                });
            }
        }
    );
}());
