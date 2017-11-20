function before() {
    var el = document.createElement('div');
    el.className = 'demo common';
    el.innerHTML = '<div id="parent" class="parent"><div id="child" class="child">'
                + '<div id="inner" style="width:400px;height:400px;padding:2px;border:1px solid black;font-size:1px"></div>'
                + '</div></div>';
    el.id = 'common';
    document.body.appendChild(el);
    ecui.create(ecui.ui.Control, {id: 'common', main: el});
    ecui.create(ecui.ui.Control, {id: 'parent', main: el.firstChild});
    ecui.create(ecui.ui.Control, {id: 'child', main: el.firstChild.firstChild});
}

function after() {
    ecui.dispose(document.body);
    document.body.removeChild(document.getElementById('common'));
}

test('$activate/onactivate', {
    '通过鼠标事件激活': function () {
        var childEl = ecui.get('child').getMain(),
            parentEl = ecui.get('parent').getMain(),
            commonEl = ecui.get('common').getMain();

        value_of(baidu.dom.hasClass(childEl, 'child-active')).should_be_false();
        value_of(baidu.dom.hasClass(parentEl, 'parent-active')).should_be_false();
        value_of(baidu.dom.hasClass(commonEl, 'demo-active')).should_be_false();
        uiut.MockEvents.mousedown(childEl);
        value_of(baidu.dom.hasClass(childEl, 'child-active')).should_be_true();
        value_of(baidu.dom.hasClass(parentEl, 'parent-active')).should_be_true();
        value_of(baidu.dom.hasClass(commonEl, 'demo-active')).should_be_true();
        uiut.MockEvents.mouseup(childEl);
    },

    '通过鼠标事件激活，阻止默认行为/阻止冒泡': function () {
        var child = ecui.get('child'),
            childEl = child.getMain(),
            parent = ecui.get('parent'),
            parentEl = parent.getMain(),
            commonEl = ecui.get('common').getMain();

        child.onactivate = function (event) {
            event.preventDefault();
        };

        parent.onactivate = function (event) {
            event.stopPropagation();
        };

        uiut.MockEvents.mousedown(childEl);
        value_of(baidu.dom.hasClass(childEl, 'child-active')).should_be_false();
        value_of(baidu.dom.hasClass(parentEl, 'parent-active')).should_be_true();
        value_of(baidu.dom.hasClass(commonEl, 'demo-active')).should_be_false();
        uiut.MockEvents.mouseup(childEl);
    },

    '直接发送事件，未自定义事件处理': function () {
        var child = ecui.get('child'),
            el = child.getMain();

        ecui.triggerEvent(child, 'activate');
        value_of(baidu.dom.hasClass(el, 'child-active')).should_be_true();
        value_of(baidu.dom.hasClass(ecui.get('parent').getMain(), 'parent-active')).should_be_false();
        value_of(baidu.dom.hasClass(ecui.get('common').getMain(), 'demo-active')).should_be_false();
    },

    '直接发送事件，自定义事件处理': function () {
        var child = ecui.get('child'),
            el = child.getMain(),
            flag = false;

        child.onactivate = function () {
            flag = true;
        };

        ecui.triggerEvent(child, 'activate');
        value_of(flag).should_be_true();
        value_of(baidu.dom.hasClass(el, 'child-active')).should_be_true();
    },

    '直接发送事件，阻止默认行为': function () {
        var child = ecui.get('child'),
            el = child.getMain();

        child.onactivate = function (event) {
            return false;
        };

        ecui.triggerEvent(child, 'activate');
        value_of(baidu.dom.hasClass(el, 'child-active')).should_be_false();
    }
});

test('$append/onappend', {
    '未自定义事件处理': function () {
        var parent = ecui.get('parent'),
            child = ecui.get('child');

        child.setParent();
        value_of(child.getParent()).should_be(null);
        value_of(ecui.query({parent: parent}).length).should_be(0);
        child.setParent(parent);
        value_of(child.getParent()).should_be(parent);
        value_of(ecui.query({parent: parent}).length).should_be(1);
    },

    '自定义事件处理': function () {
        var parent = ecui.get('parent'),
            child = ecui.get('child'),
            flag = false;

        parent.onappend = function () {
            flag = true;
        };

        child.setParent();
        child.setParent(parent);
        value_of(flag).should_be_true();
    },

    '阻止默认行为': function () {
        var parent = ecui.get('parent'),
            child = ecui.get('child');

        parent.onappend = function () {
            return false;
        };

        child.setParent();
        child.setParent(parent);
        value_of(child.getParent()).should_be(null);
        value_of(ecui.query({parent: parent}).length).should_be(0);
    }
});

test('$blur/blur/onblur', {
    '通过鼠标事件失去焦点': function () {
        var child = ecui.get('child'),
            childEl = child.getMain(),
            parentEl = ecui.get('parent').getMain(),
            commonEl = ecui.get('common').getMain();

        ecui.setFocused(child);
        value_of(baidu.dom.hasClass(childEl, 'child-focus')).should_be_true();
        value_of(baidu.dom.hasClass(parentEl, 'parent-focus')).should_be_true();
        value_of(baidu.dom.hasClass(commonEl, 'demo-focus')).should_be_true();
        uiut.MockEvents.mousedown(document.body);
        value_of(baidu.dom.hasClass(childEl, 'child-focus')).should_be_false();
        value_of(baidu.dom.hasClass(parentEl, 'parent-focus')).should_be_false();
        value_of(baidu.dom.hasClass(commonEl, 'demo-focus')).should_be_false();
        uiut.MockEvents.mouseup(document.body);
    },

    '通过鼠标事件失去焦点，阻止默认行为/阻止冒泡': function () {
        var child = ecui.get('child'),
            childEl = child.getMain(),
            parent = ecui.get('parent'),
            parentEl = parent.getMain(),
            commonEl = ecui.get('common').getMain();

        child.onblur = function (event) {
            event.preventDefault();
        };

        parent.onblur = function (event) {
            event.stopPropagation();
        };

        ecui.setFocused(child);
        uiut.MockEvents.mousedown(document.body);
        value_of(baidu.dom.hasClass(childEl, 'child-focus')).should_be_true();
        value_of(baidu.dom.hasClass(parentEl, 'parent-focus')).should_be_false();
        value_of(baidu.dom.hasClass(commonEl, 'demo-focus')).should_be_true();
        uiut.MockEvents.mouseup(document.body);
    },

    '直接调用方法失去焦点': function () {
        var child = ecui.get('child'),
            childEl = child.getMain(),
            parentEl = ecui.get('parent').getMain(),
            commonEl = ecui.get('common').getMain();

        ecui.setFocused(child);
        value_of(baidu.dom.hasClass(childEl, 'child-focus')).should_be_true();
        value_of(baidu.dom.hasClass(parentEl, 'parent-focus')).should_be_true();
        value_of(baidu.dom.hasClass(commonEl, 'demo-focus')).should_be_true();
        child.blur();
        value_of(baidu.dom.hasClass(childEl, 'child-focus')).should_be_false();
        value_of(baidu.dom.hasClass(parentEl, 'parent-focus')).should_be_true();
        value_of(baidu.dom.hasClass(commonEl, 'demo-focus')).should_be_true();
    },

    '直接发送事件，未自定义事件处理': function () {
        var child = ecui.get('child'),
            el = child.getMain();

        ecui.setFocused(child);
        ecui.triggerEvent(child, 'blur');
        value_of(baidu.dom.hasClass(el, 'child-focus')).should_be_false();
        value_of(baidu.dom.hasClass(ecui.get('parent').getMain(), 'parent-focus')).should_be_true();
        value_of(baidu.dom.hasClass(ecui.get('common').getMain(), 'demo-focus')).should_be_true();
    },

    '直接发送事件，自定义事件处理': function () {
        var child = ecui.get('child'),
            el = child.getMain(),
            flag = false;

        child.onblur = function () {
            flag = true;
        };

        ecui.setFocused(child);
        ecui.triggerEvent(child, 'blur');
        value_of(flag).should_be_true();
        value_of(baidu.dom.hasClass(el, 'child-focus')).should_be_false();
    },

    '直接发送事件，阻止默认行为': function () {
        var child = ecui.get('child'),
            el = child.getMain();

        child.onblur = function (event) {
            return false;
        };

        ecui.setFocused(child);
        ecui.triggerEvent(child, 'blur');
        value_of(baidu.dom.hasClass(el, 'child-focus')).should_be_true();
    }
});

