/*
@example
<div ui="type:b-img-fill;src:images/xxx.png"></div>
或
<div ui="type:b-img-fill;"><img src="images/xxx.png"></div>
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    /**
     * 图片填充控件。
     * @control
     */
    ui.BImgFill = core.inherits(
        ui.Control,
        'ui-img-fill',
        function (el, options) {
            ui.Control.call(this, el, options);

            this._eImg = el.getElementsByTagName('img')[0];
            if (!this._eImg) {
                dom.insertHTML(el, 'beforeEnd', '<img src="' + options.src + '">');
                this._eImg = el.getElementsByTagName('img')[0];
            }
            this._eImg.onload = this.fillImg.bind(this);
        },
        {
            /**
             * 图片完成填充div。
             * @public
             *
             */
            fillImg: function () {
                var w = this.getWidth(),
                    h = this.getHeight(),
                    w_img = this._eImg.width,
                    h_img = this._eImg.height;

                this._eImg.style.position = 'relative';
                if (w_img / h_img > w / h) {
                    var left = (h * w_img / h_img - w) / 2;
                    this._eImg.style.width = 'auto';
                    this._eImg.style.height = '100%';
                    this._eImg.style.left = -(left || 0) + 'px';
                } else {
                    var top = (w * h_img / w_img - h) / 2;
                    this._eImg.style.width = '100%';
                    this._eImg.style.height = 'auto';
                    this._eImg.style.top = -(top || 0) + 'px';
                }
            }
        }
    );
}());