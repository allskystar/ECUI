function before() {
    var el = document.createElement('div');
    el.innerHTML = '<div id="parent"><div id="child">'
                + '<div id="inner" style="width:400px;height:400px;font-size:1px"></div>'
                + '</div></div>';
    el.id = 'common';
    document.body.appendChild(el);
    ecui.create('control', {id: 'common', element: el});
    ecui.create('control', {id: 'parent', element: el.firstChild});
    ecui.create('control', {id: 'child', element: el.firstChild.firstChild});
}

function after() {
    ecui.dispose(ecui.get('common'));
    document.body.removeChild(document.getElementById('common'));
    value_of(!ecui.query().length).should_be_true();
}

test('$bind', {
    '绑定DOM对象与ECUI控件对象': function () {
        var el = document.createElement('div'),
            common = ecui.get('common');
        value_of(el.getControl).should_be(void(0));
        ecui.$bind(el, common);
        value_of(el.getControl()).should_be(common);
    },

    '同一个DOM多次绑定ECUI控件': function () {
        var el = document.createElement('div'),
            common = ecui.get('common'),
            control = ecui.create('Control');
        ecui.$bind(el, common);
        value_of(el.getControl()).should_be(common);
        ecui.$bind(el, control);
        value_of(el.getControl()).should_be(common);
        ecui.dispose(control);
    }
});

test('$clearState', {
    '控件自身存在状态': function () {
        var parent = ecui.get('parent'),
            common = ecui.get('common'),
            el = parent.getBase();
        uiut.MockEvents.mouseover(el);
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        ecui.$clearState(parent);
        value_of(ecui.getOvered()).should_be(common);
        value_of(ecui.getFocused()).should_be(common);
    },

    '控件的子控件存在状态': function () {
        var parent = ecui.get('parent'),
            child = ecui.get('child'),
            common = ecui.get('common'),
            el = child.getBase();
        uiut.MockEvents.mouseover(el);
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        ecui.$clearState(parent);
        value_of(ecui.getOvered()).should_be(common);
        value_of(ecui.getFocused()).should_be(common);
    },

    '存在状态的控件不是控件的子控件': function () {
        var parent = ecui.get('parent'),
            child = ecui.get('child'),
            common = ecui.get('common'),
            control = ecui.create('control', {parent: common}),
            el = child.getBase();
        uiut.MockEvents.mouseover(el);
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        ecui.$clearState(control);
        value_of(ecui.getOvered()).should_be(child);
        value_of(ecui.getFocused()).should_be(child);
        ecui.dispose(control);
    },

    '在mousedown中清除状态': function () {
        var parent = ecui.get('parent'),
            el = parent.getBase(),
            clicked = false;

        parent.onclick = function () {
            clicked = true;
        };

        uiut.MockEvents.mouseover(el);
        uiut.MockEvents.mousedown(el);
        ecui.$clearState(parent);
        uiut.MockEvents.mouseup(el);
        value_of(clicked).should_be(false);
        value_of(ecui.getActived()).should_be(null);
    }
});

test('$connect', {
    '控件连接已经生成的控件': function () {
        var caller, connected,
            control = ecui.create('Control');
        function test(target) {
            caller = this;
            connected = target;
        }
        ecui.$connect(control, test, 'common');
        value_of(caller).should_be(control);
        value_of(connected).should_be(ecui.get('common'));
        ecui.dispose(control);
    },

    '控件滞后连接生成的控件': function () {
        var caller, connected,
            common = ecui.get('common');
        function test(target) {
            caller = this;
            connected = target;
        }
        ecui.$connect(common, test, 'control');
        value_of(caller).should_be(void(0));
        value_of(connected).should_be(void(0));
        var control = ecui.create('Control', {id: 'control'});
        value_of(caller).should_be(common);
        value_of(connected).should_be(control);
        ecui.dispose(control);
    }
});

test('create', {
    '不设置参数': function () {
        var control = ecui.create('Control');
        value_of(control.getType()).should_be('ec-control');
        value_of(control.getBaseClass()).should_be('ec-control');
        ecui.dispose(control);
    },

    '设置全部参数': function () {
        var el = document.createElement('div'),
            common = ecui.get('common'),
            control = ecui.create(
                'Control',
                {id:'create', 'base': 'custom', 'element': el, 'parent': common, 'type': 'customType'}
            );

        value_of(control).should_be(ecui.get('create'));
        value_of(control.getType()).should_be('customType');
        value_of(control.getBaseClass()).should_be('custom');
        value_of(control.getBase()).should_be(el);
        value_of(control.getParent()).should_be(common);
        ecui.dispose(control);
    },

    '基于指定的DOM节点，自动设置样式与查找父节点': function () {
        var el = document.getElementById('inner');
        el.innerHTML = '<div class="first"></div>';
        el = el.firstChild;

        var control = ecui.create('Control', {'element': el});
        value_of(control.getType()).should_be('ec-control');
        value_of(control.getBaseClass()).should_be('first');
        value_of(control.getParent()).should_be(ecui.get('child'));
        ecui.dispose(control);
    }
});

