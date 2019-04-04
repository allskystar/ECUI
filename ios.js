(function () {
    var oldAjax = ecui.io.ajax;
    ecui.io.ajax = function (url, options) {
        if (options.method && options.method.toUpperCase() === 'POST') {
            var data = options.data || '';
            delete options.data;
            url += '&' + data;
        }
        oldAjax(url, options);
    };
}());
