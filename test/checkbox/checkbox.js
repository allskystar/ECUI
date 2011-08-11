describe('控件初始化测试', {
    '通过<input>初始化': function () {
        var el = ecui.dom.setInput(null, null, 'checkbox');
        el.style.cssText = 'width:20px;height:20px;display:none';
        var ctrl = ecui.create('Checkbox', {main: el});

        value_of(ctrl.getMain()).should_be(el.parentNode);
        value_of(ctrl.getInput()).should_be(el);
        value_of(ctrl.getWidth()).should_be(20);
        value_of(ctrl.getHeight()).should_be(20);
        value_of(ctrl.getInput().offsetWidth).should_be(0);

        this.wait(ready, 10);
        function ready() {
            value_of(ctrl.isChecked()).should_be_false();
            ecui.dispose(ctrl);
        }
    },

    '通过<div>初始化': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:20px;height:20px;display:none';
        var ctrl = ecui.create('Checkbox', {main: el});

        value_of(ctrl.getMain()).should_be(el);
        value_of(ctrl.getInput()).should_be(el.firstChild);
        value_of(ctrl.getWidth()).should_be(20);
        value_of(ctrl.getHeight()).should_be(20);
        value_of(ctrl.getInput().offsetWidth).should_be(0);
        value_of(ctrl.isChecked()).should_be_false();

        ecui.dispose(ctrl);
    },

    '通过<div><input>初始化': function () {
        var el = document.createElement('div'),
            input = ecui.dom.setInput(null, null, 'checkbox');
        el.style.cssText = 'width:20px;height:20px;display:none';
        el.appendChild(input);
        var ctrl = ecui.create('Checkbox', {main: el});

        value_of(ctrl.getMain()).should_be(el);
        value_of(ctrl.getInput()).should_be(input);
        value_of(ctrl.getWidth()).should_be(20);
        value_of(ctrl.getHeight()).should_be(20);
        value_of(ctrl.getInput().offsetWidth).should_be(0);
        value_of(ctrl.isChecked()).should_be_false();

        ecui.dispose(ctrl);
    },

    '指定checked为true': function () {
        var el = document.createElement('div'),
            ctrl = ecui.create('Checkbox', {main: el, checked: true});

        value_of(ctrl.isChecked()).should_be_true();

        ecui.dispose(ctrl);
    }
});

describe('复选框功能测试', {
    'before': function () {
        var ctrl = ecui.create('Checkbox', {id: 'checkbox'});
        ctrl.appendTo(document.body);

        ctrl.setSize(10, 10);
    },

    'after': function () {
        var ctrl = ecui.get('checkbox');
        ecui.setFocused();
        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '基本属性': function () {
        var ctrl = ecui.get('checkbox');
        value_of(ctrl.getSubject()).should_be(null);
        value_of(ctrl.getDependents()).should_be([]);
    },

    '选择控件(setChecked/isChecked)': function () {
        var ctrl = ecui.get('checkbox'),
            el = ctrl.getMain(),
            input = ctrl.getInput();

        value_of(ctrl.isChecked()).should_be_false();

        ctrl.setChecked(true);
        value_of(ctrl.isChecked()).should_be_true();
        value_of(ctrl.getClass()).should_be('ui-checkbox-checked');

        ctrl.setChecked(false);
        value_of(ctrl.isChecked()).should_be_false();
        value_of(ctrl.getClass()).should_be('ui-checkbox');
    },

    '鼠标点击操作': function () {
        var ctrl = ecui.get('checkbox'),
            el = ctrl.getMain();

        value_of(ctrl.isChecked()).should_be_false();

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(ctrl.isChecked()).should_be_true();
        
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(ctrl.isChecked()).should_be_false();
    },

    '键盘操作': function () {
        var ctrl = ecui.get('checkbox'),
            el = ctrl.getMain();

        ecui.setFocused(ctrl);
        
        uiut.MockEvents.keydown(el, 32);
        uiut.MockEvents.keyup(el, 32);
        value_of(ctrl.isChecked()).should_be_true();
        
        uiut.MockEvents.keydown(el, 32);
        uiut.MockEvents.keyup(el, 32);
        value_of(ctrl.isChecked()).should_be_false();
    }
});

describe('复选框从属关系测试', {
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
        var ctrl = ecui.get('parent');
        ecui.setFocused();
        document.body.removeChild(ctrl.getMain().parentNode);
        ecui.dispose(ctrl);
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
