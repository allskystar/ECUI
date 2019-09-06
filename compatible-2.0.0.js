ecui.util.extend = Object.assign;

ecui.dom.getParent = ecui.dom.parent;

ecui.ext.esr = ecui.ext.data;

(function () {
    var oldFn = ecui.$create;
    ecui.$create = function (UIClass, options) {
        var primary = options.main && 'string' === typeof options.main.className ? options.main.className.trim().split(' ')[0] : '',
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

        var primary = el && 'string' === typeof el.className ? el.className.trim().split(' ')[0] : '',
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

ecui.ui.Text.prototype.getSelectionEnd = function () {
    return ecui.dom.getSelectionRange(this.getInput()).end;
};

ecui.ui.Text.prototype.getSelectionStart = function () {
    return ecui.dom.getSelectionRange(this.getInput()).start;
};

ecui.ui.Text.prototype.setSelectionRange = function (start, end) {
    ecui.dom.setSelectionRange(this.getInput, start, end);
};
ecui.ui.Cancel = ecui.ui.Dialog.prototype.Cancel;
ecui.ui.Submit = ecui.ui.Dialog.prototype.Submit;
ecui.ui.$select = ecui.ui.$AbstractSelect;
