function before() {
    var el = document.createElement('div');
    el.className = 'custom';
    el.innerHTML = '<label>Root</label><div>Node 1</div><div><label>Node 2</label>'
        + '<div>Node 2.1</div><div>Node 2.2</div><div>Node 2.3</div></div>';
    ecui.create('TreeView', {id: 'tree', main: el, parent: document.body});
}

function after() {
    var control = ecui.get('tree');
    control.setParent();
    ecui.dispose(control);
}

describe('控件初始化', {
    '默认初始化': function () {
        var el = document.createElement('div');
        el.className = 'custom';
        el.innerHTML = '<label>Root</label><div>Node 1</div><div><label>Node 2</label><div>Node 2.1</div>'
            + '<div>Node 2.2</div><div>Node 2.3</div></div>';
        var control = ecui.create('TreeView', {main: el, parent: document.body});

        value_of(control.getFirst().getClass()).should_be('custom');
        value_of(control.getLast().getClass()).should_be('custom-expand');
        value_of(control.getFirst().getMain().offsetWidth > 0).should_be_true();
        value_of(control.getLast().getMain().offsetWidth > 0).should_be_true();

        control.setParent();
        ecui.dispose(control);
    },

    '根节点设置collapsed收缩子树': function () {
        var el = document.createElement('div');
        el.className = 'custom';
        el.innerHTML = '<label>Root</label><div>Node 1</div><div><label>Node 2</label><div>Node 2.1</div>'
            + '<div>Node 2.2</div><div>Node 2.3</div></div>';
        var control = ecui.create('TreeView', {main: el, parent: document.body, collapsed: true});

        value_of(control.getFirst().getClass()).should_be('custom');
        value_of(control.getLast().getClass()).should_be('custom-collapse');
        value_of(control.getFirst().getMain().offsetWidth == 0).should_be_true();
        value_of(control.getLast().getMain().offsetWidth == 0).should_be_true();

        control.setParent();
        ecui.dispose(control);
    },

    '部分子节点设置collapsed属性': function () {
        var el = document.createElement('div');
        el.className = 'custom';
        el.innerHTML = '<label>Root</label><div>Node 1</div><div ecui="collapsed:true"><label>Node 2</label>'
            + '<div>Node 2.1</div><div>Node 2.2</div><div>Node 2.3</div></div>';
        var control = ecui.create('TreeView', {main: el, parent: document.body});

        value_of(control.getFirst().getClass()).should_be('custom');
        value_of(control.getLast().getClass()).should_be('custom-collapse');
        value_of(control.getFirst().getMain().offsetWidth > 0).should_be_true();
        value_of(control.getLast().getFirst().getMain().offsetWidth == 0).should_be_true();

        control.setParent();
        ecui.dispose(control);
    }
});

test('getChildren/getFirst/getLast/getNext/getPrev', {
    '访问子树': function () {
        var control = ecui.get('tree'),
            children = control.getChildren();
        value_of(children.length).should_be(2);
        value_of(children === control.getChildren()).should_be_false();
        value_of(control.getFirst() == children[0]).should_be_true();
        value_of(control.getLast() == children[1]).should_be_true();
        value_of(children[0].getFirst()).should_be(null);
        value_of(children[0].getLast()).should_be(null);
        value_of(children[0].getNext() == children[1]).should_be_true();
        value_of(children[1].getPrev() == children[0]).should_be_true();
        value_of(children[0].getPrev()).should_be(null);
        value_of(children[1].getNext()).should_be(null);
    }
});

test('add', {
    '添加/删除子树': function () {
        var control = ecui.get('tree'),
            node2 = control.getLast(),
            node3 = control.add('Node 3', 1);
        value_of(control.getChildren()[1]).should_be(node3);
        node3.setParent();
        value_of(control.getChildren().length).should_be(2);
        control.add(node3);
        value_of(control.getChildren().length).should_be(3);
        value_of(control.getLast()).should_be(node3);
        value_of(node3.getClass()).should_be('custom');
        node3.add(node2);
        value_of(node3.getClass()).should_be('custom-expand');
        control.add(node2, 1);
        value_of(control.getLast()).should_be(node3);
        value_of(node3.getClass()).should_be('custom');
    }
});

test('collapse/expand', {
    '子树收缩/展开': function () {
        var control = ecui.get('tree'),
            children = control.getChildren(),
            child = children[1];
        value_of(child.getClass()).should_be('custom-expand');
        control.collapse();
        value_of(control.getClass()).should_be('custom-collapse');
        value_of(child.getClass()).should_be('custom-expand');
        value_of(child.getMain().offsetWidth).should_be(0);
        child.collapse();
        value_of(children[1].getClass()).should_be('custom-collapse');
        control.expand();
        value_of(control.getClass()).should_be('custom-expand');
        value_of(child.getClass()).should_be('custom-collapse');
        value_of(child.getMain().offsetWidth > 0).should_be_true();
        value_of(child.getFirst().getMain().offsetWidth).should_be(0);
    }
});

test('交互行为模拟', {
    '鼠标操作': function () {
        var control = ecui.get('tree');

        value_of(control.getClass()).should_be('custom-expand');
        uiut.MockEvents.mousedown(control.getMain());
        uiut.MockEvents.mouseup(control.getMain());
        value_of(control.getClass()).should_be('custom-collapse');
        uiut.MockEvents.mousedown(control.getMain());
        uiut.MockEvents.mouseup(control.getMain());
        value_of(control.getClass()).should_be('custom-expand');
        value_of(baidu.dom.hasClass(control.getMain(), 'ui-treeview-selected')).should_be_true();
        uiut.MockEvents.mousedown(document.body);
        uiut.MockEvents.mouseup(document.body);
        value_of(baidu.dom.hasClass(control.getMain(), 'ui-treeview-selected')).should_be_true();
    }
});