test('$cache/cache/clearCache/getMinimumWidth/getMinimumHeight/$getBasicWidth/$getBasicHeight', {
    '基本的信息缓存': function () {
        var control = ecui.$create(ecui.ui.Control, {main: baidu.dom.g('inner')});
        control.cache();
        value_of(control.getMinimumWidth()).should_be(6);
        value_of(control.getMinimumHeight()).should_be(6);
        value_of(control.$getBasicWidth()).should_be(6);
        value_of(control.$getBasicHeight()).should_be(6);
    },

    '直接改变节点信息不会影响缓存': function () {
        var control = ecui.$create(ecui.ui.Control, {main: baidu.dom.g('inner')});
        control.cache();
        baidu.dom.g('inner').style.padding = '3px';
        control.cache();
        value_of(control.getMinimumWidth()).should_be(6);
        value_of(control.getMinimumHeight()).should_be(6);
        value_of(control.$getBasicWidth()).should_be(6);
        value_of(control.$getBasicHeight()).should_be(6);
    },

    '清除缓存后将再次缓存信息': function () {
        var control = ecui.$create(ecui.ui.Control, {main: baidu.dom.g('inner')});
        control.cache();
        baidu.dom.g('inner').style.padding = '3px';
        control.clearCache();
        control.cache();
        value_of(control.getMinimumWidth()).should_be(8);
        value_of(control.getMinimumHeight()).should_be(8);
        value_of(control.$getBasicWidth()).should_be(8);
        value_of(control.$getBasicHeight()).should_be(8);
    }
});

test('$click/$dblclick/onclick/ondblclick', {
    '通过鼠标事件点击': function () {
        var child = ecui.get('child'),
            el = child.getMain(),
            parent = ecui.get('parent'),
            common = ecui.get('common'),
            result = [];

        child.onclick = function () {
            result.push('child-click');
        };

        parent.onclick = function () {
            result.push('parent-click');
        };

        common.onclick = function () {
            result.push('common-click');
        };

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(result).should_be(['child-click', 'parent-click', 'common-click']);
    },

    '通过鼠标事件点击，阻止默认行为/阻止冒泡': function () {
        var child = ecui.get('child'),
            el = child.getMain(),
            parent = ecui.get('parent'),
            common = ecui.get('common'),
            result = [];

        child.onclick = function () {
            result.push('child-click');
        };

        parent.onclick = function (event) {
            result.push('parent-click');
            event.stopPropagation();
        };

        common.onclick = function () {
            result.push('common-click');
        };

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(result).should_be(['child-click', 'parent-click']);
    },

    '直接发送事件，自定义事件处理': function () {
        var child = ecui.get('child'),
            el = child.getMain(),
            parent = ecui.get('parent'),
            common = ecui.get('common'),
            result = [];

        child.onclick = function () {
            result.push('child-click');
        };

        parent.onclick = function () {
            result.push('parent-click');
        };

        common.onclick = function () {
            result.push('common-click');
        };

        ecui.triggerEvent(child, 'click');
        value_of(result).should_be(['child-click']);
    },

    '双击操作': function () {
        var child = ecui.get('child'),
            el = child.getMain(),
            result = [];

        child.onclick = function () {
            result.push('click');
        };

        child.ondblclick = function () {
            result.push('dblclick');
        };

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        uiut.MockEvents.mouseup(el);
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);

        value_of(result).should_be(['click', 'click', 'dblclick', 'click']);
    }
});

test('$deactivate/ondeactivate', {
    '通过鼠标事件失去激活': function () {
        var child = ecui.get('child'),
            childEl = child.getMain(),
            parentEl = ecui.get('parent').getMain(),
            commonEl = ecui.get('common').getMain();

        uiut.MockEvents.mousedown(childEl);
        value_of(baidu.dom.hasClass(childEl, 'child-active')).should_be_true();
        value_of(baidu.dom.hasClass(parentEl, 'parent-active')).should_be_true();
        value_of(baidu.dom.hasClass(commonEl, 'demo-active')).should_be_true();
        uiut.MockEvents.mouseup(childEl);
        value_of(baidu.dom.hasClass(childEl, 'child-active')).should_be_false();
        value_of(baidu.dom.hasClass(parentEl, 'parent-active')).should_be_false();
        value_of(baidu.dom.hasClass(commonEl, 'demo-active')).should_be_false();
    },

    '通过鼠标事件失去激活，阻止默认行为/阻止冒泡': function () {
        var child = ecui.get('child'),
            childEl = child.getMain(),
            parent = ecui.get('parent'),
            parentEl = parent.getMain(),
            commonEl = ecui.get('common').getMain();

        child.ondeactivate = function (event) {
            event.preventDefault();
        };

        parent.ondeactivate = function (event) {
            event.stopPropagation();
        };

        uiut.MockEvents.mousedown(childEl);
        uiut.MockEvents.mouseup(childEl);
        value_of(baidu.dom.hasClass(childEl, 'child-active')).should_be_true();
        value_of(baidu.dom.hasClass(parentEl, 'parent-active')).should_be_false();
        value_of(baidu.dom.hasClass(commonEl, 'demo-active')).should_be_true();
    },

    '直接发送事件，未自定义事件处理': function () {
        var child = ecui.get('child'),
            el = child.getMain();

        uiut.MockEvents.mousedown(el);
        ecui.triggerEvent(child, 'deactivate');
        value_of(baidu.dom.hasClass(el, 'child-active')).should_be_false();
        value_of(baidu.dom.hasClass(ecui.get('parent').getMain(), 'parent-active')).should_be_true();
        value_of(baidu.dom.hasClass(ecui.get('common').getMain(), 'demo-active')).should_be_true();
        uiut.MockEvents.mouseup(el);
    },

    '直接发送事件，自定义事件处理': function () {
        var child = ecui.get('child'),
            el = child.getMain(),
            flag = false;

        child.ondeactivate = function () {
            flag = true;
        };

        uiut.MockEvents.mousedown(el);
        ecui.triggerEvent(child, 'deactivate');
        value_of(flag).should_be_true();
        value_of(baidu.dom.hasClass(el, 'child-active')).should_be_false();
        uiut.MockEvents.mouseup(el);
    },

    '直接发送事件，阻止默认行为': function () {
        var child = ecui.get('child'),
            el = child.getMain();

        child.ondeactivate = function (event) {
            return false;
        };

        uiut.MockEvents.mousedown(el);
        ecui.triggerEvent(child, 'deactivate');
        value_of(baidu.dom.hasClass(el, 'child-active')).should_be_true();
        uiut.MockEvents.mouseup(el);
    }
});

