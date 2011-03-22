describe('控件功能测试', {
    'before': function () {
        var el = document.createElement('div');
        el.innerHTML = '<div>1</div><div>2</div><div>3</div>';

        var ctrl = ecui.create('Collection', {id: 'collection', element: el, parent: document.body});
    },

    'after': function () {
        var ctrl = ecui.get('collection');
        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '子控件序号控制(getItem/getIndex)': function () {
        var ctrl = ecui.get('collection'),
            list = ecui.dom.children(ctrl.getBase());

        value_of(ctrl.getItem(1)).should_be(list[1].getControl());
        value_of(ctrl.getItem(1).getIndex()).should_be(1);
    },

    '事件处理': function () {
        var ctrl = ecui.get('collection'),
            list = ecui.dom.children(ctrl.getBase()),
            result = [];

        ctrl.onmousedown = function () {
            result.push(this);
        };

        uiut.MockEvents.mousedown(list[0]);
        uiut.MockEvents.mouseup(list[0]);

        uiut.MockEvents.mousedown(list[1]);
        uiut.MockEvents.mouseup(list[1]);

        uiut.MockEvents.mousedown(list[2]);
        uiut.MockEvents.mouseup(list[2]);

        value_of(result).should_be([list[0].getControl(), list[1].getControl(), list[2].getControl()]);
    }
});
