/*
ECUI核心的事件控制器与状态控制器，用于屏弊不同浏览器交互处理的不同，保存控制的状态及进行事件的分发处理。ECUI核心的事件分发实现了浏览器原生的防止事件重入功能，因此请使用 dispatchEvent 方法来请求事件。
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        effect = core.effect,
        ext = core.ext,
        util = core.util,
        ui = core.ui,

        JAVASCRIPT = 'javascript',
        fontSizeCache = core.fontSizeCache,
        isToucher = document.ontouchstart !== undefined,
        isPointer = !!window.PointerEvent, // 使用pointer事件序列，请一定在需要滚动的元素上加上touch-action:none
        isStrict = document.compatMode === 'CSS1Compat',
        iosVersion = /(iPhone|iPad).*?OS (\d+(_\d+)?)/i.test(navigator.userAgent) ? +(RegExp.$2.replace('_', '.')) : undefined,
        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined,
        chromeVersion = /Chrome\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined,
        firefoxVersion = /firefox\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined,
        safariVersion = !/(chrome|crios|ucbrowser)/i.test(navigator.userAgent) && /(\d+\.\d)(\.\d)?\s+.*safari/i.test(navigator.userAgent) ? +RegExp.$1 : undefined;
//{/if}//
    var HIGH_SPEED = 100,         // 对高速的定义
        scrollHandler,            // DOM滚动事件
        dragStopHandler = util.blank, // ios设备上移出webview区域停止事件
        touchTarget,              // touch点击的目标，用于防止ios下的点击穿透处理
        isTouchMoved,
        ecuiOptions,              // ECUI 参数

        viewWidth,                // 浏览器宽高属性
        viewHeight,               // 浏览器宽高属性
        flgFixedSize,             // 在计算盒子模型时，是否需要修正宽高
        scrollNarrow,             // 浏览器滚动条相对窄的一边的长度

        initRecursion = 0,        // init 操作的递归次数
        readyList = [],
        orientationHandle,

        maskElements = [],        // 遮罩层组
        unmasks = [],             // 用于取消庶罩层的函数列表

        tracks = {},              // 鼠标/触摸事件对象跟踪
        trackId,                  // 当前正在跟踪的id
        pointers = [],            // 当前所有正在监听的pointer对象
        lastClick = {},           // 最后一次点击的信息
        gestureListeners = [],    // 手势监听
        gestureStack = [],        // 手势堆栈，受mask影响进行分层监听
        forcedControl = null,     // 当前被重压的控件
        enableGesture = true,     // 手势识别是否有效，在touchend/pointer后会恢复

        pauseCount = 0,           // 暂停的次数
        keyCode = 0,              // 当前键盘按下的键值，解决keypress与keyup中得不到特殊按键的keyCode的问题
        lastClientX,
        lastClientY,
        inertiaHandles = {},      // 惯性处理句柄

        allControls = [],         // 全部生成的控件，供释放控件占用的内存使用
        independentControls = [], // 独立的控件，即使用create($create)方法创建的控件
        namedControls = {},       // 所有被命名的控件的集合
        singletons = [],          // 所有被初始化成单例控件的集合
        uniqueIndex = 0,          // 控件的唯一序号
        delegateControls = {},    // 等待关联的控件集合

        activedControl,           // 当前环境下被激活的控件，即鼠标左键按下时对应的控件，直到左键松开后失去激活状态
        hoveredControl = null,    // 当前环境下鼠标悬停的控件
        focusedControl = null,    // 当前环境下拥有焦点的控件

        eventListeners = {},      // 控件事件监听描述对象
        eventStack = {},          // 事件调用堆栈记录，防止事件重入

        envStack = [],            // 高优先级事件调用时，保存上一个事件环境的栈
        events = {
            // 屏幕旋转
            orientationchange: function () {
                if (orientationHandle) {
                    orientationHandle();
                }

                orientationHandle = util.timer(
                    function () {
                        var width = document.documentElement.clientWidth,
                            height = document.documentElement.clientHeight;

                        if (viewWidth !== width) {
                            var fontSize = util.toNumber(dom.getStyle(dom.parent(document.body), 'font-size'));
                            fontSizeCache.forEach(function (item) {
                                item[0]['font-size'] = Math.round(fontSize * item[1]) + 'px';
                            });

                            viewWidth = width;
                            viewHeight = height;

                            core.repaint();
                        } else if (viewHeight !== height) {
                            if (isToucher) {
                                // android 软键盘弹出和收起
                                var event = document.createEvent('HTMLEvents');
                                event.initEvent('keyboardchange', true, true);

                                if (height > viewHeight + 100) {
                                    // 软键盘收起，失去焦点
                                    if (document.activeElement && document.activeElement.blur) {
                                        document.activeElement.blur();
                                    }
                                    event.height = 0;
                                } else {
                                    event.height = viewHeight - height;
                                }

                                document.dispatchEvent(event);

                                viewHeight = height;

                                core.repaint();
                            }
                        } else if (event && event.type === 'orientationchange') {
                            orientationHandle = util.timer(events.orientationchange, 100);
                        }
                    },
                    100
                );
            },

            // pad pro/surface pro等设备上的事件处理
            pointerdown: function (event) {
                var pointerType = event.pointerType,
                    pointerId = event.pointerId;

                if (pointerType !== 'mouse' || event.which === 1) {
                    event = core.wrapEvent(event);

                    var track = event.track = {
                            identifier: pointerId,
                            type: pointerType,
                            pageX: event.pageX,
                            pageY: event.pageY,
                            clientX: event.clientX,
                            clientY: event.clientY,
                            target: event.target,
                            lastMoveTime: Date.now(),
                            speedX: 0,
                            speedY: 0
                        };

                    pointers.push(track);

                    if (pointers.length === 1) {
                        if (pointerType === 'mouse') {
                            startSimulationScroll(event);
                            isTouchMoved = undefined;
                            tracks.mouse = track;
                        } else {
                            if (isToucher) {
                                return;
                            }
                            trackId = pointerId;
                            isTouchMoved = false;
                            tracks[pointerId] = track;
                        }

                        checkActived(event);
                        currEnv.mousedown(event);
                        if (trackId) {
                            onpressure(event, event.getNative().pressure >= 0.4);
                        }
                    }
                }
            },

            pointermove: function (event) {
                var pointerId = event.pointerId,
                    track = tracks[event.pointerType] || tracks[pointerId];

                if ((event.pointerType === 'mouse' && (!pointers.length || pointers[0] === track)) || (pointerId === trackId && !isToucher)) {
                    if (!track) {
                        track = {};
                    }

                    event = core.wrapEvent(event);

                    calcSpeed(track, event);

                    // Pointer设备上纯点击也可能会触发move
                    if ((Math.sqrt(track.speedX * track.speedX + track.speedY * track.speedY) > HIGH_SPEED) && isTouchMoved === false) {
                        isTouchMoved = true;
                    }

                    event.track = track;
                    currEnv.mousemove(event);
                    if (pointerId === trackId) {
                        if (hoveredControl !== event.getControl()) {
                            currEnv.mouseover(event);
                        }
                        onpressure(event, event.getNative().pressure >= 0.4);
                        ongesture(pointers, event);
                    }
                }
            },

            pointerout: function (event) {
                if (event.pointerType === 'mouse') {
                    mouseEvents.mouseout(core.wrapEvent(event));
                } else if (event.pointerId === trackId && !isToucher) {
                    // pointer结束
                    bubble(hoveredControl, 'mouseout', core.wrapEvent(event), hoveredControl = null);
                }
            },

            pointerover: function (event) {
                mouseEvents.mouseover(core.wrapEvent(event));
            },

            pointerup: function (event) {
                var pointerId = event.pointerId,
                    track = tracks[event.pointerType] || tracks[pointerId];

                if (track) {
                    if ((event.pointerType === 'mouse' && pointers[0] === track) || (pointerId === trackId && !isToucher)) {
                        // 鼠标右键点击不触发事件
                        track.pageX = event.pageX;
                        track.pageY = event.pageY;
                        track.clientX = event.clientX;
                        track.clientY = event.clientY;
                        track.target = event.target;

                        if (isTouchMoved) {
                            // 产生了滚屏操作，不响应ECUI事件
                            bubble(activedControl, 'deactivate');
                            activedControl = undefined;
                        }

                        event = core.wrapEvent(event);

                        event.track = track;
                        currEnv.mouseup(event);

                        enableGesture = true;
                    }

                    if (track === tracks.mouse) {
                        // 只监听鼠标左键事件
                        if (event.which === 1) {
                            stopSimulationScroll(event);
                            delete tracks.mouse;
                        }
                    } else {
                        if (event.getNative().type === 'pointerup') {
                            onpressure(event, false);
                            ongesture(pointers, event);
                        }
                        trackId = undefined;
                        delete tracks[pointerId];
                    }
                }

                for (var i = 0; track = pointers[i]; i++) {
                    if (track.identifier === pointerId) {
                        pointers.splice(i, 1);
                        break;
                    }
                }
            },

            pointercancel: function (event) {
                events.pointerup(event, true);
            },

            // 触屏事件到鼠标事件的转化，与touch相关的事件由于ie浏览器会触发两轮touch与mouse的事件，所以需要屏弊一个
            touchstart: function (event) {
                if (document.body !== event.target) {
                    dom.addEventListener(event.target, 'touchmove', RemovedDomTouchBubble);
                    dom.addEventListener(event.target, 'touchend', RemovedDomTouchBubble);
                }

                dragStopHandler();
                initTouchTracks(
                    event,
                    function () {
                        if (event.touches.length === 1) {
                            isTouchMoved = false;

                            var track = tracks[trackId = event.touches[0].identifier];

                            event = core.wrapEvent(event);

                            event.pageX = track.pageX;
                            event.pageY = track.pageY;
                            event.clientX = track.clientX;
                            event.clientY = track.clientY;
                            event.target = track.target;
                            event.track = track;

                            lastClientX = event.clientX;
                            lastClientY = event.clientY;

                            track.lastMoveTime = Date.now();
                            checkActived(event);
                            currEnv.mouseover(event);
                            currEnv.mousedown(event);
                            onpressure(event, event.getNative().touches[0].force === 1);
                        }
                    }
                );
            },

            touchmove: function (event) {
                initTouchTracks(
                    event,
                    function () {
                        event = core.wrapEvent(event);

                        var noPrimaryMove = true;

                        Array.prototype.slice.call(event.getNative().changedTouches).forEach(function (item) {
                            var track = tracks[item.identifier];
                            event.pageX = item.pageX;
                            event.pageY = item.pageY;
                            event.clientX = item.clientX;
                            event.clientY = item.clientY;

                            calcSpeed(track, event);

                            if (item.identifier === trackId) {
                                lastClientX = event.clientX;
                                lastClientY = event.clientY;

                                if ((Math.sqrt(track.speedX * track.speedX + track.speedY * track.speedY) > HIGH_SPEED) && isTouchMoved === false) {
                                    isTouchMoved = true;
                                }

                                event.track = track;
                                currEnv.mousemove(event);

                                var target = event.target;
                                event.target = getElementFromEvent(event);
                                if (hoveredControl !== event.getControl()) {
                                    currEnv.mouseover(event);
                                }
                                event.target = target;
                                onpressure(event, item.force === 1);
                                ongesture(event.getNative().touches, event);

                                noPrimaryMove = false;
                            }
                        });

                        if (noPrimaryMove) {
                            event.preventDefault();
                        }
                    }
                );
            },

            touchend: function (event) {
                dom.removeEventListener(event.target, 'touchmove', RemovedDomTouchBubble);
                dom.removeEventListener(event.target, 'touchend', RemovedDomTouchBubble);

                var track = tracks[trackId],
                    noPrimaryEnd = true;

                initTouchTracks(
                    event,
                    function () {
                        Array.prototype.slice.call(event.changedTouches).forEach(function (item) {
                            if (item.identifier === trackId) {
                                if (isTouchMoved) {
                                    // 产生了滚屏操作，不响应ECUI事件
                                    bubble(activedControl, 'deactivate');
                                    activedControl = undefined;
                                }

                                event = core.wrapEvent(event);

                                event.track = track;
                                event.pageX = item.pageX;
                                event.pageY = item.pageY;
                                event.clientX = item.clientX;
                                event.clientY = item.clientY;

                                currEnv.mouseup(event);
                                enableGesture = true;

                                bubble(hoveredControl, 'mouseout', event, hoveredControl = null);
                                trackId = undefined;
                                if (event.getNative().type === 'touchend') {
                                    onpressure(event, false);
                                    ongesture(event.getNative().changedTouches, event);
                                }

                                var target = event.target;
                                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                                    // 点击到非INPUT区域需要失去焦点
                                    if (isTouchClick(track)) {
                                        document.activeElement.blur();
                                    }
                                }

                                // 记录touchend时的dom元素，阻止事件穿透
                                touchTarget = target;
                                noPrimaryEnd = false;
                            }
                        });

                        if (noPrimaryEnd) {
                            event.preventDefault();
                        }

                        if (trackId && !tracks[trackId]) {
                            tracks[trackId] = track;
                        }
                    }
                );
            },

            touchcancel: function (event) {
                events.touchend(event);
            },

            // 鼠标点击时控件如果被屏弊需要取消点击事件的默认处理，此时链接将不能提交
            click: function (event) {
                if (activedControl !== undefined) {
                    // 如果undefined表示移动端长按导致触发了touchstart但没有触发touchend
                    activedControl = undefined;
                }

                if (touchTarget && event.target !== touchTarget) {
                    // 要处理label产生的转发情况
                    for (var el = touchTarget; el; el = dom.parent(el)) {
                        if (el.tagName === 'LABEL') {
                            if (dom.contain(el, event.target) || dom.getAttribute(el, 'for') === event.target.id) {
                                return;
                            }
                        }
                    }
                    // 如果touch的元素不是当前click的元素，就是点击穿透，直接阻止事件
                    document.activeElement.blur();
                    event.preventDefault();
                }
            },

            dblclick: function (event) {
                if (ieVersion < 9) {
                    // IE下双击事件不依次产生 mousedown 与 mouseup 事件，需要模拟
                    event = core.wrapEvent(event);
                    event.track = tracks;
                    currEnv.mousedown(event);
                    currEnv.mouseup(event);
                }
            },

            selectstart: function (event) {
                // IE下取消对文字的选择不能仅通过阻止 mousedown 事件的默认行为实现
                event = core.wrapEvent(event);
                onselectstart(event.getTarget(), event);
            },

            dragend: function (event) {
                currEnv.mouseup(core.wrapEvent(event));
            },

            keydown: function (event) {
                event = core.wrapEvent(event);
                keyCode = event.which;
                bubble(focusedControl, 'keydown', event);
            },

            keypress: function (event) {
                event = core.wrapEvent(event);
                bubble(focusedControl, 'keypress', event);
            },

            keyup: function (event) {
                event = core.wrapEvent(event);
                bubble(focusedControl, 'keyup', event);
                if (keyCode === event.which) {
                    // 一次多个键被按下，只有最后一个被按下的键松开时取消键值码
                    keyCode = 0;
                }
            }
        },
        mouseEvents = {
            mousedown: function (event) {
                event = core.wrapEvent(event);
                // 仅监听鼠标左键
                if (event.which === 1) {
                    startSimulationScroll(event);
                    event.track = tracks;
                    tracks.lastMoveTime = Date.now();
                    checkActived(event);
                    currEnv.mousedown(event);
                }
            },

            mousemove: function (event) {
                event = core.wrapEvent(event);

                // 点击在滚动条上，不会触发mouseup事件，但会触发mousemove事件
                stopSimulationScroll(event);
                calcSpeed(tracks, event);

                event.track = tracks;
                currEnv.mousemove(event);
            },

            mouseout: function (event) {
                currEnv.mouseout(core.wrapEvent(event));
            },

            mouseover: function (event) {
                currEnv.mouseover(core.wrapEvent(event));
            },

            mouseup: function (event) {
                event = core.wrapEvent(event);

                if (event.which === 1) {
                    stopSimulationScroll(event);
                    event.track = tracks;
                    currEnv.mouseup(event);
                    tracks = {};
                }
            }
        },
        currEnv = { // 当前操作的环境
            // 鼠标左键按下需要改变框架中拥有焦点的控件
            mousedown: function (event) {
                var track = event.track,
                    control = event.getControl(),
                    target = control;

                track.startX = track.clientX;
                track.startY = track.clientY;
                track.startTime = Date.now();

                if (control) {
                    // IE8以下的版本，如果为控件添加激活样式，原生滚动条的操作会失效
                    // 常见的表现是需要点击两次才能进行滚动操作，而且中途不能离开控件区域
                    // 以免触发悬停状态的样式改变。
                    if (isTouchMoved === undefined) { // MouseEvent
                        // 触控设备在mouseup时获得焦点
                        if (!scrollHandler || ieVersion >= 9) {
                            core.setFocused(target);
                        }
                    }

                    if (!isScrollClick(event)) {
                        bubble(activedControl = control, 'activate', event);
                    }
                    bubble(control, 'mousedown', event);
                    onselectstart(control, event);
                } else {
                    target = event.target;
                    if (control = event.getTarget()) {
                        // 如果点击的是失效状态的控件，检查是否需要取消文本选择
                        onselectstart(control, event);
                        // 检查是否INPUT/SELECT/TEXTAREA/BUTTON标签，需要失去焦点，
                        // 因为ecui不能阻止mousedown focus输入框
                        if (isTouchMoved === undefined) { // MouseEvent
                            // 移动端输入框是在mouseup时失去焦点
                            if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON') {
                                util.timer(
                                    function () {
                                        target.blur();
                                    }
                                );
                                event.preventDefault();
                            }
                        }
                    }
                    if (isTouchMoved === undefined) { // MouseEvent
                        // 移动端输入框是在mouseup时失去焦点
                        // 点击到了空白区域，取消控件的焦点
                        core.setFocused();
                    }
                    // 正常情况下 activedControl 是 undefined，如果是down按下但未点击到控件，此值为null
                    activedControl = null;
                }
            },

            mousemove: function (event) {
                bubble(event.getControl(), 'mousemove', event);
            },

            mouseout: util.blank,

            // 鼠标移入的处理，需要计算是不是位于当前移入的控件之外，如果是需要触发移出事件
            mouseover: function (event) {
                var control = event.getControl(),
                    parent = getCommonParent(control, hoveredControl);

                bubble(hoveredControl, 'mouseout', event, parent);
                hoveredControl = control;
                bubble(control, 'mouseover', event, parent);
            },

            mouseup: function (event) {
                function blockAhref(el) {
                    var href = el.href;
                    if (href !== JAVASCRIPT + ':void(0)') {
                        el.href = JAVASCRIPT + ':void(0)';
                        util.timer(
                            function () {
                                el.href = href;
                            },
                            100
                        );
                    }
                }

                var track = event.track,
                    control = event.getControl(),
                    click = isTouchClick(track),
                    dblclick = Date.now() - lastClick.time < 500,
                    commonParent;

                if (activedControl !== undefined) {
                    if (click && ((event.target.tagName !== 'INPUT' || event.target.type === 'radio' || event.target.type === 'checkbox') && event.target.tagName !== 'TEXTAREA')) { // TouchEvent
                        core.setFocused(activedControl);
                    }

                    // 如果为 undefined 表示之前没有触发 mousedown 事件就触发了 mouseup，
                    // 这种情况出现在鼠标在浏览器外按下了 down 然后回浏览器区域 up，
                    // 或者是 ie 系列浏览器在触发 dblclick 之前会触发一次单独的 mouseup，
                    // dblclick 在 ie 下的事件触发顺序是 mousedown/mouseup/click/mouseup/dblclick
                    bubble(control, 'mouseup', event);

                    for (var el = event.target; el; el = dom.parent(el)) {
                        // 移动端浏览器可能不触发A标签上的onclick事件，但实际上A标签已经被使用
                        if (el.tagName === 'A') {
                            var target = core.findControl(el);
                            if (target && target.isDisabled()) {
                                blockAhref(el);
                                break;
                            }
                        }
                    }

                    if (activedControl) {
                        // 点击事件在同时响应鼠标按下与弹起周期的控件上触发(如果之间未产生鼠标移动事件)
                        // 模拟点击事件是为了解决控件的 Element 进行了 remove/append 操作后 click 事件不触发的问题，以及移动端click延迟的问题
                        if (event.getNative().type.indexOf('cancel') < 0) {
                            commonParent = getCommonParent(control, activedControl);
                            if (isTouchMoved === undefined || click) { // MouseEvent
                                bubble(commonParent, 'click', event);
                                if (event.cancelBubble) {
                                    // 取消冒泡要阻止A标签提交
                                    for (el = control.getMain(); el; el = dom.parent(el)) {
                                        if (el.tagName === 'A') {
                                            blockAhref(el);
                                            break;
                                        }
                                    }
                                }
                            }
                            if (dblclick) {
                                commonParent = getCommonParent(control, lastClick.target);
                                bubble(commonParent, 'dblclick', event);
                            }
                        }

                        bubble(activedControl, 'deactivate', event);
                    }

                    if (dblclick) {
                        lastClick.time = 0;
                    } else {
                        lastClick.time = track.startTime;
                        lastClick.target = control;
                    }

                    // 将 activedControl 的设置复位，此时表示没有鼠标左键点击
                    activedControl = undefined;

                    if (click) {
                        for (control = event.target; control; control = dom.parent(control)) {
                            if (control.tagName === 'A' && control.href) {
                                location.href = control.href;
                                break;
                            }
                        }
                    }
                }
            }
        },

        dragEnv = { // 拖曳操作的环境
            type: 'drag',

            mousedown: util.blank,

            mousemove: function (event) {
                bubble(event.getControl(), 'mousemove', event);

                var view = util.getView();
                dragStopHandler();
                if (iosVersion && (event.clientX < 0 || event.clientX >= view.width || event.clientY < 0 || event.clientY >= view.height)) {
                    // 延后500ms执行，无意中的滑出不会受到影响
                    dragStopHandler = util.timer(
                        function () {
                            dragEnv.mouseup(event);
                        },
                        500
                    );
                } else {
                    dragmove(event.track, currEnv, event.clientX, event.clientY);
                }
                event.preventDefault();
            },

            mouseup: function (event) {
                dragStopHandler();

                disableEnv.mouseup(event);

                var track = event.track,
                    target = currEnv.target,
                    uid = target.getUID(),
                    mx = event.clientX,
                    my = event.clientY,
                    start = Date.now(),
                    vx = track.speedX || 0,
                    vy = track.speedY || 0,
                    inertia = target.$draginertia ? target.$draginertia({x: vx, y: vy}) : currEnv.decelerate ? Math.sqrt(vx * vx + vy * vy) / currEnv.decelerate : 0,
                    dragEvent = new ECUIEvent();

                dragEvent.track = track;

                if (inertia) {
                    var ax = vx / inertia,
                        ay = vy / inertia,
//                        sx = vx * inertia - ax * inertia * inertia / 2,
//                        sy = vy * inertia - ay * inertia * inertia / 2,
                        env = currEnv;

                    // if (ieVersion < 9) {
                    var startX = track.x,
                        startY = track.y;

                    inertiaHandles[uid] = util.timer(
                        function () {
                            var time = (Date.now() - start) / 1000,
                                t = Math.min(time, inertia),
                                x = track.x,
                                y = track.y;

                            dragmove(track, env, Math.round(mx + vx * t - ax * t * t / 2), Math.round(my + vy * t - ay * t * t / 2));
                            if (t >= inertia || (x === track.x && y === track.y)) {
                                inertiaHandles[uid]();
                                delete inertiaHandles[uid];
                                if (env.event && startX === x && startY === y) {
                                    env.event.inertia = false;
                                }
                                dragend(dragEvent, env, target);
                            }
                        },
                        -1
                    );
                    // } else {
                    //     var x = target.getX(),
                    //         y = target.getY(),
                    //         result = calcPosition(track, env, Math.round(x + sx), Math.round(y + sy));

                    //     sx = result.x - x;
                    //     sy = result.y - y;
                    //     inertia = Math.max((Math.abs(vx) - Math.sqrt(vx * vx - 2 * ax * sx)) / Math.abs(ax) || 0, (Math.abs(vy) - Math.sqrt(vy * vy - 2 * ay * sy)) / Math.abs(ay) || 0) || inertia;

                    //     delete currEnv.event;
                    //     core.dispatchEvent(target, 'dragmove', {x: result.x, y: result.y, inertia: true});
                    //     if (result.x !== x || result.y !== y) {
                    //         createInertiaHandles(target, inertia * 1000, function () {
                    //             dragend(dragEvent, env, target);
                    //         });
                    //         target.getPositionElement().style.transition = 'all ' + inertia + 's ease-out';
                    //         target.setPosition(result.x, result.y);
                    //     } else {
                    //         dragend(dragEvent, currEnv, target);
                    //     }
                    // }
                } else {
                    dragend(dragEvent, currEnv, target);
                }
                restore();

                currEnv.mouseup(event);
            }
        },

        disableEnv = {
            type: 'disable',
            // 禁止input得到焦点
            mousedown: util.preventEvent,
            mousemove: util.preventEvent,
            mouseout: util.blank,
            mouseover: util.blank,
            mouseup: util.blank
        };

    if (ieVersion < 9) {
        /**
         * 滚轮事件处理(IE 6/7/8)。
         * @private
         *
         * @param {Event} event 事件对象
         */
        events.mousewheel = function (event) {
            onmousewheel(event, 0, event.wheelDelta / 3);
        };
    } else if (firefoxVersion < 17) {
        /**
         * 滚轮事件处理(firefox)。
         * @private
         *
         * @param {Event} event 事件对象
         */
        events.DOMMouseScroll = function (event) {
            onmousewheel(event, event.axis === 1 ? event.detail : 0, event.axis === 2 ? event.detail : 0);
        };
    } else {
        events.wheel = function (event) {
            onmousewheel(event, event.deltaX, event.deltaY);
        };
    }

    /**
     * 解决touch事件中如果目标元素被移除touch事件冒泡丢失的问题。
     * @private
     *
     * @param {Event} event 浏览器原生事件对象，忽略将自动填充
     */
    function RemovedDomTouchBubble(event) {
        if (!dom.contain(document.body, this)) {
            events[event.type](event);
        }
    }

    /**
     * 创建 ECUI 事件对象。
     * @private
     *
     * @param {string} type 事件类型
     * @param {Event} event 浏览器原生事件对象，忽略将自动填充
     */
    function ECUIEvent(type, event) {
        this.type = type;
        if (event) {
            this.pageX = event.pageX;
            this.pageY = event.pageY;
            this.clientX = event.clientX;
            this.clientY = event.clientY;
            this.which = event.which;
            if (ieVersion <= 10) {
outer:          for (var caches = [], target = event.target, el; target; target = getElementFromEvent(event)) {
                    for (el = target;; el = dom.parent(el)) {
                        if (!el) {
                            break outer;
                        }
                        if (dom.getCustomStyle(el, 'pointer-events') === 'none') {
                            caches.push([el, el.style.visibility]);
                            el.style.visibility = 'hidden';
                            break;
                        }
                    }
                }
                this.target = target;
                caches.forEach(function (item) {
                    item[0].style.visibility = item[1];
                });
            } else {
                this.target = event.target;
            }
            this._oNative = event;
            this.active = activedControl;
        } else {
            this.clientX = lastClientX;
            this.clientY = lastClientY;
            this.which = keyCode;
        }
    }

    Object.assign(ECUIEvent.prototype, {
        /**
         * 取消手势，如果要准确的取消，请在mousedown事件中执行。
         * @public
         */
        cancelGesture: function () {
            enableGesture = false;
        },

        /**
         * 终止全部事件操作。
         * @public
         */
        exit: function () {
            this.preventDefault();
            this.stopPropagation();
        },

        /**
         * 获取触发事件的 ECUI 控件 对象
         * @public
         *
         * @return {ecui.ui.Control} 控件对象
         */
        getControl: function () {
            var control = this.getTarget();
            if (control && !control.isDisabled()) {
                for (; control; control = control.getParent()) {
                    if (control.isCapturable()) {
                        return control;
                    }
                }
            }
            return null;
        },

        /**
         * 获取原生的事件对象。
         * @public
         *
         * @return {object} 原生的事件对象
         */
        getNative: function () {
            return this._oNative;
        },

        /**
         * 获取触发浏览器事件的控件对象。
         * @public
         *
         * @return {ecui.ui.Control} 控件对象
         */
        getTarget: function () {
            return core.findControl(this.target);
        },

        /**
         * 阻止事件的默认处理。
         * @public
         */
        preventDefault: function () {
            this.returnValue = false;
            if (this._oNative) {
                if (ieVersion < 9) {
                    this._oNative.returnValue = false;
                } else {
                    this._oNative.preventDefault();
                }
            }
        },

        /**
         * 事件停止冒泡。
         * @public
         */
        stopPropagation: function () {
            this.cancelBubble = true;
            if (this._oNative) {
                if (ieVersion < 9) {
                    this._oNative.cancelBubble = false;
                } else {
                    this._oNative.stopPropagation();
                }
            }
        }
    });

    /**
     * 冒泡处理控件事件。
     * @private
     *
     * @param {ecui.ui.Control} start 开始冒泡的控件
     * @param {string} type 事件类型
     * @param {ECUIEvent} 事件对象
     * @param {ecui.ui.Control} end 终止冒泡的控件，如果不设置将一直冒泡至顶层
     */
    function bubble(start, type, event, end) {
        if (!event) {
            event = new ECUIEvent(type);
            if (start) {
                event.target = start.getMain();
            }
        }
        start = start || null;
        end = end || null;
        for (; start !== end; start = start.getParent()) {
            core.dispatchEvent(start, type, event);
            if (event.cancelBubble) {
                return;
            }
        }
    }

    /**
     * 计算某个点对应原心的角度。
     * @private
     *
     * @param {number} x x坐标
     * @param {number} y y坐标
     */
    function calcAngle(x, y) {
        y = -y;
        if (x > 0) {
            var angle = Math.atan(y / x) / Math.PI * 180;
            if (angle < 0) {
                angle += 360;
            }
        } else if (x < 0) {
            angle = 180 + Math.atan(y / x) / Math.PI * 180;
        } else if (y < 0) {
            angle = 270;
        } else if (y > 0) {
            angle = 90;
        }
        return angle;
    }

    /**
     * 计算拖拽事件的坐标。
     * @private
     *
     * @param {Event} track 事件跟踪对象
     * @param {object} env ECUI 框架运行环境
     * @param {number} x 需要移动到的 X 坐标
     * @param {number} y 需要移动到的 Y 坐标
     * @return {Object} 计算结果
     */
    function calcPosition(track, env, x, y) {
        // 计算实际允许移到的位置
        x = Math.min(Math.max(x, env.left), env.right);
        y = Math.min(Math.max(y, env.top), env.bottom);

        if (env.limit) {
            var scale = 1 - 1 / (env.limitRatio || 3);

            if (x < env.limitLeft) {
                x -= Math.round((x - env.limitLeft) * scale);
            } else if (x > env.limitRight) {
                x -= Math.round((x - env.limitRight) * scale);
            }

            if (y < env.limitTop) {
                y -= Math.round((y - env.limitTop) * scale);
            } else if (y > env.limitBottom) {
                y -= Math.round((y - env.limitBottom) * scale);
            }
        }
        return {
            x: x,
            y: y
        };
    }

    /**
     * 计算单个事件的速度。
     * @private
     *
     * @param {object} track 事件跟踪对象
     * @param {ECUIEvent} 事件对象
     */
    function calcSpeed(track, event) {
        if (!track.path) {
            track.path = [];
        }
        track.path.push({
            time: track.lastMoveTime,
            x: track.clientX,
            y: track.clientY
        });
        // 计算最近100ms的平均速度
        for (var i = track.path.length, time = Date.now(); --i; ) {
            if (time - track.path[i].time > 100) {
                break;
            }
        }

        track.lastMoveTime = track.path[i].time;
        track.clientX = track.path[i].x;
        track.clientY = track.path[i].y;
        track.path.splice(0, i);

        var delay = time - track.lastMoveTime > 500,
            offsetX = event.clientX - track.clientX,
            offsetY = event.clientY - track.clientY,
            speed = 1000 / (time - track.lastMoveTime);

        track.speedX = delay ? 0 : offsetX * speed;
        track.speedY = delay ? 0 : offsetY * speed;
        track.angle = calcAngle(offsetX, offsetY);
        track.lastMoveTime = time;
        track.lastX = track.clientX;
        track.lastY = track.clientY;
        track.clientX = event.clientX;
        track.clientY = event.clientY;
    }

    /**
     * 检测不正常的事件链，比如没有触发pointerup/touchend/mouseup。
     * @private
     *
     * @param {ecui.ui.Control} control 控件
     */
    function checkActived(event) {
        // 如果按下鼠标左键后，使用ALT+TAB使浏览器失去焦点然后松开鼠标左键，
        // 需要恢复激活控件状态，第一次点击失效
        if (activedControl !== undefined) {
            if (currEnv.type === 'drag') {
                dom.removeClass(document.body, 'ui-drag');
                currEnv.mouseup(event);
            } else {
                bubble(activedControl, 'deactivate', event);
                activedControl = undefined;
            }
        }
    }

    /**
     * 创建终止拖拽执行的事件函数。
     * @private
     *
     * @param {ecui.ui.Control} target 被拖拽的控件
     * @param {number} delay 滚动惯性的时间
     * @param {Function} callback 回调函数
     */
    // function createInertiaHandles(target, delay, callback) {
    //     var uid = target.getUID(),
    //         el = target.getPositionElement(),
    //         stopHandler = util.timer(function () {
    //             el.style.transition = '';
    //             delete inertiaHandles[uid];
    //             if (callback) {
    //                 callback();
    //             }
    //         }, delay),
    //         startPos = dom.getPosition(el),
    //         startX = target.getX(),
    //         startY = target.getY();

    //     inertiaHandles[uid] = function () {
    //         stopHandler();
    //         var endPos = dom.getPosition(el);
    //         el.style.transition = '';
    //         target.setPosition(endPos.left - startPos.left + startX, endPos.top - startPos.top + startY);
    //     };
    // }

    /**
     * dispose一个控件，dispose情况特殊，ondispose不能阻止$dispose函数的执行。
     * @private
     *
     * @param {ecui.ui.Control} control 控件
     */
    function disposeControl(control) {
        try {
            var fn = control.ondispose;
            if (fn) {
                control.ondispose = util.blank;
                fn.call(control);
            }
        } catch (ignore) {
        }
        util.remove(singletons, control);
        core.dispatchEvent(control, 'dispose');
    }

    /**
     * 拖拽的动画帧处理，对低版本浏览器也提供了兼容。
     * @private
     *
     * @param {object} env ECUI 框架运行环境
     * @param {ecui.ui.Control} target 被拖拽的 ECUI 控件
     * @param {ECUIEvent} event ECUI 事件对象，如果是dragend，这个值为 undefined(正常中止) 或 false(强行中止)
     */
    function dragAnimationFrame(env, target, event) {
        if (event) {
            // dragmove
            if (window.requestAnimationFrame) {
                if (!env.event) {
                    window.requestAnimationFrame(function () {
                        if (env.event) {
                            target.setPosition(env.event.x, env.event.y);
                            core.dispatchEvent(target, 'dragmove', env.event);
                            env.event = null;
                        }
                    });
                }
                env.event = event;
            } else {
                target.setPosition(event.x, event.y);
                core.dispatchEvent(target, 'dragmove', event);
            }
        } else {
            // dragend
            if (env.event) {
                // 之前存在未完成的dragmove，先完成
                target.setPosition(env.event.x, env.event.y);
                core.dispatchEvent(target, 'dragmove', env.event);
                env.event = null;
            }
            if (event === undefined) {
                core.dispatchEvent(target, 'dragend');
                dom.removeClass(document.body, 'ui-drag');
            }
        }
    }

    /**
     * 拖拽结束事件处理。
     * @private
     *
     * @param {ECUIEvent} event ECUI 事件对象
     * @param {object} env ECUI 框架运行环境
     * @param {ecui.ui.Control} target 被拖拽的 ECUI 控件
     */
    function dragend(event, env, target) {
        if (!target.getMain()) {
            // 控件已经被销毁，不要发送事件
            return;
        }
        var uid = target.getUID();

        if (env.limit) {
            var range = env.limit,
                x = target.getX(),
                y = target.getY(),
                expectX = Math.min(range.right === undefined ? x : range.right, Math.max(range.left === undefined ? x : range.left, x)),
                expectY = Math.min(range.bottom === undefined ? y : range.bottom, Math.max(range.top === undefined ? y : range.top, y));

            if (range.stepX) {
                expectX = Math.round(expectX / range.stepX) * range.stepX;
            }
            if (range.stepY) {
                expectY = Math.round(expectY / range.stepY) * range.stepY;
            }

            if (x !== expectX || y !== expectY) {
                // if (ieVersion < 9) {
                inertiaHandles[uid] = effect.grade(
                    function (percent, options) {
                        event.x = Math.round(options.x + percent * (expectX - options.x));
                        event.y = Math.round(options.y + percent * (expectY - options.y));
                        event.inertia = true;

                        dragAnimationFrame(env, target, event);

                        if (percent >= 1) {
                            inertiaHandles[uid]();
                            delete inertiaHandles[uid];
                            dragAnimationFrame(env, target);
                        }
                    },
                    300,
                    {
                        $: env.el || target.getMain(),
                        x: x,
                        y: y
                    }
                );
                // } else {
                //     delete env.event;
                //     createInertiaHandles(target, 300, finish);
                //     target.getPositionElement().style.transition = 'all 0.5s';
                //     target.setPosition(expectX, expectY);
                // }
                return;
            }
        }
        dragAnimationFrame(env, target);
    }

    /**
     * 拖拽移动事件处理。
     * @private
     *
     * @param {Event} track 事件跟踪对象
     * @param {object} env ECUI 框架运行环境
     * @param {number} x 需要移动到的 X 坐标
     * @param {number} y 需要移动到的 Y 坐标
     */
    function dragmove(track, env, x, y) {
        if (!env.target.getMain()) {
            // 控件已经被销毁，不要发送事件
            return;
        }

        // 计算期待移到的位置
        var expectX = Math.round(env.originalX + x - track.logicX),
            expectY = Math.round(env.originalY + y - track.logicY);

        var result = calcPosition(track, env, expectX, expectY);
        dragAnimationFrame(env, env.target, {track: track, x: result.x, y: result.y, inertia: env !== currEnv});

        track.x = result.x;
        track.y = result.y;
        track.logicX = x + env.originalX - expectX;
        track.logicY = y + env.originalY - expectY;
    }

    /**
     * 遍历flex元素并放入待处理list中。
     * @private
     *
     * @param {HTMLElement} el DOM 元素
     */
    function flexElementToArray(el) {
        var style = dom.getStyle(el);
        if (style.display.indexOf('flex') >= 0 && dom.getCustomStyle(style, 'flex-fixed') && el.offsetWidth) {
            dom.children(el).forEach(function (el) {
                if (el.offsetWidth && el.offsetHeight) {
                    this.push([el, el.offsetWidth, el.offsetHeight]);
                }
            });
        }
    }

    /**
     * 遍历flex元素并设置大小。
     * @private
     *
     * @param {Array} item DOM 元素信息
     */
    function flexElementToBoxing(item) {
        item[0].style.width = item[1] + 'px';
        item[0].style.height = item[2] + 'px';
    }

    /**
     * 获取两个控件的公共父控件。
     * @private
     *
     * @param {ecui.ui.Control} control1 控件1
     * @param {ecui.ui.Control} control2 控件2
     * @return {ecui.ui.Control} 公共的父控件，如果没有，返回 null
     */
    function getCommonParent(control1, control2) {
        /*jslint eqeq:true*/
        if (control1 != control2) {
            /*jslint eqeq:false*/
            var i = 0,
                list1 = [],
                list2 = [];

            for (; control1; control1 = control1.getParent()) {
                list1.push(control1);
            }
            for (; control2; control2 = control2.getParent()) {
                list2.push(control2);
            }

            list1.reverse();
            list2.reverse();

            // 过滤父控件序列中重复的部分
            for (; list1[i] === list2[i]; i++) {}
            control1 = list1[i - 1];
        }

        return control1 || null;
    }

    /**
     * 获取当前 Element 对象绑定的 ECUI 控件。
     * 与控件关联的 Element 对象(例如通过 init 方法初始化，或者使用 $bind 方法绑定，或者使用 create、$fastCreate 方法生成控件)，会被添加一个 getControl 方法用于获取它绑定的 ECUI 控件，更多获取控件的方法参见 get。
     * @private
     *
     * @return {ecui.ui.Control} 与 Element 对象绑定的 ECUI 控件
     */
    function getControlByElement() {
        return this._cControl;
    }

    /**
     * 获取事件所在的元素，用于解决 TouchEvent 的 target 值不会变化的问题。
     * @private
     *
     * @return {HTMLElement} 事件所在的 DOM 元素
     */
    function getElementFromEvent(event) {
        return chromeVersion || ieVersion || safariVersion ? document.elementFromPoint(event.clientX, event.clientY) : document.elementFromPoint(event.pageX, event.pageY);
    }

    /**
     * 初始化ECUI工作环境。
     * @private
     *
     * @return {boolean} 是否执行了初始化操作
     */
    function initEnvironment() {
        if (scrollNarrow === undefined) {
            ecuiOptions = Object.assign(
                {name: 'ui'},
                core.getOptions(document.body, 'data-ecui') || {}
            );

            if ((ecuiOptions.device === 'mobile' && !isToucher) || (ecuiOptions.device === 'pc' && isToucher)) {
                if (core.onerrordevice) {
                    core.onerrordevice();
                }
                return;
            }

            if (isToucher) {
                (function () {
                    var getView = util.getView;
                    util.getView = function () {
                        // 解决软键盘弹起时的高度计算问题，这个值已经被 orientationchange 写入了body的style中
                        var view = getView();
                        view.height = viewHeight;
                        return view;
                    };
                }());
            }

            viewWidth = document.documentElement.clientWidth;
            viewHeight = document.documentElement.clientHeight;
            if (isToucher) {
                util.adjustFontSize(Array.prototype.slice.call(document.styleSheets));
            }

            // 设置全局事件处理
            if (!isToucher && !isPointer) {
                Object.assign(events, mouseEvents);
            }
            dom.addEventListeners(document, events);

            dom.insertHTML(document.body, 'BEFOREEND', '<div class="ui-valid"><div></div></div>');
            // 检测Element宽度与高度的计算方式
            var el = document.body.lastChild;
            flgFixedSize = el.offsetWidth !== 80;
            scrollNarrow = el.offsetWidth - el.clientWidth - 2;
            dom.remove(el);

            if (ecuiOptions.load) {
                for (var text = ecuiOptions.load; /^\s*(\w+)\s*(\([^)]+\))?\s*($|,)/.test(text); ) {
                    text = RegExp['$\''];
                    try {
                        core[RegExp.$1].load(RegExp.$2 ? RegExp.$2.slice(1, -1) : '');
                    } catch (ignore) {
                    }
                }
            }

            dom.addEventListener(window, 'resize', events.orientationchange);
            dom.addEventListener(window, 'scroll', onscroll);
            dom.addEventListener(
                window,
                'unload',
                function () {
                    focusedControl = hoveredControl = activedControl = null;

                    allControls.forEach(function (item) {
                        disposeControl(item);
                    });

                    singletons.forEach(function (item) {
                        disposeControl(item);
                    });

                    // 清除闭包中引用的 Element 对象
                    unmasks.forEach(function (item) {
                        item(true);
                    });
                    maskElements = null;
                }
            );

            if (iosVersion) {
                // 增加一个额外的层，使window.scrollY与document.body.scrollTop区分开来
                el = dom.create({
                    id: 'ECUI-FIXED-BODY'
                });
                for (; document.body.firstChild; ) {
                    el.appendChild(document.body.firstChild);
                }
                document.body.appendChild(el);

                if (iosVersion === 11.1 || iosVersion === 11.2) {
                    document.body.appendChild(dom.create('INPUT', {id: 'ECUI-FIXED-INPUT'})).disabled = true;
                }
            }
            core.init(document.body);
            el = null;

            return true;
        }
    }

    /**
     * 初始化全部的跟踪对象。
     * @private
     *
     * @return {Event} event 系统事件对象
     */
    function initTouchTracks(event, callback) {
        var caches = {};
        Array.prototype.slice.call(event.touches).forEach(function (item) {
            tracks[item.identifier] = tracks[item.identifier] || {
                identifier: item.identifier,
                pageX: item.pageX,
                pageY: item.pageY,
                clientX: item.clientX,
                clientY: item.clientY,
                target: item.target,
                speedX: 0,
                speedY: 0
            };
            caches[item.identifier] = true;
        });

        callback();

        for (var key in tracks) {
            if (tracks.hasOwnProperty(key)) {
                if (!caches[key]) {
                    delete tracks[key];
                }
            }
        }
    }

    /**
     * 判断点击是否发生在滚动条区域。
     * @private
     *
     * @param {ECUIEvent} event 事件对象
     * @return {boolean} 点击是否发生在滚动条区域
     */
    function isScrollClick(event) {
        if (isToucher) {
            return false;
        }

        var target = event.target,
            pos = dom.getPosition(target),
            style = dom.getStyle(target),
            x = event.pageX - pos.left - util.toNumber(style.borderLeftWidth) - target.clientWidth,
            y = event.pageY - pos.top - util.toNumber(style.borderTopWidth) - target.clientHeight;

        event.deltaX = target.clientWidth && target.clientWidth !== target.scrollWidth && y >= 0 && y < scrollNarrow ? 1 : 0;
        event.deltaY = target.clientHeight && target.clientHeight !== target.scrollHeight && x >= 0 && x < scrollNarrow ? 1 : 0;
        return event.deltaX !== event.deltaY;
    }

    /**
     * 判断是否为移动端单击时间间隔。
     * @private
     *
     * @param {object} track 事件跟踪对象
     * @return {boolean} 是否为移动端单击时间间隔
     */
    function isTouchClick(track) {
        return isTouchMoved === false && Date.now() - track.startTime < 300;
    }

    /**
     * 滚动时的事件处理。
     * @private
     *
     * @param {ECUIEvent} event 事件对象
     */
    function onbeforescroll(event) {
        independentControls.forEach(function (item) {
            core.dispatchEvent(item, 'beforescroll', event);
        });
    }

    /**
     * 控件对象创建后的处理。
     * @private
     *
     * @param {ecui.ui.Control} control
     * @param {object} options 控件初始化选项
     */
    function oncreate(control, options) {
        if (control.oncreate) {
            control.oncreate(options);
        }

        if (options.id) {
//{if 0}//
            if (namedControls[options.id]) {
                console.warn('The identifier("' + options.id + '") has existed.');
            }
//{/if}//
            namedControls[options.id] = control;
            control.$ID = options.id;
        }

        if (options.ext) {
            for (var key in options.ext) {
                if (options.ext.hasOwnProperty(key)) {
                    var extend = ext[key];
                    if (extend) {
                        if (extend.constructor) {
                            extend.constructor.call(control, options.ext[key], options);
                        }
                        if (extend.Events) {
                            for (var name in extend.Events) {
                                if (extend.Events.hasOwnProperty(name)) {
                                    core.addEventListener(control, name, extend.Events[name]);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * 处理手势事件。
     * @private
     *
     * @param {Array} pointers 指针信息列表
     * @param {ECUIEvent} event ECUI 事件对象
     */
    function ongesture(pointers, event) {
        function callback(type) {
            event.type = type;
            // 防止事件中的写操作导致多次reflow
            gestureListeners.filter(function (item) {
                return item[1][type] && (!item[0] || (item[0].isShow() && item[0].isGestureStatus()));
            }).forEach(function (item) {
                item[1][type].call(item[0], event);
            });
        }

        if (enableGesture && gestureListeners.length) {
            switch (pointers.length) {
            case 1:
                var track = tracks[pointers[0].identifier];
                if (track.type !== 'mouse') {
                    if (event.getNative().type.slice(-4) === 'move') {
                        if (!track.swipe && Math.sqrt(track.speedX * track.speedX + track.speedY * track.speedY) > HIGH_SPEED) {
                            track.swipe = true;
                        }

                        event.fromX = track.lastX;
                        event.fromY = track.lastY;
                        event.toX = track.clientX;
                        event.toY = track.clientY;
                        callback('panmove');
                    } else if (track) {
                        if (track.swipe && Date.now() - track.startTime < 500 && Math.sqrt(Math.pow(track.clientX - track.startX, 2) + Math.pow(track.clientY - track.startY, 2)) > 30) {
                            event.angle = calcAngle(track.clientX - track.startX, track.clientY - track.startY);
                            if (event.angle > 150 && event.angle < 210) {
                                callback('swipeleft');
                            } else if (event.angle > 330 || event.angle < 30) {
                                callback('swiperight');
                            } else if (event.angle > 60 && event.angle < 120) {
                                callback('swipeup');
                            } else if (event.angle > 240 && event.angle < 300) {
                                callback('swipedown');
                            }
                            callback('swipe');
                        } else if (isTouchClick(track) && Math.sqrt(track.speedX * track.speedX + track.speedY * track.speedY) < HIGH_SPEED) {
                            callback('tap');
                        }
                    }
                }
                break;
            case 2:
                var track1 = tracks[pointers[0].identifier],
                    track2 = tracks[pointers[1].identifier];
                // 两指操作的时间间隔足够小
                if (Math.abs(track2.lastMoveTime - track1.lastMoveTime) < 100) {
                    var angle = Math.abs(track1.angle - track2.angle);
                    if (Math.abs(angle - 180) < 60) {
                        angle = calcAngle(track2.lastX - track1.lastX, track2.lastY - track1.lastY);
                        if (angle > 180) {
                            angle -= 180;
                        }
                        angle = Math.abs((track1.angle + track2.angle - 180) / 2 - angle);
                        // 对last夹角的计算判断运动是不是在两指的一个延长线上，否则可能是旋转产生的效果
                        if (angle < 60) {
                            event.clientX = (track1.clientX + track2.clientX) / 2;
                            event.clientY = (track1.clientY + track2.clientY) / 2;
                            event.from = Math.sqrt(Math.pow(track2.lastX - track1.lastX, 2) + Math.pow(track2.lastY - track1.lastY, 2));
                            event.to = Math.sqrt(Math.pow(track2.clientX - track1.clientX, 2) + Math.pow(track2.clientY - track1.clientY, 2));
                            if (event.from < event.to) {
                                callback('pinchout');
                            } else if (event.from > event.to) {
                                callback('pinchin');
                            }
                        } else if (Math.abs(angle - 90) < 60 &&
                                Math.sqrt(Math.pow(track2.clientX - track1.clientX, 2) + Math.pow(track2.clientY - track1.clientY, 2)) -
                                    Math.sqrt(Math.pow(track2.lastX - track1.lastX, 2) + Math.pow(track2.lastY - track1.lastY, 2)) < 10) {
                            event.angle = (track2.angle + track1.angle) / 2 - (calcAngle(track2.lastX, track2.lastY) + calcAngle(track1.lastX, track1.lastY)) / 2;
                            callback('rotate');
                        }
                    }
                }
                break;
            }
        }
    }

    /**
     * 滚轮事件处理。
     * @private
     *
     * @param {ECUIEvent} event 事件对象
     * @param {number} delta X轴滚动距离
     * @param {number} delta Y轴滚动距离
     */
    function onmousewheel(event, deltaX, deltaY) {
        if (scrollHandler) {
            scrollHandler();
            scrollHandler = null;
        }
        event = core.wrapEvent(event);
        event.deltaX = deltaX;
        event.deltaY = deltaY;

        // 拖拽状态下，不允许滚动
        if (currEnv.type === 'drag') {
            event.preventDefault();
        } else {
            bubble(hoveredControl, 'mousewheel', event);
            if (!event.cancelBubble) {
                bubble(focusedControl, 'mousewheel', event);
            }
            onbeforescroll(event);
            if (core.getScrollNarrow()) {
                var startTime = Date.now();
                scrollHandler = util.timer(
                    function () {
                        var handler = scrollHandler;
                        scrollHandler = null;
                        onscroll(event);
                        if (Date.now() - startTime > 500) {
                            if (handler) {
                                handler();
                            }
                        } else {
                            scrollHandler = handler;
                            onbeforescroll(event);
                        }
                    },
                    -1
                );
            } else {
                scrollHandler = util.timer(
                    function () {
                        scrollHandler = null;
                        onscroll(event);
                    },
                    50
                );
            }
        }
    }

    /**
     * 压力变化的事件处理。
     * @private
     *
     * @param {ECUIEvent} event 事件对象
     * @param {boolean} isForce 是否重压
     */
    function onpressure(event, isForce) {
        if (isForce && hoveredControl && !forcedControl) {
            forcedControl = hoveredControl;
            bubble(forcedControl, 'forcedown', event);
        } else if (!isForce && forcedControl) {
            bubble(forcedControl, 'forceup', event);
            forcedControl = null;
        }
    }

    /**
     * 滚动时的事件处理。
     * @private
     *
     * @param {ECUIEvent} event 事件对象
     */
    function onscroll(event) {
        if (scrollHandler) {
            return;
        }
        event = core.wrapEvent(event);
        var control = event.getControl();
        if (control) {
            core.dispatchEvent(control, 'scroll', event);
        }
        independentControls.forEach(function (item) {
            core.dispatchEvent(item, 'scroll', event);
        });
        core.mask(true);
    }

    /**
     * 文本选择开始处理。
     * @private
     *
     * @param {ecui.ui.Control} control 需要操作的控件
     * @param {ECUIEvent} event 事件对象
     */
    function onselectstart(control, event) {
        if (isTouchMoved === undefined) { // MouseEvent
            for (; control; control = control.getParent()) {
                if (!control.isUserSelect()) {
                    event.preventDefault();
                    return;
                }
            }
        }
    }

    /**
     * 恢复当前框架的状态到上一个状态。
     * restore 用于恢复调用特殊操作如 drag 与 disable 后改变的框架环境，包括各框架事件处理函数的恢复、控件的焦点设置等。
     * @private
     */
    function restore() {
        currEnv = envStack.pop();
    }

    /**
     * 设置 ecui 环境。
     * @private
     *
     * @param {object} env 环境描述对象
     */
    function setEnv(env) {
        envStack.push(currEnv);
        currEnv = Object.assign({}, currEnv, env);
    }

    /**
     * 开始仿真滚动行为。
     * @private
     */
    function startSimulationScroll(event) {
        // 为了兼容beforescroll事件，同时考虑到scroll执行效率问题，自己手动触发滚动条事件
        if (isScrollClick(event)) {
            onbeforescroll(event);
            scrollHandler = util.timer(
                function () {
                    var handler = scrollHandler;
                    scrollHandler = null;
                    onscroll(event);
                    scrollHandler = handler;
                    onbeforescroll(event);
                },
                -1
            );
        }
    }

    /**
     * 结束仿真滚动行为。
     * @private
     */
    function stopSimulationScroll(event) {
        if (scrollHandler) {
            scrollHandler();
            scrollHandler = null;
            util.timer(onscroll, 300, this, event);
        }
    }

    Object.assign(core, {
        /**
         * 使一个 Element 对象与一个 ECUI 控件 在逻辑上绑定。
         * 一个 Element 对象只能绑定一个 ECUI 控件，Element 对象通过 getControl方法获取绑定的 ECUI 控件，重复绑定会自动取消之前的绑定。
         * @protected
         *
         * @param {HTMLElement} el Element 对象
         * @param {ecui.ui.Control} control ECUI 控件
         */
        $bind: function (el, control) {
            el._cControl = control;
            el.getControl = getControlByElement;
        },

        /**
         * 清除控件的状态。
         * 控件在销毁、隐藏与失效等情况下，需要使用 $clearState 方法清除已经获得的焦点与激活等状态。
         * @protected
         *
         * @param {ecui.ui.Control} control ECUI 控件
         */
        $clearState: function (control) {
            var parent = control.getParent();

            core.loseFocus(control);
            if (control.contain(activedControl)) {
                bubble(activedControl, 'deactivate', null, activedControl = parent);
            }
            if (control.contain(hoveredControl)) {
                bubble(hoveredControl, 'mouseout', null, hoveredControl = parent);
            }
        },

        /**
         * 创建 ECUI 控件。
         * $create 方法创建控件时不会自动渲染控件。在大批量创建控件时，为了加快渲染速度，应该首先使用 $create 方法创建所有控件完成后，再批量分别调用控件的 cache、init 与 repaint 方法渲染控件。options 对象支持的属性如下：
         * id         {string} 当前控件的 id，提供给 delegate 与 get 方法使用
         * main       {HTMLElement} 与控件绑捆的 Element 对象(参见 getMain 方法)，如果忽略此参数将创建 Element 对象与控件绑捆
         * parent     {ecui.ui.Control} 父控件对象或者父 Element 对象
         * primary    {string} 控件的基本样式(参见 getMainClass 方法)，如果忽略此参数将使用主元素的 className 属性
         * @protected
         *
         * @param {Function} UIClass 控件的构造函数
         * @param {object} options 初始化选项(参见 ECUI 控件)
         * @return {ecui.ui.Control} ECUI 控件
         */
        $create: function (UIClass, options) {
            options = options || {};

            var parent = options.parent,
                el = options.main;

            options.uid = 'ecui-' + (++uniqueIndex);

            if (el) {
                // 如果指定的元素已经初始化，直接返回
                if (el.getControl) {
                    return el.getControl();
                }

                options.primary = UIClass.CLASS;
            } else {
                // 没有传入主元素，需要自动生成，此种情况比较少见，不推荐使用
                el = options.main = dom.create({className: UIClass.CLASS});
            }

            var control = new UIClass(el, options);

            if (parent) {
                if (parent instanceof ui.Control) {
                    control.setParent(parent);
                } else {
                    control.appendTo(parent);
                }
            } else {
                control.$setParent(core.findControl(dom.parent(control.getMain())));
            }

            oncreate(control, options);
            if (!control.constructor.singleton) {
                allControls.push(control);
                independentControls.push(control);
            }

            // 处理所有的委托操作，参见delegate
            if (el = delegateControls[options.id]) {
                delete delegateControls[options.id];
                el.forEach(function (item) {
                    item.args[0] = control;
                    item.func.apply(item.caller, item.args);
                });
            }

            return control;
        },

        /**
         * 快速创建 ECUI 控件。
         * $fastCreate 方法仅供控件生成自己的部件使用，生成的控件不在控件列表中注册，不自动刷新也不能通过 query 方法查询(参见 $create 方法)。$fastCreate 方法通过分解 Element 对象的 className 属性得到样式信息，其中第一个样式为类型样式，第二个样式为基本样式。
         * @protected
         *
         * @param {Function} UIClass 控件的构造函数
         * @param {HTMLElement} el 控件对应的 Element 对象
         * @param {ecui.ui.Control} parent 控件的父控件
         * @param {object} options 初始化选项(参见 ECUI 控件)
         * @return {ecui.ui.Control} ECUI 控件
         */
        $fastCreate: function (UIClass, el, parent, options) {
            options = options || {};

            options.uid = 'ecui-' + (++uniqueIndex);

            var control = new UIClass(el, options);
            control.$setParent(parent);
            oncreate(control, options);
            allControls.push(control);

            core.dispatchEvent(control, 'ready', {options: options});

            return control;
        },

        /**
         * 添加控件的事件监听函数。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件
         * @param {string} name 事件名称
         * @param {Function} func 监听函数
         */
        addEventListener: function (control, name, func) {
            control = control.getUID();
            eventListeners[control] = eventListeners[control] || {};
            (eventListeners[control][name] = eventListeners[control][name] || []).push(func);
        },

        /**
         * 添加控件的手势监听。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件
         * @param {object} listeners 手势监听函数集合
         */
        addGestureListeners: function (control, listeners) {
            gestureListeners.push([control, listeners]);
        },

        /**
         * 在元素显示时进行下级控件的缓存处理。
         * @public
         *
         * @param {HTMLElement} el 切换为显示状态的 DOM 元素
         */
        cacheAtShow: function (el) {
            core.query(function (item) {
                return dom.contain(el, item.getMain());
            }).sort(function (a, b) {
                var ia = 0,
                    ib = 0,
                    parent;

                for (parent = a; parent; parent = parent.getParent()) {
                    ia++;
                }
                for (parent = b; parent; parent = parent.getParent()) {
                    ib++;
                }
                return ib - ia;
            }).forEach(function (item) {
                item.cache();
            });
        },

        /**
         * 创建 ECUI 控件。
         * 标准的创建 ECUI 控件 的工厂方法，适用于少量创建控件，生成的控件不需要任何额外的调用即可正常的显示，对于批量创建控件，请使用 $create 方法。options 对象支持的属性如下：
         * id        {string} 当前控件的 id，提供给 delegate 与 get 方法使用
         * main      {HTMLElement} 与控件绑捆的 Element 对象(参见 getMain 方法)，如果忽略此参数将创建 Element 对象与控件绑捆
         * parent    {ecui.ui.Control} 父控件对象或者父 Element 对象
         * primary   {string} 控件的基本样式(参见 getMainClass 方法)，如果忽略此参数将使用主元素的 className 属性
         * @public
         *
         * @param {Function} UIClass 控件的构造函数
         * @param {object} options 初始化选项(参见 ECUI 控件)
         * @return {ecui.ui.Control} ECUI 控件
         */
        create: function (UIClass, options) {
            var control = core.$create(UIClass, options);
            control.cache();
            control.init(options);
            return control;
        },

        /**
         * 委托框架在指定的 ECUI 控件 生成时执行某个方法。
         * 使用页面静态初始化或页面动态初始化(参见 ECUI 使用方式)方式，控件创建时，相关联控件也许还未创建。delegate 方法提供将指定的函数滞后到对应的控件创建后才调用的模式。如果 targetId 对应的控件还未创建，则调用会被搁置，直到需要的控件创建成功后，再自动执行(参见 create 方法)。
         * @public
         *
         * @param {string} targetId 被委托的 ECUI 控件 标识符，即在标签的 ecui 属性中定义的 id 值
         * @param {object} caller 委托的对象
         * @param {Function} func 调用的函数
         * @param {object} ... 调用的参数
         */
        delegate: function (targetId, caller, func) {
            if (targetId) {
                var target = namedControls[targetId],
                    args = Array.prototype.slice.call(arguments, 2);
                if (target) {
                    args[0] = target;
                    func.apply(caller, args);
                } else {
                    (delegateControls[targetId] = delegateControls[targetId] || []).push({caller: caller, func: func, args: args});
                }
            }
        },

        /**
         * 框架停止接收事件。
         * @public
         */
        disable: function () {
            if (currEnv.type !== 'disable') {
                setEnv(disableEnv);
            }
        },

        /**
         * 触发事件。
         * dispatchEvent 会根据事件返回值或 event 的新状态决定是否触发默认事件处理。
         * @public
         *
         * @param {ecui.ui.Control} control 控件对象
         * @param {string} name 事件名
         * @param {ECUIEvent|Object} event 事件对象或事件对象参数
         * @return {boolean} 是否需要执行默认事件处理
         */
        dispatchEvent: function (control, name, event) {
            // 防止事件重入
            var uid = control.getUID(),
                listeners;

            eventStack[uid] = eventStack[uid] || {};
            if (eventStack[uid][name]) {
                return;
            }
            eventStack[uid][name] = true;

            if (event) {
                if (event instanceof ECUIEvent) {
                    event.type = name;
                } else {
                    event = Object.assign(new ECUIEvent(name), event);
                }
            } else {
                event = new ECUIEvent(name);
            }

            delete event.returnValue;
            delete event.cancelBubble;
            if ((control['on' + name] && control['on' + name](event) === false) || event.returnValue === false || (control['$' + name] && control['$' + name](event) === false)) {
                event.preventDefault();
            }

            // 检查事件是否被监听
            if (eventListeners[uid]) {
                if (listeners = eventListeners[uid][name]) {
                    listeners.forEach(function (item) {
                        if (item) {
                            item.call(control, event);
                        }
                    });
                }
            }

            delete eventStack[uid][name];
            return event.returnValue !== false;
        },

        /**
         * 释放 ECUI 控件及其子控件占用的内存。
         * @public
         *
         * @param {ecui.ui.Control|HTMLElement} control 需要释放的控件对象或包含控件的 Element 对象
         * @param {boolean} onlyChild 是否仅包含子控件，默认也包含自身
         */
        dispose: function (control, onlyChild) {

            // 判断一个控件是否位于一个DOM元素之下
            function contain(el, control) {
                for (; control; control = control.getParent()) {
                    if (dom.contain(el, control.getMain())) {
                        return true;
                    }
                }
            }

            var isControl = control instanceof ui.Control,
                namedMap = {},
                parent;

            if (isControl) {
                core.$clearState(control);
            } else {
                parent = core.findControl(dom.parent(control));
                // 以下判断需要考虑control.getMain()物理上不属于control但逻辑上属于的情况
                if (focusedControl && contain(control, focusedControl)) {
                    core.setFocused(parent);
                }
                if (activedControl && contain(control, activedControl)) {
                    bubble(activedControl, 'deactivate', null, activedControl = parent);
                }
                if (hoveredControl && contain(control, hoveredControl)) {
                    bubble(hoveredControl, 'mouseout', null, hoveredControl = parent);
                }
            }

            for (var key in namedControls) {
                if (namedControls.hasOwnProperty(key)) {
                    namedMap[namedControls[key].getUID()] = key;
                }
            }

            singletons.forEach(function (item) {
                if (isControl ? control.contain(item) : !!item.getMain() && contain(control, item)) {
                    item.setParent();
                }
            });

            // 需要删除的控件先放入一个集合中等待遍历结束后再删除，否则控件链将产生变化
            var index = 0;
            allControls.slice().filter(function (item) {
                if (isControl ? control.contain(item) : !!item.getMain() && contain(control, item)) {
                    if (!onlyChild || (isControl ? control !== item : control !== item.getMain())) {
                        util.remove(independentControls, item);
                        allControls.splice(index, 1);
                        if (item = namedMap[item.getUID()]) {
                            delete namedControls[item];
                        }
                        return true;
                    }
                }
                index++;
            }).forEach(function (item) {
                disposeControl(item);
                core.removeControlListeners(item);
            });
        },

        /**
         * 将指定的 ECUI 控件 设置为拖拽状态。
         * 只有在鼠标左键按下时，才允许调用 drag 方法设置待拖拽的 {'controls'|menu}，在拖拽操作过程中，将依次触发 ondragstart、ondragmove 与 ondragend 事件。range 参数支持的属性如下：
         * x      {number} 初始的x坐标
         * y      {number} 初始的y坐标
         * top    {number} 控件允许拖拽到的最小Y轴坐标
         * right  {number} 控件允许拖拽到的最大X轴坐标
         * bottom {number} 控件允许拖拽到的最大Y轴坐标
         * left   {number} 控件允许拖拽到的最小X轴坐标
         * @public
         *
         * @param {ecui.ui.Control} control 需要进行拖拽的 ECUI 控件对象
         * @param {ECUIEvent} event 事件对象
         * @param {object} options 控件拖拽的参数，省略参数时，控件默认只允许在 offsetParent 定义的区域内拖拽，如果 offsetParent 是 body，则只允许在当前浏览器可视范围内拖拽
         */
        drag: function (control, event, options) {
            if (!control) {
                // 不指定控件，取消drag
                restore();
                return;
            }
            // 控件之前处于惯性状态必须停止
            var uid = control.getUID(),
                force;

            if (inertiaHandles[uid]) {
                inertiaHandles[uid]();
                delete inertiaHandles[uid];
                dragAnimationFrame(currEnv, control, false);
                force = true;
            }

            if (event && activedControl !== undefined && currEnv.type !== 'drag') {
                setEnv(dragEnv);

                // 判断鼠标没有mouseup
                var parent = control.getMain().offsetParent || document.documentElement,
                    style = dom.getStyle(parent);

                // 拖拽范围默认不超出上级元素区域
                Object.assign(
                    currEnv,
                    parent.tagName === 'BODY' || parent.tagName === 'HTML' ? util.getView() : {
                        top: 0,
                        right: parent.offsetWidth - util.toNumber(style.borderLeftWidth) - util.toNumber(style.borderRightWidth),
                        bottom: parent.offsetHeight - util.toNumber(style.borderTopWidth) - util.toNumber(style.borderBottomWidth),
                        left: 0
                    }
                );
                Object.assign(currEnv, options);

                var x = currEnv.x !== undefined ? currEnv.x : control.getX(),
                    y = currEnv.y !== undefined ? currEnv.y : control.getY();

                if (!currEnv.absolute) {
                    currEnv.right = Math.max(currEnv.right - control.getWidth(), currEnv.left);
                    currEnv.bottom = Math.max(currEnv.bottom - control.getHeight(), currEnv.top);
                }
                currEnv.originalX = x;
                currEnv.originalY = y;

                if (currEnv.limit) {
                    currEnv.limitRatio = currEnv.limit.ratio || 3;
                    currEnv.limitLeft = currEnv.limit.left === undefined ? currEnv.left : currEnv.limit.left;
                    currEnv.left += (currEnv.left - currEnv.limitLeft) * (currEnv.limitRatio - 1);
                    currEnv.limitRight = currEnv.limit.right === undefined ? currEnv.right : currEnv.limit.right;
                    currEnv.right += (currEnv.right - currEnv.limitRight) * (currEnv.limitRatio - 1);
                    currEnv.limitTop = currEnv.limit.top === undefined ? currEnv.top : currEnv.limit.top;
                    currEnv.top += (currEnv.top - currEnv.limitTop) * (currEnv.limitRatio - 1);
                    currEnv.limitBottom = currEnv.limit.bottom === undefined ? currEnv.bottom : currEnv.limit.bottom;
                    currEnv.bottom += (currEnv.bottom - currEnv.limitBottom) * (currEnv.limitRatio - 1);
                }
                currEnv.target = control;

                event.track.logicX = event.clientX;
                event.track.logicY = event.clientY;
                control.setPosition(x, y);

                if (!force) {
                    core.dispatchEvent(control, 'dragstart', {track: event.track});
                    dom.addClass(document.body, 'ui-drag');
                }

                //这里不能preventDefault事件，否则input的软键盘无法出现
            }
        },

        /**
         * 框架恢复接收事件。
         * @public
         */
        enable: function () {
            if (currEnv.type === 'disable') {
                restore();
            }
        },

        /**
         * flex修正。
         * @public
         *
         * @param {HTMLElement} el 需要遍历flex元素的根元素
         */
        flexFixed: function (el) {
            if (iosVersion < 11 && ecuiOptions.flexFixed) {
                var list = [];
                [el].concat(dom.toArray(el.getElementsByTagName('*'))).forEach(flexElementToArray, list);
                list.forEach(flexElementToBoxing);
            }
        },

        /**
         * 从指定的 Element 对象开始，依次向它的父节点查找绑定的 ECUI 控件。
         * findControl 方法，会返回从当前 Element 对象开始，依次向它的父 Element 查找到的第一个绑定(参见 $bind 方法)的 ECUI 控件。findControl 方法一般在控件创建时使用，用于查找父控件对象。
         * @public
         *
         * @param {HTMLElement} el Element 对象
         * @return {ecui.ui.Control} ECUI 控件对象，如果不能找到，返回 null
         */
        findControl: function (el) {
            for (; el; el = dom.parent(el)) {
                if (el.getControl) {
                    return el.getControl();
                }
            }

            return null;
        },

        /**
         * 获取指定名称的 ECUI 控件。
         * 使用页面静态初始化或页面动态初始化(参见 ECUI 使用方式)创建的控件，如果在 ecui 属性中指定了 id，就可以通过 get 方法得到控件，也可以在 Element 对象上使用 getControl 方法。
         * @public
         *
         * @param {string} id ECUI 控件的名称，通过 Element 对象的初始化选项 id 定义
         * @return {ecui.ui.Control} 指定名称的 ECUI 控件对象，如果不存在返回 null
         */
        get: function (id) {
            return namedControls[id] || null;
        },

        /**
         * 获取当前处于激活状态的 ECUI 控件。
         * 激活状态，指鼠标在控件区域左键从按下到弹起的全过程，无论鼠标移动到哪个位置，被激活的控件对象不会发生改变。处于激活状态的控件及其父控件，都具有激活状态样式。
         * @public
         *
         * @return {ecui.ui.Control} 处于激活状态的 ECUI 控件，如果不存在返回 null
         */
        getActived: function () {
            return activedControl || null;
        },

        /**
         * 获取当前的初始化属性名。
         * getAttributeName 方法返回页面静态初始化(参见 ECUI 使用方式)使用的属性名，通过在 BODY 节点的 data-ecui 属性中指定，默认使用 ecui 作为初始化属性名。
         * @public
         *
         * @return {string} 当前的初始化属性名
         */
        getAttributeName: function () {
            return ecuiOptions.name;
        },

        /**
         * 获取当前处于焦点状态的控件。
         * 焦点状态，默认优先处理键盘/滚轮等特殊事件。处于焦点状态的控件及其父控件，都具有焦点状态样式。通常鼠标左键的点击将使控件获得焦点状态，之前拥有焦点状态的控件将失去焦点状态。
         * @public
         *
         * @return {ecui.ui.Control} 处于焦点状态的 ECUI 控件，如果不存在返回 null
         */
        getFocused: function () {
            return focusedControl;
        },

        /**
         * 获取当前处于悬停状态的控件。
         * 悬停状态，指鼠标当前位于控件区域。处于悬停状态的控件及其父控件，都具有悬停状态样式。
         * @public
         *
         * @return {ecui.ui.Control} 处于悬停状态的 ECUI 控件，如果不存在返回 null
         */
        getHovered: function () {
            return hoveredControl;
        },

        /**
         * 获取当前有效的键值码。
         * getKey 方法返回最近一次 keydown 事件的 keyCode/which 值，用于解决浏览器的 keypress 事件中特殊按键(例如方向键等)没有编码值的问题。
         * @public
         *
         * @return {number} 键值码
         */
        getKey: function () {
            return keyCode;
        },

        /**
         * 获取所有被命名的控件。
         * @public
         *
         * @return {object} 所有被命名的控件集合
         */
        getNamedControls: function () {
            return Object.assign({}, namedControls);
        },

        /**
         * 从 Element 对象中获取初始化选项对象。
         * @public
         *
         * @param {HTMLElement} el Element 对象
         * @param {string} attributeName 当前的初始化属性名(参见 getAttributeName 方法)
         * @return {object} 初始化选项对象
         */
        getOptions: function (el, attributeName) {
            attributeName = attributeName || ecuiOptions.name;

            var text = dom.getAttribute(el, attributeName),
                options;

            if (text) {
                options = {};
                el.removeAttribute(attributeName);

                for (; /^(\s*;)?\s*(ext\-)?([\w\-]+)\s*(:\s*([^;\s]+(\s+[^;\s]+)*)?\s*)?($|;)/.test(text); ) {
                    text = RegExp['$\''];

                    var info = RegExp.$4,
                        value = RegExp.$5;
                    (RegExp.$2 ? (options.ext = options.ext || {}) : options)[util.toCamelCase(RegExp.$3)] = info ? value === 'true' ? true : value === 'false' ? false : value.charAt(0) === '&' ? JSON.parse(decodeURIComponent(value.slice(1))) : decodeURIComponent(value) : true;
                }

                if (core.onparseoptions) {
                    core.onparseoptions(options);
                }
                return options;
            }
        },

        /**
         * 获取浏览器滚动条的厚度。
         * getScrollNarrow 方法对于垂直滚动条，返回的是滚动条的宽度，对于水平滚动条，返回的是滚动条的高度。
         * @public
         *
         * @return {number} 浏览器滚动条相对窄的一边的长度
         */
        getScrollNarrow: function () {
            return scrollNarrow;
        },

        /**
         * 获取一个 ECUI 单例控件，如果不存在则创建，ECUI 并未实现真正意义上的单例，这里只是用于标记该控件不会被 dispose 方法释放。
         * @public
         *
         * @param {Function} UIClass 控件的构造函数
         * @param {HTMLElement} el 控件对应的 Element 对象
         * @param {ecui.ui.Control} parent 控件的父控件
         * @param {object} options 初始化选项(参见 ECUI 控件)
         * @return {ecui.ui.Control} ECUI 控件
         */
        getSingleton: function (UIClass, el, parent, options) {
            for (var i = 0, item; item = singletons[i++]; ) {
                if (item.constructor === UIClass) {
                    return item;
                }
            }
            return core.create(UIClass, Object.assign({}, options, { main: 'function' === typeof el ? el() : el, parent: parent}));
        },

        /**
         * 获取框架的状态。
         * @public
         *
         * @return {string} 框架的状态
         */
        getStatus: function () {
            return currEnv.type;
        },

        /**
         * 控件继承。
         * 如果不指定类型样式，表示使用父控件的类型样式，如果指定的类型样式以 * 符号开头，表示移除父控件的类型样式并以之后的类型样式代替。生成的子类构造函数已经使用了 constructor/TYPES/CLASS 三个属性，TYPES 属性是控件的全部类型样式，CLASS 属性是控件的全部类型样式字符串。
         * @public
         *
         * @param {Function} superClass 父控件类
         * @param {boolean} singleton 是否单例
         * @param {string} type 子控件的类型样式
         * @param {Function} constructor 子控件的标准构造函数，如果忽略将直接调用父控件类的构造函数
         * @param {object} ... 控件扩展的方法
         * @return {Function} 新控件的构造函数
         */
        inherits: function (superClass, singleton, type, constructor) {
            var index = 4,
                realSingleton = singleton,
                realType = type,
                realConstructor = constructor,
                subClass = function (el, options) {
                    if (subClass.singleton) {
                        for (var i = 0, item; item = singletons[i++]; ) {
                            if (item.constructor === subClass) {
                                return item;
                            }
                        }
                    }

                    subClass.interfaces.forEach(
                        function (imp) {
                            this[imp.NAME + 'Data'] = {};
                        },
                        this
                    );
                    subClass.constructor.call(this, el, options);
                    el = this.getMain();
                    subClass.interfaces.forEach(
                        function (imp) {
                            if (imp.constructor) {
                                imp.constructor.call(this, el, options);
                            }
                        },
                        this
                    );
                    if (subClass.afterinterfaces) {
                        subClass.afterinterfaces.call(this, el, options);
                    }

                    if (subClass.singleton) {
                        singletons.push(this);
                    }
                };

            if ('boolean' !== typeof realSingleton) {
                index--;
                realConstructor = realType;
                realType = realSingleton;
                realSingleton = false;
            }
            subClass.singleton = realSingleton;

            if ('string' !== typeof realType) {
                index--;
                realConstructor = realType;
                realType = '';
            }

            if (realConstructor instanceof Array) {
                subClass.constructor = realConstructor[1] || superClass;
                subClass.afterinterfaces = realConstructor[0];
            } else if ('function' !== typeof realConstructor) {
                subClass.constructor = superClass;
                index--;
            } else {
                subClass.constructor = realConstructor;
            }
            subClass.interfaces = [];

            if (superClass) {
                util.inherits(subClass, superClass);

                realType = realType ? (realType.charAt(0) === '*' ? realType.slice(1) : [realType]) : [];
                subClass.TYPES = [];

                superClass.TYPES.forEach(function (item) {
                    if (realType instanceof Array) {
                        item = realType.concat(item);
                    } else {
                        item = item.slice();
                        item[0] = realType;
                    }
                    subClass.TYPES.push(item);
                });
                subClass.TYPES.push(realType instanceof Array ? realType : [realType]);
            } else {
                // ecui.ui.Control的特殊初始化设置
                subClass.TYPES = [[]];
            }
            subClass.CLASS = subClass.TYPES[0].length ? ' ' + subClass.TYPES[0].join(' ') : '';

            for (var superMethods = [], item; item = arguments[index++]; ) {
                if (item.NAME) {
                    if (item.SUPER) {
                        if (item.SUPER instanceof Array) {
                            superMethods.push.apply(this, item.SUPER);
                        } else {
                            superMethods.push(item.SUPER);
                        }
                    }
                }
                superMethods.push(item);
            }
            superMethods.forEach(function (item) {
                if (item.NAME) {
                    subClass.interfaces.push(item);
                    // 对接口的处理
                    var Clazz = new Function();
                    Clazz.prototype = superClass.prototype;
                    var prototype = new Clazz();
                    Object.assign(prototype, subClass.prototype);
                    subClass.prototype[item.NAME] = prototype;
                    item = item.Methods;
                }
                Object.assign(subClass.prototype, item);
            });

            // 释放闭包占用的资源
            superClass = type = constructor = realConstructor = null;
            return subClass;
        },

        /**
         * 初始化指定的 Element 对象对应的 DOM 节点树。
         * init 方法将初始化指定的 Element 对象及它的子节点，如果这些节点拥有初始化属性(参见 getAttributeName 方法)，将按照规则为它们绑定 ECUI 控件，每一个节点只会被绑定一次，重复的绑定无效。页面加载完成时，将会自动针对 document.body 执行这个方法，相当于自动执行以下的语句：ecui.init(document.body)
         * @public
         *
         * @param {Element} el Element 对象
         */
        init: function (el) {
            if (!initEnvironment() && el) {
//{if 0}//
                if (!dom.contain(document.body, el)) {
                    console.warn('The element is not in the Document');
                }
//{/if}//
                var list = dom.getAttribute(el, ecuiOptions.name) ? [el] : [],
                    controls = [],
                    options;

                if (!initRecursion) {
                    // 第一层 init 循环的时候需要关闭resize事件监听，防止反复的重入
                    dom.removeEventListener(window, 'resize', events.orientationchange);
                }
                initRecursion++;

                dom.toArray(el.all || el.getElementsByTagName('*')).forEach(function (item) {
                    if (iosVersion < 11 && ecuiOptions.flexFixed) {
                        flexElementToArray.call(list, item);
                    }

                    if (dom.getAttribute(item, ecuiOptions.name)) {
                        list.push(item);
                    }
                });

                list.forEach(function (item) {
                    if (item instanceof Array) {
                        flexElementToBoxing(item);
                    } else if (options = core.getOptions(item)) {
                        if (item.getControl) {
                            oncreate(item.getControl(), options);
                            return;
                        }
                        options.main = item;
                        item = options.type ?
                                options.type.indexOf('.') < 0 ?
                                        ui[util.toCamelCase(options.type.charAt(0).toUpperCase() + options.type.slice(1))] :
                                        util.parseValue(options.type, ui) || util.parseValue(options.type) :
                                ui.Control;
//{if 0}//
                        try {
//{/if}//
                            controls.push({object: core.$create(item, options), options: options});
//{if 0}//
                        } catch (e) {
                            console.warn('The type:' + options.type + ' can\'t constructor');
                            throw e;
                        }
//{/if}//
                    }
                });

                controls.forEach(function (item) {
                    item.object.cache();
                });
                controls.forEach(function (item) {
                    item.object.init(item.options);
                });

                if (initRecursion === 1) {
                    if (readyList) {
                        readyList.forEach(function (item) {
                            item();
                        });
                        readyList = null;
                    }

                    dom.addEventListener(window, 'resize', events.orientationchange);
                }

                initRecursion--;

                // 防止循环引用
                list = el = null;
            }
        },

        /**
         * 默认的盒子模型是否为ContentBox状态
         * @public
         *
         * @param {HTMLElement} el DOM 对象
         * @return {boolean} 是否为CSS2.1默认的盒子模型
         */
        isContentBox: function (el) {
            if (ieVersion < 8) {
                return el.tagName === 'INPUT' || el.tagName === 'BUTTON' ? false : flgFixedSize;
            }
            return dom.getStyle(el, 'boxSizing') === 'content-box';
        },

        /**
         * 使控件失去焦点。
         * loseFocus 方法不完全是 setFocused 方法的逆向行为。如果控件及它的子控件不处于焦点状态，执行 loseFocus 方法不会发生变化。如果控件或它的子控件处于焦点状态，执行 loseFocus 方法将使控件失去焦点状态，如果控件拥有父控件，此时父控件获得焦点状态。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件
         */
        loseFocus: function (control) {
            if (control.contain(focusedControl)) {
                core.setFocused(control.getParent());
            }
        },

        /**
         * 使用或取消一个层遮罩整个浏览器可视化区域。
         * 遮罩层的 z-index 样式默认取值为 32000，请不要将 Element 对象的 z-index 样式设置大于 32000。当框架中至少一个遮罩层工作时，body 标签将增加一个样式 ecui-mask，IE6/7 的原生 select 标签可以使用此样式进行隐藏，解决强制置顶的问题。如果不传入任何参数，将关闭最近打开的一个遮罩层，如果要关闭指定的遮罩层，请直接调用返回的函数。
         * @public
         *
         * @param {number} opacity 透明度，如 0.5，如果省略参数将关闭遮罩层
         * @param {number} zIndex 遮罩层的 zIndex 样式值，如果省略使用 32000
         * @return {Function} 用于关闭当前遮罩层的函数
         */
        mask: function (opacity, zIndex) {
            var el = document.body;

            if ('boolean' === typeof opacity) {
                var view = util.getView(),
                    text = ';top:' + (view.top - view.height) + 'px;left:' + (view.left - view.width) + 'px;width:' + (view.width * 3) + 'px;height:' + (view.height * 3) + 'px;display:' + (opacity ? 'block' : 'none');

                // 仅简单的显示或隐藏当前的屏蔽层，用于resize时的重绘
                maskElements.forEach(function (item) {
                    item.style.cssText += text;
                });
            } else if (opacity === undefined) {
                unmasks.pop()();
                gestureListeners = gestureStack.pop();
            } else {
                if (!maskElements.length) {
                    dom.addClass(el, 'ui-modal');
                }

                view = util.getView();
                maskElements.push(
                    el = el.appendChild(
                        dom.create(
                            {
                                className: 'ui-mask',
                                style: {
                                    cssText: ';top:' + (view.top - view.height) + 'px;left:' + (view.left - view.width) + 'px;width:' + (view.width * 3) + 'px;height:' + (view.height * 3) + 'px;display:block;z-index:' + (zIndex || 32000)
                                }
                            }
                        )
                    )
                );
                dom.setStyle(el, 'opacity', opacity);

                unmasks.push(

                    /**
                     * 关闭浮层。
                     * @public
                     *
                     * @param {boolean} unload 是否在 unload 中触发函数
                     */
                    function (unload) {
                        if (!unload) {
                            util.remove(maskElements, el);
                            util.timer(dom.remove, 1000, null, el);
                            el.style.display = 'none';
                            if (!maskElements.length) {
                                dom.removeClass(document.body, 'ui-modal');
                            }
                        }
                        el = null;
                    }
                );

                gestureStack.push(gestureListeners);
                gestureListeners = [];
                return unmasks[unmasks.length - 1];
            }
        },

        /**
         * 暂停框架自动初始化，暂停次数可以累加。
         * @public
         */
        pause: function () {
            pauseCount++;
        },

        /**
         * 查询满足条件的控件列表。
         * @public
         *
         * @param {Function} fn 查询函数
         * @param {object} thisArg fn执行过程中的this对象
         * @return {Array} 控件列表
         */
        query: function (fn, thisArg) {
            return independentControls.filter(fn, thisArg);
        },

        /**
         * 框架加载完成后需要调用的函数。
         * @public
         *
         * @param {Function} fn 需要调用的函数
         */
        ready: function (fn) {
            if (readyList) {
                readyList.push(fn);
            } else {
                fn();
            }
        },

        /**
         * 移除控件的事件监听器。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件
         */
        removeControlListeners: function (control) {
            delete eventListeners[control.getUID()];
            core.removeGestureListeners(control);
        },

        /**
         * 移除控件的事件监听函数。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件
         * @param {string} name 事件名称
         * @param {Function} func 监听函数
         */
        removeEventListener: function (control, name, func) {
            control = control.getUID();
            if (eventListeners[control] && eventListeners[control][name]) {
                util.remove(eventListeners[control][name], func);
            }
        },

        /**
         * 移除控件的手势监听。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件
         */
        removeGestureListeners: function (control) {
            gestureStack.forEach(function (listeners) {
                for (var i = listeners.length; i--; ) {
                    if (listeners[i][0] === control) {
                        listeners.splice(i, 1);
                    }
                }
            });
            for (var i = gestureListeners.length; i--; ) {
                if (gestureListeners[i][0] === control) {
                    gestureListeners.splice(i, 1);
                }
            }
        },

        /**
         * 重绘浏览器区域的控件。
         * repaint 方法在页面改变大小时自动触发，一些特殊情况下，例如包含框架的页面，页面变化时不会触发 onresize 事件，需要手工调用 repaint 函数重绘所有的控件。
         * @public
         */
        repaint: function () {
            function filter(item) {
                return item.getParent() === resizeList && item.isShow();
            }

            // 拖拽状态时不进行窗体大小改变
            if (currEnv.type === 'drag') {
                return;
            }

            // 隐藏所有遮罩层
            core.mask(false);
            core.flexFixed(document.body);

            // 按广度优先查找所有正在显示的控件，保证子控件一定在父控件之后
            for (var i = 0, list = [], resizeList = null, widthList; resizeList !== undefined; resizeList = list[i++]) {
                Array.prototype.push.apply(list, core.query(filter));
            }

            resizeList = list.filter(function (item) {
                core.dispatchEvent(item, 'resize', widthList = new ECUIEvent('repaint'));
                // 这里与Control控件的$resize方法存在强耦合，repaint有值表示在$resize中没有进行针对ie的width值回填
                if (widthList.repaint) {
                    return item;
                }
            });

            if (resizeList.length) {
                // 由于强制设置了100%，因此改变ie下控件的大小必须从内部向外进行
                // 为避免多次reflow，增加一次循环
                widthList = resizeList.map(function (item) {
                    return item.getMain().offsetWidth;
                });
                resizeList.forEach(function (item, index) {
                    item.getMain().style.width = widthList[index] - (isStrict ? item.$getBasicWidth() * 2 : 0) + 'px';
                });
            }

            list.forEach(function (item) {
                item.cache(true);
            });
            list.forEach(function (item) {
                item.initStructure();
            });

            if (ieVersion < 8) {
                // 解决 ie6/7 下直接显示遮罩层，读到的浏览器大小实际未更新的问题
                util.timer(core.mask, 0, null, true);
            } else {
                core.mask(true);
            }
        },

        /**
         * 触发框架自动初始化，减少暂停次数，到零时触发初始化。
         * @public
         */
        resume: function () {
            pauseCount--;
            if (!pauseCount) {
                if (document.body) {
                    dom.ready(function () {
                        core.init();
                    });
                }
            } else if (pauseCount < 0) {
                pauseCount = 0;
            }
        },

        /**
         * 使 ECUI 控件 得到焦点。
         * setFocused 方法将指定的控件设置为焦点状态，允许不指定需要获得焦点的控件，则当前处于焦点状态的控件将失去焦点，需要将处于焦点状态的控件失去焦点还可以调用 loseFocus 方法。如果控件处于失效状态，设置它获得焦点状态将使所有控件失去焦点状态。需要注意的是，如果控件处于焦点状态，当通过 setFocused 方法设置它的子控件获得焦点状态时，虽然处于焦点状态的控件对象发生了变化，但是控件不会触发 onblur 方法，此时控件逻辑上仍然处于焦点状态。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件
         */
        setFocused: function (control) {
            if (!control || control.isDisabled()) {
                // 处于失效状态的控件不允许获得焦点状态
                bubble(focusedControl, 'blur', null, null);
                focusedControl = null;
                return;
            }

            for (var target = control; target; target = target.getParent()) {
                // 不允许获得焦点状态的控件自动向上查找，找不到直接结束
                if (target.isFocusable()) {
                    if (target === control || !target.contain(focusedControl)) {
                        // 允许获得焦点的控件必须是当前激活的控件，或者它没有焦点的时候才允许获得
                        // 典型的用例是滚动条，滚动条不需要获得焦点，如果滚动条的父控件没有焦点
                        // 父控件获得焦点，否则焦点不发生变化
                        var parent = getCommonParent(focusedControl, target);
                        bubble(focusedControl, 'blur', null, parent);
                        bubble(focusedControl = target, 'focus', null, parent);
                    }
                    break;
                }
            }

        },

        /**
         * 包装事件对象。
         * event 方法将浏览器产生的鼠标与键盘事件标准化并添加 ECUI 框架需要的信息到事件对象中。标准化的属性如下：
         * pageX           {number} 鼠标的X轴坐标
         * pageY           {number} 鼠标的Y轴坐标
         * clientX         {number} 鼠标当前区域的X轴坐标
         * clientY         {number} 鼠标当前区域的Y轴坐标
         * which           {number} 触发事件的按键码
         * target          {HTMLElement} 触发事件的 Element 对象
         * returnValue     {boolean}  是否进行默认处理
         * cancelBubble    {boolean}  是否取消冒泡
         * exit            {Function} 终止全部事件操作
         * getControl      {Function} 获取触发事件的 ECUI 控件 对象
         * getNative       {Function} 获取原生的事件对象
         * preventDefault  {Function} 阻止事件的默认处理
         * stopPropagation {Function} 事件停止冒泡
         * @public
         *
         * @param {Event} event 事件对象
         * @return {ECUIEvent} 标准化后的事件对象
         */
        wrapEvent: function (event) {
            if (event instanceof ECUIEvent) {
                // 防止事件对象被多次包装
                return event;
            }

            var body = document.body,
                html = dom.parent(body);

            if (ieVersion < 9) {
                event = window.event;
                event.pageX = html.scrollLeft + body.scrollLeft - html.clientLeft + event.clientX - body.clientLeft;
                event.pageY = html.scrollTop + body.scrollTop - html.clientTop + event.clientY - body.clientTop;
                event.target = event.srcElement;
                event.which = event.keyCode || (event.button | 1);
            }

            if (event.clientX !== undefined) {
                lastClientX = event.clientX;
                lastClientY = event.clientY;
            } else {
                event.clientX = lastClientX;
                event.clientY = lastClientY;
            }

            return new ECUIEvent(event.type, event);
        }
    });

    dom.ready(function () {
        if (!pauseCount) {
            core.init();
        }
    });
}());
