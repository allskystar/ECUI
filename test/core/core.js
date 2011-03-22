function before() {
    var el = document.createElement('div');
    el.innerHTML = '<div id="inner"></div>';
    el.id = 'common';
    el.style.cssText = 'width:400px;height:400px;font-size:1px';
    document.body.appendChild(el);
    ecui.create('control', {id: 'common', element: el});
}

function after() {
    ecui.setFocused();
    ecui.dispose(ecui.get('common'));
    document.body.removeChild(document.getElementById('common'));
    var result = ecui.query({type: ecui.ui.Control});
    value_of(!result.len || (result.len == 1 && result[0].getBase() == 'ec-selector')).should_be_true();
}

test('控件绑定与连接测试', {
    '绑定DOM对象与ECUI控件对象($bind)': function () {
        var el = document.createElement('div'),
            ctrl = ecui.get('common');
        value_of(el.getControl).should_be(void(0));
        ecui.$bind(el, ctrl);
        value_of(el.getControl()).should_be(ctrl);
    },

    '同一个DOM多次绑定ECUI控件($bind)': function () {
        var el = document.createElement('div'),
            ctrl = ecui.get('common'),
            newCtrl = ecui.create('Control');
        ecui.$bind(el, ctrl);
        value_of(el.getControl()).should_be(ctrl);
        ecui.$bind(el, newCtrl);
        value_of(el.getControl()).should_be(ctrl);
        ecui.dispose(newCtrl);
    },

    '控件连接已经生成的控件($connect)': function () {
        var caller, connected,
            newCtrl = ecui.create('Control');
        function test(target) {
            caller = this;
            connected = target;
        }
        ecui.$connect(newCtrl, test, 'common');
        value_of(caller).should_be(newCtrl);
        value_of(connected).should_be(ecui.get('common'));
        ecui.dispose(newCtrl);
    },

    '控件滞后连接生成的控件($connect)': function () {
        var caller, connected,
            common = ecui.get('common');
        function test(target) {
            caller = this;
            connected = target;
        }
        ecui.$connect(common, test, 'connect');
        value_of(caller).should_be(void(0));
        value_of(connected).should_be(void(0));
        var newCtrl = ecui.create('Control', {id: 'connect'});
        value_of(caller).should_be(common);
        value_of(connected).should_be(newCtrl);
        ecui.dispose(newCtrl);
    },

    '在绑定控件的DOM节点向上查找控件(findControl)': function () {
        var el = document.getElementById('common');
        value_of(ecui.findControl(el)).should_be(ecui.get('common'));
    },

    '在控件内部的DOM节点向上查找控件(findControl)': function () {
        var el = document.getElementById('inner');
        value_of(ecui.findControl(el)).should_be(ecui.get('common'));
    },

    '在控件外部的DOM节点向上查找控件(findControl)': function () {
        var el = document.createElement('div');
        document.body.appendChild(el);
        value_of(ecui.findControl(el)).should_be(null);
    },

    '根据控件ID或者DOM对象获取控件(get/getControl)': function () {
        var ctrl = ecui.get('ctrl');
        value_of(ctrl).should_be(null);
        ctrl = ecui.get('common');
        value_of(ctrl.getBase().getAttribute('id')).should_be('common');
        value_of(document.getElementById('common').getControl()).should_be(ctrl);
    }
});

test('公共函数测试',{
    '盒子模型修正计算(calcHeightRevise/calcLeftRevise/calcTopRevise/calcWidthRevise)': function () {
        var el = document.getElementById('inner');
        el.style.cssText = 'position:relative;padding:5px;margin:5px;border:1px solid';
        el.innerHTML = '<div style="position:absolute;left:1px;top:1px"></div>';
        var style = ecui.dom.getStyle(el);
        value_of(ecui.calcHeightRevise(style)).should_be(ecui.isFixedSize() ? 12 : 0);
        value_of(ecui.calcWidthRevise(style)).should_be(ecui.isFixedSize() ? 12 : 0);

        el = el.firstChild;
        value_of(ecui.calcLeftRevise(el)).should_be(baidu.browser.opera ? 1 : 0);
        value_of(ecui.calcTopRevise(el)).should_be(baidu.browser.opera ? 1 : 0);
    },

    '读取过一次属性的不能再读到属性(getParameters)': function () {
        value_of(ecui.getParameters(document.getElementById('common'))).should_be({});
    },

    '第一次读取属性(getParameters)': function () {
        var el = document.getElementById('common');
        el.setAttribute('ecui', 'number:1.5;  true  ;false:  false  ;');
        value_of(ecui.getParameters(el)).should_be({number: 1.5, 'true': true, 'false': false});
        value_of(el.getAttribute('ecui')).should_be(null);
    },

    '是否需要修正盒子模型(isFixedSize)': function () {
        value_of(ecui.isFixedSize()).should_be(!(baidu.browser.ie && baidu.browser.ie < 8 && !baidu.browser.isStrict));
    }
});

