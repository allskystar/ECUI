describe('水平滚动条(HScrollbar)测试',{
    'before': function () {
        var el = document.createElement('div');
        el.id = 'hscrollbar';
        document.body.appendChild(el);
        ecui.create('HScrollbar', {id: 'hscrollbar', main: el}).setSize(200);
    },

    'after': function () {
        ecui.dispose(document.body);
        document.body.removeChild(document.getElementById('hscrollbar'));
    },

    '前后按钮基本属性': function () {
        var scrollbar = ecui.get('hscrollbar');
        value_of(scrollbar.$getSection('Prev').getWidth()).should_be(15);
        value_of(scrollbar.$getSection('Next').getWidth()).should_be(15);
    },

    '点击前后按钮': function () {
        function delayNext() {
            value_of(scrollbar.getValue() > value).should_be_true();
            value = scrollbar.getValue();
            uiut.MockEvents.mouseout(next, {clientX: 300, clientY: 300});
            uiut.MockEvents.mouseover(document.body, {clientX: 300, clientY: 300});
            this.wait(delayNext2, 500);
        }

        function delayNext2() {
            value_of(scrollbar.getValue()).should_be(value);
            uiut.MockEvents.mouseout(document.body, {clientX: 195, clientY: 5});
            uiut.MockEvents.mouseover(next, {clientX: 195, clientY: 5});
            this.wait(delayNext3, 500);
        }

        function delayNext3() {
            value_of(scrollbar.getValue() > value).should_be_true();
            value = scrollbar.getValue();
            uiut.MockEvents.mouseup(next);
            uiut.MockEvents.mousedown(prev, {clientX: 5, clientY: 5});
            this.wait(delayPrev, 500);
        }

        function delayPrev() {
            value_of(scrollbar.getValue() < value).should_be_true();
            value = scrollbar.getValue();
            uiut.MockEvents.mouseout(next, {clientX: 300, clientY: 300});
            uiut.MockEvents.mouseover(document.body, {clientX: 300, clientY: 300});
            this.wait(delayPrev2, 500);
        }

        function delayPrev2() {
            value_of(scrollbar.getValue()).should_be(value);
            uiut.MockEvents.mouseout(document.body, {clientX: 5, clientY: 5});
            uiut.MockEvents.mouseover(next, {clientX: 5, clientY: 5});
            this.wait(delayPrev3, 500);
        }

        function delayPrev3() {
            value_of(scrollbar.getValue() < value).should_be_true();
            uiut.MockEvents.mouseup(prev);
        }

        var scrollbar = ecui.get('hscrollbar'),
            prev = scrollbar.$getSection('Prev').getMain(),
            next = scrollbar.$getSection('Next').getMain(),
            value = scrollbar.getValue();

        scrollbar.setStep(40);
        scrollbar.setTotal(500);
        uiut.MockEvents.mouseover(next, {clientX: 195, clientY: 5});
        uiut.MockEvents.mousedown(next, {clientX: 195, clientY: 5});
        this.wait(delayNext, 500);
    },

    '点击前后空白区域(翻页)': function () {
        function delayNext() {
            value_of(scrollbar.getValue() > value).should_be_true();
            value_of(scrollbar.getValue()).should_not_be(500);
            value = scrollbar.getValue();
            this.wait(delayNext2, 500);
        }

        function delayNext2() {
            value_of(scrollbar.getValue()).should_be(value);
            uiut.MockEvents.mouseout(el, {clientX: 180, clientY: 30});
            uiut.MockEvents.mouseover(document.body, {clientX: 180, clientY: 30});
            this.wait(delayNext3, 500);
        }

        function delayNext3() {
            value_of(scrollbar.getValue()).should_be(value);
            uiut.MockEvents.mouseout(document.body, {clientX: 180, clientY: 5});
            uiut.MockEvents.mouseover(el, {clientX: 180, clientY: 5});
            this.wait(delayNext4, 500);
        }

        function delayNext4() {
            value_of(scrollbar.getValue()).should_be(500);
            value = 500;
            uiut.MockEvents.mouseup(el);
            uiut.MockEvents.mousedown(el, {clientX: 100, clientY: 5});
            this.wait(delayPrev, 500);
        }

        function delayPrev() {
            value_of(scrollbar.getValue() < value).should_be_true();
            value_of(scrollbar.getValue()).should_not_be(0);
            value = scrollbar.getValue();
            this.wait(delayPrev2, 500);
        }

        function delayPrev2() {
            value_of(scrollbar.getValue()).should_be(value);
            uiut.MockEvents.mouseout(el, {clientX: 20, clientY: 30});
            uiut.MockEvents.mouseover(document.body, {clientX: 20, clientY: 30});
            this.wait(delayPrev3, 500);
        }

        function delayPrev3() {
            value_of(scrollbar.getValue()).should_be(value);
            uiut.MockEvents.mouseout(document.body, {clientX: 20, clientY: 5});
            uiut.MockEvents.mouseover(el, {clientX: 20, clientY: 5});
            this.wait(delayPrev4, 500);
        }

        function delayPrev4() {
            value_of(scrollbar.getValue()).should_be(0);
            uiut.MockEvents.mouseup(el);
        }

        var scrollbar = ecui.get('hscrollbar'),
            el = scrollbar.getMain(),
            value = scrollbar.getValue();

        scrollbar.setTotal(500);
        uiut.MockEvents.mouseover(el, {clientX: 100, clientY: 5});
        uiut.MockEvents.mousedown(el, {clientX: 100, clientY: 5});
        this.wait(delayNext, 500);
    },

    '拖拽滑动块': function () {
        var scrollbar = ecui.get('hscrollbar'),
            thumb = scrollbar.$getSection('Thumb'),
            el = thumb.getMain(),
            value = scrollbar.getValue();

        scrollbar.setTotal(500);
        uiut.MockEvents.mousedown(el, {clientX: 20, clientY: 5});
        value_of(scrollbar.getValue()).should_be(0);
        uiut.MockEvents.mousemove(el, {clientX: 200, clientY: 50});
        value_of(scrollbar.getValue()).should_be(500);
        value_of(thumb.getY()).should_be(0);
        uiut.MockEvents.mousemove(el, {clientX: 180, clientY: 5});
        value_of(scrollbar.getValue()).should_be(500);
        uiut.MockEvents.mousemove(el, {clientX: 5, clientY: 5});
        value_of(scrollbar.getValue()).should_be(0);
        uiut.MockEvents.mouseup(el);
    }
});

