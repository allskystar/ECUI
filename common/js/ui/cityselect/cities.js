/*
cities - 地区联动下拉框控件。
地区联动下拉框控件，继承自multilevel-select控件。

多级联动下拉框控件直接HTML初始化的例子:
省市二级联动：
<div ui="type:cities;mutli:2"></div>
省市区三级联动：
<div ui="type:cities;multi:3"></div>

*/
(function () {
    var core = ecui,
        ui = core.ui;

    function getCITYS(type) {
        var code,
            key,
            key2,
            citys,
            area,
            item,
            item2,
            PROVINCE = {},
            CITY = {},
            AREA = {};
        for (code in daikuan.cities) {
            if (code.slice(2) == '0000') {
                PROVINCE[code] = daikuan.cities[code];
            } else if (code.slice(4) == '00') {
                if (!CITY[code.slice(0, 2) + '0000']) {
                    CITY[code.slice(0, 2) + '0000'] = {};
                }
                CITY[code.slice(0, 2) + '0000'][code] = daikuan.cities[code];
            } else {
                if (!AREA[code.slice(0, 4) + '00']) {
                    AREA[code.slice(0, 4) + '00'] = {};
                }
                AREA[code.slice(0, 4) + '00'][code] = daikuan.cities[code];
            }
        }
        // debugger
        var CITYS = [{
                code: '全部省',
                value: '000000',
                children: [{
                    code: '全部市',
                    value: '000000',
                    children: [{
                        code: '全部区',
                        value: '000000'
                    }]
                }]
            }];
        for (code in  PROVINCE) {
            citys = {
                value: code,
                code: PROVINCE[code],
                children: [{
                    value: '000000',
                    code: '全部市',
                    children: [{
                        code: '全部区',
                        value: '000000'
                    }]
                }]
            };
            item = CITY[code];
            for (key in item) {
                if (type === '3') {
                    area = {
                        value: key,
                        code: item[key],
                        children: [{
                            value: '000000',
                            code: '全部区'
                        }]
                    };
                    item2 = AREA[key];
                    for (key2 in item2) {
                        area.children.push({
                            value: key2,
                            code: item2[key2]
                        });
                    }
                    if (area.children.length <= 0) {
                        delete area.children;
                    }
                    citys.children.push(area);
                } else if (type === '2') {
                    citys.children.push({
                        value: key,
                        code: item[key]
                    });
                }
            }
            if (citys.children.length <= 0) {
                delete citys.children;
            }
            CITYS.push(citys);
        }
        return CITYS;
    }
    /**
     * 初始化多级联动下拉框控件。
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.Cities = core.inherits(
        ui.MultilevelSelect,
        'ui-cities',
        function (el, options) {
            if (options.value === null || options.value === undefined) {
                options.value = '';
            }
            var pClass = options.primary ? options.primary + '-province' : 'province',
                cClass = options.primary ? options.primary + '-city' : 'city',
                aClass = options.primary ? options.primary + '-area' : 'area';
            el.innerHTML = '<select class="' + pClass + '"></select><select class="' + cClass + '"></select>' + (options.multi === '3' ? '<select class="' + aClass + '"></select>' : '')  + '<input name="' + (options.name || '') + '" class="ui-hide">';
            var _this = this;
            this._eInput = ecui.dom.last(el);
            this._eInput.getControl = function () {
                return _this;
            };
            this._eInput.value = options.value;
            ui.MultilevelSelect.call(this, el, options);
        },
        {
            init: function (options) {
                ui.MultilevelSelect.prototype.init.call(this, options);
                this.setData(getCITYS(options.multi));
                var value = String(options.value);
                if (!options.value || options.value.length !== 6) {
                    value = '000000';
                }

                this.getSelect(0).setValue(value.slice(0, 2) + '0000');
                core.triggerEvent(this.getSelect(0), 'change');

                if (value.slice(2) === '0000') {
                    return;
                }
                this.getSelect(1).setValue(value.slice(0, 4) + '00');

                if (options.multi === '3') {
                    core.triggerEvent(this.getSelect(1), 'change');
                    this.getSelect(2).setValue(value.slice(4) !== '00' ? value : '000000');
                }
            },
            onchange: function (event) {
                if (!event.target) {
                    return;
                }
                var select = event.getControl().getParent();
                this._eInput.value = select.getValue();
                if (select === this.getSelect(0)) {
                    this.getSelect(1).setValue('000000');
                } else if (select === this.getSelect(1)) {
                    this.getSelect(2) && this.getSelect(2).setValue('000000');
                }
            },
            getValue: function () {
                return this._eInput.value === '000000' ? '' : this._eInput.value;
            },
            setValue: function (val) {
                if (+val < 100000 || +val > 999999) {
                    val = '000000';
                }
                val = val + '';
                this._eInput.value = val;
                this.getSelect(0).setValue(val.slice(0, 2) + '0000');
                core.triggerEvent(this.getSelect(0), 'change');
                if (val.slice(2) === '0000') {
                    return;
                }
                this.getSelect(1).setValue(val.slice(0, 4) + '00');
                if (this.getSelect(2)) {
                    core.triggerEvent(this.getSelect(1), 'change');
                    this.getSelect(2).setValue(val.slice(4) !== '00' ? val : '000000');
                }
            }
        }
    );
}());
