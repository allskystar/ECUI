/*
@example
<icon ui="type:icon;name:REMOVE"></icon>
*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui;
//{/if}//
    var icons = {
        // TODO: 把remove图标放入
    };

    /**
     * 图标控件。
     * options 属性：
     * name  图标名称
     * size  图标区域大小，默认是 20
     * @control
     */
    ui.Icon = core.inherits(
        ui.Control,
        'ui-icon',
        function (el, options) {
            _super(el, options);
            if (icons[options.name]) {
                var size = options.size || '20';
                var viewBox = options.viewbox;
                if (!viewBox) {
                    viewBox = '0 0 ' + size + ' ' + size;
                }
                el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="' + size + '" height="' + size + '" preserveAspectRatio="xMidYMid meet" viewBox="' + viewBox + '"><path fill="currentColor" d="' + icons[options.name] + '"></path></svg>';
            }
        }
    );

    /**
     * 注册一个新图标。
     * @public
     *
     * @param {string} name 图标名称
     * @param {string} svg 图标对应的 svg 结构
     * @return {string} 原来图标对应的 svg 结构
     */
    ui.Icon.register = function (name, svg) {
        var ret = icons[name];
        icons[name] = svg;
        return ret;
    };
})();
