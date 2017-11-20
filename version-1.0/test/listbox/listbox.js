describe('多选框控件初始化测试', {
    '默认初始化': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:100px';
        el.innerHTML = '<div>1</div><div ecui="value:c2;selected:true">2</div><div>3</div><div>4</div>';
        var control = ecui.create('Listbox', {main: el, name: 'test', parent: document.body}),
            items = control.getItems();

        value_of(items !== control.getItems()).should_be_true();
        value_of(items.length).should_be(4);
        value_of(items[0].getMain().getElementsByTagName('input')[0].name).should_be('test');
        value_of(items[0].getMain().getElementsByTagName('input')[0].value).should_be('1');
        value_of(items[1].getMain().getElementsByTagName('input')[0].value).should_be('c2');
        value_of(items[1].isSelected()).should_be_true();
        value_of(items[0].isSelected()).should_be_false();

        control.setParent();
        ecui.dispose(control);
    }
});

describe('多选框控件功能测试', {
    'before': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:100px';
        el.innerHTML = '<div>1</div><div ecui="value:c2;selected:true">2</div><div>3</div><div>4</div>';
        ecui.create('Listbox', {id: 'listbox', main: el, name: 'test', parent: document.body});
    },

    'after': function () {
        var control = ecui.get('listbox');
        control.setParent();
        ecui.dispose(control);
    },

    '添加/删除子选项(add/remove)': function () {
        var control = ecui.get('listbox'),
            item = control.add('5');

        value_of(control.getItems().length).should_be(5);
        value_of(control.getItems()[4]).should_be(item);

        item.setParent();
        value_of(control.getItems().length).should_be(4);

        control.add(item, 3);
        value_of(control.getItems().length).should_be(5);
        value_of(control.getItems()[3]).should_be(item);

        control.remove(item);
        value_of(control.getItems().length).should_be(4);

        ecui.dispose(item);
    },

    '改变多选框名称，移动子选项，子选项名称改变(getName/setName)': function () {
        var el = document.createElement('div');
        el.style.cssText = 'width:200px;height:100px';
        el.innerHTML = '<div>1</div><div ecui="value:c2;selected:true">2</div><div>3</div><div>4</div>';
        var listbox = ecui.create('Listbox', {main: el, name: 'test2', parent: document.body}),
            control = ecui.get('listbox'),
            item = control.getItems()[0];

        value_of(item.getMain().getElementsByTagName('input')[0].name).should_be('test');
        item.setParent(listbox);
        value_of(item.getMain().getElementsByTagName('input')[0].name).should_be('test2');
        value_of(listbox.getName()).should_be('test2');
        
        listbox.setParent();
        ecui.dispose(listbox);
    },

    '子选项选择(getSelected/isSelected/selectAll/setSelected)': function () {
        var control = ecui.get('listbox'),
            items = control.getItems();

        value_of(control.getSelected().length).should_be(1);
        value_of(control.getSelected()[0]).should_be(items[1]);

        control.selectAll();
        value_of(control.getSelected().length).should_be(4);
        value_of(control.getSelected()).should_be(items);

        items[0].setSelected(false);
        value_of(control.getSelected().length).should_be(3);
        value_of(items[0].isSelected()).should_be_false();
    },

    '鼠标事件': function () {
        var control = ecui.get('listbox'),
            item = control.getItems()[0];

        uiut.MockEvents.mousedown(item.getMain());
        uiut.MockEvents.mouseup(item.getMain());
        value_of(item.isSelected()).should_be_true();

        uiut.MockEvents.mousedown(item.getMain());
        uiut.MockEvents.mousemove(item.getMain(), {clientX: 5, clientY: 50});
        uiut.MockEvents.mouseup(item.getMain(), {clientX: 5, clientY: 50});
        value_of(item.isSelected()).should_be_false();
        value_of(control.getItems()[1].isSelected()).should_be_true();
        value_of(control.getItems()[2].isSelected()).should_be_false();

        uiut.MockEvents.mousedown(item.getMain());
        uiut.MockEvents.mouseup(item.getMain());
        value_of(item.isSelected()).should_be_true();
    }
});
