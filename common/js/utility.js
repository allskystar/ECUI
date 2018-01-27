(function () {
    //数据规则
    var urlRule = [
        {
            exp: /base\/series\/[\d]+/,
            def: {
                'value': 'id',
                'code': 'text'
            }
        },
        {
            exp: /base\/motorcycletype\/[\d]+/,
            def: {
                'value': 'id',
                'code': 'description'
            }
        }
    ];

    //统一对请求成功返回参数做分类
    ecui.esr.onparsedata = function (url, data) {
        if (url.indexOf('v1/base/series') >= 0) {
            data = data.data;
            var options = [];
            for (var i = 0; i < data.length; i++) {
                options.push({
                    value: '',
                    code: data[i].subbrand,
                    capturable: false,
                    primary: 'title'
                });
                for (var j = 0, list = data[i].serials; j < list.length; j++) {
                    options.push({
                        value: list[j].serialid,
                        code: list[j].serialname
                    });
                }
            }
            return options;
        }
        if (url.indexOf('v1/base/motorcycletype') >= 0) {
            data = data.data;
            options = [];
            for (i = 0; i < data.length; i++) {
                options.push({
                    value: '',
                    code: data[i].caryear,
                    capturable: false,
                    primary: 'title'
                });
                for (j = 0, list = data[i].carmodels; j < list.length; j++) {
                    options.push({
                        value: list[j].carid,
                        code: list[j].carname
                    });
                }
            }
            return options;
        }
        if (data.data.pageNo !== undefined && data.data.total === undefined &&  data.data.offset === undefined) {
            data.data.total = data.data.totalRecord;
            data.data.offset = data.data.pageSize * (data.data.pageNo - 1);
        }
        var code = data.code;
        if (0 === code) {
            data = data.data;
            //对数据进行统一化处理
            var rule = urlRule.filter(function (item) {
                    return item.exp.test(url);
                })[0];
            if (rule) {
                rule = rule.def;
                data.forEach(function (item) {
                    var tmpData = {};
                    for (var key in rule) {
                        tmpData[key] = item[key];
                        item[key] = tmpData[rule[key]] || item[rule[key]];
                    }
                });
            }
            return data;
        }
        if (code === 12011) {
            // 分支3.4：登录相关的错误
            window.location = './login.html';
        } else {
            if (code === 300000) {
                throw data.msg;
            }
            daikuan.showHint('error', data.msg);
        }
        return code;
    };
}());

ecui.ui.Select.prototype.TEXTNAME = 'code';

ecui.render = {};
ecui.render.select = function (data) {
    this.removeAll(true);
    this.add(data);
}

daikuan.cookie = {
    set: function(key, val, exp) {
        var cookie = key + '=' + val;
        if (exp) {
            cookie += ('; expires=' + exp.toGMTString());
        }
        document.cookie = cookie;
    },
    get: function(key) {
        var cookies = document.cookie.split('; ');
        var val = null;
        cookies.forEach(function(cookie) {
            cookie = cookie.split('=');
            if (cookie[0] === key) {
                val = cookie[1];
            }
        });
        return val;
    },
    del: function(key) {
        var d = new Date();
        d.setTime(d.getTime() - 1000000);
        var cookie = key + '="" ; expires=' + d.toGMTString();
        document.cookie = cookie;
    }
};

daikuan.util = {
    clone: function (obj) {
        var newobj = obj.constructor === Array ? [] : {};
        if (typeof obj !== 'object') {
            return;
        } else {
            for (var i in obj) {
                newobj[i] = typeof obj[i] === 'object' ? daikuan.util.clone(obj[i]) : obj[i];
            }
        }
        return newobj;
    }
};

daikuan.getCity = function(code, city_data) {
    if (code == 0) {
        return [' '];
    }
    code = code.toString();
    var pro = code.slice(0, 2) + '0000',
        city = code.slice(0, 4) + '00',
        area = code.slice(0, 6),
        arr = [];
    arr.push(city_data[pro]);
    (code.slice(2,4) != '00') && arr.push(city_data[city]);
    (code.slice(4,6) != '00') && arr.push(city_data[area]);
    return arr;
};

Date.prototype.pattern = function(fmt) {
    var o = {
        'M+': this.getMonth()+1, //月份
        'd+': this.getDate(), //日
        'h+': this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时
        'H+': this.getHours(), //小时
        'm+': this.getMinutes(), //分
        's+': this.getSeconds(), //秒
        'q+': Math.floor((this.getMonth()+3)/3), //季度
        'S': this.getMilliseconds() //毫秒
    };
    var week = ['日', '一', '二', '三', '四', '五', '六'];
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length > 2 ? '星期' : '周') : '') + week[this.getDay()]);
    }
    for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        }
    }
    return fmt;
};

// 弹出提示框
daikuan.showHint = function (type, msg) {
    var className = {
        success: 'successHint',
        error: 'errorHint',
        warn: 'warnHint'
    }[type];
    var hintContainer = ecui.$('hintContainer') || ecui.dom.create({id: 'hintContainer'});
    ecui.dom.removeClass(hintContainer, 'ui-hide');
    hintContainer.innerHTML = ecui.util.stringFormat('<div class="{0}">{1}</div>', className, msg);
    ecui.dom.insertAfter(hintContainer, ecui.dom.last(document.body));
    ecui.util.timer(function () {
        ecui.dom.addClass(hintContainer, 'ui-hide');
    }, 2000)
};

// 搜索数据回填表单数据
daikuan.setFormValue = function (context, form, searchParm) {
    var elements = form.elements;
    for (var i = 0, item; item = elements[i++]; ) {
        var name = item.name;
        if (name) {
            if (context[name]) {
                searchParm[name] = context[name];
            }
            var _control = item.getControl && item.getControl();
            if (_control) {
                _control.setValue(searchParm[name] || '');
            } else {
                form.elements[name].value = searchParm[name] || '';
            }
        }
    }
};

// 初始化dialog控件
daikuan.initDialog = function (container, targetName, options) {
    ecui.dispose(container);
    container.innerHTML = ecui.esr.getEngine().render(targetName, options);
    ecui.init(container);
    return container.children[0].getControl();
}

// 复制text到剪切板中
daikuan.copy = function (text) {
    var textarea = document.createElement("textarea");
    textarea.style.position = 'fixed';
    textarea.style.top = -100;
    textarea.style.left = 0;
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.background = 'transparent';
    textarea.style.color = 'transparent';

    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    var flag = document.execCommand('copy');
    document.body.removeChild(textarea);
}
