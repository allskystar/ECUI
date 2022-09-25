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
        function (el, options) {
            // if (options.value === null || options.value === undefined) {
            //     options.value = '';
            // }
            // var pClass = options.primary ? options.primary + '-province' : 'province',
            //     cClass = options.primary ? options.primary + '-city' : 'city',
            //     aClass = options.primary ? options.primary + '-area' : 'area',
            //     optionSize = options.optionSize || 10;
            // el.innerHTML = '<select class="' + pClass + '" ui="optionSize:' + optionSize + '"></select><select class="' + cClass + '"   ui="optionSize:' + optionSize + '"></select>' + (options.multi === '3' ? '<select class="' + aClass + '" ui="optionSize:' + optionSize + '"></select>' : '')  + '<input name="' + (options.name || '') + '" class="ui-hide">';

            // this._eInput = ecui.dom.last(el);
            // this._eInput.value = options.value;
            ui.Multilevel.call(this, el, options);
        },
        {
            $ready: function () {
                ui.Multilevel.prototype.$ready.call(this);
                this.setData(this.getResource('ecui/cities-data.js'));
            }
        },
        ui.Resource.declare('ecui/cities-data.js'),
        {
            $loadResource: function (text, url) {
                var cities = ui.Resource.Methods.$loadResource(text, url),
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

                util.remove(data, undefined);
                data.forEach(function (provinceItem) {
                    util.remove(provinceItem.children, undefined);
                    provinceItem.children.forEach(function (cityItem) {
                        util.remove(cityItem.children, undefined);
                    });
                });
                return data;
            }
        }
    );
})();
