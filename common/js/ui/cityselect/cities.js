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
        var CITYS = [];
        for (code in  PROVINCE) {
            citys = {
                value: code,
                code: PROVINCE[code],
                children: []
            };
            item = CITY[code];
            for (key in item) {
                if (type === '3') {
                    area = {
                        value: key,
                        code: item[key],
                        children: []
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
    function provinceChange() {
        this.getParent().getSelect(1).setValue(this.getValue());
    }
    function cityChange() {
        this.getParent().getSelect(2).setValue(this.getValue());
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
            el.innerHTML = options.multi == '3' ? '<select></select><select></select><select name="' + options.name + '"></select>' : '<select></select><select name="' + options.name + '"></select>';
            ui.MultilevelSelect.call(this, el, options);
        },
        {
            $ready: function (options) {
                ui.MultilevelSelect.prototype.$ready.call(this, options);
                var province = this.getSelect(0);
                var city = this.getSelect(1);
                this.setData(getCITYS(options.multi));
                if (options.value && options.value != '' && options.value != '0') {
                    province.setValue(options.value.slice(0, 2) + '0000');
                    core.triggerEvent(province, 'change');
                    core.addEventListener(province, 'change', provinceChange);
                    this.getSelect(1).setValue(options.value.slice(0, 4) + '00');
                    if (options.multi == '3') {
                        core.triggerEvent(city, 'change');
                        core.addEventListener(city, 'change', cityChange);
                        this.getSelect(2).setValue(options.value);
                    }
                }
            },
            setValue: function (val) {
                this.getSelect(0).setValue(val.slice(0, 2) + '0000');
                core.triggerEvent(this.getSelect(0), 'change');
                this.getSelect(1).setValue(val.slice(0, 4) + '00');
                if (this.getSelect(2)) {
                    core.triggerEvent(this.getSelect(1), 'change');
                    this.getSelect(2).setValue(val);
                }
            }
        }
    );
}());