test('控件创建与销毁测试', {
    '不设置参数创建控件(create)': function () {
        var ctrl = ecui.create('Control');
        value_of(ctrl.getType()).should_be('ec-control');
        value_of(ctrl.getBaseClass()).should_be('ec-control');
        ecui.dispose(ctrl);
    },

    '设置全部参数创建控件(create)': function () {
        var el = document.createElement('div'),
            common = ecui.get('common'),
            ctrl = ecui.create(
                'Control',
                {'id': 'create', 'base': 'custom', 'element': el, 'parent': common, 'type': 'customType'}
            );
        value_of(ctrl).should_be(ecui.get('create'));
        value_of(ctrl.getType()).should_be('customType');
        value_of(ctrl.getBaseClass()).should_be('custom');
        value_of(ctrl.getBase()).should_be(el);
        value_of(ctrl.getParent()).should_be(common);
        ecui.dispose(ctrl);
    },

    '基于指定的DOM节点创建控件(create)': function () {
        var el = document.getElementById('inner'),
            common = ecui.get('common');
        el.innerHTML = '<div class="create"></div>';
        el = el.firstChild;
        var ctrl = ecui.create('Control', {'id': 'create', 'element': el});
        value_of(ctrl.getType()).should_be('ec-control');
        value_of(ctrl.getBaseClass()).should_be('create');
        value_of(ctrl.getParent()).should_be(common);
        ecui.dispose(ctrl);
    },

    '删除并释放控件(dispose/init)': function () {
        var el = document.getElementById('inner');
        el.innerHTML =
            '<div id="parent" ecui="type:control;id:parent">'
            + '<div id="child" ecui="type:control;id:child"></div></div>';
        ecui.init(el);

        var parent = ecui.get('parent'),
            child = ecui.get('child');

        value_of(parent).should_not_be(null);
        value_of(child).should_not_be(null);
        value_of(child.getParent()).should_be(parent);
        value_of(ecui.query({type: ecui.ui.Control}).length).should_be(3);

        ecui.dispose(parent);
        value_of(ecui.get('parent')).should_be(null);
        value_of(ecui.get('child')).should_be(null);
        value_of(document.getElementById('parent').getControl).should_be(void(0));
        value_of(document.getElementById('child').getControl).should_be(void(0));
        value_of(ecui.query({type: ecui.ui.Control}).length).should_be(1);
    },

    '删除并释放DOM节点下的控件(dispose/init)': function () {
        var el = document.getElementById('inner');
        el.innerHTML =
            '<div id="parent" ecui="type:control;id:parent">'
            + '<div id="child" ecui="type:control;id:child"></div></div>';
        ecui.init(el);

        var parent = ecui.get('parent'),
            child = ecui.get('child');

        value_of(parent).should_not_be(null);
        value_of(child).should_not_be(null);
        value_of(child.getParent()).should_be(parent);
        value_of(ecui.query({type: ecui.ui.Control}).length).should_be(3);

        ecui.dispose(document.getElementById('parent'));
        value_of(ecui.get('parent')).should_be(null);
        value_of(ecui.get('child')).should_be(null);
        value_of(document.getElementById('parent').getControl).should_be(void(0));
        value_of(document.getElementById('child').getControl).should_be(void(0));
        value_of(ecui.query({type: ecui.ui.Control}).length).should_be(1);
    }
});

