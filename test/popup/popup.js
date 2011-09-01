describe('弹出菜单控件初始化测试', {
    '单级弹出菜单': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px';
        el.innerHTML = '<div style="height:20px">1</div><div>2</div><div>3</div><div>4</div>';
        var control = ecui.create('Popup', {main: el});

        value_of(control.getItems().length).should_be(4);

        control.setParent();
        ecui.dispose(control);
    },

    '多级弹出菜单': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px';
        el.innerHTML = '<div style="height:20px"><label>1</label><div>1.1</div><div>1.2</div></div><div>2</div>'
            + '<div>3</div><div>4</div>';
        var control = ecui.create('Popup', {main: el});

        value_of(control.getItems().length).should_be(4);
        value_of(control.getItems()[0].getItems().length).should_be(2);

        control.setParent();
        ecui.dispose(control);
    },

    '设置菜单一屏显示的最多数量': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px';
        el.innerHTML = '<div style="height:20px">1</div><div>2</div><div>3</div><div>4</div>';
        var control = ecui.create('Popup', {main: el, optionSize: 3});

        control.show();
        value_of(control.getHeight()).should_be(
            control.$getSection('Prev').getHeight() + control.$getSection('Next').getHeight()
                + control.getItems()[0].getHeight() * 3
        );

        control.setParent();
        ecui.dispose(control);
    }
});


describe('弹出菜单控件功能测试', {
    '层级访问(getItems/getSuperior)': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px';
        el.innerHTML = '<div style="height:20px"><label>1</label><div>1.1</div><div>1.2</div></div><div>2</div>'
            + '<div>3</div><div>4</div>';
        var control = ecui.create('Popup', {main: el}),
            items = control.getItems(),
            node1 = items[0];

        control.show();
        uiut.MockEvents.mouseover(node1.getMain());

        value_of(items !== control.getItems()).should_be_true();
//        value_of(node1.getItems()[0].getParent().getSuperior()).should_be(control);

        control.setParent();
        ecui.dispose(control);
    },

    '添加/移除子选项，以及样式控件(add/remove)': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px';
        el.innerHTML = '<div style="height:20px"><label>1</label><div>1.1</div><div>1.2</div></div><div>2</div>';
        var control = ecui.create('Popup', {main: el}),
            items = control.getItems(),
            node1 = items[0],
            node2 = items[1];

        value_of(node1.getClass()).should_be('ui-popup-item-branch');
        value_of(node2.getClass()).should_be('ui-popup-item');

        nodex = node1.add('1.x', 1);
        value_of(node1.getItems()[1]).should_be(nodex);
        node2.add(nodex);
        value_of(node2.getClass()).should_be('ui-popup-item-branch');

        control.add('3');
        value_of(control.getItems().length).should_be(3);

        ecui.dispose(control.remove(2));
        node2.remove(nodex);
        value_of(node2.getClass()).should_be('ui-popup-item');
        node2.setParent();
        value_of(control.getItems().length).should_be(1);

        ecui.dispose(nodex);
        ecui.dispose(node2);
        control.setParent();
        ecui.dispose(control);
    },

    '鼠标移入，如果有子菜单需要展开': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:100px';
        el.innerHTML = '<div style="height:20px"><label>1</label><div>1.1</div><div>1.2</div></div><div>2</div>';
        var control = ecui.create('Popup', {main: el}),
            items = control.getItems(),
            node1 = items[0],
            node2 = items[1],
            child = node1.getItems()[0];

        control.show();
        uiut.MockEvents.mouseover(node1.getMain());
        value_of(child.isShow()).should_be_true();
        value_of(baidu.dom.hasClass(node1.getMain(), 'ui-popup-item-branch-hover')).should_be_true();

        uiut.MockEvents.mouseout(node1.getMain());
        uiut.MockEvents.mouseover(child.getMain());
        value_of(child.isShow()).should_be_true();
        value_of(baidu.dom.hasClass(node1.getMain(), 'ui-popup-item-branch-hover')).should_be_true();
        value_of(baidu.dom.hasClass(child.getMain(), 'ui-popup-item-hover')).should_be_true();

        uiut.MockEvents.mouseout(child.getMain());
        uiut.MockEvents.mouseover(node2.getMain());
        value_of(child.isShow()).should_be_false();
        value_of(baidu.dom.hasClass(node1.getMain(), 'ui-popup-item-branch-hover')).should_be_false();
        value_of(baidu.dom.hasClass(child.getMain(), 'ui-popup-item-hover')).should_be_false();
        value_of(baidu.dom.hasClass(node2.getMain(), 'ui-popup-item-hover')).should_be_true();

        uiut.MockEvents.mouseout(node2.getMain());
        uiut.MockEvents.mouseover(document.body);

        control.setParent();
        ecui.dispose(control);
    }
});
