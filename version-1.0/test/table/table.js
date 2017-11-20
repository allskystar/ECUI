describe('表格控件初始化测试', {
    '宽度控制': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:300px';
        el.innerHTML = '<table cellspacing="0" cellpadding="0" border="0"><tr><td style="width:80px"></td>'
            + '<td style="width:120px"></td></tr></table>';

        var control = ecui.create('Table', {main: el, parent: document.body});
        value_of(control.getHCell(0).getWidth()).should_be(80);
        value_of(control.getHCell(1).getWidth()).should_be(120);
        control.setParent();
        ecui.dispose(control);
    },

    '表头多行': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:300px';
        el.innerHTML = '<table cellspacing="0" cellpadding="0" border="0"><thead><tr><td style="width:80px"></td>'
            + '<td style="width:120px" colspan="2"></td></tr><tr><td></td>'
            + '<td style="width:80px"></td><td style="width:40px"></td></tr></thead><tbody></tbody></table>';

        var control = ecui.create('Table', {main: el, parent: document.body});
        value_of(control.getHCell(0).getWidth()).should_be(80);
        value_of(control.getHCell(1).getWidth()).should_be(80);
        value_of(control.getHCell(2).getWidth()).should_be(40);
        control.setParent();
        ecui.dispose(control);
    },
     
    '表头多行2': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:400px;height:300px';
        el.innerHTML = '<table cellspacing="0" cellpadding="0" border="0"><thead><tr><th colspan="2" style="width:200px">xxxx</th><th rowspan="2" style="width:100px">xxxx</th><th rowspan="2" style="width:100px">xxxx</th></tr><tr><th style="width:100px">xxx</th><th style="width:100px">xxx</th></tr></thead><tbody></tbody></table>';

        var control = ecui.create('Table', {main: el, parent: document.body});
        value_of(control.getHCell(0).getWidth()).should_be(100);
        value_of(control.getHCell(1).getWidth()).should_be(100);
        value_of(control.getHCell(2).getWidth()).should_be(100);
        value_of(control.getHCell(3).getWidth()).should_be(100);
        control.setParent();
        ecui.dispose(control);
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

        var control = ecui.create('Table', {main: el, parent: document.body, crossCell: true});
        value_of(control.getRow(0).getCells().length).should_be(4);
        value_of(control.getRow(0).getCell(0).getWidth()).should_be(120);
        value_of(control.getRow(0).getCell(1)).should_be(null);
        value_of(control.getRow(0).getCell(2).getWidth()).should_be(80);
        value_of(control.getRow(0).getCell(3)).should_be(null);
        value_of(control.getRow(1).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(1).getCell(1).getWidth()).should_be(80);
        value_of(control.getRow(1).getCell(2)).should_be(null);
        value_of(control.getRow(1).getCell(3).getWidth()).should_be(40);
        value_of(control.getRow(2).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(2).getCell(1)).should_be(null);
        value_of(control.getRow(2).getCell(2)).should_be(null);
        value_of(control.getRow(2).getCell(3).getWidth()).should_be(40);
        value_of(control.getRow(3).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(3).getCell(1).getWidth()).should_be(40);
        value_of(control.getRow(3).getCell(2).getWidth()).should_be(40);
        value_of(control.getRow(3).getCell(3).getWidth()).should_be(40);
        control.setParent();
        ecui.dispose(control);
    }
});

