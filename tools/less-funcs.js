less.funcs = {
    px2rem: function (value, options) {
        return (+value.slice(0, -2) / (options.px2rem || 75)) + 'rem';
    }
};
