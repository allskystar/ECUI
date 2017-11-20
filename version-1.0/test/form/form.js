function before() {
    var el = document.createElement('div');
    el.style.cssText = 'width:200px;height:200px';
    el.innerHTML = '<label>标题</label>';
    var control = ecui.create('Form', {id:'form', main: el, parent: document.body});
}

function after() {
    var control = ecui.get('form');
    ecui.dispose(control);
}

function check(control) {
    var title = control.$getSection('Title'),
        close = control.$getSection('Close');

    value_of(control.getTypes()).should_be(['ui-form']);
    value_of(control.getClass()).should_be('ui-form');
    value_of(title.getTypes()).should_be([]);
    value_of(title.getClass()).should_be('ui-form-title');
    value_of(close.getTypes()).should_be(['ui-button']);
    value_of(close.getClass()).should_be('ui-form-close');
}

describe('控件初始化', {
    '空标题': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:200px';
        var control = ecui.create('Form', {main: el, parent: document.body});

        value_of(control.getWidth()).should_be(200);
        value_of(control.getHeight()).should_be(200);
        value_of(control.$getSection('Title').getBody().innerHTML).should_be('');
        value_of(control.getMain()).should_be(el);
        check(control);

        control.setParent();
        ecui.dispose(control);
    },

    '包含标题': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:200px';
        el.innerHTML = '<label>标题</label>';
        el.firstChild.setAttribute('flag', '1');
        var control = ecui.create('Form', {main: el, parent: document.body});

        value_of(control.getWidth()).should_be(200);
        value_of(control.getHeight()).should_be(200);
        value_of(control.$getSection('Title').getBody().innerHTML).should_be('标题');
        value_of(control.getMain()).should_be(el);
        value_of(control.$getSection('Title').getMain().getAttribute('flag')).should_be('1');
        check(control);

        control.setParent();
        ecui.dispose(control);
    },

    '设置隐藏，标题使用默认宽度自适应': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:200px';
        el.innerHTML = '<label>标题</label>';
        var control = ecui.create('Form', {main: el, parent: document.body, hide: true});

        value_of(control.isShow()).should_be_false();
        value_of(control.$getSection('Title').getWidth() == 200).should_be_true();
        value_of(control.$getSection('Title').getHeight() < 200).should_be_true();

        control.setParent();
        ecui.dispose(control);
    },

    '标题使用不自适应': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:200px';
        el.innerHTML = '<label>标题</label>';
        var control = ecui.create('Form', {main: el, parent: document.body, titleAuto: false});

        value_of(control.isShow()).should_be_true();
        value_of(control.$getSection('Title').getWidth() < 200).should_be_true();
        value_of(control.$getSection('Title').getHeight() < 200).should_be_true();

        control.setParent();
        ecui.dispose(control);
    }
});

test('setTitle', {
    '设置标题': function () {
        var control = ecui.get('form');
        control.setTitle('新标题');
        value_of(control.$getSection('Title').getBody().innerHTML).should_be('新标题');
    }
});

test('hide/show', {
    '窗体叠加显示': function () {
        var control = ecui.get('form'),
            newForm = ecui.create('Form', {parent: document.body});

        value_of(parseInt(newForm.getOuter().style.zIndex) > parseInt(control.getOuter().style.zIndex)).should_be_true();
        uiut.MockEvents.mousedown(control.getMain());
        uiut.MockEvents.mouseup(control.getMain());
        value_of(parseInt(newForm.getOuter().style.zIndex) < parseInt(control.getOuter().style.zIndex)).should_be_true();
        ecui.setFocused(newForm);
        value_of(parseInt(newForm.getOuter().style.zIndex) > parseInt(control.getOuter().style.zIndex)).should_be_true();

        newForm.setParent();
        ecui.dispose(newForm);
    }
});

test('交互行为模拟', {
    '窗体拖动': function () {
        var control = ecui.get('form'),
            title = control.$getSection('Title');

        control.getOuter().style.position = 'absolute';
        control.setPosition(10, 10);

        uiut.MockEvents.mousedown(title.getMain(), {clientX: 15, clientY: 15});
        uiut.MockEvents.mousemove(document.body, {clientX: 25, clientY: 25});
        uiut.MockEvents.mouseup(document.body);

        value_of(control.getX()).should_be(20);
        value_of(control.getY()).should_be(20);
    }
});
