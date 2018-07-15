/*
@example
<div ui="type:carousel;delay:5">
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
        ui = core.ui,
        util = core.util;
//{/if}//
    var currImage;

    /**
     * 准备轮播下一张图片。
     * @private
     *
     * @param {ecui.ui.MCarousel} carousel 轮播图控件
     */
    function autoNext(carousel) {
        carousel._oHandle = util.timer(next, carousel._nDelay, carousel);
    }

    /**
     * 自动轮播下一张图片。
     * @private
     */
    function next() {
        this._oHandle = core.effect.grade(
            'this.scrollLeft->+(' + this.getClientWidth() + ')',
            1000,
            {
                $: this.getMain(),
                onfinish: function () {
                    autoNext(this);
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
        var main = carousel.getMain(),
            left = main.scrollLeft,
            width = carousel.getClientWidth();

        if (left < width) {
            show(carousel, main.firstChild.index);
        } else if (left > width) {
            show(carousel, main.lastChild.index);
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
        var main = carousel.getMain(),
            imgs = dom.children(main),
            count = imgs.length - 2;

        if (currImage) {
            currImage.style.display = 'none';
        }
        currImage = imgs[index + 1];
        currImage.style.display = '';
        imgs[0].index = (index + count - 1) % count;
        imgs[0].src = imgs[imgs[0].index + 1].src;
        imgs[count + 1].index = (index + 1) % count;
        imgs[count + 1].src = imgs[imgs[count + 1].index + 1].src;

        main.scrollLeft = carousel.getClientWidth();
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

            Array.prototype.slice.call(el.childNodes).forEach(function (item) {
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
                    autoNext(this);
                }
            }
        },
        {
            /**
             * @override
             */
            $activate: function (event) {
                ui.MPanel.prototype.$activate.call(this, event);
                if (this._nDelay) {
                    this._oHandle();
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
            $dragend: function (event) {
                ui.MPanel.prototype.$dragend.call(this, event);
                if (this._nDelay) {
                    autoNext(this);
                }
                var main = this.getMain();
                if (main.firstChild !== main.lastChild) {
                    refresh(this);
                }
            },

            /**
             * @override
             */
            $initStructure: function (width, height) {
                ui.MPanel.prototype.$initStructure.call(this, width, height);

                var main = this.getMain();
                if (main.firstChild !== main.lastChild) {
                    dom.children(main).forEach(function (item) {
                        item.style.display = 'none';
                    });
                    dom.insertBefore(dom.create('IMG'), main.firstChild);
                    dom.insertAfter(dom.create('IMG'), main.lastChild);
                    show(this, 0);
                }
            },

            /**
             * @override
             */
            $resize: function (event) {
                ui.MPanel.prototype.$resize.call(this, event);

                var main = this.getMain();
                if (main.firstChild !== main.lastChild) {
                    main.removeChild(main.firstChild);
                    main.removeChild(main.lastChild);
                }
            }
        }
    );
}());
