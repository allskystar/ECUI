function before() {
    var el = document.createElement('div');
    el.id = 'group';
    el.innerHTML = '<form><div ecui="type:radio;id:item1;name:old" style="width:10px;height:10px"></div>'
        + '<div ecui="type:radio;id:item2;name:old" style="width:10px;height:10px"></div>'
        + '<div ecui="type:radio;id:item3;name:old" style="width:10px;height:10px"></div>'
        + '<div ecui="type:radio;id:item4;name:old" style="width:10px;height:10px"></div>'
        + '<div ecui="type:radio;id:item5;name:old" style="width:10px;height:10px"></div></form>';
    document.body.appendChild(el);
    ecui.init(el);
}

function after() {
    var el = document.getElementById('group');
    ecui.dispose(el);
    document.body.removeChild(el);
}

describe('控件初始化', {
    '通过<input>初始化': function () {
        var el = document.createElement('input');
        el.style.cssText = 'width:20px;height:20px;display:none';
        var control = ecui.create('Radio', {main: el});

        value_of(control.getMain()).should_be(el.parentNode);
        value_of(control.getInput()).should_be(el);
        value_of(control.getWidth()).should_be(20);
        value_of(control.getHeight()).should_be(20);
        value_of(control.getInput().offsetWidth).should_be(0);
        value_of(control.getTypes()).should_be(['ui-radio', 'ui-input-control', 'ui-control']);

        ecui.dispose(control);
    },

    '通过<div>初始化': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:20px;height:20px;display:none';
        var control = ecui.create('Radio', {main: el});

        value_of(control.getMain()).should_be(el);
        value_of(control.getInput()).should_be(el.firstChild);
        value_of(control.getWidth()).should_be(20);
        value_of(control.getHeight()).should_be(20);
        value_of(control.getInput().offsetWidth).should_be(0);
        value_of(control.getTypes()).should_be(['ui-radio', 'ui-input-control', 'ui-control']);

        ecui.dispose(control);
    },

    '通过<div><input>初始化': function () {
        var el = document.createElement('div'),
            input = document.createElement('input');
        el.style.cssText = 'width:20px;height:20px;display:none';
        el.appendChild(input);
        var control = ecui.create('Radio', {main: el});

        value_of(control.getMain()).should_be(el);
        value_of(control.getInput()).should_be(input);
        value_of(control.getWidth()).should_be(20);
        value_of(control.getHeight()).should_be(20);
        value_of(control.getInput().offsetWidth).should_be(0);
        value_of(control.getTypes()).should_be(['ui-radio', 'ui-input-control', 'ui-control']);

        ecui.dispose(control);
    },

    '指定checked为true(input)': function () {
        var el = document.createElement('div');
        el.id = 'group';
        el.innerHTML = '<form><input ecui="type:radio;id:item1" name="old" type="radio">'
            + '<input ecui="type:radio;id:item2" type="radio" name="old" checked>'
            + '<input ecui="type:radio;id:item3" type="radio" name="old" checked></form>'
        document.body.appendChild(el);
        ecui.init(el);

        value_of(ecui.get('item1').isChecked()).should_be_false();
        value_of(ecui.get('item1').getClass()).should_be('ui-radio');
        value_of(ecui.get('item2').isChecked()).should_be_false();
        value_of(ecui.get('item2').getClass()).should_be('ui-radio');
        value_of(ecui.get('item3').isChecked()).should_be_true();
        value_of(ecui.get('item3').getClass()).should_be('ui-radio-checked');

        var el = document.getElementById('group');
        ecui.setFocused();
        ecui.dispose(el);
        document.body.removeChild(el);
    },

    '指定checked为true(options)': function () {
        var el = document.createElement('div');
        el.id = 'group';
        el.innerHTML = '<form><div ecui="type:radio;id:item1;name:old"></div>'
            + '<div ecui="type:radio;id:item2;checked:true;name:old"></div>'
            + '<div ecui="type:radio;id:item3;checked:true;name:old"></div></form>'
        document.body.appendChild(el);
        ecui.init(el);

        value_of(ecui.get('item1').isChecked()).should_be_false();
        value_of(ecui.get('item1').getClass()).should_be('ui-radio');
        value_of(ecui.get('item2').isChecked()).should_be_false();
        value_of(ecui.get('item2').getClass()).should_be('ui-radio');
        value_of(ecui.get('item3').isChecked()).should_be_true();
        value_of(ecui.get('item3').getClass()).should_be('ui-radio-checked');

        var el = document.getElementById('group');
        ecui.setFocused();
        ecui.dispose(el);
        document.body.removeChild(el);
    }
});

