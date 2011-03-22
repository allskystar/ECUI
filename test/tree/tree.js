describe('树控件初始化测试', {
    '默认初始化': function () {
        var el = document.createElement('div');
        el.className = 'custom';
        el.innerHTML = '<label>Root</label><div>Node 1</div><div><label>Node 2</label><div>Node 2.1</div>'
            + '<div>Node 2.2</div><div>Node 2.3</div></div>';
        var ctrl = ecui.create('Tree', {element: el, parent: document.body});

        value_of(ctrl.getFirst().getClass()).should_be('custom');
        value_of(ctrl.getLast().getClass()).should_be('custom-nonleaf');
        value_of(ctrl.getFirst().getBase().offsetWidth > 0).should_be_true();
        value_of(ctrl.getLast().getBase().offsetWidth > 0).should_be_true();

        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '根节点设置fold收缩子树': function () {
        var el = document.createElement('div');
        el.className = 'custom';
        el.innerHTML = '<label>Root</label><div>Node 1</div><div><label>Node 2</label><div>Node 2.1</div>'
            + '<div>Node 2.2</div><div>Node 2.3</div></div>';
        var ctrl = ecui.create('Tree', {element: el, parent: document.body, fold: true});

        value_of(ctrl.getFirst().getClass()).should_be('custom');
        value_of(ctrl.getLast().getClass()).should_be('custom-fold');
        value_of(ctrl.getFirst().getBase().offsetWidth == 0).should_be_true();
        value_of(ctrl.getLast().getBase().offsetWidth == 0).should_be_true();

        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '部分子节点设置fold属性': function () {
        var el = document.createElement('div');
        el.className = 'custom';
        el.innerHTML = '<label>Root</label><div>Node 1</div><div ecui="fold:true"><label>Node 2</label>'
            + '<div>Node 2.1</div><div>Node 2.2</div><div>Node 2.3</div></div>';
        var ctrl = ecui.create('Tree', {element: el, parent: document.body});

        value_of(ctrl.getFirst().getClass()).should_be('custom');
        value_of(ctrl.getLast().getClass()).should_be('custom-fold');
        value_of(ctrl.getFirst().getBase().offsetWidth > 0).should_be_true();
        value_of(ctrl.getLast().getFirst().getBase().offsetWidth == 0).should_be_true();

        ctrl.setParent();
        ecui.dispose(ctrl);
    }
});

describe('树控件功能测试', {
    'before': function () {
        var el = document.createElement('div');
        el.className = 'custom';
        el.innerHTML = '<label>Root</label><div>Node 1</div><div><label>Node 2</label>'
            + '<div>Node 2.1</div><div>Node 2.2</div><div>Node 2.3</div></div>';
        ecui.create('Tree', {id: 'tree', element: el, parent: document.body});
    },

    'after': function () {
        var ctrl = ecui.get('tree');
        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '访问子树(getChildTrees/getFirst/getLast/getNext/getPrev)': function () {
        var ctrl = ecui.get('tree'),
            children = ctrl.getChildTrees();
        value_of(children.length).should_be(2);
        value_of(children === ctrl.getChildTrees()).should_be_false();
        value_of(ctrl.getFirst() == children[0]).should_be_true();
        value_of(ctrl.getLast() == children[1]).should_be_true();
        value_of(children[0].getFirst()).should_be(null);
        value_of(children[0].getLast()).should_be(null);
        value_of(children[0].getNext() == children[1]).should_be_true();
        value_of(children[1].getPrev() == children[0]).should_be_true();
        value_of(children[0].getPrev()).should_be(null);
        value_of(children[1].getNext()).should_be(null);
    },

    '添加/删除子树(add)': function () {
        var ctrl = ecui.get('tree'),
            node2 = ctrl.getLast(),
            node3 = ctrl.add('Node 3', 1);
        value_of(ctrl.getChildTrees()[1]).should_be(node3);
        node3.setParent();
        value_of(ctrl.getChildTrees().length).should_be(2);
        ctrl.add(node3);
        value_of(ctrl.getChildTrees().length).should_be(3);
        value_of(ctrl.getLast()).should_be(node3);
        value_of(node3.getClass()).should_be('custom');
        node3.add(node2);
        value_of(node3.getClass()).should_be('custom-nonleaf');
        ctrl.add(node2, 1);
        value_of(ctrl.getLast()).should_be(node3);
        value_of(node3.getClass()).should_be('custom');
    },

    '子树显示/隐藏(setFold)': function () {
        var ctrl = ecui.get('tree'),
            children = ctrl.getChildTrees(),
            child = children[1];
        value_of(child.getClass()).should_be('custom-nonleaf');
        ctrl.setFold();
        value_of(ctrl.getClass()).should_be('custom-fold');
        value_of(child.getClass()).should_be('custom-nonleaf');
        value_of(child.getBase().offsetWidth).should_be(0);
        child.setFold();
        value_of(children[1].getClass()).should_be('custom-fold');
        ctrl.setFold(false);
        value_of(ctrl.getClass()).should_be('custom-nonleaf');
        value_of(child.getClass()).should_be('custom-fold');
        value_of(child.getBase().offsetWidth > 0).should_be_true();
        value_of(child.getFirst().getBase().offsetWidth).should_be(0);
    },

    '鼠标操作': function () {
        var ctrl = ecui.get('tree');

        value_of(ctrl.getClass()).should_be('custom-nonleaf');
        uiut.MockEvents.mousedown(ctrl.getBase());
        uiut.MockEvents.mouseup(ctrl.getBase());
        value_of(ctrl.getClass()).should_be('custom-fold');
        uiut.MockEvents.mousedown(ctrl.getBase());
        uiut.MockEvents.mouseup(ctrl.getBase());
        value_of(ctrl.getClass()).should_be('custom-nonleaf');
    }
});
