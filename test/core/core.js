function before() {
    var el = document.createElement('div');
    el.innerHTML = '<div id="parent"><div id="child">'
                + '<div id="inner" style="width:400px;height:400px;font-size:1px"></div>'
                + '</div></div>';
    el.id = 'common';
    document.body.appendChild(el);
    ecui.create(ecui.ui.Control, {id: 'common', main: el});
    ecui.create(ecui.ui.Control, {id: 'parent', main: el.firstChild});
    ecui.create(ecui.ui.Control, {id: 'child', main: el.firstChild.firstChild});
}

function after() {
    ecui.dispose(ecui.get('common'));
    document.body.removeChild(baidu.dom.g('common'));
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
            control = ecui.create(ecui.ui.Control);
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
            el = parent.getMain();
        uiut.MockEvents.mouseover(el);
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        ecui.$clearState(parent);
        value_of(ecui.getHovered()).should_be(common);
        value_of(ecui.getFocused()).should_be(common);
    },

    '控件的子控件存在状态': function () {
        var parent = ecui.get('parent'),
            child = ecui.get('child'),
            common = ecui.get('common'),
            el = child.getMain();
        uiut.MockEvents.mouseover(el);
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        ecui.$clearState(parent);
        value_of(ecui.getHovered()).should_be(common);
        value_of(ecui.getFocused()).should_be(common);
    },

    '存在状态的控件不是控件的子控件': function () {
        var parent = ecui.get('parent'),
            child = ecui.get('child'),
            common = ecui.get('common'),
            control = ecui.create(ecui.ui.Control, {parent: common}),
            el = child.getMain();
        uiut.MockEvents.mouseover(el);
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        ecui.$clearState(control);
        value_of(ecui.getHovered()).should_be(child);
        value_of(ecui.getFocused()).should_be(child);
        ecui.dispose(control);
    },

    '在mousedown中清除状态': function () {
        var parent = ecui.get('parent'),
            el = parent.getMain(),
            clicked = false;

        parent.onclick = function () {
            clicked = true;
        };

        uiut.MockEvents.mouseover(el);
        uiut.MockEvents.mousedown(el);
        ecui.$clearState(parent);
        uiut.MockEvents.mouseup(el);
        value_of(clicked).should_be_false();
        value_of(ecui.getActived()).should_be(null);
    }
});

test('$connect', {
    '控件连接已经生成的控件': function () {
        var caller, connected,
            control = ecui.create(ecui.ui.Control);
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
        var control = ecui.create(ecui.ui.Control, {id: 'control'});
        value_of(caller).should_be(common);
        value_of(connected).should_be(control);
        ecui.dispose(control);
    }
});

test('create', {
    '不设置参数': function () {
        var control = ecui.create(ecui.ui.Control);
        value_of(control.getTypes()).should_be([]);
        value_of(control.getPrimary()).should_be('');
        ecui.dispose(control);
    },

    '设置全部参数': function () {
        var el = document.createElement('div'),
            common = ecui.get('common'),
            control = ecui.create(
                ecui.ui.Control,
                {id: 'create', primary: 'custom', main: el, parent: common}
            );

        value_of(control).should_be(ecui.get('create'));
        value_of(control.getPrimary()).should_be('custom');
        value_of(control.getMain()).should_be(el);
        value_of(control.getParent()).should_be(common);
        ecui.dispose(control);
    },

    '基于指定的DOM节点，自动设置样式与查找父节点': function () {
        var el = baidu.dom.g('inner');
        el.innerHTML = '<div class="first"></div>';
        el = el.firstChild;

        var control = ecui.create(ecui.ui.Control, {main: el});
        value_of(control.getTypes()).should_be([]);
        value_of(control.getPrimary()).should_be('first');
        value_of(control.getParent()).should_be(ecui.get('child'));
        ecui.dispose(control);
    },

    'oncreate事件触发': function () {
        var el = baidu.dom.g('inner'),
            result = [];
        el.innerHTML = '<div class="first"></div>';
        el = el.firstChild;

        ecui.ui.Control.prototype.oncreate = function () {
            result.push('create');
        };

        var control = ecui.create(ecui.ui.Control, {main: el});
        value_of(control.getTypes()).should_be([]);
        value_of(control.getPrimary()).should_be('first');
        value_of(control.getParent()).should_be(ecui.get('child'));
        value_of(result).should_be(['create']);
        ecui.dispose(control);

        delete ecui.ui.Control.prototype.oncreate;
    }
});

