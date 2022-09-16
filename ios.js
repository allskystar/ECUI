(function () {
    var oldAjax = ecui.io.ajax;
    ecui.io.ajax = function (url, options) {
        if (options.method && options.method.toUpperCase() === 'POST') {
            var data = options.data || '';
            delete options.data;
            url += '#' + data;
        }
        oldAjax(url, options);
    };

    window.dispatchCustomEvent = function (eventName, options) {
        options = JSON.parse(options);
        var event = document.createEvent('HTMLEvents');
        event.initEvent(eventName, true, true);
        ecui.util.extend(event, options);
        window.dispatchEvent(event);
    };

    ecui.ready(function () {
        if (ecui.$('ECUI-FIXED-INPUT')) {
            ecui.dom.remove(ecui.$('ECUI-FIXED-INPUT'));
        }
    });
}());