describe('表格功能测试', {
    '访问行/列/单元格(getCell/getHCell/getHCells/getRow/getRows)': function () {
        var el = document.createElement('div');
        el.style.cssText = 'height:300px';
        el.innerHTML = '<table cellspacing="0" cellpadding="0"><tr><td style="width:80px"></td>'
            + '<td style="width:40px"></td><td style="width:40px"></td><td style="width:40px"></td></tr>'
            + '<tr><td colspan="2"></td><td colspan="2"></td></tr>'
            + '<tr><td></td><td colspan="2" rowspan="2"></td><td></td></tr>'
            + '<tr><td></td><td></td></tr>'
            + '<tr><td></td><td></td><td></td><td></td></tr></table>';
        var control = ecui.create('Table', {main: el, parent: document.body, crossCell: true}),
            row = control.getRow(3);

        value_of(control.getRows() !== control.getRows()).should_be_true();
        value_of(control.getHCells() !== control.getHCells()).should_be_true();
        value_of(row.getCells() !== row.getCells()).should_be_true();
        value_of(control.getCell(3, 0)).should_be(row.getCell(0));

        control.setParent();
        ecui.dispose(control);
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
        var control = ecui.create('Table', {main: el, parent: document.body, crossCell: true});

        control.getHCell(1).hide();
        value_of(control.getRow(0).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(0).getCell(2).getWidth()).should_be(80);
        value_of(control.getRow(1).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(1).getCell(1).getWidth()).should_be(40);
        value_of(control.getRow(1).getCell(3).getWidth()).should_be(40);
        value_of(control.getRow(2).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(2).getCell(3).getWidth()).should_be(40);
        value_of(control.getRow(3).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(3).getCell(1).getWidth()).should_be(0);
        value_of(control.getRow(3).getCell(2).getWidth()).should_be(40);
        value_of(control.getRow(3).getCell(3).getWidth()).should_be(40);
        value_of(control.getWidth()).should_be(160);

        control.getHCell(2).hide();
        value_of(control.getRow(0).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(0).getCell(2).getWidth()).should_be(40);
        value_of(control.getRow(1).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(1).getCell(1).getWidth()).should_be(0);
        value_of(control.getRow(1).getCell(3).getWidth()).should_be(40);
        value_of(control.getRow(2).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(2).getCell(3).getWidth()).should_be(40);
        value_of(control.getRow(3).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(3).getCell(1).getWidth()).should_be(0);
        value_of(control.getRow(3).getCell(2).getWidth()).should_be(0);
        value_of(control.getRow(3).getCell(3).getWidth()).should_be(40);
        value_of(control.getWidth()).should_be(120);

        control.getHCell(1).show();
        value_of(control.getRow(0).getCell(0).getWidth()).should_be(120);
        value_of(control.getRow(0).getCell(2).getWidth()).should_be(40);
        value_of(control.getRow(1).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(1).getCell(1).getWidth()).should_be(40);
        value_of(control.getRow(1).getCell(3).getWidth()).should_be(40);
        value_of(control.getRow(2).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(2).getCell(3).getWidth()).should_be(40);
        value_of(control.getRow(3).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(3).getCell(1).getWidth()).should_be(40);
        value_of(control.getRow(3).getCell(2).getWidth()).should_be(0);
        value_of(control.getRow(3).getCell(3).getWidth()).should_be(40);
        value_of(control.getWidth()).should_be(160);

        control.getHCell(1).setSize(80);
        value_of(control.getRow(0).getCell(0).getWidth()).should_be(160);
        value_of(control.getRow(0).getCell(2).getWidth()).should_be(40);
        value_of(control.getRow(1).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(1).getCell(1).getWidth()).should_be(80);
        value_of(control.getRow(1).getCell(3).getWidth()).should_be(40);
        value_of(control.getRow(2).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(2).getCell(3).getWidth()).should_be(40);
        value_of(control.getRow(3).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(3).getCell(1).getWidth()).should_be(80);
        value_of(control.getRow(3).getCell(2).getWidth()).should_be(0);
        value_of(control.getRow(3).getCell(3).getWidth()).should_be(40);
        value_of(control.getWidth()).should_be(200);

        control.setParent();
        ecui.dispose(control);
    },

    '增加/删除列(addColumn/removeColumn)': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:300px';
        el.innerHTML = '<table cellspacing="0" cellpadding="0"><tr><td style="width:80px"></td>'
            + '<td style="width:40px"></td><td style="width:40px"></td><td style="width:40px"></td></tr>'
            + '<tr><td colspan="2"></td><td colspan="2"></td></tr>'
            + '<tr><td></td><td colspan="2" rowspan="2"></td><td></td></tr>'
            + '<tr><td></td><td></td></tr>'
            + '<tr><td></td><td></td><td></td><td></td></tr></table>';
        var control = ecui.create('Table', {main: el, parent: document.body, crossCell: true});

        control.addColumn({width: 40, base: 'custom', title: 'new'}, 1);
        value_of(control.getRow(0).getCell(0).getWidth()).should_be(160);
        value_of(control.getRow(0).getCell(3).getWidth()).should_be(80);
        value_of(control.getRow(1).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(1).getCell(1).getWidth()).should_be(40);
        value_of(control.getRow(1).getCell(2).getWidth()).should_be(80);
        value_of(control.getRow(1).getCell(4).getWidth()).should_be(40);
        value_of(control.getRow(2).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(1).getCell(1).getWidth()).should_be(40);
        value_of(control.getRow(2).getCell(4).getWidth()).should_be(40);
        value_of(control.getRow(3).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(3).getCell(1).getWidth()).should_be(40);
        value_of(control.getRow(3).getCell(2).getWidth()).should_be(40);
        value_of(control.getRow(3).getCell(3).getWidth()).should_be(40);
        value_of(control.getRow(3).getCell(4).getWidth()).should_be(40);

        control.removeColumn(1);
        value_of(control.getRow(0).getCell(0).getWidth()).should_be(120);
        value_of(control.getRow(0).getCell(2).getWidth()).should_be(80);
        value_of(control.getRow(1).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(1).getCell(1).getWidth()).should_be(80);
        value_of(control.getRow(1).getCell(3).getWidth()).should_be(40);
        value_of(control.getRow(2).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(2).getCell(3).getWidth()).should_be(40);
        value_of(control.getRow(3).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(3).getCell(1).getWidth()).should_be(40);
        value_of(control.getRow(3).getCell(2).getWidth()).should_be(40);
        value_of(control.getRow(3).getCell(3).getWidth()).should_be(40);

        control.addColumn({width: 40, base: 'custom', title: 'new'}, 2);
        value_of(control.getRow(0).getCell(0).getWidth()).should_be(120);
        value_of(control.getRow(0).getCell(2).getWidth()).should_be(40);
        value_of(control.getRow(0).getCell(3).getWidth()).should_be(80);
        value_of(control.getRow(1).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(1).getCell(1).getWidth()).should_be(120);
        value_of(control.getRow(1).getCell(4).getWidth()).should_be(40);
        value_of(control.getRow(2).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(2).getCell(2)).should_be(null);
        value_of(control.getRow(2).getCell(4).getWidth()).should_be(40);
        value_of(control.getRow(3).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(3).getCell(1).getWidth()).should_be(40);
        value_of(control.getRow(3).getCell(2).getWidth()).should_be(40);
        value_of(control.getRow(3).getCell(3).getWidth()).should_be(40);
        value_of(control.getRow(3).getCell(4).getWidth()).should_be(40);

        control.removeColumn(1);
        value_of(control.getRow(0).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(0).getCell(1).getWidth()).should_be(40);
        value_of(control.getRow(0).getCell(2).getWidth()).should_be(80);
        value_of(control.getRow(1).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(1).getCell(1).getWidth()).should_be(80);
        value_of(control.getRow(1).getCell(3).getWidth()).should_be(40);
        value_of(control.getRow(2).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(2).getCell(3).getWidth()).should_be(40);
        value_of(control.getRow(3).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(3).getCell(1).getWidth()).should_be(40);
        value_of(control.getRow(3).getCell(2).getWidth()).should_be(40);
        value_of(control.getRow(3).getCell(3).getWidth()).should_be(40);

        control.removeColumn(1);
        value_of(control.getRow(0).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(0).getCell(1).getWidth()).should_be(80);
        value_of(control.getRow(1).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(1).getCell(1).getWidth()).should_be(40);
        value_of(control.getRow(1).getCell(2).getWidth()).should_be(40);
        value_of(control.getRow(2).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(2).getCell(2).getWidth()).should_be(40);
        value_of(control.getRow(3).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(3).getCell(1).getWidth()).should_be(40);
        value_of(control.getRow(3).getCell(2).getWidth()).should_be(40);

        control.setParent();
        ecui.dispose(control);
    },

    '增加/删除行，普通操作(addRow/removeRow)': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:300px';
        el.innerHTML = '<table cellspacing="0" cellpadding="0"><tr><td style="width:80px"></td>'
            + '<td style="width:40px"></td><td style="width:40px"></td><td style="width:40px"></td></tr>'
            + '<tr><td></td><td></td><td></td><td></td></tr></table>';
        var control = ecui.create('Table', {main: el, parent: document.body, crossCell: true});

        control.addRow(['1', '2', '3', '4'], 1);
        value_of(control.getCell(1, 0).getMain().innerHTML).should_be('1');
        value_of(control.getCell(1, 1).getMain().innerHTML).should_be('2');
        value_of(control.getCell(1, 2).getMain().innerHTML).should_be('3');
        value_of(control.getCell(1, 3).getMain().innerHTML).should_be('4');
        value_of(control.getRow(0).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(0).getCell(1).getWidth()).should_be(40);
        value_of(control.getRow(0).getCell(2).getWidth()).should_be(40);
        value_of(control.getRow(0).getCell(3).getWidth()).should_be(40);
        value_of(control.getRow(1).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(1).getCell(1).getWidth()).should_be(40);
        value_of(control.getRow(1).getCell(2).getWidth()).should_be(40);
        value_of(control.getRow(1).getCell(3).getWidth()).should_be(40);

        control.removeRow(0);
        value_of(control.getCell(0, 0).getMain().innerHTML).should_be('1');
        value_of(control.getCell(0, 1).getMain().innerHTML).should_be('2');
        value_of(control.getCell(0, 2).getMain().innerHTML).should_be('3');
        value_of(control.getCell(0, 3).getMain().innerHTML).should_be('4');

        control.setParent();
        ecui.dispose(control);
    },

    '增加行，跨行跨列增加(addRow)': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:300px';
        el.innerHTML = '<table cellspacing="0" cellpadding="0"><tr><td style="width:80px"></td>'
            + '<td style="width:40px"></td><td style="width:40px"></td><td style="width:40px"></td></tr>'
            + '<tr><td></td><td></td><td></td><td></td></tr></table>';
        var control = ecui.create('Table', {main: el, parent: document.body, crossCell: true});

        control.addRow(['1', '2', false, '4'], 1);
        value_of(control.getRow(1).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(1).getCell(1).getWidth()).should_be(40);
        value_of(control.getRow(1).getCell(2)).should_be(null);
        value_of(control.getRow(1).getCell(3).getWidth()).should_be(40);
        value_of(control.getRow(0).getCell(2).getMain().getAttribute('rowSpan')).should_be('2');

        control.addRow(['1', '2', null, '4'], 2);
        value_of(control.getRow(2).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(2).getCell(1).getWidth()).should_be(80);
        value_of(control.getRow(2).getCell(2)).should_be(null);
        value_of(control.getRow(2).getCell(3).getWidth()).should_be(40);
        value_of(control.getRow(2).getCell(1).getMain().getAttribute('colSpan')).should_be('2');

        control.setParent();
        ecui.dispose(control);
    },

    '增加/删除行，在跨行的两行之间(addRow/removeRow)': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:300px';
        el.innerHTML = '<table cellspacing="0" cellpadding="0"><tr><td style="width:80px"></td>'
            + '<td style="width:40px"></td><td style="width:40px"></td><td style="width:40px"></td></tr>'
            + '<tr><td></td><td></td><td rowspan="2"></td><td></td></tr>'
            + '<tr><td></td><td></td><td></td></tr></table>';
        var control = ecui.create('Table', {main: el, parent: document.body, crossCell: true});

        control.addRow(['1', '2', '3', '4'], 1);
        value_of(control.getRow(1).getCell(0).getWidth()).should_be(80);
        value_of(control.getRow(1).getCell(1).getWidth()).should_be(40);
        value_of(control.getRow(1).getCell(2)).should_be(null);
        value_of(control.getRow(1).getCell(3).getWidth()).should_be(40);
        value_of(control.getRow(0).getCell(2).getMain().getAttribute('rowSpan')).should_be('3');

        control.removeRow(1);
        value_of(control.getRow(0).getCell(2).getMain().getAttribute('rowSpan')).should_be('2');

        control.addRow(['1', '2', '3', '4'], 1);
        control.removeRow(0);
        value_of(control.getRow(0).getCell(2).getMain().getAttribute('rowSpan')).should_be('2');

        control.setParent();
        ecui.dispose(control);
    },

    '行/单元格事件': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:300px';
        el.innerHTML = '<table cellspacing="0" cellpadding="0"><tr><td style="width:80px">&nbsp;</td>'
            + '<td style="width:40px">&nbsp;</td><td style="width:40px">&nbsp;</td><td style="width:40px">&nbsp;</td></tr>'
            + '<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></table>';
        var control = ecui.create('Table', {main: el, parent: document.body, crossCell: true}),
            el = control.getCell(0, 0).getMain(),
            result = [];

        control.onrowdown = function () {
            result.push('rowdown');
        };

        control.onrowover = function () {
            result.push('rowover');
        };

        control.onrowmove = function () {
            result.push('rowmove');
        };

        control.onrowout = function () {
            result.push('rowout');
        };

        control.onrowup = function () {
            result.push('rowup');
        };

        control.onrowclick = function () {
            result.push('rowclick');
        };

        control.onrowdblclick = function () {
            result.push('rowdblclick');
        };

        control.oncelldown = function () {
            result.push('celldown');
        };

        control.oncellover = function () {
            result.push('cellover');
        };

        control.oncellmove = function () {
            result.push('cellmove');
        };

        control.oncellout = function () {
            result.push('cellout');
        };

        control.oncellup = function () {
            result.push('cellup');
        };

        control.oncellclick = function () {
            result.push('cellclick');
        };

        control.oncelldblclick = function () {
            result.push('celldblclick');
        };

        uiut.MockEvents.mouseover(el);
        uiut.MockEvents.mousemove(el);
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        uiut.MockEvents.mouseout(el);
        uiut.MockEvents.mouseover(document.body);
        value_of(result).should_be(
            ['cellover', 'rowover', 'cellmove', 'rowmove', 'celldown', 'rowdown', 'cellup', 'rowup', 'cellclick', 'rowclick', 'celldown', 'rowdown', 'cellup', 'rowup', 'cellclick', 'rowclick', 'celldblclick', 'rowdblclick', 'cellout', 'rowout']
        );

        control.setParent();
        ecui.dispose(control);
    }
})