test('dispose', {
    '删除并释放控件': function () {
        var length = ecui.query().length;

        ecui.dispose(ecui.get('parent'));
        value_of(ecui.get('parent')).should_be(null);
        value_of(ecui.get('child')).should_be(null);
        value_of(baidu.dom.g('parent').getControl).should_be(void(0));
        value_of(baidu.dom.g('child').getControl).should_be(void(0));
        value_of(ecui.query().length + 2).should_be(length);
    },

    '删除并释放DOM节点下的控件': function () {
        var length = ecui.query().length;

        ecui.dispose(ecui.get('parent').getOuter());
        value_of(ecui.get('parent')).should_be(null);
        value_of(ecui.get('child')).should_be(null);
        value_of(baidu.dom.g('parent').getControl).should_be(void(0));
        value_of(baidu.dom.g('child').getControl).should_be(void(0));
        value_of(ecui.query().length + 2).should_be(length);
    },

    '删除并释放DOM节点下的控件且控件包含状态': function () {
        var length = ecui.query().length,
            common = ecui.get('common'),
            child = ecui.get('child'),
            el = child.getMain();

        uiut.MockEvents.mouseover(el);
        uiut.MockEvents.mousedown(el);
        ecui.dispose(ecui.get('parent').getOuter());
        value_of(ecui.getActived()).should_be(common);
        value_of(ecui.getHovered()).should_be(common);
        value_of(ecui.getFocused()).should_be(common);
        value_of(ecui.query().length + 2).should_be(length);
        uiut.MockEvents.mouseup(common.getMain());
    }
});

