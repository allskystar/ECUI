/*
滚动操作集合。
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ext = core.ext,
        ui = core.ui,
        util = core.util,

        isToucher = document.ontouchstart !== undefined,
        iosVersion = /(iPhone|iPad).+OS (\d+)/i.test(navigator.userAgent) ?  +(RegExp.$2) : undefined,
        safariVersion = !/(chrome|crios|ucbrowser)/i.test(navigator.userAgent) && /(\d+\.\d)(\.\d)?\s+.*safari/i.test(navigator.userAgent) ? +RegExp.$1 : undefined;
//{/if}//
    var tx = /(\-?\d+)px\s*,\s*(\-?\d+)/,
        keyboardHeight = 0;

    ui.MScroll = {
        NAME: '$MScroll',

        constructor: function (el, options) {
            var bodyEl = dom.create(
                    {
                        className: options.classes.join('-body ') + 'ui-mobile-scroll-body'
                    }
                );

            for (; el.firstChild; ) {
                bodyEl.appendChild(el.firstChild);
            }

            dom.addClass(el, 'ui-mobile-scroll');
            el.appendChild(bodyEl);
            this.$setBody(bodyEl);
        },

        Methods: {
            /**
             * @override
             */
            $activate: function (event) {
                this.$MScroll.$activate.call(this, event);

                var main = this.getMain(),
                    body = this.getBody(),
                    data = this.$MScrollData,
                    flag = tx.test(this.getBody().style.transform);

                core.drag(
                    this,
                    event,
                    {
                        el: body,
                        decelerate: 400,
                        absolute: true,
                        left: data.left !== undefined ? data.left : main.clientWidth - main.scrollWidth + (flag ? +RegExp.$1 : 0),
                        right: data.right !== undefined ? data.right : 0,
                        top: (data.top !== undefined ? data.top : main.clientHeight - main.scrollHeight + (flag ? +RegExp.$2 : 0)) + window.scrollY - keyboardHeight,
                        bottom: (data.bottom !== undefined ? data.bottom : 0) + window.scrollY,
                        limit: data.range
                    }
                );
            },

            /**
             * @override
             */
            $dragend: function (event) {
                this.$MScroll.$dragend.call(this, event);
                this.$MScrollData.scrolling = false;
                this.$MScrollData.inertia = false;
            },

            /**
             * @override
             */
            $dragmove: function (event) {
                this.$MScroll.$dragmove.call(this, event);
                this.$MScrollData.inertia = event.inertia;
            },

            /**
             * @override
             */
            $dragstart: function (event) {
                this.$MScroll.$dragstart.call(this, event);
                this.$MScrollData.scrolling = true;
            },

            /**
             * 获取正常显示范围，用于拖拽结束后归位设置。
             * @public
             *
             * @return {Array} 正常显示范围
             */
            getRange: function () {
                return this.$MScrollData.range;
            },

            /**
             * 获取滚动范围。
             * @public
             *
             * @return {Array} 正常显示范围
             */
            getScrollRange: function () {
                return {
                    left: this.$MScrollData.left,
                    top: this.$MScrollData.top,
                    right: this.$MScrollData.right,
                    bottom: this.$MScrollData.bottom
                };
            },

            /**
             * @override
             */
            getX: function () {
                var main = this.getMain();
                return (tx.test(this.getBody().style.transform) ? +RegExp.$1 : 0) - (main.offsetWidth ? main.scrollLeft : this.$MScrollData.scrollLeft || 0);
            },

            /**
             * @override
             */
            getY: function () {
                var main = this.getMain();
                return (tx.test(this.getBody().style.transform) ? +RegExp.$2 : 0) - (main.offsetWidth ? main.scrollTop : this.$MScrollData.scrollTop || 0);
            },

            /**
             * 是否处于惯性移动状态。
             * @public
             *
             * @return {boolean} 是否处于惯性移动状态
             */
            isInertia: function () {
                return !!this.$MScrollData.inertia;
            },

            /**
             * 是否正在滚动。
             * @public
             *
             * @return {boolean} 是否正在滚动
             */
            isScrolling: function () {
                return !!this.$MScrollData.scrolling;
            },

            /**
             * @override
             */
            setPosition: function (x, y) {
                var main = this.getMain();
                if (document.activeElement.value !== undefined) {
                    // 解决光标问题
                    if (this.getX() !== x || this.getY() !== y) {
                        main.scrollLeft = this.$MScrollData.scrollLeft = 0;
                        main.scrollTop = this.$MScrollData.scrollTop = 0;
                        this.getBody().style.transform = 'translate(' + x + 'px,' + y + 'px)';
                    }
                } else {
                    // 滚动结束使用scrollxxx解决删除时自动复位的问题
                    var style = this.getBody().style;
                    style.transform = '';
                    main.scrollLeft = -x;
                    main.scrollTop = -y;
                    this.$MScrollData.scrollLeft = main.scrollLeft;
                    this.$MScrollData.scrollTop = main.scrollTop;
                    x += this.$MScrollData.scrollLeft;
                    y += this.$MScrollData.scrollTop;
                    if (x || y) {
                        style.transform = 'translate(' + x + 'px,' + y + 'px)';
                    }
                }
            },

            /**
             * 设置滚动范围。
             * @public
             *
             * @param {object} range 允许滚动的范围
             */
            setScrollRange: function (range) {
                if (range.left !== undefined) {
                    this.$MScrollData.left = range.left;
                }
                if (range.top !== undefined) {
                    this.$MScrollData.top = range.top;
                }
                if (range.right !== undefined) {
                    this.$MScrollData.right = range.right;
                }
                if (range.bottom !== undefined) {
                    this.$MScrollData.bottom = range.bottom;
                }
            },

            /**
             * 设置正常显示范围，用于拖拽结束后归位。
             * @public
             *
             * @param {object} range 正常显示范围
             */
            setRange: function (range) {
                this.$MScrollData.range = range;
            }
        }
    };

    if (isToucher) {
        if (iosVersion) {
            var topList = [],
                bottomList = [],
                keyboardHandle = util.blank,
                fixed = function () {
                    topList.forEach(function (item) {
                        item.getMain().style.transform = 'translateY(' + window.scrollY + 'px)';
                    });
                    bottomList.forEach(function (item) {
                        item.getMain().style.transform = 'translateY(' + (window.scrollY - keyboardHeight) + 'px)';
                    });
                };

            dom.addEventListener(window, 'keyboardchange', function (event) {
                keyboardHandle();
                keyboardHeight = event.data - (safariVersion ? 45 : 0);
                fixed();
            });

            dom.addEventListener(document, 'focusin', function (event) {
                if (event.target.readOnly || event.target.tagName === 'SELECT' || (event.target.tagName === 'INPUT' && (event.target.type === 'radio' || event.target.type === 'checkbox'))) {
                    return;
                }

                keyboardHandle();

                // 缓存panel的大小
                core.query(function (item) {
                    return item.$MScroll && item.isShow();
                }).forEach(function (item) {
                    if (item.$MScrollData.top === undefined) {
                        item.$MScrollData.cacheTop = true;
                        var main = item.getMain();
                        item.$MScrollData.top = main.clientHeight - main.scrollHeight + (tx.test(item.getBody().style.transform) ? +RegExp.$2 : 0);
                    }
                });

                if (keyboardHeight) {
                    var timerHandle = util.timer(fixed, -1);

                    util.timer(function () {
                        timerHandle();
                    }, 1000);

                    // 软键盘切换INPUT，已经有高度，恢复状态
                    core.enable();
                } else {
                    core.disable();
                    keyboardHandle = util.timer(function () {
                        var lastScrollY = window.scrollY;
                        document.body.style.visibility = 'hidden';
                        window.scrollTo(0, 100000000);
                        util.timer(function () {
                            keyboardHeight = window.scrollY + document.body.clientHeight - document.body.scrollHeight - (safariVersion ? 45 : 0);
                            document.body.style.visibility = '';
                            window.scrollTo(0, lastScrollY);
                            fixed();
                        }, 100);
                        core.enable();
                    }, 1000);
                }
            });

            dom.addEventListener(document, 'focusout', function (event) {
                if (event.target.readOnly || event.target.tagName === 'SELECT' || (event.target.tagName === 'INPUT' && (event.target.type === 'radio' || event.target.type === 'checkbox'))) {
                    return;
                }

                keyboardHandle();

                core.query(function (item) {
                    return item.$MScroll && item.isShow();
                }).forEach(function (item) {
                    item.setPosition(item.getX(), Math.max(item.$MScrollData.top, Math.min(0, item.getY())));
                    if (item.$MScrollData.cacheTop) {
                        item.$MScrollData.cacheTop = false;
                        delete item.$MScrollData.top;
                    }
                });
                topList.concat(bottomList).forEach(function (item) {
                    item.getMain().style.transform = '';
                });

                core.disable();
                keyboardHandle = util.timer(function () {
                    keyboardHeight = 0;
                    core.enable();
                }, 1000);
            });

            ext.iosFixed = function (control, value) {
                if (value === 'bottom') {
                    bottomList.push(control);
                } else {
                    topList.push(control);
                }

                core.addEventListener(control, 'dispose', function () {
                    util.remove(topList, this);
                    util.remove(bottomList, this);
                });
            };
        } else {
            var scroll;

            // android，处理软键盘问题
            dom.addEventListener(window, 'resize', function () {
                if (document.documentElement.clientHeight < util.toNumber(document.body.style.height)) {
                    // 打开软键盘
                    document.activeElement.scrollIntoViewIfNeeded();

                    if (window.scrollY) {
                        for (scroll = core.findControl(document.activeElement); scroll; scroll = scroll.getParent()) {
                            if (scroll.$MScroll) {
                                scroll.setPosition(scroll.getX(), scroll.getY() - window.scrollY);
                                window.scrollTo(0, 0);
                            }
                        }
                    }
                } else if (scroll) {
                    util.timer(function () {
                        scroll = null;
                    }, 1000);
                }
            });

            dom.addEventListener(document, 'focusout', function () {
                if (scroll) {
                    scroll.getBody().style.transform = '';
                }
            });
        }
    }
}());