test('dispose', {
    '删除并释放控件': function () {
        var length = ecui.query().length;

        ecui.dispose(ecui.get('parent'));
        value_of(ecui.get('parent')).should_be(null);
        value_of(ecui.get('child')).should_be(null);
        value_of(document.getElementById('parent').getControl).should_be(void(0));
        value_of(document.getElementById('child').getControl).should_be(void(0));
        value_of(ecui.query().length + 2).should_be(length);
    },

    '删除并释放DOM节点下的控件': function () {
        var length = ecui.query().length;

        ecui.dispose(ecui.get('parent').getOuter());
        value_of(ecui.get('parent')).should_be(null);
        value_of(ecui.get('child')).should_be(null);
        value_of(document.getElementById('parent').getControl).should_be(void(0));
        value_of(document.getElementById('child').getControl).should_be(void(0));
        value_of(ecui.query().length + 2).should_be(length);
    },

    '删除并释放DOM节点下的控件且控件包含状态': function () {
        var length = ecui.query().length,
            common = ecui.get('common'),
            child = ecui.get('child'),
            el = child.getBase();

        uiut.MockEvents.mouseover(el);
        uiut.MockEvents.mousedown(el);
        ecui.dispose(ecui.get('parent').getOuter());
        value_of(ecui.getActived()).should_be(common);
        value_of(ecui.getOvered()).should_be(common);
        value_of(ecui.getFocused()).should_be(common);
        value_of(ecui.query().length + 2).should_be(length);
        uiut.MockEvents.mouseup(common.getBase());
    }
});

test('drag', {
    '拖拽事件触发顺序': function () {
        var common = ecui.get('common'),
            el = common.getBase();

        var result = [];
        common.ondragstart = function () {
            result.push('ondragstart');
        };
        common.ondragmove = function () {
            result.push('ondragmove');
        };
        common.ondragend = function () {
            result.push('ondragend');
        };
        common.onmousedown = function (event) {
            ecui.drag(this, event);
        };

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mousemove(el, {'clientX': 10, 'clientY': -10});
        uiut.MockEvents.mousemove(el, {'clientX': 20, 'clientY': -20});
        uiut.MockEvents.mouseup(el);
        uiut.MockEvents.mousemove(el, {'clientX': 10, 'clientY': -10});
        value_of(result).should_be(['ondragstart', 'ondragmove', 'ondragmove', 'ondragend']);
    },

    '拖拽范围设置': function () {
        var common = ecui.get('common'),
            el = common.getBase();

        el.style.position = 'absolute';
        el.style.overflow = 'hidden';
        common.setPosition(100, 100);
        common.setSize(10, 10);

        common.onmousedown = function (event) {
            ecui.drag(this, event, {'top': 100, 'left': 100, 'bottom': 200, 'right': 200});
        };

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mousemove(el, {'clientX': -10, 'clientY': -10});
        value_of(common.getX()).should_be(100);
        value_of(common.getY()).should_be(100);
        uiut.MockEvents.mousemove(el, {'clientX': 50, 'clientY': 50});
        value_of(common.getX()).should_be(150);
        value_of(common.getY()).should_be(150);
        uiut.MockEvents.mousemove(el, {'clientX': 90, 'clientY': 90});
        value_of(common.getX()).should_be(190);
        value_of(common.getY()).should_be(190);
        uiut.MockEvents.mousemove(el, {'clientX': 91, 'clientY': 91});
        value_of(common.getX()).should_be(190);
        value_of(common.getY()).should_be(190);
        uiut.MockEvents.mouseup(el);
    },

    '拖拽范围默认设置': function () {
        var common = ecui.get('common'),
            control = ecui.create('Control', {parent: common}),
            el = control.getBase();

        common.getBase().style.cssText = 'position:absolute;overflow:hidden';
        common.setPosition(0, 0);
        common.setSize(400, 400);
        control.getOuter().style.position = 'absolute';
        control.setPosition(0, 0);
        control.setSize(10, 10);
        control.onmousedown = function (event) {
            ecui.drag(this, event);
        };

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mousemove(el, {'clientX': -1, 'clientY': -1});
        value_of(control.getX()).should_be(0);
        value_of(control.getY()).should_be(0);
        uiut.MockEvents.mousemove(el, {'clientX': 50, 'clientY': 50});
        value_of(control.getX()).should_be(50);
        value_of(control.getY()).should_be(50);
        uiut.MockEvents.mousemove(el, {'clientX': 390, 'clientY': 390});
        value_of(control.getX()).should_be(390);
        value_of(control.getY()).should_be(390);
        uiut.MockEvents.mousemove(el, {'clientX': 391, 'clientY': 391});
        value_of(control.getX()).should_be(390);
        value_of(control.getY()).should_be(390);
        uiut.MockEvents.mouseup(el);
    }
});

test('特殊操作测试', {
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

test('dispose', {
    '删除并释放控件(dispose/init)': function () {
        var el = document.getElementById('inner');
        el.innerHTML =
            '<div id="newParent" ecui="type:control;id:newParent">'
            + '<div id="newChild" ecui="type:control;id:newChild"></div></div>';
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

test('控件绑定与连接测试', {
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
