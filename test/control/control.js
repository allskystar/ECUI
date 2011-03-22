function before() {
    var el = document.createElement('div');
    el.id = 'common';
    el.className = 'common';
    el.style.cssText = 'width:400px;height:400px;font-size:1px';
    document.body.appendChild(el);
    ecui.create('Control', {id: 'common', element: el});
}

function after() {
    ecui.setFocused();
    ecui.dispose(ecui.get('common'));
    document.body.removeChild(document.getElementById('common'));
    var result = ecui.query({type: ecui.ui.Control});
    value_of(!result.len || (result.len == 1 && result[0].getBase() == 'ec-selector')).should_be_true();
}

describe('基础控件初始化测试', {
    '默认扩展参数': function () {
        var ctrl = ecui.create('Control');
        value_of(ctrl.isCapture()).should_be(true);
        value_of(ctrl.isFocusable()).should_be(true);
        value_of(ctrl.isEnabled()).should_be(true);
        ecui.dispose(ctrl);
    },

    '指定扩展参数': function () {
        var ctrl = ecui.create('Control', {capture: false, focus: false, enabled: false});
        value_of(ctrl.isCapture()).should_be(false);
        value_of(ctrl.isFocusable()).should_be(false);
        value_of(ctrl.isEnabled()).should_be(false);
        ecui.dispose(ctrl);
    }
});

test('alterClass 测试', {
    '添加样式' : function () {
        var ctrl = ecui.get('common'),
            el = ctrl.getBase();
        ctrl.onalterclassbefore = function () {
            value_of(baidu.dom.hasClass(el, 'ec-control')).should_be_true();
            value_of(baidu.dom.hasClass(el, 'common')).should_be_true();
            value_of(baidu.dom.hasClass(el, 'ec-control-test')).should_be_false();
            value_of(baidu.dom.hasClass(el, 'common-test')).should_be_false();
        };
        ctrl.onalterclassafter = function () {
            value_of(baidu.dom.hasClass(el, 'ec-control')).should_be_true();
            value_of(baidu.dom.hasClass(el, 'common')).should_be_true();
            value_of(baidu.dom.hasClass(el, 'ec-control-test')).should_be_true();
            value_of(baidu.dom.hasClass(el, 'common-test')).should_be_true();
        };
        ctrl.alterClass('test');
    },

    '删除样式' : function () {
        var ctrl = ecui.get('common'),
            el = ctrl.getBase();
        ctrl.alterClass('test');
        ctrl.onalterclassbefore = function () {
            value_of(baidu.dom.hasClass(el, 'ec-control')).should_be_true();
            value_of(baidu.dom.hasClass(el, 'common')).should_be_true();
            value_of(baidu.dom.hasClass(el, 'ec-control-test')).should_be_true();
            value_of(baidu.dom.hasClass(el, 'common-test')).should_be_true();
        };
        ctrl.onalterclassafter = function () {
            value_of(baidu.dom.hasClass(el, 'ec-control')).should_be_true();
            value_of(baidu.dom.hasClass(el, 'common')).should_be_true();
            value_of(baidu.dom.hasClass(el, 'ec-control-test')).should_be_false();
            value_of(baidu.dom.hasClass(el, 'common-test')).should_be_false();
        };
        ctrl.alterClass('test', true);
    }
});

test('cache/clearCache 测试', {
    '测试' : function () {
        var ctrl = ecui.get('common');
        ctrl.clearCache();
        ctrl.cache();
        var style = ctrl.getBase().style;
        var cssText = style.cssText;
        style.cssText = 'width:100px;height:100px;border:1px solid;padding:2px;overflow:hidden';

        value_of(ctrl.getWidth()).should_be(400);
        value_of(ctrl.getHeight()).should_be(400);
        value_of(ctrl.getInvalidWidth()).should_be(0);
        value_of(ctrl.getInvalidHeight()).should_be(0);

        ctrl.clearCache();
        value_of(ctrl.getWidth()).should_be(ecui.isFixedSize() ? 106 : 100);
        value_of(ctrl.getHeight()).should_be(ecui.isFixedSize() ? 106 : 100);
        value_of(ctrl.getInvalidWidth()).should_be(6);
        value_of(ctrl.getInvalidHeight()).should_be(6);

        style.cssText = cssText;
        ctrl.cache(false, true);
        value_of(ctrl.getWidth()).should_be(ecui.isFixedSize() ? 106 : 100);
        value_of(ctrl.getHeight()).should_be(ecui.isFixedSize() ? 106 : 100);
        value_of(ctrl.getInvalidWidth()).should_be(0);
        value_of(ctrl.getInvalidHeight()).should_be(0);
    }
});

test('contain 测试', {
    '控件包含自身' : function () {
        var ctrl = ecui.get('common');
        value_of(ctrl.contain(ctrl)).should_be_true();
    },

    '父控件包含子控件' : function () {
        var common = ecui.get('common'),
            ctrl = ecui.create('Control', {parent: common});
        value_of(common.contain(ctrl)).should_be_true();
    },

    '子控件不包含父控件' : function () {
        var common = ecui.get('common'),
            ctrl = ecui.create('Control', {parent: common});
        value_of(ctrl.contain(common)).should_be_false();
    }
});

