/*
@example
<div ui="type:carousel;delay:5">
    <img src="...">
    ...
</div>
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    var currImage;

    function autoNext(control) {
        control._oHandle = util.timer(next, control._nDelay, control);
    }

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

    function refresh(control) {
        var main = control.getMain(),
            left = main.scrollLeft,
            width = control.getClientWidth();

        if (left < width) {
            show(control, main.firstChild.index);
        } else if (left > width) {
            show(control, main.lastChild.index);
        }
    }

    function show(control, index) {
        var main = control.getMain(),
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

        main.scrollLeft = control.getClientWidth();
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
            $ready: function (event) {
                ui.MPanel.prototype.$ready.call(this, event);

                var main = this.getMain();
                dom.children(main).forEach(function (item) {
                    item.style.display = 'none';
                });
                dom.insertBefore(dom.create('IMG'), main.firstChild);
                dom.insertAfter(dom.create('IMG'), main.lastChild);
                show(this, 0);
            }
        }
    );
}());
