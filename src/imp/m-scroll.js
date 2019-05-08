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
        iosVersion = /(iPhone|iPad).*?OS (\d+(_\d+)?)/i.test(navigator.userAgent) ? +(RegExp.$2.replace('_', '.')) : undefined,
        safariVersion = !/(chrome|crios|ucbrowser)/i.test(navigator.userAgent) && /(\d+\.\d)(\.\d)?\s+.*safari/i.test(navigator.userAgent) ? +RegExp.$1 : undefined;
//{/if}//
    var topList = [],
        bottomList = [];

    ext.iosFixed = {
        /**
         * IOS fixed定位插件加载。
         * @public
         *
         * @param {string} value 插件的参数，表示定位的位置，top或者是bottom
         */
        constructor: function (value) {
            if (value === 'bottom') {
                bottomList.push(this);
            } else {
                topList.push(this);
            }
        },

        Events: {
            dispose: function () {
                util.remove(topList, this);
                util.remove(bottomList, this);
            }
        }
    };

    var keyboardHeight = 0,
        statusHeight = 0,
        innerKeyboardHeight;

    if (iosVersion && safariVersion) {
        switch (screen.height) {
        case 568:
            // iphone 5S/SE
            statusHeight = 44;
            innerKeyboardHeight = 253;
            break;
        case 667:
            // iphone 6/7/8/6S
            statusHeight = 44;
            innerKeyboardHeight = iosVersion < 12 ? 258 : 260;
            break;
        case 736:
            // iphone 6/7/8 Plus
            statusHeight = 44;
            innerKeyboardHeight = 271;
            break;
        case 812:
            // iphone X/XS
            statusHeight = 83;
            innerKeyboardHeight = iosVersion < 12 ? 294 : 296;
            break;
        case 896:
            // iphone XR/XS max
            statusHeight = 83;
            innerKeyboardHeight = 307;
            break;
        }
    }

    function getOptions(scroll) {
        var main = scroll.getMain(),
            body = scroll.getBody(),
            data = scroll.$MScrollData,
            options = {
                decelerate: 400,
                absolute: true
            };

        if (keyboardHeight && data.range) {
            data = data.range;
            options.limit = {};
        } else {
            options.limit = data.range;
        }

        Object.assign(
            options,
            {
                left: data.left !== undefined ? data.left : main.clientWidth - body.scrollWidth,
                right: data.right !== undefined ? data.right : 0,
                top: data.top !== undefined ? data.top : main.clientHeight - body.scrollHeight,
                bottom: data.bottom !== undefined ? data.bottom : 0
            }
        );

        // 如果内容不够外部区域的宽度，不需要滚动
        if (options.left > options.right) {
            options.left = options.right;
            if (options.limit) {
                delete options.limit.left;
                delete options.limit.right;
            }
        }
        if (options.top > options.bottom) {
            options.top = options.bottom;
            if (options.limit) {
                delete options.limit.top;
                delete options.limit.bottom;
            }
        }

        if (keyboardHeight) {
            var mainTop = dom.getPosition(main).top + scroll.$$border[0],
                mainBottom = mainTop + Math.min(body.scrollHeight, main.clientHeight),
                top = 0,
                bottom = 0;
            options.top += Math.min(0, window.scrollY - keyboardHeight + document.body.clientHeight - mainBottom);
            options.bottom += Math.max(0, window.scrollY - mainTop);

            topList.forEach(function (control) {
                if (control.isShow() && !dom.contain(main.offsetParent, control.getMain())) {
                    bottom = Math.max(bottom, dom.getPosition(control.getMain()).top + control.getHeight() - Math.max(window.scrollY, mainTop));
                }
            });
            bottomList.forEach(function (control) {
                if (control.isShow() && !dom.contain(main.offsetParent, control.getMain())) {
                    var controlTop = dom.getPosition(control.getMain()).top;
                    top = Math.min(top, Math.max(Math.min(0, controlTop - mainBottom), controlTop - window.scrollY + keyboardHeight - document.body.clientHeight));
                }
            });

            options.top += top;
            options.bottom += bottom;
        }

        // 增加滚动边界的距离
        if (!options.limit && data.overflow) {
            options.limit = {
                top: options.top,
                right: options.right,
                bottom: options.bottom,
                left: options.left
            };
            options.top -= data.overflow[0];
            options.right += data.overflow[1];
            options.bottom += data.overflow[2];
            options.left -= data.overflow[3];
        }

        return options;
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

            if (options.overflow) {
                var list = options.overflow.split(',');
                this.$MScrollData.overflow = [+list[0]];
                this.$MScrollData.overflow[1] = list[1] ? +list[1] : this.$MScrollData.overflow[0];
                this.$MScrollData.overflow[2] = list[2] ? +list[2] : this.$MScrollData.overflow[0];
                this.$MScrollData.overflow[3] = list[3] ? +list[3] : this.$MScrollData.overflow[1];
            }
        },

        Methods: {
            /**
             * @override
             */
            $activate: function (event) {
                this.$MScroll.$activate.call(this, event);

                if (keyboardHeight && iosVersion < 9) {
                    return;
                }

                if (!util.hasIOSKeyboard(event.target)) {
                    this.cache();

                    core.drag(
                        this,
                        event,
                        getOptions(this)
                    );
                }
            },

            /**
             * @override
             */
            $dragend: function (event) {
                this.$MScroll.$dragend.call(this, event);
                this.$MScrollData.scrolling = false;
                this.$MScrollData.inertia = false;

                var activeElement = document.activeElement;
                if (util.hasIOSKeyboard(activeElement) && activeElement.value) {
                    // 当input有placeholder的时候，会导致光标无法隐藏
                    this.$MScrollData._oHandler = util.timer(
                        function () {
                            dom.setStyle(activeElement, 'userSelect', '');
                            delete this.$MScrollData._oHandler;
                        },
                        50,
                        this
                    );
                }
            },

            /**
             * @override
             */
            $dragmove: function (event) {
                this.$MScroll.$dragmove.call(this, event);
                this.$MScrollData.inertia = !!event.inertia;
            },

            /**
             * @override
             */
            $dragstart: function (event) {
                this.$MScroll.$dragstart.call(this, event);
                this.$MScrollData.scrolling = true;

                if (util.hasIOSKeyboard(document.activeElement)) {
                    if (this.$MScrollData._oHandler) {
                        this.$MScrollData._oHandler();
                    } else {
                        dom.setStyle(document.activeElement, 'userSelect', 'none');
                    }
                }
            },

            /**
             * @override
             */
            getPositionElement: function () {
                return this.getBody();
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
                return util.toNumber(dom.getStyle(this.getBody(), 'transform').split(',')[4]);
            },

            /**
             * @override
             */
            getY: function () {
                return util.toNumber(dom.getStyle(this.getBody(), 'transform').split(',')[5]);
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
                // 解决光标问题
                if (this.getX() !== x || this.getY() !== y) {
                    dom.setStyle(this.getBody(), 'transform', keyboardHeight ? 'translate(' + x + 'px,' + y + 'px)' : 'translate3d(' + x + 'px,' + y + 'px,0px)');
                }
                core.query(function (item) {
                    return this.contain(item);
                }.bind(this)).forEach(function (item) {
                    core.dispatchEvent(item, 'beforescroll', {deltaX: x, deltaY: y});
                    core.dispatchEvent(item, 'scroll', {deltaX: x, deltaY: y});
                });
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

    function scrollIntoViewIfNeededHandler(event) {
        if (event && iosVersion) {
            dom.setStyle(event.target, 'userSelect', '');
            if (event.target.value === event.data) {
                util.timer(function () {
                    var input = event.target,
                        type = input.type,
                        pos = input.value.length;

                    if ('number' === typeof input.selectionStart) {
                        input.setSelectionRange(pos, pos);
                    } else {
                        input.type = 'text';
                        input.setSelectionRange(pos, pos);
                        input.type = type;
                    }
                });
            }
        }
        scrollIntoViewIfNeeded(keyboardHeight);
    }

    function fixed(scrollY) {
        scrollY = scrollY === undefined ? window.scrollY : scrollY;
        topList.forEach(function (control) {
            dom.setStyle(control.getMain(), 'transform', 'translateY(' + scrollY + 'px)');
        });
        bottomList.forEach(function (control) {
            dom.setStyle(control.getMain(), 'transform', 'translateY(' + (scrollY - keyboardHeight) + 'px)');
        });
    }

    function scrollIntoViewIfNeeded(height) {
        for (var scroll = core.findControl(document.activeElement); scroll; scroll = scroll.getParent()) {
            if (scroll.$MScroll) {
                var main = scroll.getMain(),
                    scrollTop = main.scrollTop;
                if (scrollTop) {
                    main.scrollTop = 0;
                    scroll.setPosition(scroll.getX(), scroll.getY() - scrollTop);
                }

                scrollTop = dom.getPosition(main).top;
                var scrollHeight = scroll.getHeight() - height,
                    activeTop = dom.getPosition(document.activeElement).top - window.scrollY;

                break;
            }
        }

        if (!scroll) {
            scrollTop = 0;
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
            setSafePosition(scroll, scroll.getY() + y);
        } else if (y) {
            window.scrollTo(0, window.scrollY + y);
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
                window.requestAnimationFrame(function () {
                    if (fn) {
                        fn();
                        fn = null;
                    }
                });
            } else {
                lastScrollY = window.scrollY;
                window.requestAnimationFrame(onscroll);
            }
        }

        keyboardHandle();

        var lastScrollY = window.scrollY,
            // 保证1s后至少能触发一次执行
            waitHandle = util.timer(onscroll, 1000),
            checkHandle = util.timer(
                function () {
                    if (window.scrollY !== lastScrollY) {
                        onscroll();
                    }
                },
                -20
            );

        return function () {
            waitHandle();
            checkHandle();
            fn = null;
        };
    }

    function allSafePosition() {
        core.query(function (control) {
            if (control.$MScroll) {
                // 终止之前可能存在的惯性状态，并设置滚动层的位置
                core.drag(control);
                setSafePosition(control, control.getY());
            }
        });
    }

    function setSafePosition(scroll, y) {
        var options = getOptions(scroll),
            top = options.limit && options.limit.top !== undefined ? options.limit.top : options.top,
            bottom = options.limit && options.limit.bottom !== undefined ? options.limit.bottom : options.bottom;

        scroll.setPosition(scroll.getX(), Math.min(bottom, Math.max(top, y)));
    }

    if (isToucher) {
        var keyboardHandle = util.blank,
            changeHandle = util.blank,
            // 在一个输入框获取焦点后使其它输入框都处于失效状态，手势触发的时候解除失效状态，如果不是点击行为，重新设置失效状态
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
            disabledInputs = [],
            events = iosVersion ? {
                touchstart: function (event) {
                    if (disabledInputs.indexOf(event.target) >= 0) {
                        event.target.disabled = false;
                    } else {
                        disabledInputs.forEach(function (item) {
                            item.disabled = false;
                        });
                    }
                    observer.takeRecords();
                },

                touchend: function (event) {
                    util.timer(
                        function () {
                            if (disabledInputs.indexOf(event.target) >= 0) {
                                if (document.activeElement !== event.target) {
                                    event.target.disabled = true;
                                    observer.takeRecords();
                                }
                            } else {
                                disabledInputs.forEach(function (item) {
                                    item.disabled = true;
                                });
                                observer.takeRecords();
                            }
                        },
                        20
                    );
                },

                keyboardchange: function (event) {
                    keyboardHandle();

                    var oldHeight = keyboardHeight;
                    keyboardHeight = Math.max(0, event.height - statusHeight);

                    if (oldHeight !== keyboardHeight) {
                        changeHandle();
                        if (!keyboardHeight) {
                            dom.removeEventListener(window, 'touchmove', util.preventEvent);
                        } else if (!oldHeight) {
                            dom.addEventListener(window, 'touchmove', util.preventEvent);
                        }

                        if (keyboardHeight) {
                            if (util.hasIOSKeyboard(document.activeElement)) {
                                if (oldHeight) {
                                    fixed();
                                } else {
                                    changeHandle = scrollListener(function () {
                                        fixed();
                                    });
                                }
                            }
                        } else {
                            changeHandle = util.timer(
                                function () {
                                    window.scrollTo(0, 0);
                                    allSafePosition();
                                },
                                100
                            );
                        }
                    }
                },

                focusin: function (event) {
                    if (!util.hasIOSKeyboard(event.target)) {
                        return;
                    }

                    dom.addEventListener(event.target, 'input', scrollIntoViewIfNeededHandler);
                    dom.addEventListener(event.target, 'keydown', scrollIntoViewIfNeededHandler);

                    Array.prototype.slice.call(document.getElementsByTagName('INPUT')).concat(Array.prototype.slice.call(document.getElementsByTagName('TEXTAREA'))).forEach(function (item) {
                        if (item !== event.target) {
                            if (!item.disabled) {
                                item.disabled = true;
                                disabledInputs.push(item);
                            }
                            observer.observe(item, {attributes: true, attributeFilter: ['disabled']});
                        }
                    });

                    keyboardHandle();

                    if (keyboardHeight) {
                        // 焦点控件切换
                        core.setFocused(core.findControl(event.target));

                        keyboardHandle = scrollListener(function () {
                            fixed();
                            scrollIntoViewIfNeededHandler();
                        });
                    } else {
                        keyboardHandle = scrollListener(function () {
                            if (iosVersion === 11.1 || iosVersion === 11.2) {
                                keyboardHeight = safariVersion ? innerKeyboardHeight : innerKeyboardHeight + statusHeight;
                                dom.addEventListener(window, 'touchmove', util.preventEvent);
                                fixed();
                                return;
                            }

                            // 第一次触发，开始测试软键盘高度
                            var lastScrollY = window.scrollY;
                            document.body.style.visibility = 'hidden';

                            util.timer(
                                function () {
                                    document.body.style.visibility = '';
                                },
                                500
                            );

                            window.scrollTo(0, document.body.scrollHeight);
                            keyboardHandle = scrollListener(function () {
                                // 第二次触发，计算软键盘高度
                                keyboardHeight = window.scrollY - statusHeight;
                                dom.addEventListener(window, 'touchmove', util.preventEvent);
                                // 复位
                                document.body.style.visibility = '';
                                window.scrollTo(0, Math.min(lastScrollY, keyboardHeight));

                                fixed();
                                scrollIntoViewIfNeededHandler();
                            });
                        });
                    }
                },

                focusout: function (event) {
                    if (!util.hasIOSKeyboard(event.target)) {
                        return;
                    }

                    dom.removeEventListener(event.target, 'input', scrollIntoViewIfNeededHandler);
                    dom.removeEventListener(event.target, 'keydown', scrollIntoViewIfNeededHandler);

                    observer.disconnect();
                    disabledInputs.forEach(function (item) {
                        item.disabled = false;
                    });
                    disabledInputs = [];

                    keyboardHandle();

                    topList.concat(bottomList).forEach(function (control) {
                        dom.setStyle(control.getMain(), 'transform', '');
                    });

                    if (window.scrollY) {
                        keyboardHandle = scrollListener(function () {
                            keyboardHeight = 0;
                            window.scrollTo(0, 0);
                            allSafePosition();
                            dom.removeEventListener(window, 'touchmove', util.preventEvent);
                        });
                    } else {
                        keyboardHandle = util.timer(
                            function () {
                                keyboardHeight = 0;
                                allSafePosition();
                                dom.removeEventListener(window, 'touchmove', util.preventEvent);
                            },
                            100
                        );
                    }
                }
            } : {
                // android，处理软键盘问题
                keyboardchange: function (event) {
                    var height = event.height;

                    if (height) {
                        // 打开软键盘
                        document.activeElement.scrollIntoViewIfNeeded();

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
                },

                focusin: function (event) {
                    dom.addEventListener(event.target, 'input', scrollIntoViewIfNeededHandler);
                    // 解决软键盘状态下切换的情况
                    dom.addEventListener(window, 'touchmove', util.preventEvent);
                    // 焦点控件切换
                    core.setFocused(core.findControl(event.target));
                },

                focusout: function (event) {
                    dom.removeEventListener(event.target, 'input', scrollIntoViewIfNeededHandler);
                    dom.removeEventListener(window, 'touchmove', util.preventEvent);
                    keyboardHandle = scrollListener(function () {
                        allSafePosition();
                    });
                }
            };

        dom.addEventListeners(window, events);
    }
}());
