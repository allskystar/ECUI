describe('窗体控件初始化测试', {
    '空标题': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:200px';
        var ctrl = ecui.create('Form', {element: el, parent: document.body});

        value_of(ctrl.getWidth()).should_be(200);
        value_of(ctrl.getHeight()).should_be(200);
        value_of(ctrl.$getSection('Title').getBody().innerHTML).should_be('');

        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '包含标题': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:200px';
        el.innerHTML = '<label>标题</label>';
        var ctrl = ecui.create('Form', {element: el, parent: document.body});

        value_of(ctrl.getWidth()).should_be(200);
        value_of(ctrl.getHeight()).should_be(200);
        value_of(ctrl.$getSection('Title').getBody().innerHTML).should_be('标题');

        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '设置隐藏，标题使用默认宽度自适应': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:200px';
        el.innerHTML = '<label>标题</label>';
        var ctrl = ecui.create('Form', {element: el, parent: document.body, hide: true});

        value_of(ctrl.isShow()).should_be_false();
        value_of(ctrl.$getSection('Title').getWidth() == 200).should_be_true();
        value_of(ctrl.$getSection('Title').getHeight() < 200).should_be_true();

        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '标题使用不自适应': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:200px';
        el.innerHTML = '<label>标题</label>';
        var ctrl = ecui.create('Form', {element: el, parent: document.body, titleAuto: false});

        value_of(ctrl.isShow()).should_be_true();
        value_of(ctrl.$getSection('Title').getWidth() < 200).should_be_true();
        value_of(ctrl.$getSection('Title').getHeight() < 200).should_be_true();

        ctrl.setParent();
        ecui.dispose(ctrl);
    }
});

describe('窗体控件功能测试', {
    'before': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:200px';
        el.innerHTML = '<label>标题</label>';
        var ctrl = ecui.create('Form', {id:'form', element: el, parent: document.body});
    },

    'after': function () {
        var ctrl = ecui.get('form');
        ctrl.setParent();
        ecui.dispose(ctrl);
        var result = ecui.query({type: ecui.ui.Control});
        value_of(!result.len || (result.len == 1 && result[0].getBase() == 'ec-selector')).should_be_true();
    },

    '设置标题(setTitle)': function () {
        var ctrl = ecui.get('form');
        ctrl.setTitle('新标题');
        value_of(ctrl.$getSection('Title').getBody().innerHTML).should_be('新标题');
    },

    '窗体叠加显示(hide/show)': function () {
        var ctrl = ecui.get('form'),
            newForm = ecui.create('Form', {parent: document.body});

        value_of(parseInt(newForm.getOuter().style.zIndex) > parseInt(ctrl.getOuter().style.zIndex)).should_be_true();
        uiut.MockEvents.mousedown(ctrl.getBase());
        uiut.MockEvents.mouseup(ctrl.getBase());
        value_of(parseInt(newForm.getOuter().style.zIndex) < parseInt(ctrl.getOuter().style.zIndex)).should_be_true();
        ecui.setFocused(newForm);
        value_of(parseInt(newForm.getOuter().style.zIndex) > parseInt(ctrl.getOuter().style.zIndex)).should_be_true();

        newForm.setParent();
        ecui.dispose(newForm);
    },

    '窗体拖动': function () {
        var ctrl = ecui.get('form'),
            title = ctrl.$getSection('Title');

        ctrl.getOuter().style.position = 'absolute';
        ctrl.setPosition(10, 10);

        uiut.MockEvents.mousedown(title.getBase(), {clientX: 15, clientY: 15});
        uiut.MockEvents.mousemove(document.body, {clientX: 25, clientY: 25});
        uiut.MockEvents.mouseup(document.body);

        value_of(ctrl.getX()).should_be(20);
        value_of(ctrl.getY()).should_be(20);
    }
});
