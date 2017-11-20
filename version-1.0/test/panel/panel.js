function before() {
    var el = document.createElement('div');
    el.style.cssText = 'width:100px;height:100px;position:absolute';
    el.innerHTML = '<div style="width:100px;height:100px"></div>';
    document.body.appendChild(el);
    ecui.create('Panel', {id: 'panel', main: el, wheelDelta: 20});
}

function after() {
    ecui.get('panel').appendTo();
    ecui.dispose(ecui.get('panel'));
}

describe('控件初始化', {
    '基本属性与部件属性': function () {
        var el = ecui.dom.create('custom'),
            control = ecui.create('Panel', {main: el}),
            hscrollbar = control.$getSection('HScrollbar'),
            vscrollbar = control.$getSection('VScrollbar'),
            corner = control.$getSection('Corner'),
            body = control.getBody(),
            main = control.getMain();

        el.setAttribute('flag', '1');

        value_of(control.getTypes()).should_be(['ui-panel']);
        value_of(control.getClass()).should_be('custom');
        value_of(hscrollbar.getTypes()).should_be(['ui-hscrollbar', 'ui-scrollbar']);
        value_of(hscrollbar.getClass()).should_be('ui-panel-hscrollbar');
        value_of(vscrollbar.getTypes()).should_be(['ui-vscrollbar', 'ui-scrollbar']);
        value_of(vscrollbar.getClass()).should_be('ui-panel-vscrollbar');
        value_of(corner.getTypes()).should_be([]);
        value_of(corner.getClass()).should_be('ui-panel-corner');

        value_of(body.parentNode.parentNode).should_be(main);
        value_of(main.getAttribute('flag')).should_be('1');
        value_of(body.className).should_be('ui-panel-body');
        value_of(body.parentNode.className).should_be('ui-panel-layout');
    },

    '滚动条初始化': function () {
        var control = ecui.create('Panel', {hScroll: false});
        value_of(control.$getSection('HScrollbar')).should_be(void(0));
        value_of(control.$getSection('VScrollbar')).should_not_be(void(0));
        value_of(control.$getSection('Corner')).should_be(void(0));
        ecui.dispose(control);

        var control = ecui.create('Panel', {vScroll: false});
        value_of(control.$getSection('VScrollbar')).should_be(void(0));
        value_of(control.$getSection('HScrollbar')).should_not_be(void(0));
        value_of(control.$getSection('Corner')).should_be(void(0));
        ecui.dispose(control);
    },

    '包含绝对定位的元素，不指定绝对定位参数': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px;height:100px;position:absolute';
        el.innerHTML = '<div style="width:100px;height:100px">'
            + '<div style="position:absolute;left:81px;top:81px;width:20px;height:20px"></div></div>';
        document.body.appendChild(el);

        var ctrl = ecui.create('Panel', {main: el}),
            hscroll = ctrl.$getSection('HScrollbar'),
            vscroll = ctrl.$getSection('VScrollbar'),
            corner = ctrl.$getSection('Corner');

        ctrl.setSize(100, 100);
        value_of(hscroll.isShow()).should_be_false();
        value_of(vscroll.isShow()).should_be_false();
        value_of(corner.isShow()).should_be_false();

        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '包含绝对定位的元素，指定绝对定位参数': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px;height:100px;position:absolute';
        el.innerHTML = '<div style="width:100px;height:100px">'
            + '<div style="position:absolute;left:81px;top:81px;width:20px;height:20px"></div></div>';
        document.body.appendChild(el);

        var ctrl = ecui.create('Panel', {main: el, absolute: true}),
            hscroll = ctrl.$getSection('HScrollbar'),
            vscroll = ctrl.$getSection('VScrollbar'),
            corner = ctrl.$getSection('Corner');

        ctrl.setSize(100, 100);
        value_of(hscroll.isShow()).should_be_true();
        value_of(vscroll.isShow()).should_be_true();
        value_of(corner.isShow()).should_be_true();

        ctrl.setParent();
        ecui.dispose(ctrl);
    }
});

test('setSize', {
    '控件大小改变隐藏或显示滚动条': function () {
        var control = ecui.get('panel'),
            hscroll = control.$getSection('HScrollbar'),
            vscroll = control.$getSection('VScrollbar'),
            corner = control.$getSection('Corner');

        control.setSize(100, 100);
        value_of(hscroll.isShow()).should_be_false();
        value_of(vscroll.isShow()).should_be_false();
        value_of(corner.isShow()).should_be_false();

        control.setSize(115, 99);
        value_of(hscroll.isShow()).should_be_false();
        value_of(vscroll.isShow()).should_be_true();
        value_of(corner.isShow()).should_be_false();

        control.setSize(99, 115);
        value_of(hscroll.isShow()).should_be_true();
        value_of(vscroll.isShow()).should_be_false();
        value_of(corner.isShow()).should_be_false();

        control.setSize(99, 114);
        value_of(hscroll.isShow()).should_be_true();
        value_of(vscroll.isShow()).should_be_true();
        value_of(corner.isShow()).should_be_true();

        control.setSize(114, 99);
        value_of(hscroll.isShow()).should_be_true();
        value_of(vscroll.isShow()).should_be_true();
        value_of(corner.isShow()).should_be_true();
    }
});

test('hide', {
    '滚动条自动复位': function () {
        var control = ecui.get('panel'),
            hscroll = control.$getSection('HScrollbar');

        control.setSize(50, 50);
        hscroll.setValue(20);
        value_of(control.getBody().style.left).should_be('-20px');

        control.setSize(100, 100);
        value_of(control.getBody().style.left).should_be('0px');
    }
});

test('交互行为模拟', {
    '键盘支持': function () {
        var control = ecui.get('panel');

        ecui.setFocused(control);
        control.setSize(50, 50);
        uiut.MockEvents.keydown(document, 40);
        uiut.MockEvents.keydown(document, 40);
        value_of(control.getScrollTop()).should_be(2);
        uiut.MockEvents.keydown(document, 38);
        value_of(control.getScrollTop()).should_be(1);
        uiut.MockEvents.keydown(document, 39);
        uiut.MockEvents.keydown(document, 39);
        value_of(control.getScrollLeft()).should_be(2);
        uiut.MockEvents.keydown(document, 37);
        value_of(control.getScrollLeft()).should_be(1);
    },

    '鼠标滚轮支持': function () {
        var control = ecui.get('panel'),
            vscroll = control.$getSection('VScrollbar');

        ecui.setFocused(control);
        control.setSize(50, 50);
        uiut.MockEvents.mouseover(control.getMain());
        uiut.MockEvents.mousewheel(document, {detail: 3});
        value_of(control.getScrollTop()).should_be(20);
    }
});
