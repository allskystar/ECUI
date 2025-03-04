//{if $css}//
ecui.__ControlStyle__('\
#ECUI-CLIPBOARD {\
    position: absolute !important;\
    top: -30px !important;\
    height: 20px !important;\
    padding: 0px !important;\
    border-width: 0px !important;\
    margin: 0px !important;\
    overflow: hidden !important;\
}\
\
#ECUI-FIXED-BODY {\
    position: relative !important;\
    display: block !important;\
    overflow: auto !important;\
    height: 100% !important;\
    padding: 0px !important;\
    border-width: 0px !important;\
    margin: 0px !important;\
}\
\
#ECUI-FIXED-INPUT {\
    position: absolute !important;\
    bottom: 0px;\
    left: -100px;\
    width: 80px;\
    height: 20px;\
    padding: 0px !important;\
    border-width: 0px !important;\
}\
\
body {\
    position: relative !important;\
    padding: 0px !important;\
    border-width: 0px !important;\
    margin: 0px !important;\
}\
\
.ui-valid {\
    position: absolute !important;\
    visibility: hidden !important;\
    top: -90px !important;\
    left: -90px !important;\
    overflow: scroll !important;\
    width: 80px !important;\
    height: 80px !important;\
    border: 1px solid !important;\
\
    div {\
        position: absolute !important;\
        top: 0px !important;\
        height: 90px !important;\
    }\
}\
\
.ui-modal {\
    overflow: hidden !important;\
}\
\
.ui-mask {\
    position: fixed !important;\
    top: 0px;\
    left: 0px;\
    .width100rate();\
    .height100rate();\
    background-color: #000000 !important;\
}\
');
//{/if}//
/*
ECUI核心的事件控制器与状态控制器，用于屏弊不同浏览器交互处理的不同，保存控制的状态及进行事件的分发处理。ECUI核心的事件分发实现了浏览器原生的防止事件重入功能，因此请使用 dispatchEvent 方法来请求事件。
*/
(function () {
//{if 0}//
    var callStack = [],
        SUPER_KW = /[^\w$]_super\s*\.\s*([\w$]+)\s*\(/g,
        CLASS_KW = /[^\w$]_class\s*\.\s*([\w$]+)\s*\(/g;

    function getMethodNames(fn, kw) {
        var ret = [];
        fn.toString().replace(kw, function (match, name) {
            ret.push(name);
        });
        return ret;
    }

    function setObject(thisArg, scope) {
        if (thisArg && thisArg.__ECUI__scope !== scope) {
            var target = thisArg[thisArg.__ECUI__scope];
            for (var key in target) {
                if (target.hasOwnProperty(key) && !key.startsWith('__ECUI__')) {
                    delete target[key];
                }
            }
            for (key in thisArg) {
                if (thisArg.hasOwnProperty(key) && !key.startsWith('__ECUI__')) {
                    target[key] = thisArg[key];
                    delete thisArg[key];
                }
            }
            Object.assign(thisArg, thisArg[scope]);
            thisArg.__ECUI__scope = scope;
        }
    }

    function popCaller() {
        var caller = callStack.pop();
        if (!callStack.length || callStack[callStack.length - 1][0] !== caller[0]) {
            setObject(caller[0], '__ECUI__');
        }
        if (callStack.length) {
            setObject(callStack[callStack.length - 1][0], callStack[callStack.length - 1][1]);
        }
    }

    function pushCaller(thisArg, scope) {
        if (callStack.length && callStack[callStack.length - 1][0] === thisArg) {
            callStack.push([thisArg, scope]);
            setObject(thisArg, scope);
        } else {
            // 对象切换时当前对象要设置成this状态
            if (callStack.length) {
                setObject(callStack[callStack.length - 1][0], '__ECUI__');
            }
            callStack.push([thisArg, scope]);
            if (thisArg) {
                setObject(thisArg, scope);
            }
        }
    }

    var core = ecui,
        dom = core.dom,
        effect = core.effect,
        ext = core.ext,
        util = core.util,
        ui = core.ui,

        JAVASCRIPT = 'javascript',
        fontSizeCache = core.fontSizeCache,
        isMac = /Macintosh/i.test(navigator.userAgent),
        isToucher = document.ontouchstart !== undefined,
        isPointer = !!window.PointerEvent, // 使用pointer事件序列，请一定在需要滚动的元素上加上touch-action:none
        iosVersion = /(iPhone|iPad).*?OS (\d+(_\d+)?)/i.test(navigator.userAgent) ? +(RegExp.$2.replace('_', '.')) : undefined,
        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined,
        chromeVersion = /Chrome\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined,
        safariVersion = !/(chrome|crios|ucbrowser)/i.test(navigator.userAgent) && /(\d+\.\d)(\.\d)?\s+.*safari/i.test(navigator.userAgent) ? +RegExp.$1 : undefined;
//{/if}//
    var HIGH_SPEED = 100,         // 对高速的定义
        scrollHandler,            // DOM滚动事件
        blurHandler = util.blank, // 失去焦点
        dragStopHandler = util.blank, // ios设备上移出webview区域停止事件
        touchElement,              // touch点击的目标，用于防止ios下的点击穿透处理
        isTouchMoved,
        isRepainting,
        ecuiOptions,              // ECUI 参数

        viewWidth,                // 浏览器宽高属性
        viewHeight,               // 浏览器宽高属性
        scrollNarrow,             // 浏览器滚动条相对窄的一边的长度

        initRecursion = 0,        // init 操作的递归次数
        readyList = [],
        orientationHandle,

        maskElements = [],        // 遮罩层组
        unmasks = [],             // 用于取消遮罩层的函数列表

        tracks = {},              // 鼠标/触摸事件对象跟踪
        trackId,                  // 当前正在跟踪的id
        pointers = [],            // 当前所有正在监听的pointer对象
        lastClick = {},           // 最后一次点击的信息
        gestureListeners = [],    // 手势监听
        gestureStack = [],        // 手势堆栈，受mask影响进行分层监听
        forcedControl = null,     // 当前被重压的控件
        enableGesture = true,     // 手势识别是否有效，在touchend/pointer后会恢复

        pauseCount = 0,           // 暂停的次数
        keys = {codes: []},       // 全部的按键状态
        keyCode = 0,              // 当前键盘按下的键值，解决keypress与keyup中得不到特殊按键的keyCode的问题
        lastSpace = {},           // 最后一次点击空格的相关信息，用于处理苹果空格双击输入问题
        lastClientX,
        lastClientY,
        inertiaHandles = {},      // 惯性处理句柄

        allControls = [],         // 全部生成的控件，供释放控件占用的内存使用
        independentControls = [], // 独立的控件，即使用create($create)方法创建的控件
        namedControls = {},       // 所有被命名的控件的集合
        singletons = [],          // 所有被初始化成单例控件的集合
        uniqueIndex = 0,          // 控件的唯一序号
        delegateControls = [],    // 等待关联的控件集合

        defineElements = {},

        activedControl,           // 当前环境下被激活的控件，即鼠标左键按下时对应的控件，直到左键松开后失去激活状态
        hoveredControl = null,    // 当前环境下鼠标悬停的控件
        focusedControl = null,    // 当前环境下拥有焦点的控件

        eventListeners = {},      // 控件事件监听描述对象
        eventStack = {},          // 事件调用堆栈记录，防止事件重入

        envStack = [],            // 高优先级事件调用时，保存上一个事件环境的栈
        events = {
            // 右键弹出菜单事件
            contextmenu: function (event) {
                event = core.wrapEvent(event);
                bubble(event.getControl(), 'contextmenu', event);
            },
            // 鼠标点击时控件如果被屏弊需要取消点击事件的默认处理，此时链接将不能提交
            click: function (event) {
                if (activedControl !== undefined) {
                    // 移动端长按导致触发了touchstart但没有触发touchend，需要清除activedControl
                    bubble(activedControl, 'deactivate', core.wrapEvent(event));
                    activedControl = undefined;
                }

                if (touchElement && event.target !== touchElement) {
                    // 由label产生的点击事件转移
                    for (var el = touchElement; el; el = el.parentElement) {
                        if (el.tagName === 'LABEL') {
                            if (el.contains(event.target) || el.getAttribute('for') === event.target.id) {
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
                    currEnv.mousedown(event);
                    currEnv.mouseup(event);
                }
            },
            blur: function () {
                // 窗体失去焦点时复位状态信息，IE8以下版本需要区分是进入了下部的input还是真的失去了焦点
                if (ieVersion < 9) {
                    blurHandler = util.timer(function () {
                        keys.codes = [];
                    }, 100);
                } else {
                    keys.codes = [];
                }
            },
            focusin: function (event) {
                var el = core.wrapEvent(event).target,
                    control = core.findControl(el);

                if (control) {
                    if (control.isInited()) {
                        if (control.isDisabled() || !control.isCapturable()) {
                            // 上级控件处于失效状态，将焦点移除
                            try {
                                el.blur();
                            } catch (ignore) {
                            }
                        } else {
                            // 通过键盘操作改变了输入框的光标，设置输入框的上级控件为获得焦点状态
                            core.setFocused(control);
                        }
                    }
                } else if (focusedControl) {
                    // 通过键盘操作改变了输入框光标，同步清除当前拥有焦点的控件状态
                    focusedControl.blur();
                }
                // 如果是IE进入了下部的input，阻止窗体触发blur事件
                blurHandler();
            },
            selectstart: function (event) {
                // IE下取消对文字的选择不能仅通过阻止 mousedown 事件的默认行为实现，firefox下如果不屏弊选择，图片/链接会直接打开新标签页
                event = core.wrapEvent(event);
                onselectstart(event.getTarget(), event);
            },
            dragstart: function (event) {
                var control = core.findControl(event.target);
                if (control.$dataTransfer) {
                    control.$dataTransfer(event.dataTransfer, event.target);
                }
            },
            drop: function (event) {
                event = core.wrapEvent(event);
                for (var el = event.target;; el = el.parentElement) {
                    // 在编辑模式下，DOM 链条会中断
                    if (!el) {
                        event.target = document.activeElement;
                        break;
                    }
                    if (el.tagName === 'HTML') {
                        break;
                    }
                }
                bubble(core.findControl(event.target), 'drop', event);
            },
            keydown: function (event) {
                keys.ctrl = event.ctrlKey;
                keys.alt = event.altKey;
                keys.shift = event.shiftKey;
                keys.meta = event.metaKey;
                event = core.wrapEvent(event);
                keyCode = event.which;
                keys.codes.push(keyCode);
                if (!event.ctrlKey || event.which !== 82) {
                    // 页面刷新不允许阻止
                    bubble(focusedControl, 'keydown', event);
                    if (event.which === 32 && event.returnValue === false) {
                        // 苹果下快速双击空格的特殊处理需要恢复成正常处理两次空格输入
                        if (dom.isEditable(document.activeElement)) {
                            if (Date.now() - lastSpace.time < 400) {
                                document.activeElement.value = lastSpace.value;
                                dom.setSelection(document.activeElement, lastSpace.start, lastSpace.end);
                                lastSpace.time = 0;
                            } else {
                                lastSpace.value = document.activeElement.value;
                                lastSpace.time = Date.now();
                                lastSpace.start = dom.getSelectionStart(document.activeElement);
                                lastSpace.end = dom.getSelectionEnd(document.activeElement);
                            }
                        }
                    }
                }
            },
            keypress: function (event) {
                event = core.wrapEvent(event);
                bubble(focusedControl, 'keypress', event);
            },
            keyup: function (event) {
                keys.ctrl = event.ctrlKey;
                keys.alt = event.altKey;
                keys.shift = event.shiftKey;
                keys.meta = event.metaKey;
                event = core.wrapEvent(event);
                bubble(focusedControl, 'keyup', event);
                util.remove(keys.codes, event.which);
                if (keyCode === event.which) {
                    // 一次多个键被按下，只有最后一个被按下的键松开时取消键值码
                    keyCode = 0;
                }
            }
        },
        pointerEvents = {
            // pad pro/surface pro等设备上的事件处理
            pointerdown: function (event) {
                var pointerType = event.pointerType,
                    pointerId = event.pointerId;

                if (pointerType !== 'mouse' || event.which === 1) {
                    event = core.wrapEvent(event);

                    var track = event.track = {
                        identifier: pointerId,
                        type: pointerType,
                        target: event.target,
                        speedX: 0,
                        speedY: 0,
                        startX: event.clientX,
                        startY: event.clientY,
                        startTime: new Date()
                    };
                    track.lastX = track.startX;
                    track.lastY = track.startY;
                    track.lastTime = track.startTime;

                    pointers.push(track);

                    if (pointerType === 'mouse') {
                        tracks.mouse = track;
                    } else {
                        tracks[pointerId] = track;
                    }

                    // 跟踪第一个事件用于标准处理，其它事件用于手势识别
                    if (pointers.length === 1) {
                        lastClientX = event.clientX;
                        lastClientY = event.clientY;

                        if (pointerType === 'mouse') {
                            startSimulationScroll(event);
                            isTouchMoved = undefined;
                        } else {
                            trackId = pointerId;
                            isTouchMoved = false;
                            currEnv.mouseover(event);
                        }
                        currEnv.mousedown(event);
                        if (trackId) {
                            onpressure(event, event.getNative().pressure >= 0.4);
                        }
                    }
                }
            },

            pointermove: function (event) {
                var pointerId = event.pointerId,
                    pointerType = event.pointerType,
                    track = tracks[pointerType] || tracks[pointerId];

                event = core.wrapEvent(event);
                if (track) {
                    // 鼠标没down的时候没有track
                    calcSpeed(track, event);
                } else {
                    track = {};
                }

                if ((pointerType === 'mouse' && (!pointers.length || pointers[0] === track)) || (pointerId === trackId)) {
                    // Pointer设备上纯点击也可能会触发move
                    if ((Math.sqrt(track.speedX * track.speedX + track.speedY * track.speedY) > HIGH_SPEED) && isTouchMoved === false) {
                        isTouchMoved = true;
                    }

                    event.track = track;
                    currEnv.mousemove(event);
                    if (pointerId === trackId) {
                        onpressure(event, event.getNative().pressure >= 0.4);
                    }
                    if (event.pointerType !== 'mouse') {
                        ongesture(pointers, [tracks[pointerId]], event);
                    }
                }
            },

            pointerup: function (event) {
                var pointerType = event.pointerType,
                    pointerId = event.pointerId;

                if (pointerType !== 'mouse' || event.which === 1) {
                    // 鼠标右键点击不触发事件
                    var track = tracks[pointerType] || tracks[pointerId];
                    if (track) {
                        event = core.wrapEvent(event);
                        if ((track === tracks.mouse) || (pointerId === trackId)) {
                            if (isTouchMoved) {
                                // 产生了滚屏操作，不响应ECUI事件
                                bubble(activedControl, 'deactivate');
                                activedControl = undefined;
                            }
                            event.track = track;
                            currEnv.mouseup(event);
                            enableGesture = true;
                        }

                        if (track === tracks.mouse) {
                            stopSimulationScroll(event);
                            delete tracks.mouse;
                        } else {
                            bubble(hoveredControl, 'mouseout', event, hoveredControl = null);
                            if (event.getNative().type === 'pointerup') {
                                onpressure(event, false);
                                ongesture(pointers, [tracks[pointerId]], event);
                            }
                            trackId = undefined;
                            delete tracks[pointerId];
                        }
                    }

                    for (var i = 0; (track = pointers[i]); i++) {
                        if (track.identifier === pointerId) {
                            pointers.splice(i, 1);
                            break;
                        }
                    }
                }
            },
            pointercancel: function (event) {
                events.pointerup(event, true);
            }
        },
        toucherEvents = {
            // 触屏事件到鼠标事件的转化，与touch相关的事件由于ie浏览器会触发两轮touch与mouse的事件，所以需要屏弊一个
            touchstart: function (event) {
                // 如果在touch过程中DOM被移除，需要将事件自行冒泡到body
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

                            var track = tracks[trackId = event.touches[0].identifier],
                                item = event.touches[0];

                            event = core.wrapEvent(event);

                            event.pageX = item.pageX;
                            event.pageY = item.pageY;
                            event.clientX = item.clientX;
                            event.clientY = item.clientY;
                            event.target = item.target;

                            lastClientX = event.clientX;
                            lastClientY = event.clientY;

                            track.lastX = track.startX;
                            track.lastY = track.startY;
                            track.lastTime = track.startTime;
                            event.track = track;
                            checkActived(event);
                            currEnv.mouseover(event);
                            currEnv.mousedown(event);
                            onpressure(event, item.force === 1);
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
                            calcSpeed(track, item);

                            if (item.identifier === trackId) {
                                event.pageX = item.pageX;
                                event.pageY = item.pageY;
                                event.clientX = item.clientX;
                                event.clientY = item.clientY;

                                lastClientX = event.clientX;
                                lastClientY = event.clientY;

                                if ((Math.sqrt(track.speedX * track.speedX + track.speedY * track.speedY) > HIGH_SPEED) && isTouchMoved === false) {
                                    isTouchMoved = true;
                                }

                                event.track = track;

                                var target = event.target;
                                event.target = getElementFromEvent(event);
                                currEnv.mousemove(event);
                                event.target = target;
                                onpressure(event, item.force === 1);

                                noPrimaryMove = false;
                            }
                        });

                        ongesture(event.getNative().touches, event.getNative().changedTouches, event);

                        if (noPrimaryMove) {
                            event.preventDefault();
                        }
                    }
                );
            },

            touchend: function (event) {
                event.target.removeEventListener('touchmove', RemovedDomTouchBubble, { passive: false });
                event.target.removeEventListener('touchend', RemovedDomTouchBubble, { passive: false });

                var track = tracks[trackId],
                    noPrimaryEnd = true;

                initTouchTracks(
                    event,
                    function () {
                        event = core.wrapEvent(event);

                        // touchend的元素在changedTouches中，不在touches中
                        var changedTouches = Array.prototype.slice.call(event.getNative().changedTouches);
                        changedTouches.forEach(function (item) {
                            if (item.identifier === trackId) {
                                if (isTouchMoved) {
                                    // 产生了滚屏操作，不响应ECUI事件
                                    bubble(activedControl, 'deactivate');
                                    activedControl = undefined;
                                }

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
                                }

                                // 记录touchend时的dom元素，阻止事件穿透
                                touchElement = event.target;

                                // 点击到非INPUT区域需要失去焦点
                                if (!dom.isEditable(touchElement) && isTouchClick(track)) {
                                    document.activeElement.blur();
                                }

                                noPrimaryEnd = false;
                            }
                        });

                        ongesture(dom.toArray(event.getNative().touches).concat(changedTouches), changedTouches, event);

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
            }
        },
        mouseEvents = {
            mousedown: function (event) {
                event = core.wrapEvent(event);
                // 仅监听鼠标左键
                if (event.which === 1) {
                    startSimulationScroll(event);
                    var track = event.track = tracks.mouse = {
                        startX: event.clientX,
                        startY: event.clientY,
                        startTime: new Date()
                    };
                    track.lastX = track.startX;
                    track.lastY = track.startY;
                    track.lastTime = track.startTime;
                    checkActived(event);
                    currEnv.mousedown(event);
                }
            },

            mousemove: function (event) {
                event = core.wrapEvent(event);

                // 点击在滚动条上，不会触发mouseup事件，但会触发mousemove事件
                stopSimulationScroll(event);
                calcSpeed(tracks.mouse, event);

                event.track = tracks.mouse;
                currEnv.mousemove(event);
            },

            mouseup: function (event) {
                event = core.wrapEvent(event);
                if (event.which === 1) {
                    stopSimulationScroll(event);
                    event.track = tracks.mouse;
                    currEnv.mouseup(event);
                    delete tracks.mouse;
                }
            }
        },
        currEnv = { // 当前操作的环境
            // 鼠标左键按下需要改变框架中拥有焦点的控件
            mousedown: function (event) {
                var control = event.getControl(),
                    target = event.target;

                if (control) {
                    // IE8以下的版本，如果为控件添加激活样式，原生滚动条的操作会失效
                    // 常见的表现是需要点击两次才能进行滚动操作，而且中途不能离开控件区域
                    // 以免触发悬停状态的样式改变。
                    if (isTouchMoved === undefined) { // MouseEvent
                        // 触控设备在mouseup时获得焦点
                        if ((!scrollHandler || ieVersion >= 9) && !dom.isEditable(event.target)) {
                            // 如果点击可输入框，由可输入框的focus事件触发setFocused
                            core.setFocused(control);
                        }
                    }

                    if (!isScrollClick(event)) {
                        bubble(activedControl = control, 'activate', event);
                    }
                    bubble(control, 'mousedown', event);
                    onselectstart(control, event);
                } else {
                    if ((control = event.getTarget())) {
                        // 如果点击的是失效状态的控件，检查是否需要取消文本选择
                        onselectstart(control, event);
                        // 检查是否INPUT/SELECT/TEXTAREA/BUTTON标签，需要失去焦点，
                        // 因为ecui不能阻止mousedown focus输入框
                        if (isTouchMoved === undefined) { // MouseEvent
                            // 移动端输入框是在mouseup时失去焦点
                            if (dom.isEditable(target)) {
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

                if (hoveredControl !== event.getControl()) {
                    currEnv.mouseover(event);
                }

                if (event.getNative().type === 'touchmove' && currEnv.type !== 'drag') {
                    onbeforescroll(event);
                    onscroll(event);
                }
            },

            mouseout: util.blank,

            // 鼠标移入的处理，需要计算是不是位于当前移入的控件之外，如果是需要触发移出事件
            mouseover: function (event) {
                var control = event.getControl(),
                    parent = getCommonParent(control, hoveredControl);

                bubble(hoveredControl, 'mouseout', event, parent);
                bubble(hoveredControl = control, 'mouseover', event, parent);
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
                    for (var el = event.target; el; el = el.parentElement) {
                        // 移动端浏览器可能不触发A标签上的onclick事件，但实际上A标签已经被使用
                        if (el.tagName === 'A') {
                            var target = core.findControl(el);
                            if (target && target.isDisabled()) {
                                blockAhref(el);
                                break;
                            }
                        }
                    }

                    if (click && !dom.isEditable(event.target)) { // TouchEvent
                        // 任意父元素处于可编辑状态将不需要直接触发setFocused，而是在元素获得焦点时触发
                        core.setFocused(activedControl);
                    }

                    // 如果为 undefined 表示之前没有触发 mousedown 事件就触发了 mouseup，
                    // 这种情况出现在鼠标在浏览器外按下了 down 然后回浏览器区域 up，
                    // 或者是 ie 系列浏览器在触发 dblclick 之前会触发一次单独的 mouseup，
                    // dblclick 在 ie 下的事件触发顺序是 mousedown/mouseup/click/mouseup/dblclick
                    bubble(control, 'mouseup', event);

                    if (activedControl) {
                        // 点击事件在同时响应鼠标按下与弹起周期的控件上触发(如果之间未产生鼠标移动事件)
                        // 模拟点击事件是为了解决控件的 Element 进行了 remove/append 操作后 click 事件不触发的问题，以及移动端click延迟的问题
                        if (event.getNative().type.indexOf('cancel') < 0) {
                            commonParent = getCommonParent(control, activedControl);
                            if (isTouchMoved === undefined || click) { // MouseEvent
                                bubble(commonParent, 'click', event);
                                if (event.cancelBubble) {
                                    // 取消冒泡要阻止A标签提交
                                    for (el = control.getMain(); el; el = el.parentElement) {
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
                        for (control = event.target; control; control = control.parentElement) {
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
                currEnv.envs.forEach(function (env) {
                    if (!env.dragstart) {
                        // 部分拖拽组件同时需要处理click事件，因此只有在move的时候才会触发dragstart
                        core.dispatchEvent(env.target, 'dragstart', {track: event.track});
                        dom.addClass(document.body, 'ui-drag');
                        env.dragstart = true;
                    }
                });

                envStack[envStack.length - 1].mousemove(event);

                var view = dom.getView();
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
                    currEnv.envs.forEach(function (env) {
                        dragmove(event.track, env, event.clientX, event.clientY);
                    });
                }
                event.preventDefault();
            },

            mouseup: function (event) {
                dragStopHandler();

                disableEnv.mouseup(event);
                currEnv.envs.forEach(function (env) {
                    if (env.dragstart) {
                        // 只有触发了dragstart才会触发dragend
                        var track = Object.assign({}, event.track),
                            target = env.target,
                            uid = target.__ECUI__uid,
                            mx = event.clientX,
                            my = event.clientY,
                            start = Date.now(),
                            vx = track.speedX || 0,
                            vy = track.speedY || 0,
                            inertia = target.$draginertia ? target.$draginertia({x: vx, y: vy}) : env.decelerate ? Math.sqrt(vx * vx + vy * vy) / env.decelerate : 0,
                            dragEvent = new ECUIEvent();
                        dragEvent.track = track;

                        if (inertia) {
                            if (env.limit.stepX || env.limit.stepY) {
                                env.inertiaX = vx * inertia / 2;
                                env.inertiaY = vy * inertia / 2;
                                dragend(dragEvent, env, target);
                            } else {
                                if (env.event) {
                                    env.event.inertia = true;
                                }

                                var ax = vx / inertia,
                                    ay = vy / inertia;

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
                            }
                        } else {
                            dragend(dragEvent, env, target);
                        }
                    }
                });
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
        if (!document.body.contains(this)) {
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
            this.shiftKey = event.shiftKey;
            this.altKey = event.altKey;
            this.ctrlKey = isMac ? event.metaKey : event.ctrlKey;
            this.metaKey = isMac ? event.ctrlKey : event.metaKey;
            this.pageX = event.pageX;
            this.pageY = event.pageY;
            this.clientX = event.clientX;
            this.clientY = event.clientY;
            this.which = event.which;
            if (ieVersion <= 10) {
                outer: for (var caches = [], target = event.target, el; target && target.tagName !== 'BODY'; target = getElementFromEvent(event)) {
                    for (el = target;; el = el.parentElement) {
                        if (!el) {
                            break outer;
                        }
                        if (dom.getStyle(el, 'pointer-events') === 'none') {
                            if (el.tagName === 'TD' || el.tagName === 'TH') {
                                for (; el.tagName !== 'TABLE'; el = el.parentElement) {
                                    //empty
                                }
                            }
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
        preventDefault: function (stopNative) {
            this.returnValue = false;
            if (stopNative !== false && this._oNative) {
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
        stopPropagation: function (stopNative) {
            this.cancelBubble = true;
            if (stopNative !== false && this._oNative) {
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

        var scale = 1 - 1 / env.limit.ratio;

        if (x < env.limit.left) {
            x -= Math.round((x - env.limit.left) * scale);
        } else if (x > env.limit.right) {
            x -= Math.round((x - env.limit.right) * scale);
        }

        if (y < env.limit.top) {
            y -= Math.round((y - env.limit.top) * scale);
        } else if (y > env.limit.bottom) {
            y -= Math.round((y - env.limit.bottom) * scale);
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
            time: track.lastTime,
            x: track.lastX,
            y: track.lastY
        });
        // 计算最近100ms的平均速度
        for (var i = track.path.length, time = Date.now(); --i;) {
            if (time - track.path[i].time > 100) {
                break;
            }
        }

        var delay = time - track.path[i].time > 500,
            offsetX = event.clientX - track.path[i].x,
            offsetY = event.clientY - track.path[i].y,
            speed = 1000 / (time - track.path[i].time);

        track.path.splice(0, i);

        track.speedX = delay ? 0 : offsetX * speed;
        track.speedY = delay ? 0 : offsetY * speed;
        track.angle = calcAngle(offsetX, offsetY);
        track.lastTime = time;
        track.lastX = event.clientX;
        track.lastY = event.clientY;
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
     * @param {function} callback 回调函数
     */
    // function createInertiaHandles(target, delay, callback) {
    //     var uid = target.__ECUI__uid,
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
            control.ondispose = util.preventEvent;
            if (fn) {
                fn.call(control);
            }
        } catch (ignore) {
        }
        util.remove(singletons, control);
        if (delegateControls) {
            for (var index = delegateControls.length; index--;) {
                if (delegateControls[index].caller === control) {
                    delegateControls.splice(index, 1);
                }
            }
        }
        core.dispatchEvent(control, 'dispose');
        control.$dispose();
        core.removeControlListeners(control);
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
                            core.dispatchEvent(target, 'dragmove', env.event);
                            env.event = null;
                        }
                    });
                }
                env.event = event;
            } else {
                core.dispatchEvent(target, 'dragmove', event);
            }
        } else {
            // dragend
            if (env.event) {
                // 之前存在未完成的dragmove，先完成
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

        var uid = target.__ECUI__uid,
            range = env.limit,
            x = env.event ? env.event.x : event.track.x,
            y = env.event ? env.event.y : event.track.y,
            expectX = x + (env.inertiaX || 0),
            expectY = y + (env.inertiaY || 0);

        expectX = Math.min(range.right === undefined ? expectX : range.right, Math.max(range.left === undefined ? expectX : range.left, expectX));
        expectY = Math.min(range.bottom === undefined ? expectY : range.bottom, Math.max(range.top === undefined ? expectY : range.top, expectY));

        if (range.stepX) {
            expectX = Math.round(expectX / range.stepX) * range.stepX;
        }
        if (range.stepY) {
            expectY = Math.round(expectY / range.stepY) * range.stepY;
        }

        if (x !== expectX || y !== expectY) {
            // if (ieVersion < 9) {
            // 如果使用css动画，ios多次快速滑动会卡住
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
                env.el || target.getMain(),
                {
                    x: x,
                    y: y
                }
            );
            return;
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
        dragAnimationFrame(env, env.target, {track: track, x: result.x, y: result.y, inertia: currEnv.type !== 'drag'});

        track.x = result.x;
        track.y = result.y;
        // track.logicX = x + env.originalX - expectX;
        // track.logicY = y + env.originalY - expectY;
    }

    /**
     * 表单复位事件处理。
     * @private
     */
    function formResetHandler() {
        dom.toArray(this.elements).forEach(function (item) {
            if (item.getControl) {
                core.dispatchEvent(item.getControl(), 'reset');
            }
        });
    }

    /**
     * 表单提交事件处理。
     * @private
     *
     * @param {Event} event 事件对象
     */
    function formSubmitHandler(event) {
        event = core.wrapEvent(event);

        var elements = dom.toArray(this.elements),
            controls = [];
        elements.filter(function (item) {
            if (item.getControl) {
                core.dispatchEvent(item = item.getControl(), 'submit', event);
                if (item.isDisabled()) {
                    controls.push(item);
                }
            }
        });

        if (event.returnValue !== false) {
            ui.abstractInput.saveToDefault(elements);
            controls = controls.map(function (item) {
                var name = item.getName(),
                    handler = item.hasOwnProperty('getName') ? item.getName : undefined;
                item.getName = function () {
                    return name;
                };
                item.setName('');
                return [item, name, handler];

            });
            util.timer(function () {
                controls.forEach(function (item) {
                    if (item[2]) {
                        item[0].getName = item[2];
                    } else {
                        delete item[0].getName;
                    }
                    item[0].setName(item[1]);
                });
            });
        }
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
        if (control1 !== control2) {
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
            for (; list1[i] === list2[i]; i++) {
                //empty
            }
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

            viewWidth = document.documentElement.clientWidth;
            viewHeight = document.documentElement.clientHeight;
            if (isToucher) {
                util.adjustFontSize(Array.prototype.slice.call(document.styleSheets));
                Object.assign(events, toucherEvents);
            } else if (isPointer) {
                Object.assign(events, pointerEvents);
            } else {
                Object.assign(events, mouseEvents);
            }
            dom.addEventListeners(document, events);

            document.body.insertAdjacentHTML('beforeEnd', '<div class="ui-valid"><div></div></div>');
            // 检测Element宽度与高度的计算方式
            var el = document.body.lastChild;
            scrollNarrow = el.offsetWidth - el.clientWidth - 2;
            dom.remove(el);
            dom.addClass(document.body, scrollNarrow ? 'ui-scrollbar' : 'ui-touchpad');
            dom.addClass(document.body, isToucher ? 'ui-mobile' : 'ui-pc');
            if (ecuiOptions.load) {
                for (var text = ecuiOptions.load; /^\s*(\w+)\s*(\([^)]+\))?\s*($|,)/.test(text);) {
                    text = RegExp['$\''];
                    try {
                        core[RegExp.$1].load(RegExp.$2 ? RegExp.$2.slice(1, -1) : '');
                    } catch (ignore) {
                    }
                }
            }

            dom.addEventListener(window, 'resize', onorientationchange);
            dom.addEventListener(window, 'scroll', onscroll);
            dom.addEventListener(
                window,
                'unload',
                function () {
                    focusedControl = hoveredControl = activedControl = delegateControls = null;

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
                for (; document.body.firstChild;) {
                    el.appendChild(document.body.firstChild);
                }
                document.body.appendChild(el);

                if (iosVersion === 11.1 || iosVersion === 11.2) {
                    el = document.body.appendChild(dom.create('INPUT', {id: 'ECUI-FIXED-INPUT'}));
                    el.disabled = true;
                    el.onfocusin = el.onfocusout = function (event) {
                        if (event.type === 'focusout') {
                            this.disabled = true;
                        }
                        event.stopPropagation();
                    };
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
                target: item.target,
                speedX: 0,
                speedY: 0,
                startX: item.clientX,
                startY: item.clientY,
                startTime: Date.now()
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
            style = window.getComputedStyle(target),
            x = event.pageX - pos.left - dom.toPixel(style.borderLeftWidth) - target.clientWidth,
            y = event.pageY - pos.top - dom.toPixel(style.borderTopWidth) - target.clientHeight;

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
            if (item.isShow()) {
                core.dispatchEvent(item, 'beforescroll', event);
            }
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
            // $create的执行不能被阻止
            control.oncreate(options);
        }

        if (control.$create) {
            control.$create(options);
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
                        core.$callExtend(control, extend, options.ext[key], options);
                    }
                }
            }
        }
    }

    var endTracks = [];

    /**
     * 处理手势事件。
     * @private
     *
     * @param {Array} pointerList 指针信息列表
     * @param {ECUIEvent} event ECUI 事件对象
     */
    function ongesture(totalPointers, changedPointers, event) {
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
            if (event.getNative().type.slice(-4) !== 'move') {
                // 手指弹起
                changedPointers.forEach(function (pointer) {
                    var track = tracks[pointer.identifier];
                    if (track) {
                        track.endTime = Date.now();
                        endTracks.push(track);
                    }
                });
                var startTime = Date.now(),
                    endTime = 0,
                    distance = 100,
                    angles = [];

                if (totalPointers.length === changedPointers.length) {
                    event.count = endTracks.length;

                    endTracks.forEach(function (track) {
                        startTime = Math.min(track.startTime, startTime);
                        endTime = Math.max(track.endTime, endTime);
                        distance = Math.min(distance, Math.sqrt(Math.pow(track.clientX - track.startX, 2) + Math.pow(track.clientY - track.startY, 2)));
                        angles.push(track.angle);
                    });

                    if (distance > 30) {
                        angles.sort();
                        if (angles[angles.length - 1] - angles[0] > 180) {
                            // 可能在360度附近
                            angles = angles.map(function (angle) {
                                return angle < 180 ? angle : 180 - angle;
                            });
                            angles.sort();
                        }

                        if (angles[angles.length - 1] - angles[0] < 30 && endTime - startTime < 500) {
                            // 整体角度朝一个方向，时间较短，滑动距离也要足够大
                            var angle = util.sum(angles) / angles.length;
                            angle = angle < 0 ? angle + 360 : angle;
                            if (angle > 150 && angle < 210) {
                                callback('swipeleft');
                            } else if (angle > 330 || angle < 30) {
                                callback('swiperight');
                            } else if (angle > 60 && angle < 120) {
                                callback('swipeup');
                            } else if (angle > 240 && angle < 300) {
                                callback('swipedown');
                            } else {
                                event.angle = angle;
                                callback('swipe');
                            }
                        }
                    } else if (endTime - startTime < 300) {
                        callback('tap');
                    }

                    endTracks = [];
                }
                return;
            }

            switch (totalPointers.length) {
            case 1:
                var track = tracks[totalPointers[0].identifier];
                if (track.type !== 'mouse') {
                    event.fromX = track.lastX;
                    event.fromY = track.lastY;
                    event.toX = track.clientX;
                    event.toY = track.clientY;
                    callback('panmove');
                }
                break;
            case 2:
                var track1 = tracks[totalPointers[0].identifier],
                    track2 = tracks[totalPointers[1].identifier];
                // 两指操作的时间间隔足够小
                if (Math.abs(track2.lastTime - track1.lastTime) < 100) {
                    angle = Math.abs(track1.angle - track2.angle);
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
            // no default
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
            // event.preventDefault();
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
                onscroll(event);
            }
        }
    }

    // 屏幕旋转
    function onorientationchange() {
        if (orientationHandle) {
            orientationHandle();
        }

        orientationHandle = util.timer(
            function () {
                var width = document.documentElement.clientWidth,
                    height = document.documentElement.clientHeight;

                if (viewWidth !== width) {
                    var fontSize = dom.toPixel(dom.getStyle(document.body.parentElement, 'font-size'));
                    fontSizeCache.forEach(function (item) {
                        item[0]['font-size'] = Math.round(fontSize * item[1]) + 'px';
                    });

                    viewWidth = width;
                    viewHeight = height;

                    core.repaint();
                } else if (viewHeight !== height) {
                    if (isToucher && !iosVersion) {
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
                // } else if (event && event.type === 'orientationchange') {
                //     orientationHandle = util.timer(events.orientationchange, 100);
                }
            },
            100
        );
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
        if (isTouchMoved === undefined && !dom.isEditable(event.target)) { // MouseEvent
            for (; control; control = control.getParent()) {
                if (!control.isUserSelect()) {
                    event.preventDefault();
                    document.activeElement.blur();
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

    /**
     * 关闭指定的遮罩层。
     * @private
     */
    function unmask(el) {
        gestureListeners = gestureStack.pop();
        util.timer(dom.remove, 1000, null, el);
        el.style.display = 'none';
        if (!maskElements.length) {
            dom.removeClass(document.body, 'ui-modal');
        }
    }

    Object.assign(core, {
//{if 0}//
        /**
         * 全局代理，打包后不需要做处理。
         */
        _globalProxy: function (fn) {
            return function () {
                pushCaller();
                var ret = fn.apply(this, arguments);
                popCaller();
                return ret;
            };
        },
//{/if}//
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
         * 调用拓展控件
         * @public
         *
         * @param {ecui.ui.Control} control 控件对象
         * @param {ecui.ext} extend 拓展控件
         * @param {String} extOption 拓展控件参数
         * @param {object} options 控件参数
         */
        $callExtend: function (control, extend, extOption, options) {
            if (control && extend) {
                if (extend.constructor) {
                    extend.constructor.call(control, extOption, options);
                }
                if (extend.Events) {
                    for (var name in extend.Events) {
                        if (extend.Events.hasOwnProperty(name)) {
                            core.addEventListener(control, name, extend.Events[name]);
                        }
                    }
                }
//{if 0}//
            } else {
                console.warn('Control or extend class has not definded when calling "callExtend" function');
//{/if}//
            }
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
            if (control.contains(activedControl)) {
                bubble(activedControl, 'deactivate', null, activedControl = parent);
            }
            if (control.contains(hoveredControl)) {
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
         * @param {function} UIClass 控件的构造函数
         * @param {object} options 初始化选项(参见 ECUI 控件)
         * @return {ecui.ui.Control} ECUI 控件
         */
        $create: function (UIClass, options) {
            options = options || {};

            var el = options.main;

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
            oncreate(control, options);
            if (options.parent) {
                if (initRecursion) {
                    control.$setParent(options.parent);
                } else if (options.parent instanceof ui.Control) {
                    control.setParent(options.parent);
                } else {
                    control.appendTo(options.parent);
                }
            } else {
                control.$setParent(core.findControl(control.getMain().parentElement));
            }

            if (!core.isSingleton(control)) {
                allControls.push(control);
                independentControls.push(control);
            }

            // 处理所有的委托操作，参见 delegate 方法
            for (var index = delegateControls.length; index--;) {
                var item = delegateControls[index],
                    obj = item.delegate.call(item.caller, control);
                if (obj) {
                    item.args[0] = obj;
                    item.fn.apply(item.caller, item.args);
                    delegateControls.splice(index, 1);
                }
            }

            return control;
        },

        /**
         * 快速创建 ECUI 控件。
         * $fastCreate 方法仅供控件生成自己的部件使用，生成的控件不在控件列表中注册，不自动刷新也不能通过 query 方法查询(参见 $create 方法)。$fastCreate 方法通过分解 Element 对象的 className 属性得到样式信息，其中第一个样式为类型样式，第二个样式为基本样式。
         * @protected
         *
         * @param {function} UIClass 控件的构造函数
         * @param {HTMLElement} el 控件对应的 Element 对象
         * @param {ecui.ui.Control} parent 控件的父控件
         * @param {object} options 初始化选项(参见 ECUI 控件)
         * @return {ecui.ui.Control} ECUI 控件
         */
        $fastCreate: function (UIClass, el, parent, options) {
            options = options || {};

            delete options.main;

            var control = new UIClass(el, options);
            control.$setParent(parent);
            oncreate(control, options);
            allControls.push(control);
            control.init();

            return control;
        },

        /**
         * 添加控件的事件监听函数。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件
         * @param {string} name 事件名称
         * @param {function} func 监听函数
         */
        addEventListener: function (control, name, func) {
            control = control.__ECUI__uid;
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
         * 在元素显示时处理全部未缓存的控件。
         * @public
         */
        cacheAtShow: function () {
            independentControls.filter(function (item) {
                return item.isShow();
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
         * @param {function} UIClass 控件的构造函数
         * @param {object} options 初始化选项(参见 ECUI 控件)
         * @return {ecui.ui.Control} ECUI 控件
         */
        create: function (UIClass, options) {
            var control = core.$create(UIClass, options);
            control.cache();
            control.init();
            return control;
        },

        /**
         * 定义语义化标签的初始化方式。
         * @public
         *
         * @param {string} tagName 标签名
         * @param {Function|Object} UIClass 控件的构造函数或样式与控件构造函数的映射关系，如{'button': ecui.ui.Button}表示标签含有button样式时将初始化s
         */
        defineElement: function (tagName, UIClass) {
            defineElements[tagName.toUpperCase()] = UIClass;
        },

        /**
         * 委托框架在指定的 ECUI 控件 生成时执行某个方法。
         * 使用页面静态初始化或页面动态初始化(参见 ECUI 使用方式)方式，控件创建时，相关联控件也许还未创建。delegate 方法提供将指定的函数滞后到对应的控件创建后才调用的模式。如果 targetId 对应的控件还未创建，则调用会被搁置，直到需要的控件创建成功后，再自动执行(参见 create 方法)。
         * @public
         *
         * @param {string|function} target 被委托的 ECUI 控件 标识符（即在标签的 ecui 属性中定义的 id 值）或者是获取被委托对象的函数
         * @param {function} fn 调用的函数
         * @param {object} caller 发起委托的对象
         * @param {object} ... 调用的参数
         */
        delegate: function (target, fn, caller) {
            var obj = typeof target === 'string' ? namedControls[target] : core.query(function (item) { return target.call(caller, item, true); })[0];
            var args = Array.prototype.slice.call(arguments, 2);
            if (obj) {
                args[0] = obj;
                fn.apply(caller, args);
            } else {
                delegateControls.push({ delegate: typeof target === 'string' ? function () { return namedControls[target]; } : target, caller: caller, fn: fn, args: args });
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
            var uid = control.__ECUI__uid,
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
                if ((listeners = eventListeners[uid][name])) {
                    listeners.slice().forEach(function (item) {
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
         * @param {ecui.ui.Control|HTMLElement} owner 需要释放的控件对象或包含控件的 Element 对象
         * @param {boolean} onlyChild 是否仅包含子控件，默认也包含自身
         */
        dispose: function (owner, onlyChild) {

            // 判断一个控件是否位于一个DOM元素之下
            function contain(el, control) {
                for (; control; control = control.getParent()) {
                    if (el.contains(control.getMain())) {
                        return true;
                    }
                }
            }

            var isControl = owner instanceof ui.Control,
                namedMap = {},
                parent;

            if (isControl) {
                core.$clearState(owner);
            } else {
                parent = core.findControl(owner.parentElement);
                // 以下判断需要考虑control.getMain()物理上不属于control但逻辑上属于的情况
                if (focusedControl && contain(owner, focusedControl)) {
                    core.setFocused(parent);
                }
                if (activedControl && contain(owner, activedControl)) {
                    bubble(activedControl, 'deactivate', null, activedControl = parent);
                }
                if (hoveredControl && contain(owner, hoveredControl)) {
                    bubble(hoveredControl, 'mouseout', null, hoveredControl = parent);
                }
            }

            for (var key in namedControls) {
                if (namedControls.hasOwnProperty(key)) {
                    namedMap[namedControls[key].__ECUI__uid] = key;
                }
            }

            singletons.forEach(function (item) {
                if (isControl ? owner.contains(item) : contain(owner, item)) {
                    item.hide();
                    item.setParent();
                }
            });

            if (isControl ? core.isSingleton(owner) : owner.getControl && core.isSingleton(owner.getControl())) {
                return;
            }

            // 需要删除的控件先放入一个集合中等待遍历结束后再删除，否则控件链将产生变化
            var len = allControls.length - 1;
            allControls.slice().reverse().filter(function (item, index) {
                if (isControl ? owner.contains(item) : contain(owner, item)) {
                    if (!onlyChild || (isControl ? owner !== item : owner !== item.getMain())) {
                        util.remove(independentControls, item);
                        allControls.splice(len - index, 1);
                        if ((item = namedMap[item.__ECUI__uid])) {
                            delete namedControls[item];
                        }
                        return true;
                    }
                }
            }).forEach(function (item) {
                disposeControl(item);
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
            var uid = control.__ECUI__uid,
                force;

            if (inertiaHandles[uid]) {
                inertiaHandles[uid]();
                delete inertiaHandles[uid];
                dragAnimationFrame(currEnv, control, false);
                force = true;
            }

            if (activedControl !== undefined) {
                if (event instanceof ECUIEvent) {
                    if (currEnv.type !== 'drag') {
                        setEnv(dragEnv);
                        currEnv.envs = [];
                    }

                    // 判断鼠标没有mouseup
                    var parent = control.getMain().offsetParent || document.documentElement,
                        style = window.getComputedStyle(parent),
                        // 拖拽范围默认不超出上级元素区域
                        env = Object.assign(
                            parent.tagName === 'BODY' || parent.tagName === 'HTML' ?
                                dom.getView() :
                                {
                                    top: 0,
                                    right: parent.offsetWidth - dom.toPixel(style.borderLeftWidth) - dom.toPixel(style.borderRightWidth),
                                    bottom: parent.offsetHeight - dom.toPixel(style.borderTopWidth) - dom.toPixel(style.borderBottomWidth),
                                    left: 0
                                },
                            options
                        ),
                        x = env.x !== undefined ? env.x : control.getX(),
                        y = env.y !== undefined ? env.y : control.getY();

                    if (!env.absolute) {
                        env.right = Math.max(env.right - control.getWidth(), env.left);
                        env.bottom = Math.max(env.bottom - control.getHeight(), env.top);
                    }
                    env.originalX = x;
                    env.originalY = y;

                    env.limit = Object.assign(
                        {
                            ratio: 3,
                            left: env.left,
                            right: env.right,
                            top: env.top,
                            bottom: env.bottom
                        },
                        env.limit
                    );

                    env.left += (env.left - env.limit.left) * (env.limit.ratio - 1);
                    env.right += (env.right - env.limit.right) * (env.limit.ratio - 1);
                    env.top += (env.top - env.limit.top) * (env.limit.ratio - 1);
                    env.bottom += (env.bottom - env.limit.bottom) * (env.limit.ratio - 1);
                    env.target = control;

                    event.track.logicX = event.clientX;
                    event.track.logicY = event.clientY;
                    control.setPosition(x, y);

                    env.dragstart = force;

                    currEnv.envs.push(env);
                } else if (event && currEnv.type === 'drag') {
                    currEnv.envs.forEach(function (item) {
                        if (item.target === control) {
                            item.left -= (item.left - item.limit.left) * (item.limit.ratio - 1) / item.limit.ratio;
                            item.right -= (item.right - item.limit.right) * (item.limit.ratio - 1) / item.limit.ratio;
                            item.top -= (item.top - item.limit.top) * (item.limit.ratio - 1) / item.limit.ratio;
                            item.bottom -= (item.bottom - item.limit.bottom) * (item.limit.ratio - 1) / item.limit.ratio;
                            if (event.left) {
                                item.left += event.left;
                            }
                            if (event.right) {
                                item.right += event.right;
                            }
                            if (event.top) {
                                item.top += event.top;
                            }
                            if (event.bottom) {
                                item.bottom += event.bottom;
                            }
                            if (event.limit) {
                                if (event.limit.ratio) {
                                    item.limit.ratio = event.limit.ratio;
                                }
                                if (event.limit.left) {
                                    item.limit.left += event.limit.left;
                                }
                                if (event.limit.right) {
                                    item.limit.right += event.limit.right;
                                }
                                if (event.limit.top) {
                                    item.limit.top += event.limit.top;
                                }
                                if (event.limit.bottom) {
                                    item.limit.bottom += event.limit.bottom;
                                }
                            }
                            item.left += (item.left - item.limit.left) * (item.limit.ratio - 1);
                            item.right += (item.right - item.limit.right) * (item.limit.ratio - 1);
                            item.top += (item.top - item.limit.top) * (item.limit.ratio - 1);
                            item.bottom += (item.bottom - item.limit.bottom) * (item.limit.ratio - 1);
                        }
                    });
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
         * 从指定的 Element 对象开始，依次向它的父节点查找绑定的 ECUI 控件。
         * findControl 方法，会返回从当前 Element 对象开始，依次向它的父 Element 查找到的第一个绑定(参见 $bind 方法)的 ECUI 控件。findControl 方法一般在控件创建时使用，用于查找父控件对象。
         * @public
         *
         * @param {HTMLElement} el Element 对象
         * @return {ecui.ui.Control} ECUI 控件对象，如果不能找到，返回 null
         */
        findControl: function (el) {
            for (; el; el = el.parentElement) {
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
         * 获取全部按键信息。
         * @public
         *
         * @return {object} 按键信息对象
         */
        getKeys: function () {
            return keys;
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
            if (el.__ECUI__options) {
                options = el.__ECUI__options;
                delete el.__ECUI__options;
                return options;
            }

            attributeName = attributeName || ecuiOptions.name;

            var text = el.getAttribute(attributeName),
                options;

            if (text) {
                options = {};
                el.removeAttribute(attributeName);

                for (; /^(\s*;)?\s*(ext\-)?([\w\-]+)\s*(:\s*([^;\s]+(\s+[^;\s]+)*)?\s*)?($|;)/.test(text);) {
                    text = RegExp['$\''];

                    var info = RegExp.$4,
                        value = RegExp.$5;
                    (RegExp.$2 ? (options.ext = options.ext || {}) : options)[util.toCamelCase(RegExp.$3)] =
                        info ? value === 'true' ? true : value === 'false' ? false : value.charAt(0) === '&' ? JSON.parse(decodeURIComponent(value.slice(1))) : decodeURIComponent(value) : true;
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
         * @param {function} UIClass 控件的构造函数
         * @param {HTMLElement} el 控件对应的 Element 对象
         * @param {ecui.ui.Control} parent 控件的父控件
         * @param {object} options 初始化选项(参见 ECUI 控件)
         * @return {ecui.ui.Control} ECUI 控件
         */
        getSingleton: function (UIClass, el, parent, options) {
            for (var i = 0, item; (item = singletons[i++]);) {
                if (item.constructor === UIClass) {
                    return item;
                }
            }
            return core.create(UIClass, Object.assign({}, options, { main: typeof el === 'function' ? el() : el, parent: parent }));
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
         * @param {function} superClass 父控件类
         * @param {boolean} singleton 是否单例
         * @param {string} type 子控件的类型样式
         * @param {function} constructor 子控件的标准构造函数，如果忽略将直接调用父控件类的构造函数
         * @param {object} ... 控件扩展的方法
         * @return {function} 新控件的构造函数
         */
        inherits: function (superClass, singleton, type, constructor) {
            var index = 4,
                realSingleton = singleton,
                realType = type,
                realConstructor = constructor,
                subClass = function () {
                    var args = dom.toArray(arguments);
                    if (realSingleton) {
                        for (var i = 0, item; (item = singletons[i++]);) {
                            if (item.constructor === subClass) {
                                return item;
                            }
                        }
                    }
                    if (!this.__ECUI__uid) {
                        this.__ECUI__uid = 'ecui-' + (++uniqueIndex);
//{if 0}//
                        this.__ECUI__scope = '__ECUI__';
                        this.__ECUI__ = {};
//{/if}//
                    }
                    subClass.initialize.forEach(
                        function (imp) {
                            imp.call(this);
                        },
                        this
                    );
                    subClass.constructor.apply(this, args);
                    subClass.interfaces.forEach(
                        function (imp) {
                            if (imp.constructor) {
                                imp.constructor.apply(this, args);
                            }
                        },
                        this
                    );

                    if (realSingleton) {
                        singletons.push(this);
                    }
                };

            if (typeof realSingleton !== 'boolean') {
                index--;
                realConstructor = realType;
                realType = realSingleton;
                realSingleton = false;
            }

            if (typeof realType !== 'string') {
                index--;
                realConstructor = realType;
                realType = '';
            }

            if (typeof realConstructor !== 'function') {
                subClass.constructor = superClass;
                index--;
            } else {
//{if 0}//
                realConstructor.__ECUI__names = getMethodNames(realConstructor, SUPER_KW);
                subClass.constructor = superClass ? function () {
                    var oldSuper = window._super;
                    window._super = superClass.bind(this);
                    realConstructor.__ECUI__names.forEach(function (name) {
                        window._super[name] = superClass.prototype[name].bind(this);
                    }, this);
                    pushCaller(this, '__ECUI__');
                    realConstructor.apply(this, arguments);
                    popCaller();
                    window._super = oldSuper;
                } : realConstructor;
                subClass.constructor.toString = function () {
                    return realConstructor.toString();
                };
//{/if}//                subClass.constructor = realConstructor;
            }
            subClass.isInstance = function (control) {
                return control instanceof subClass;
            };
            subClass.interfaces = [];
            subClass.initialize = [];

            if (superClass) {
                util.inherits(subClass, superClass);
                subClass.TYPES = [];

                if (realType.charAt(0) === '*') {
                    realType = realType.substring(1);
                    superClass.TYPES.forEach(function (item) {
                        item = item.slice();
                        item[0] = realType;
                        subClass.TYPES.push(item);
                    });
                    subClass.TYPES.push([realType]);
                } else {
                    realType = realType ? [realType] : [];
                    superClass.TYPES.forEach(function (item) {
                        item = realType.concat(item);
                        subClass.TYPES.push(item);
                    });
                    subClass.TYPES.push(realType);
                }
            } else {
                // ecui.ui.Control的特殊初始化设置
                subClass.TYPES = [[]];
            }
            subClass.CLASS = subClass.TYPES[0].length ? ' ' + subClass.TYPES[0].join(' ') : '';

            for (var superMethods = [], item; (item = arguments[index++]);) {
                if (item.SUPER) {
                    superMethods.push.apply(superMethods, item.SUPER);
                }
                superMethods.push(item);
            }
            superMethods.forEach(function (methods, i) {
                if (typeof methods === 'function') {
                    if (subClass.prototype[methods.NAME]) {
                        // 重复的接口
                        return;
                    }
                    subClass.interfaces.push(methods);
                    // 对接口的处理
                    var Class = new Function();
                    if (superClass) {
                        Class.prototype = superClass.prototype;
                    }
                    subClass.prototype[methods.NAME] = Object.assign(new Class(), subClass.prototype, { constructor: methods });
                    subClass.initialize.push(methods.interceptor(subClass));
                    methods = methods.prototype;
                } else if (i) {
                    Class = new Function();
                    if (superClass) {
                        Class.prototype = superClass.prototype;
                    }
                    Class = Object.assign(new Class(), subClass.prototype);
                    methods = Object.assign({}, methods);
                    for (var key in methods) {
                        if (methods.hasOwnProperty(key) && typeof methods[key] === 'function' && (!methods[key].SUPER)) {
                            methods[key] = (function (fn) {
//{if 1}//                                return function () {//{/if}//
//{if 1}//                                    return fn.apply(this, [Class].concat(dom.toArray(arguments)));//{/if}//
//{if 1}//                                }
//{else}//
                                fn.__ECUI__names = getMethodNames(fn, CLASS_KW);
                                var func = function () {
                                    var oldClass = window._class;
                                    window._class = {};
                                    fn.__ECUI__names.forEach(function (name) {
                                        window._class[name] = Class[name].bind(this);
                                    }, this);
                                    pushCaller(this, '__ECUI__');
                                    var ret = fn.apply(this, arguments);
                                    popCaller();
                                    window._class = oldClass;
                                    return ret;
                                };
                                func.toString = function () {
                                    return fn.toString();
                                };
                                return func;
//{/if}//
                            })(methods[key]);
                        }
                    }
//{if 0}//
                } else {
                    methods = Object.assign({}, methods);
                    var proxy = function (fn) {
                        fn.__ECUI__names = getMethodNames(fn, SUPER_KW);
                        var func = function () {
                            var oldSuper = window._super;
                            if (superClass) {
                                window._super = {};
                                fn.__ECUI__names.forEach(function (name) {
                                    window._super[name] = superClass.prototype[name].bind(this);
                                }, this);
                            } else {
                                window._super = null;
                            }
                            pushCaller(this, '__ECUI__');
                            var ret = fn.apply(this, arguments);
                            popCaller();
                            window._super = oldSuper;
                            return ret;
                        };
                        func.toString = function () {
                            return fn.toString();
                        };
                        return func;
                    };
                    for (key in methods) {
                        if (methods.hasOwnProperty(key) && typeof methods[key] === 'function' && (!methods[key].SUPER)) {
                            methods[key] = proxy(methods[key]);
                        }
                    }
//{/if}//
                }
                Object.assign(subClass.prototype, methods);
            });

            // 释放闭包占用的资源
//{if 1}//            superClass = type = constructor = realConstructor = null;//{/if}//
            return subClass;
        },

        /**
         * 继承一个框架事件。
         * @public
         *
         * @param {object} prototype 新事件自定义的方法
         * @return {ECUIEvent} 框架事件类
         */
        inheritsEvent: function (prototype) {
            var clazz = new Function();
            clazz.prototype = prototype;
            util.inherits(clazz, ECUIEvent);
            return clazz;
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
                if (!document.body.contains(el)) {
                    console.warn('The element is not in the Document');
                }
//{/if}//
                var controls = [],
                    options,
                    clazz;

                if (!initRecursion) {
                    // 第一层 init 循环的时候需要关闭resize事件监听，防止反复的重入
                    dom.removeEventListener(window, 'resize', onorientationchange);
                }
                initRecursion++;

                [el].concat(dom.toArray(el.all || el.getElementsByTagName('*'))).forEach(function (item) {
                    if (item.tagName === 'FORM') {
                        if (item.getControl === undefined) {
                            dom.addEventListener(item, 'submit', formSubmitHandler);
                            dom.addEventListener(item, 'reset', formResetHandler);
                            item.getControl = null;
                        }
                    }

                    if ((clazz = defineElements[item.tagName])) {
                        // 语义化标签的初始化处理
                        if (!util.isInherits(clazz, ui.Control)) {
                            clazz = clazz(item);
                        }
                        if (clazz) {
                            options = { main: item };
                            item.getAttributeNames().forEach(function (name) {
                                options[name] = item.getAttribute(name) || undefined;
                            });
                        }
                    }
                    if (!clazz && (options = core.getOptions(item))) {
                        // 普通标签的初始化处理
                        if (item.getControl) {
                            oncreate(item.getControl(), options);
                            return;
                        }
                        options.main = item;
                        if (options.type) {
                            if (options.type.charAt(0) === '@') {
                                // 带@号表示当前控件使用父控件的同名控件初始化
                                var name = options.type.charAt(1).toUpperCase() + util.toCamelCase(options.type.slice(2));
                                for (var parent = core.findControl(item); parent; parent = parent.getParent()) {
                                    if (parent[name] && typeof parent[name] === 'function') {
                                        if (!parent.isCreated()) {
                                            item.__ECUI__options = options;
                                            return;
                                        }
                                        clazz = parent[name];
                                        options.parent = parent;
                                        break;
                                    }
                                }
                            } else if (options.type.indexOf('.') < 0) {
                                clazz = ui[options.type.charAt(0).toUpperCase() + util.toCamelCase(options.type.slice(1))];
                            } else {
                                clazz = util.parseValue(options.type, ui) || util.parseValue(options.type);
                            }
                        } else {
                            clazz = ui.Control;
                        }
                    }

                    if (options) {
//{if 0}//
                        try {
//{/if}//
                            controls.push(core.$create(clazz, options));
//{if 0}//
                        } catch (e) {
                            console.warn('The type:' + options.type + ' can\'t constructor');
                            throw e;
                        }
//{/if}//
                    }
                });

                controls.forEach(function (item) {
                    item.cache();
                });
                controls.forEach(function (item) {
                    item.init();
                });

                if (initRecursion === 1) {
                    if (readyList) {
                        readyList.forEach(function (item) {
                            item();
                        });
                        readyList = null;
                    }

                    dom.addEventListener(window, 'resize', onorientationchange);
                }

                initRecursion--;

                // 防止循环引用
                el = null;
            }
        },

        /**
         * 接口声明。
         * @public
         *
         * @param {string} name 接口名称
         * @param {Array} superClass 接口的基类的数组
         * @param {object} methods 接口的方法集合
         * @param {function} interceptor 拦截器
         * @return {Interface} 接口定义
         */
        interfaces: function (name, superClass, methods, interceptor) {
            function infProxy(fn) {
//{if 1}//                return function () {//{/if}//
//{if 1}//                    return fn.apply(dataMap[this.__ECUI__uid], arguments);//{/if}//
//{if 1}//                }
//{else}//
                fn.__ECUI__names = getMethodNames(fn, CLASS_KW);
                var func = function () {
                    var oldClass = window._class;
                    window._class = {};
                    fn.__ECUI__names.forEach(function (key) {
                        window._class[key] = this[name][key].bind(this);
                    }, this);
                    pushCaller(this, '__ECUI__' + name);
                    var ret = fn.apply(this, arguments);
                    popCaller();
                    window._class = oldClass;
                    return ret;
                };
                func.toString = function () {
                    return fn.toString();
                };
//{/if}//
                return func;
            }

            name = '$' + name;
            if (!(superClass instanceof Array)) {
                interceptor = methods;
                methods = superClass;
                superClass = null;
            }
            methods = Object.assign({}, methods);

            var inf = new Function(),
                dataMap = {};

            if (methods.constructor) {
                inf.constructor = infProxy(methods.constructor);
                delete methods.constructor;
            }
            inf.SUPER = superClass;
            inf.NAME = name;
            inf.interceptor = function (clazz) {
                var Class = new Function('c', 'this.__ECUI__this=c');
                Object.assign(Class.prototype, methods);
                Class.prototype.Class = clazz.prototype[name];
                if (interceptor) {
                    interceptor(clazz);
                }
                return function () {
                    dataMap[this.__ECUI__uid] = new Class(this);
//{if 0}//
                    this['__ECUI__' + name] = dataMap[this.__ECUI__uid];
//{/if}//
                };
            };
            inf.getData = function (control) {
                return dataMap[control.__ECUI__uid];
            };
            inf.isInstance = function (control) {
                return !!control['__ECUI__' + name];
            };
            for (var key in methods) {
                if (methods.hasOwnProperty(key)) {
                    inf.prototype[key] = infProxy(methods[key]);
                }
            }
            if (methods.$dispose) {
                var $dispose = methods.$dispose;
            }
            methods.$dispose = function () {
                var uid = this.__ECUI__uid;
                if ($dispose) {
                    $dispose.call(this.__ECUI__this);
                } else {
//{if 0}//
                    this['__ECUI__' + name].Class.$dispose.call(this);
//{/if}//                    this.Class.$dispose.call(this.__ECUI__this);
                }
                delete dataMap[uid];
            };
            return inf;
        },

        /**
         * 默认的盒子模型是否为ContentBox状态。
         * @public
         *
         * @param {HTMLElement} el DOM 对象
         * @return {boolean} 是否为CSS2.1默认的盒子模型
         */
        isContentBox: function (el) {
            return dom.getStyle(el, 'boxSizing') === 'content-box';
        },

        /**
         * 是否正在整体重绘。
         * @public
         *
         * @return {boolean} 是否正在整体重绘
         */
        isRepainting: function () {
            return isRepainting;
        },

        /**
         * 控件是否为单例。
         * @public
         *
         * @param {ecui.ui.Control} control 需要检测的控件
         * @return {boolean} 控件是否为单例
         */
        isSingleton: function (control) {
            return singletons.indexOf(control) >= 0;
        },

        /**
         * 使控件失去焦点。
         * loseFocus 方法不完全是 setFocused 方法的逆向行为。如果控件及它的子控件不处于焦点状态，执行 loseFocus 方法不会发生变化。如果控件或它的子控件处于焦点状态，执行 loseFocus 方法将使控件失去焦点状态，如果控件拥有父控件，此时父控件获得焦点状态。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件
         */
        loseFocus: function (control) {
            if (control.contains(focusedControl)) {
                core.setFocused(control.getParent());
            }
        },

        /**
         * 使用或取消一个层遮罩整个浏览器可视化区域。
         * 遮罩层的 z-index 样式默认取值为 32000，请不要将 Element 对象的 z-index 样式设置大于 32000。当框架中至少一个遮罩层工作时，body 标签将增加一个样式 ecui-mask，IE6/7 的原生 select 标签可以使用此样式进行隐藏，解决强制置顶的问题。如果不传入任何参数，将关闭最近打开的一个遮罩层，如果要关闭指定的遮罩层，请直接调用返回的函数。
         * @public
         *
         * @param {boolean|number|object} style 如果是boolean型表示是否需要显示，如果是数值表示透明度，如果是对象表示重新定义的样式，如果省略表示关闭最后一个mask
         * @param {number} zIndex 遮罩层的 zIndex 样式值，如果省略使用 32000
         * @return {function} 用于关闭当前遮罩层的函数
         */
        mask: function (style, zIndex) {
            var el = document.body;

            if (typeof style === 'boolean') {
                // 仅简单的显示或隐藏当前的屏蔽层，用于resize时的重绘
                maskElements.forEach(function (item) {
                    item.style.display = style ? '' : 'none';
                });
            } else if (style === undefined) {
                unmasks.pop();
                unmask(maskElements.pop());
            } else {
                if (!maskElements.length) {
                    dom.addClass(el, 'ui-modal');
                }

                maskElements.push(
                    el = el.appendChild(
                        dom.create(
                            {
                                className: 'ui-mask',
                                style: {
                                    zIndex: zIndex || 32000
                                }
                            }
                        )
                    )
                );
                if (typeof style === 'number') {
                    dom.setStyle(el, 'opacity', style);
                } else {
                    dom.setStyles(el, style);
                }

                /**
                 * 关闭浮层。
                 * @public
                 *
                 * @param {number|object|boolean} options 如果是数字表示个性zIndex，对象表示设置style，true表示是在 unload 中触发函数
                 */
                var fn = function (options) {
                    if (typeof options === 'number') {
                        el.style.zIndex = options;
                    } else if (typeof options === 'object') {
                        dom.setStyles(el, options);
                    } else {
                        if (!options) {
                            var index = maskElements.indexOf(el);
                            maskElements.splice(index, 1);
                            unmasks.splice(index, 1);
                            gestureStack.push(gestureListeners);
                            gestureStack.splice(index + 1, 1);
                            unmask(el);
                        }
                        el = null;
                    }
                };

                unmasks.push(fn);

                gestureStack.push(gestureListeners);
                gestureListeners = [];
                return fn;
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
         * 查询函数允许传入一段语法文本，多个限制条件使用#号分隔，如 instanceof ecui.ui.Item # getParent()===ecui.get('select')
         * @public
         *
         * @param {function|string} fn 查询函数或语法字符串
         * @param {object} thisArg fn执行过程中的this对象
         * @return {Array} 控件列表
         */
        query: function (fn, thisArg) {
            if (typeof fn === 'string') {
                fn = new Function('$', 'return $ ' + fn.split('#').join(' && $'));
            }
            return independentControls.filter(fn, thisArg);
        },

        /**
         * 框架加载完成后需要调用的函数。
         * @public
         *
         * @param {function} fn 需要调用的函数
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
            delete eventListeners[control.__ECUI__uid];
            core.removeGestureListeners(control);
        },

        /**
         * 移除控件的事件监听函数。
         * @public
         *
         * @param {ecui.ui.Control} control ECUI 控件
         * @param {string} name 事件名称
         * @param {function} func 监听函数
         */
        removeEventListener: function (control, name, func) {
            control = control.__ECUI__uid;
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
                for (var i = listeners.length; i--;) {
                    if (listeners[i][0] === control) {
                        listeners.splice(i, 1);
                    }
                }
            });
            for (var i = gestureListeners.length; i--;) {
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
            // 拖拽状态时不进行窗体大小改变
            if (currEnv.type === 'drag') {
                return;
            }

            isRepainting = true;

            // 隐藏所有遮罩层
            core.mask(false);

            // 按广度优先查找所有正在显示的控件，保证子控件一定在父控件之后
            var delayRestoreList = allControls.concat(singletons);
            for (var i = 0, list = [], o = null; o !== undefined; o = list[i++]) {
                Array.prototype.push.apply(list, delayRestoreList.filter(function (item) {
                    return item.getParent() === o && item.isShow();
                }));
            }

            delayRestoreList = [];

            list.filter(function (item) {
                // 过滤非独立控件
                return independentControls.indexOf(item) >= 0;
            }).forEach(function (item) {
                if ((o = item.$restoreStructure())) {
                    delayRestoreList.push([o, item]);
                }
            });

            if (delayRestoreList.length) {
                // 由于强制设置了100%，因此改变ie下控件的大小必须从内部向外进行
                // 为避免多次reflow，增加一次循环
                delayRestoreList.forEach(function (item) {
                    item.push(item[1].getMain().offsetWidth);
                });
                delayRestoreList.forEach(function (item) {
                    item[0](item[1], item[2]);
                });
            }

            list.forEach(function (item) {
                item.cache(true);
            });
            list.forEach(function (item) {
                item.initStructure();
            });

            core.mask(true);

            isRepainting = false;
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
                    if (target === control || !target.contains(focusedControl)) {
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
         * exit            {function} 终止全部事件操作
         * getControl      {function} 获取触发事件的 ECUI 控件 对象
         * getNative       {function} 获取原生的事件对象
         * preventDefault  {function} 阻止事件的默认处理
         * stopPropagation {function} 事件停止冒泡
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

            if (typeof event === 'string') {
                event = new ECUIEvent(event);
                event.clientX = lastClientX;
                event.clientY = lastClientY;
                return event;
            }

            var body = document.body,
                html = body.parentElement;

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
        },

        TEXTNAME: '#text'
    });

    dom.ready(function () {
        if (!pauseCount) {
            core.init();
        }
    });
//{if 0}//
    core.dispatchEvent = core._globalProxy(core.dispatchEvent);
//{/if}//
})();
