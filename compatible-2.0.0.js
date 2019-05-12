ecui.util.extend = Object.assign;

ecui.dom.getParent = ecui.dom.parent;

ecui.ext.esr = ecui.ext.data;

(function () {
    var oldFn = ecui.$create;
    ecui.$create = function (UIClass, options) {
        var primary = options.main ? options.main.className.trim().split(' ')[0] : '',
            classes = options.classes = UIClass.TYPES[0].slice();

        if (primary && primary !== classes[0]) {
            classes.push(primary);
        }
        classes.push(' ');
        return oldFn.call(this, UIClass, options);
    };
}());

(function () {
    var oldFn = ecui.$fastCreate;
    ecui.$fastCreate = function (UIClass, el, parent, options) {
        options = options || {};

        var primary = el ? el.className.trim().split(' ')[0] : '',
            classes = options.classes = UIClass.TYPES[0].slice();

        if (primary && primary !== classes[0]) {
            classes.push(primary);
        }
        classes.push(' ');
        return oldFn.call(this, UIClass, el, parent, options);
    };
}());

ecui.ui.Control.prototype.getOuter = function () {
    return this.getMain();
};

ecui.ui.Control.prototype.getPrimary = function () {
    return this.getClass();
};
