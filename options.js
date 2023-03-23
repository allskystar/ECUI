(function () {
    if (/[?&]validate=off(&|$)/.test(location.href)) {
        for (var name in ecui.ui) {
            if (ecui.ui[name].prototype.hasOwnProperty('$validate')) {
                ecui.ui[name].prototype.$validate = ecui.util.blank;
            }
        }
    }
})();
