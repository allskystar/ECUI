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
        bottomList = [],
        activeCloneElement;

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
        fixedHeight = 0,
        realTarget;

    if (iosVersion && safariVersion) {
        switch (screen.height) {
        case 568:
            // iphone 5S/SE
            statusHeight = 44;
            fixedHeight = 13;
            break;
        case 667:
            // iphone 6/7/8/6S
            statusHeight = 44;
            fixedHeight = 13;
            break;
        case 736:
            // iphone 6/7/8 Plus
            statusHeight = 44;
            fixedHeight = 13;
            break;
        case 812:
            // iphone X/XS
            statusHeight = 83;
            fixedHeight = 6;
            break;
        case 896:
            // iphone XR/XS max
            statusHeight = 83;
            break;
        }
    }

    function getOptions() {
        var main = this.getMain(),
            body = this.getBody(),
            options = {
                decelerate: 400,
                absolute: true
            };

        if (keyboardHeight && this.$MScrollData.range) {
            var range = this.$MScrollData.range;
            options.limit = {};
        } else {
            range = this.$MScrollData;
            options.limit = this.$MScrollData.range;
        }

        Object.assign(
            options,
            {
                left: range.left !== undefined ? range.left : main.clientWidth - body.scrollWidth,
                right: range.right !== undefined ? range.right : 0,
                top: range.top !== undefined ? range.top : main.clientHeight - body.scrollHeight,
                bottom: range.bottom !== undefined ? range.bottom : 0
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
            var mainTop = dom.getPosition(main).top + this.$$border[0],
                mainBottom = mainTop + Math.min(body.scrollHeight, main.clientHeight),
                top = 0,
                bottom = 0;
            options.top += Math.min(0, window.scrollY - keyboardHeight + document.body.clientHeight - mainBottom);
            options.bottom += Math.max(0, window.scrollY - mainTop);

            topList.forEach(function (control) {
                if (control.isShow() && !dom.contain(main, control.getMain())) {
                    bottom = Math.max(bottom, dom.getPosition(control.getMain()).top + control.getHeight() - Math.max(window.scrollY, mainTop));
                }
            });
            bottomList.forEach(function (control) {
                if (control.isShow() && !dom.contain(main, control.getMain())) {
                    var controlTop = dom.getPosition(control.getMain()).top;
                    top = Math.min(top, Math.max(Math.min(0, controlTop - mainBottom), controlTop - window.scrollY + keyboardHeight - document.body.clientHeight));
                }
            });

            options.top += top;
            options.bottom += bottom;
        }

        // 增加滚动边界的距离
        if (!options.limit && range.overflow) {
            options.limit = {
                top: options.top,
                right: options.right,
                bottom: options.bottom,
                left: options.left
            };
            options.top -= range.overflow[0];
            options.right += range.overflow[1];
            options.bottom += range.overflow[2];
            options.left -= range.overflow[3];
        }

        return options;
    }

    function calcY(scroll, height) {
        if (scroll) {
            var scrollTop = dom.getPosition(scroll.getMain()).top + scroll.getFixedTop(),
                scrollHeight = scroll.getHeight() - height - scroll.getFixedBottom(),
                activeTop = dom.getPosition(activeCloneElement || document.activeElement).top - window.scrollY;
        } else {
            scrollTop = 0;
            scrollHeight = document.body.clientHeight - height;
            activeTop = dom.getPosition(activeCloneElement || document.activeElement).top - window.scrollY;
        }

        var activeHeight = (activeCloneElement || document.activeElement).offsetHeight,
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
        return y;
    }

    ui.MScroll = _interface('$MScroll', {
        constructor: function (el, options) {
            var bodyEl = dom.create(
                    {
                        className: this.getUnitClass(ui.Control, 'body') + ' ui-mobile-scroll-body'
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
/*ignore*/
            this.$MScrollData.fixedTop = this.$MScrollData.fixedBottom = 0;
/*end*/
        },

        /**
         * @override
         */
        $activate: function (event) {
/*ignore*/
            this.$MScroll.$activate.call(this, event);
/*end*/
            if ((iosVersion && !keyboardHeight && document.activeElement !== document.body) || (keyboardHeight && iosVersion < 9)) {
                return;
            }

            if (!util.hasIOSKeyboard(event.target)) {
                this.cache();

                core.drag(
                    this,
                    event,
                    getOptions.call(this)
                );
            }
        },

        /**
         * @override
         */
        $dragend: function (event) {
/*ignore*/
            this.$MScroll.$dragend.call(this, event);
/*end*/
            this.$MScrollData.scrolling = false;
            this.$MScrollData.inertia = false;

            if (keyboardHeight && iosVersion !== 11.1 && iosVersion !== 11.2) {
                // 解决两端的input导致的跳动问题
                var options = getOptions.call(this),
                    height = util.getView().height / 2,
                    oldScrollY = window.scrollY,
                    y = this.getY();

                if (options.bottom - y > height) {
                    window.scrollTo(0, keyboardHeight);
                    fixed();
                } else if (y - options.top < height) {
                    window.scrollTo(0, 0);
                    fixed();
                }

                this.setPosition(this.getX(), y - oldScrollY + window.scrollY);
            }

            var activeElement = document.activeElement;
            if (util.hasIOSKeyboard(activeElement)) {
                if (!calcY(this, keyboardHeight)) {
                    showActiveElement();
                }

                this.getMain().scrollTop = 0;
            }
        },

        /**
         * @override
         */
        $dragmove: function (event) {
/*ignore*/
            this.$MScroll.$dragmove.call(this, event);
/*end*/
            this.$MScrollData.inertia = !!event.inertia;
        },

        /**
         * @override
         */
        $dragstart: function (event) {
/*ignore*/
            this.$MScroll.$dragstart.call(this, event);
/*end*/
            this.$MScrollData.scrolling = true;

            if (util.hasIOSKeyboard(document.activeElement)) {
                if (!activeCloneElement) {
                    dom.insertHTML(document.activeElement, 'afterEnd', document.activeElement.outerHTML);

                    activeCloneElement = document.activeElement.nextSibling;
                    document.activeElement.nextSibling.value = document.activeElement.value;
                    document.activeElement.style.display = 'none';
                }
            }
        },

        /**
         * 获取滚动区域底部高度调节。
         * @public
         *
         * @return {number} 底部需要调节的数值
         */
        getFixedBottom: function () {
            return this.$MScrollData.fixedBottom;
        },

        /**
         * 获取滚动区域顶部高度调节。
         * @public
         *
         * @return {number} 顶部需要调节的数值
         */
        getFixedTop: function () {
            return this.$MScrollData.fixedTop;
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
         * 刷新滚动范围。
         * @public
         *
         * @param {number} y 希望滚动的位置
         */
        refresh: function (y) {
            var options = getOptions.call(this),
                top = options.limit && options.limit.top !== undefined ? options.limit.top : options.top,
                bottom = options.limit && options.limit.bottom !== undefined ? options.limit.bottom : options.bottom;

            this.setPosition(this.getX(), Math.min(bottom, Math.max(top, y)));
        },

        /**
         * 设置滚动区域底部高度调节。
         * @public
         *
         * @param {number} value 底部需要调节的数值
         */
        setFixedBottom: function (value) {
            this.$MScrollData.fixedBottom = value;
        },

        /**
         * 设置滚动区域顶部高度调节。
         * @public
         *
         * @param {number} value 顶部需要调节的数值
         */
        setFixedTop: function (value) {
            this.$MScrollData.fixedTop = value;
        },

        /**
         * @override
         */
        setPosition: function (x, y) {
            if (ui.MScroll.Methods.getX.call(this) !== x || ui.MScroll.Methods.getY.call(this) !== y) {
                dom.setStyle(this.getBody(), 'transform', keyboardHeight ? 'translate(' + x + 'px,' + y + 'px)' : 'translate3d(' + x + 'px,' + y + 'px,0px)');
            }
            core.query(
                function (item) {
                    return this.contain(item);
                },
                this
            ).forEach(function (item) {
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
    });

    /**
     * 获取软键盘高度，如果没有弹出高度为0。
     * @public
     *
     * @return {number} 软键盘高度
     */
    core.getKeyboardHeight = function () {
        return keyboardHeight;
    };

    function showActiveElement() {
        activeCloneElement.previousSibling.style.display = '';
        dom.remove(activeCloneElement);
        activeCloneElement = null;
    }

    function scrollIntoViewIfNeededHandler() {
        if (iosVersion) {
            if (document.activeElement.style.display === 'none') {
                // dom.remove(document.activeElement.nextSibling);
                // document.activeElement.style.display = '';
                showActiveElement();
            }
            for (var scroll = core.findControl(document.activeElement); scroll; scroll = scroll.getParent()) {
                if (scroll.$MScroll) {
                    var main = scroll.getMain(),
                        scrollTop = main.scrollTop;
                    if (scrollTop) {
                        main.scrollTop = 0;
                        scroll.setPosition(scroll.getX(), scroll.getY() - scrollTop);
                    }

                    break;
                }
            }

            var y = calcY(scroll, keyboardHeight);

            if (scroll) {
                scroll.refresh(scroll.getY() + y);
            } else if (y) {
                core.$('ECUI-FIXED-BODY').scrollTop = y;
            }
        } else {
            dom.scrollIntoViewIfNeeded(document.activeElement, true);

            for (scroll = core.findControl(document.activeElement); scroll; scroll = scroll.getParent()) {
                if (scroll.$MScroll && scroll.getMain().scrollTop) {
                    scroll.setPosition(scroll.getX(), scroll.getY() - scroll.getMain().scrollTop);
                    scroll.getMain().scrollTop = 0;
                }
            }
        }
    }

    function fixed() {
        topList.forEach(function (control) {
            dom.setStyle(control.getMain(), 'transform', 'translateY(' + window.scrollY + 'px)');
        });
        bottomList.forEach(function (control) {
            dom.setStyle(control.getMain(), 'transform', 'translateY(' + (window.scrollY - keyboardHeight) + 'px)');
        });
    }

    function onkeyboardclose() {
        if (iosVersion) {
            window.scrollTo(0, 0);
            fixed();
        }
        core.query(function (control) {
            return control.$MScroll && control.isShow();
        }).forEach(function (control) {
            // 终止之前可能存在的惯性状态，并设置滚动层的位置
            core.drag(control);
            control.refresh(control.getY());
        });
        util.dispatchEvent('resize', {});
    }

    /**
     * 滚动监听。
     * @private
     */
    function scrollListener(fn) {

        function onscroll() {
            checkHandle();
            waitHandle();
            // 键盘可能分几次步骤弹出，需要找到不再继续变化的时候才触发函数
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
            waitHandle = util.timer(onscroll, 200),
            checkHandle = util.timer(
                function () {
                    if (window.scrollY !== lastScrollY) {
                        onscroll();
                    }
                },
                -1
            );

        return function () {
            waitHandle();
            checkHandle();
            fn = null;
        };
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

                    if (realTarget) {
                        realTarget.focus();
                        realTarget = null;
                    }

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
                                    scrollIntoViewIfNeededHandler();
                                    fixed();
                                } else {
                                    changeHandle = scrollListener(function () {
                                        scrollIntoViewIfNeededHandler();
                                        fixed();
                                    });
                                }
                            }
                        } else {
                            changeHandle = util.timer(onkeyboardclose, 100);
                        }
                    }
                },

                focusin: function (event) {
                    var fixedInput = core.$('ECUI-FIXED-INPUT');

                    if (!util.hasIOSKeyboard(event.target) || realTarget === event.target) {
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
                        keyboardHandle = scrollListener(function () {
                            if (fixedInput) {
                                window.scrollTo(0, 0);
                            }
                            scrollIntoViewIfNeededHandler();
                            fixed();
                        });
                    } else {
                        if (fixedInput) {
                            realTarget = event.target;
                            fixedInput.disabled = false;
                            fixedInput.focus();
                        }

                        keyboardHandle = scrollListener(function () {
                            if (fixedInput) {
                                keyboardHeight = window.scrollY - fixedHeight;

                                realTarget.focus();
                                realTarget = null;
                            } else {
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
                            }

                            keyboardHandle = scrollListener(function () {
                                if (fixedInput) {
                                    window.scrollTo(0, 0);
                                } else {
                                    keyboardHeight = window.scrollY - statusHeight;
                                    document.body.style.visibility = '';
                                    window.scrollTo(0, Math.min(lastScrollY, keyboardHeight));
                                }

                                dom.addEventListener(window, 'touchmove', util.preventEvent);
                                scrollIntoViewIfNeededHandler();
                                fixed();
                            });
                        });
                    }
                },

                focusout: function (event) {
                    if (!util.hasIOSKeyboard(event.target) || realTarget === event.target) {
                        return;
                    }
                    if (activeCloneElement) {
                        showActiveElement();
                    }

                    dom.setStyle(event.target, 'userSelect', '');
                    dom.removeEventListener(event.target, 'input', scrollIntoViewIfNeededHandler);
                    dom.removeEventListener(event.target, 'keydown', scrollIntoViewIfNeededHandler);

                    observer.disconnect();
                    disabledInputs.forEach(function (item) {
                        item.disabled = false;
                    });
                    disabledInputs = [];

                    keyboardHandle();

                    keyboardHandle = scrollListener(function () {
                        keyboardHeight = 0;
                        onkeyboardclose();
                        dom.removeEventListener(window, 'touchmove', util.preventEvent);
                    });
                }
            } : {
                // android，处理软键盘问题
                keyboardchange: function (event) {
                    var height = event.height;

                    if (height) {
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
                        keyboardHandle = util.timer(scrollIntoViewIfNeededHandler, 100, this, height);
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
                    keyboardHandle = scrollListener(onkeyboardclose);
                }
            };

        dom.addEventListeners(window, events);
    }

    if (iosVersion) {
        (function () {
            var getView = util.getView;
            util.getView = function () {
                // 解决软键盘弹起时的高度计算问题，这个值已经被 orientationchange 写入了body的style中
                var view = getView();
                view.height -= keyboardHeight;
                view.pageHeight -= keyboardHeight;
                view.bottom -= keyboardHeight;
                return view;
            };
        }());
    }
}());