test('$focus/focus/onfocus', {
    '通过鼠标事件获得焦点': function () {
        var childEl = ecui.get('child').getMain(),
            parentEl = ecui.get('parent').getMain(),
            commonEl = ecui.get('common').getMain();

        value_of(baidu.dom.hasClass(childEl, 'child-focus')).should_be_false();
        value_of(baidu.dom.hasClass(parentEl, 'parent-focus')).should_be_false();
        value_of(baidu.dom.hasClass(commonEl, 'demo-focus')).should_be_false();
        uiut.MockEvents.mousedown(childEl);
        value_of(baidu.dom.hasClass(childEl, 'child-focus')).should_be_true();
        value_of(baidu.dom.hasClass(parentEl, 'parent-focus')).should_be_true();
        value_of(baidu.dom.hasClass(commonEl, 'demo-focus')).should_be_true();
        uiut.MockEvents.mouseup(childEl);
    },

    '通过鼠标事件获得焦点，阻止默认行为/阻止冒泡': function () {
        var child = ecui.get('child'),
            childEl = child.getMain(),
            parent = ecui.get('parent'),
            parentEl = parent.getMain(),
            commonEl = ecui.get('common').getMain();

        child.onfocus = function (event) {
            event.preventDefault();
        };

        parent.onfocus = function (event) {
            event.stopPropagation();
        };

        uiut.MockEvents.mousedown(childEl);
        value_of(baidu.dom.hasClass(childEl, 'child-focus')).should_be_false();
        value_of(baidu.dom.hasClass(parentEl, 'parent-focus')).should_be_true();
        value_of(baidu.dom.hasClass(commonEl, 'demo-focus')).should_be_false();
        uiut.MockEvents.mouseup(childEl);
    },

    '直接调用方法获得焦点': function () {
        var childEl = ecui.get('child').getMain(),
            parentEl = ecui.get('parent').getMain(),
            commonEl = ecui.get('common').getMain();

        value_of(baidu.dom.hasClass(childEl, 'child-focus')).should_be_false();
        value_of(baidu.dom.hasClass(parentEl, 'parent-focus')).should_be_false();
        value_of(baidu.dom.hasClass(commonEl, 'demo-focus')).should_be_false();
        ecui.get('child').focus();
        value_of(baidu.dom.hasClass(childEl, 'child-focus')).should_be_true();
        value_of(baidu.dom.hasClass(parentEl, 'parent-focus')).should_be_true();
        value_of(baidu.dom.hasClass(commonEl, 'demo-focus')).should_be_true();
    },

    '直接发送事件，未自定义事件处理': function () {
        var child = ecui.get('child'),
            el = child.getMain();

        ecui.triggerEvent(child, 'focus');
        value_of(baidu.dom.hasClass(el, 'child-focus')).should_be_true();
        value_of(baidu.dom.hasClass(ecui.get('parent').getMain(), 'parent-focus')).should_be_false();
        value_of(baidu.dom.hasClass(ecui.get('common').getMain(), 'demo-focus')).should_be_false();
    },

    '直接发送事件，自定义事件处理': function () {
        var child = ecui.get('child'),
            el = child.getMain(),
            flag = false;

        child.onfocus = function () {
            flag = true;
        };

        ecui.triggerEvent(child, 'focus');
        value_of(flag).should_be_true();
        value_of(baidu.dom.hasClass(el, 'child-focus')).should_be_true();
    },

    '直接发送事件，阻止默认行为': function () {
        var child = ecui.get('child'),
            el = child.getMain();

        child.onfocus = function (event) {
            return false;
        };

        ecui.triggerEvent(child, 'focus');
        value_of(baidu.dom.hasClass(el, 'child-focus')).should_be_false();
    }
});

test('$hide/$show/hide/isShow/show 测试', {
    '已经显示的不再显示': function () {
        var common = ecui.get('common'),
            el = common.getMain(),
            result = [];

        common.onshow = function () {
            result.push('common-show');
        };

        ecui.get('child').onshow = function () {
            result.push('child-show');
        };

        common.hide();
        value_of(common.isShow()).should_be_false();
        common.show();
        common.show();
        value_of(common.isShow()).should_be_true();

        value_of(result).should_be(['common-show', 'child-show']);
    },

    '已经隐藏的不再隐藏': function () {
        var common = ecui.get('common'),
            el = common.getMain(),
            result = [];

        common.onhide = function () {
            result.push('common-hide');
        };

        ecui.get('child').onhide = function () {
            result.push('child-hide');
        };

        value_of(common.isShow()).should_be_true();
        common.hide();
        common.hide();
        value_of(common.isShow()).should_be_false();

        value_of(result).should_be(['common-hide', 'child-hide']);
    },

    '显示时恢复原来的布局信息值': function () {
        var common = ecui.get('common'),
            el = common.getMain(),
            result = [];

        el.style.display = 'inline';
        common.hide();
        value_of(el.style.display).should_be('none');
        common.hide();
        value_of(el.style.display).should_be('none');
        common.show();
        value_of(el.style.display).should_be('inline');
        common.show();
        value_of(el.style.display).should_be('inline');
    },

    '控件隐藏，自动释放状态': function () {
        var common = ecui.get('common'),
            el = common.getMain();

        uiut.MockEvents.mouseover(el);
        uiut.MockEvents.mousedown(el);
        value_of(ecui.getActived()).should_be(common);
        value_of(ecui.getFocused()).should_be(common);
        value_of(ecui.getHovered()).should_be(common);
        value_of(common.isShow()).should_be_true();

        common.hide();
        value_of(ecui.getActived()).should_be(null);
        value_of(ecui.getFocused()).should_be(null);
        value_of(ecui.getHovered()).should_be(null);
        value_of(common.isShow()).should_be_false();

        uiut.MockEvents.mouseup(el);
    }
});

