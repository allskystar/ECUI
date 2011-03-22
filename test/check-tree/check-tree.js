describe('复选框式树控件初始化测试', {
    '默认初始化': function () {
        var el = document.createElement('div');
        el.className = 'custom';
        el.innerHTML = '<label>Root</label><div ecui="superior:true">Node 1</div><div ecui="superior:true">'
            + '<label>Node 2</label><div ecui="superior:true">Node 2.1</div>'
            + '<div ecui="superior:true">Node 2.2</div><div ecui="superior:true">Node 2.3</div></div>';
        var ctrl = ecui.create('CheckTree', {element: el, parent: document.body}),
            node2 = ctrl.getLast();

        value_of(ctrl.getFirst().isChecked()).should_be_false();
        value_of(node2.isChecked()).should_be_false();
        value_of(node2.getFirst().$getSection('Checkbox').getSuperior()).should_be(node2.$getSection('Checkbox'));

        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '根节点设置checked选中子树': function () {
        var el = document.createElement('div');
        el.className = 'custom';
        el.innerHTML = '<label>Root</label><div>Node 1</div><div><label>Node 2</label><div>Node 2.1</div>'
            + '<div>Node 2.2</div><div>Node 2.3</div></div>';
        var ctrl = ecui.create(
            'CheckTree',
            {element: el, parent: document.body, checked: true, name: 'test', value: '1'}
        );

        value_of(ctrl.getFirst().isChecked()).should_be_true();
        value_of(ctrl.getLast().isChecked()).should_be_true();
        value_of(ctrl.getFirst().$getSection('Checkbox').getName()).should_be('test');
        value_of(ctrl.getFirst().$getSection('Checkbox').getValue()).should_be('1');

        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '部分子节点设置checked属性': function () {
        var el = document.createElement('div');
        el.className = 'custom';
        el.innerHTML = '<label>Root</label><div>Node 1</div><div ecui="checked:true;value:2"><label>Node 2</label>'
            + '<div>Node 2.1</div><div>Node 2.2</div><div>Node 2.3</div></div>';
        var ctrl = ecui.create('CheckTree', {element: el, parent: document.body, value: '1'});

        value_of(ctrl.getFirst().isChecked()).should_be_false();
        value_of(ctrl.getLast().isChecked()).should_be_true();
        value_of(ctrl.getFirst().$getSection('Checkbox').getValue()).should_be('1');
        value_of(ctrl.getLast().$getSection('Checkbox').getValue()).should_be('2');
        value_of(ctrl.getLast().getFirst().$getSection('Checkbox').getValue()).should_be('2');
        value_of(ctrl.getLast().getFirst().getNext().$getSection('Checkbox').getValue()).should_be('2');
        value_of(ctrl.getLast().getLast().$getSection('Checkbox').getValue()).should_be('2');

        ctrl.setParent();
        ecui.dispose(ctrl);
    }
});
