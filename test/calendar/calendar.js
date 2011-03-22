describe('日历控件初始化测试', {
    '默认参数': function () {
        var ctrl = ecui.create('Calendar');

        value_of(ctrl.getYear()).should_be(new Date().getFullYear());
        value_of(ctrl.getMonth()).should_be(new Date().getMonth() + 1);

        ecui.dispose(ctrl);
    },

    '指定年月参数': function () {
        var ctrl = ecui.create('Calendar', {year: 2008, month: 11});

        value_of(ctrl.getYear()).should_be(2008);
        value_of(ctrl.getMonth()).should_be(11);

        ecui.dispose(ctrl);
    }
});

describe('日历控件功能测试', {
    'before': function () {
        ecui.create('Calendar', {id: 'calendar', parent: document.body});
    },

    'after': function () {
        var ctrl = ecui.get('calendar');
        ctrl.setParent();
        ecui.dispose(ctrl);
    },

    '设置日期(getMonth/getYear/setDate)': function () {
        var ctrl = ecui.get('calendar'),
            data201002 = [
                '31', false, '1', true, '2', true, '3', true, '4', true, '5', true, '6', true,
                '7', true, '8', true, '9', true, '10', true, '11', true, '12', true, '13', true,
                '14', true, '15', true, '16', true, '17', true, '18', true, '19', true, '20', true,
                '21', true, '22', true, '23', true, '24', true, '25', true, '26', true, '27', true,
                '28', true, '1', false, '2', false, '3', false, '4', false, '5', false, '6', false,
                '7', false, '8', false, '9', false, '10', false, '11', false, '12', false, '13', false
            ],
            data201008 = [
                '1', true, '2', true, '3', true, '4', true, '5', true, '6', true, '7', true,
                '8', true, '9', true, '10', true, '11', true, '12', true, '13', true, '14', true,
                '15', true, '16', true, '17', true, '18', true, '19', true, '20', true, '21', true,
                '22', true, '23', true, '24', true, '25', true, '26', true, '27', true, '28', true,
                '29', true, '30', true, '31', true, '1', false, '2', false, '3', false, '4', false,
                '5', false, '6', false, '7', false, '8', false, '9', false, '10', false, '11', false
            ];
        ctrl.setDate(2010, 2);

        value_of(ctrl.getYear()).should_be(2010);
        value_of(ctrl.getMonth()).should_be(2);
        for (var i = 0; i < 42; i++) {
            var item = ctrl.$getSection('Date').getItem(i);
            value_of(item.getBody().innerHTML).should_be(data201002[i * 2]);
            value_of(item.isEnabled()).should_be(data201002[i * 2 + 1]);
        }

        ctrl.setDate(2010, 8);
        for (var i = 0; i < 42; i++) {
            var item = ctrl.$getSection('Date').getItem(i);
            value_of(item.getBody().innerHTML).should_be(data201008[i * 2]);
            value_of(item.isEnabled()).should_be(data201008[i * 2 + 1]);
        }
    },

    '月份移动(move)': function () {
        var ctrl = ecui.get('calendar');
        ctrl.setDate(2010, 1);

        ctrl.move(-14);
        value_of(ctrl.getYear()).should_be(2008);
        value_of(ctrl.getMonth()).should_be(11);

        ctrl.move(11);
        value_of(ctrl.getYear()).should_be(2009);
        value_of(ctrl.getMonth()).should_be(10);
    },

    '点击事件': function () {
        var ctrl = ecui.get('calendar'),
            date = ctrl.$getSection('Date'),
            result = [];
        ctrl.setDate(2010, 2); 
        ctrl.ondateclick = function (event, date) {
            result.push(date.getFullYear());
            result.push(date.getMonth() + 1);
            result.push(date.getDate());
        }

        uiut.MockEvents.mousedown(date.getItem(0).getBase());
        uiut.MockEvents.mouseup(date.getItem(0).getBase());
        uiut.MockEvents.mousedown(date.getItem(1).getBase());
        uiut.MockEvents.mouseup(date.getItem(1).getBase());
        value_of(result).should_be([2010, 2, 1]);
    }
});
