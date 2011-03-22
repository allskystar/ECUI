describe('水平滚动条(HScroll)测试',{
    'before': function () {
        var el = document.createElement('div');
        el.id = 'hscroll';
        document.body.appendChild(el);
        ecui.create('HScroll', {id: 'hscroll', element: el}).setSize(200);
    },

    'after': function () {
        ecui.setFocused();
        ecui.dispose(ecui.get('hscroll'));
        document.body.removeChild(document.getElementById('hscroll'));
        var result = ecui.query({type: ecui.ui.Control});
        value_of(!result.len || (result.len == 1 && result[0].getBase() == 'ec-selector')).should_be_true();
    },

    '前后按钮基本属性': function () {
        var scroll = ecui.get('hscroll');
        value_of(scroll.$getSection('Prev').getWidth()).should_be(15);
        value_of(scroll.$getSection('Next').getWidth()).should_be(15);
    },

    '点击前后按钮': function () {
        function delayNext() {
            value_of(scroll.getValue() > value).should_be_true();
            value = scroll.getValue();
            uiut.MockEvents.mouseout(next, {clientX: 300, clientY: 300});
            uiut.MockEvents.mouseover(document.body, {clientX: 300, clientY: 300});
            this.wait(delayNext2, 500);
        }

        function delayNext2() {
            value_of(scroll.getValue()).should_be(value);
            uiut.MockEvents.mouseout(document.body, {clientX: 195, clientY: 5});
            uiut.MockEvents.mouseover(next, {clientX: 195, clientY: 5});
            this.wait(delayNext3, 500);
        }

        function delayNext3() {
            value_of(scroll.getValue() > value).should_be_true();
            value = scroll.getValue();
            uiut.MockEvents.mouseup(next);
            uiut.MockEvents.mousedown(prev, {clientX: 5, clientY: 5});
            this.wait(delayPrev, 500);
        }

        function delayPrev() {
            value_of(scroll.getValue() < value).should_be_true();
            value = scroll.getValue();
            uiut.MockEvents.mouseout(next, {clientX: 300, clientY: 300});
            uiut.MockEvents.mouseover(document.body, {clientX: 300, clientY: 300});
            this.wait(delayPrev2, 500);
        }

        function delayPrev2() {
            value_of(scroll.getValue()).should_be(value);
            uiut.MockEvents.mouseout(document.body, {clientX: 5, clientY: 5});
            uiut.MockEvents.mouseover(next, {clientX: 5, clientY: 5});
            this.wait(delayPrev3, 500);
        }

        function delayPrev3() {
            value_of(scroll.getValue() < value).should_be_true();
            uiut.MockEvents.mouseup(prev);
        }

        var scroll = ecui.get('hscroll'),
            prev = scroll.$getSection('Prev').getBase(),
            next = scroll.$getSection('Next').getBase(),
            value = scroll.getValue();

        scroll.setStep(40);
        scroll.setTotal(500);
        uiut.MockEvents.mouseover(next, {clientX: 195, clientY: 5});
        uiut.MockEvents.mousedown(next, {clientX: 195, clientY: 5});
        this.wait(delayNext, 500);
    },

    '点击前后空白区域(翻页)': function () {
        function delayNext() {
            value_of(scroll.getValue() > value).should_be_true();
            value_of(scroll.getValue()).should_not_be(500);
            value = scroll.getValue();
            this.wait(delayNext2, 500);
        }

        function delayNext2() {
            value_of(scroll.getValue()).should_be(value);
            uiut.MockEvents.mouseout(el, {clientX: 180, clientY: 30});
            uiut.MockEvents.mouseover(document.body, {clientX: 180, clientY: 30});
            this.wait(delayNext3, 500);
        }

        function delayNext3() {
            value_of(scroll.getValue()).should_be(value);
            uiut.MockEvents.mouseout(document.body, {clientX: 180, clientY: 5});
            uiut.MockEvents.mouseover(el, {clientX: 180, clientY: 5});
            this.wait(delayNext4, 500);
        }

        function delayNext4() {
            value_of(scroll.getValue()).should_be(500);
            value = 500;
            uiut.MockEvents.mouseup(el);
            uiut.MockEvents.mousedown(el, {clientX: 100, clientY: 5});
            this.wait(delayPrev, 500);
        }

        function delayPrev() {
            value_of(scroll.getValue() < value).should_be_true();
            value_of(scroll.getValue()).should_not_be(0);
            value = scroll.getValue();
            this.wait(delayPrev2, 500);
        }

        function delayPrev2() {
            value_of(scroll.getValue()).should_be(value);
            uiut.MockEvents.mouseout(el, {clientX: 20, clientY: 30});
            uiut.MockEvents.mouseover(document.body, {clientX: 20, clientY: 30});
            this.wait(delayPrev3, 500);
        }

        function delayPrev3() {
            value_of(scroll.getValue()).should_be(value);
            uiut.MockEvents.mouseout(document.body, {clientX: 20, clientY: 5});
            uiut.MockEvents.mouseover(el, {clientX: 20, clientY: 5});
            this.wait(delayPrev4, 500);
        }

        function delayPrev4() {
            value_of(scroll.getValue()).should_be(0);
            uiut.MockEvents.mouseup(el);
        }

        var scroll = ecui.get('hscroll'),
            el = scroll.getBase(),
            value = scroll.getValue();

        scroll.setTotal(500);
        uiut.MockEvents.mouseover(el, {clientX: 100, clientY: 5});
        uiut.MockEvents.mousedown(el, {clientX: 100, clientY: 5});
        this.wait(delayNext, 500);
    },

    '拖拽滑动块': function () {
        var scroll = ecui.get('hscroll'),
            block = scroll.$getSection('Block'),
            el = block.getBase(),
            value = scroll.getValue();

        scroll.setTotal(500);
        uiut.MockEvents.mousedown(el, {clientX: 20, clientY: 5});
        value_of(scroll.getValue()).should_be(0);
        uiut.MockEvents.mousemove(el, {clientX: 200, clientY: 50});
        value_of(scroll.getValue()).should_be(500);
        value_of(block.getY()).should_be(0);
        uiut.MockEvents.mousemove(el, {clientX: 180, clientY: 5});
        value_of(scroll.getValue()).should_be(500);
        uiut.MockEvents.mousemove(el, {clientX: 5, clientY: 5});
        value_of(scroll.getValue()).should_be(0);
        uiut.MockEvents.mouseup(el);
    }
});

