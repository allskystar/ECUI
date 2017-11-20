function before() {
    var el = document.createElement('div');
    el.style.cssText = 'width:100px;height:20px';
    el.innerHTML = '<div ecui="value:1">1</div><div ecui="value:2"></div>';

    var control = ecui.create('Combox', {id: 'combox', main: el});
    control.appendTo(document.body);
}

function after() {
    var control = ecui.get('combox');
    document.body.removeChild(control.getOuter());
    ecui.dispose(control);
}

function check(control) {
    var text = control.$getSection('Text'),
        button = control.$getSection('Button'),
        options = control.$getSection('Options');
    value_of(control.getTypes()).should_be(['ui-combox']);
    value_of(text.getTypes()).should_be(['ui-item']);
    value_of(text.getClass()).should_be('ui-combox-text');
    value_of(button.getTypes()).should_be(['ui-button']);
    value_of(button.getClass()).should_be('ui-combox-button');
    value_of(options.getTypes()).should_be(['ui-panel']);
    value_of(options.getClass()).should_be('ui-combox-options');
    value_of(control.getInput().style.display != 'none' && control.getInput().type != 'hidden').should_be_true();
}

describe('控件初始化', {
    '通过<select>初始化': function () {
        var el = document.createElement('div');
        el.innerHTML = '<select style="width:100px;height:20px"><option value="1">1</option>'
            + '<option value="2"></option></select>';
        var control = ecui.create('Combox', {main: el.firstChild});

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
        var control = ecui.create('Combox', {main: el.firstChild});

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
        value_of(items[1].getClass()).should_be('ui-combox-item');

        ecui.dispose(control);
    },

    '默认初始化参数': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px;height:20px';
        el.innerHTML = '<div ecui="value:1">1</div><div ecui="value:2"></div><div ecui="value:3"></div>'
            + '<div ecui="value:4"></div><div ecui="value:5"></div><div ecui="value:6"></div>';

        var control = ecui.create('Combox', {id: 'combox', main: el});
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

        var control = ecui.create('Combox', {id: 'combox', main: el, value: '4', optionSize: 3});
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
        var control = ecui.get('combox'),
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
        var control = ecui.get('combox');

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