test('特殊操作测试', {
    '拖拽事件触发顺序(drag)': function () {
        var ctrl = ecui.get('common'),
            el = ctrl.getBase();

        var result = [];
        ctrl.ondragstart = function () {
            result.push('ondragstart');
        };
        ctrl.ondragmove = function () {
            result.push('ondragmove');
        };
        ctrl.ondragend = function () {
            result.push('ondragend');
        };
        ctrl.onmousedown = function (event) {
            ecui.drag(this, event);
        };

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mousemove(el, {'clientX': 10, 'clientY': -10});
        uiut.MockEvents.mousemove(el, {'clientX': 20, 'clientY': -20});
        uiut.MockEvents.mouseup(el);
        uiut.MockEvents.mousemove(el, {'clientX': 10, 'clientY': -10});
        value_of(result).should_be(['ondragstart', 'ondragmove', 'ondragmove', 'ondragend']);
    },

    '拖拽范围设置(drag)': function () {
        var ctrl = ecui.get('common'),
            el = ctrl.getBase();

        el.style.position = 'absolute';
        ctrl.setPosition(100, 100);
        ctrl.setSize(10, 10);

        ctrl.onmousedown = function (event) {
            ecui.drag(this, event, {'top': 100, 'left': 100, 'bottom': 200, 'right': 200});
        };

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mousemove(el, {'clientX': -10, 'clientY': -10});
        value_of(ctrl.getX()).should_be(100);
        value_of(ctrl.getY()).should_be(100);
        uiut.MockEvents.mousemove(el, {'clientX': 50, 'clientY': 50});
        value_of(ctrl.getX()).should_be(150);
        value_of(ctrl.getY()).should_be(150);
        uiut.MockEvents.mousemove(el, {'clientX': 90, 'clientY': 90});
        value_of(ctrl.getX()).should_be(190);
        value_of(ctrl.getY()).should_be(190);
        uiut.MockEvents.mousemove(el, {'clientX': 91, 'clientY': 91});
        value_of(ctrl.getX()).should_be(190);
        value_of(ctrl.getY()).should_be(190);
        uiut.MockEvents.mouseup(el);
    },

    '拖拽范围默认设置(drag)': function () {
        var common = ecui.get('common'),
            ctrl = ecui.create('Control', {parent: common}),
            el = ctrl.getBase();

        common.getBase().style.position = 'relative';
        el.style.cssText = 'position:absolute;left:0px;top:0px;width:10px;height:10px';
        ctrl.clearCache();
        ctrl.onmousedown = function (event) {
            ecui.drag(this, event);
        };

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mousemove(el, {'clientX': -1, 'clientY': -1});
        value_of(ctrl.getX()).should_be(0);
        value_of(ctrl.getY()).should_be(0);
        uiut.MockEvents.mousemove(el, {'clientX': 50, 'clientY': 50});
        value_of(ctrl.getX()).should_be(50);
        value_of(ctrl.getY()).should_be(50);
        uiut.MockEvents.mousemove(el, {'clientX': 390, 'clientY': 390});
        value_of(ctrl.getX()).should_be(390);
        value_of(ctrl.getY()).should_be(390);
        uiut.MockEvents.mousemove(el, {'clientX': 391, 'clientY': 391});
        value_of(ctrl.getX()).should_be(390);
        value_of(ctrl.getY()).should_be(390);
        uiut.MockEvents.mouseup(el);
    },

    '强制点击拦截(intercept)': function () {
        var result = [],
            common = ecui.get('common'),
            ctrl = ecui.create('Control');
        ctrl.setParent(document.body);

        common.onclick = function () {
            result.push('common');
        };
        ctrl.$intercept = function () {
            result.push('ctrl');
        };

        uiut.MockEvents.mousedown(common.getBase());
        uiut.MockEvents.mouseup(common.getBase());
        ecui.intercept(ctrl);
        uiut.MockEvents.mousedown(common.getBase());
        uiut.MockEvents.mouseup(common.getBase());
        value_of(ecui.getFocused()).should_be(common);
        value_of(result).should_be(['common', 'ctrl']);

        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '选择事件触发顺序(select)': function () {
        var ctrl = ecui.get('common'),
            el = ctrl.getBase(),
            result = [];

        ctrl.onselectstart = function () {
            result.push('start');
        };
        ctrl.onselect = function () {
            result.push('selecting');
        };
        ctrl.onselectend = function () {
            result.push('end');
        };
        ctrl.onmousedown = function (event) {
            ecui.select(this, event);
        };
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mousemove(el, {'clientX': 10, 'clientY': 10});
        uiut.MockEvents.mousemove(el, {'clientX': 10, 'clientY': 10});
        uiut.MockEvents.mouseup(el);
        uiut.MockEvents.mousemove(el, {'clientX': 10, 'clientY': 10});
        value_of(result).should_be(['start', 'selecting', 'selecting', 'end']);
    },

    '缩放事件触发顺序(zoom)': function () {
        var ctrl = ecui.get('common'),
            el = ctrl.getBase(),
            result = [];

        ctrl.setSize(10, 10);
        ctrl.onzoomstart = function () {
            result.push('start');
        };
        ctrl.onzoom = function () {
            result.push('zooming');
        };
        ctrl.onzoomend = function () {
            result.push('end');
        };
        ctrl.onmousedown = function (event) {
            ecui.zoom(this, event);
        }

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mousemove(el, {'clientX': 10, 'clientY': 10});
        uiut.MockEvents.mousemove(el, {'clientX': 20, 'clientY': 20});
        uiut.MockEvents.mouseup(el);
        uiut.MockEvents.mousemove(el, {'clientX': 10, 'clientY': 10});
        value_of(result).should_be(['start', 'zooming', 'zooming', 'end']);
    },

    '正向缩放(zoom)': function () {
        var ctrl = ecui.get('common'),
            el = ctrl.getBase();
        ctrl.setSize(10, 10);
        ctrl.setPosition(0, 0);
        ctrl.onmousedown = function (event) {
            ecui.zoom(this, event);
        };
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mousemove(el, {'clientX': 50, 'clientY': 50});
        uiut.MockEvents.mouseup(el);
        value_of(ctrl.getHeight()).should_be(60);
        value_of(ctrl.getWidth()).should_be(60);
    },

    '反向缩放(zoom)': function () {
        var ctrl = ecui.get('common'),
            el = ctrl.getBase();
        ctrl.setSize(10, 10);
        ctrl.setPosition(0, 0);
        ctrl.onmousedown = function (event) {
            ecui.zoom(this, event);
        };
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mousemove(el, {'clientX': -15, 'clientY': -15});
        uiut.MockEvents.mouseup(el);
        value_of(ctrl.getHeight()).should_be(5);
        value_of(ctrl.getWidth()).should_be(5);
    },

    '缩放范围限制(zoom)': function () {
        var ctrl = ecui.get('common'),
            el = ctrl.getBase();
        ctrl.setSize(10, 10);
        ctrl.setPosition(0, 0);
        ctrl.onmousedown = function (event) {
            ecui.zoom(this, event, {'minWidth': 5, 'minHeight': 5, 'maxWidth': 20, 'maxHeight': 20});
        };
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mousemove(el, {'clientX': 10, 'clientY': 10});
        value_of(ctrl.getHeight()).should_be(20);
        value_of(ctrl.getWidth()).should_be(20);

        uiut.MockEvents.mousemove(el, {'clientX': 15, 'clientY': 15});
        value_of(ctrl.getHeight()).should_be(20);
        value_of(ctrl.getWidth()).should_be(20);

        uiut.MockEvents.mousemove(el, {'clientX': 9,'clientY': 9});
        value_of(ctrl.getHeight()).should_be(19);
        value_of(ctrl.getWidth()).should_be(19);

        uiut.MockEvents.mousemove(el, {'clientX': -10,'clientY': -10});
        value_of(ctrl.getHeight()).should_be(5);
        value_of(ctrl.getWidth()).should_be(5);
        uiut.MockEvents.mouseup(el);
    }
});

test('getFocused 测试', {
    '测试': function () {
        var common = ecui.get('common'),
            ctrl = ecui.create('Control'),
            el = ctrl.getBase();

        ctrl.setParent(document.body);

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(ecui.getFocused()).should_be(ctrl);

        el = common.getBase();
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(ecui.getFocused()).should_be(common);

        uiut.MockEvents.mousedown(document.body);
        uiut.MockEvents.mouseup(document.body);
        value_of(ecui.getFocused()).should_be(null);

        ctrl.setParent();
        ecui.dispose(ctrl);
    }
});

test('getKey 测试', {
    '测试': function () {
        uiut.MockEvents.keydown(document, 32);
        uiut.MockEvents.keypress(document, 32);
        value_of(ecui.getKey()).should_be(32);
        uiut.MockEvents.keyup(document, 32);
        uiut.MockEvents.keydown(document, 18);
        // 特殊字符在keypress事件中被设置为0
        uiut.MockEvents.keypress(document, 0);
        value_of(ecui.getKey()).should_be(18);
        uiut.MockEvents.keyup(document, 18);
    }
});

test('getMouseX/getMouseY 测试', {
    '相对于页面': function () {
        uiut.MockEvents.mousemove(document.body, {'clientX': 100, 'clientY': 100});
        value_of(ecui.getMouseX()).should_be(100);
        value_of(ecui.getMouseY()).should_be(100);
    },

    '相对于控件(无边框)': function () {
        var ctrl = ecui.get('common');
        ctrl.getBase().style.position = 'absolute';
        ctrl.setSize(20, 20);
        ctrl.setPosition(10, 10);
        uiut.MockEvents.mousemove(document.body, {'clientX': 20, 'clientY': 20});
        value_of(ecui.getMouseX(ctrl)).should_be(10);
        value_of(ecui.getMouseY(ctrl)).should_be(10);
    },

    '相对控件(有1px边框)': function () {
        var ctrl = ecui.get('common');
        ctrl.getBase().style.cssText = 'position:absolute;border:1px solid';
        ctrl.setSize(20, 20);
        ctrl.setPosition(10, 10);
        uiut.MockEvents.mousemove(document.body, {'clientX': 20, 'clientY': 20});
        value_of(ecui.getMouseX(ctrl)).should_be(9);
        value_of(ecui.getMouseY(ctrl)).should_be(9);
    }
});

test('getPressed 测试', {
    '测试': function () {
        var ctrl = ecui.get('common');
        value_of(ecui.getPressed()).should_be(null);
        uiut.MockEvents.mousedown(ctrl.getBase());
        value_of(ecui.getPressed()).should_be(ctrl);
        uiut.MockEvents.mousemove(document, {'clientX': 100, 'clientY': 100});
        value_of(ecui.getPressed()).should_be(ctrl);
        uiut.MockEvents.mouseup(document.body);
        value_of(ecui.getPressed()).should_be(null); 
    }
});

test('loseFocus 测试', {
    '单独控件测试': function () {
        var ctrl = ecui.get('common');
        var blur = 0;
        ctrl.onblur = function () {
            blur = 1;
        };
        ecui.setFocused(ctrl);
        ecui.loseFocus(ctrl);
        value_of(blur).should_be(1);
        value_of(ecui.getFocused()).should_be(null);
    },

    '控件多层级测试': function () {
        var common = ecui.get('common'),
            ctrl = ecui.create('Control'),
            result = [];
        ctrl.setParent(common);

        common.onfocus = function () {
            result.push('common-focus');
        };
        common.onblur = function () {
            result.push('common-blur');
        };
        ctrl.onfocus = function () {
            result.push('ctrl-focus');
        };
        ctrl.onblur = function () {
            result.push('ctrl-blur');
        };

        ecui.setFocused(ctrl);
        ecui.loseFocus(ctrl);
        value_of(ecui.getFocused()).should_be(common);
        value_of(result).should_be(['ctrl-focus', 'common-focus', 'ctrl-blur']);
    }
});

test('query 测试', {
    '按控件类型查找': function () {
        var select = ecui.create('Select'),
            checkbox = ecui.create('Checkbox');

        value_of(ecui.query({'type': ecui.ui.Select}).length).should_be(1);
        value_of(ecui.query({'type': ecui.ui.Checkbox}).length).should_be(1);

        ecui.dispose(select);
        ecui.dispose(checkbox);
    },

    '按父控件查找': function () {
        var common = ecui.get('common'),
            ctrl = ecui.create('Control', {parent: common});

        value_of(ecui.query({parent: common}).length).should_be(1);
        ecui.dispose(ctrl);
    },

    '自定义函数查找': function () {
        var el = document.createElement('div'),
            ctrl = ecui.create('Control', {element: el});
        el.id = 'query';

        var result = ecui.query({'custom': function(ctrl) {
            if (ctrl.getBase().id == 'query') {
                return true;
            }
            else {
                return false;
            }
        }});
        value_of(result.length).should_be(1);
        value_of(result[0]).should_be(ctrl);
        ecui.dispose(ctrl);
    }
});

test('setFocused 测试', {
    '单控件测试': function () {
        var focus = false;
        var ctrl = ecui.get('common');
        ctrl.onfocus = function () {
            focus = true;
        };
        ctrl.onblur = function () {
            focus = false;
        };
        value_of(focus).should_be_false();
        ecui.setFocused(ctrl);
        value_of(focus).should_be_true();
        ecui.setFocused();
        value_of(focus).should_be_false();
    },

    '控件多层级测试': function () {
        var result = [],
            common = ecui.get('common'),
            ctrl = ecui.create('Control', {parent: common});

        common.onfocus = function () {
            result.push('common-focus');
        };
        common.onblur = function () {
            result.push('common-blur');
        };
        ctrl.onfocus = function () {
            result.push('ctrl-focus');
        };
        ctrl.onblur = function () {
            result.push('ctrl-blur');
        };
        ecui.setFocused(common);
        ecui.setFocused(ctrl);
        ecui.setFocused();
        value_of(result).should_be(['common-focus', 'ctrl-focus', 'ctrl-blur', 'common-blur']);
    }
});
