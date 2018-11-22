//{if 0}//
(function () {
//{/if}//
    var core = ecui,
        ui = core.ui;

    /**
     * SVG基类，请不要直接使用。
     * @control
     */
    ui.SVG = core.inherits(
        ui.Control,
        function (el, options) {
            ui.Control.call(this, el, options);
            el.innerHTML = '<svg></svg>';
            this._eSVG = el.lastChild;
            this._aDrawer = [];
        },
        {
            $dispose: function () {
                this._eSVG = null;
                ui.Control.prototype.$dispose.call(this);
            },

            drawEllipse: function (x, y, rx, ry, className) {
                this._aDrawer.push('<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" class="' + className + '"/>');
            },

            drawLine: function (x1, y1, x2, y2, className) {
                this._aDrawer.push('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="' + className + '"/>');
            },

            drawRect: function (x, y, width, height, className) {
                this._aDrawer.push('<rect x="' + x + '" y="' + y + '" width="' + width + '" height="' + height + '" class="' + className + '"/>');
            },

            drawText: function (x, y, text, className) {
                this._aDrawer.push('<text x="' + x + '" y="' + y + '" class="' + className + '">' + text + '</text>');
            },

            render: function () {
                this._eSVG.innerHTML = this._aDrawer.join('');
                this._aDrawer = [];
            }
        }
    );
}());