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
                this._aDrawer.push('<ellipse class="' + className + '" cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '"/>');
            },

            drawLine: function (x1, y1, x2, y2, className) {
                this._aDrawer.push('<line class="' + className + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/>');
            },

            drawPathArc: function (rx, ry, half, clockwise, toX, toY) {
                this._aDrawer.push('A ' + rx + ' ' + ry + ' 0 ' + (half ? '1 ' : '0 ') + (clockwise ? '1 ' : '0 ') + toX + ' ' + toY + ' ');
            },

            drawPathEnd: function () {
                this._aDrawer.push('"/>');
            },

            drawPathMove: function (x, y) {
                this._aDrawer.push('M ' + x + ' ' + y + ' ');
            },

            drawPathStart: function (className) {
                this._aDrawer.push('<path class="' + className + '" d="');
            },

            drawRect: function (x, y, width, height, className) {
                this._aDrawer.push('<rect class="' + className + '" x="' + x + '" y="' + y + '" width="' + width + '" height="' + height + '"/>');
            },

            drawText: function (x, y, text, className) {
                this._aDrawer.push('<text class="' + className + '" x="' + x + '" y="' + y + '">' + text + '</text>');
            },

            render: function () {
                this._eSVG.innerHTML = this._aDrawer.join('');
                this._aDrawer = [];
            }
        }
    );
}());