describe('垂直滚动条(VScrollbar)测试',{
    'before': function () {
        var el = document.createElement('div');
        el.id = 'vscrollbar';
        document.body.appendChild(el);
        ecui.create('VScrollbar', {id: 'vscrollbar', main: el}).setSize(0, 200);
    },

    'after': function () {
        ecui.dispose(document.body);
        document.body.removeChild(document.getElementById('vscrollbar'));
    },

    '前后按钮基本属性': function () {
        var scrollbar = ecui.get('vscrollbar');
        value_of(scrollbar.$getSection('Prev').getHeight()).should_be(15);
        value_of(scrollbar.$getSection('Next').getHeight()).should_be(15);
    },

    '点击前后按钮': function () {
        function delayNext() {
            value_of(scrollbar.getValue() > value).should_be_true();
            value = scrollbar.getValue();
            uiut.MockEvents.mouseout(next, {clientX: 300, clientY: 300});
            uiut.MockEvents.mouseover(document.body, {clientX: 300, clientY: 300});
            this.wait(delayNext2, 500);
        }

        function delayNext2() {
            value_of(scrollbar.getValue()).should_be(value);
            uiut.MockEvents.mouseout(document.body, {clientX: 5, clientY: 195});
            uiut.MockEvents.mouseover(next, {clientX: 5, clientY: 195});
            this.wait(delayNext3, 500);
        }

        function delayNext3() {
            value_of(scrollbar.getValue() > value).should_be_true();
            value = scrollbar.getValue();
            uiut.MockEvents.mouseup(next);
            uiut.MockEvents.mousedown(prev, {clientX: 5, clientY: 5});
            this.wait(delayPrev, 500);
        }

        function delayPrev() {
            value_of(scrollbar.getValue() < value).should_be_true();
            value = scrollbar.getValue();
            uiut.MockEvents.mouseout(next, {clientX: 300, clientY: 300});
            uiut.MockEvents.mouseover(document.body, {clientX: 300, clientY: 300});
            this.wait(delayPrev2, 500);
        }

        function delayPrev2() {
            value_of(scrollbar.getValue()).should_be(value);
            uiut.MockEvents.mouseout(document.body, {clientX: 5, clientY: 5});
            uiut.MockEvents.mouseover(next, {clientX: 5, clientY: 5});
            this.wait(delayPrev3, 500);
        }

        function delayPrev3() {
            value_of(scrollbar.getValue() < value).should_be_true();
            uiut.MockEvents.mouseup(prev);
        }

        var scrollbar = ecui.get('vscrollbar'),
            prev = scrollbar.$getSection('Prev').getMain(),
            next = scrollbar.$getSection('Next').getMain(),
            value = scrollbar.getValue();
        scrollbar.setStep(40);
        scrollbar.setTotal(500);
        uiut.MockEvents.mouseover(next, {clientX: 5, clientY: 195});
        uiut.MockEvents.mousedown(next, {clientX: 5, clientY: 195});
        this.wait(delayNext, 500);
    },

    '点击前后空白区域(翻页)': function () {
        function delayNext() {
            value_of(scrollbar.getValue() > value).should_be_true();
            value_of(scrollbar.getValue()).should_not_be(500);
            value = scrollbar.getValue();
            this.wait(delayNext2, 500);
        }

        function delayNext2() {
            value_of(scrollbar.getValue()).should_be(value);
            uiut.MockEvents.mouseout(el, {clientX: 30, clientY: 180});
            uiut.MockEvents.mouseover(document.body, {clientX: 30, clientY: 180});
            this.wait(delayNext3, 500);
        }

        function delayNext3() {
            value_of(scrollbar.getValue()).should_be(value);
            uiut.MockEvents.mouseout(document.body, {clientX: 5, clientY: 180});
            uiut.MockEvents.mouseover(el, {clientX: 5, clientY: 180});
            this.wait(delayNext4, 500);
        }

        function delayNext4() {
            value_of(scrollbar.getValue()).should_be(500);
            value = 500;
            uiut.MockEvents.mouseup(el);
            uiut.MockEvents.mousedown(el, {clientX: 5, clientY: 100});
            this.wait(delayPrev, 500);
        }

        function delayPrev() {
            value_of(scrollbar.getValue() < value).should_be_true();
            value_of(scrollbar.getValue()).should_not_be(0);
            value = scrollbar.getValue();
            this.wait(delayPrev2, 500);
        }

        function delayPrev2() {
            value_of(scrollbar.getValue()).should_be(value);
            uiut.MockEvents.mouseout(el, {clientX: 30, clientY: 20});
            uiut.MockEvents.mouseover(document.body, {clientX: 30, clientY: 20});
            this.wait(delayPrev3, 500);
        }

        function delayPrev3() {
            value_of(scrollbar.getValue()).should_be(value);
            uiut.MockEvents.mouseout(document.body, {clientX: 5, clientY: 20});
            uiut.MockEvents.mouseover(el, {clientX: 5, clientY: 20});
            this.wait(delayPrev4, 500);
        }

        function delayPrev4() {
            value_of(scrollbar.getValue()).should_be(0);
            uiut.MockEvents.mouseup(el);
        }

        var scrollbar = ecui.get('vscrollbar'),
            el = scrollbar.getMain(),
            value = scrollbar.getValue();

        scrollbar.setTotal(500);
        uiut.MockEvents.mouseover(el, {clientX: 5, clientY: 100});
        uiut.MockEvents.mousedown(el, {clientX: 5, clientY: 100});
        this.wait(delayNext, 500);
    },

    '拖拽滑动块': function () {
        var scrollbar = ecui.get('vscrollbar'),
            thumb = scrollbar.$getSection('Thumb'),
            el = thumb.getMain(),
            value = scrollbar.getValue();

        scrollbar.setTotal(500);
        uiut.MockEvents.mousedown(el, {clientX: 5, clientY: 20});
        value_of(scrollbar.getValue()).should_be(0);
        uiut.MockEvents.mousemove(el, {clientX: 50, clientY: 200});
        value_of(scrollbar.getValue()).should_be(500);
        value_of(thumb.getX()).should_be(0);
        uiut.MockEvents.mousemove(el, {clientX: 5, clientY: 180});
        value_of(scrollbar.getValue()).should_be(500);
        uiut.MockEvents.mousemove(el, {clientX: 5, clientY: 5});
        value_of(scrollbar.getValue()).should_be(0);
        uiut.MockEvents.mouseup(el);
    }
});
