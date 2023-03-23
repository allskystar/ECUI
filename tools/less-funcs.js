window.less = {
    functions: {
        px2rem: function (options, px2rem) {
            return (+options.value / (px2rem || 75)) + 'rem';
        }
    }
};