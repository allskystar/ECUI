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
        iosVersion = /(iPhone|iPad).*?OS (\d+(_\d+)?)/i.test(navigator.userAgent) ?  +(RegExp.$2.replace('_', '.')) : undefined,
        safariVersion = !/(chrome|crios|ucbrowser)/i.test(navigator.userAgent) && /(\d+\.\d)(\.\d)?\s+.*safari/i.test(navigator.userAgent) ? +RegExp.$1 : undefined;
//{/if}//
    var tx = /(\-?\d+)px\s*,\s*(\-?\d+)/,
        keyboardHeight = 0,
        statueHeight = 0,
        innerKeyboardHeight,
        bodyScrollTop = 0;

    if (iosVersion && safariVersion) {
        switch (screen.height) {
        case 568:
            // iphone 5S/SE
            statueHeight = 44;
            innerKeyboardHeight = 253;
            break;
        case 667:
            // iphone 6/7/8/6S/7S
            statueHeight = 44;
            innerKeyboardHeight = 260;
            break;
        case 736:
            // iphone 6/7/8 Plus
            statueHeight = 44;
            innerKeyboardHeight = 271;
            break;
        case 812:
            // iphone X/XS
            statueHeight = 83;
            innerKeyboardHeight = 296;
            break;
        case 896:
            // iphone XR/XS max
            statueHeight = 83;
            innerKeyboardHeight = 307;
            break;
        }
    }

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
                this.cache();

                this.$MScroll.$activate.call(this, event);

                var main = this.getMain(),
                    body = this.getBody(),
                    data = this.$MScrollData,
                    flag = util.hasIOSKeyboard() && tx.test(this.getBody().style.transform);

                core.drag(
                    this,
                    event,
                    {
                        el: body,
                        decelerate: 400,
                        absolute: true,
                        left: data.left !== undefined ? data.left : main.clientWidth - main.scrollWidth + (flag ? +RegExp.$1 : 0),
                        right: data.right !== undefined ? data.right : 0,
                        top: (data.top !== undefined ? data.top : main.clientHeight - main.scrollHeight + (flag ? +RegExp.$2 : 0)) + Math.min(0, window.scrollY - keyboardHeight),
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
            window.scrollTo(0, Math.min(keyboardHeight + bodyScrollTop, window.scrollY));
//{if 0}//
        }
//{/if}//

        scrollY = scrollY === undefined ? window.scrollY : scrollY;
        iosfixedList.forEach(function (item) {
            item.control.getMain().style.transform = 'translateY(' + (item.top ? scrollY : scrollY - keyboardHeight) + 'px)';
        });
    }

    function scrollIntoViewIfNeeded(height) {
        for (var scroll = core.findControl(document.activeElement); scroll; scroll = scroll.getParent()) {
            if (scroll.$MScroll) {
                var main = scroll.getMain(),
                    scrollY = scroll.getY(),
                    scrollTop = dom.getPosition(main).top,
                    scrollHeight = scroll.getHeight() - height,
                    activeTop = dom.getPosition(document.activeElement).top + main.scrollTop - window.scrollY + scrollY;
                break;
            }
        }

        if (!scroll) {
            scrollTop = bodyScrollTop;
            scrollHeight = document.body.clientHeight - height;
            activeTop = dom.getPosition(document.activeElement).top - window.scrollY;
        }

        var activeHeight = document.activeElement.offsetHeight,
            infoHeight = /MicroMessanger/.test(navigator.userAgent) ? 30 : 0, // 处理微信提示信息的高度
            y = 0;

        if (activeTop < scrollTop + infoHeight) {
            y = scrollTop + infoHeight - activeTop + (activeHeight < 50 ? Math.floor(activeHeight / 2) : 0);
        } else if (activeTop + activeHeight > scrollTop + scrollHeight) {
            if (activeHeight < 50) {
                y = scrollTop + scrollHeight - activeTop - activeHeight - Math.floor(activeHeight / 2);
            } else if (activeHeight > scrollHeight - infoHeight) {
                y = scrollTop + infoHeight - activeTop;
            } else {
                y = scrollTop + scrollHeight - activeTop - activeHeight;
            }
        }

        if (scroll) {
            setSafePosition(scroll, scrollY + y, scrollHeight, keyboardHeight);
        } else {
            window.scrollTo(0, window.scrollY - y);
        }
    }

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

        return function () {
            waitHandle();
            checkHandle();
            window.cancelAnimationFrame(handle);
            fn = null;
        };
    }

    function setSafePosition(scroll, y, scrollHeight, keyboardHeight) {
        scroll.setPosition(
            scroll.getX(),
            Math.min(
                (scroll.$MScrollData.bottom !== undefined ? scroll.$MScrollData.bottom : 0) + window.scrollY,
                Math.max(
                    // ios下data.top已经提前计算好，android下window.scrollY与keyboardHeight恒为零
                    (scroll.$MScrollData.top !== undefined ? scroll.$MScrollData.top : scrollHeight - scroll.getMain().scrollHeight + (util.hasIOSKeyboard() && tx.test(scroll.getBody().style.transform) ? +RegExp.$2 : 0)) + window.scrollY - keyboardHeight,
                    y
                )
            )
        );
    }

    if (isToucher) {
        var iosfixedList,
            keyboardHandle = util.blank,
            changeHandle = util.blank,
            observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (item) {
                    if (item.target.disabled) {
                        util.remove(disabledInputs, item.target);
                    } else {
                        item.target.disabled = true;
                        disabledInputs.push(item.target);
                    }
                });
                observer.takeRecords();
            }),
            disabledInputs = [];

        if (iosVersion) {
            // 在一个输入框获取焦点后使其它输入框都处于失效状态，手势触发的时候解除失效状态，如果不是点击行为，重新设置失效状态
            dom.addEventListener(document, 'touchstart', function (event) {
                if (disabledInputs.indexOf(event.target) >= 0) {
                    event.target.disabled = false;
                    util.timer(function () {
                        if (document.activeElement !== event.target) {
                            event.target.disabled = true;
                        }
                        observer.takeRecords();
                    }, 500);
                    observer.takeRecords();
                }
            });

            dom.addEventListener(window, 'keyboardchange', function (event) {
                keyboardHandle();

                var oldHeight = keyboardHeight;
                keyboardHeight = Math.max(0, event.height - statueHeight);

                changeHandle();
                if (!keyboardHeight) {
                    dom.removeEventListener(document, 'touchmove', util.preventEvent);
                } else if (!oldHeight) {
                    dom.addEventListener(document, 'touchmove', util.preventEvent);
                }
                if (oldHeight && keyboardHeight) {
                    fixed();
                    scrollIntoViewIfNeeded(keyboardHeight);
                } else {
                    changeHandle = scrollListener(function () {
                        fixed();
                        scrollIntoViewIfNeeded(keyboardHeight);
                    });
                }
            });

            dom.addEventListener(document, 'focusin', function (event) {
                var target = event.target,
                    lastScrollY;

                if (!util.hasIOSKeyboard(target)) {
                    return;
                }

                Array.prototype.slice.call(document.getElementsByTagName('INPUT')).concat(Array.prototype.slice(document.getElementsByTagName('TEXTAREA'))).forEach(function (item) {
                    if (item !== target) {
                        if (!item.disabled) {
                            item.disabled = true;
                            disabledInputs.push(item);
                        }
                        observer.observe(item, {attributes: true, attributeFilter: ['disabled']});
                    }
                });

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

//由于不再会有软键盘实现的焦点切换，因此不再需要重新计算位置
                if (!keyboardHeight) {
/*
//{if 0}//
                    if (isSimulator) {
                        lastScrollY = window.scrollY;
                    } else {
//{/if}//
                        lastScrollY = Math.min(window.scrollY, keyboardHeight);
//{if 0}//
                    }
//{/if}//
                    // 焦点控件切换
                    core.setFocused(core.findControl(target));

                    keyboardHandle = scrollListener(function () {
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
                        scrollIntoViewIfNeeded(keyboardHeight);

                        // 反向动画抵消ios的滚屏动画效果，如果webview关闭了滚屏动画，需要执行fixed()消除抖动
                        // fixed(lastScrollY);
                        // effect.grade(function (precent, options) {
                        //     fixed(lastScrollY + Math.round((options.to - lastScrollY) * precent));
                        // }, 200, {to: window.scrollY});
                    });
                } else {
*/
                    bodyScrollTop = document.body.scrollTop;
                    keyboardHandle = scrollListener(function () {
//{if 0}//
                        if (isSimulator) {
                            keyboardHeight = innerKeyboardHeight;
                            fixed();
                            dom.addEventListener(document, 'touchmove', util.preventEvent);
                            return;
                        }
//{/if}//
                        if (iosVersion === 11.1 || iosVersion === 11.2) {
                            keyboardHeight = innerKeyboardHeight;
                            return;
                        }

                        function calcKeyboardHeight() {
                            keyboardHandle = scrollListener(function () {
                                // 第二次触发，计算软键盘高度
                                keyboardHeight = window.scrollY + document.body.clientHeight - document.body.scrollHeight - statueHeight;
                                dom.addEventListener(document, 'touchmove', util.preventEvent);
                                // 复位
                                if (lastScrollY !== undefined) {
                                    document.body.style.visibility = '';
                                    window.scrollTo(0, lastScrollY);
                                }

                                fixed();
                                scrollIntoViewIfNeeded(keyboardHeight);
                            });
                        }

                        if (target.getControl) {
                            var control = target.getControl();
                            // 输入框在最下方，直接滚动到最下方
                            if (dom.getPosition(control.getMain()).top + control.getHeight() === document.body.scrollHeight) {
                                window.scrollTo(0, 100000);
                                calcKeyboardHeight();
                                return;
                            }
                        } else if (dom.getPosition(target).top + target.offsetHeight === document.body.scrollHeight) {
                            window.scrollTo(0, 100000);
                            calcKeyboardHeight();
                            return;
                        }

                        // 第一次触发，开始测试软键盘高度
                        lastScrollY = window.scrollY;
                        document.body.style.visibility = 'hidden';

                        util.timer(function () {
                            document.body.style.visibility = '';
                        }, 500);

                        window.scrollTo(0, 100000);
                        calcKeyboardHeight();
                    });
                }
            });

            dom.addEventListener(document, 'focusout', function (event) {
                if (!util.hasIOSKeyboard(event.target)) {
                    return;
                }

                observer.disconnect();
                disabledInputs.forEach(function (item) {
                    item.disabled = false;
                });
                disabledInputs = [];

                keyboardHandle();

                for (var scroll = core.findControl(event.target); scroll; scroll = scroll.getParent()) {
                    if (scroll.$MScroll) {
                        // 终止之前可能存在的惯性状态，并设置滚动层的位置
                        core.drag(scroll);
                        setSafePosition(scroll, scroll.getY(), scroll.getMain().clientHeight, keyboardHeight);
                        break;
                    }
                }

                iosfixedList.forEach(function (item) {
                    item.control.getMain().style.transform = '';
                });

                core.query(function (item) {
                    return item.$MScroll;
                }).forEach(function (item) {
                    item.setPosition(item.getX(), Math.max(item.$MScrollData.top, Math.min(0, item.getY())));
                    if (item.$MScrollData.cacheTop) {
                        item.$MScrollData.cacheTop = false;
                        delete item.$MScrollData.top;
                    }
                });

                keyboardHandle = scrollListener(function () {
                    if (scroll) {
                        setSafePosition(scroll, scroll.getY(), scroll.getMain().clientHeight, 0);
                    }

                    dom.removeEventListener(document, 'touchmove', util.preventEvent);
                    keyboardHeight = 0;
                    iosfixedList = null;
                });
            });
        } else {
            // android，处理软键盘问题
            dom.addEventListener(window, 'keyboardchange', function (event) {
                var height = event.height,
                    target = document.activeElement;

                if (height) {
                    // 打开软键盘
                    target.scrollIntoViewIfNeeded();

                    if (window.scrollY) {
                        for (var scroll = core.findControl(document.activeElement); scroll; scroll = scroll.getParent()) {
                            if (scroll.$MScroll) {
                                var main = scroll.getMain();
                                scroll.setPosition(scroll.getX(), Math.max(scroll.getHeight() - height - main.scrollHeight, scroll.getY()) - window.scrollY);
                                window.scrollTo(0, 0);
                                break;
                            }
                        }
                    }

                    keyboardHandle();
                    keyboardHandle = util.timer(scrollIntoViewIfNeeded, 100, this, height);
                }
            });

            dom.addEventListener(window, 'focusin', function (event) {
                // 解决软键盘状态下切换的情况
                dom.addEventListener(document, 'touchmove', util.preventEvent);
                // 焦点控件切换
                core.setFocused(core.findControl(event.target));
            });

            dom.addEventListener(document, 'focusout', function (event) {
                dom.removeEventListener(document, 'touchmove', util.preventEvent);
                for (var scroll = core.findControl(event.target); scroll; scroll = scroll.getParent()) {
                    if (scroll.$MScroll) {
                        // 终止之前可能存在的惯性状态，并设置滚动层的位置
                        scroll.getBody().style.transform = '';
                        core.drag(scroll);
                        keyboardHandle = scrollListener(function () {
                            setSafePosition(scroll, scroll.getY(), scroll.getMain().clientHeight, 0);
                        });
                        break;
                    }
                }
            });
        }
    }
}());