test('$keydown/onkeydown', {
    '通过键盘事件触发': function () {
        var child = ecui.get('child'),
            parent = ecui.get('parent'),
            common = ecui.get('common'),
            result = [];

        ecui.setFocused(child);

        child.onkeydown = function () {
            result.push('child-keydown');
        };

        parent.onkeydown = function () {
            result.push('parent-keydown');
        };

        common.onkeydown = function () {
            result.push('common-keydown');
        };

        uiut.MockEvents.keydown(document, 32);
        uiut.MockEvents.keyup(document, 32);
        value_of(result).should_be(['child-keydown', 'parent-keydown', 'common-keydown']);
    },

    '通过鼠标事件点击，阻止默认行为/阻止冒泡': function () {
        var child = ecui.get('child'),
            parent = ecui.get('parent'),
            common = ecui.get('common'),
            result = [];

        ecui.setFocused(child);

        child.onkeydown = function () {
            result.push('child-keydown');
        };

        parent.onkeydown = function (event) {
            result.push('parent-keydown');
            event.stopPropagation();
        };

        common.onkeydown = function () {
            result.push('common-keydown');
        };

        uiut.MockEvents.keydown(document, 32);
        uiut.MockEvents.keyup(document, 32);
        value_of(result).should_be(['child-keydown', 'parent-keydown']);
    },

    '直接发送事件，自定义事件处理': function () {
        var child = ecui.get('child'),
            parent = ecui.get('parent'),
            common = ecui.get('common'),
            result = [];

        child.onkeydown = function () {
            result.push('child-keydown');
        };

        parent.onkeydown = function () {
            result.push('parent-keydown');
        };

        common.onkeydown = function () {
            result.push('common-keydown');
        };

        ecui.triggerEvent(child, 'keydown');
        value_of(result).should_be(['child-keydown']);
    }
});

test('$keypress/onkeypress', {
    '通过键盘事件触发': function () {
        var child = ecui.get('child'),
            parent = ecui.get('parent'),
            common = ecui.get('common'),
            result = [];

        ecui.setFocused(child);

        child.onkeypress = function () {
            result.push('child-keypress');
        };

        parent.onkeypress = function () {
            result.push('parent-keypress');
        };

        common.onkeypress = function () {
            result.push('common-keypress');
        };

        uiut.MockEvents.keydown(document, 32);
        uiut.MockEvents.keypress(document, 32);
        uiut.MockEvents.keyup(document, 32);
        value_of(result).should_be(['child-keypress', 'parent-keypress', 'common-keypress']);
    },

    '通过鼠标事件点击，阻止默认行为/阻止冒泡': function () {
        var child = ecui.get('child'),
            parent = ecui.get('parent'),
            common = ecui.get('common'),
            result = [];

        ecui.setFocused(child);

        child.onkeypress = function () {
            result.push('child-keypress');
        };

        parent.onkeypress = function (event) {
            result.push('parent-keypress');
            event.stopPropagation();
        };

        common.onkeypress = function () {
            result.push('common-keypress');
        };

        uiut.MockEvents.keydown(document, 32);
        uiut.MockEvents.keypress(document, 32);
        uiut.MockEvents.keyup(document, 32);
        value_of(result).should_be(['child-keypress', 'parent-keypress']);
    },

    '直接发送事件，自定义事件处理': function () {
        var child = ecui.get('child'),
            parent = ecui.get('parent'),
            common = ecui.get('common'),
            result = [];

        child.onkeypress = function () {
            result.push('child-keypress');
        };

        parent.onkeypress = function () {
            result.push('parent-keypress');
        };

        common.onkeypress = function () {
            result.push('common-keypress');
        };

        ecui.triggerEvent(child, 'keypress');
        value_of(result).should_be(['child-keypress']);
    }
});

test('$keyup/onkeyup', {
    '通过键盘事件触发': function () {
        var child = ecui.get('child'),
            parent = ecui.get('parent'),
            common = ecui.get('common'),
            result = [];

        ecui.setFocused(child);

        child.onkeyup = function () {
            result.push('child-keyup');
        };

        parent.onkeyup = function () {
            result.push('parent-keyup');
        };

        common.onkeyup = function () {
            result.push('common-keyup');
        };

        uiut.MockEvents.keydown(document, 32);
        uiut.MockEvents.keyup(document, 32);
        value_of(result).should_be(['child-keyup', 'parent-keyup', 'common-keyup']);
    },

    '通过鼠标事件点击，阻止默认行为/阻止冒泡': function () {
        var child = ecui.get('child'),
            parent = ecui.get('parent'),
            common = ecui.get('common'),
            result = [];

        ecui.setFocused(child);

        child.onkeyup = function () {
            result.push('child-keyup');
        };

        parent.onkeyup = function (event) {
            result.push('parent-keyup');
            event.stopPropagation();
        };

        common.onkeyup = function () {
            result.push('common-keyup');
        };

        uiut.MockEvents.keydown(document, 32);
        uiut.MockEvents.keyup(document, 32);
        value_of(result).should_be(['child-keyup', 'parent-keyup']);
    },

    '直接发送事件，自定义事件处理': function () {
        var child = ecui.get('child'),
            parent = ecui.get('parent'),
            common = ecui.get('common'),
            result = [];

        child.onkeyup = function () {
            result.push('child-keyup');
        };

        parent.onkeyup = function () {
            result.push('parent-keyup');
        };

        common.onkeyup = function () {
            result.push('common-keyup');
        };

        ecui.triggerEvent(child, 'keyup');
        value_of(result).should_be(['child-keyup']);
    }
});

test('$mousedown/onmousedown', {
    '通过鼠标事件触发': function () {
        var child = ecui.get('child'),
            el = child.getMain(),
            parent = ecui.get('parent'),
            common = ecui.get('common'),
            result = [];

        child.onmousedown = function () {
            result.push('child-mousedown');
        };

        parent.onmousedown = function () {
            result.push('parent-mousedown');
        };

        common.onmousedown = function () {
            result.push('common-mousedown');
        };

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(result).should_be(['child-mousedown', 'parent-mousedown', 'common-mousedown']);
    },

    '通过鼠标事件点击，阻止默认行为/阻止冒泡': function () {
        var child = ecui.get('child'),
            el = child.getMain(),
            parent = ecui.get('parent'),
            common = ecui.get('common'),
            result = [];

        child.onmousedown = function () {
            result.push('child-mousedown');
        };

        parent.onmousedown = function (event) {
            result.push('parent-mousedown');
            event.stopPropagation();
        };

        common.onmousedown = function () {
            result.push('common-mousedown');
        };

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(result).should_be(['child-mousedown', 'parent-mousedown']);
    },

    '直接发送事件，自定义事件处理': function () {
        var child = ecui.get('child'),
            el = child.getMain(),
            parent = ecui.get('parent'),
            common = ecui.get('common'),
            result = [];

        child.onmousedown = function () {
            result.push('child-mousedown');
        };

        parent.onmousedown = function () {
            result.push('parent-mousedown');
        };

        common.onmousedown = function () {
            result.push('common-mousedown');
        };

        ecui.triggerEvent(child, 'mousedown');
        value_of(result).should_be(['child-mousedown']);
    }
});

