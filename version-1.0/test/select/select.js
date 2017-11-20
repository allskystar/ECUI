function before() {
    var el = document.createElement('div');
    el.style.cssText = 'width:100px;height:20px';
    el.innerHTML = '<div ecui="value:1">1</div><div ecui="value:2"></div>';

    var control = ecui.create('Select', {id: 'select', main: el});
    control.appendTo(document.body);
}

function after() {
    var control = ecui.get('select');
    document.body.removeChild(control.getOuter());
    ecui.dispose(control);
}

function check(control) {
    var text = control.$getSection('Text'),
        button = control.$getSection('Button'),
        options = control.$getSection('Options');
    value_of(control.getTypes()).should_be(['ui-select']);
    value_of(text.getTypes()).should_be(['ui-item']);
    value_of(text.getClass()).should_be('ui-select-text');
    value_of(button.getTypes()).should_be(['ui-button']);
    value_of(button.getClass()).should_be('ui-select-button');
    value_of(options.getTypes()).should_be(['ui-panel']);
    value_of(options.getClass()).should_be('ui-select-options');
}

describe('控件初始化', {
    '通过<select>初始化': function () {
        var el = document.createElement('div');
        el.innerHTML = '<select style="width:100px;height:20px"><option value="1">1</option>'
            + '<option value="2"></option></select>';
        var control = ecui.create('Select', {main: el.firstChild});

        value_of(control.getWidth()).should_be(100);
        value_of(control.getHeight()).should_be(20);
        check(control);

        var items = control.getItems();
        value_of(items.length).should_be(2);
        value_of(items === control.getItems()).should_be_false();
        value_of(items[0].getValue()).should_be('1');

        ecui.dispose(control);
    },

    '通过<div>初始化': function () {
        var el = document.createElement('div');
        el.innerHTML = '<div style="width:100px;height:20px"><div class="custom" ecui="value:1">1</div><div>2</div></div>';
        var control = ecui.create('Select', {main: el.firstChild});

        value_of(control.getWidth()).should_be(100);
        value_of(control.getHeight()).should_be(20);
        check(control);

        var items = control.getItems();
        value_of(items.length).should_be(2);
        value_of(items === control.getItems()).should_be_false();
        value_of(items[0].getValue()).should_be('1');
        value_of(items[1].getValue()).should_be('2');
        value_of(items[0].getTypes()).should_be(['ui-item']);
        value_of(items[0].getClass()).should_be('custom');
        value_of(items[1].getClass()).should_be('ui-select-item');

        ecui.dispose(control);
    },

    '默认初始化参数': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px;height:20px';
        el.innerHTML = '<div ecui="value:1">1</div><div ecui="value:2"></div><div ecui="value:3"></div>'
            + '<div ecui="value:4"></div><div ecui="value:5"></div><div ecui="value:6"></div>';

        var control = ecui.create('Select', {id: 'select', main: el});
        control.appendTo(document.body);

        uiut.MockEvents.mousedown(control.getMain());
        uiut.MockEvents.mouseup(control.getMain());

        var height = control.$getSection('Options').getHeight(),
            itemHeight = control.getItems()[0].getHeight();
        value_of(height < itemHeight * 6 && height >= itemHeight * 5).should_be_true();

        document.body.removeChild(control.getOuter());
        ecui.dispose(control);
    },

    '指定初始化参数': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px;height:20px';
        el.innerHTML = '<div ecui="value:1">1</div><div ecui="value:2"></div><div ecui="value:3"></div>'
            + '<div ecui="value:4"></div><div ecui="value:5"></div><div ecui="value:6"></div>';

        var control = ecui.create('Select', {id: 'select', main: el, value: '4', optionSize: 3});
        control.appendTo(document.body);

        uiut.MockEvents.mousedown(control.getMain());
        uiut.MockEvents.mouseup(control.getMain());
        var height = control.$getSection('Options').getHeight(),
            itemHeight = control.getItems()[0].getHeight();
        value_of(height < itemHeight * 4 && height >= itemHeight * 3).should_be_true();
        value_of(control.getSelected()).should_be(control.getItems()[3]);

        document.body.removeChild(control.getOuter());
        ecui.dispose(control);
    }
});

test('add/remove', {
    '增加移除子选项': function () {
        var control = ecui.get('select'),
            el = document.createElement('div');

        el.innerHTML = 3;
        control.add(el);
        var items = control.getItems();
        value_of(items.length).should_be(3);
        value_of(items[2].getValue()).should_be('3');

        control.add('4', 2, {value: '8'});
        items = control.getItems();
        value_of(items.length).should_be(4);
        value_of(items[2].getValue()).should_be('8');
    }
});

