describe('控件初始化测试', {
    '通过<select>初始化': function () {
        var el = document.createElement('div');
        el.innerHTML = '<select style="width:100px;height:20px"><option value="1">1</option>'
            + '<option value="2"></option></select>';
        var ctrl = ecui.create('Select', {element: el.firstChild});

        value_of(ctrl.getWidth()).should_be(100);
        value_of(ctrl.getHeight()).should_be(20);

        var items = ctrl.getItems();
        value_of(items.length).should_be(2);
        value_of(items === ctrl.getItems()).should_be_false();
        value_of(items[0].getValue()).should_be('1');

        ecui.dispose(ctrl);
    },

    '通过<div>初始化': function () {
        var el = document.createElement('div');
        el.innerHTML = '<div style="width:100px;height:20px"><div ecui="value:1">1</div><div>2</div>'
            + '</div>';
        var ctrl = ecui.create('Select', {element: el.firstChild});

        value_of(ctrl.getWidth()).should_be(100);
        value_of(ctrl.getHeight()).should_be(20);

        var items = ctrl.getItems();
        value_of(items.length).should_be(2);
        value_of(items === ctrl.getItems()).should_be_false();
        value_of(items[0].getValue()).should_be('1');
        value_of(items[1].getValue()).should_be('2');

        ecui.dispose(ctrl);
    },

    '默认初始化参数': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px;height:20px';
        el.innerHTML = '<div ecui="value:1">1</div><div ecui="value:2"></div><div ecui="value:3"></div>'
            + '<div ecui="value:4"></div><div ecui="value:5"></div><div ecui="value:6"></div>';

        var ctrl = ecui.create('Select', {id: 'select', element: el});
        ctrl.setParent(document.body);

        uiut.MockEvents.mousedown(ctrl.getBase());
        uiut.MockEvents.mouseup(ctrl.getBase());
        var height = ctrl.$getSection('Options').getHeight(),
            itemHeight = ctrl.getItems()[0].getHeight();
        value_of(height < itemHeight * 6 && height >= itemHeight * 5).should_be_true();

        document.body.removeChild(ctrl.getOuter());
        ecui.dispose(ctrl);
    },

    '指定初始化参数': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px;height:20px';
        el.innerHTML = '<div ecui="value:1">1</div><div ecui="value:2"></div><div ecui="value:3"></div>'
            + '<div ecui="value:4"></div><div ecui="value:5"></div><div ecui="value:6"></div>';

        var ctrl = ecui.create('Select', {id: 'select', element: el, value: '4', optionSize: 3});
        ctrl.setParent(document.body);

        uiut.MockEvents.mousedown(ctrl.getBase());
        uiut.MockEvents.mouseup(ctrl.getBase());
        var height = ctrl.$getSection('Options').getHeight(),
            itemHeight = ctrl.getItems()[0].getHeight();
        value_of(height < itemHeight * 4 && height >= itemHeight * 3).should_be_true();
        value_of(ctrl.getSelected()).should_be(ctrl.getItems()[3]);

        document.body.removeChild(ctrl.getOuter());
        ecui.dispose(ctrl);
    }
});