test('getBase/getBody/getOuter 测试', {
    '获取控件Element对象' : function () {
        var ctrl = ecui.get('common'),
            el = document.getElementById('common'); 
        value_of(ctrl.getBase()).should_be(el);
        value_of(ctrl.getBody()).should_be(el);
        value_of(ctrl.getOuter()).should_be(el);
    },

    '获取控件Element对象(控件动态创建)' : function () {
        var el = document.createElement('div'),
            ctrl = ecui.create('Control', {element: el, parent: ecui.get('common')});
        value_of(ctrl.getBase()).should_be(el);
        value_of(ctrl.getBody()).should_be(el);
        value_of(ctrl.getOuter()).should_be(el);
    }
});

test('getBaseClass/getClass/getType/setClass 测试', {
    '获取控件的基本样式' : function () {
        var common = ecui.get('common'),
            ctrl = ecui.create('Control', {parent: common});
        value_of(common.getBaseClass()).should_be('common');
        value_of(ctrl.getBaseClass()).should_be('ec-control');
        value_of(common.getClass()).should_be('common');
        value_of(ctrl.getClass()).should_be('ec-control');
        value_of(common.getType()).should_be('ec-control');
        value_of(ctrl.getType()).should_be('ec-control');

        common.setClass('custom2');
        value_of(common.getBaseClass()).should_be('common');
        value_of(common.getClass()).should_be('custom2');
        value_of(common.getType()).should_be('ec-control');
    },

    '获取控件基本样式(alterClass 操作后)' : function () {
        var ctrl = ecui.get('common'),
            el = ctrl.getBase();
        ctrl.alterClass('test');
        ctrl.setClass('custom2');
        value_of(baidu.dom.hasClass(el, 'ec-control')).should_be_true();
        value_of(baidu.dom.hasClass(el, 'ec-control-test')).should_be_true();
        value_of(baidu.dom.hasClass(el, 'custom2')).should_be_true();
        value_of(baidu.dom.hasClass(el, 'custom2-test')).should_be_true();
        value_of(baidu.dom.hasClass(el, 'common')).should_be_false();
        value_of(baidu.dom.hasClass(el, 'common-test')).should_be_false();

        ctrl.alterClass('test', true);
        ctrl.setClass(ctrl.getBaseClass());
        value_of(baidu.dom.hasClass(el, 'ec-control')).should_be_true();
        value_of(baidu.dom.hasClass(el, 'ec-control-test')).should_be_false();
        value_of(baidu.dom.hasClass(el, 'custom2')).should_be_false();
        value_of(baidu.dom.hasClass(el, 'custom2-test')).should_be_false();
        value_of(baidu.dom.hasClass(el, 'common')).should_be_true();
        value_of(baidu.dom.hasClass(el, 'common-test')).should_be_false();
    }
});

test('getBodyHeight/getBodyWidth/getHeight/getInvalidHeight/getInvalidWidth/getWidth 测试', {
    '测试' : function () {
        var el = document.createElement('div');
        el.style.cssText = 'border:1px solid;padding:2px;height:100px;display:block';
        var ctrl = ecui.create('Control', {parent: ecui.get('common'), element: el});
        ctrl.clearCache();
        value_of(ctrl.getBodyHeight()).should_be(ecui.isFixedSize() ? 100 : 94);
        value_of(ctrl.getBodyWidth()).should_be(394);
        value_of(ctrl.getHeight()).should_be(ecui.isFixedSize() ? 106 : 100);
        value_of(ctrl.getInvalidHeight()).should_be(6);
        value_of(ctrl.getInvalidWidth()).should_be(6);
        value_of(ctrl.getWidth()).should_be(400);
    }
});

test('getParent/setParent', {
    '测试' : function () {
        var common = ecui.get('common'),
            parent = ecui.create('Control'),
            child = ecui.create('Control', {parent: parent});

        value_of(child.getParent()).should_be(parent);
        child.setParent(common.getBase());
        value_of(child.getParent()).should_be(common);
        child.setParent();
        value_of(child.getParent()).should_be(null);
        value_of(ecui.dom.getParent(child.getOuter())).should_be(null);
        child.setParent(parent);
        value_of(child.getParent()).should_be(parent);

        ecui.dispose(parent);
    }
});

test('getUID 测试', {
    '测试' : function () {
        var ids = {},
            controls = ecui.query({type: ecui.ui.Control});
        for (var i = controls.length; i--; ) {
            var uid = controls[i].getUID();
            value_of(ids[uid]).should_be(void(0));
            ids[uid] = true;
        }
    }
});

test('getX/getY/setPosition 测试', {
    '测试' : function () {
        var el = document.createElement('div');
        el.style.cssText = 'border:1px solid;padding:2px;height:100px;display:block';
        var ctrl = ecui.create('Control', {parent: ecui.get('common'), element: el});
        ctrl.setPosition(10, 20);
        value_of(ctrl.getX()).should_be(0);
        value_of(ctrl.getY()).should_be(0);
        el.style.position = 'absolute';
        value_of(ctrl.getX()).should_be(10);
        value_of(ctrl.getY()).should_be(20);
    }
});

