function before() {
    var control = ecui.create('Checkbox', {id: 'checkbox'});
    control.appendTo(document.body);

    control.setSize(10, 10);
}

function after() {
    var control = ecui.get('checkbox');
    control.setParent();
    ecui.dispose(control);
}

describe('控件初始化', {
    '通过<input>初始化': function () {
        var el = ecui.dom.setInput(null, null, 'checkbox');
        el.style.cssText = 'width:20px;height:20px;display:none';
        document.body.appendChild(el);
        el.checked = true;
        var control = ecui.create('Checkbox', {main: el});

        value_of(control.getMain()).should_be(el.parentNode);
        value_of(control.getInput()).should_be(el);
        value_of(control.getWidth()).should_be(20);
        value_of(control.getHeight()).should_be(20);
        value_of(control.getInput().offsetWidth).should_be(0);
        value_of(control.getTypes()).should_be(['ui-checkbox']);

        this.wait(ready, 10);
        function ready() {
            value_of(control.isChecked()).should_be_true();
            document.body.removeChild(control.getOuter());
            ecui.dispose(control);
        }
    },

    '通过<div>初始化': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:20px;height:20px;display:none';
        document.body.appendChild(el);
        var control = ecui.create('Checkbox', {main: el, checked: true});

        value_of(control.getMain()).should_be(el);
        value_of(control.getInput()).should_be(el.firstChild);
        value_of(control.getWidth()).should_be(20);
        value_of(control.getHeight()).should_be(20);
        value_of(control.getInput().offsetWidth).should_be(0);
        value_of(control.getTypes()).should_be(['ui-checkbox']);

        this.wait(ready, 10);
        function ready() {
            value_of(control.isChecked()).should_be_true();
            document.body.removeChild(control.getOuter());
            ecui.dispose(control);
        }
    },

    '通过<div><input>初始化': function () {
        var el = document.createElement('div'),
            input = ecui.dom.setInput(null, null, 'checkbox');
        el.style.cssText = 'width:20px;height:20px;display:none';
        el.appendChild(input);
        document.body.appendChild(el);
        var control = ecui.create('Checkbox', {main: el});

        value_of(control.getMain()).should_be(el);
        value_of(control.getInput()).should_be(input);
        value_of(control.getWidth()).should_be(20);
        value_of(control.getHeight()).should_be(20);
        value_of(control.getInput().offsetWidth).should_be(0);
        value_of(control.getTypes()).should_be(['ui-checkbox']);

        this.wait(ready, 10);
        function ready() {
            value_of(control.isChecked()).should_be_false();
            document.body.removeChild(control.getOuter());
            ecui.dispose(control);
        }
    }
});

test('setChecked/isChecked', {
    '选择控件()': function () {
        var control = ecui.get('checkbox'),
            el = control.getMain(),
            input = control.getInput();

        value_of(control.isChecked()).should_be_false();

        control.setChecked(true);
        value_of(control.isChecked()).should_be_true();
        value_of(control.getClass()).should_be('ui-checkbox-checked');

        control.setChecked(false);
        value_of(control.isChecked()).should_be_false();
        value_of(control.getClass()).should_be('ui-checkbox');
    },
});

test('交互行为模拟', {
    '鼠标点击操作': function () {
        var control = ecui.get('checkbox'),
            el = control.getMain();

        value_of(control.isChecked()).should_be_false();

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(control.isChecked()).should_be_true();
        
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(control.isChecked()).should_be_false();
    },

    '键盘操作': function () {
        var control = ecui.get('checkbox'),
            el = control.getMain();

        ecui.setFocused(control);
        
        uiut.MockEvents.keydown(el, 32);
        value_of(control.isChecked()).should_be_false();
        uiut.MockEvents.keyup(el, 32);
        value_of(control.isChecked()).should_be_true();
        
        uiut.MockEvents.keydown(el, 32);
        value_of(control.isChecked()).should_be_true();
        uiut.MockEvents.keyup(el, 32);
        value_of(control.isChecked()).should_be_false();
    }
});

describe('复选框从属关系', {
    'before': function () {
        var el = document.createElement('div');
        el.innerHTML = '<div ecui="type:checkbox;id:parent"></div>'
            + '<div ecui="type:checkbox;id:child1;subject:parent"></div>'
            + '<div ecui="type:checkbox;id:child2;subject:parent"></div>'
            + '<div ecui="type:checkbox;id:grandson;subject:child2"></div>';
        document.body.appendChild(el);
        ecui.init(el);
    },

    'after': function () {
        var control = ecui.get('parent');
        ecui.setFocused();
        document.body.removeChild(control.getMain().parentNode);
        ecui.dispose(control);
    },

    '获取从/父复选框(getSubject/getDependents)': function () {
        var parent = ecui.get('parent'),
            child1 = ecui.get('child1'),
            child2 = ecui.get('child2'),
            grandson = ecui.get('grandson');

        value_of(child1.getSubject()).should_be(parent);
        value_of(child2.getSubject()).should_be(parent);
        value_of(grandson.getSubject()).should_be(child2);
        value_of(parent.getDependents()).should_be([child1, child2]);
        value_of(parent.getDependents() === parent.getDependents()).should_be_false();
    },

    '从属关系联动': function () {
        var parent = ecui.get('parent'),
            child1 = ecui.get('child1'),
            child2 = ecui.get('child2'),
            grandson = ecui.get('grandson');

        grandson.setChecked(true);
        value_of(child2.isChecked()).should_be_true();
        value_of(parent.isChecked()).should_be_false();
        value_of(parent.getClass()).should_be('ui-checkbox-part');

        child1.setChecked(true);
        value_of(parent.isChecked()).should_be_true();
        value_of(parent.getClass()).should_be('ui-checkbox-checked');

        child2.setChecked(false);
        value_of(parent.isChecked()).should_be_false();
        value_of(grandson.isChecked()).should_be_false();
        value_of(parent.getClass()).should_be('ui-checkbox-part');

        parent.setChecked(false);
        value_of(parent.getClass()).should_be('ui-checkbox');
    },

    '动态建立从属关系(getSubject/setSubject)': function () {
        var parent = ecui.get('parent'),
            child1 = ecui.get('child1'),
            child2 = ecui.get('child2');

        child2.setChecked(true);
        child1.setSubject(child2);
        value_of(child2.isChecked()).should_be_false();
        value_of(child2.getClass()).should_be('ui-checkbox-part');

        child1.setSubject(parent);
        value_of(child2.isChecked()).should_be_true();
        value_of(child2.getClass()).should_be('ui-checkbox-checked');
    },

    '动态增删从属控件': function () {
        var parent = ecui.get('parent'),
            child1 = ecui.get('child1'),
            child2 = ecui.get('child2');

        child2.setChecked(true);
        child1.setParent();
        value_of(parent.isChecked()).should_be_false();
        value_of(parent.getClass()).should_be('ui-checkbox-part');

        child1.setChecked(true);
        value_of(parent.isChecked()).should_be_true();
        value_of(parent.getClass()).should_be('ui-checkbox-checked');
    }
});
