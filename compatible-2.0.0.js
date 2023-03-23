(function () {
    var ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined,
        firefoxVersion = /firefox\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined;

    if (ieVersion) {
        document.write('<script type="text/javascript" src="js/ecui-ie.js"></script>');
    } else if (firefoxVersion) {
        document.write('<script type="text/javascript" src="js/ecui-ff.js"></script>');
    }
})();
