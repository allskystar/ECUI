/*
@example
<!-- 以下***表示具体的展现类型 -->
<div ui="type:***"></div>
或
<!-- 以下***表示具体的展现类型 -->
<div ui="type:***">
    <svg>
        <defs>
            <linearGradient id="orange_red" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:rgb(255,255,0);stop-opacity:1"/>
                <stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1"/>
            </linearGradient>
        </defs>
    </svg>
</div>
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    /**
     * SVG基类，请不要直接使用。
     * @control
     */
    ui.SVG = core.inherits(
        ui.Control,
        function (el, options) {
            _super(el, options);
            this._eSVG = dom.first(el);
            if (this._eSVG) {
                this._eDefs = dom.first(this._eSVG);
            } else {
                el.innerHTML = '<svg></svg>';
                this._eSVG = el.lastChild;
            }
            this._aDrawer = [];
        },
        {
            $dispose: function () {
                this._eSVG = null;
                _super.$dispose();
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
                if (this._eDefs) {
                    this._eSVG.removeChild(this._eDefs);
                }
                this._eSVG.innerHTML = this._aDrawer.join('');
                if (this._eDefs) {
                    this._eSVG.insertBefore(this._eDefs, this._eSVG.firstChild);
                }
                this._aDrawer = [];
            }
        }
    );
//{if 0}//
}());
//{/if}//
