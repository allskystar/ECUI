/*
ECUI框架的适配器，用于保证ECUI与第三方库的兼容性，目前ECUI自己实现了适配器中对应的接口，可以将适配器切换至其它第三方库。
*/
//{if 0}//
(function () {
//{/if}//
    var //{if 1}//undefined,//{/if}//
        //{if 1}//JAVASCRIPT = 'javascript',//{/if}//
        patch = ecui,
        fontSizeCache = [],
        isToucher = document.ontouchstart !== undefined,
        //{if 1}//isPointer = !!window.PointerEvent, // 使用pointer事件序列，请一定在需要滚动的元素上加上touch-action:none//{/if}//
        isStrict = document.compatMode === 'CSS1Compat',
        isWebkit = /webkit/i.test(navigator.userAgent),
        iosVersion = /(iPhone|iPad).*?OS (\d+(_\d+)?)/i.test(navigator.userAgent) ?  +(RegExp.$2.replace('_', '.')) : undefined,
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
         * 返回指定id的 DOM 对象。
         * @public
         *
         * @param {string} id DOM 对象标识
         * @return {HTMLElement} DOM 对象
         */
        $: function (id) {
            return document.getElementById(id);
        },

        strict: isStrict,
        webkit: isWebkit,
        chrome: chromeVersion,
        ie: ieVersion,
        firefox: firefoxVersion,
        opera: operaVersion,
        safari: safariVersion,
        inapp: isWebview,

        dom: {
            /**
             * 为 Element 对象添加新的样式。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @param {string} className 样式名，可以是多个，中间使用空白符分隔
             */
            addClass: function (el, className) {
                // 这里直接添加是为了提高效率，因此对于可能重复添加的属性，请使用标志位判断是否已经存在，
                // 或者先使用 removeClass 方法删除之前的样式
                el.className += ' ' + className;
            },

            /**
             * 挂载事件。
             * @public
             *
             * @param {object} obj 响应事件的对象
             * @param {string} type 事件类型
             * @param {Function} func 事件处理函数
             */
            addEventListener: ieVersion < 9 ? function (obj, type, func) {
                obj.attachEvent('on' + type, func);
            } : function (obj, type, func) {
                obj.addEventListener(type, func, {passive: false});
            },

            /**
             * 批量挂载事件。
             * @public
             *
             * @param {object} obj 响应事件的对象
             * @param {events} obj 事件函数映射
             */
            addEventListeners: function (obj, events) {
                for (var key in events) {
                    if (events.hasOwnProperty(key)) {
                        dom.addEventListener(obj, key, events[key]);
                    }
                }
            },

            /**
             * 获取所有 parentNode 为指定 Element 的子 Element 集合。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {Array} Element 对象数组
             */
            children: ieVersion < 9 ? function (el) {
                var result = [];
                for (el = el.firstChild; el; el = el.nextSibling) {
                    if (el.nodeType === 1) {
                        result.push(el);
                    }
                }
                return result;
            } : function (el) {
                return dom.toArray(el.children);
            },

            /**
             * 判断一个 Element 对象是否包含另一个 Element 对象。
             * contain 方法认为两个相同的 Element 对象相互包含。
             * @public
             *
             * @param {HTMLElement} container 包含的 Element 对象
             * @param {HTMLElement} contained 被包含的 Element 对象
             * @return {boolean} contained 对象是否被包含于 container 对象的 DOM 节点上
             */
            contain: firefoxVersion ? function (container, contained) {
                return container === contained || !!(container.compareDocumentPosition(contained) & 16);
            } : function (container, contained) {
                return container.contains(contained);
            },

            /**
             * 创建 Element 对象。
             * @public
             *
             * @param {string} tagName 标签名称，默认创建一个空的 div 对象
             * @param {object} options 标签初始值参数
             * @return {HTMLElement} 创建的 Element 对象
             */
            create: function (tagName, options) {
                function copy(des, src) {
                    for (var key in src) {
                        if (src.hasOwnProperty(key)) {
                            if (src[key]) {
                                if ('object' === typeof src[key]) {
                                    copy(des[key], src[key]);
                                } else {
                                    des[key] = src[key];
                                }
                            }
                        }
                    }
                }

                if ('object' === typeof tagName) {
                    options = tagName;
                    tagName = 'DIV';
                }
                var el = document.createElement(tagName);
                if (options) {
                    copy(el, options);
                }
                return el;
            },

            /**
             * 创建 Css 对象。
             * @public
             *
             * @param {string} cssText css文本
             * @return {HTMLElement} 创建的 style 元素
             */
            createStyleSheet: function (cssText) {
                var el = document.createElement('STYLE');
                el.type = 'text/css';

                if (ieVersion < 10) {
                    var reg = ieVersion > 6 ? new RegExp('[_' + (ieVersion > 7 ? '\\*\\+' : '') + ']\\w+:[^;}]+[;}]', 'g') : null;
                    if (reg) {
                        cssText = cssText.replace(
                            reg,
                            function (match) {
                                return match.slice(-1) === '}' ? '}' : '';
                            }
                        );
                    }
                    el.styleSheet.cssText = cssText;
                } else {
                    el.innerHTML = cssText;
                }

                document.head.appendChild(el);

                util.adjustFontSize([document.styleSheets[document.styleSheets.length - 1]]);

                return el;
            },

            /**
             * 获取 Element 对象的第一个子 Element 对象。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {HTMLElement} 子 Element 对象
             */
            first: ieVersion < 9 ? function (el) {
                for (el = el.firstChild; el; el = el.nextSibling) {
                    if (el.nodeType === 1) {
                        return el;
                    }
                }
            } : function (el) {
                return el.firstElementChild;
            },

            /**
             * 获取 Element 对象的属性值。
             * 在 IE 下，Element 对象的属性可以通过名称直接访问，效率是 getAttribute 方式的两倍。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @param {string} name 属性名称
             * @return {string} 属性值
             */
            getAttribute:/*ignore*/ ieVersion < 8 ? function (el, name) {
                return el[name] || '';
            } :/*end*/ function (el, name) {
                return el.getAttribute(name) || '';
            },

            /**
             * 获取自定义样式。
             * 标签自身的 content 样式没有意义，所以可以用于自定义样式的扩展。在 IE 9以下浏览器中，使用 filter 自定义样式。
             * @public
             *
             * @param {HTMLElement|CSSStyle} item Element 对象或样式对象
             * @param {string} name 自定义样式名称
             * @return {string} 自定义样式值
             */
            getCustomStyle: function (item, name) {
                if (dom.isElement(item)) {
                    item = dom.getStyle(item);
                }
                if (ieVersion < 9) {
                    var ret = new RegExp('(^|\\s*)' + name + '\\s*\\(([^;]+)\\)(;|$)').test(item.filter);
                } else {
                    ret = new RegExp('(^|\\s*)' + name + '\\s*:([^;]+)(;|$)').test(item.content ? item.content.trim().slice(1, -1) : '');
                }

                return ret ? (RegExp.$2 || '').trim() : null;
            },

            /**
             * 获取 Element 对象的页面位置。
             * getPosition 方法将返回指定 Element 对象的位置信息。属性如下：
             * left {number} X轴坐标
             * top  {number} Y轴坐标
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {object} 位置信息
             */
            getPosition: function (el) {
                var top = 0,
                    left = 0,
                    body = document.body,
                    html = dom.parent(body),
                    style;

                if (el.getBoundingClientRect) {
                    if (ieVersion && !isStrict) {
/*ignore*/
                        // 在怪异模式下，IE 将 body 的边框也算在了偏移值中，需要先纠正
                        if (ieVersion < 8) {
                            style = dom.getStyle(body, 'borderWidth').split(' ');
                            style = {borderTopWidth: style[0], borderLeftWidth: style[3] || style[1] || style[0]};
                        } else {
/*end*/
                            style = dom.getStyle(body);
/*ignore*/
                        }
/*end*/
                        if (isNaN(top = util.toNumber(style.borderTopWidth))) {
                            top = -2;
                        }
                        if (isNaN(left = util.toNumber(style.borderLeftWidth))) {
                            left = -2;
                        }
                    }

                    var bound = el.getBoundingClientRect();
                    top += html.scrollTop + body.scrollTop - html.clientTop + Math.round(bound.top);
                    left += html.scrollLeft + body.scrollLeft - html.clientLeft + Math.round(bound.left);
                } else if (el === body) {
                    top = -html.scrollTop;
                    left = -html.scrollLeft;
                } else if (el !== html) {
                    for (var parent = el, childStyle = dom.getStyle(el); parent; parent = parent.offsetParent) {
                        top += parent.offsetTop;
                        left += parent.offsetLeft;
                        // safari里面，如果遍历到了一个fixed的元素，后面的offset都不准了
                        if (isWebkit && dom.getStyle(parent, 'position') === 'fixed') {
                            left += body.scrollLeft;
                            top += body.scrollTop;
                            break;
                        }
                    }

                    if (operaVersion || (isWebkit && dom.getStyle(el, 'position') === 'absolute')) {
                        top -= body.offsetTop;
                    }

                    for (parent = dom.parent(el); parent !== html; parent = dom.parent(parent)) {
                        left -= parent.scrollLeft;
                        if (!operaVersion) {
                            style = dom.getStyle(parent);
                            // 以下解决firefox下特殊的布局引发的双倍border边距偏移的问题
                            var ratio = firefoxVersion && style.overflow !== 'visible' && childStyle.position === 'absolute' ? 2 : 1;
                            top += util.toNumber(style.borderTopWidth) * ratio - parent.scrollTop;
                            left += util.toNumber(style.borderLeftWidth) * ratio;
                            childStyle = style;
                        } else if (parent.tagName !== 'TR') {
                            top -= parent.scrollTop;
                        }
                    }
//                    top -= html.scrollTop;
//                    left -= html.scrollLeft;
                }

                return {top: top, left: left};
            },

            /**
             * 获取 Element 对象的 CssStyle 对象或者是指定的样式值。
             * getStyle 方法如果不指定样式名称，将返回 Element 对象的当前 CssStyle 对象。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @param {string} name 样式名称
             * @return {CssStyle|Object} CssStyle 对象或样式值
             */
            getStyle: function (el, name) {
                var fixer = __ECUI__StyleFixer[name],
                    style = getComputedStyle(el, null);

                style = name ? fixer && fixer.get ? fixer.get(el, style) : style[fixer || name] : style;

                if (ieVersion < 8) {
                    try {
                        var list = style.borderWidth.split(' ');
                        style.borderTopWidth = list[0];
                        style.borderRightWidth = list[1] || list[0];
                        style.borderBottomWidth = list[2] || list[0];
                        style.borderLeftWidth = list[3] || list[1] || list[0];
                        list = style.padding.split(' ');
                        style.paddingTop = list[0];
                        style.paddingRight = list[1] || list[0];
                        style.paddingBottom = list[2] || list[0];
                        style.paddingLeft = list[3] || list[1] || list[0];
                        list = style.margin.split(' ');
                        style.marginTop = list[0];
                        style.marginRight = list[1] || list[0];
                        style.marginBottom = list[2] || list[0];
                        style.marginLeft = list[3] || list[1] || list[0];
                    } catch (ignore) {
                    }
                }
                return style;
            },

            /**
             * 获取 Element 对象的文本。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {string} Element 对象的文本
             */
            getText: ieVersion < 9 ? function (el) {
                return el.innerText;
            } : function (el) {
                return el.textContent;
            },

            /**
             * 判断指定的样式是否包含在 Element 对象中。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @param {string} className 样式名称
             * @return {boolean} true，样式包含在 Element 对象中
             */
            hasClass: function (el, className) {
                return el.className.split(/\s+/).indexOf(className) >= 0;
            },

            /**
             * 将 Element 对象插入指定的 Element 对象之后。
             * 如果指定的 Element 对象没有父 Element 对象，相当于 remove 操作。
             * @public
             *
             * @param {HTMLElement} el 被插入的 Element 对象
             * @param {HTMLElement} target 目标 Element 对象
             * @return {HTMLElement} 被插入的 Element 对象
             */
            insertAfter: function (el, target) {
                var parent = dom.parent(target);
                return parent ? parent.insertBefore(el, target.nextSibling) : dom.remove(el);
            },

            /**
             * 将 Element 对象插入指定的 Element 对象之前。
             * 如果指定的 Element 对象没有父 Element 对象，相当于 remove 操作。
             * @public
             *
             * @param {HTMLElement} el 被插入的 Element 对象
             * @param {HTMLElement} target 目标 Element 对象
             * @return {HTMLElement} 被插入的 Element 对象
             */
            insertBefore: function (el, target) {
                var parent = dom.parent(target);
                return parent ? parent.insertBefore(el, target) : dom.remove(el);
            },

            /**
             * 向指定的 Element 对象内插入一段 html 代码。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @param {string} position 插入 html 的位置信息，取值为 beforeBegin,afterBegin,beforeEnd,afterEnd
             * @param {string} html 要插入的 html 代码
             */
            insertHTML: firefoxVersion ? (function () {
                var HTMLPosition = {
                    AFTERBEGIN: 'selectNodeContents',
                    BEFOREEND: 'selectNodeContents',
                    BEFOREBEGIN: 'setStartBefore',
                    AFTEREND: 'setEndAfter'
                };

                return function (el, position, html) {
                    var name = HTMLPosition[position.toUpperCase()],
                        range = document.createRange();

                    range[name](el);
                    range.collapse(position.length > 9);
                    range.insertNode(range.createContextualFragment(html));
                };
            }()) : ieVersion === 10 ? function (el, position, html) {
                var parent = dom.parent(el);
                if (!parent) {
                    dom.create().appendChild(el);
                }
                el.insertAdjacentHTML(position, html);
            } : function (el, position, html) {
                el.insertAdjacentHTML(position, html);
            },

            /**
             * 判断一个对象是否为 DOM 元素。
             * @public
             *
             * @param {object} obj 对象
             * @return {boolean} 是否为 DOM 元素
             */
            isElement: ieVersion < 9 ? function (obj) {
                // 通过检测nodeType是否只读来判断是不是 DOM 元素
                if (!obj.hasOwnProperty && obj.nodeType === 1) {
                    try {
                        obj.nodeType = 2;
                    } catch (e) {
                        return true;
                    }
                }
                return false;
            } : function (obj) {
                return obj instanceof HTMLElement;
            },

            /**
             * 获取 Element 对象的最后一个子 Element 对象。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {HTMLElement} 子 Element 对象
             */
            last: ieVersion < 9 ? function (el) {
                for (el = el.lastChild; el; el = el.previousSibling) {
                    if (el.nodeType === 1) {
                        return el;
                    }
                }
            } : function (el) {
                return el.lastElementChild;
            },

            /**
             * 获取Element 对象的下一个兄弟节点。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {HTMLElement} 下一个兄弟 Element 对象
             */
            next: ieVersion < 9 ? function (el) {
                for (el = el.nextSibling; el; el = el.nextSibling) {
                    if (el.nodeType === 1) {
                        return el;
                    }
                }
            } : function (el) {
                return el.nextElementSibling;
            },

            /**
             * 获取 Element 对象的父 Element 对象。
             * 在 IE 下，Element 对象被 removeChild 方法移除时，parentNode 仍然指向原来的父 Element 对象，与 W3C 标准兼容的属性应该是 parentElement。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {HTMLElement} 父 Element 对象，如果没有，返回 null
             */
            parent: function (el) {
                return el.parentElement;
            },

            /**
             * 获取Element 对象的上一个兄弟节点。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {HTMLElement} 上一个兄弟 Element 对象
             */
            previous: ieVersion < 9 ? function (el) {
                for (el = el.previousSibling; el; el = el.previousSibling) {
                    if (el.nodeType === 1) {
                        return el;
                    }
                }
            } : function (el) {
                return el.previousElementSibling;
            },

            /**
             * 从页面中移除 Element 对象。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {HTMLElement} 被移除的 Element 对象
             */
            remove: function (el) {
                var parent = dom.parent(el);
                if (parent) {
                    parent.removeChild(el);
                }
                return el;
            },

            /**
             * 删除 Element 对象中的样式。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @param {string} className 样式名，可以是多个，中间用空白符分隔
             */
            removeClass: function (el, className) {
                var oldClasses = el.className.split(/\s+/).sort(),
                    newClasses = className.split(/\s+/).sort(),
                    i = oldClasses.length,
                    j = newClasses.length;

                for (; i && j; ) {
                    if (oldClasses[i - 1] === newClasses[j - 1]) {
                        oldClasses.splice(--i, 1);
                    } else if (oldClasses[i - 1] < newClasses[j - 1]) {
                        j--;
                    } else {
                        i--;
                    }
                }
                el.className = oldClasses.join(' ');
            },

            /**
             * 卸载事件。
             * @public
             *
             * @param {object} obj 响应事件的对象
             * @param {string} type 事件类型
             * @param {Function} func 事件处理函数
             */
            removeEventListener: ieVersion < 9 ? function (obj, type, func) {
                obj.detachEvent('on' + type, func);
            } : function (obj, type, func) {
                obj.removeEventListener(type, func, {passive: false});
            },

            /**
             * 如果元素不在可视区域，将元素滚动到可视区域。
             * @public
             *
             * @param {HTMLElement} el InputElement 对象
             * @param {boolean} isMiddle true - 默认值，居中显示 / false - 离最近的可视区域显示
             */
            scrollIntoViewIfNeeded: function (el, isMiddle) {
                if (el.scrollIntoViewIfNeeded) {
                    el.scrollIntoViewIfNeeded(isMiddle);
                } else {
                    var top = dom.getPosition(el).top,
                        height = el.offsetHeight,
                        view = util.getView();

                    if ((top >= view.top && top + height <= view.bottom) || (top < view.top && top + height > view.top) || (top + height > view.bottom && top < view.bottom)) {
                        // 部分在屏幕外或者指定非居中，靠最近的可视区域显示
                        isMiddle = false;
                    } else if (isMiddle === undefined) {
                        isMiddle = true;
                    }
                    for (el = dom.parent(el); el !== document.body; el = dom.parent(el)) {
                        if (el.clientHeight !== el.scrollHeight) {
                            var clientTop = dom.getPosition(el).top +
                                    util.toNumber(
/*ignore*/
                                        ieVersion < 8 ? dom.getStyle(el, 'borderWidth').split(' ')[0] :
/*end*/
                                                dom.getStyle(el, 'borderTopWidth')
                                    ),
                                clientHeight = el.clientHeight,
                                distance;

                            if (isMiddle || height > clientHeight) {
                                // 高度不够居中显示
                                distance = top + el.scrollTop;
                                el.scrollTop = distance - clientTop + (height - clientHeight) / 2;
                                top = distance - el.scrollTop;
                            } else {
                                // 高度足够靠最近的位置
                                if (top < clientTop) {
                                    el.scrollTop -= clientTop - top;
                                    top = clientTop;
                                } else if (top + height > clientTop + clientHeight) {
                                    el.scrollTop += top + height - clientTop - clientHeight;
                                    top = clientTop + clientHeight - height;
                                }
                            }
                        }
                    }

                    top -= view.top;
                    if (isMiddle || height > el.clientHeight) {
                        // 高度不够居中显示
                        window.scroll(0, top + (height - el.clientHeight) / 2);
                    } else {
                        if (top < 0) {
                            window.scroll(0, top);
                        } else if (top + height > el.clientHeight) {
                            window.scroll(0, top + height - el.clientHeight);
                        }
                    }
                }
            },

            /**
             * 设置 Element 对象的样式值。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @param {string} name 样式名称
             * @param {string} value 样式值
             */
            setStyle: function (el, name, value) {
                var fixer = __ECUI__StyleFixer[name];
                if (fixer && fixer.set) {
                    fixer.set(el, value);
                } else {
                    el.style[fixer || name] = value;
                }
            },

            /**
             * 将 Element 集合转换成数组。
             * @public
             *
             * @param {HTMLCollection} elements Element 集合
             * @return {Array} Element 数组
             */
            toArray: ieVersion < 9 ? function (elements) {
                for (var i = 0, ret = [], el; el = elements[i++]; ) {
                    ret.push(el);
                }
                return ret;
            } : function (elements) {
                return Array.prototype.slice.call(elements);
            }
        },
        effect: {},
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
             * nocache   {boolean}  是否需要缓存，默认为false(缓存)
             * onupload  {Function} 如果xhr支持upload.onprogress，上传过程中触发
             * onsuccess {Function} 请求成功时触发
             * onerror   {Function} 请求发生错误时触发
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
                                options.onsuccess(xhr.responseText, xhr);
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
                    if (window.ActiveXObject) {
                        try {
                            xhr = new ActiveXObject('Msxml2.XMLHTTP');
                        } catch (e) {
                            xhr = new ActiveXObject('Microsoft.XMLHTTP');
                        }
                    } else {
                        xhr = new XMLHttpRequest();
                    }

                    if (options.onupload && xhr.upload) {
                        xhr.upload.onprogress = options.onupload;
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
             * charset {string}   字符集
             * timeout {number}   超时时间
             * onerror {Function} 超时或无法加载文件时触发本函数
             * @public
             *
             * @param {string} url 加载数据的url
             * @param {Function} callback 数据加载结束时调用的函数或函数名
             * @param {object} options 选项
             */
            loadScript: function (url, callback, options) {
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
                            if (callback) {
                                callback();
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
                if (!(ieVersion < 9)) {
                    scr.onerror = options.onerror;
                }
                document.head.appendChild(scr);
            },

            /**
             * 创建一个长连接，对于不支持websocket的浏览器，使用comet模拟实现，在url中使用|分隔websocket与comet的地址，如/ws:8080|/comet:8080。
             * @public
             *
             * @param {string} url 长连接的地址
             * @param {Function} callback 每接受一个正确的数据报文时产生的回调函数，数据报文是一个紧凑的json字符串，使用\n分隔不同的数据报文
             * @param {Function} onerror io失败时的处理
             * @param {object} options 参数
             * @return {object} 操作对象，使用close关闭长连接
             */
            openSocket: function (url, callback, onerror, options) {
                var recvbuf = '',
                    sendbuf = '',
                    heartInterval = util.blank;

                function onrecieve(event) {
                    recvbuf += event.data;
                    for (;;) {
                        var index = recvbuf.indexOf('\n');
                        if (index < 0) {
                            return;
                        }
                        callback(JSON.parse(recvbuf.slice(0, index)));
                        recvbuf = recvbuf.slice(index + 1);
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
                            onerror: onerror || ajaxErrorHandler
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
                        socket.onerror = onerror;
                        // 关闭之前的心跳处理
                        heartInterval();
                        heartInterval = util.timer(
                            function () {
                                if (socket.readyState === 1) {
                                    socket.send(JSON.stringify({type: 0}));
                                }
                            },
                            -15000
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
                        } else if (onerror) {
                            // 连接不可用，主动触发错误处理并重连
                            onerror();
                        }
                    }
                };
            }
        },
        ui: {},
        util: {
            /*
             * 自适应调整字体大小。
             * @public
             *
             * @param {Array} sheets 样式对象列表
             */
            adjustFontSize: function (sheets) {
                var fontSize = core.fontSize = util.toNumber(dom.getStyle(dom.parent(document.body), 'font-size'));
                sheets.forEach(function (item) {
                    if (ieVersion) {
                        for (i = 0, rule = item.rules || item.cssRules, item = []; value = rule[i++]; ) {
                            item.push(value);
                        }
                    } else {
                        if (item.href && item.href.startsWith('file:')) {
                            return;
                        }
                        item = Array.prototype.slice.call(item.rules || item.cssRules);
                    }
                    for (var i = 0, rule; rule = item[i++]; ) {
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
             * blank 方法不应该被执行，也不进行任何处理，它用于提供给不需要执行操作的事件方法进行赋值，与 blank 类似的用于给事件方法进行赋值，而不直接被执行的方法还有 cancel。
             * @public
             */
            blank: new Function(),

            /**
             * 检测表单有没有未提交的修改。
             * @public
             *
             * @param {FormElement} form 表单元素
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
             * @param {string} text 被复制到剪切板的内容
             */
            clipboard: function (text) {
                var result;
                if (ieVersion < 9) {
                    result = window.clipboardData.setData('Text', text);
                } else {
                    var textarea = dom.create('TEXTAREA', {className: 'ui-clipboard'});
                    textarea.value = text;
                    document.body.appendChild(textarea);
                    textarea.setAttribute('readonly', '');
                    textarea.select();

                    if (safariVersion) {
                        // 兼容ios-safari
                        // A big number, to cover anything that could be inside the element.
                        textarea.setSelectionRange(0, 999999999);
                    }
                    result = document.execCommand('copy');
                    if (result) {
                        __ECUI__ClipboardText = undefined;
                        clipboardListener();
                    } else {
                        if (__ECUI__ClipboardText === undefined) {
                            dom.addEventListener(document, 'mousedown', clipboardListener);
                            dom.addEventListener(document, 'touchstart', clipboardListener);
                            dom.addEventListener(document, 'keydown', clipboardListener);
                        }
                        __ECUI__ClipboardText = text;
                    }
                    document.body.removeChild(textarea);
                }
                return result;
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
                for (var i = 0; i < source.length; ) {
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
            }()),

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
                if ('string' === typeof options) {
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
                for (var i = 0; i < source.length; ) {
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
                return source.replace(
                    /[{}()|+*$.\^\[\]\\]/g,
                    function (match) {
                        return '\\' + match;
                    }
                );
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
                if (date) {
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
                }
                return '';
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
                    html = dom.parent(body),
                    client = isStrict ? html : body,
                    scrollTop = html.scrollTop + body.scrollTop,
                    scrollLeft = html.scrollLeft + body.scrollLeft,
                    clientWidth = client.clientWidth,
                    clientHeight = client.clientHeight;

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
             * 当前是否需要处理IOS软键盘。
             * @public
             *
             * @param {HTMLElement} target 用于判断的元素对象，如果为空使用 document.activeElement
             * @return {boolean} 是否需要处理IOS软键盘
             */
            hasIOSKeyboard: iosVersion ? function (target) {
                target = target || document.activeElement;
                return target.getAttribute('contenteditable') || (!target.readOnly && ((target.tagName === 'INPUT' && target.type !== 'radio' && target.type !== 'checkbox') || target.tagName === 'TEXTAREA'));
            } : function () {
                return false;
            },

            /**
             * 类继承。
             * @public
             *
             * @param {Function} subClass 子类
             * @param {Function} superClass 父类
             * @return {object} subClass 的 prototype 属性
             */
            inherits: function (subClass, superClass) {
                var oldPrototype = subClass.prototype,
                    Clazz = new Function();

                Clazz.prototype = superClass.prototype;
                Object.assign(subClass.prototype = new Clazz(), oldPrototype);
                subClass.prototype.constructor = subClass;
                subClass.super = superClass;
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
                for (var i = 0, list = name.split('.'); name = list[i++]; ) {
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
             * 从数组中移除对象。
             * @public
             *
             * @param {Array} array 数组对象
             * @param {object} obj 需要移除的对象
             */
            remove: function (array, obj) {
                for (var i = array.length; i--; ) {
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
             * 字符串格式化，{01}表示第一个参数填充到这个位置，占用两个字符的宽度，不足使用0填充。
             * @public
             *
             * @param {string} source 目标模版字符串
             * @param {string} ... 字符串替换项集合
             * @return {string} 格式化结果
             */
            stringFormat: function (source) {
                var args = arguments;
                return source.replace(
                    /\{([0-9]+)\}/g,
                    function (match, index) {
                        return args[+index + 1];
                    }
                );
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
             * @param {Function} func 定时器需要调用的函数
             * @param {number} delay 定时器延迟调用的毫秒数，如果为负数表示需要连续触发
             * @param {object} caller 调用者，在 func 被执行时，this 指针指向的对象，可以为空
             * @param {object} ... 向 func 传递的参数
             * @return {Function} 用于关闭定时器的方法
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
                            (delay < 0 ? setInterval : setTimeout)(callFunc, Math.abs(delay));
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
                        (delay < 0 ? clearInterval : clearTimeout)(handle);
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
             * 将对象转换成数值，如果是rem数值统一转换为px数值。
             * toNumber 方法会省略数值的符号，例如字符串 9px 将当成数值的 9，不能识别的数值将默认为 0。
             * @public
             *
             * @param {object} obj 需要转换的对象
             * @return {number} 对象的数值
             */
            toNumber: function (obj) {
                if (obj && obj.slice(-3) === 'rem') {
                    return Math.round(core.fontSize * +obj.slice(0, -3));
                }
                return parseFloat(obj, 10) || 0;
            }
        }
    };

    var core = ecui,
        dom = core.dom,
        //{if 1}//effect = core.effect,//{/if}//
        //{if 1}//ext = core.ext,//{/if}//
        io = core.io,
        //{if 1}//ui = core.ui,//{/if}//
        util = core.util;

    var __ECUI__Base64Table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    // 读写特殊的 css 属性操作
    var __ECUI__StyleFixer = {
/*ignore*/
            clip: ieVersion < 8 ? {
                set: function (el, value) {
                    el.style.clip = value === 'auto' ? 'rect(0,100%,100%,0)' : value;
                }
            } : undefined,

            display: ieVersion < 8 ? {
                get: function (el, style) {
                    return style.display === 'inline' && style.zoom === '1' ? 'inline-block' : style.display;
                },

                set: function (el, value) {
                    if (value === 'inline-block') {
                        value = 'inline';
                        el.style.zoom = 1;
                    }
                    el.style.display = value;
                }
            } : undefined,
/*end*/
            opacity: ieVersion < 9 ? {
                get: function (el, style) {
                    if (/\(opacity=(\d+)/.test(style.filter)) {
                        return +RegExp.$1 / 100;
                    }
                    return 1;
                },

                set: function (el, value) {
                    el.style.filter =
                        el.style.filter.replace(/(progid:DXImageTransform\.Microsoft\.)?alpha\([^\)]*\)/gi, '') +
                            (value === '' ? '' :
/*ignore*/                      (
                                    ieVersion < 8 ? 'alpha' :/*end*/ 'progid:DXImageTransform.Microsoft.Alpha'
/*ignore*/                      )/*end*/ + '(opacity=' + value * 100 + ')'
                            );
                }
            } : undefined,

            userSelect: iosVersion ? 'webkitUserSelect' : 'userSelect',
            transform: iosVersion < 9 ? 'webkitTransform' : undefined,

            'float': ieVersion ? 'styleFloat' : 'cssFloat'
        },

        __ECUI__ClipboardText;

    function clipboardListener() {
        dom.removeEventListener(document, 'mousedown', clipboardListener);
        dom.removeEventListener(document, 'touchstart', clipboardListener);
        dom.removeEventListener(document, 'keydown', clipboardListener);

        if (__ECUI__ClipboardText !== undefined) {
            var text = __ECUI__ClipboardText;
            __ECUI__ClipboardText = undefined;
            util.clipboard(text);
        }
    }

    /**
     * 设置页面加载完毕后自动执行的方法。
     * @public
     *
     * @param {Function} func 需要自动执行的方法
     */
    dom.ready = (function () {
        function loadedHandler() {
            if (!hasReady) {
                // 在处理的过程中，可能又有新的dom.ready函数被添加，需要添加到最后而不是直接执行
                for (var i = 0, func; func = list[i++]; ) {
                    func();
                }
                list = [];
                hasReady = true;
            }
        }

        function checkLoaded() {
            try {
                document.documentElement.doScroll('left');
                loadedHandler();
            } catch (e) {
                setTimeout(checkLoaded, 50);
            }
        }

        var hasReady = false,
            list = [];

        if (document.addEventListener && !operaVersion) {
            dom.addEventListener(document, 'DOMContentLoaded', loadedHandler);
        } else if (ieVersion && window === top) {
            checkLoaded();
        }

        dom.addEventListener(window, 'load', loadedHandler);

        return function (func) {
            list.push(func);
            if (hasReady) {
                // 在一次处理的过程中防止重入
                hasReady = false;
                loadedHandler();
            }
        };
    }());

    if (ieVersion < 9) {
        document.head = document.getElementsByTagName('HEAD')[0];
    }

    if (!window.getComputedStyle) {
        window.getComputedStyle = function (el) {
            return el.currentStyle || el.style;
        };
    }

    try {
        document.execCommand('BackgroundImageCache', false, true);
    } catch (ignore) {
    }

    if (!Object.assign) {
        // es6 部分函数兼容
        Object.assign = function (target) {
            Array.prototype.slice.call(arguments, 1).forEach(function (source) {
                if (source) {
                    for (var key in source) {
                        if (source.hasOwnProperty(key)) {
                            target[key] = source[key];
                        }
                    }
                }
            });
            return target;
        };

        String.prototype.startsWith = function (s) {
            return this.indexOf(s) === 0;
        };

        String.prototype.endsWith = function (s) {
            return this.lastIndexOf(s) === this.length - s.length;
        };
    }
//{if 0}//
    if (isToucher) {
        dom.addEventListener(document, 'contextmenu', util.preventEvent);
    }
//{/if}//
    if (window.localStorage) {
        util.getLocalStorage = function (key) {
            return window.localStorage.getItem(location.pathname + '#' + key);
        };
        util.setLocalStorage = function (key, value) {
            window.localStorage.getItem(location.pathname + '#' + key, value);
        };
    } else {
        (function () {
            dom.insertHTML(document.body, 'beforeEnd', '<input type="hidden">');
            var localStorage = document.body.lastChild;
            localStorage.addBehavior('#default#userData');

            util.getLocalStorage = function (key) {
                localStorage.load('ECUI');
                return localStorage.getAttribute(key);
            };
            util.setLocalStorage = function (key, value) {
                localStorage.setAttribute(key, value);
                localStorage.save('ECUI');
            };
        }());
    }

    (function () {
        if (patch) {
            Object.assign(core.dom, patch.dom);
            Object.assign(core.ext, patch.ext);
            Object.assign(core.io, patch.io);
            Object.assign(core.util, patch.util);
            patch = null;
        }
    }());
//{if 0}//
}());
//{/if}//
