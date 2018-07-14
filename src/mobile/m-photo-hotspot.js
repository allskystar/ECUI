/*
@example
<img ui="type:photo-hotspot">
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    var currHotspot,
        currImg = dom.create(
            'IMG',
            {
                className: 'ui-mobile-photo-hotspot-image',
            }
        ),
        backupImg = dom.create(
            'IMG',
            {
                className: 'ui-mobile-photo-hotspot-image',
                style: {
                    display: 'none'
                }
            }
        ),
        title = dom.create({
            className: 'ui-mobile-photo-hotspot-title',
            innerHTML: '<span class="ui-mobile-photo-hotspot-text"></span><span class="ui-mobile-photo-hotspot-count"></span>'
        }),
        tapHandle;

    /**
     * 高清图片填充。
     * @private
     *
     * @param {HTMLElement} img 图片元素
     * @param {ecui.ui.MPhotoHotspot} hotspot 热点图对象
     * @param {number} position 高清图片初始出现的位置(左右移动时不同)
     */
    function fillImage(img, hotspot, position) {
        var body = core.getBody();
        var viewWidth = body.clientWidth;

        img.style.top = (body.clientHeight - hotspot.$$calcHeight) / 2 + 'px';
        img.style.left = ((viewWidth - hotspot.$$calcWidth) / 2 + position * viewWidth) + 'px';
        img.style.width = hotspot.$$calcWidth + 'px';
        img.src = hotspot.getHDImageUrl();

        var items = core.query(function (item) {
            return item instanceof ui.MPhotoHotspot;
        });
        title.firstChild.innerHTML = hotspot.getMain().title;
        title.lastChild.innerHTML = (items.indexOf(hotspot) + 1) + '/' + items.length;
    }

    /**
     * 滑动事件处理。
     * @private
     *
     * @param {ECUIEvent} event ECUI 事件对象
     */
    function swipe(event) {
        var viewWidth = core.getBody().clientWidth;
        if (util.toNumber(currImg.style.width) !== currHotspot.$$calcWidth) {
            return;
        }
        var items = core.query(function (item) {
            return item instanceof ui.MPhotoHotspot;
        });
        var index = items.indexOf(currHotspot),
            nextIndex = index;
        if (event.type === 'swiperight') {
            if (index > 0) {
                nextIndex = index - 1;
            }
        } else if (event.type === 'swipeleft') {
            if (index < items.length - 1) {
                nextIndex = index + 1;
            }
        }
        if (index !== nextIndex) {
            fillImage(currImg, currHotspot, 0);
            backupImg.style.display = '';
            fillImage(backupImg, items[nextIndex], nextIndex - index);
            core.effect.grade(
                'this.from.style.left->' + (index - nextIndex) * viewWidth + ';this.to.style.left->0',
                300,
                {
                    $: {from: currImg, to: backupImg},
                    onfinish: function () {
                        var tmp = currImg;
                        currImg = backupImg;
                        backupImg = tmp;
                        backupImg.style.display = 'none';
                    }
                }
            );
            currHotspot = items[nextIndex];
        }
    }

    /**
     * 缩放事件处理。
     * @private
     *
     * @param {ECUIEvent} event ECUI 事件对象
     */
    function zoom(event) {
        var body = core.getBody(),
            viewWidth = body.clientWidth,
            viewHeight = body.clientHeight,
            distance = event.to - event.from,
            width = Math.max(util.toNumber(currImg.style.width) + distance, currHotspot.$$calcWidth);
        currImg.style.width = width + 'px';

        if (width === currHotspot.$$calcWidth) {
            fillImage(currImg, currHotspot, 0);
        } else {
            currImg.style.top = (util.toNumber(currImg.style.top) - distance / currHotspot.$$calcWidth * currHotspot.$$calcHeight * (event.pageY - (body.parentNode.scrollTop || body.scrollTop)) / viewHeight) + 'px';
            currImg.style.left = (util.toNumber(currImg.style.left) - distance * (event.pageX - (body.parentNode.scrollLeft || body.scrollLeft)) / viewWidth) + 'px';
        }
    }

    /**
     * 热点图控件。
     * 实现了对原生 ImgElement 的功能扩展，点击时图片会自动放大并使用高清图，可以对同页面全部的热点图进行切换。
     * @control
     */
    ui.MPhotoHotspot = core.inherits(
        ui.Control,
        {
            /**
             * @override
             */
            $cache: function (style) {
                ui.Control.prototype.$cache.call(this, style, true);
                var body = core.getBody(),
                    viewWidth = body.clientWidth,
                    viewHeight = body.clientHeight,
                    height = viewWidth / this.getWidth() * this.getHeight();
                if (height > viewHeight) {
                    this.$$calcWidth = viewHeight / this.getHeight() * this.getWidth();
                    this.$$calcHeight = viewHeight;
                } else {
                    this.$$calcWidth = viewWidth;
                    this.$$calcHeight = height;
                }
            },

            /**
             * 点击时控件开始焦点图处理。
             * @override
             */
            $click: function (event) {
                var body = core.getBody(),
                    viewWidth = body.clientWidth,
                    viewHeight = body.clientHeight;

                ui.Control.prototype.$click.call(this, event);
                body.appendChild(currImg);
                body.appendChild(backupImg);
                body.appendChild(title);
                fillImage(currImg, this, 0);
                currHotspot = this;
                core.mask(0.9);
                util.timer(function () {
                    core.addGestureListeners(null, {
                        swipeleft: swipe,
                        swiperight: swipe,
                        panmove: function (event) {
                            var width = util.toNumber(currImg.style.width),
                                height = width * currHotspot.$$calcHeight / currHotspot.$$calcWidth;
                            if (width === currHotspot.$$calcWidth) {
                                return;
                            }
                            currImg.style.left = Math.max(Math.min(util.toNumber(currImg.style.left) - event.fromX + event.toX, Math.max(0, viewWidth - width)), Math.min(0, viewWidth - width)) + 'px';
                            currImg.style.top = Math.max(Math.min(util.toNumber(currImg.style.top) - event.fromY + event.toY, Math.max(0, viewHeight - height)), Math.min(0, viewHeight - height)) + 'px';
                        },
                        pinchin: zoom,
                        pinchout: zoom,
                        tap: function (event) {
                            if (tapHandle) {
                                tapHandle();
                                tapHandle = null;
                                event.type = 'pinch';
                                event.from = 0;
                                event.to = util.toNumber(currImg.style.width) === currHotspot.$$calcWidth ? currHotspot.$$calcWidth * 2 : -util.toNumber(currImg.style.width);
                                zoom(event);
                            } else {
                                tapHandle = util.timer(function () {
                                    dom.remove(currImg);
                                    dom.remove(backupImg);
                                    dom.remove(title);
                                    core.removeGestureListeners(null);
                                    core.mask();
                                    tapHandle = null;
                                }, 300);
                            }
                        }
                    });
                });
            },

            /**
             * 获取高清图的链接地址。
             * @public
             *
             * @return {string} 高清图的url地址
             */
            getHDImageUrl: function () {
                return this.getMain().src;
            }
        }
    );
}());
