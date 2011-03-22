describe('弹出菜单控件初始化测试', {
    '单级弹出菜单': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px';
        el.innerHTML = '<div style="height:20px">1</div><div>2</div><div>3</div><div>4</div>';
        var ctrl = ecui.create('Popup', {element: el});

        value_of(ctrl.getItems().length).should_be(4);

        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '多级弹出菜单': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px';
        el.innerHTML = '<div style="height:20px"><label>1</label><div>1.1</div><div>1.2</div></div><div>2</div>'
            + '<div>3</div><div>4</div>';
        var ctrl = ecui.create('Popup', {element: el});

        value_of(ctrl.getItems().length).should_be(4);
        value_of(ctrl.getItems()[0].getItems().length).should_be(2);

        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '设置菜单一屏显示的最多数量': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px';
        el.innerHTML = '<div style="height:20px">1</div><div>2</div><div>3</div><div>4</div>';
        var ctrl = ecui.create('Popup', {element: el, optionSize: 3});

        ctrl.show();
        value_of(ctrl.getHeight()).should_be(
            ctrl.$getSection('Prev').getHeight() + ctrl.$getSection('Next').getHeight()
                + ctrl.getItems()[0].getHeight() * 3
        );

        ctrl.setParent();
        ecui.dispose(ctrl);
    }
});


describe('弹出菜单控件功能测试', {
    '层级访问(getItems/getSuperior)': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px';
        el.innerHTML = '<div style="height:20px"><label>1</label><div>1.1</div><div>1.2</div></div><div>2</div>'
            + '<div>3</div><div>4</div>';
        var ctrl = ecui.create('Popup', {element: el}),
            items = ctrl.getItems(),
            node1 = items[0];

        ctrl.show();
        uiut.MockEvents.mouseover(node1.getBase());

        value_of(items !== ctrl.getItems()).should_be_true();
        value_of(node1.getItems()[0].getParent().getSuperior()).should_be(ctrl);

        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '添加/移除子选项，以及样式控件(add/remove)': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px';
        el.innerHTML = '<div style="height:20px"><label>1</label><div>1.1</div><div>1.2</div></div><div>2</div>';
        var ctrl = ecui.create('Popup', {element: el}),
            items = ctrl.getItems(),
            node1 = items[0],
            node2 = items[1];

        value_of(node1.getClass()).should_be('ec-popup-item-complex');
        value_of(node2.getClass()).should_be('ec-popup-item');

        nodex = node1.add('1.x', 1);
        value_of(node1.getItems()[1]).should_be(nodex);
        node2.add(nodex);
        value_of(node2.getClass()).should_be('ec-popup-item-complex');

        ctrl.add('3');
        value_of(ctrl.getItems().length).should_be(3);

        ecui.dispose(ctrl.remove(2));
        node2.remove(nodex);
        value_of(node2.getClass()).should_be('ec-popup-item');
        node2.setParent();
        value_of(ctrl.getItems().length).should_be(1);

        ecui.dispose(nodex);
        ecui.dispose(node2);
        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '鼠标移入，如果有子菜单需要展开': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px';
        el.innerHTML = '<div style="height:20px"><label>1</label><div>1.1</div><div>1.2</div></div><div>2</div>';
        var ctrl = ecui.create('Popup', {element: el}),
            items = ctrl.getItems(),
            node1 = items[0],
            node2 = items[1],
            child = node1.getItems()[0];

        ctrl.show();
        uiut.MockEvents.mouseover(node1.getBase());
        value_of(child.isShow()).should_be_true();
        value_of(baidu.dom.hasClass(node1.getBase(), 'ec-popup-item-complex-over')).should_be_true();

        uiut.MockEvents.mouseout(node1.getBase());
        uiut.MockEvents.mouseover(child.getBase());
        value_of(child.isShow()).should_be_true();
        value_of(baidu.dom.hasClass(node1.getBase(), 'ec-popup-item-complex-over')).should_be_true();
        value_of(baidu.dom.hasClass(child.getBase(), 'ec-popup-item-over')).should_be_true();

        uiut.MockEvents.mouseout(child.getBase());
        uiut.MockEvents.mouseover(node2.getBase());
        value_of(child.isShow()).should_be_false();
        value_of(baidu.dom.hasClass(node1.getBase(), 'ec-popup-item-complex-over')).should_be_false();
        value_of(baidu.dom.hasClass(child.getBase(), 'ec-popup-item-over')).should_be_false();
        value_of(baidu.dom.hasClass(node2.getBase(), 'ec-popup-item-over')).should_be_true();

        uiut.MockEvents.mouseout(node2.getBase());
        uiut.MockEvents.mouseover(document.body);

        ctrl.setParent();
        ecui.dispose(ctrl);
    }
});