test('$mousemove/onmousemove', {
    '通过鼠标事件触发': function () {
        var child = ecui.get('child'),
            el = child.getMain(),
            parent = ecui.get('parent'),
            common = ecui.get('common'),
            result = [];

        child.onmousemove = function () {
            result.push('child-mousemove');
        };

        parent.onmousemove = function () {
            result.push('parent-mousemove');
        };

        common.onmousemove = function () {
            result.push('common-mousemove');
        };

        uiut.MockEvents.mouseover(el);
        uiut.MockEvents.mousemove(el);
        value_of(result).should_be(['child-mousemove', 'parent-mousemove', 'common-mousemove']);
    },

    '通过鼠标事件点击，阻止默认行为/阻止冒泡': function () {
        var child = ecui.get('child'),
            el = child.getMain(),
            parent = ecui.get('parent'),
            common = ecui.get('common'),
            result = [];

        child.onmousemove = function () {
            result.push('child-mousemove');
        };

        parent.onmousemove = function (event) {
            result.push('parent-mousemove');
            event.stopPropagation();
        };

        common.onmousemove = function () {
            result.push('common-mousemove');
        };

        uiut.MockEvents.mouseover(el);
        uiut.MockEvents.mousemove(el);
        value_of(result).should_be(['child-mousemove', 'parent-mousemove']);
    },

    '直接发送事件，自定义事件处理': function () {
        var child = ecui.get('child'),
            el = child.getMain(),
            parent = ecui.get('parent'),
            common = ecui.get('common'),
            result = [];

        child.onmousemove = function () {
            result.push('child-mousemove');
        };

        parent.onmousemove = function () {
            result.push('parent-mousemove');
        };

        common.onmousemove = function () {
            result.push('common-mousemove');
        };

        ecui.triggerEvent(child, 'mousemove');
        value_of(result).should_be(['child-mousemove']);
    }
});

test('$mouseout/onmouseout', {
    '通过鼠标事件失去激活': function () {
        var child = ecui.get('child'),
            childEl = child.getMain(),
            parentEl = ecui.get('parent').getMain(),
            commonEl = ecui.get('common').getMain();

        uiut.MockEvents.mouseover(childEl);
        value_of(baidu.dom.hasClass(childEl, 'child-hover')).should_be_true();
        value_of(baidu.dom.hasClass(parentEl, 'parent-hover')).should_be_true();
        value_of(baidu.dom.hasClass(commonEl, 'demo-hover')).should_be_true();
        uiut.MockEvents.mouseout(childEl);
        uiut.MockEvents.mouseover(document.body);
        value_of(baidu.dom.hasClass(childEl, 'child-hover')).should_be_false();
        value_of(baidu.dom.hasClass(parentEl, 'parent-hover')).should_be_false();
        value_of(baidu.dom.hasClass(commonEl, 'demo-hover')).should_be_false();
    },

    '通过鼠标事件失去激活，阻止默认行为/阻止冒泡': function () {
        var child = ecui.get('child'),
            childEl = child.getMain(),
            parent = ecui.get('parent'),
            parentEl = parent.getMain(),
            commonEl = ecui.get('common').getMain();

        child.onmouseout = function (event) {
            event.preventDefault();
        };

        parent.onmouseout = function (event) {
            event.stopPropagation();
        };

        uiut.MockEvents.mouseover(childEl);
        uiut.MockEvents.mouseout(childEl);
        uiut.MockEvents.mouseover(document.body);
        value_of(baidu.dom.hasClass(childEl, 'child-hover')).should_be_true();
        value_of(baidu.dom.hasClass(parentEl, 'parent-hover')).should_be_false();
        value_of(baidu.dom.hasClass(commonEl, 'demo-hover')).should_be_true();
    },

    '直接发送事件，未自定义事件处理': function () {
        var child = ecui.get('child'),
            el = child.getMain();

        uiut.MockEvents.mouseover(el);
        ecui.triggerEvent(child, 'mouseout');
        value_of(baidu.dom.hasClass(el, 'child-hover')).should_be_false();
        value_of(baidu.dom.hasClass(ecui.get('parent').getMain(), 'parent-hover')).should_be_true();
        value_of(baidu.dom.hasClass(ecui.get('common').getMain(), 'demo-hover')).should_be_true();
        uiut.MockEvents.mouseup(el);
    },

    '直接发送事件，自定义事件处理': function () {
        var child = ecui.get('child'),
            el = child.getMain(),
            flag = false;

        child.onmouseout = function () {
            flag = true;
        };

        uiut.MockEvents.mouseover(el);
        ecui.triggerEvent(child, 'mouseout');
        value_of(flag).should_be_true();
        value_of(baidu.dom.hasClass(el, 'child-hover')).should_be_false();
    },

    '直接发送事件，阻止默认行为': function () {
        var child = ecui.get('child'),
            el = child.getMain();

        child.onmouseout = function (event) {
            return false;
        };

        uiut.MockEvents.mouseover(el);
        ecui.triggerEvent(child, 'mouseout');
        value_of(baidu.dom.hasClass(el, 'child-hover')).should_be_true();
    }
});