describe('垂直滚动条(VScroll)测试',{
    'before': function () {
        var el = document.createElement('div');
        el.id = 'vscroll';
        document.body.appendChild(el);
        ecui.create('VScroll', {id: 'vscroll', element: el}).setSize(0, 200);
    },

    'after': function () {
        ecui.setFocused();
        ecui.dispose(ecui.get('vscroll'));
        document.body.removeChild(document.getElementById('vscroll'));
        var result = ecui.query({type: ecui.ui.Control});
        value_of(!result.len || (result.len == 1 && result[0].getBase() == 'ec-selector')).should_be_true();
    },

    '前后按钮基本属性': function () {
        var scroll = ecui.get('vscroll');
        value_of(scroll.$getSection('Prev').getHeight()).should_be(15);
        value_of(scroll.$getSection('Next').getHeight()).should_be(15);
    },

    '点击前后按钮': function () {
        function delayNext() {
            value_of(scroll.getValue() > value).should_be_true();
            value = scroll.getValue();
            uiut.MockEvents.mouseout(next, {clientX: 300, clientY: 300});
            uiut.MockEvents.mouseover(document.body, {clientX: 300, clientY: 300});
            this.wait(delayNext2, 500);
        }

        function delayNext2() {
            value_of(scroll.getValue()).should_be(value);
            uiut.MockEvents.mouseout(document.body, {clientX: 5, clientY: 195});
            uiut.MockEvents.mouseover(next, {clientX: 5, clientY: 195});
            this.wait(delayNext3, 500);
        }

        function delayNext3() {
            value_of(scroll.getValue() > value).should_be_true();
            value = scroll.getValue();
            uiut.MockEvents.mouseup(next);
            uiut.MockEvents.mousedown(prev, {clientX: 5, clientY: 5});
            this.wait(delayPrev, 500);
        }

        function delayPrev() {
            value_of(scroll.getValue() < value).should_be_true();
            value = scroll.getValue();
            uiut.MockEvents.mouseout(next, {clientX: 300, clientY: 300});
            uiut.MockEvents.mouseover(document.body, {clientX: 300, clientY: 300});
            this.wait(delayPrev2, 500);
        }

        function delayPrev2() {
            value_of(scroll.getValue()).should_be(value);
            uiut.MockEvents.mouseout(document.body, {clientX: 5, clientY: 5});
            uiut.MockEvents.mouseover(next, {clientX: 5, clientY: 5});
            this.wait(delayPrev3, 500);
        }

        function delayPrev3() {
            value_of(scroll.getValue() < value).should_be_true();
            uiut.MockEvents.mouseup(prev);
        }

        var scroll = ecui.get('vscroll'),
            prev = scroll.$getSection('Prev').getBase(),
            next = scroll.$getSection('Next').getBase(),
            value = scroll.getValue();
        scroll.setStep(40);
        scroll.setTotal(500);
        uiut.MockEvents.mouseover(next, {clientX: 5, clientY: 195});
        uiut.MockEvents.mousedown(next, {clientX: 5, clientY: 195});
        this.wait(delayNext, 500);
    },

    '点击前后空白区域(翻页)': function () {
        function delayNext() {
            value_of(scroll.getValue() > value).should_be_true();
            value_of(scroll.getValue()).should_not_be(500);
            value = scroll.getValue();
            this.wait(delayNext2, 500);
        }

        function delayNext2() {
            value_of(scroll.getValue()).should_be(value);
            uiut.MockEvents.mouseout(el, {clientX: 30, clientY: 180});
            uiut.MockEvents.mouseover(document.body, {clientX: 30, clientY: 180});
            this.wait(delayNext3, 500);
        }

        function delayNext3() {
            value_of(scroll.getValue()).should_be(value);
            uiut.MockEvents.mouseout(document.body, {clientX: 5, clientY: 180});
            uiut.MockEvents.mouseover(el, {clientX: 5, clientY: 180});
            this.wait(delayNext4, 500);
        }

        function delayNext4() {
            value_of(scroll.getValue()).should_be(500);
            value = 500;
            uiut.MockEvents.mouseup(el);
            uiut.MockEvents.mousedown(el, {clientX: 5, clientY: 100});
            this.wait(delayPrev, 500);
        }

        function delayPrev() {
            value_of(scroll.getValue() < value).should_be_true();
            value_of(scroll.getValue()).should_not_be(0);
            value = scroll.getValue();
            this.wait(delayPrev2, 500);
        }

        function delayPrev2() {
            value_of(scroll.getValue()).should_be(value);
            uiut.MockEvents.mouseout(el, {clientX: 30, clientY: 20});
            uiut.MockEvents.mouseover(document.body, {clientX: 30, clientY: 20});
            this.wait(delayPrev3, 500);
        }

        function delayPrev3() {
            value_of(scroll.getValue()).should_be(value);
            uiut.MockEvents.mouseout(document.body, {clientX: 5, clientY: 20});
            uiut.MockEvents.mouseover(el, {clientX: 5, clientY: 20});
            this.wait(delayPrev4, 500);
        }

        function delayPrev4() {
            value_of(scroll.getValue()).should_be(0);
            uiut.MockEvents.mouseup(el);
        }

        var scroll = ecui.get('vscroll'),
            el = scroll.getBase(),
            value = scroll.getValue();

        scroll.setTotal(500);
        uiut.MockEvents.mouseover(el, {clientX: 5, clientY: 100});
        uiut.MockEvents.mousedown(el, {clientX: 5, clientY: 100});
        this.wait(delayNext, 500);
    },

    '拖拽滑动块': function () {
        var scroll = ecui.get('vscroll'),
            block = scroll.$getSection('Block'),
            el = block.getBase(),
            value = scroll.getValue();

        scroll.setTotal(500);
        uiut.MockEvents.mousedown(el, {clientX: 5, clientY: 20});
        value_of(scroll.getValue()).should_be(0);
        uiut.MockEvents.mousemove(el, {clientX: 50, clientY: 200});
        value_of(scroll.getValue()).should_be(500);
        value_of(block.getX()).should_be(0);
        uiut.MockEvents.mousemove(el, {clientX: 5, clientY: 180});
        value_of(scroll.getValue()).should_be(500);
        uiut.MockEvents.mousemove(el, {clientX: 5, clientY: 5});
        value_of(scroll.getValue()).should_be(0);
        uiut.MockEvents.mouseup(el);
    }
});
