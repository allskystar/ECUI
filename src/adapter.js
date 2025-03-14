/*
ECUI框架的适配器，用于保证ECUI与第三方库的兼容性，目前ECUI自己实现了适配器中对应的接口，可以将适配器切换至其它第三方库。
*/
//{if 0}//
(function () {
    var patch = window.ecui;
//{/if}//
    var //{if 1}//undefined,//{/if}//
        //{if 1}//JAVASCRIPT = 'javascript',//{/if}//
        fontSizeCache = [],
        //{if 1}//isMac = /Macintosh/i.test(navigator.userAgent),//{/if}//
        isToucher = document.ontouchstart !== undefined,
        //{if 1}//isPointer = !!window.PointerEvent, // 使用pointer事件序列，请一定在需要滚动的元素上加上touch-action:none//{/if}//
        isWebkit = /webkit/i.test(navigator.userAgent),
        iosVersion = /(iPhone|iPad).*?OS (\d+(_\d+)?)/i.test(navigator.userAgent) ? +RegExp.$2.replace('_', '.') : undefined,
        isUCBrowser = /ucbrowser/i.test(navigator.userAgent),
        chromeVersion = /(Chrome|CriOS)\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$2 : undefined,
        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined,
        firefoxVersion = /firefox\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined,
        operaVersion = /opera\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined,
        safariVersion = !chromeVersion && !isUCBrowser && /(\d+\.\d)(\.\d)?\s+.*safari/i.test(navigator.userAgent) ? +RegExp.$1 : undefined,
        isWebview = iosVersion && !chromeVersion && !isUCBrowser ? !/\)\s*Version\//.test(navigator.userAgent) : !safariVersion && /\)\s*Version\//.test(navigator.userAgent);

    ecui = {
//{if 0}//
        fontSizeCache: fontSizeCache,
//{/if}//
        /**
         * 返回指定标识符的 DOM 对象。
         * @public
         *
         * @param {string} id DOM 对象标识
         * @return {HTMLElement} DOM 对象
         */
        $: function (id) {
            return document.getElementById(id);
        },

        webkit: isWebkit,
        chrome: chromeVersion,
        ie: ieVersion,
        firefox: firefoxVersion,
        opera: operaVersion,
        safari: safariVersion,
        inapp: isWebview,

        dom: {
            /**
             * 为 DOM 对象添加新的样式。
             * @public
             *
             * @param {HTMLElement} elem DOM 对象
             * @param {string} className 样式名，可以是多个，中间使用空格分隔
             */
            addClass: function (elem, className) {
                className = className.trim();
                if (className) {
                    // classList.add 添加空串会报错
                    elem.classList.add.apply(elem.classList, className.split(/\s+/));
                }
            },

            /**
             * 挂载事件。
             * @public
             *
             * @param {object} obj 响应事件的对象，大多数情况下就是 DOM 对象
             * @param {string} type 事件类型
             * @param {function} fn 事件处理函数
             */
            addEventListener: function (obj, type, fn) {
                obj.addEventListener(type, fn, { passive: false });
            },

            /**
             * 批量挂载事件。
             * @public
             *
             * @param {object} obj 响应事件的对象，大多数情况下就是 DOM 对象
             * @param {object} events 事件类型与处理函数的映射对象
             */
            addEventListeners: function (obj, events) {
                for (var key in events) {
                    if (events.hasOwnProperty(key)) {
                        dom.addEventListener(obj, key, events[key]);
                    }
                }
            },

            /**
             * 获取所有父 DOM 对象的子 DOM 对象数组。
             * @public
             *
             * @param {HTMLElement} elem 父 DOM 对象
             * @return {Array} 子 DOM 对象集合
             */
            children: function (elem) {
                return dom.toArray(elem.children);
            },

            /**
             * 创建 DOM 对象。
             * @public
             *
             * @param {string} tagName 标签名称，默认创建一个空的 <div> 对象
             * @param {object} options 标签初始值参数
             * @return {HTMLElement} 创建的 DOM 对象
             */
            create: function (tagName, options) {
                if (!tagName) {
                    tagName = 'DIV';
                } else if (typeof tagName === 'object') {
                    options = tagName;
                    tagName = 'DIV';
                }
                return Object.assign(document.createElement(tagName), options);
            },

            /**
             * 创建 Css 对象。
             * @public
             *
             * @param {string} cssText css文本
             * @return {HTMLStyleElement} 创建的 <style> 标签对象，如果需要去除这个样式，对 style 对象执行 dom.remove 即可
             */
            createStyleSheet: function (cssText) {
                var elem = document.head.appendChild(dom.create('STYLE', { type: 'text/css', innerHTML: cssText }));
                util.adjustFontSize([document.styleSheets[document.styleSheets.length - 1]]);
                return elem;
            },

            /**
             * 获取 DOM 对象的页面位置。
             * @public
             *
             * @param {HTMLElement} elem DOM 对象
             * @return {object} 位置信息。{left: X轴坐标, top: Y轴坐标}
             */
            getPosition: function (elem) {
                var body = document.body,
                    html = body.parentElement,
                    bound = elem.getBoundingClientRect();

                return {
                    top: html.scrollTop + body.scrollTop - html.clientTop + Math.round(bound.top),
                    left: html.scrollLeft + body.scrollLeft - html.clientLeft + Math.round(bound.left)
                };
            },

            /**
             * 获取当前当前选区的结束位置。
             * @public
             *
             * @param {HTMLElement} elem DOM 对象
             * @return {number} 输入框当前选区的结束位置
             */
            getSelectionEnd: function (elem) {
                var type = elem.type,
                    ret;

                if (typeof elem.selectionEnd === 'number') {
                    return elem.selectionEnd;
                }
                elem.type = 'text';
                ret = elem.selectionEnd;
                elem.type = type;
                return ret;
            },

            /**
             * 获取当前当前选区的开始位置。
             * @public
             *
             * @param {HTMLElement} elem DOM 对象
             * @return {number} 输入框当前选区的开始位置
             */
            getSelectionStart: function (elem) {
                var type = elem.type,
                    ret;

                if (typeof elem.selectionStart === 'number') {
                    return elem.selectionStart;
                }
                elem.type = 'text';
                ret = elem.selectionStart;
                elem.type = type;
                return ret;
            },

            /**
             * 获取 DOM 对象的 CssStyle 对象或者是指定的样式值。
             * getStyle 方法如果不指定样式名称，将返回 DOM 对象的当前 CssStyle 对象。通过与 dom.setStyle 配合，允许设置自定义样式。
             * @public
             *
             * @param {HTMLElement|CSSStyle} elem DOM 对象或样式对象
             * @param {string|object} name 样式名称或样式的读写对象
             * @return {object} CssStyle 样式值
             */
            getStyle: function (elem, name) {
                var style = elem instanceof HTMLElement ? window.getComputedStyle(elem, null) : elem,
                    styleName = util.toCamelCase(name),
                    fixerName = styleName.charAt(0).toUpperCase() + styleName.substring(1),
                    value = style[styleName] || style['webkit' + fixerName] || style['moz' + fixerName] || style['ms' + fixerName];

                if (value !== undefined) {
                    return value;
                }

                name = util.toStyleCase(name);
                return (ieVersion < 9 ?
                    // 获取自定义样式。标签自身的 content 样式没有意义，所以可以用于自定义样式的扩展。在 IE 9 以下浏览器中，使用 filter 自定义样式。
                    new RegExp('(^|\\s+)' + name + '\\s*\\(([^;]+)\\)(;|$)').test(style.filter) :
                    new RegExp('("|\\s+)' + name + '\\s*:([^;]+)(;|")').test(style.content)
                ) ? (RegExp.$2 || '').trim() : '';
            },

            /**
             * 获取浏览器可视区域的相关信息。
             * getView 方法将返回浏览器可视区域的信息。属性如下：
             * top        {number} 可视区域最小X轴坐标
             * right      {number} 可视区域最大Y轴坐标
             * bottom     {number} 可视区域最大X轴坐标
             * left       {number} 可视区域最小Y轴坐标
             * width      {number} 可视区域的宽度
             * height     {number} 可视区域的高度
             * pageWidth  {number} 页面的宽度
             * pageHeight {number} 页面的高度
             * @public
             *
             * @return {object} 浏览器可视区域信息
             */
            getView: function () {
                var body = document.body,
                    html = body.parentElement,
                    scrollTop = html.scrollTop + body.scrollTop,
                    scrollLeft = html.scrollLeft + body.scrollLeft,
                    clientWidth = html.clientWidth,
                    clientHeight = html.clientHeight;

                return {
                    top: scrollTop,
                    right: scrollLeft + clientWidth,
                    bottom: scrollTop + clientHeight,
                    left: scrollLeft,
                    width: clientWidth,
                    height: clientHeight,
                    pageWidth: Math.max(html.scrollWidth, body.scrollWidth, clientWidth),
                    pageHeight: Math.max(html.scrollHeight, body.scrollHeight, clientHeight)
                };
            },

            /**
             * 图片加载回调定义。
             * @public
             *
             * @param {HTMLImageElement} img <img> 对象
             * @param {function} onsuccess 加载成功后的回调函数
             * @param {function} onerror 加载失败后的回调函数
             */
            imgLoad: function (img, onsuccess, onerror) {
                if (img.width) {
                    onsuccess({target: img});
                } else {
                    var events = {
                        load: function (event) {
                            onsuccess(event);
                            dom.removeEventListeners(event.target, events);
                        },
                        error: function (event) {
                            if (onerror) {
                                onerror(event);
                            }
                            dom.removeEventListeners(event.target, events);
                        }
                    };
                    dom.addEventListeners(img, events);
                    img = null;
                }
            },

            /**
             * 将 DOM 对象插入指定的 DOM 对象之后。
             * 如果指定的 DOM 对象没有父 DOM 对象，相当于 dom.remove 操作。
             * @public
             *
             * @param {HTMLElement} elem 需要插入的 DOM 对象
             * @param {HTMLElement} target 目标 DOM 对象
             * @return {HTMLElement} 需要插入的 DOM 对象
             */
            insertAfter: function (elem, target) {
                var parent = target.parentElement;
                return parent ? parent.insertBefore(elem, target.nextSibling) : dom.remove(elem);
            },

            /**
             * 将 DOM 对象插入指定的 DOM 对象之前。
             * 如果指定的 DOM 对象没有父 DOM 对象，相当于 dom.remove 操作。
             * @public
             *
             * @param {HTMLElement} elem 需要插入的 DOM 对象
             * @param {HTMLElement} target 目标 DOM 对象
             * @return {HTMLElement} 需要插入的 DOM 对象
             */
            insertBefore: function (elem, target) {
                var parent = target.parentElement;
                return parent ? parent.insertBefore(elem, target) : dom.remove(elem);
            },

            /**
             * 判断目标元素是不是一个可输入或者可获得焦点的元素。
             * @public
             *
             * @param {HTMLElement} target 用于判断的元素对象
             * @return {boolean} true / false
             */
            isEditable: function (target) {
                if ((target.tagName === 'INPUT' && target.type !== 'radio' && target.type !== 'checkbox') || target.tagName === 'TEXTAREA') {
                    return true;
                }
                for (; target; target = target.parentElement) {
                    if (target.getAttribute && target.getAttribute('contenteditable')) {
                        return true;
                    }
                }
                return false;
            },

            /**
             * 设置页面加载完毕后自动执行的方法。
             * @public
             *
             * @param {function} func 需要自动执行的方法
             */
            ready: (function () {
                function loadedHandler() {
                    if (!hasReady) {
                        if (patch) {
                            patch();
                            patch = undefined;
                        }

                        // 在处理的过程中，可能又有新的dom.ready函数被添加，需要添加到最后而不是直接执行
                        for (var i = 0, func; (func = list[i++]);) {
                            func();
                        }
                        list = [];
                        hasReady = true;
                    }
                }

                var hasReady = false,
                    list = [];

                if (!operaVersion) {
                    document.addEventListener('DOMContentLoaded', loadedHandler);
                }
                window.addEventListener('load', loadedHandler);

                return function (func) {
                    list.push(func);
                    if (hasReady) {
                        // 在一次处理的过程中防止重入
                        hasReady = false;
                        loadedHandler();
                    }
                };
            })(),

            /**
             * 从父 DOM 对象中移除 DOM 对象，参见 dom.parent。
             * @public
             *
             * @param {HTMLElement} elem DOM 对象
             * @return {HTMLElement} 被移除的 DOM 对象
             */
            remove: function (elem) {
                var parent = elem.parentElement;
                if (parent) {
                    parent.removeChild(elem);
                }
                return elem;
            },

            /**
             * 删除 DOM 对象中的样式。
             * @public
             *
             * @param {HTMLElement} elem DOM 对象
             * @param {string} className 样式名，可以是多个，中间用空白符分隔
             */
            removeClass: function (elem, className) {
                className = className.trim();
                if (className) {
                    elem.classList.remove.apply(elem.classList, className.split(/\s+/));
                }
            },

            /**
             * 卸载事件。
             * @public
             *
             * @param {object} obj 响应事件的对象
             * @param {string} type 事件类型
             * @param {function} fn 事件处理函数
             */
            removeEventListener: function (obj, type, fn) {
                obj.removeEventListener(type, fn, { passive: false });
            },

            /**
             * 批量卸载事件。
             * @public
             *
             * @param {object} obj 响应事件的对象，大多数情况下就是 DOM 对象
             * @param {object} events 事件类型与处理函数的映射对象
             * @param {object} options 事件监听参数
             */
            removeEventListeners: function (obj, events, options) {
                for (var key in events) {
                    if (events.hasOwnProperty(key)) {
                        dom.removeEventListener(obj, key, events[key], options);
                    }
                }
            },

            /**
             * 如果元素不在可视区域，将元素滚动到可视区域。
             * @public
             *
             * @param {HTMLInputElement|HTMLTextAreaElement} elem 输入框对象
             * @param {boolean} isMiddle true - 默认值，居中显示 / false - 靠最近的可视区域显示
             */
            scrollIntoViewIfNeeded: function (elem, isMiddle) {
                if (elem.scrollIntoViewIfNeeded) {
                    elem.scrollIntoViewIfNeeded(isMiddle);
                } else {
                    var top = dom.getPosition(elem).top,
                        height = elem.offsetHeight,
                        view = dom.getView();

                    if (isMiddle === undefined) {
                        isMiddle = true;
                    } else if ((top >= view.top && top + height <= view.bottom) || (top < view.top && top + height > view.top) || (top + height > view.bottom && top < view.bottom)) {
                        // 部分在屏幕外或者指定非居中，靠最近的可视区域显示
                        isMiddle = false;
                    }
                    for (elem = elem.parentElement; elem !== document.body; elem = elem.parentElement) {
                        if (elem.clientHeight !== elem.scrollHeight) {
                            var clientTop = dom.getPosition(elem).top + dom.toPixel(dom.getStyle(elem, 'borderTopWidth')),
                                clientHeight = elem.clientHeight,
                                distance;

                            if (isMiddle || height > clientHeight) {
                                // 高度不够居中显示
                                distance = top + elem.scrollTop;
                                elem.scrollTop = distance - clientTop + (height - clientHeight) / 2;
                                top = distance - elem.scrollTop;
                            } else if (top < clientTop) {
                                // 高度足够靠最近的位置
                                elem.scrollTop -= clientTop - top;
                                top = clientTop;
                            } else if (top + height > clientTop + clientHeight) {
                                // 高度足够靠最近的位置
                                elem.scrollTop += top + height - clientTop - clientHeight;
                                top = clientTop + clientHeight - height;
                            }
                        }
                    }

                    top -= view.top;
                    if (isMiddle || height > view.height) {
                        // 高度不够居中显示
                        window.scrollBy(0, top + (height - view.height) / 2);
                    } else if (top < 0) {
                        // 在上部靠顶显示
                        window.scrollBy(0, top);
                    } else if (top + height > view.height) {
                        // 在下部靠底显示
                        window.scrollBy(0, top + height - view.height);
                    }
                }
            },

            /**
             * 设置输入框选中的区域，如果不指定结束的位置，将直接设置光标的位置。
             * @public
             *
             * @param {HTMLElement} elem DOM 对象
             * @param {number} startPos 选中区域开始位置索引
             * @param {number} endPos 选中区域结束位置索引，如果省略，等于开始的位置
             */
            setSelection: function (elem, startPos, endPos) {
                endPos = endPos === undefined ? startPos : Math.max(startPos, endPos);

                var type = elem.type;
                if (typeof elem.selectionStart === 'number') {
                    elem.setSelectionRange(startPos, endPos);
                } else {
                    // 部分input类型无法获取选择区域信息
                    elem.type = 'text';
                    elem.setSelectionRange(startPos, endPos);
                    elem.type = type;
                }
            },

            /**
             * 设置 DOM 对象的样式值，允许设置自定义样式。
             * @public
             *
             * @param {HTMLElement} elem DOM 对象
             * @param {string} name 样式名称
             * @param {string} value 样式值
             */
            setStyle: function (elem, name, value) {
                var style = elem.style,
                    styleName = util.toCamelCase(name),
                    fixerName = styleName.charAt(0).toUpperCase() + styleName.substring(1);

                if (style[styleName] !== undefined) {
                    style[styleName] = value;
                } else if (style['webkit' + fixerName] !== undefined) {
                    style['webkit' + fixerName] = value;
                } else if (style['moz' + fixerName] !== undefined) {
                    style['moz' + fixerName] = value;
                } else if (style['ms' + fixerName] !== undefined) {
                    style['ms' + fixerName] = value;
                } else {
                    // 设置自定义样式。标签自身的 content 样式没有意义，所以可以用于自定义样式的扩展。在 IE 9 以下浏览器中，使用 filter 自定义样式。
                    name = util.toStyleCase(name);
                    if (ieVersion < 9) {
                        fixerName = style.filter.replace(
                            new RegExp('(^|\\s+)' + name + '\\s*\\(([^;]+)\\)(;|$)'),
                            function (match, $1, $2, $3) {
                                return $1 + name + '(' + value + ')' + $3;
                            }
                        );
                        style.filter = fixerName !== style.filter ? fixerName : name + '(' + value + ');' + style.filter;
                    } else {
                        fixerName = style.content.replace(
                            new RegExp('("|\\s+)' + name + '\\s*:([^;]+)(;|$)'),
                            function (match, $1, $2, $3) {
                                return value ? $1 + name + ':' + util.encodeJS(value) + $3 : '';
                            }
                        );
                        style.content = fixerName !== style.content ? fixerName : '"' + name + ':' + util.encodeJS(value) + ';' + fixerName.substring(1);
                    }
                }
            },

            /**
             * 设置 DOM 对象的一组样式值。
             * @public
             *
             * @param {HTMLElement} elem DOM 对象
             * @param {object} styles 样式组
             */
            setStyles: function (elem, styles) {
                for (var name in styles) {
                    if (styles.hasOwnProperty(name)) {
                        dom.setStyle(elem, name, styles[name]);
                    }
                }
            },

            /**
             * 将 DOM 集合转换成数组。
             * @public
             *
             * @param {HTMLCollection} elements DOM 集合
             * @return {Array} DOM 数组
             */
            toArray: function (elements) {
                if (elements) {
                    if (elements instanceof HTMLElement) {
                        return [elements];
                    }
                    return Array.prototype.slice.call(elements);
                }
                return [];
            },

            /**
             * 将长度单位统一转换成像素单位。
             * @public
             *
             * @param {string} value 需要转换的长度单位
             * @return {number} 像素单位
             */
            toPixel: function (value) {
                if (value && value.slice(-3) === 'rem') {
                    return Math.round(core.fontSize * +value.slice(0, -3));
                }
                return parseFloat(value) || 0;
            }
        },
        effect: {
            /**
             * 三次贝塞尔曲线构造函数。
             * @public
             *
             * @param {number} x1 第一个点的x轴坐标(0-1)
             * @param {number} y1 第一个点的y轴坐标(0-1)
             * @param {number} x2 第二个点的x轴坐标(0-1)
             * @param {number} y2 第二个点的y轴坐标(0-1)
             * @return {function} 三次贝塞尔曲线函数
             */
            FN_CubicBezier: function (x1, y1, x2, y2) {
                function sampleCurveX(t) {
                    return ((ax * t + bx) * t + cx) * t;
                }

                function sampleCurveY(t) {
                    return ((ay * t + by) * t + cy) * t;
                }

                function sampleCurveDerivativeX(t) {
                    return (3 * ax * t + 2 * bx) * t + cx;
                }

                function solveCurveX(x) {
                    var epsilon = 0.00001;
                    for (var i = 0, t2 = x; i < 8; i++) {
                        var xx = sampleCurveX(t2) - x;
                        if (Math.abs(xx) < epsilon) {
                            return t2;
                        }
                        var d2 = sampleCurveDerivativeX(t2);
                        if (Math.abs(d2) < 1e-6) {
                            break;
                        }
                        t2 -= xx / d2;
                    }

                    var t0 = 0,
                        t1 = 1;

                    t2 = x;
                    while (t0 < t1) {
                        xx = sampleCurveX(t2);
                        if (Math.abs(xx - x) < epsilon) {
                            return t2;
                        }
                        if (x > xx) {
                            t0 = t2;
                        } else {
                            t1 = t2;
                        }
                        t2 = (t1 - t0) * 0.5 + t0;
                    }
                }

                var cx = 3 * x1,
                    bx = 3 * (x2 - x1) - cx,
                    ax = 1 - cx - bx,
                    cy = 3 * y1,
                    by = 3 * (y2 - y1) - cy,
                    ay = 1 - cy - by;

                return function (x) {
                    return sampleCurveY(solveCurveX(x));
                };
            },

            /**
             * 线性运动函数。
             * @public
             *
             * @param {number} x x轴坐标(0-1)
             */
            FN_Linear: function (x) {
                return x;
            },

            /**
             * 匀减速运动函数。
             * @public
             *
             * @param {number} x x轴坐标(0-1)
             */
            FN_UniformlyRetarded: function (x) {
                return 1 - Math.pow(1 - x, 2);
            },

            /**
             * 渐变处理。
             * @public
             *
             * @param {function|string} fn 处理渐变的函数或函数体，字符串描述的格式例如 this.style.left=#0->100%#，一次改变多少个，使用;号分隔
             * @param {number} duration 渐变的总时长
             * @param {object} thisArg fn 函数使用的 this 指针
             * @param {object} options 渐变的参数，一般用于描述渐变的信息
             * @param {function} transition 时间线函数
             * @return {function} 停止渐变或直接执行渐变到最后的函数，传入参数是true表示直接执行最后的渐变，否则停止渐变处理。
             */
            grade: function (fn, duration, thisArg, options, transition) {
                options = options || {};
                if (typeof fn === 'string') {
                    var elements = [],
                        css;
                    if (!(ieVersion < 9) && !options.onstep &&
                            !fn.replace(
                                /([^;]+\.style\.)[^;]+=[^;]+(;|$)/g,
                                function (item, name) {
                                    elements.push(name);
                                    return '';
                                }
                            )
                    ) {
                        css = true;
                        elements.push('');
                    }
                    fn = new Function(
                        'p',
                        '$',
                        fn.replace(
                            /(^|;)\s*([\w.]+)\s*->\s*(\w+)\s*(;|$)/g,
                            function (match, start, left, right, end) {
                                return start + left + '=#' + left + '->' + right + '#' + end;
                            }
                        ).replace(
                            /#.+?#/g,
                            function (item) {
                                item = item.slice(1, -1);

                                var list = item.split('->'),
                                    math = '',
                                    value = list[0].split(':');

                                if (value.length > 1) {
                                    math = 'Math.' + value[0];
                                    list[0] = value[1];
                                }

                                var currValue = new Function('$', 'return ' + list[0]).call(thisArg, options);
                                /-?[0-9]+(\.[0-9]+)?/.test(currValue);
                                currValue = +RegExp['$&'];

                                /-?[0-9]+(\.[0-9]+)?/.test(list[1]);
                                value = +RegExp['$&'];

                                return (RegExp.leftContext ? '"' + RegExp.leftContext.replace('"', '\\"') + '"+' : '') + math + '(' + currValue + '+(' + value + '-(' + currValue + ')' + ')*p)' + (RegExp.rightContext ? '+"' + RegExp.rightContext.replace('"', '\\"') + '"' : '');
                            }
                        )
                    );

                    if (css) {
                        fn.call(thisArg, 0, options);
                        util.timer(
                            // 延后执行，否则浏览器会进行优化合并0/1的设置
                            function () {
                                new Function('$', elements.join('transition="all ' + duration + 'ms ' + (transition || 'ease') + '";')).call(thisArg, options);
                                fn.call(thisArg, 1, options);
                            },
                            20
                        );
                        // 延后执行后浏览器还是出现了优化合并0/1的设置，所以暂时往后延迟超过一帧的时间（20ms）保证动画正常执行，问题，稍有20ms的延后
                        util.timer(
                            function () {
                                new Function('$', elements.join('transition="";')).call(thisArg, options);
                                if (options.onfinish) {
                                    options.onfinish.call(thisArg, options);
                                }
                            },
                            duration + 20
                        );
                        return;
                    }
                }

                var startTime = Date.now(),
                    stop = util.timer(
                        function () {
                            var currTime = Date.now() - startTime,
                                percent;
                            if (currTime >= duration) {
                                percent = 1;
                                stop();
                            } else {
                                percent = transition(currTime / duration);
                            }
                            // 保存引用防止调用时 thisArg / options 对象已经被释放
                            if (transition) {
                                fn.call(thisArg, percent, options);
                                if (options.onstep) {
                                    options.onstep.call(thisArg, percent, options);
                                }
                                if (percent >= 1) {
                                    if (options.onfinish) {
                                        options.onfinish.call(thisArg, options);
                                    }
                                    fn = thisArg = options = transition = null;
                                }
                            }
                        },
                        -1
                    );

                if (typeof transition !== 'function') {
                    transition = effect.FN_CubicBezier.apply(null, __ECUI__CubicBezier[transition || 'ease'] || transition);
                }

                return function (toFinish) {
                    if (fn) {
                        stop();
                        if (toFinish) {
                            fn.call(thisArg, 1, options);
                            if (options.onstep) {
                                options.onstep.call(thisArg, 1, options);
                            }
                            if (options.onfinish) {
                                options.onfinish.call(thisArg, options);
                            }
                        }
                    }
                    util.timer(function () {
                        fn = thisArg = options = transition = null;
                    });
                };
            }
        },
        ext: {},
        io: {
            /**
             * 发送一个ajax请求。
             * options 对象支持的属性如下：
             * method    {string}   请求类型，默认为GET
             * async     {boolean}  是否异步请求，默认为true(异步)
             * data      {string}   需要发送的数据，主要用于POST
             * headers   {object}   要设置的http request header
             * timeout   {number}   超时时间
             * cache     {boolean}  是否需要缓存，默认为false(缓存)
             * onupload  {function} 如果xhr支持upload.onprogress，上传过程中触发
             * onsuccess {function} 请求成功时触发
             * onerror   {function} 请求发生错误时触发
             * @public
             *
             * @param {string} url 发送请求的url
             * @param {object} options 选项
             */
            ajax: function (url, options) {
                function stateChangeHandler() {
                    if (xhr.readyState === 4) {
                        try {
                            var status = xhr.status;
                        } catch (ignore) {
                            // 在请求时，如果网络中断，Firefox会无法取得status
                        }

                        // IE error sometimes returns 1223 when it
                        // should be 204, so treat it as success
                        if ((status >= 200 && status < 300) || status === 304 || status === 1223) {
                            if (options.onsuccess) {
                                if (options.responseType && (options.responseType === 'blob' || options.responseType === 'arraybuffer')) {
                                    options.onsuccess(xhr.response, xhr);
                                } else {
                                    options.onsuccess(xhr.responseText, xhr);
                                }
                            }
                        } else {
                            onerror(xhr);
                        }

                        /*
                         * NOTE: Testing discovered that for some bizarre reason, on Mozilla, the
                         * JavaScript <code>XmlHttpRequest.onreadystatechange</code> handler
                         * function maybe still be called after it is deleted. The theory is that the
                         * callback is cached somewhere. Setting it to null or an empty function does
                         * seem to work properly, though.
                         *
                         * On IE, there are two problems: Setting onreadystatechange to null (as
                         * opposed to an empty function) sometimes throws an exception. With
                         * particular (rare) versions of jscript.dll, setting onreadystatechange from
                         * within onreadystatechange causes a crash. Setting it from within a timeout
                         * fixes this bug (see issue 1610).
                         *
                         * End result: *always* set onreadystatechange to an empty function (never to
                         * null). Never set onreadystatechange from within onreadystatechange (always
                         * in a setTimeout()).
                         */
                        util.timer(
                            function () {
                                xhr.onreadystatechange = util.blank;
                                xhr = null;
                            }
                        );

                        if (stop) {
                            stop();
                        }
                    }
                }

                options = options || {};

                var data = options.data || '',
                    async = options.async !== false,
                    method = (options.method || 'GET').toUpperCase(),
                    headers = options.headers || {},
                    onerror = options.onerror || util.blank,
                    // 基本的逻辑来自lili同学提供的patch
                    stop,
                    xhr;

                try {
                    xhr = new XMLHttpRequest();

                    if (options.onupload && xhr.upload) {
                        xhr.upload.onprogress = options.onupload;
                    }

                    if (options.responseType) {
                        xhr.responseType = options.responseType;
                    }

                    if (method === 'GET') {
                        if (data) {
                            url += (url.indexOf('?') >= 0 ? '&' : '?') + data;
                            data = null;
                        }
                        if (!options.cache) {
                            url += (url.indexOf('?') >= 0 ? '&' : '?') + 'b' + Date.now() + '=1';
                        }
                    }

                    xhr.open(method, url, async);

                    if (async) {
                        xhr.onreadystatechange = stateChangeHandler;
                    }

                    for (var key in headers) {
                        if (headers.hasOwnProperty(key)) {
                            xhr.setRequestHeader(key, headers[key]);
                        }
                    }

                    if (options.timeout) {
                        stop = util.timer(
                            function () {
                                xhr.onreadystatechange = util.blank;
                                xhr.abort();
                                onerror(xhr);
                                xhr = null;
                            },
                            options.timeout
                        );
                    }
                    xhr.send(data);

                    if (!async) {
                        stateChangeHandler();
                    }
                } catch (e) {
                    onerror(xhr);
                }
            },

            /**
             * 通过script标签加载数据。
             * options 对象支持的属性如下：
             * charset   {string}   字符集
             * timeout   {number}   超时时间
             * onsuccess {function} 加载成功时触发本函数
             * onerror   {function} 超时或无法加载文件时触发本函数
             * @public
             *
             * @param {string} url 加载数据的url
             * @param {object} options 选项
             */
            loadScript: function (url, options) {
                function removeScriptTag() {
                    if (stop) {
                        stop();
                    }
                    scr.onload = scr.onreadystatechange = scr.onerror = null;
                    if (scr && scr.parentNode) {
                        scr.parentNode.removeChild(scr);
                    }
                    scr = null;
                }

                options = options || {};

                if (!options.cache) {
                    url += (url.indexOf('?') >= 0 ? '&' : '?') + 'b' + Date.now() + '=1';
                }

                var scr = document.createElement('SCRIPT'),
                    scriptLoaded = 0,
                    stop;

                // IE和opera支持onreadystatechange
                // safari、chrome、opera支持onload
                scr.onload = scr.onreadystatechange = function () {
                    // 避免opera下的多次调用
                    if (scriptLoaded) {
                        return;
                    }

                    if (scr.readyState === undefined || scr.readyState === 'loaded' || scr.readyState === 'complete') {
                        scriptLoaded = 1;
                        try {
                            if (options.onsuccess) {
                                options.onsuccess();
                            }
                        } finally {
                            removeScriptTag();
                        }
                    }
                };

                if (options.timeout) {
                    stop = util.timer(
                        function () {
                            removeScriptTag();
                            if (options.onerror) {
                                options.onerror();
                            }
                        },
                        options.timeout
                    );
                }

                if (options.charset) {
                    scr.setAttribute('charset', options.charset);
                }
                scr.setAttribute('src', url);
                scr.onerror = options.onerror;
                document.head.appendChild(scr);
            },

            /**
             * 创建一个长连接，对于不支持websocket的浏览器，使用comet模拟实现，在url中使用|分隔websocket与comet的地址，如/ws:8080|/comet:8080。
             * options 对象支持的属性如下：
             * EOF      {string}   单个指令的结束字符
             * protocol {string}   协议
             * onerror  {function} 超时时触发本函数
             * @public
             *
             * @param {string} url 长连接的地址
             * @param {function} callback 每接受一个正确的数据报文时产生的回调函数，数据报文是一个紧凑的json字符串，使用\n分隔不同的数据报文
             * @param {object} options 参数
             * @return {object} 操作对象，使用close关闭长连接
             */
            openSocket: function (url, callback, options) {
                var recvbuf = '',
                    sendbuf = '',
                    heartInterval = util.blank,
                    EOF = options.EOF || '\n';

                function onrecieve(event) {
                    recvbuf += event.data;
                    for (;;) {
                        var index = recvbuf.indexOf(EOF);
                        if (index < 0) {
                            return;
                        }
                        callback(JSON.parse(recvbuf.slice(0, index)));
                        recvbuf = recvbuf.slice(index + EOF.length);
                    }
                }

                function ajaxErrorHandler() {
                    ajax();
                }

                function ajax() {
                    if (url[1]) {
                        io.ajax(url[1], {
                            method: 'POST',
                            data: sendbuf,
                            onsuccess: function (text) {
                                onrecieve(text);
                                ajax();
                            },
                            onerror: options.onerror || ajaxErrorHandler
                        });
                        sendbuf = '';
                    }
                }

                var socket;

                function websocket() {
                    if (socket && socket.readyState <= 1) {
                        // socket正在连接或者已经连接，直接返回
                        return;
                    }
                    socket = new WebSocket((location.protocol.startsWith('https') ? 'wss://' : 'ws://') + url[0], options.protocol);
                    recvbuf = '';
                    socket.onmessage = onrecieve;
                    socket.onerror = function () {
                        // 连接服务器失败重试，此时还没有触发心跳
                        util.timer(websocket, 1000);
                    };
                    socket.onopen = function () {
                        socket.onerror = options.onerror;
                        // 关闭之前的心跳处理
                        heartInterval();
                        heartInterval = util.timer(
                            function () {
                                if (socket.readyState === 1) {
                                    socket.send(JSON.stringify({ type: 0 }));
                                }
                            }, -15000
                        );
                        socket.onclose = function () {
                            // 连接意外关闭，重新打开连接
                            websocket();
                        };
                    };
                }

                url = url.split('|');

                if (ieVersion < 10 && url[1]) {
                    ajax();
                    return {
                        close: function () {
                            url[1] = null;
                        },

                        send: function (data) {
                            sendbuf += data;
                        }
                    };
                }

                websocket();
                return {
                    close: function () {
                        // 先停止onclose方法避免重新连接
                        socket.onclose = null;
                        socket.close();
                        // 连接被彻底关闭停止心跳
                        heartInterval();
                    },

                    send: function (data) {
                        if (socket.readyState === 1) {
                            socket.send(data);
                        } else if (options.onerror) {
                            // 连接不可用，主动触发错误处理并重连
                            options.onerror();
                        }
                    }
                };
            }
        },
        ui: {},
        util: {
            /*
             * 自适应调整字体大小，防止rem换算px得出来小数。
             * @public
             *
             * @param {Array} sheets 样式对象列表
             */
            adjustFontSize: function (sheets) {
                var fontSize = core.fontSize = parseInt(dom.getStyle(document.body.parentElement, 'font-size'), 10);
                sheets.forEach(function (item) {
                    if (ieVersion) {
                        for (i = 0, rule = item.rules || item.cssRules, item = []; (value = rule[i++]);) {
                            item.push(value);
                        }
                    } else {
                        if (item.href && item.href.startsWith('file:')) {
                            return;
                        }
                        item = Array.prototype.slice.call(item.rules || item.cssRules);
                    }
                    for (var i = 0, rule; (rule = item[i++]);) {
                        if (rule.cssRules && rule.cssRules.length) {
                            item = item.concat(Array.prototype.slice.call(rule.cssRules));
                        } else {
                            var value = rule.style['font-size'];
                            if (value && value.slice(-3) === 'rem') {
                                value = +value.slice(0, -3);
                                fontSizeCache.push([rule.style, value]);
                                rule.style['font-size'] = Math.round(fontSize * value) + 'px';
                            }
                        }
                    }
                });
            },

            /*
             * 空函数。
             * blank 方法不应该被执行，也不进行任何处理，它用于提供给不需要执行操作的事件方法进行赋值。
             * @public
             */
            blank: new Function(),

            /**
             * 检测表单有没有未提交的修改。
             * @public
             *
             * @param {HTMLFormElement} form 表单元素
             * @return {boolean} 是否有更改
             */
            checkUpdate: function (form) {
                var update = false;
                dom.toArray(form.elements).forEach(function (item) {
                    if (item.name) {
                        if (item.type !== 'radio' && item.type !== 'checkbox') {
                            if (item.defaultValue !== item.value) {
                                update = true;
                            }
                        } else if (item.defaultChecked !== item.checked) {
                            update = true;
                        }
                    }
                });
                return update;
            },

            /**
             * 复制text到剪切板中。
             * 在异步ajax请求中使用document.execCommand('copy')无效，同步的ajax请求中正常使用。
             * @public
             *
             * @param {string|HTMLTextareaElement} text 被复制到剪切板的内容或包含此内容的 <textarea> 对象
             * @param {function} callback 复制成功的回调函数
             */
            clipboard: function (text, callback) {
                __ECUI__ClipboardHandle();
                if (typeof text === 'string') {
                    var elem = core.$('ECUI-CLIPBOARD');
                    if (!elem) {
                        elem = document.body.appendChild(dom.create('TEXTAREA', { id: 'ECUI-CLIPBOARD' }));
                    }
                    elem.value = text;
                    text = elem;
                }

                var active = document.activeElement;
                if (active !== document.body) {
                    var start = active.selectionStart,
                        end = active.selectionEnd;
                }

                text.select();
                if (iosVersion && safariVersion) {
                    text.setSelectionRange(0, 999999999);
                }
                var ret = document.execCommand('copy');

                if (active !== document.body) {
                    active.focus();
                    active.setSelectionRange(start, end);
                }
                if (ret) {
                    if (callback) {
                        callback();
                    }
                } else {
                    __ECUI__ClipboardHandle = util.timer(util.clipboard, 100, this, text, callback);
                }
            },

            /**
             * 对目标字符串进行基于当前页面编码集的 base64 解码。
             * @public
             *
             * @param {string} source 目标字符串
             * @return {string} 结果字符串
             */
            decodeBase64: function (source) {
                var output = '';
                var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                source = source.replace(/[^A-Za-z0-9\+\/\=]/g, '');
                for (var i = 0; i < source.length;) {
                    enc1 = __ECUI__Base64Table.indexOf(source.charAt(i++));
                    enc2 = __ECUI__Base64Table.indexOf(source.charAt(i++));
                    enc3 = __ECUI__Base64Table.indexOf(source.charAt(i++));
                    enc4 = __ECUI__Base64Table.indexOf(source.charAt(i++));
                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;
                    output += '%' + chr1.toString(16);
                    if (enc3 !== 64) {
                        output += '%' + chr2.toString(16);
                    }
                    if (enc4 !== 64) {
                        output += '%' + chr3.toString(16);
                    }
                }
                output = decodeURIComponent(output);
                return output;
            },

            /**
             * 对目标字符串进行 html 解码。
             * @public
             *
             * @param {string} source 目标字符串
             * @return {string} 结果字符串
             */
            decodeHTML: (function () {
                var EscapeCharacter = {
                    quot: '"',
                    lt: '<',
                    gt: '>',
                    amp: '&'
                };

                return function (source) {
                    //处理转义的中文和实体字符
                    return source.replace(
                        /&(quot|lt|gt|amp|#([\d]+));/g,
                        function (match, $1, $2) {
                            return EscapeCharacter[$1] || String.fromCharCode(+$2);
                        }
                    );
                };
            })(),

            /**
             * 删除 cookie 值。
             * @public
             *
             * @param {string} key cookie 名
             */
            delCookie: function (key) {
                var d = new Date();
                d.setTime(d.getTime() - 1000000);
                var cookie = key + '="" ; expires=' + d.toGMTString() + ';path=/';
                document.cookie = cookie;
            },

            /**
             * 发送自定义的DOM事件。
             * @public
             *
             * @param {string} eventName 事件名
             * @param {object|string} options 事件参数，支持json字符串
             */
            dispatchEvent: function (eventName, options) {
                if (typeof options === 'string') {
                    options = JSON.parse(options);
                }
                var event = document.createEvent('HTMLEvents');
                event.initEvent(eventName, true, true);
                Object.assign(event, options);
                window.dispatchEvent(event);
            },

            /**
             * 对目标字符串进行基于当前页面编码集的 base64 编码。
             * @public
             *
             * @param {string} source 目标字符串
             * @return {string} 结果字符串
             */
            encodeBase64: function (source) {
                var output = '';
                var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                source = encodeURIComponent(source);
                for (var i = 0; i < source.length;) {
                    chr1 = source.charCodeAt(i++);
                    if (chr1 === 37) {
                        chr1 = parseInt(source.slice(i, i + 2), 16);
                        i += 2;
                    }
                    chr2 = source.charCodeAt(i++);
                    if (chr2 === 37) {
                        chr2 = parseInt(source.slice(i, i + 2), 16);
                        i += 2;
                    }
                    chr3 = source.charCodeAt(i++);
                    if (chr3 === 37) {
                        chr3 = parseInt(source.slice(i, i + 2), 16);
                        i += 2;
                    }
                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;
                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }
                    output += __ECUI__Base64Table.charAt(enc1) + __ECUI__Base64Table.charAt(enc2) + __ECUI__Base64Table.charAt(enc3) + __ECUI__Base64Table.charAt(enc4);
                }
                return output;
            },

            /**
             * 对目标字符串进行 html 编码。
             * encodeHTML 方法对五个字符进行编码，分别是 &<>"'
             * @public
             *
             * @param {string} source 目标字符串
             * @return {string} 结果字符串
             */
            encodeHTML: function (source) {
                return source.replace(
                    /[&<>"']/g,
                    function (match) {
                        return '&#' + match.charCodeAt(0) + ';';
                    }
                );
            },

            /**
             * 对目标字符串进行 js 编码。
             * encodeJS 方法对单双引号进行编码
             * @public
             *
             * @param {string} source 目标字符串
             * @return {string} 结果字符串
             */
            encodeJS: function (source) {
                return source.replace(
                    /["']/g,
                    function (match) {
                        return match === '"' ? '\\x22' : '\\x27';
                    }
                );
            },

            /**
             * 对目标字符串进行正则编码。
             * @public
             *
             * @param {string} source 目标字符串
             * @return {string} 结果字符串
             */
            encodeRegExp: function (source) {
                return source.replace(/([{}()|+*$.\^\[\]\\])/g, '\\$1');
            },

            /**
             * 格式化日期对象。
             * @public
             *
             * @param {Date} date 日期对象
             * @param {string} format 日期格式
             * @return {string} 格式化日期字符串
             */
            formatDate: function (date, format) {
                if (format === 't') {
                    return date.getTime();
                }
                var o = {
                    'M+': date.getMonth() + 1, //月份
                    'd+': date.getDate(), //日
                    'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, //小时
                    'H+': date.getHours(), //小时
                    'm+': date.getMinutes(), //分
                    's+': date.getSeconds(), //秒
                    'q+': Math.floor((date.getMonth() + 3) / 3), //季度
                    'S': date.getMilliseconds() //毫秒
                };
                var week = ['日', '一', '二', '三', '四', '五', '六'];
                if (/(y+)/.test(format)) {
                    format = format.replace(RegExp.$1, (date.getFullYear().toString()).substr(4 - RegExp.$1.length));
                }
                if (/(E+)/.test(format)) {
                    format = format.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '星期' : '周') : '') + week[date.getDay()]);
                }
                for (var k in o) {
                    if (o.hasOwnProperty(k) && new RegExp('(' + k + ')').test(format)) {
                        format = format.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(o[k].toString().length)));
                    }
                }
                return format;
            },

            /**
             * 中文大写金融格式化。
             * @public
             *
             * @param {number} num 需要格式化的数字
             * @return {string} 格式化结果
             */
            formatCHNFinance: function (num) {
                var strs = String(num).split('.'),
                    chnNumber = '零壹贰叁肆伍陆柒捌玖',
                    unit = '元拾佰仟万拾佰仟亿拾佰仟兆拾佰仟',
                    unit2 = '角分厘毫',
                    len = strs[0].length - 1,
                    zero = 4 - len % 4 - 1;

                return strs[0].split('').map(function (item, index) {
                    item = +item;
                    index = len - index;
                    if (item) {
                        if (zero) {
                            zero = 0;
                            if (len !== index) {
                                return '零' + chnNumber.charAt(item) + unit.charAt(index);
                            }
                        }
                        return chnNumber.charAt(item) + unit.charAt(index);
                    }
                    zero++;
                    if (index && (index % 4 || zero >= 4)) {
                        return '';
                    }
                    return unit.charAt(index);
                }).join('') + (strs[1] ? strs[1].split('').slice(0, 4).map(function (item, index) {
                    return +item ? chnNumber.charAt(item) + unit2.charAt(index) : '';
                }).join('') : '整');
            },

            /**
             * 金融数字格式化。
             * @public
             *
             * @param {string|number} num 需要格式化的数字
             * @return {string} 格式化结果
             */
            formatFinance: function (num) {
                return String(num).replace(/\d+/, function (n) { // 先提取整数部分
                    return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) { // 对整数部分添加分隔符
                        return $1 + ',';
                    });
                });
            },

            /**
             * 字符串格式化，{01}表示第一个参数填充到这个位置，占用两个字符的宽度，不足使用0填充。
             * @public
             *
             * @param {string} source 目标模版字符串
             * @param {string} ... 字符串替换项集合
             * @return {string} 格式化结果
             */
            formatString: function (source) {
                var args = arguments;
                return source.replace(
                    /\{([0-9]+)\}/g,
                    function (match, index) {
                        return args[+index + 1];
                    }
                );
            },

            /**
             * 获取 cookie 值。
             * @public
             *
             * @param {string} key cookie 名
             * @return {string} cookie字符串
             */
            getCookie: function (key) {
                var cookies = document.cookie.split('; ');
                var val = null;
                cookies.forEach(function (cookie) {
                    cookie = cookie.split('=');
                    if (cookie[0] === key) {
                        val = cookie[1];
                    }
                });
                return val;
            },

            /**
             * 获取本地存储的信息。
             * @public
             *
             * @param {string} key 数据的键值
             * @param {function} handle 获取数据后的处理
             */
            getLocalStorage: function (key, handle) {
                if (window.indexedDB) {
                    var request = indexedDB.open('ECUIDB', 1);
                    request.onupgradeneeded = request.onsuccess = function (event) {
                        var db = event.target.result,
                            table = db.objectStoreNames.contains('ECUITable') ? db.transaction('ECUITable', 'readwrite').objectStore('ECUITable') : db.createObjectStore('ECUITable', {keyPath: 'key'});
                        table.get(key).onsuccess = function (event) {
                            handle(event.target.result.value);
                        };
                    };
                } else {
                    key = window.localStorage.getItem(location.pathname + '#' + key);
                    handle(key && JSON.parse(key));
                }
            },

            /**
             * 当前是否需要处理IOS软键盘。
             * @public
             *
             * @param {HTMLElement} target 用于判断的元素对象，如果为空使用 document.activeElement
             * @return {boolean} 是否需要处理IOS软键盘
             */
            hasIOSKeyboard: iosVersion ? function (target) {
                target = target || document.activeElement;
                return !target.readOnly && dom.isEditable(target);
            } : function () {
                return false;
            },

            /**
             * 类继承。
             * @public
             *
             * @param {function} subClass 子类
             * @param {function} superClass 父类
             */
            inherits: function (subClass, superClass) {
                var oldPrototype = subClass.prototype,
                    Clazz = new Function();

                Clazz.prototype = superClass.prototype;
                Object.assign(subClass.prototype = new Clazz(), oldPrototype);
                subClass.prototype.constructor = subClass;
                subClass.SUPER = superClass;
            },

            /**
             * 判断类是否有继承关系。
             * @public
             *
             * @param {function} subClass 子类
             * @param {function} superClass 父类
             * @return {boolean} subClass 的继承关系
             */
            isInherits: function (subClass, superClass) {
                for (var clazz = subClass; clazz; clazz = clazz.SUPER) {
                    if (clazz === superClass) {
                        return true;
                    }
                }
                return false;
            },

            /**
             * 从指定的命名空间中取出值。
             * @public
             *
             * @param {string} name 描述值的字符串
             * @param {object} namespace 初始的命名空间，默认从window开始
             * @return {object} 命名空间中指定的值，如果不存在返回undefined
             */
            parseValue: function (name, namespace) {
                namespace = namespace || window;
                for (var i = 0, list = name.split('.'); (name = list[i++]);) {
                    namespace = namespace[name];
                    if (namespace === undefined || namespace === null) {
                        return undefined;
                    }
                }
                return namespace;
            },

            /**
             * 阻止系统默认事件的单例函数，用于阻止事件调用。
             * @public
             *
             * @param {Event} event 事件对象
             */
            preventEvent: function (event) {
                event.preventDefault();
            },

            /**
             * 从数组中移除一个对象。
             * @public
             *
             * @param {Array} array 数组对象
             * @param {object} obj 需要移除的对象
             */
            remove: function (array, obj) {
                var index = array.indexOf(obj);
                if (index >= 0) {
                    array.splice(index, 1);
                }
            },

            /**
             * 从数组中移除对象。
             * @public
             *
             * @param {Array} array 数组对象
             * @param {object} obj 需要移除的对象
             */
            removeAll: function (array, obj) {
                for (var i = array.length; i--;) {
                    if (array[i] === obj) {
                        array.splice(i, 1);
                    }
                }
            },

            /*
             * 设置 cookie 值。
             * @public
             *
             * @param {string} key cookie 名
             * @param {string} val cookie 值
             * @param {string} exp cookie 的过期时间
             */
            setCookie: function (key, val, exp) {
                var cookie = key + '=' + val;
                if (exp) {
                    cookie += ('; expires=' + exp.toGMTString());
                }
                document.cookie = cookie;
            },

            /**
             * 设置本地存储的信息。
             * @public
             *
             * @param {string} key 数据的键值
             * @param {object} value 数据对象
             * @param {function} handle 设置成功的回调函数
             */
            setLocalStorage: function (key, value, handle) {
                if (window.indexedDB) {
                    var request = indexedDB.open('ECUIDB', 1);
                    request.onupgradeneeded = request.onsuccess = function (event) {
                        var db = event.target.result,
                            table = db.objectStoreNames.contains('ECUITable') ? db.transaction('ECUITable', 'readwrite').objectStore('ECUITable') : db.createObjectStore('ECUITable', {keyPath: 'key'});
                        if (value !== undefined) {
                            table.put({key: key, value: value}).onsuccess = handle;
                        } else {
                            table.delete(key).onsuccess = handle;
                        }
                    };
                } else {
                    window.localStorage.setItem(location.pathname + '#' + key, JSON.stringify(value));
                    handle();
                }
            },

            /**
             * 数组求和。
             * @public
             *
             * @param {Array} array 数组对象
             * @return {number} 数组的和
             */
            sum: function (array) {
                var ret = 0;
                array.forEach(function (n) {
                    ret += n;
                });
                return ret;
            },

            /**
             * 创建一个定时器对象。
             * @public
             *
             * @param {function} func 定时器需要调用的函数
             * @param {number} delay 定时器延迟调用的毫秒数，如果为负数表示需要连续触发
             * @param {object} caller 调用者，在 func 被执行时，this 指针指向的对象，可以为空
             * @param {object} ... 向 func 传递的参数
             * @return {function} 用于关闭定时器的方法，如果传参数true，第一次暂停，第二次恢复执行
             */
            timer: function (func, delay, caller) {
                function callFunc() {
                    if (func) {
                        func.apply(caller, args);
                    }
                    if (delay === -1) {
                        if (func) {
                            handle = window.requestAnimationFrame(callFunc);
                        }
                    } else if (delay >= 0) {
                        func = caller = args = null;
                    }
                }

                function build() {
                    return delay === -1 ?
                        window.requestAnimationFrame(callFunc) :
                        (delay < 0 ? window.setInterval : window.setTimeout)(callFunc, Math.abs(delay));
                }

                if (delay === -1) {
                    if (!window.requestAnimationFrame) {
                        delay = -20;
                    }
                } else {
                    delay = delay || 0;
                }

                var args = Array.prototype.slice.call(arguments, 3),
                    handle = build(),
                    pausing;

                /**
                 * 中止定时调用。
                 * @public
                 *
                 * @param {boolean} pause 是否暂时停止定时器，如果参数是 true，再次调用函数并传入参数 true 恢复运行。
                 */
                return function (pause) {
                    if (delay === -1) {
                        window.cancelAnimationFrame(handle);
                    } else {
                        (delay < 0 ? window.clearInterval : window.clearTimeout)(handle);
                    }
                    if (pause) {
                        if (pausing) {
                            handle = build();
                        }
                        pausing = !pausing;
                    } else {
                        func = caller = args = null;
                    }
                };
            },

            /**
             * 驼峰命名法转换。
             * toCamelCase 方法将 xxx-xxx 字符串转换成 xxxXxx。
             * @public
             *
             * @param {string} source 目标字符串
             * @return {string} 结果字符串
             */
            toCamelCase: function (source) {
                if (source.indexOf('-') < 0) {
                    return source;
                }
                return source.replace(
                    /\-./g,
                    function (match) {
                        return match.charAt(1).toUpperCase();
                    }
                );
            },

            /**
             * 样式命名法转换。
             * toStyleCase 方法将 xxxXxx 字符串转换成 xxx-xxx。
             * @public
             *
             * @param {string} source 目标字符串
             * @return {string} 结果字符串
             */
            toStyleCase: function (source) {
                return source.replace(/[A-Z]/g, function (match) {
                    return '-' + match.toLowerCase();
                });
            }
        }
    };

    var core = ecui,
        dom = core.dom,
        effect = core.effect,
        //{if 1}//ext = core.ext,//{/if}//
        io = core.io,
        //{if 1}//ui = core.ui,//{/if}//
        util = core.util;

    var __ECUI__ClipboardHandle = util.blank;
    var __ECUI__Base64Table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    // 渐变函数的贝塞尔曲线参数
    var __ECUI__CubicBezier = {
        linear: [0, 0, 1, 1],
        ease: [0.25, 0.1, 0.25, 1],
        'ease-in': [0.42, 0, 1, 1],
        'ease-out': [0, 0, 0.58, 1],
        'ease-in-out': [0.42, 0, 0.58, 1]
    };

    try {
        document.execCommand('BackgroundImageCache', false, true);
    } catch (ignore) {}
//{if 0}//
    if (isToucher) {
        dom.addEventListener(document, 'contextmenu', util.preventEvent);
    }
    ecui.__ControlStyle__ = function (cssText) {
        cssText = '@import (less) \'ecui.css\';\n' + cssText;

        var el = document.createElement('STYLE');
        el.setAttribute('type', 'text/less');
        if (ecui.ie < 10) {
            el.setAttribute('lessText', cssText);
        } else {
            el.innerHTML = cssText;
        }
        document.head.appendChild(el);
    };
})();
//{/if}//
