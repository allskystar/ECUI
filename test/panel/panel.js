describe('截面控件初始化测试', {
    '默认初始化显示两个滚动条': function () {
        var ctrl = ecui.create('Panel');
        value_of(ctrl.$getSection('HScroll')).should_not_be(void(0));
        value_of(ctrl.$getSection('VScroll')).should_not_be(void(0));
        ecui.dispose(ctrl);
    },

    '不产生水平方向滚动条': function () {
        var ctrl = ecui.create('Panel', {hScroll: false});
        value_of(ctrl.$getSection('HScroll')).should_be(void(0));
        value_of(ctrl.$getSection('VScroll')).should_not_be(void(0));
        ecui.dispose(ctrl);
    },

    '不产生垂直方向滚动条': function () {
        var ctrl = ecui.create('Panel', {vScroll: false});
        value_of(ctrl.$getSection('VScroll')).should_be(void(0));
        value_of(ctrl.$getSection('HScroll')).should_not_be(void(0));
        ecui.dispose(ctrl);
    },

    '包含绝对定位的元素，不指定绝对定位参数': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px;height:100px;position:absolute';
        el.innerHTML = '<div style="width:100px;height:100px">'
            + '<div style="position:absolute;left:81px;top:81px;width:20px;height:20px"></div></div>';
        document.body.appendChild(el);

        var ctrl = ecui.create('Panel', {main: el}),
            hscroll = ctrl.$getSection('HScroll'),
            vscroll = ctrl.$getSection('VScroll'),
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
            hscroll = ctrl.$getSection('HScroll'),
            vscroll = ctrl.$getSection('VScroll'),
            corner = ctrl.$getSection('Corner');

        ctrl.setSize(100, 100);
        value_of(hscroll.isShow()).should_be_true();
        value_of(vscroll.isShow()).should_be_true();
        value_of(corner.isShow()).should_be_true();

        ctrl.setParent();
        ecui.dispose(ctrl);
    }
});

describe('功能测试', {
    'before': function () {
        var el = document.createElement('div');
        el.className = 'custom';
        el.style.cssText = 'width:100px;height:100px;position:absolute';
        el.innerHTML = '<div style="width:100px;height:100px"></div>';
        document.body.appendChild(el);
        ecui.create('Panel', {id: 'panel', main: el, wheelDelta: 20});
    },

    'after': function () {
        var ctrl = ecui.get('panel');
        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '控件大小改变隐藏或显示滚动条': function () {
        var ctrl = ecui.get('panel'),
            hscroll = ctrl.$getSection('HScroll'),
            vscroll = ctrl.$getSection('VScroll'),
            corner = ctrl.$getSection('Corner');

        ctrl.setSize(100, 100);
        value_of(hscroll.isShow()).should_be_false();
        value_of(vscroll.isShow()).should_be_false();
        value_of(corner.isShow()).should_be_false();

        ctrl.setSize(115, 99);
        value_of(hscroll.isShow()).should_be_false();
        value_of(vscroll.isShow()).should_be_true();
        value_of(corner.isShow()).should_be_false();

        ctrl.setSize(99, 115);
        value_of(hscroll.isShow()).should_be_true();
        value_of(vscroll.isShow()).should_be_false();
        value_of(corner.isShow()).should_be_false();

        ctrl.setSize(99, 114);
        value_of(hscroll.isShow()).should_be_true();
        value_of(vscroll.isShow()).should_be_true();
        value_of(corner.isShow()).should_be_true();

        ctrl.setSize(114, 99);
        value_of(hscroll.isShow()).should_be_true();
        value_of(vscroll.isShow()).should_be_true();
        value_of(corner.isShow()).should_be_true();
    },

    '截面控件结构' : function () {
        var ctrl = ecui.get('panel'),
            el = ctrl.getBody();
        value_of(el.parentNode.parentNode).should_be(ctrl.getMain());
        value_of(ctrl.getMain()).should_be(ctrl.getOuter());
    },

    '滚动条自动复位': function () {
        var ctrl = ecui.get('panel'),
            hscroll = ctrl.$getSection('HScroll');

        ctrl.setSize(50, 50);
        hscroll.setValue(20);
        value_of(ctrl.getBody().style.left).should_be('-20px');

        ctrl.setSize(100, 100);
        value_of(ctrl.getBody().style.left).should_be('0px');
    },

    '鼠标滚轮支持': function () {
        var ctrl = ecui.get('panel'),
            vscroll = ctrl.$getSection('VScroll');

        ecui.setFocused(ctrl);
        ctrl.setSize(50, 50);
        uiut.MockEvents.mouseover(ctrl.getMain());
        uiut.MockEvents.mousewheel(document, {detail: 3});
        value_of(ctrl.getScrollTop()).should_be(20);
    }
});
