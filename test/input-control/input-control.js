function before() {
    var el = document.createElement('div');
    el.id = 'common';
    document.body.appendChild(el);
}

function after() {
    ecui.dispose(document.body);
    document.body.removeChild(baidu.dom.g('common'));
}

test('控件初始化', {
    '<input>初始化，指定name,value无效': function () {
        var el = document.createElement('input');
        el.style.cssText = 'width:100px;height:20px';
        var control = ecui.create(ecui.ui.InputControl, {parent: baidu.dom.g('common'), main: el, name: 'name', value: 'value'});

        value_of(control.getInput()).should_be(el);
        value_of(control.getWidth()).should_be(100);
        value_of(control.getHeight()).should_be(20);
        value_of(control.getName()).should_be('');
        value_of(control.getValue()).should_be('');
    },

    '<div>初始化，指定name,value有效': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px;height:20px';
        var control = ecui.create(ecui.ui.InputControl, {parent: baidu.dom.g('common'), main: el, name: 'name', value: 'value'});

        value_of(control.getMain()).should_be(el);
        value_of(control.getWidth()).should_be(100);
        value_of(control.getHeight()).should_be(20);
        value_of(control.getName()).should_be('name');
        value_of(control.getValue()).should_be('value');
    },

    '<div><input></div>初始化，指定name,value无效': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px;height:20px';
        el.innerHTML = '<input>'
        var control = ecui.create(ecui.ui.InputControl, {parent: baidu.dom.g('common'), main: el, name: 'name', value: 'value'});

        value_of(control.getMain()).should_be(el);
        value_of(control.getInput()).should_be(el.firstChild);
        value_of(control.getWidth()).should_be(100);
        value_of(control.getHeight()).should_be(20);
        value_of(control.getName()).should_be('');
        value_of(control.getValue()).should_be('');
    }
});

test('焦点状态测试', {
    '调用ecui.setFocused方法设置焦点': function () {
        var el = document.createElement('input');
        el.style.cssText = 'width:100px;height:20px';
        var control = ecui.create(ecui.ui.InputControl, {parent: baidu.dom.g('common'), main: el}),
            result = [];

        control.onfocus = function (event) {
            result.push('focus');
        };

        ecui.setFocused(control);
        value_of(result).should_be(['focus']);
    },

    '调用ecui.setFocused方法失去焦点': function () {
        var el = document.createElement('input');
        el.style.cssText = 'width:100px;height:20px';
        var control = ecui.create(ecui.ui.InputControl, {parent: baidu.dom.g('common'), main: el}),
            result = [];

        control.onblur = function (event) {
            result.push('blur');
        };

        ecui.setFocused(control);
        ecui.setFocused(null);
        value_of(result).should_be(['blur']);
    },

    '调用输入框的focus方法设置焦点': function () {
        var el = document.createElement('input');
        el.style.cssText = 'width:100px;height:20px';
        var control = ecui.create(ecui.ui.InputControl, {parent: baidu.dom.g('common'), main: el}),
            result = [];

        control.onfocus = function (event) {
            result.push('focus');
        };

        uiut.MockEvents.focus(el);
        value_of(result).should_be(['focus']);
    },

    '调用输入框的blur方法失去焦点': function () {
        var el = document.createElement('input');
        el.style.cssText = 'width:100px;height:20px';
        var control = ecui.create(ecui.ui.InputControl, {parent: baidu.dom.g('common'), main: el}),
            result = [];

        control.onblur = function (event) {
            result.push('blur');
        };

        ecui.setFocused(control);
        uiut.MockEvents.blur(el);
        value_of(result).should_be(['blur']);
    },

    '控件在失效状态无法得到焦点': function () {
        var el = document.createElement('input');
        el.style.cssText = 'width:100px;height:20px';
        var control = ecui.create(ecui.ui.InputControl, {parent: baidu.dom.g('common'), main: el, disabled: true}),
            result = [];

        control.onfocus = function (event) {
            result.push('focus');
        };

        control.onblur = function (event) {
            result.push('blur');
        };

        ecui.setFocused(control);
        value_of(result).should_be([]);
        uiut.MockEvents.focus(el);
        value_of(result).should_be([]);
    }
});

test('表单事件', {
    '自动绑定初始化时的表单事件': function () {
        var el = baidu.dom.g('common'),
            result = [];
        el.innerHTML = '<form id="form1"><input id="test" ecui="type:input-control;id:test"></form>';

        ecui.init(el);
        var control = ecui.get('test');
        control.onreset = function (event) {
            result.push('reset');
        };

        baidu.dom.g('form1').reset();
        this.wait(function () {
            value_of(result).should_be(['reset']);
        }, 0);
    },

    '改变控件位置时新表单自动绑定': function () {
        var el = baidu.dom.g('common'),
            result = [];
        el.innerHTML = '<form id="form1"><input id="test" ecui="type:input-control;id:test"></form><form id="form2"></form>';

        ecui.init(el);
        var control = ecui.get('test');
        control.onreset = function (event) {
            result.push('reset');
        };

        control.appendTo(baidu.dom.g('form2'));
        baidu.dom.g('form2').reset();
        this.wait(function () {
            value_of(result).should_be(['reset']);
        }, 0);
    }
});

test('失效状态控件', {
    '普通输入框失效状态控制': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px;height:20px';
        var control = ecui.create(ecui.ui.InputControl, {parent: baidu.dom.g('common'), main: el, value: '<html>'});

        control.disable();
        value_of(ecui.dom.getParent(control.getInput())).should_be(null);
        value_of(control.getContent()).should_be('&lt;html&gt;');

        control.enable();
        value_of(ecui.dom.getParent(control.getInput())).should_be(control.getBody());
        value_of(baidu.dom.children(control.getBody()).length).should_be(1);
    },

    '密码输入框失效状态控制': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px;height:20px';
        var control = ecui.create(ecui.ui.InputControl, {parent: baidu.dom.g('common'), main: el, inputType: 'password', value: '<html>'});

        control.disable();
        value_of(ecui.dom.getParent(control.getInput())).should_be(null);
        value_of(control.getContent()).should_be('');

        control.enable();
        value_of(ecui.dom.getParent(control.getInput())).should_be(control.getBody());
        value_of(baidu.dom.children(control.getBody()).length).should_be(1);
    },

    '隐藏输入框设置不可用': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px;height:20px';
        var control = ecui.create(ecui.ui.InputControl, {parent: baidu.dom.g('common'), main: el, hidden: true, value: '<html>'});

        control.disable();
        value_of(ecui.dom.getParent(control.getInput())).should_be(control.getBody());
        value_of(control.getInput().disabled).should_be_true();

        control.enable();
        value_of(ecui.dom.getParent(control.getInput())).should_be(control.getBody());
        value_of(control.getInput().disabled).should_be_false();
    }
});

test('setName/setValue', {
    '动态改变名称': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px;height:20px';
        var control = ecui.create(ecui.ui.InputControl, {parent: baidu.dom.g('common'), main: el});

        value_of(control.getName()).should_be('');
        control.setName('test');
        value_of(control.getName()).should_be('test');
    },

    '动态改变值不会触发onchange事件': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px;height:20px';
        var control = ecui.create(ecui.ui.InputControl, {parent: baidu.dom.g('common'), main: el}),
            result = [];

        control.onchange = function () {
            result = ['change']
        };
        value_of(control.getValue()).should_be('');
        control.setValue('test');
        value_of(control.getValue()).should_be('test');
        value_of(result).should_be([]);
    }
});