test('drag', {
    '拖拽事件触发顺序': function () {
        var common = ecui.get('common'),
            el = common.getMain();

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
            el = common.getMain();

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
            control = ecui.create(ecui.ui.Control, {parent: common}),
            el = control.getMain();

        common.getMain().style.cssText = 'position:absolute;overflow:hidden';
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

test('findControl', {
    '在控件当前元素上查找控件': function () {
        var el = baidu.dom.g('common');
        value_of(ecui.findControl(el)).should_be(ecui.get('common'));
    },

    '控件上级DOM元素存在控件': function () {
        var el = baidu.dom.g('inner');
        value_of(ecui.findControl(el)).should_be(ecui.get('child'));
    },

    '控件上级DOM元素不存在控件': function () {
        var el = baidu.dom.g('common');
        value_of(ecui.findControl(ecui.dom.getParent(el))).should_be(null);
    }
});

test('getMouseX/getMouseY', {
    '相对于页面': function () {
        uiut.MockEvents.mousemove(document.body, {'clientX': 100, 'clientY': 100});
        value_of(ecui.getMouseX()).should_be(100);
        value_of(ecui.getMouseY()).should_be(100);
    },

    '相对于控件(无边框)': function () {
        var common = ecui.get('common');
        common.getMain().style.position = 'absolute';
        common.setSize(20, 20);
        common.setPosition(10, 10);
        uiut.MockEvents.mousemove(document.body, {'clientX': 20, 'clientY': 20});
        value_of(ecui.getMouseX(common)).should_be(10);
        value_of(ecui.getMouseY(common)).should_be(10);
    },

    '相对控件(有1px边框)': function () {
        var common = ecui.get('common');
        common.getMain().style.cssText = 'position:absolute;border:1px solid';
        common.setSize(20, 20);
        common.setPosition(10, 10);
        uiut.MockEvents.mousemove(document.body, {'clientX': 20, 'clientY': 20});
        value_of(ecui.getMouseX(common)).should_be(9);
        value_of(ecui.getMouseY(common)).should_be(9);
    }
});

test('init', {
    '初始化html片段': function () {
        var length = ecui.query().length,
            el = baidu.dom.g('inner');
        
        el.innerHTML =
            '<div id="newParent" class="parent" ecui="type:control;id:newParent">'
            + '<div id="newChild" ecui="type:control;id:newChild"></div></div>';
        ecui.init(el);

        var parent = ecui.get('newParent'),
            child = ecui.get('newChild');

        value_of(child.getParent()).should_be(parent);
        value_of(ecui.query().length - 2).should_be(length);
        value_of(parent.getPrimary()).should_be('parent');
        value_of(parent.getTypes()).should_be([]);
    }
});

test('intercept', {
    '强制点击拦截': function () {
        var result = [],
            common = ecui.get('common'),
            el = common.getMain(),
            child = ecui.get('child');

        common.onclick = function () {
            result.push('common');
        };
        child.onintercept = function () {
            result.push('child');
        };

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        ecui.intercept(child);
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(ecui.getFocused()).should_be(common);
        value_of(result).should_be(['common', 'child', 'common']);
    },

    '强制点击拦截(不恢复强制点击拦截)': function () {
        var result = [],
            common = ecui.get('common'),
            el = ecui.get('parent').getMain();

        common.onintercept = function (event) {
            result.push('intercept');
            return false;
        };

        common.onclick = function (event) {
            result.push('click');
            return false;
        };

        ecui.intercept(common);
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(result).should_be(['intercept', 'click', 'intercept', 'click']);
        ecui.restore();
    },

    '强制点击拦截(手工处理环境的恢复)': function () {
        var result = [],
            common = ecui.get('common'),
            el = common.getMain(),
            child = ecui.get('child');

        common.onclick = function () {
            result.push('common');
        };
        child.onintercept = function (event) {
            result.push('child');
            ecui.restore();
            return false;
        };

        ecui.intercept(child);
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(result).should_be(['child', 'common']);
    }
});

test('loseFocus', {
    '控件处于焦点状态': function () {
        var parent = ecui.get('parent');

        var blur = false;
        parent.onblur = function () {
            blur = true;
        };

        ecui.setFocused(parent);
        ecui.loseFocus(parent);
        value_of(blur).should_be_true();
        value_of(ecui.getFocused()).should_be(ecui.get('common'));
    },

    '控件不处于焦点状态': function () {
        var common = ecui.get('common');

        var blur = false;
        common.onblur = function () {
            blur = true;
        };

        ecui.loseFocus(common);
        value_of(blur).should_be_false();
    },

    '控件及其子控件处于焦点状态': function () {
        var parent = ecui.get('parent');

        var blur = false;
        parent.onblur = function () {
            blur = true;
        };

        ecui.setFocused(ecui.get('child'));
        ecui.loseFocus(parent);
        value_of(blur).should_be_true();
        value_of(ecui.getFocused()).should_be(ecui.get('common'));
    }
});

test('query', {
    '按控件类型查找': function () {
        var button = ecui.create(ecui.ui.Button);

        value_of(ecui.query({type: ecui.ui.Button})).should_be([button]);

        ecui.dispose(button);
    },

    '按父控件查找': function () {
        var common = ecui.get('common');

        value_of(ecui.query({parent: common})).should_be([ecui.get('parent')]);
    },

    '自定义函数查找': function () {
        var el = document.createElement('div'),
            ctrl = ecui.create(ecui.ui.Control, {main: el});
        el.id = 'query';

        var result = ecui.query({'custom': function(ctrl) {
            if (ctrl.getMain().id == 'query') {
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

test('setFocused', {
    '单控件测试': function () {
        var common = ecui.get('common'),
            focus = false;
        common.onfocus = function () {
            focus = true;
        };
        common.onblur = function () {
            focus = false;
        };
        value_of(focus).should_be_false();
        ecui.setFocused(common);
        value_of(focus).should_be_true();
        ecui.setFocused();
        value_of(focus).should_be_false();
    },

    '控件多层级测试': function () {
        var result = [],
            parent = ecui.get('parent'),
            child = ecui.get('child');

        parent.onfocus = function () {
            result.push('parent-focus');
        };
        parent.onblur = function () {
            result.push('parent-blur');
        };
        child.onfocus = function () {
            result.push('child-focus');
        };
        child.onblur = function () {
            result.push('child-blur');
        };
        ecui.setFocused(child);
        ecui.setFocused();
        value_of(result).should_be(['child-focus', 'parent-focus', 'child-blur', 'parent-blur']);

        parent.focus();
        child.disable();
        value_of(ecui.getFocused()).should_be(parent);
        ecui.setFocused(child);
        value_of(ecui.getFocused()).should_be(null);
    }
});

test('zoom', {
    '缩放事件触发顺序': function () {
        var common = ecui.get('common'),
            el = common.getMain(),
            result = [];

        common.setSize(10, 10);
        common.onzoomstart = function () {
            result.push('start');
        };
        common.onzoom = function () {
            result.push('zooming');
        };
        common.onzoomend = function () {
            result.push('end');
        };
        common.onmousedown = function (event) {
            ecui.zoom(this, event);
        }

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mousemove(el, {'clientX': 10, 'clientY': 10});
        uiut.MockEvents.mousemove(el, {'clientX': 20, 'clientY': 20});
        uiut.MockEvents.mouseup(el);
        uiut.MockEvents.mousemove(el, {'clientX': 10, 'clientY': 10});
        value_of(result).should_be(['start', 'zooming', 'zooming', 'end']);
    },

    '正向缩放': function () {
        var common = ecui.get('common'),
            el = common.getMain();
        common.setSize(10, 10);
        common.setPosition(0, 0);
        common.onmousedown = function (event) {
            ecui.zoom(this, event);
        };
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mousemove(el, {'clientX': 50, 'clientY': 50});
        uiut.MockEvents.mouseup(el);
        value_of(common.getHeight()).should_be(60);
        value_of(common.getWidth()).should_be(60);
    },

    '反向缩放(zoom)': function () {
        var common = ecui.get('common'),
            el = common.getMain();
        common.setSize(10, 10);
        common.setPosition(0, 0);
        common.onmousedown = function (event) {
            ecui.zoom(this, event);
        };
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mousemove(el, {'clientX': -15, 'clientY': -15});
        uiut.MockEvents.mouseup(el);
        value_of(common.getHeight()).should_be(5);
        value_of(common.getWidth()).should_be(5);
    },

    '缩放范围限制(zoom)': function () {
        var common = ecui.get('common'),
            el = common.getMain();
        common.setSize(10, 10);
        common.setPosition(0, 0);
        common.onmousedown = function (event) {
            ecui.zoom(this, event, {'minWidth': 5, 'minHeight': 5, 'maxWidth': 20, 'maxHeight': 20});
        };
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mousemove(el, {'clientX': 10, 'clientY': 10});
        value_of(common.getHeight()).should_be(20);
        value_of(common.getWidth()).should_be(20);

        uiut.MockEvents.mousemove(el, {'clientX': 15, 'clientY': 15});
        value_of(common.getHeight()).should_be(20);
        value_of(common.getWidth()).should_be(20);

        uiut.MockEvents.mousemove(el, {'clientX': 9,'clientY': 9});
        value_of(common.getHeight()).should_be(19);
        value_of(common.getWidth()).should_be(19);

        uiut.MockEvents.mousemove(el, {'clientX': -10,'clientY': -10});
        value_of(common.getHeight()).should_be(5);
        value_of(common.getWidth()).should_be(5);
        uiut.MockEvents.mouseup(el);
    }
});

test('交互行为模拟', {
    '激活，移入/移出': function () {
        var common = ecui.get('common'),
            el = common.getMain();

        uiut.MockEvents.mouseout(document.body);
        uiut.MockEvents.mouseover(el);
        value_of(ecui.getHovered()).should_be(common);
        value_of(ecui.getActived()).should_be(null);
        uiut.MockEvents.mousedown(el);
        value_of(ecui.getActived()).should_be(common);
        uiut.MockEvents.mouseout(el);
        value_of(ecui.getHovered()).should_be(common);
        uiut.MockEvents.mouseover(document.body);
        value_of(ecui.getHovered()).should_be(null);
        uiut.MockEvents.mouseup(el);
        value_of(ecui.getActived()).should_be(null);
    },

    '焦点': function () {
        var common = ecui.get('common'),
            child = ecui.get('child'),
            el = common.getMain();

        value_of(ecui.getFocused()).should_be(null);
        uiut.MockEvents.mousedown(el);
        value_of(ecui.getFocused()).should_be(common);
        uiut.MockEvents.mouseup(el);
        value_of(ecui.getFocused()).should_be(common);
        uiut.MockEvents.mousedown(document.body);
        value_of(ecui.getFocused()).should_be(null);
        uiut.MockEvents.mouseup(document.body);
        common.focus();
        child.disable();
        uiut.MockEvents.mousedown(child.getMain());
        uiut.MockEvents.mouseup(child.getMain());
        value_of(ecui.getFocused()).should_be(null);
    },

    '鼠标事件': function () {
        var common = ecui.get('common'),
            parent = ecui.get('parent'),
            control = ecui.create(ecui.ui.Control, {id: 'control', parent: common}),
            result = [];

        function build(name) {
            var o = ecui.get(name);
            o.onmousedown = function () {
                result.push(name + '-mousedown');
            };

            o.onmouseup = function () {
                result.push(name + '-mouseup');
            };

            o.onmousemove = function () {
                result.push(name + '-mousemove');
            };

            o.onmouseout = function () {
                result.push(name + '-mouseout');
            };

            o.onmouseover = function () {
                result.push(name + '-mouseover');
            };

            o.onclick = function () {
                result.push(name + '-click');
            };
        }

        build('common');
        build('parent');
        build('control');

        uiut.MockEvents.mouseout(document.body);
        uiut.MockEvents.mouseover(parent.getMain());
        uiut.MockEvents.mousedown(parent.getMain());
        uiut.MockEvents.mouseup(parent.getMain());
        uiut.MockEvents.mousedown(parent.getMain());
        uiut.MockEvents.mousemove(parent.getMain());
        uiut.MockEvents.mouseout(parent.getMain());
        uiut.MockEvents.mouseover(control.getMain());
        uiut.MockEvents.mouseup(control.getMain());
        ecui.$clearState(common);

        value_of(result).should_be(['parent-mouseover', 'common-mouseover', 'parent-mousedown', 'common-mousedown', 'parent-mouseup', 'common-mouseup', 'parent-click', 'common-click', 'parent-mousedown', 'common-mousedown', 'parent-mousemove', 'common-mousemove', 'parent-mouseout', 'control-mouseover', 'control-mouseup', 'common-mouseup', 'common-click', 'control-mouseout', 'common-mouseout']);

        ecui.dispose(control);
    },

    '键盘事件': function () {
        var common = ecui.get('common'),
            result = [];

        common.onkeyup = function (event) {
            result.push(event.which);
            result.push(ecui.getKey());
        };

        ecui.setFocused(common);
        uiut.MockEvents.keydown(document, 32);
        value_of(ecui.getKey()).should_be(32);
        uiut.MockEvents.keydown(document, 65);
        uiut.MockEvents.keydown(document, 18);
        uiut.MockEvents.keyup(document, 32);
        uiut.MockEvents.keyup(document, 18);
        uiut.MockEvents.keyup(document, 65);
        value_of(result).should_be([32, 18, 18, 18, 65, 0]);
    }
});