test('hide/isShow/show 测试', {
    '测试' : function () {
        var ctrl = ecui.get('common'),
            el = ctrl.getBase(),
            result = [];
        ctrl.onshow = function () {
            result.push('show');
        };
        ctrl.onhide = function () {
            result.push('hide');
        };

        ctrl.hide();
        ctrl.hide();
        value_of(el.style.display).should_be('none');
        value_of(ctrl.isShow()).should_be_false();
        ctrl.show();
        ctrl.show();
        value_of(el.style.display).should_be('');
        value_of(ctrl.isShow()).should_be_true();

        el.style.display = 'block';
        ctrl.hide();
        value_of(el.style.display).should_be('none');
        ctrl.show();
        value_of(el.style.display).should_be('block');
        value_of(result).should_be(['hide', 'show', 'hide', 'show']);
    }
});

test('isCapture/setCapture 测试', {
    '测试' : function () {
        var common = ecui.get('common'),
            ctrl = ecui.create('Control', {parent: common}),
            el = ctrl.getBase();

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(ecui.getFocused()).should_be(ctrl);
        value_of(ctrl.isCapture()).should_be_true();
        ecui.setFocused();

        ctrl.setCapture(false);
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(ecui.getFocused()).should_be(common);
        value_of(ctrl.isCapture()).should_be_false();
        ecui.setFocused();
        ctrl.setCapture();
        value_of(ctrl.isCapture()).should_be_true();
    }
});

test('isEnabled/setEnabled 测试', {
    '测试' : function () {
        var common = ecui.get('common'),
            ctrl = ecui.create('Control', {parent: common}),
            el = ctrl.getBase();

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(ecui.getFocused()).should_be(ctrl);
        value_of(ctrl.isEnabled()).should_be_true();
        ecui.setFocused();

        ctrl.setEnabled(false);
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(ecui.getFocused()).should_be(null);
        value_of(ctrl.isEnabled()).should_be_false();
        ctrl.setEnabled();
        value_of(ctrl.isEnabled()).should_be_true();

        common.setEnabled(false);
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(ecui.getFocused()).should_be(null);
        value_of(common.isEnabled()).should_be_false();
    }
});

test('isFocusable/setFocusable 测试', {
    '测试' : function () {
        var common = ecui.get('common'),
            ctrl = ecui.create('Control', {parent: common}),
            el = ctrl.getBase();

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(ecui.getFocused()).should_be(ctrl);
        value_of(common.isFocusable()).should_be_true();
        ecui.setFocused();

        ctrl.setFocusable(false);
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(ecui.getFocused()).should_be(common);
        value_of(ctrl.isFocusable()).should_be_false();
        ctrl.setFocusable();
        value_of(ctrl.isFocusable()).should_be_true();
    }
});

test('setBodySize/setSize 测试', {
    '只设置宽度' : function () {
        var el = document.createElement('div');
        el.style.cssText = 'border:1px solid;padding:2px;height:100px;display:block';
        var ctrl = ecui.create('Control', {parent: ecui.get('common'), element: el}),
            width = ctrl.getWidth(),
            height = ctrl.getHeight();
        ctrl.setSize(100);
        ctrl.clearCache();
        value_of(ctrl.getWidth()).should_be(100);
        value_of(ctrl.getHeight()).should_be(height);

        ctrl.setBodySize(100);
        value_of(ctrl.getWidth()).should_be(106);
        value_of(ctrl.getHeight()).should_be(height);

        ctrl.setSize(width);
    },

    '只设置高度' : function () {
        var el = document.createElement('div');
        el.style.cssText = 'border:1px solid;padding:2px;height:100px;display:block';
        var ctrl = ecui.create('Control', {parent: ecui.get('common'), element: el}),
            width = ctrl.getWidth(),
            height = ctrl.getHeight();
        ctrl.setSize(null, 50);
        ctrl.clearCache();
        value_of(ctrl.getWidth()).should_be(width);
        value_of(ctrl.getHeight()).should_be(50);

        ctrl.setBodySize(null, 50);
        value_of(ctrl.getWidth()).should_be(width);
        value_of(ctrl.getHeight()).should_be(56);

        ctrl.setSize(null, height);
    },

    '同时设置宽度与高度' : function () {
        var el = document.createElement('div');
        el.style.cssText = 'border:1px solid;padding:2px;height:100px;display:block';
        var ctrl = ecui.create('Control', {parent: ecui.get('common'), element: el}),
            width = ctrl.getWidth(),
            height = ctrl.getHeight();
        ctrl.setSize(100, 50);
        ctrl.clearCache();
        value_of(ctrl.getWidth()).should_be(100);
        value_of(ctrl.getHeight()).should_be(50);

        ctrl.setBodySize(100, 50);
        value_of(ctrl.getWidth()).should_be(106);
        value_of(ctrl.getHeight()).should_be(56);

        ctrl.setSize(width, height);
    }
});