test('$mouseover/onmouseover', {
    '通过鼠标事件激活': function () {
        var childEl = ecui.get('child').getMain(),
            parentEl = ecui.get('parent').getMain(),
            commonEl = ecui.get('common').getMain();

        value_of(baidu.dom.hasClass(childEl, 'child-hover')).should_be_false();
        value_of(baidu.dom.hasClass(parentEl, 'parent-hover')).should_be_false();
        value_of(baidu.dom.hasClass(commonEl, 'demo-hover')).should_be_false();
        uiut.MockEvents.mouseover(childEl);
        value_of(baidu.dom.hasClass(childEl, 'child-hover')).should_be_true();
        value_of(baidu.dom.hasClass(parentEl, 'parent-hover')).should_be_true();
        value_of(baidu.dom.hasClass(commonEl, 'demo-hover')).should_be_true();
    },

    '通过鼠标事件激活，阻止默认行为/阻止冒泡': function () {
        var child = ecui.get('child'),
            childEl = child.getMain(),
            parent = ecui.get('parent'),
            parentEl = parent.getMain(),
            commonEl = ecui.get('common').getMain();

        child.onmouseover = function (event) {
            event.preventDefault();
        };

        parent.onmouseover = function (event) {
            event.stopPropagation();
        };

        uiut.MockEvents.mouseover(childEl);
        value_of(baidu.dom.hasClass(childEl, 'child-hover')).should_be_false();
        value_of(baidu.dom.hasClass(parentEl, 'parent-hover')).should_be_true();
        value_of(baidu.dom.hasClass(commonEl, 'demo-hover')).should_be_false();
    },

    '直接发送事件，未自定义事件处理': function () {
        var child = ecui.get('child'),
            el = child.getMain();

        ecui.triggerEvent(child, 'mouseover');
        value_of(baidu.dom.hasClass(el, 'child-hover')).should_be_true();
        value_of(baidu.dom.hasClass(ecui.get('parent').getMain(), 'parent-hover')).should_be_false();
        value_of(baidu.dom.hasClass(ecui.get('common').getMain(), 'demo-hover')).should_be_false();
    },

    '直接发送事件，自定义事件处理': function () {
        var child = ecui.get('child'),
            el = child.getMain(),
            flag = false;

        child.onmouseover = function () {
            flag = true;
        };

        ecui.triggerEvent(child, 'mouseover');
        value_of(flag).should_be_true();
        value_of(baidu.dom.hasClass(el, 'child-hover')).should_be_true();
    },

    '直接发送事件，阻止默认行为': function () {
        var child = ecui.get('child'),
            el = child.getMain();

        child.onmouseover = function (event) {
            return false;
        };

        ecui.triggerEvent(child, 'mouseover');
        value_of(baidu.dom.hasClass(el, 'child-hover')).should_be_false();
    }
});

test('$mouseup/onmouseup', {
    '通过鼠标事件触发': function () {
        var child = ecui.get('child'),
            el = child.getMain(),
            parent = ecui.get('parent'),
            common = ecui.get('common'),
            result = [];

        child.onmouseup = function () {
            result.push('child-mouseup');
        };

        parent.onmouseup = function () {
            result.push('parent-mouseup');
        };

        common.onmouseup = function () {
            result.push('common-mouseup');
        };

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(result).should_be(['child-mouseup', 'parent-mouseup', 'common-mouseup']);
    },

    '通过鼠标事件点击，阻止默认行为/阻止冒泡': function () {
        var child = ecui.get('child'),
            el = child.getMain(),
            parent = ecui.get('parent'),
            common = ecui.get('common'),
            result = [];

        child.onmouseup = function () {
            result.push('child-mouseup');
        };

        parent.onmouseup = function (event) {
            result.push('parent-mouseup');
            event.stopPropagation();
        };

        common.onmouseup = function () {
            result.push('common-mouseup');
        };

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(result).should_be(['child-mouseup', 'parent-mouseup']);
    },

    '直接发送事件，自定义事件处理': function () {
        var child = ecui.get('child'),
            el = child.getMain(),
            parent = ecui.get('parent'),
            common = ecui.get('common'),
            result = [];

        child.onmouseup = function () {
            result.push('child-mouseup');
        };

        parent.onmouseup = function () {
            result.push('parent-mouseup');
        };

        common.onmouseup = function () {
            result.push('common-mouseup');
        };

        ecui.triggerEvent(child, 'mouseup');
        value_of(result).should_be(['child-mouseup']);
    }
});

test('$mousewheel/onmousewheel', {
    '在空白区域内滚动触发焦点状态控件事件': function () {
        var common = ecui.get('common'),
            result = [];

        ecui.setFocused(common);

        common.onmousewheel = function () {
            result.push('common-mousewheel');
        };

        uiut.MockEvents.mouseover(document.body);
        uiut.MockEvents.mousewheel(document.body);
        value_of(result).should_be(['common-mousewheel']);
    },

    '通过鼠标事件触发': function () {
        var child = ecui.get('child'),
            el = child.getMain(),
            parent = ecui.get('parent'),
            common = ecui.get('common'),
            result = [];

        child.onmousewheel = function () {
            result.push('child-mousewheel');
        };

        parent.onmousewheel = function () {
            result.push('parent-mousewheel');
        };

        common.onmousewheel = function () {
            result.push('common-mousewheel');
        };

        uiut.MockEvents.mouseover(el);
        uiut.MockEvents.mousewheel(el);
        value_of(result).should_be(['child-mousewheel', 'parent-mousewheel', 'common-mousewheel']);
        uiut.MockEvents.mouseover(document.body);
        uiut.MockEvents.mousewheel(el);
        value_of(result).should_be(['child-mousewheel', 'parent-mousewheel', 'common-mousewheel']);
        child.focus();
        uiut.MockEvents.mousewheel(el);
        value_of(result).should_be(['child-mousewheel', 'parent-mousewheel', 'common-mousewheel','child-mousewheel', 'parent-mousewheel', 'common-mousewheel']);
    },

    '通过鼠标事件点击，阻止默认行为/阻止冒泡': function () {
        var child = ecui.get('child'),
            el = child.getMain(),
            parent = ecui.get('parent'),
            common = ecui.get('common'),
            result = [];

        child.onmousewheel = function () {
            result.push('child-mousewheel');
        };

        parent.onmousewheel = function (event) {
            result.push('parent-mousewheel');
            event.stopPropagation();
        };

        common.onmousewheel = function () {
            result.push('common-mousewheel');
        };

        uiut.MockEvents.mouseover(el);
        uiut.MockEvents.mousewheel(el);
        value_of(result).should_be(['child-mousewheel', 'parent-mousewheel']);
    },

    '直接发送事件，自定义事件处理': function () {
        var child = ecui.get('child'),
            el = child.getMain(),
            parent = ecui.get('parent'),
            common = ecui.get('common'),
            result = [];

        child.onmousewheel = function () {
            result.push('child-mousewheel');
        };

        parent.onmousewheel = function () {
            result.push('parent-mousewheel');
        };

        common.onmousewheel = function () {
            result.push('common-mousewheel');
        };

        uiut.MockEvents.mouseover(el);
        ecui.triggerEvent(child, 'mousewheel');
        value_of(result).should_be(['child-mousewheel']);
    }
});

test('$remove/onremove', {
    '直接发送事件，未自定义事件处理': function () {
        var parent = ecui.get('parent'),
            child = ecui.get('child');

        child.setParent();
        value_of(child.getParent()).should_be(null);
        value_of(ecui.query({parent: parent}).length).should_be(0);
    },

    '直接发送事件，自定义事件处理': function () {
        var parent = ecui.get('parent'),
            child = ecui.get('child'),
            flag = false;

        parent.onremove = function () {
            flag = true;
        };

        value_of(flag).should_be_false();
        child.setParent();
        value_of(flag).should_be_true();
    },

    '直接发送事件，阻止默认行为': function () {
        var parent = ecui.get('parent'),
            child = ecui.get('child');

        parent.onappend = function () {
            return false;
        };

        child.setParent();
        value_of(child.getParent()).should_be(null);
        value_of(ecui.query({parent: parent}).length).should_be(0);
    }
});

