/*
cities - 地区联动下拉框控件。
地区联动下拉框控件，继承自multilevel-select控件。

多级联动下拉框控件直接HTML初始化的例子:
省市二级联动：
<div ui="type:b-cities;mutli:2"></div>
省市区三级联动：
<div ui="type:cities"></div>
*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 初始化多级联动下拉框控件。
     * @public
     *
     * @param {object} options 初始化选项
     */
    ui.Cities = core.inherits(
        ui.Multilevel,
        'ui-cities',
        {
            /**
             * @override
             */
            $ready: function () {
                _super.$ready();
                this.setData(this.getResource(0));
            }
        },
        ui.iResource.declare('static/js/cities-data.js'),
        {
            /**
             * @override
             */
            $loadResource: function (text, url) {
                var cities = _class.$loadResource(text, url),
                    data = [{value: '000000', '#text': '全部省', children: [{value: '000000', '#text': '全部市', children: [{value: '000000', '#text': '全部区'}]}]}];

                for (var value in cities) {
                    if (cities.hasOwnProperty(value)) {
                        var province = +value.substring(0, 2),
                            city = +value.substring(2, 4),
                            area = +value.substring(4);

                        if (!data[province]) {
                            data[province] = {children: [{value: '000000', '#text': '全部市', children: [{value: '000000', '#text': '全部区'}]}]};
                        }
                        province = data[province];
                        if (!city && !area) {
                            province.value = value;
                            province['#text'] = cities[value];
                            continue;
                        }
                        if (!province.children[city]) {
                            province.children[city] = {children: [{value: '000000', '#text': '全部区'}]};
                        }
                        city = province.children[city];
                        if (!area) {
                            city.value = value;
                            city['#text'] = cities[value];
                            continue;
                        }
                        if (!city.children[area]) {
                            city.children[area] = {};
                        }
                        area = city.children[area];
                        area.value = value;
                        area['#text'] = cities[value];
                    }
                }

                util.removeAll(data, undefined);
                data.forEach(function (provinceItem) {
                    util.removeAll(provinceItem.children, undefined);
                    provinceItem.children.forEach(function (cityItem) {
                        util.removeAll(cityItem.children, undefined);
                    });
                });
                return data;
            }
        }
    );
})();
