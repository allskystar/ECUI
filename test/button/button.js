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
    '检测控件类型样式': function () {
        var button = ecui.create(ecui.ui.Button, {parent: baidu.dom.g('common')}),
            el = button.getMain();

        value_of(button.getTypes()).should_be(['ui-control', 'ui-button']);
    }
});

test('$mouseout/$mouseover', {
    '鼠标移入移出改变悬停状态': function () {
        var button = ecui.create(ecui.ui.Button, {parent: baidu.dom.g('common')}),
            el = button.getMain();

        uiut.MockEvents.mouseover(el);
        value_of(baidu.dom.hasClass(el, 'ui-button-hover')).should_be_true();
        value_of(baidu.dom.hasClass(el, 'ui-button-active')).should_be_false();
        uiut.MockEvents.mouseover(document.body);
        value_of(baidu.dom.hasClass(el, 'ui-button-hover')).should_be_false();
        value_of(baidu.dom.hasClass(el, 'ui-button-active')).should_be_false();
    },

    '激活状态下鼠标移入移出': function () {
        var button = ecui.create(ecui.ui.Button, {parent: baidu.dom.g('common')}),
            el = button.getMain();

        uiut.MockEvents.mouseover(el);
        value_of(baidu.dom.hasClass(el, 'ui-button-hover')).should_be_true();
        value_of(baidu.dom.hasClass(el, 'ui-button-active')).should_be_false();
        uiut.MockEvents.mousedown(el);
        value_of(baidu.dom.hasClass(el, 'ui-button-hover')).should_be_true();
        value_of(baidu.dom.hasClass(el, 'ui-button-active')).should_be_true();
        uiut.MockEvents.mouseover(document.body);
        value_of(baidu.dom.hasClass(el, 'ui-button-hover')).should_be_false();
        value_of(baidu.dom.hasClass(el, 'ui-button-active')).should_be_false();
        uiut.MockEvents.mouseover(el);
        value_of(baidu.dom.hasClass(el, 'ui-button-hover')).should_be_true();
        value_of(baidu.dom.hasClass(el, 'ui-button-active')).should_be_true();
        uiut.MockEvents.mouseup(el);
        value_of(baidu.dom.hasClass(el, 'ui-button-hover')).should_be_true();
        value_of(baidu.dom.hasClass(el, 'ui-button-active')).should_be_false();
    }
});

test('setText', {
    '设置按钮文字': function () {
        var button = new ecui.ui.Button({parent: baidu.dom.g('common'), text: '按钮'});
        value_of(button.getContent()).should_be('按钮');
        button.setText('测试');
        value_of(button.getContent()).should_be('测试');
    },

    '特殊字符设置': function () {
        var button = new ecui.ui.Button({parent: baidu.dom.g('common')});
        button.setText('<font color="red">测试</font>');
        value_of(button.getContent()).should_be('&lt;font color="red"&gt;测试&lt;/font&gt;');
    }
});