test('$resize/onresize/resize', {
    '控件大小变化': function () {
        var common = ecui.get('common'),
            parent = ecui.get('parent');
        common.setSize(600);
        value_of(parent.getWidth() > 600).should_be_true();
        ecui.repaint();
        value_of(parent.getWidth()).should_be(600);
    },

    '阻止大小变化的默认行为': function () {
        var common = ecui.get('common'),
            parent = ecui.get('parent'),
            width = parent.getWidth();
        common.setSize(600);

        parent.onresize = function () {
            return false;
        };
        ecui.repaint();
        value_of(parent.getWidth()).should_be(width);
    },

    '隐藏的控件不自动进行大小变化': function () {
        var common = ecui.get('common'),
            parent = ecui.get('parent'),
            width = parent.getWidth();
        common.setSize(600);

        parent.hide();
        ecui.repaint();
        parent.show();
        value_of(parent.getWidth()).should_be(width);
    }
});

test('$setParent/appendTo/getParent/setParent', {
    '父对象产生事件': function () {
        var common = ecui.get('common'),
            parent = ecui.get('parent'),
            child = ecui.get('child'),
            result = [];

        parent.onappend = function () {
            result.push('parent-append');
        };

        parent.onremove = function () {
            result.push('parent-remove');
        };

        common.onappend = function () {
            result.push('common-append');
        };

        common.onremove = function () {
            result.push('common-remove');
        };

        child.setParent();
        value_of(child.getParent()).should_be(null);
        child.setParent(common);
        value_of(child.getParent()).should_be(common);
        child.appendTo(common.getMain());
        child.appendTo(parent.getMain());
        value_of(child.getParent()).should_be(parent);
        value_of(result).should_be(['parent-remove', 'common-append', 'common-remove', 'parent-append']);
    },

    '父对象可以阻止添加不可以阻止移除': function () {
        var common = ecui.get('common'),
            parent = ecui.get('parent'),
            child = ecui.get('child');

        common.onappend = function () {
            return false;
        };

        common.onremove = function () {
            return false;
        };

        child.setParent(common);
        value_of(child.getParent()).should_be(null);
        parent.setParent(common);
        value_of(parent.getParent()).should_be(common);
        parent.setParent();
        value_of(parent.getParent()).should_be(common);
    },

    '直接设置逻辑父对象': function () {
        var parent = ecui.get('parent'),
            child = ecui.get('child');

        parent.onappend = function () {
            return false;
        };

        parent.onremove = function () {
            return false;
        };

        child.setParent(parent);
        value_of(child.getParent()).should_be(parent);
        child.setParent();
        child.$setParent(parent);
        value_of(child.getParent()).should_be(parent);
    }
});

test('$setSize/setBodySize/setSize 测试', {
    '只设置宽度': function () {
        var control = ecui.create(ecui.ui.Control, {main: baidu.dom.g('inner')}),
            height = control.getHeight();

        control.setSize(100);
        value_of(control.getWidth()).should_be(100);
        value_of(control.getHeight()).should_be(height);

        control.setBodySize(100);
        value_of(control.getWidth()).should_be(106);
        value_of(control.getHeight()).should_be(height);
    },

    '只设置高度': function () {
        var control = ecui.create(ecui.ui.Control, {main: baidu.dom.g('inner')}),
            width = control.getWidth();

        control.setSize(0, 50);
        value_of(control.getWidth()).should_be(width);
        value_of(control.getHeight()).should_be(50);

        control.setBodySize(0, 50);
        value_of(control.getWidth()).should_be(width);
        value_of(control.getHeight()).should_be(56);
    },

    '同时设置宽度与高度': function () {
        var control = ecui.create(ecui.ui.Control, {main: baidu.dom.g('inner')});

        control.setSize(100, 50);
        value_of(control.getWidth()).should_be(100);
        value_of(control.getHeight()).should_be(50);

        control.setBodySize(100, 50);
        value_of(control.getWidth()).should_be(106);
        value_of(control.getHeight()).should_be(56);
    },

    '虚设置宽度与高度，可被resize恢复': function () {
        var control = ecui.create(ecui.ui.Control, {main: baidu.dom.g('inner')}),
            width = control.getWidth(),
            height = control.getHeight();

        control.$setSize(100, 50);
        ecui.repaint();
        value_of(control.getWidth()).should_be(width);
        value_of(control.getHeight()).should_be(height);
    }
});

test('alterClass 测试', {
    '添加样式': function () {
        var common = ecui.get('common'),
            el = common.getMain();
        value_of(baidu.dom.hasClass(el, 'demo')).should_be_true();
        value_of(baidu.dom.hasClass(el, 'demo-test')).should_be_false();
        common.alterClass('+test');
        value_of(baidu.dom.hasClass(el, 'demo')).should_be_true();
        value_of(baidu.dom.hasClass(el, 'demo-test')).should_be_true();
    },

    '移除样式': function () {
        var common = ecui.get('common'),
            el = common.getMain();
        common.alterClass('+test');
        value_of(baidu.dom.hasClass(el, 'demo')).should_be_true();
        value_of(baidu.dom.hasClass(el, 'demo-test')).should_be_true();
        common.alterClass('-test');
        value_of(baidu.dom.hasClass(el, 'demo')).should_be_true();
        value_of(baidu.dom.hasClass(el, 'demo-test')).should_be_false();
    }
});

test('contain 测试', {
    '控件包含自身': function () {
        var common = ecui.get('common');
        value_of(common.contain(common)).should_be_true();
    },

    '父控件包含子控件': function () {
        var common = ecui.get('common'),
            child = ecui.get('child');
        value_of(common.contain(child)).should_be_true();
    },

    '子控件不包含父控件': function () {
        var common = ecui.get('common'),
            child = ecui.get('child');
        value_of(child.contain(common)).should_be_false();
    }
});

test('disable/enable/isDisabled', {
    '控件失效，事件不可用': function () {
        var common = ecui.get('common'),
            el = common.getMain(),
            result = [];

        common.onmousemove = function () {
            result.push('mousemove');
        };

        common.onmousedown = function () {
            result.push('mousedown');
        };

        common.onmouseup = function () {
            result.push('mouseup');
        };

        common.onclick = function () {
            result.push('click');
        };

        common.disable();
        uiut.MockEvents.mousemove(el);
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(result).should_be([]);
        value_of(baidu.dom.hasClass(el, 'demo-disabled')).should_be_true();

        common.enable();
        uiut.MockEvents.mousemove(el);
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(result).should_be(['mousemove', 'mousedown', 'mouseup', 'click']);
        value_of(baidu.dom.hasClass(el, 'demo-disabled')).should_be_false();
    },

    '控件失效，子控件自动失效': function () {
        var common = ecui.get('common'),
            child = ecui.get('child'),
            el = child.getMain(),
            result = [];

        common.onmousemove = function () {
            result.push('mousemove');
        };

        common.onmousedown = function () {
            result.push('mousedown');
        };

        common.onmouseup = function () {
            result.push('mouseup');
        };

        common.onclick = function () {
            result.push('click');
        };

        common.disable();
        uiut.MockEvents.mousemove(el);
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(child.isDisabled()).should_be_true();
        value_of(result).should_be([]);
        value_of(baidu.dom.hasClass(el, 'child-disabled')).should_be_false();

        common.enable();
        uiut.MockEvents.mousemove(el);
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(child.isDisabled()).should_be_false();
        value_of(result).should_be(['mousemove', 'mousedown', 'mouseup', 'click']);
    },

    '控件失效，自动释放状态': function () {
        var common = ecui.get('common'),
            el = common.getMain();

        uiut.MockEvents.mouseover(el);
        uiut.MockEvents.mousedown(el);
        value_of(ecui.getActived()).should_be(common);
        value_of(ecui.getFocused()).should_be(common);
        value_of(ecui.getHovered()).should_be(common);
        value_of(common.isDisabled()).should_be_false();

        common.disable();
        value_of(ecui.getActived()).should_be(null);
        value_of(ecui.getFocused()).should_be(null);
        value_of(ecui.getHovered()).should_be(null);
        value_of(common.isDisabled()).should_be_true();

        uiut.MockEvents.mouseup(el);
    }
});

