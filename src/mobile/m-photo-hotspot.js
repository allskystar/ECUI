//{if $css}//
ecui.__ControlStyle__('\
.ui-mobile-photo-hotspot-image {\
    position: fixed !important;\
    z-index: 32100 !important;\
}\
\
.ui-mobile-photo-hotspot-title {\
    position: fixed !important;\
    bottom: 0px;\
    z-index: 32200 !important;\
    .m-width100rate();\
}\
\
.ui-mobile-photo-hotspot-text {\
    float: left;\
    .inline-block();\
}\
\
.ui-mobile-photo-hotspot-count {\
    float: right;\
    .inline-block();\
}\
');
//{/if}//
/*
@example
<img ui="type:m-photo-hotspot">
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        effect = core.effect,
        ui = core.ui,
        util = core.util;
//{/if}//
    var currHotspot,
        currImg = dom.create(
            'IMG',
            {
                className: 'ui-mobile-photo-hotspot-image'
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
     * 计算图片最适合大小。
     * @private
     *
     * @param {ecui.ui.MPhotoHotspot} hotspot 焦点图对象
     * @param {number} imgWidth 高清图片初始宽度
     * @param {number} imgHeight 高清图片初始高度
     */
    function calcSize(hotspot, imgWidth, imgHeight) {
        var viewWidth = document.body.clientWidth,
            viewHeight = document.body.clientHeight,
            height = viewWidth / imgWidth * imgHeight;

        if (height > viewHeight) {
            hotspot.$$calcWidth = viewHeight / imgHeight * imgWidth;
            hotspot.$$calcHeight = viewHeight;
        } else {
            hotspot.$$calcWidth = viewWidth;
            hotspot.$$calcHeight = height;
        }

        hotspot._bLoaded = true;
    }

    /**
     * 高清图片填充。
     * @private
     *
     * @param {HTMLElement} img 图片元素
     * @param {ecui.ui.MPhotoHotspot} hotspot 焦点图对象
     * @param {number} position 高清图片初始出现的位置(左右移动时不同)
     */
    function fillImage(img, hotspot, position) {
        var data = hotspot._bLoaded ? hotspot : ui.MPhotoHotspot.DEFAULT,
            viewWidth = document.body.clientWidth,
            items = core.query(function (item) {
                return item instanceof ui.MPhotoHotspot && item._sGroup === currHotspot._sGroup;
            });

        img.style.top = (document.body.clientHeight - data.$$calcHeight) / 2 + 'px';
        img.style.left = ((viewWidth - data.$$calcWidth) / 2 + position * viewWidth) + 'px';
        img.style.width = data.$$calcWidth + 'px';
        img.src = data.getHDImageUrl();

        hotspot.$$calcWidth = data.$$calcWidth;
        hotspot.$$calcHeight = data.$$calcHeight;
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
        var viewWidth = document.body.clientWidth;
        if (Math.abs(dom.toPixel(currImg.style.width) - currHotspot.$$calcWidth) >= 0.01) {
            return;
        }
        var items = core.query(function (item) {
            return item instanceof ui.MPhotoHotspot && item._sGroup === currHotspot._sGroup;
        });
        var index = items.indexOf(currHotspot),
            nextIndex = index;
        if (event.type === 'swiperight') {
            nextIndex = index > 0 ? index - 1 : items.length - 1;
        } else if (event.type === 'swipeleft') {
            nextIndex = index < items.length - 1 ? index + 1 : 0;
        }

        if (index !== nextIndex) {
            fillImage(currImg, currHotspot, 0);
            backupImg.style.display = '';

            var position = event.type === 'swiperight' ? 1 : -1;
            fillImage(backupImg, items[nextIndex], -position);
            effect.grade(
                'this.from.style.left=#this.from.style.left->' + (position * viewWidth + (viewWidth - dom.toPixel(currImg.style.width)) / 2) + 'px#;this.to.style.left=#this.to.style.left->' + ((viewWidth - dom.toPixel(backupImg.style.width)) / 2) + 'px#',
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
        var viewWidth = document.body.clientWidth,
            viewHeight = document.body.clientHeight,
            distance = event.to - event.from,
            width = Math.max(dom.toPixel(currImg.style.width) + distance, currHotspot.$$calcWidth);
        currImg.style.width = width + 'px';

        if (Math.abs(width - currHotspot.$$calcWidth) < 0.01) {
            fillImage(currImg, currHotspot, 0);
        } else {
            currImg.style.top = (dom.toPixel(currImg.style.top) - distance / currHotspot.$$calcWidth * currHotspot.$$calcHeight * (event.pageY - (document.body.parentNode.scrollTop || document.body.scrollTop)) / viewHeight) + 'px';
            currImg.style.left = (dom.toPixel(currImg.style.left) - distance * (event.pageX - (document.body.parentNode.scrollLeft || document.body.scrollLeft)) / viewWidth) + 'px';
        }
    }

    /**
     * 热点图控件。
     * 实现了对原生 ImgElement 的功能扩展，点击时图片会自动放大并使用高清图，可以对同页面全部的热点图进行切换。
     * options 属性：
     * group     分组，默认为空
     * @control
     */
    ui.MPhotoHotspot = core.inherits(
        ui.Control,
        function (el, options) {
            _super(el, options);
            if (options.size) {
                var size = options.size.split(',');
                calcSize(this, +size[0], +size[1]);
            } else {
                var img = new Image();
                img.src = this.getThumbnailUrl();
                dom.imgLoad(img, function (event) {
                    calcSize(this, event.target.width, event.target.height);
                    if (currHotspot === this) {
                        fillImage(currImg, this, 0);
                    }
                }.bind(this));
            }
            this._sGroup = options.group;
        },
        {
            /**
             * 点击时控件开始焦点图处理。
             * @override
             */
            $click: function (event) {
                var body = document.body,
                    viewWidth = body.clientWidth,
                    viewHeight = body.clientHeight;

                _super.$click(event);
                body.appendChild(currImg);
                body.appendChild(backupImg);
                body.appendChild(title);
                currHotspot = this;
                fillImage(currImg, this, 0);
                core.mask(1);
                util.timer(function () {
                    core.addGestureListeners(null, {
                        swipeleft: swipe,
                        swiperight: swipe,
                        panmove: function (event) {
                            var width = dom.toPixel(currImg.style.width),
                                height = width * currHotspot.$$calcHeight / currHotspot.$$calcWidth;
                            if (width === currHotspot.$$calcWidth) {
                                return;
                            }
                            if (currImg.offsetWidth > document.body.clientWidth) {
                                currImg.style.left = Math.max(Math.min(dom.toPixel(currImg.style.left) - event.fromX + event.toX, Math.max(0, viewWidth - width)), Math.min(0, viewWidth - width)) + 'px';
                            }
                            if (currImg.offsetHeight > document.body.clientHeight) {
                                currImg.style.top = Math.max(Math.min(dom.toPixel(currImg.style.top) - event.fromY + event.toY, Math.max(0, viewHeight - height)), Math.min(0, viewHeight - height)) + 'px';
                            }
                        },
                        pinchin: zoom,
                        pinchout: zoom,
                        tap: function (event) {
                            if (tapHandle) {
                                tapHandle();
                                tapHandle = null;
                                event.type = 'pinch';
                                event.from = 0;
                                event.to = (Math.abs(dom.toPixel(currImg.style.width) - currHotspot.$$calcWidth) < 0.01) ? currHotspot.$$calcWidth * 2 : -dom.toPixel(currImg.style.width);
                                zoom(event);
                            } else {
                                tapHandle = util.timer(ui.MPhotoHotspot.close, 300);
                            }
                        }
                    });
                });
            },

            /**
             * 获取缩略图的链接地址。
             * @public
             *
             * @return {string} 高清图的url地址
             */
            getThumbnailUrl: function () {
                return this.getMain().src;
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

    /**
     * 判断当前焦点图控件有没有激活。
     * @public
     *
     * @return {boolean} 焦点图控件是否激活
     */
    ui.MPhotoHotspot.isUsing = function () {
        return !!currHotspot;
    };

    /**
     * 关闭焦点图控件激活状态。
     * @public
     */
    ui.MPhotoHotspot.close = function () {
        dom.remove(currImg);
        dom.remove(backupImg);
        dom.remove(title);
        core.removeGestureListeners(null);
        core.mask();
        currHotspot = null;
        tapHandle = null;
        currImg.src = '';
        backupImg.src = '';
    };

    ui.MPhotoHotspot.DEFAULT = {
        width: 750,
        height: 562,
        getHDImageUrl: function () {
            return 'images/ecui/fail.png';
        }
    };

    core.ready(function () {
        calcSize(ui.MPhotoHotspot.DEFAULT, ui.MPhotoHotspot.DEFAULT.width, ui.MPhotoHotspot.DEFAULT.height);
    });
})();
