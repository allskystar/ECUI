(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        util = core.util,
        ui = core.ui;
//{/if}//
    /**
     * 录入表单反显数据
     * @param {object}  data        回填的的数据
     * @param {form}    form        要回填的表格元素
     * @param {Boolean} isDefault   是否要设置为默认值
     */
    function setEditFormValue(data, form, isDefault) {
        var elements = form.elements;
        var control, ignore = [], arr_obj_ignore = [];
        for (var i = 0, item; item = elements[i++]; ) {
            var name = item.name;
            // 使用ecui.util.parseValue解析数据，处理ecui.esr.CreateObject创建的对象数据的参数回填
            var value = ecui.util.parseValue(name, data);
            if (name && value !== undefined) {
                // 将value转换成字符串，value 为 Array 和 Object 时不转换成字符串
                value = typeof value === 'object' ? value : value.toString();
                if (ignore.indexOf(name.split('.')[0]) === -1) {
                    var _control = item.getControl && item.getControl();
                    if (_control) {
                        if (_control instanceof ecui.ui.Radio) {

                            _control.setChecked(value === _control.getValue());
                        } else if (_control instanceof ecui.ui.Checkbox) {
                            if (value instanceof Array) {
                                _control.setChecked(value.indexOf(+_control.getValue()) !== -1);
                            } else {
                                // 当不是复选的时候 返回的不是数组,是string
                                _control.setChecked(value === _control.getValue());
                            }
                        } else if (_control instanceof ecui.esr.CreateArray) {
                            if (elements[name][1]) {
                                //  获取与ecui.esr.CreateArray控件的name相同第一个input元素
                                control = elements[name][1] && elements[name][1].getControl && elements[name][1].getControl();
                                // 如果CreateArray对应的表单元素是Checkbox时不将那么添加到ignore忽略数组中，否则添加到ignore忽略数组中忽略Array复杂数据结构处理
                                if (!(control instanceof ecui.ui.Checkbox)) {
                                    ignore.push(name);
                                }
                            }
                        } else if (_control instanceof ecui.esr.CreateObject) {
                            if (ignore.indexOf(name) !== -1) {
                                arr_obj_ignore.push(name);
                            }
                        } else {
                            _control.setValue(value);
                        }

                    } else {
                        item.value = value;
                    }
                // 对象数组 数据 不做任何处理 ecui.esr.CreateArray 和 ecui.esr.CreateObject 同时使用
                } else if (arr_obj_ignore.indexOf(name.split('.')[0]) === -1) {
                    // return;
                } else {
                    // ecui.esr.CreateArray数组回填时index减去ecui.esr.CreateArray本身input表单元素
                    value = ecui.util.parseValue(name, data);
                    value = value && value.length ? value[dom.toArray(elements[name]).indexOf(item) - 1] : '';
                    if (item.getControl) {
                        control = item.getControl();
                        if (!(control instanceof ecui.esr.CreateObject)) {
                            item.getControl().setValue(value);
                        }
                    } else {
                        item.value = value;
                    }
                }
            }

            if (isDefault && item.getControl && item.name) {
                item.getControl().saveToDefault();
            }
        }
    }

    /**
     * 搜索数据回填表单数据
     * context 数据和 searchParm 数据同时存在时，优先设置 context 数据为搜索数据
     * @param {object}  context        路由的上下文数据
     * @param {form}    form        要回填的表格元素
     * @param {object} searchParm   路由的搜索数据
     */
    function setFormValue(context, form, searchParm) {
        var elements = form.elements;
        for (var i = 0, item; item = elements[i++]; ) {
            var name = item.name;
            if (name) {
                if (context[name]) {
                    searchParm[name] = context[name];
                }
                var _control = item.getControl && item.getControl();
                if (_control) {
                    if (_control instanceof ecui.esr.CreateArray || _control instanceof ecui.esr.CreateObject) {
                        return;
                    } else if (_control instanceof ecui.ui.Radio) {
                        _control.setChecked(searchParm[name] === _control.getValue());
                    } else if (_control instanceof ecui.ui.Checkbox) {
                        _control.setChecked(searchParm[name].indexOf(_control.getValue()) !== -1);
                    } else {
                        _control.setValue(searchParm[name] || '');
                    }

                } else {
                    item.value = searchParm[name] || '';
                }
            }
        }
    }

    /**
     * 清空/重置 表单数据
     * @param {form}    form        要回填的表格元素
     */
    function resetFormValue(form) {
        var elements = form.elements;
        for (var i = 0, item; item = elements[i++]; ) {
            var name = item.name;
            if (name) {
                var _control = item.getControl && item.getControl();
                if (_control) {
                    if (_control instanceof ecui.ui.Radio) {
                        _control.setChecked(false);
                    } else if (_control instanceof ecui.ui.Checkbox) {
                        _control.setChecked(false);
                    } else if (_control instanceof ecui.esr.CreateArray || _control instanceof ecui.esr.CreateObject) {
                        // 如果是ecui.esr.CreateArray 和 ecui.esr.CreateObject元素，不做任何处理
                    } else {
                        _control.setValue('');
                    }
                } else {
                    if (!ecui.dom.hasClass(item, 'ui-hide')) {
                        item.value = '';
                    }
                }
            }
        }
    }

    /**
     * 通过 route.searchParam 缓存搜索 form 的数据
     * @param {object} searchParm   路由的搜索数据
     * @param {form}    form        要回填的表格元素
     */
    function setSearchParam(searchParm, form) {
        for (var i = 0, item; item = form.elements[i++]; ) {
            if (item.name) {
                var _control = item.getControl && item.getControl();
                if (_control) {
                    if (_control instanceof ecui.esr.CreateArray || _control instanceof ecui.esr.CreateObject) {
                        // 如果是ecui.esr.CreateArray 和 ecui.esr.CreateObject元素，不做任何处理
                    } else if (_control instanceof ecui.ui.Radio) {
                        if (Array.prototype.indexOf.call(form.elements[item.name], _control.getInput()) === 0) {
                            searchParm[item.name] = '';
                        }
                        if (_control.isChecked()) {
                            searchParm[item.name] = _control.getValue();
                        }
                    } else if (_control instanceof ecui.ui.Checkbox) {
                        if (Array.prototype.indexOf.call(form.elements[item.name], _control.getInput()) === 0) {
                            searchParm[item.name] = [];
                        }
                        if (_control.isChecked()) {
                            searchParm[item.name].push(_control.getValue());
                        }
                    } else {
                        searchParm[item.name] = _control.getValue();
                    }
                } else {
                    searchParm[item.name] = item.value;
                }
            }
        }
    }

    /**
     * 列表路由对象。
     * @public
     *
     * @param {object} route 路由对象
     */
    ui.BTableListRoute = function (route) {
        this.model = [route.NAME.slice(0, -5) + '@FORM ' + route.url];
        this.main = route.NAME.slice(0, -9) + '_table';
        Object.assign(this, route);
    };
    ui.BTableListRoute.prototype.onbeforerequest = function (context) {
        context.pageNo = context.pageNo || +this.searchParm.pageNo;
        context.pageSize = +this.searchParm.pageSize;
        var forms = this.model[0].split('?')[1].split('&');
        for (var i = 0, form, item; item = forms[i++]; ) {
            form = document.forms[item.split('=')[0]];
            if (item.split('=').length === 1 && form) {
                setFormValue(context, form, this.searchParm);
            }
        }
    };
    ui.BTableListRoute.prototype.onbeforerender = function (context) {
        var data = ecui.util.parseValue(this.model[0].split('@')[0], context);
        context.offset = data.offset;
        context.total = data.total;
        context.totalPage = data.totalPage;
    };
    ui.BTableListRoute.prototype.setEditFormValue = setEditFormValue;
    ui.BTableListRoute.prototype.setFormValue = setFormValue;
    ui.BTableListRoute.prototype.resetFormValue = resetFormValue;
    ui.BTableListRoute.prototype.setSearchParam = setSearchParam;
}());