test('getBodyWidth/getBodyHeight/getWidth/getHeight', {
    '宽度与高度计算': function () {
        var el = document.createElement('div');
        el.style.cssText = 'border:1px solid;padding:2px;height:100px;display:block';
        var control = ecui.create(ecui.ui.Control, {parent: baidu.dom.g('inner'), main: el});
        value_of(control.getBodyHeight()).should_be(ecui.isContentBox() ? 100 : 94);
        value_of(control.getBodyWidth()).should_be(394);
        value_of(control.getHeight()).should_be(ecui.isContentBox() ? 106 : 100);
        value_of(control.getWidth()).should_be(400);
    }
});

test('getClass/getPrimary/getTypes/setClass', {
    '控件初始化后的样式': function () {
        var common = ecui.get('common'),
            parent = ecui.get('parent'),
            control = ecui.create(ecui.ui.Control, {primary: 'demo2', types: 'ec-demo2', parent: common});
        value_of(common.getPrimary()).should_be('demo');
        value_of(parent.getPrimary()).should_be('parent');
        value_of(control.getPrimary()).should_be('demo2');
        value_of(common.getClass()).should_be('demo');
        value_of(parent.getClass()).should_be('parent');
        value_of(control.getClass()).should_be('demo2');
        value_of(common.getTypes()).should_be([]);
        value_of(parent.getTypes()).should_be([]);
        value_of(control.getTypes()).should_be([]);
    },

    '改变控件的当前样式': function () {
        var common = ecui.get('common'),
            el = common.getMain();

        common.alterClass('+test');
        common.alterClass('+test2');
        common.setClass('custom');

        value_of(baidu.dom.hasClass(el, 'common')).should_be_true();
        value_of(baidu.dom.hasClass(el, 'custom')).should_be_true();
        value_of(baidu.dom.hasClass(el, 'custom-test')).should_be_true();
        value_of(baidu.dom.hasClass(el, 'custom-test2')).should_be_true();
        value_of(baidu.dom.hasClass(el, 'demo')).should_be_false();
        value_of(baidu.dom.hasClass(el, 'demo-test')).should_be_false();
        value_of(baidu.dom.hasClass(el, 'demo-test2')).should_be_false();

        common.alterClass('-test');
        value_of(baidu.dom.hasClass(el, 'common')).should_be_true();
        value_of(baidu.dom.hasClass(el, 'custom')).should_be_true();
        value_of(baidu.dom.hasClass(el, 'custom-test')).should_be_false();
        value_of(baidu.dom.hasClass(el, 'custom-test2')).should_be_true();
        value_of(baidu.dom.hasClass(el, 'demo')).should_be_false();
        value_of(baidu.dom.hasClass(el, 'demo-test')).should_be_false();
        value_of(baidu.dom.hasClass(el, 'demo-test2')).should_be_false();

        common.setClass('demo');
        value_of(baidu.dom.hasClass(el, 'common')).should_be_true();
        value_of(baidu.dom.hasClass(el, 'custom')).should_be_false();
        value_of(baidu.dom.hasClass(el, 'custom-test')).should_be_false();
        value_of(baidu.dom.hasClass(el, 'custom-test2')).should_be_false();
        value_of(baidu.dom.hasClass(el, 'demo')).should_be_true();
        value_of(baidu.dom.hasClass(el, 'demo-test')).should_be_false();
        value_of(baidu.dom.hasClass(el, 'demo-test2')).should_be_true();
    }
});

test('getContent/setContent', {
    '检测函数是否存在': function () {
        var el = document.createElement('div');
        el.style.cssText = 'border:1px solid;padding:2px;height:100px;display:block';
        el.innerHTML = '<font>Test</font>';
        var control = ecui.create(ecui.ui.Control, {parent: baidu.dom.g('inner'), main: el});
        value_of(el.getControl().getContent()).should_be('<font>Test</font>');
        el.getControl().setContent('Test');
        value_of(el.getControl().getContent()).should_be('Test');
    }
});

test('getX/getY/setPosition', {
    '设置控件的位置': function () {
        var el = document.createElement('div');
        el.style.cssText = 'border:1px solid;padding:2px;height:100px;display:block';
        var control = ecui.create(ecui.ui.Control, {parent: baidu.dom.g('inner'), main: el});
        ecui.get('child').$locate();
        control.setPosition(10, 20);
        value_of(control.getX()).should_be(3);
        value_of(control.getY()).should_be(3);
        el.style.position = 'absolute';
        value_of(control.getX()).should_be(10);
        value_of(control.getY()).should_be(20);
    }
});

test('isCapturable/isFocusable', {
    '不捕获浏览器事件': function () {
        var child = ecui.get('child'),
            el = baidu.dom.g('inner'),
            control = ecui.create(ecui.ui.Control, {main: el, capturable: false}),
            result = [];

        control.onclick = function () {
            result.push('control-click');
        };

        child.onclick = function () {
            result.push('child-click');
        };

        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(ecui.getFocused()).should_be(child);
        value_of(control.isCapturable()).should_be_false();
        value_of(result).should_be(['child-click']);
    },

    '不获取焦点': function () {
        var child = ecui.get('child'),
            el = document.createElement('div'),
            control = ecui.create(ecui.ui.Control, {parent: ecui.get('common'), main: el, focusable: false}),
            result = [];

        control.onclick = function () {
            result.push('control-click');
        };

        ecui.get('common').onclick = function () {
            result.push('common-click');
        };

        ecui.setFocused(child);
        uiut.MockEvents.mousedown(el);
        uiut.MockEvents.mouseup(el);
        value_of(control.isFocusable()).should_be_false();
        value_of(ecui.getFocused()).should_be(child);
        value_of(result).should_be(['control-click', 'common-click']);
    }
});
