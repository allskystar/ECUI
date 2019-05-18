/*
@example
<img ui="type:image">
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    /**
     * 图片控件。
     * 图片控件支持使用滚轮直接缩放图片的大小。
     * @control
     */
    ui.Image = core.inherits(
        ui.Control,
        'ui-image',
        function (el, options) {
            // firefox下点击图片会自动进入选中状态
            options.userSelect = false;
            _super(el, options);
            if (el.width) {
                this._load();
            } else {
                dom.addEventListener(el, 'load', this._load.bind(this));
            }
        },
        {
            'private': {
                'cx': undefined,
                'cy': undefined,

                /**
                 * 图片加载事件。
                 * @private
                 */
                _load: function (event) {
                    this.minWidth = event.target.width;
                    this.ratio = event.target.height / event.target.width;
                    dom.removeEventListener(this, 'load', this._load);
                    if (this.isCreated()) {
                        this.cache();
                    }
                }
            },

            /**
             * @override
             */
            $activate: function (event) {
                _super.$activate(event);
                core.drag(
                    this,
                    event,
                    {
                        absolute: true
                    }
                );
            },

            /**
             * @override
             */
            $cache: function (style) {
                _super.$cache(style);
                this.cx = _super.getX() + this.getWidth() / 2;
                this.cy = _super.getY() + this.getHeight() / 2;
            },

            /**
             * @override
             */
            $mousewheel: function (event) {
                _super.$mousewheel(event);
                var delta = event.deltaY,
                    width = Math.max(this.minWidth, this.getWidth() - delta * 2);

                this.setSize(width, Math.round(width * this.ratio));
                this.setPosition(this.getX(), this.getY());

                event.preventDefault();
            },

            /**
             * @override
             */
            getX: function () {
                return this.cx;
            },

            /**
             * @override
             */
            getY: function () {
                return this.cy;
            },

            /**
             * @override
             */
            setPosition: function (x, y) {
                this.cx = x;
                this.cy = y;
                _super.setPosition(Math.round(x - this.getWidth() / 2), Math.round(y - this.getHeight() / 2));
            }
        }
    );
}());
