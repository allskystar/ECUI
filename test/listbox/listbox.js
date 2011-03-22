describe('多选框控件初始化测试', {
    '默认初始化': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:100px';
        el.innerHTML = '<div>1</div><div ecui="value:c2;selected:true">2</div><div>3</div><div>4</div>';
        var ctrl = ecui.create('Listbox', {element: el, name: 'test', parent: document.body}),
            items = ctrl.getItems();

        value_of(items !== ctrl.getItems()).should_be_true();
        value_of(items.length).should_be(4);
        value_of(items[0].getBase().getElementsByTagName('input')[0].name).should_be('test');
        value_of(items[0].getBase().getElementsByTagName('input')[0].value).should_be('1');
        value_of(items[1].getBase().getElementsByTagName('input')[0].value).should_be('c2');
        value_of(items[1].isSelected()).should_be_true();
        value_of(items[0].isSelected()).should_be_false();

        ctrl.setParent();
        ecui.dispose(ctrl);
    }
});

describe('多选框控件功能测试', {
    'before': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:100px';
        el.innerHTML = '<div>1</div><div ecui="value:c2;selected:true">2</div><div>3</div><div>4</div>';
        ecui.create('Listbox', {id: 'listbox', element: el, name: 'test', parent: document.body});
    },

    'after': function () {
        var ctrl = ecui.get('listbox');
        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '添加/删除子选项(add/remove)': function () {
        var ctrl = ecui.get('listbox'),
            item = ctrl.add('5');

        value_of(ctrl.getItems().length).should_be(5);
        value_of(ctrl.getItems()[4]).should_be(item);

        item.setParent();
        value_of(ctrl.getItems().length).should_be(4);

        ctrl.add(item, 3);
        value_of(ctrl.getItems().length).should_be(5);
        value_of(ctrl.getItems()[3]).should_be(item);

        ctrl.remove(item);
        value_of(ctrl.getItems().length).should_be(4);

        ecui.dispose(item);
    },

    '改变多选框名称，移动子选项，子选项名称改变(getName/setName)': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:100px';
        el.innerHTML = '<div>1</div><div ecui="value:c2;selected:true">2</div><div>3</div><div>4</div>';
        var listbox = ecui.create('Listbox', {element: el, name: 'test2', parent: document.body}),
            ctrl = ecui.get('listbox'),
            item = ctrl.getItems()[0];

        value_of(item.getBase().getElementsByTagName('input')[0].name).should_be('test');
        item.setParent(listbox);
        value_of(item.getBase().getElementsByTagName('input')[0].name).should_be('test2');
        value_of(listbox.getName()).should_be('test2');
        
        listbox.setParent();
        ecui.dispose(listbox);
    },

    '子选项选择(getSelected/isSelected/selectAll/setSelected)': function () {
        var ctrl = ecui.get('listbox'),
            items = ctrl.getItems();

        value_of(ctrl.getSelected().length).should_be(1);
        value_of(ctrl.getSelected()[0]).should_be(items[1]);

        ctrl.selectAll();
        value_of(ctrl.getSelected().length).should_be(4);
        value_of(ctrl.getSelected()).should_be(items);

        items[0].setSelected(false);
        value_of(ctrl.getSelected().length).should_be(3);
        value_of(items[0].isSelected()).should_be_false();
    },

    '鼠标事件': function () {
        var ctrl = ecui.get('listbox'),
            item = ctrl.getItems()[0];

        uiut.MockEvents.mousedown(item.getBase());
        uiut.MockEvents.mouseup(item.getBase());
        value_of(item.isSelected()).should_be_true();

        uiut.MockEvents.mousedown(item.getBase());
        uiut.MockEvents.mousemove(item.getBase(), {clientX: 5, clientY: 50});
        uiut.MockEvents.mouseup(item.getBase(), {clientX: 5, clientY: 50});
        value_of(item.isSelected()).should_be_true();
        value_of(ctrl.getItems()[1].isSelected()).should_be_true();
        value_of(ctrl.getItems()[2].isSelected()).should_be_true();

        uiut.MockEvents.mousedown(item.getBase());
        uiut.MockEvents.mouseup(item.getBase());
        value_of(item.isSelected()).should_be_false();
    }
});
