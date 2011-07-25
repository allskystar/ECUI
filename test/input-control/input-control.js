describe('控件初始化测试', {
    '通过<input>初始化，指定name,value无效': function () {
        var el = document.createElement('input');
        el.style.cssText = 'width:100px;height:20px;display:none';
        var ctrl = ecui.create('Edit', {element: el, name: 'name', value: 'value'});

        value_of(ctrl.getBase()).should_be(el.parentNode);
        value_of(ctrl.getInput()).should_be(el);
        value_of(ctrl.getWidth()).should_be(100);
        value_of(ctrl.getHeight()).should_be(20);
        value_of(ctrl.getName()).should_be('');
        value_of(ctrl.getValue()).should_be('');

        ecui.dispose(ctrl);
    },

    '通过<div>初始化，指定name,value有效': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px;height:20px;display:none';
        var ctrl = ecui.create('Edit', {element: el, name: 'name', value: 'value'});

        value_of(ctrl.getBase()).should_be(el);
        value_of(ctrl.getInput()).should_be(el.firstChild);
        value_of(ctrl.getWidth()).should_be(100);
        value_of(ctrl.getHeight()).should_be(20);
        value_of(ctrl.getName()).should_be('name');
        value_of(ctrl.getValue()).should_be('value');

        ecui.dispose(ctrl);
    },

    '通过<div><input>初始化，指定name,value无效': function () {
        var el = document.createElement('div'),
            input = document.createElement('input');
        el.style.cssText = 'width:100px;height:20px;display:none';
        el.appendChild(input);
        var ctrl = ecui.create('Edit', {element: el, name: 'name', value: 'value'});

        value_of(ctrl.getBase()).should_be(el);
        value_of(ctrl.getInput()).should_be(input);
        value_of(ctrl.getWidth()).should_be(100);
        value_of(ctrl.getHeight()).should_be(20);
        value_of(ctrl.getName()).should_be('');
        value_of(ctrl.getValue()).should_be('');

        ecui.dispose(ctrl);
    }
});

describe('属性变化测试', {
    'before': function () {
        var ctrl = ecui.create('Edit', {id: 'edit'});
        ctrl.setParent(document.body);
    },

    'after': function () {
        var ctrl = ecui.get('edit');
        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '改变名称(getName/setName)': function () {
        var ctrl = ecui.get('edit');
        ctrl.setName('test');
        value_of(ctrl.getName()).should_be('test');
        value_of(ctrl.getBody().getElementsByTagName('input')[0].name).should_be('test'); 
    },

    '改变值(getValue/setValue)': function () {
        var ctrl = ecui.get('edit');
        ctrl.setValue('test');
        value_of(ctrl.getValue()).should_be('test');
        value_of(ctrl.getInput().value).should_be('test'); 
    }
});
