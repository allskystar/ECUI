describe('表格控件初始化测试', {
    '宽度控制': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:300px';
        el.innerHTML = '<table cellspacing="0" cellpadding="0" border="0"><tr><td style="width:80px"></td>'
            + '<td style="width:120px"></td></tr></table>';

        var ctrl = ecui.create('LockedTable', {element: el, parent: document.body});
        value_of(ctrl.getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getCol(1).getWidth()).should_be(120);
        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '表头多行': function () {
    },

    '内容跨行列': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:300px';
        el.innerHTML = '<table cellspacing="0" cellpadding="0" border="0"><tr><td style="width:80px"></td>'
            + '<td style="width:40px"></td><td style="width:40px"></td><td style="width:40px"></td></tr>'
            + '<tr><td colspan="2"></td><td></td><td></td></tr>'
            + '<tr><td></td><td></td><td></td><td></td></tr></table>';

        var ctrl = ecui.create('LockedTable', {element: el, parent: document.body, leftLock: 2, rightLock: 1});
        value_of(ctrl.getRow(0).getCols().length).should_be(4);
        value_of(ctrl.getRow(0).getCol(0).getWidth()).should_be(120);
        value_of(ctrl.getRow(0).getCol(1)).should_be(null);
        value_of(ctrl.getRow(0).getCol(2).getWidth()).should_be(40);
        value_of(ctrl.getRow(0).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(1).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(2).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(3).getWidth()).should_be(40);
        ctrl.setParent();
        ecui.dispose(ctrl);
    }
});

describe('表格功能测试', {
    '访问行/列/单元格(getCell/getCol/getCols/getRow/getRows)': function () {
        var el = document.createElement('div');
        el.style.cssText = 'height:300px';
        el.innerHTML = '<table cellspacing="0" cellpadding="0" border="0"><tr><td style="width:80px"></td>'
            + '<td style="width:40px"></td><td style="width:40px"></td><td style="width:40px"></td></tr>'
            + '<tr><td colspan="2"></td><td></td><td></td></tr>'
            + '<tr><td></td><td></td><td></td><td></td></tr></table>';
        var ctrl = ecui.create('LockedTable', {element: el, parent: document.body, leftLock: 2, rightLock: 1}),
            row = ctrl.getRow(1);

        value_of(ctrl.getRows() !== ctrl.getRows()).should_be_true();
        value_of(ctrl.getCols() !== ctrl.getCols()).should_be_true();
        value_of(row.getCols() !== row.getCols()).should_be_true();
        value_of(ctrl.getCell(1, 0)).should_be(row.getCol(0));

        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '列宽度变化，自适应大小(hide/setSize/show)': function () {
        var el = document.createElement('div');
        el.style.cssText = 'height:300px';
        el.innerHTML = '<table cellspacing="0" cellpadding="0" border="0"><tr><td style="width:80px"></td>'
            + '<td style="width:40px"></td><td style="width:40px"></td><td style="width:40px"></td></tr>'
            + '<tr><td colspan="2"></td><td></td><td></td></tr>'
            + '<tr><td></td><td></td><td></td><td></td></tr></table>';
        var ctrl = ecui.create('LockedTable', {element: el, parent: document.body, leftLock: 2, rightLock: 1});

        ctrl.getCol(1).hide();
        value_of(ctrl.getRow(0).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(0).getCol(1)).should_be(null);
        value_of(ctrl.getRow(0).getCol(2).getWidth()).should_be(40);
        value_of(ctrl.getRow(0).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(1).getWidth()).should_be(0);
        value_of(ctrl.getRow(1).getCol(2).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getWidth()).should_be(160);

        ctrl.getCol(1).show();
        value_of(ctrl.getRow(0).getCol(0).getWidth()).should_be(120);
        value_of(ctrl.getRow(0).getCol(1)).should_be(null);
        value_of(ctrl.getRow(0).getCol(2).getWidth()).should_be(40);
        value_of(ctrl.getRow(0).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(1).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(2).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getWidth()).should_be(200);

        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '列宽度变化，不自适应大小(hide/setSize/show)': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:300px';
        el.innerHTML = '<table cellspacing="0" cellpadding="0" border="0"><tr><td style="width:80px"></td>'
            + '<td style="width:40px"></td><td style="width:40px"></td><td style="width:40px"></td></tr>'
            + '<tr><td colspan="2"></td><td></td><td></td></tr>'
            + '<tr><td></td><td></td><td></td><td></td></tr></table>';
        var ctrl = ecui.create('LockedTable', {element: el, parent: document.body, leftLock: 2, rightLock: 1});

        ctrl.getCol(1).hide();
        value_of(ctrl.getRow(0).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(0).getCol(1)).should_be(null);
        value_of(ctrl.getRow(0).getCol(2).getWidth()).should_be(40);
        value_of(ctrl.getRow(0).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(1).getWidth()).should_be(0);
        value_of(ctrl.getRow(1).getCol(2).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getWidth()).should_be(200);

        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '增加/删除列(addCol/removeCol)': function () {
        var el = document.createElement('div');
        el.style.cssText = 'height:300px';
        el.innerHTML = '<table cellspacing="0" cellpadding="0" border="0"><tr><td style="width:80px"></td>'
            + '<td style="width:40px"></td><td style="width:40px"></td><td style="width:40px"></td></tr>'
            + '<tr><td colspan="2"></td><td></td><td></td></tr>'
            + '<tr><td></td><td></td><td></td><td></td></tr></table>';
        var ctrl = ecui.create('LockedTable', {element: el, parent: document.body, leftLock: 2, rightLock: 1});

        ctrl.addCol({width: 40, base: 'custom', title: 'new'}, 1);
        value_of(ctrl.getCol(1).getClass()).should_be('custom-head');
        value_of(ctrl.getCell(1, 1).getClass()).should_be('custom-item');
        value_of(ctrl.getRow(0).getCol(0).getWidth()).should_be(160);
        value_of(ctrl.getRow(0).getCol(2)).should_be(null);
        value_of(ctrl.getRow(0).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getRow(0).getCol(4).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(1).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(2).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(4).getWidth()).should_be(40);

        ctrl.removeCol(1);
        value_of(ctrl.getRow(0).getCol(0).getWidth()).should_be(120);
        value_of(ctrl.getRow(0).getCol(1)).should_be(null);
        value_of(ctrl.getRow(0).getCol(2).getWidth()).should_be(40);
        value_of(ctrl.getRow(0).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(1).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(2).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(3).getWidth()).should_be(40);

        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '增加/删除行(addRow/addRows/removeRow/removeRows)': function () {
        // 未实现
    }
})
