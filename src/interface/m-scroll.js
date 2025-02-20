//{if $css}//
ecui.__ControlStyle__('\
#ECUI-KEYBOARD {\
    position: absolute;\
    bottom: 0px;\
}\
\
.ui-mobile-scroll {\
    position: relative;\
    overflow: hidden !important;\
    touch-action: none;\
}\
\
.ui-mobile-scroll-body {\
    position: relative;\
    overflow: visible !important;\
    min-height: 100%;\
    transform: translateZ(0px);\
    .m-width100rate();\
}\
');
//{/if}//
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
        realTarget,
        lastKeyboardTime;

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
        // no default
        }
    }

    function getOptions() {
        var main = this.getMain(),
            body = this.getBody(),
            data = ui.iMScroll.getData(this),
            options = {
                decelerate: 400,
                absolute: true
            };

        if (keyboardHeight && data._oRange) {
            var range = Object.assign({}, data._oRange);
            options.limit = {};
        } else {
            range = {
                left: data._nLeft,
                right: data._nRight,
                top: data._nTop,
                bottom: data._nBottom,
                overflow: data._oOverflow
            };
            options.limit = data._oRange;
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
            var mainTop = dom.getPosition(main).top + dom.toPixel(dom.getStyle(main, 'borderTopWidth')),
                mainBottom = mainTop + Math.min(body.scrollHeight, main.clientHeight),
                top = 0,
                bottom = 0;
            options.top += Math.min(0, window.scrollY - keyboardHeight + document.body.clientHeight - mainBottom);
            options.bottom += Math.max(0, window.scrollY - mainTop);

            topList.forEach(function (control) {
                if (control.isShow() && !main.contains(control.getMain())) {
                    bottom = Math.max(bottom, dom.getPosition(control.getMain()).top + control.getMain().offsetHeight - Math.max(window.scrollY, mainTop));
                }
            });
            bottomList.forEach(function (control) {
                if (control.isShow() && !main.contains(control.getMain())) {
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

    function toggleHideBody (isShow) {
        // 解决 ios17.2 系统，在软键盘弹起的时候，设置 body 的 visibility 属性为 hidden 软件盘会立刻收起
        if (iosVersion >= 17) {
            document.body.style.opacity = isShow ? '' : '0';
        } else {
            document.body.style.visibility = isShow ? '' : 'hidden';
        }
    }

    /**
     * 移动端滚动接口。修复默认手势识别与 iOS/Android 软键盘的支持。
     * options 属性：
     * overflow     拖动时的额外滑动区间
     * @interface
     */
    ui.iMScroll = core.interfaces('MScroll', {
        constructor: function (el, options) {
            var bodyEl = dom.create(
                {
                    className: this.getUnitClass(ui.Control, 'body') + ' ui-mobile-scroll-body'
                }
            );

            for (; el.firstChild;) {
                bodyEl.appendChild(el.firstChild);
            }

            dom.addClass(el, 'ui-mobile-scroll');
            el.appendChild(bodyEl);
            this.$setBody(bodyEl);

            if (options.overflow) {
                var list = options.overflow.split(',');
                this._oOverflow = [+list[0]];
                this._oOverflow[1] = list[1] ? +list[1] : this._oOverflow[0];
                this._oOverflow[2] = list[2] ? +list[2] : this._oOverflow[0];
                this._oOverflow[3] = list[3] ? +list[3] : this._oOverflow[1];
            }
            this._nFixedTop = this._nFixedBottom = 0;
        },

        /**
         * @override
         */
        $activate: function (event) {
            _class.$activate(event);
            if ((iosVersion && !keyboardHeight && document.activeElement !== document.body && document.activeElement.tagName.toLowerCase() !== 'iframe') || (keyboardHeight && iosVersion < 9)) {
                return;
            }

            // var target = event.target;
            // 后面的判断的场景是，当软键盘弹起，滑动位置在 input、textarea 时也触发滚动 scroll 的滚动
            // if (!util.hasIOSKeyboard(target)) {
                // 保证ios系统下，长按事件正常触发
            this.cache();
            core.drag(this, event, getOptions.call(this));
            // } else if (iosVersion) {
            //     this._waitDrag = true;
            //     this.waitDragHandle = util.timer(function () {
            //         delete this._waitDrag;
            //     }, 320, this);
            // }
        },

        /**
         * @override
         */
        // $deactivate: function (event) {
        //     _class.$deactivate(event);
            // this._waitDrag = false;
            // if (this.waitDragHandle) {
            //     this.waitDragHandle();
            // }
        // },

        /**
         * @override
         */
        $dragend: function (event) {
            _class.$dragend(event);
            this._bScrolling = false;
            this._bInertia = false;

            if (keyboardHeight && iosVersion !== 11.1 && iosVersion !== 11.2 && iosVersion < 13) {
                // 解决两端的input导致的跳动问题
                var options = getOptions.call(this),
                    height = dom.getView().height / 2,
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
            _class.$dragmove(event);
            this._bInertia = !!event.inertia;
            // this._dragmoveTime = Date.now();
        },

        /**
         * @override
         */
        $dragstart: function (event) {
            _class.$dragstart(event);
            this._bScrolling = true;

            if (util.hasIOSKeyboard(document.activeElement)) {
                if (!activeCloneElement) {
                    document.activeElement.insertAdjacentHTML('afterEnd', document.activeElement.outerHTML);

                    activeCloneElement = document.activeElement.nextSibling;
                    activeCloneElement.name = '';
                    document.activeElement.nextSibling.value = document.activeElement.value;
                    document.activeElement.style.display = 'none';
                }
            }
        },

        /**
         * @override
         */
        // $mousemove: function (event) {
        //     _class.$mousemove(event);
            // if (this._waitDrag) {
            //     this._waitDrag = false;
            //     this.cache();

            //     core.drag(
            //         this,
            //         event,
            //         getOptions.call(this)
            //     );
            // }
        // },

        /**
         * 获取滚动区域底部高度调节。
         * @public
         *
         * @return {number} 底部需要调节的数值
         */
        getFixedBottom: function () {
            return this._nFixedBottom;
        },

        /**
         * 获取滚动区域顶部高度调节。
         * @public
         *
         * @return {number} 顶部需要调节的数值
         */
        getFixedTop: function () {
            return this._nFixedTop;
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
            return this._oRange;
        },

        /**
         * 获取滚动范围。
         * @public
         *
         * @return {Array} 正常显示范围
         */
        getScrollRange: function () {
            return {
                left: this._nLeft,
                top: this._nTop,
                right: this._nRight,
                bottom: this._nBottom
            };
        },

        /**
         * @override
         */
        getX: function () {
            var body = this.getBody();
            return parseInt(body.style.left || dom.getStyle(this.getBody(), 'transform').split(',')[4]);
        },

        /**
         * @override
         */
        getY: function () {
            var body = this.getBody();
            return parseInt(body.style.top || dom.getStyle(this.getBody(), 'transform').split(',')[5]);
        },

        /**
         * 是否处于惯性移动状态。
         * @public
         *
         * @return {boolean} 是否处于惯性移动状态
         */
        isInertia: function () {
            return !!this._bInertia;
        },

        /**
         * 是否正在滚动。
         * @public
         *
         * @return {boolean} 是否正在滚动
         */
        isScrolling: function () {
            return !!this._bScrolling;
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

            this.setPosition(this.getX(), Math.min(bottom, Math.max(top, y === undefined ? this.getY() : y)));
        },

        /**
         * 设置滚动区域底部高度调节。
         * @public
         *
         * @param {number} value 底部需要调节的数值
         */
        setFixedBottom: function (value) {
            this._nFixedBottom = value;
        },

        /**
         * 设置滚动区域顶部高度调节。
         * @public
         *
         * @param {number} value 顶部需要调节的数值
         */
        setFixedTop: function (value) {
            this._nFixedTop = value;
        },

        /**
         * @override
         */
        setPosition: function (x, y) {
            if (ui.iMScroll.prototype.getX.call(this) !== x || ui.iMScroll.prototype.getY.call(this) !== y) {
                var body = this.getBody();
                if (keyboardHeight && iosVersion < 14) {
                    if (iosVersion === 13) {
                        dom.setStyle(body, 'transform', 'translate(0px,0px)');
                        body.style.left = x + 'px';
                        body.style.top = y + 'px';
                    } else {
                        dom.setStyle(body, 'transform', 'translate(' + x + 'px,' + y + 'px)');
                    }
                } else {
                    if (body.style.left) {
                        body.style.left = '';
                        body.style.top = '';
                    }
                    dom.setStyle(body, 'transform', 'translate3d(' + x + 'px,' + y + 'px,0px)');
                }
            }

            core.query(
                function (item) {
                    return this.contains(item);
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
                this._nLeft = range.left;
            }
            if (range.top !== undefined) {
                this._nTop = range.top;
            }
            if (range.right !== undefined) {
                this._nRight = range.right;
            }
            if (range.bottom !== undefined) {
                this._nBottom = range.bottom;
            }
        },

        /**
         * 设置正常显示范围，用于拖拽结束后归位。
         * @public
         *
         * @param {object} range 正常显示范围
         */
        setRange: function (range) {
            this._oRange = range;
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
                if (ui.iMScroll.isInstance(scroll)) {
                    var main = scroll.getMain(),
                        scrollTop = main.scrollTop;
                    if (scrollTop) {
                        main.scrollTop = 0;
                        scroll.setPosition(scroll.getX(), scroll.getY() - scrollTop);
                    }

                    break;
                }
            }

            // ios快速下拉导致页面回弹的bug
            // if (scroll && ui.iMScroll.isInstance(scroll)) {
            //     if (Date.now() - ui.iMScroll.getData(scroll)._dragmoveTime < 300) {
            //         return;
            //     }
            // }

            var y = calcY(scroll, keyboardHeight);

            if (scroll) {
                scroll.refresh(scroll.getY() + y);
            } else if (y) {
                core.$('ECUI-FIXED-BODY').scrollTop = y;
            }
        } else {
            dom.scrollIntoViewIfNeeded(document.activeElement, true);

            for (scroll = core.findControl(document.activeElement); scroll; scroll = scroll.getParent()) {
                if (ui.iMScroll.isInstance(scroll) && scroll.getMain().scrollTop) {
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
            return ui.iMScroll.isInstance(control) && control.isShow();
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
            touchstartTime,
            oldActiveElement = document.activeElement,
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
                    touchstartTime = Date.now();
                },

                touchend: function (event) {
                    if (Date.now() - touchstartTime > 200) {
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
                    }
                },

                touchmove: function (event) {
                    touchstartTime = 0;
                },

                keyboardchange: function (event) {
                    // ios14 软键盘弹起时，切换 input 时触发两次 focusin 事件，每次 focusin 事件都会触发 keyboardHeight 时间，导致 fixed 方法没有按照预期执行
                    // ios14 时短时间内多次触发 keyboardHeight 事件height相同时，忽略事件
                    if (iosVersion >= 14 && keyboardHeight === event.height && Date.now() - lastKeyboardTime <= 20) {
                        return;
                    }
                    lastKeyboardTime = Date.now();

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
                    } else if (iosVersion >= 13 && oldActiveElement !== document.activeElement) {
                        // ios 13 软键盘弹起后，切换输入框焦点，只触发1次 keyboardchange 事件，其它系统会更多次触发（一般3次，第二次 keyboardHeight 为 0）
                        // 这种场景下 document.scrollingElement 元素会有不停的滚动，导致页面定位不对，通过失去焦点、再获得焦点，重新触发计算修复位置

                        oldActiveElement = document.activeElement;
                        util.timer(function () {
                            oldActiveElement.blur();
                            oldActiveElement.focus();
                        }, 0);
                    }
                    // 解决 ios13 下，唤起搜狗软键盘后，点击软键盘的收起按钮，input不失去焦点的bug
                    if (iosVersion >= 13 && event.height === 0) {
                        document.activeElement.blur();
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
                            // ios 13 输入框距离手机屏幕顶部，软键盘弹起的时候，切换到顶部输入框，会出现页面顶部留白的问题
                            if (iosVersion >= 13) {
                                for (var scroll = core.findControl(document.activeElement); scroll; scroll = scroll.getParent()) {
                                    if (ui.iMScroll.isInstance(scroll)) {
                                        scroll.refresh(scroll.getY());
                                        break;
                                    }
                                }
                            }
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
                                toggleHideBody();

                                util.timer(
                                    function () {
                                        toggleHideBody(true);
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
                                    toggleHideBody(true);
                                    window.scrollTo(0, Math.min(lastScrollY, keyboardHeight));
                                }

                                dom.addEventListener(window, 'touchmove', util.preventEvent);
                                scrollIntoViewIfNeededHandler();
                                fixed();
                            });
                        });
                        // 修复搜狗软键盘弹起时，iosFixed 控件被软键盘挡住的bug
                        util.timer(function () {
                            scrollIntoViewIfNeededHandler();
                            fixed();
                        }, 500);
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
                                if (ui.iMScroll.isInstance(scroll)) {
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
            var getView = dom.getView;
            dom.getView = function () {
                // 解决软键盘弹起时的高度计算问题，这个值已经被 orientationchange 写入了body的style中
                var view = getView();
                view.height -= keyboardHeight;
                view.pageHeight -= keyboardHeight;
                view.bottom -= keyboardHeight;
                return view;
            };
        })();
    }
})();