test('getValue/getSelected/setValue', {
    '选择子选项': function () {
        var control = ecui.get('select');

        value_of(control.getValue()).should_be('');
        value_of(control.getSelected()).should_be(null);
        control.setValue('2');
        value_of(control.getValue()).should_be('2');
        value_of(control.getSelected()).should_be(control.getItems()[1]);
        control.setValue('');
        value_of(control.getValue()).should_be('');
        value_of(control.getSelected()).should_be(null);
    },
});

test('交互行为模拟', {
    '弹出下拉框点击选择子选项': function () {
        var control = ecui.get('select'),
            el = control.getMain(),
            options = control.$getSection('Options'),
            item = control.getItems()[1];

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(options.isShow()).should_be_true();
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(options.isShow()).should_be_false();
        value_of(control.getSelected()).should_be(null);

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        uiut.MockEvents.mousedown(document.body);
        uiut.MockEvents.mouseup(document.body);
        value_of(options.isShow()).should_be_false();
        value_of(control.getSelected()).should_be(null);

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        uiut.MockEvents.mousedown(item.getMain());
        uiut.MockEvents.mouseup(item.getMain());
        value_of(options.isShow()).should_be_false();
        value_of(control.getSelected()).should_be(item);
    },

    '键盘操作': function () {
        var control = ecui.get('select'),
            options = control.$getSection('Options');

        control.setOptionSize(3);
        control.add('3');
        control.add('4');
        control.add('5');

        var items = control.getItems(),
            height = items[0].getHeight();
        value_of(options.isShow()).should_be_false();

        ecui.setFocused(control);
        uiut.MockEvents.keydown(document.body, 40);
        uiut.MockEvents.keyup(document.body, 40);
        value_of(control.getSelected()).should_be(items[0]);

        uiut.MockEvents.keydown(document.body, 40);
        uiut.MockEvents.keyup(document.body, 40);
        value_of(control.getSelected()).should_be(items[1]);

        uiut.MockEvents.mousedown(control.getMain());
        uiut.MockEvents.mouseup(control.getMain());
        value_of(options.isShow()).should_be_true();

        uiut.MockEvents.keydown(document.body, 40);
        uiut.MockEvents.keyup(document.body, 40);
        value_of(ecui.getFocused()).should_be(items[2]);

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
        value_of(ecui.getFocused()).should_be(items[4]);

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
        value_of(ecui.getFocused()).should_be(items[0]);

        uiut.MockEvents.keydown(document.body, 13);
        uiut.MockEvents.keyup(document.body, 13);
        value_of(control.getSelected()).should_be(items[0]);
        value_of(options.isShow()).should_be_false();
    },

    '鼠标滚轮操作': function () {
        var control = ecui.get('select'),
            options = control.$getSection('Options');

        control.setOptionSize(3);
        control.add('3');
        control.add('4');

        ecui.setFocused(control);

        var items = control.getItems();
        value_of(control.getSelected()).should_be(null);

        uiut.MockEvents.mousewheel(document, {detail: 3});
        value_of(control.getSelected()).should_be(items[0]);

        uiut.MockEvents.mousewheel(document, {detail: 3});
        value_of(control.getSelected()).should_be(items[1]);

        uiut.MockEvents.mousewheel(document, {detail: 3});
        value_of(control.getSelected()).should_be(items[2]);

        uiut.MockEvents.mousewheel(document, {detail: 3});
        value_of(control.getSelected()).should_be(items[3]);

        uiut.MockEvents.mousewheel(document, {detail: 3});
        value_of(control.getSelected()).should_be(items[3]);

        uiut.MockEvents.mousewheel(document, {detail: -3});
        value_of(control.getSelected()).should_be(items[2]);

        uiut.MockEvents.mousewheel(document, {detail: -3});
        value_of(control.getSelected()).should_be(items[1]);

        uiut.MockEvents.mousewheel(document, {detail: -3});
        value_of(control.getSelected()).should_be(items[0]);

        uiut.MockEvents.mousewheel(document, {detail: -3});
        value_of(control.getSelected()).should_be(items[0]);

        uiut.MockEvents.mousewheel(document, {detail: -3});
        value_of(control.getSelected()).should_be(items[0]);
    }
});