describe('下拉框功能测试', {
    'before': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px;height:20px';
        el.innerHTML = '<div ecui="value:1">1</div><div ecui="value:2"></div>';

        var ctrl = ecui.create('Select', {id: 'select', element: el});
        ctrl.setParent(document.body);
    },

    'after': function () {
        var ctrl = ecui.get('select');
        ecui.setFocused();
        document.body.removeChild(ctrl.getOuter());
        ecui.dispose(ctrl);
        var result = ecui.query({type: ecui.ui.Control});
        value_of(!result.len || (result.len == 1 && result[0].getBase() == 'ec-selector')).should_be_true();
    },

    '增加移除子选项(add/remove)': function () {
        var ctrl = ecui.get('select'),
            el = document.createElement('div');

        el.innerHTML = 3;
        ctrl.add(el);
        var items = ctrl.getItems();
        value_of(items.length).should_be(3);
        value_of(items[2].getValue()).should_be('3');

        ctrl.add('4', 2, {value: '8'});
        items = ctrl.getItems();
        value_of(items.length).should_be(4);
        value_of(items[2].getValue()).should_be('8');
    },

    '选择子选项(getValue/getSelected/setValue)': function () {
        var ctrl = ecui.get('select');

        value_of(ctrl.getValue()).should_be('');
        value_of(ctrl.getSelected()).should_be(null);
        ctrl.setValue('2');
        value_of(ctrl.getValue()).should_be('2');
        value_of(ctrl.getSelected()).should_be(ctrl.getItems()[1]);
        ctrl.setValue('');
        value_of(ctrl.getValue()).should_be('');
        value_of(ctrl.getSelected()).should_be(null);
    },

    '弹出下拉框点击选择子选项': function () {
        var ctrl = ecui.get('select'),
            el = ctrl.getBase(),
            options = ctrl.$getSection('Options'),
            item = ctrl.getItems()[1];

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(options.isShow()).should_be_true();
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(options.isShow()).should_be_false();
        value_of(ctrl.getSelected()).should_be(null);

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        uiut.MockEvents.mousedown(document.body);
        uiut.MockEvents.mouseup(document.body);
        value_of(options.isShow()).should_be_false();
        value_of(ctrl.getSelected()).should_be(null);

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        uiut.MockEvents.mousedown(item.getBase());
        uiut.MockEvents.mouseup(item.getBase());
        value_of(options.isShow()).should_be_false();
        value_of(ctrl.getSelected()).should_be(item);
    },

    '键盘操作': function () {
        var ctrl = ecui.get('select'),
            options = ctrl.$getSection('Options');

        ctrl.setOptionSize(3);
        ctrl.add('3');
        ctrl.add('4');
        ctrl.add('5');

        var items = ctrl.getItems(),
            height = items[0].getHeight();
        value_of(options.isShow()).should_be_false();

        ecui.setFocused(ctrl);
        uiut.MockEvents.keydown(document.body, 40);
        uiut.MockEvents.keyup(document.body, 40);
        value_of(ctrl.getSelected()).should_be(items[0]);

        uiut.MockEvents.keydown(document.body, 40);
        uiut.MockEvents.keyup(document.body, 40);
        value_of(ctrl.getSelected()).should_be(items[1]);

        uiut.MockEvents.mousedown(ctrl.getBase());
        uiut.MockEvents.mouseup(ctrl.getBase());
        value_of(options.isShow()).should_be_true();

        uiut.MockEvents.keydown(document.body, 40);
        uiut.MockEvents.keyup(document.body, 40);
        value_of(ctrl.getActived()).should_be(items[2]);

        uiut.MockEvents.keydown(document.body, 40);
        uiut.MockEvents.keyup(document.body, 40);
        uiut.MockEvents.keydown(document.body, 40);
        uiut.MockEvents.keyup(document.body, 40);
        uiut.MockEvents.keydown(document.body, 40);
        uiut.MockEvents.keyup(document.body, 40);
        uiut.MockEvents.keydown(document.body, 40);
        uiut.MockEvents.keyup(document.body, 40);
        uiut.MockEvents.keydown(document.body, 40);
        uiut.MockEvents.keyup(document.body, 40);
        value_of(ctrl.getActived()).should_be(items[4]);

        uiut.MockEvents.keydown(document.body, 38);
        uiut.MockEvents.keyup(document.body, 38);
        uiut.MockEvents.keydown(document.body, 38);
        uiut.MockEvents.keyup(document.body, 38);
        uiut.MockEvents.keydown(document.body, 38);
        uiut.MockEvents.keyup(document.body, 38);
        uiut.MockEvents.keydown(document.body, 38);
        uiut.MockEvents.keyup(document.body, 38);
        uiut.MockEvents.keydown(document.body, 38);
        uiut.MockEvents.keyup(document.body, 38);
        uiut.MockEvents.keydown(document.body, 38);
        uiut.MockEvents.keyup(document.body, 38);
        uiut.MockEvents.keydown(document.body, 38);
        uiut.MockEvents.keyup(document.body, 38);
        value_of(ctrl.getActived()).should_be(items[0]);

        uiut.MockEvents.keydown(document.body, 13);
        uiut.MockEvents.keyup(document.body, 13);
        value_of(ctrl.getSelected()).should_be(items[0]);
        value_of(options.isShow()).should_be_false();
    },

    '鼠标滚轮操作': function () {
        var ctrl = ecui.get('select'),
            options = ctrl.$getSection('Options');

        ctrl.setOptionSize(3);
        ctrl.add('3');
        ctrl.add('4');

        ecui.setFocused(ctrl);

        var items = ctrl.getItems();
        value_of(ctrl.getSelected()).should_be(null);

        uiut.MockEvents.mousewheel(document, {detail: 3});
        value_of(ctrl.getSelected()).should_be(items[0]);

        uiut.MockEvents.mousewheel(document, {detail: 3});
        value_of(ctrl.getSelected()).should_be(items[1]);

        uiut.MockEvents.mousewheel(document, {detail: 3});
        value_of(ctrl.getSelected()).should_be(items[2]);

        uiut.MockEvents.mousewheel(document, {detail: 3});
        value_of(ctrl.getSelected()).should_be(items[3]);

        uiut.MockEvents.mousewheel(document, {detail: 3});
        value_of(ctrl.getSelected()).should_be(items[3]);

        uiut.MockEvents.mousewheel(document, {detail: -3});
        value_of(ctrl.getSelected()).should_be(items[2]);

        uiut.MockEvents.mousewheel(document, {detail: -3});
        value_of(ctrl.getSelected()).should_be(items[1]);

        uiut.MockEvents.mousewheel(document, {detail: -3});
        value_of(ctrl.getSelected()).should_be(items[0]);

        uiut.MockEvents.mousewheel(document, {detail: -3});
        value_of(ctrl.getSelected()).should_be(items[0]);

        uiut.MockEvents.mousewheel(document, {detail: -3});
        value_of(ctrl.getSelected()).should_be(items[0]);
    }
});
