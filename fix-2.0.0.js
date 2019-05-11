ecui.dom.getParent = ecui.dom.parent;

ecui.ext.esr = ecui.ext.data;

(function () {
    var oldFn = ecui.$create;
    ecui.$create = function (UIClass, options) {
        var primary = options.main ? options.main.className.trim().split(' ')[0] : '',
            classes = UIClass.TYPES[0].slice();

        if (primary !== classes[0]) {
            classes.push(primary);
        }
        classes.push(' ');
        oldFn.call(this, UIClass, options);
    };
}());

ecui.ui.Control.prototype.getOuter = function () {
    return this.getMain();
};
