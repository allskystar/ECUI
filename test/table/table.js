describe('表格控件初始化测试', {
    '宽度控制': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:300px';
        el.innerHTML = '<table cellspacing="0" cellpadding="0" border="0"><tr><td style="width:80px"></td>'
            + '<td style="width:120px"></td></tr></table>';

        var ctrl = ecui.create('Table', {element: el, parent: document.body});
        value_of(ctrl.getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getCol(1).getWidth()).should_be(120);
        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '表头多行': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:300px';
        el.innerHTML = '<table cellspacing="0" cellpadding="0" border="0"><thead><tr><td style="width:80px"></td>'
            + '<td style="width:120px" colspan="2"></td></tr><tr><td></td>'
            + '<td style="width:80px"></td><td style="width:40px"></td></tr></thead><tbody></tbody></table>';

        var ctrl = ecui.create('Table', {element: el, parent: document.body});
        value_of(ctrl.getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getCol(1).getWidth()).should_be(80);
        value_of(ctrl.getCol(2).getWidth()).should_be(40);
        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '内容跨行列': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:300px';
        el.innerHTML = '<table cellspacing="0" cellpadding="0" border="0"><tr><td style="width:80px"></td>'
            + '<td style="width:40px"></td><td style="width:40px"></td><td style="width:40px"></td></tr>'
            + '<tr><td colspan="2"></td><td colspan="2"></td></tr>'
            + '<tr><td></td><td colspan="2" rowspan="2"></td><td></td></tr>'
            + '<tr><td></td><td></td></tr>'
            + '<tr><td></td><td></td><td></td><td></td></tr></table>';

        var ctrl = ecui.create('Table', {element: el, parent: document.body, crossCell: true});
        value_of(ctrl.getRow(0).getCols().length).should_be(4);
        value_of(ctrl.getRow(0).getCol(0).getWidth()).should_be(120);
        value_of(ctrl.getRow(0).getCol(1)).should_be(null);
        value_of(ctrl.getRow(0).getCol(2).getWidth()).should_be(80);
        value_of(ctrl.getRow(0).getCol(3)).should_be(null);
        value_of(ctrl.getRow(1).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(1).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(2)).should_be(null);
        value_of(ctrl.getRow(1).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getRow(2).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(2).getCol(1)).should_be(null);
        value_of(ctrl.getRow(2).getCol(2)).should_be(null);
        value_of(ctrl.getRow(2).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getRow(3).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(3).getCol(1).getWidth()).should_be(40);
        value_of(ctrl.getRow(3).getCol(2).getWidth()).should_be(40);
        value_of(ctrl.getRow(3).getCol(3).getWidth()).should_be(40);
        ctrl.setParent();
        ecui.dispose(ctrl);
    }
});

