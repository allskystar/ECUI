describe('标签控件初始化测试', {
    '已生成for对应控件': function () {
        var el = document.createElement('div');
        el.innerHTML = '<div ecui="type:control;id:target"></div><div ecui="type:label;for:target;id:label"></div>';
        ecui.init(el);

        var result = [];
        ecui.get('target').onclick = function () {
            result.push('target');
        };

        ecui.get('label').click();
        value_of(result).should_be(['target']);

        ecui.dispose(el);
    },

    '滞后生成for对应控件': function () {
        var el = document.createElement('div');
        el.innerHTML = '<div ecui="type:label;for:target;id:label"></div><div ecui="type:control;id:target"></div>';
        ecui.init(el);

        var result = [];
        ecui.get('target').onclick = function () {
            result.push('target');
        };

        ecui.get('label').click();
        value_of(result).should_be(['target']);

        ecui.dispose(el);
    }
});

describe('事件转发测试', {
    '点击事件转发($click)': function () {
        var target = ecui.create('Control', {id: 'target', parent: document.body}),
            label = ecui.create('Label', {'for': 'target', parent: document.body}),
            el = label.getBase(),
            result = [];

        label.setSize(10, 10);

        label.onclick = function () {
            result.push('label_onclick');
        };
        target.onclick = function () {
            result.push('target_onclick');
        };

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);

        value_of(result).should_be(['label_onclick', 'target_onclick']);

        label.onclick = function () {
            result.push('label_onclick');
            return false;
        };
        target.onclick = function () {
            result.push('target_onclick');
        };

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);

        value_of(result).should_be(['label_onclick', 'target_onclick', 'label_onclick']);
    }
});
