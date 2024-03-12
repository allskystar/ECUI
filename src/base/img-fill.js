//{if $css}//
ecui.__ControlStyle__('\
.ui-img-fill {\
    text-align: left;\
    img {\
        position: relative;\
    }\
}\
');
//{/if}//
/*
@example
<div ui="type:img-fill;src:images/xxx.png"></div>
或
<div ui="type:img-fill;"><img src="images/xxx.png"></div>
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    /**
     * 图片填充控件，在图片不变形的情况下使图片填充控件区域。
     * @control
     */
    ui.ImgFill = core.inherits(
        ui.Control,
        'ui-img-fill',
        function (el, options) {
            _super(el, options);
            this._eImg = el.getElementsByTagName('img')[0];
            var imgUrl = options.src || options.url;
            if (!this._eImg) {
                el.insertAdjacentHTML('beforeEnd', '<img src="' + (imgUrl || '') + '">');
                this._eImg = el.getElementsByTagName('img')[0];
            }
            if (imgUrl) {
                dom.imgLoad(this._eImg, this.$initStructure.bind(this));
            }
        },
        {
            /**
             * @override
             */
            $dispose: function () {
                _super.$dispose();
                this._eImg = null;
            },

            /**
             * @override
             */
            $initStructure: function () {
                if (this._eImg) {
                    _super.$initStructure();

                    var w = this.getWidth(),
                        h = this.getHeight(),
                        w_img = this._eImg.width,
                        h_img = this._eImg.height;

                    if (w_img / h_img < w / h) {
                        this._eImg.style.width = 'auto';
                        this._eImg.style.height = '100%';
                        this._eImg.style.left = -Math.round((h * w_img / h_img - w) / 2 || 0) + 'px';
                    } else {
                        this._eImg.style.width = '100%';
                        this._eImg.style.height = 'auto';
                        this._eImg.style.top = -Math.round((w * h_img / w_img - h) / 2 || 0) + 'px';
                    }
                }
            },

            /**
             * 加载图片。
             * @public
             *
             * @param {string} url 图片的url或data:image
             */
            loadImage: function (url) {
                this._eImg.src = url;
                dom.imgLoad(this._eImg, this.$initStructure.bind(this));
            }
        }
    );
//{if 0}//
})();
//{/if}//