describe('表格功能测试', {
    '访问行/列/单元格(getCell/getCol/getCols/getRow/getRows)': function () {
        var el = document.createElement('div');
        el.style.cssText = 'height:300px';
        el.innerHTML = '<table cellspacing="0" cellpadding="0"><tr><td style="width:80px"></td>'
            + '<td style="width:40px"></td><td style="width:40px"></td><td style="width:40px"></td></tr>'
            + '<tr><td colspan="2"></td><td colspan="2"></td></tr>'
            + '<tr><td></td><td colspan="2" rowspan="2"></td><td></td></tr>'
            + '<tr><td></td><td></td></tr>'
            + '<tr><td></td><td></td><td></td><td></td></tr></table>';
        var ctrl = ecui.create('Table', {element: el, parent: document.body, crossCell: true}),
            row = ctrl.getRow(3);

        value_of(ctrl.getRows() !== ctrl.getRows()).should_be_true();
        value_of(ctrl.getCols() !== ctrl.getCols()).should_be_true();
        value_of(row.getCols() !== row.getCols()).should_be_true();
        value_of(ctrl.getCell(3, 0)).should_be(row.getCol(0));

        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '列宽度变化，自适应大小(hide/setSize/show)': function () {
        var el = document.createElement('div');
        el.style.cssText = 'height:300px';
        el.innerHTML = '<table cellspacing="0" cellpadding="0"><tr><td style="width:80px"></td>'
            + '<td style="width:40px"></td><td style="width:40px"></td><td style="width:40px"></td></tr>'
            + '<tr><td colspan="2"></td><td colspan="2"></td></tr>'
            + '<tr><td></td><td colspan="2" rowspan="2"></td><td></td></tr>'
            + '<tr><td></td><td></td></tr>'
            + '<tr><td></td><td></td><td></td><td></td></tr></table>';
        var ctrl = ecui.create('Table', {element: el, parent: document.body, crossCell: true});

        ctrl.getCol(1).hide();
        value_of(ctrl.getRow(0).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(0).getCol(2).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(1).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getRow(2).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(2).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getRow(3).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(3).getCol(1).getWidth()).should_be(0);
        value_of(ctrl.getRow(3).getCol(2).getWidth()).should_be(40);
        value_of(ctrl.getRow(3).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getWidth()).should_be(160);

        ctrl.getCol(2).hide();
        value_of(ctrl.getRow(0).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(0).getCol(2).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(1).getWidth()).should_be(0);
        value_of(ctrl.getRow(1).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getRow(2).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(2).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getRow(3).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(3).getCol(1).getWidth()).should_be(0);
        value_of(ctrl.getRow(3).getCol(2).getWidth()).should_be(0);
        value_of(ctrl.getRow(3).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getWidth()).should_be(120);

        ctrl.getCol(1).show();
        value_of(ctrl.getRow(0).getCol(0).getWidth()).should_be(120);
        value_of(ctrl.getRow(0).getCol(2).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(1).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getRow(2).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(2).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getRow(3).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(3).getCol(1).getWidth()).should_be(40);
        value_of(ctrl.getRow(3).getCol(2).getWidth()).should_be(0);
        value_of(ctrl.getRow(3).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getWidth()).should_be(160);

        ctrl.getCol(1).setSize(80);
        value_of(ctrl.getRow(0).getCol(0).getWidth()).should_be(160);
        value_of(ctrl.getRow(0).getCol(2).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(1).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getRow(2).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(2).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getRow(3).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(3).getCol(1).getWidth()).should_be(80);
        value_of(ctrl.getRow(3).getCol(2).getWidth()).should_be(0);
        value_of(ctrl.getRow(3).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getWidth()).should_be(200);

        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '增加/删除列(addCol/removeCol)': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:300px';
        el.innerHTML = '<table cellspacing="0" cellpadding="0"><tr><td style="width:80px"></td>'
            + '<td style="width:40px"></td><td style="width:40px"></td><td style="width:40px"></td></tr>'
            + '<tr><td colspan="2"></td><td colspan="2"></td></tr>'
            + '<tr><td></td><td colspan="2" rowspan="2"></td><td></td></tr>'
            + '<tr><td></td><td></td></tr>'
            + '<tr><td></td><td></td><td></td><td></td></tr></table>';
        var ctrl = ecui.create('Table', {element: el, parent: document.body, crossCell: true});

        ctrl.addCol({width: 40, base: 'custom', title: 'new'}, 1);
        value_of(ctrl.getCol(1).getClass()).should_be('custom-head');
        value_of(ctrl.getCell(1, 1).getClass()).should_be('custom-item');
        value_of(ctrl.getRow(0).getCol(0).getWidth()).should_be(160);
        value_of(ctrl.getRow(0).getCol(3).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(1).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(2).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(4).getWidth()).should_be(40);
        value_of(ctrl.getRow(2).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(1).getWidth()).should_be(40);
        value_of(ctrl.getRow(2).getCol(4).getWidth()).should_be(40);
        value_of(ctrl.getRow(3).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(3).getCol(1).getWidth()).should_be(40);
        value_of(ctrl.getRow(3).getCol(2).getWidth()).should_be(40);
        value_of(ctrl.getRow(3).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getRow(3).getCol(4).getWidth()).should_be(40);

        ctrl.removeCol(1);
        value_of(ctrl.getRow(0).getCol(0).getWidth()).should_be(120);
        value_of(ctrl.getRow(0).getCol(2).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(1).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getRow(2).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(2).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getRow(3).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(3).getCol(1).getWidth()).should_be(40);
        value_of(ctrl.getRow(3).getCol(2).getWidth()).should_be(40);
        value_of(ctrl.getRow(3).getCol(3).getWidth()).should_be(40);

        ctrl.addCol({width: 40, base: 'custom', title: 'new'}, 2);
        value_of(ctrl.getRow(0).getCol(0).getWidth()).should_be(120);
        value_of(ctrl.getRow(0).getCol(2).getWidth()).should_be(40);
        value_of(ctrl.getRow(0).getCol(3).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(1).getWidth()).should_be(120);
        value_of(ctrl.getRow(1).getCol(4).getWidth()).should_be(40);
        value_of(ctrl.getRow(2).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(2).getCol(2)).should_be(null);
        value_of(ctrl.getRow(2).getCol(4).getWidth()).should_be(40);
        value_of(ctrl.getRow(3).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(3).getCol(1).getWidth()).should_be(40);
        value_of(ctrl.getRow(3).getCol(2).getWidth()).should_be(40);
        value_of(ctrl.getRow(3).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getRow(3).getCol(4).getWidth()).should_be(40);

        ctrl.removeCol(1);
        value_of(ctrl.getRow(0).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(0).getCol(1).getWidth()).should_be(40);
        value_of(ctrl.getRow(0).getCol(2).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(1).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getRow(2).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(2).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getRow(3).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(3).getCol(1).getWidth()).should_be(40);
        value_of(ctrl.getRow(3).getCol(2).getWidth()).should_be(40);
        value_of(ctrl.getRow(3).getCol(3).getWidth()).should_be(40);

        ctrl.removeCol(1);
        value_of(ctrl.getRow(0).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(0).getCol(1).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(1).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(2).getWidth()).should_be(40);
        value_of(ctrl.getRow(2).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(2).getCol(2).getWidth()).should_be(40);
        value_of(ctrl.getRow(3).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(3).getCol(1).getWidth()).should_be(40);
        value_of(ctrl.getRow(3).getCol(2).getWidth()).should_be(40);

        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '增加/删除行，普通操作(addRow/removeRow)': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:300px';
        el.innerHTML = '<table cellspacing="0" cellpadding="0"><tr><td style="width:80px"></td>'
            + '<td style="width:40px"></td><td style="width:40px"></td><td style="width:40px"></td></tr>'
            + '<tr><td></td><td></td><td></td><td></td></tr></table>';
        var ctrl = ecui.create('Table', {element: el, parent: document.body, crossCell: true});

        ctrl.addRow(['1', '2', '3', '4'], 1);
        value_of(ctrl.getCell(1, 0).getBase().innerHTML).should_be('1');
        value_of(ctrl.getCell(1, 1).getBase().innerHTML).should_be('2');
        value_of(ctrl.getCell(1, 2).getBase().innerHTML).should_be('3');
        value_of(ctrl.getCell(1, 3).getBase().innerHTML).should_be('4');
        value_of(ctrl.getRow(0).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(0).getCol(1).getWidth()).should_be(40);
        value_of(ctrl.getRow(0).getCol(2).getWidth()).should_be(40);
        value_of(ctrl.getRow(0).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(1).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(2).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(3).getWidth()).should_be(40);

        ctrl.removeRow(0);
        value_of(ctrl.getCell(0, 0).getBase().innerHTML).should_be('1');
        value_of(ctrl.getCell(0, 1).getBase().innerHTML).should_be('2');
        value_of(ctrl.getCell(0, 2).getBase().innerHTML).should_be('3');
        value_of(ctrl.getCell(0, 3).getBase().innerHTML).should_be('4');

        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '增加行，跨行跨列增加(addRow)': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:300px';
        el.innerHTML = '<table cellspacing="0" cellpadding="0"><tr><td style="width:80px"></td>'
            + '<td style="width:40px"></td><td style="width:40px"></td><td style="width:40px"></td></tr>'
            + '<tr><td></td><td></td><td></td><td></td></tr></table>';
        var ctrl = ecui.create('Table', {element: el, parent: document.body, crossCell: true});

        ctrl.addRow(['1', '2', false, '4'], 1);
        value_of(ctrl.getRow(1).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(1).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(2)).should_be(null);
        value_of(ctrl.getRow(1).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getRow(0).getCol(2).getBase().getAttribute('rowSpan')).should_be('2');

        ctrl.addRow(['1', '2', null, '4'], 2);
        value_of(ctrl.getRow(2).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(2).getCol(1).getWidth()).should_be(80);
        value_of(ctrl.getRow(2).getCol(2)).should_be(null);
        value_of(ctrl.getRow(2).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getRow(2).getCol(1).getBase().getAttribute('colSpan')).should_be('2');

        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '增加/删除行，在跨行的两行之间(addRow/removeRow)': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:300px';
        el.innerHTML = '<table cellspacing="0" cellpadding="0"><tr><td style="width:80px"></td>'
            + '<td style="width:40px"></td><td style="width:40px"></td><td style="width:40px"></td></tr>'
            + '<tr><td></td><td></td><td rowspan="2"></td><td></td></tr>'
            + '<tr><td></td><td></td><td></td></tr></table>';
        var ctrl = ecui.create('Table', {element: el, parent: document.body, crossCell: true});

        ctrl.addRow(['1', '2', '3', '4'], 1);
        value_of(ctrl.getRow(1).getCol(0).getWidth()).should_be(80);
        value_of(ctrl.getRow(1).getCol(1).getWidth()).should_be(40);
        value_of(ctrl.getRow(1).getCol(2)).should_be(null);
        value_of(ctrl.getRow(1).getCol(3).getWidth()).should_be(40);
        value_of(ctrl.getRow(0).getCol(2).getBase().getAttribute('rowSpan')).should_be('3');

        ctrl.removeRow(1);
        value_of(ctrl.getRow(0).getCol(2).getBase().getAttribute('rowSpan')).should_be('2');

        ctrl.addRow(['1', '2', '3', '4'], 1);
        ctrl.removeRow(0);
        value_of(ctrl.getRow(0).getCol(2).getBase().getAttribute('rowSpan')).should_be('2');

        ctrl.setParent();
        ecui.dispose(ctrl);
    }/*,

    '行/单元格事件': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:300px';
        el.innerHTML = '<table cellspacing="0" cellpadding="0"><tr><td style="width:80px"></td>'
            + '<td style="width:40px"></td><td style="width:40px"></td><td style="width:40px"></td></tr>'
            + '<tr><td></td><td></td><td></td><td></td></tr></table>';
        var ctrl = ecui.create('Table', {element: el, parent: document.body, crossCell: true}),
            el = ctrl.getCell(0, 0).getBase(),
            result = [];

        ctrl.onrowdown = function () {
            result.push('rowdown');
        };

        ctrl.onrowover = function () {
            result.push('rowover');
        };

        ctrl.onrowmove = function () {
            result.push('rowmove');
        };

        ctrl.onrowout = function () {
            result.push('rowout');
        };

        ctrl.onrowup = function () {
            result.push('rowup');
        };

        ctrl.onrowclick = function () {
            result.push('rowclick');
        };

        ctrl.oncelldown = function () {
            result.push('celldown');
        };

        ctrl.oncellover = function () {
            result.push('cellover');
        };

        ctrl.oncellmove = function () {
            result.push('cellmove');
        };

        ctrl.oncellout = function () {
            result.push('cellout');
        };

        ctrl.oncellup = function () {
            result.push('cellup');
        };

        ctrl.oncellclick = function () {
            result.push('cellclick');
        };

        uiut.MockEvents.mouseover(el);
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mousemove(el);
        uiut.MockEvents.mouseup(el);
        uiut.MockEvents.mouseout(el);
        uiut.MockEvents.mouseover(document.body);
        value_of(result).should_be(
            ['cellover', 'rowover', 'celldown', 'rowdown', 'cellmove', 'rowmove', 'cellup', 'rowup', 'cellclick', 'cellout', 'rowout']
        );

        ctrl.setParent();
        ecui.dispose(ctrl);
    }*/
})