test('交互行为模拟', {
    '鼠标点击操作': function () {
        var item1 = ecui.get('item1'),
            item2 = ecui.get('item2');

        uiut.MockEvents.mousedown(item1.getMain());
        uiut.MockEvents.mouseup(item1.getMain());
        value_of(item1.isChecked()).should_be_true();
        uiut.MockEvents.mousedown(item2.getMain());
        uiut.MockEvents.mouseup(item2.getMain());
        value_of(item1.isChecked()).should_be_false();
        value_of(item2.isChecked()).should_be_true();
    },

    '键盘操作': function () {
        var item1 = ecui.get('item1'),
            item2 = ecui.get('item2');

        ecui.setFocused(item1);
        uiut.MockEvents.keydown(document, 32);
        value_of(item1.isChecked()).should_be_false();
        uiut.MockEvents.keyup(document, 32);
        value_of(item1.isChecked()).should_be_true();
        ecui.setFocused(item2);
        uiut.MockEvents.keydown(document, 32);
        value_of(item1.isChecked()).should_be_true();
        uiut.MockEvents.keyup(document, 32);
        value_of(item1.isChecked()).should_be_false();
        value_of(item2.isChecked()).should_be_true();
    }
});

test('单选框组', {
    '获取同组单选框': function () {
        var item1 = ecui.get('item1'),
            item2 = ecui.get('item2'),
            item3 = ecui.get('item3'),
            item4 = ecui.get('item4'),
            item5 = ecui.get('item5');

        value_of(item1.getItems() === item1.getItems()).should_be_false();
        value_of(item1.getItems()).should_be([item1, item2, item3, item4, item5]);
        value_of(item2.getItems()).should_be([item1, item2, item3, item4, item5]);
        value_of(item3.getItems()).should_be([item1, item2, item3, item4, item5]);
        value_of(item4.getItems()).should_be([item1, item2, item3, item4, item5]);
        value_of(item5.getItems()).should_be([item1, item2, item3, item4, item5]);
    },

    '选项名称为空不分组(getName/setName)': function () {
        var item1 = ecui.get('item1'),
            item2 = ecui.get('item2'),
            item3 = ecui.get('item3'),
            item4 = ecui.get('item4'),
            item5 = ecui.get('item5');

        value_of(item1.getItems()).should_be([item1, item2, item3, item4, item5]);

        item5.setName();
        value_of(item5.getItems()).should_be([item5]);
        value_of(item1.getItems()).should_be([item1, item2, item3, item4]);

        item4.setName();
        value_of(item4.getItems()).should_be([item4]);
        value_of(item1.getItems()).should_be([item1, item2, item3]);
    },

    '在未选中时改变选项名称(getName/setName)': function () {
        var item1 = ecui.get('item1'),
            item2 = ecui.get('item2'),
            item3 = ecui.get('item3'),
            item4 = ecui.get('item4'),
            item5 = ecui.get('item5');

        item5.setName('new');
        item4.setName('new');

        value_of(item1.isChecked()).should_be_false();
        value_of(item2.isChecked()).should_be_false();
        value_of(item3.isChecked()).should_be_false();
        value_of(item4.isChecked()).should_be_false();
        value_of(item5.isChecked()).should_be_false();
    },

    '选中状态控制(setChecked/isChecked)': function () {
        var item1 = ecui.get('item1'),
            item2 = ecui.get('item2');

        item2.setChecked(true);
        value_of(item2.isChecked()).should_be_true();
        value_of(item1.isChecked()).should_be_false();
        value_of(baidu.dom.hasClass(item2.getMain(), 'ui-radio-checked')).should_be_true();
        value_of(baidu.dom.hasClass(item1.getMain(), 'ui-radio-checked')).should_be_false();

        uiut.MockEvents.mousedown(item1.getMain());
        uiut.MockEvents.mouseup(item1.getMain());
        value_of(item1.isChecked()).should_be_true();
        value_of(item2.isChecked()).should_be_false();
        value_of(baidu.dom.hasClass(item1.getMain(), 'ui-radio-checked')).should_be_true();
        value_of(baidu.dom.hasClass(item2.getMain(), 'ui-radio-checked')).should_be_false();

        ecui.setFocused(item2);
        uiut.MockEvents.keydown(item2.getMain(), 32);
        uiut.MockEvents.keyup(item2.getMain(), 32);
        value_of(item2.isChecked()).should_be_true();
        value_of(item1.isChecked()).should_be_false();
        value_of(baidu.dom.hasClass(item2.getMain(), 'ui-radio-checked')).should_be_true();
        value_of(baidu.dom.hasClass(item1.getMain(), 'ui-radio-checked')).should_be_false();
    }
});
