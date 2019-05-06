/*
@example
<div ui="type:m-carousel;delay:5">
    <img src="...">
    ...
</div>

@fields
_nDelay   - 延迟时间，如果不自动轮播这个值为0
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        effect = core.effect,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 自动轮播下一张图片。
     * @private
     */
    function next() {
        this.cache();

        var x = this.getX();
        this.stop = effect.grade(
            'this.setPosition(#round:' + x + '->' + (x - this.getClientWidth()) + '#,0)',
            1000,
            {
                $: this,
                onfinish: function () {
                    this.start();
                    refresh(this);
                }.bind(this)
            }
        );
    }

    /**
     * 刷新图片的编号，轮播图只有当前图是显示的，别的图都是隐藏的。
     * @private
     *
     * @param {ecui.ui.MCarousel} carousel 轮播图控件
     */
    function refresh(carousel) {
        var body = carousel.getBody(),
            x = -carousel.getX(),
            width = carousel.getClientWidth();

        if (x < width) {
            show(carousel, body.firstChild.index);
        } else if (x > width) {
            show(carousel, body.lastChild.index);
        }
    }

    /**
     * 显示指定编号的图片，轮播图只有当前图是显示的，别的图都是隐藏的。
     * @private
     *
     * @param {ecui.ui.MCarousel} carousel 轮播图控件
     * @param {number} index 图片编号
     */
    function show(carousel, index) {
        var imgs = dom.children(carousel.getBody()),
            count = imgs.length - 2;

        if (carousel._eCurrImage) {
            dom.addClass(carousel._eCurrImage, 'ui-hide');
        }
        carousel._eCurrImage = imgs[index + 1];
        dom.removeClass(carousel._eCurrImage, 'ui-hide');
        imgs[0].index = (index + count - 1) % count;
        imgs[0].src = imgs[imgs[0].index + 1].src;
        imgs[count + 1].index = (index + 1) % count;
        imgs[count + 1].src = imgs[imgs[count + 1].index + 1].src;

        carousel.setPosition(-carousel.getClientWidth(), 0);

        core.dispatchEvent(carousel, 'change', {index: index, image: carousel._eCurrImage});
    }

    /**
     * 按钮控件。
     * 缺省设置不可选中内容。
     * options 属性：
     * delay   轮播延时，单位s
     * @control
     */
    ui.MCarousel = core.inherits(
        ui.MPanel,
        'ui-mobile-carousel',
        function (el, options) {
            ui.MPanel.call(this, el, options);

            el = this.getBody();

            dom.toArray(el.childNodes).forEach(function (item) {
                if (item.nodeType !== 1) {
                    el.removeChild(item);
                }
            });

            this.setScrollRange({
                top: 0,
                bottom: 0
            });

            if (el.firstChild !== el.lastChild) {
                if (options.delay) {
                    this._nDelay = options.delay * 1000;
                    this.start();
                }
            }
        },
        {
            /**
             * @override
             */
            $activate: function (event) {
                if (dom.children(this.getBody()).length > 3) {
                    ui.MPanel.prototype.$activate.call(this, event);
                    if (this._nDelay) {
                        this.stop();
                    }
                }
            },

            /**
             * @override
             */
            $cache: function (style) {
                ui.MPanel.prototype.$cache.call(this, style);
                this.setRange({
                    stepX: this.getClientWidth()
                });
            },

            /**
             * @override
             */
            $dispose: function () {
                this.stop();
                this._eCurrImage = null;
                ui.MPanel.prototype.$dispose.call(this);
            },

            /**
             * @override
             */
            $dragend: function (event) {
                ui.MPanel.prototype.$dragend.call(this, event);
                if (!event.force) {
                    this.start();
                    var el = this.getBody();
                    if (el.firstChild !== el.lastChild) {
                        refresh(this);
                    }
                }
            },

            /**
             * @override
             */
            $initStructure: function (width, height) {
                ui.MPanel.prototype.$initStructure.call(this, width, height);

                var el = this.getBody();
                if (el.firstChild !== el.lastChild) {
                    dom.children(el).forEach(function (item) {
                        dom.addClass(item, 'ui-hide');
                    });
                    dom.insertBefore(dom.create('IMG'), el.firstChild);
                    dom.insertAfter(dom.create('IMG'), el.lastChild);
                    show(this, 0);
                }
            },

            /**
             * @override
             */
            $resize: function (event) {
                ui.MPanel.prototype.$resize.call(this, event);

                var el = this.getBody();
                if (el.firstChild !== el.lastChild) {
                    el.removeChild(el.firstChild);
                    el.removeChild(el.lastChild);
                }
            },

            /**
             * 准备轮播下一张图片。
             * @public
             */
            start: function () {
                if (this._nDelay) {
                    this.stop = util.timer(next, this._nDelay, this);
                }
            },

            /**
             * 停止轮播下一张图片。
             * @public
             */
            stop: util.blank
        }
    );
}());
