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
                if (util.hasIOSKeyboard()) {
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

    /**
     * 滚动监听。
     * @private
     */
    function scrollListener(fn) {

        function onscroll() {
            checkHandle();
            waitHandle();

            if (lastScrollY === window.scrollY) {
                window.cancelAnimationFrame(handle);
                handle = window.requestAnimationFrame(function () {
                    if (fn) {
                        fn();
                    }
                    dom.removeEventListener(window, 'scroll', onscroll);
                });
            } else {
                lastScrollY = window.scrollY;
                window.cancelAnimationFrame(handle);
                handle = window.requestAnimationFrame(onscroll);
            }
        }

        keyboardHandle();

        var lastScrollY = window.scrollY,
            // 保证1s后至少能触发一次执行
            waitHandle = util.timer(onscroll, 1000),
            checkHandle = util.timer(function () {
                if (window.scrollY !== lastScrollY) {
                    waitHandle();
                    onscroll();
                }
            }, -20),
            handle;

        dom.addEventListener(window, 'scroll', onscroll);

        return function () {
            waitHandle();
            checkHandle();
            window.cancelAnimationFrame(handle);
            dom.removeEventListener(window, 'scroll', onscroll);
            fn = null;
        };
    }
//{if 0}//
    var isSimulator = true;
    try {
        isSimulator = !window.localStorage;
    } catch (ignore) {
    }
//{/if}//
    function fixed(scrollY) {
//{if 0}//
        if (!isSimulator) {
//{/if}//
            // 解除滚动下方的白条与半像素问题
            window.scrollTo(0, Math.min(keyboardHeight, window.scrollY));
//{if 0}//
        }
//{/if}//
        scrollY = scrollY === undefined ? window.scrollY : scrollY;
        iosfixedList.forEach(function (item) {
            item.control.getMain().style.transform = 'translateY(' + (item.top ? scrollY : scrollY - keyboardHeight) + 'px)';
        });
    }

    if (isToucher) {
        var iosfixedList,
            keyboardHandle = util.blank,
            scroll;

        if (iosVersion) {
            dom.addEventListener(window, 'keyboardchange', function (event) {
                keyboardHandle();
                keyboardHeight = event.data - (safariVersion ? 45 : 0);

                core.query(function (item) {
                    return item.$MScroll;
                }).forEach(function (item) {
                    if (item.$MScrollData.top) {
                        item.setPosition(
                            item.getX(),
                            Math.max(
                                item.$MScrollData.top + window.scrollY - keyboardHeight,
                                Math.min(
                                    (item.$MScrollData.bottom !== undefined ? item.$MScrollData.bottom : 0) + window.scrollY,
                                    item.getY()
                                )
                            )
                        );
                    }
                });

                fixed();
            });

            dom.addEventListener(document, 'focusin', function (event) {
                var target = event.target,
                    lastScrollY;

                if (!util.hasIOSKeyboard(target)) {
                    return;
                }

                keyboardHandle();

                if (!iosfixedList) {
                    iosfixedList = ext.iosFixed.getVisibles();
                }

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
//{if 0}//
                    if (isSimulator) {
                        lastScrollY = window.scrollY;
                    } else {
//{/if}//
                        lastScrollY = Math.min(window.scrollY, keyboardHeight);
//{if 0}//
                    }
//{/if}//
                    keyboardHandle = scrollListener(function () {
                        for (scroll = core.findControl(document.activeElement); scroll; scroll = scroll.getParent()) {
                            if (scroll.$MScroll) {
                                var main = scroll.getMain(),
                                    scrollY = scroll.getY(),
                                    scrollTop = dom.getPosition(main).top,
                                    scrollHeight = scroll.getHeight() - keyboardHeight,
                                    activeTop = dom.getPosition(target).top + main.scrollTop - window.scrollY + scrollY,
                                    activeHeight = target.offsetHeight;

                                if (activeTop < scrollTop || activeTop + activeHeight > scrollTop + scrollHeight) {
                                    scroll.setPosition(
                                        scroll.getX(),
                                        Math.max(
                                            scroll.$MScrollData.top + window.scrollY - keyboardHeight,
                                            Math.min(
                                                (scroll.$MScrollData.bottom !== undefined ? scroll.$MScrollData.bottom : 0) + window.scrollY,
                                                scrollY - activeTop + Math.round((scrollHeight - activeHeight) / 2)
                                            )
                                        )
                                    );
                                }
                                break;
                            }
                        }

                        // 反向动画抵消ios的滚屏动画效果，如果webview关闭了滚屏动画，需要执行fixed()消除抖动
                        if (lastScrollY !== window.scrollY) {
                            iosfixedList.forEach(function (item) {
                                item.control.getMain().style.visibility = 'hidden';
                            });
                            util.timer(function () {
                                iosfixedList.forEach(function (item) {
                                    item.control.getMain().style.visibility = '';
                                });
                            }, 200);
                        }
                        fixed();
                        // fixed(lastScrollY);
                        // effect.grade(function (precent, options) {
                        //     fixed(lastScrollY + Math.round((options.to - lastScrollY) * precent));
                        // }, 200, {to: window.scrollY});

                        core.enable();
                    });
                } else {
                    core.disable();

                    keyboardHandle = scrollListener(function () {
//{if 0}//
                        if (isSimulator) {
                            // 在模拟器内运行
                            switch (screen.height) {
                            case 568:
                                // iphone 5s/se
                                keyboardHeight = 253;
                                break;
                            case 667:
                                // iphone 6/7/8
                                keyboardHeight = 258;
                                break;
                            case 736:
                                // iphone 6/7/8 plus
                                keyboardHeight = 271;
                                break;
                            case 812:
                                //iphoneX
                                keyboardHeight = 294;
                                break;
                            default:
                                window.alert('不能识别的型号');
                            }
                            fixed();
                            core.enable();
                            return;
                        }
//{/if}//
                        // 第一次触发，开始测试软键盘高度
                        lastScrollY = window.scrollY;
                        document.body.style.visibility = 'hidden';

                        util.timer(function () {
                            document.body.style.visibility = '';
                        }, 500);

                        keyboardHandle = scrollListener(function () {
                            // 第二次触发，计算软键盘高度
                            keyboardHeight = window.scrollY + document.body.clientHeight - document.body.scrollHeight - (safariVersion ? 45 : 0);
                            document.body.style.visibility = '';
                            // 复位
                            window.scrollTo(0, lastScrollY);
                            fixed();
                            // 计算成功解除框架事件锁定
                            core.enable();
                        });
                        window.scrollTo(0, 100000);
                    });
                }

                util.timer(function () {
                    // 一秒后强制解除框架事件锁定
                    core.enable();
                }, 1000);
            });

            dom.addEventListener(document, 'focusout', function (event) {
                if (!util.hasIOSKeyboard(event.target)) {
                    return;
                }

                keyboardHandle();

                iosfixedList.forEach(function (item) {
                    item.control.getMain().style.transform = '';
                });

                core.disable();
                keyboardHandle = util.timer(function () {
                    core.query(function (item) {
                        return item.$MScroll;
                    }).forEach(function (item) {
                        item.setPosition(item.getX(), Math.max(item.$MScrollData.top, Math.min(0, item.getY())));
                        if (item.$MScrollData.cacheTop) {
                            item.$MScrollData.cacheTop = false;
                            delete item.$MScrollData.top;
                        }
                    });

                    keyboardHeight = 0;
                    iosfixedList = null;
                    core.enable();
                }, 300);
            });
        } else {
            // android，处理软键盘问题
            dom.addEventListener(window, 'resize', function () {
                var height = document.documentElement.clientHeight,
                    currHeight = util.toNumber(document.body.style.height),
                    target = document.activeElement;

                if (height < currHeight) {
                    // 打开软键盘
                    target.scrollIntoViewIfNeeded();

                    if (window.scrollY) {
                        for (scroll = core.findControl(document.activeElement); scroll; scroll = scroll.getParent()) {
                            if (scroll.$MScroll) {
                                var main = scroll.getMain();
                                scroll.setPosition(scroll.getX(), Math.max(main.clientHeight - main.scrollHeight, scroll.getY() - window.scrollY));
                                window.scrollTo(0, 0);
                                break;
                            }
                        }
                    }

                    keyboardHandle();

                    keyboardHandle = util.timer(function () {
                        for (scroll = core.findControl(document.activeElement); scroll; scroll = scroll.getParent()) {
                            if (scroll.$MScroll) {
                                var scrollY = scroll.getY(),
                                    scrollTop = dom.getPosition(main).top,
                                    scrollHeight = scroll.getHeight() + height - currHeight,
                                    activeTop = dom.getPosition(target).top + main.scrollTop + scrollY,
                                    activeHeight = target.offsetHeight;

                                if (activeTop < scrollTop + activeHeight) {
                                    // 处理微信提示信息的问题
                                    scroll.setPosition(
                                        scroll.getX(),
                                        Math.min(
                                            scroll.$MScrollData.bottom !== undefined ? scroll.$MScrollData.bottom : 0,
                                            scrollY + scrollHeight + activeHeight - activeHeight
                                        )
                                    );
                                } else if (activeTop + activeHeight > scrollTop + scrollHeight) {
                                    scroll.setPosition(
                                        scroll.getX(),
                                        Math.max(
                                            (scroll.$MScrollData.top !== undefined ? scroll.$MScrollData.top : scrollHeight - main.scrollHeight + (tx.test(scroll.getBody().style.transform) ? +RegExp.$2 : 0)),
                                            scrollY - Math.ceil((activeTop + activeHeight - scrollTop - scrollHeight) / height) * height + activeHeight
                                        )
                                    );
                                }
                                break;
                            }
                        }
                    }, 100);
                } else if (scroll) {
                    util.timer(function () {
                        scroll = null;
                    }, 1000);
                }
            });

            dom.addEventListener(window, 'focusin', function () {
                // 解决软键盘状态下切换的情况
                document.activeElement.scrollIntoViewIfNeeded();
            });

            dom.addEventListener(document, 'focusout', function () {
                if (scroll) {
                    scroll.getBody().style.transform = '';
                }
            });
        }
    }
}());
