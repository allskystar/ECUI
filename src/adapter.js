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
        iosVersion = /(iPhone|iPad).+OS (\d+)/i.test(navigator.userAgent) ?  +(RegExp.$2) : undefined,
        isUCBrowser = /ucbrowser/i.test(navigator.userAgent),
        chromeVersion = /(Chrome|CriOS)\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$2 : undefined,
        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined,
        firefoxVersion = /firefox\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined,
        operaVersion = /opera\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined,
        safariVersion = !chromeVersion && !isUCBrowser && /(\d+\.\d)(\.\d)?\s+.*safari/i.test(navigator.userAgent) ? +RegExp.$1 : undefined,
        isWebview = iosVersion && !chromeVersion && !isUCBrowser ? !/\)\s*Version\//.test(navigator.userAgent) : /\)\s*Version\//.test(navigator.userAgent);

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
             * 获取所有 parentNode 为指定 Element 的子 Element 集合。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {Array} Element 对象数组
             */
            children: function (el) {
                var result = [];
                for (el = el.firstChild; el; el = el.nextSibling) {
                    if (el.nodeType === 1) {
                        result.push(el);
                    }
                }
                return result;
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
                        cssText = cssText.replace(reg, function (match) {
                            return match.slice(-1) === '}' ? '}' : '';
                        });
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
            first: function (el) {
                for (el = el.firstChild; el; el = el.nextSibling) {
                    if (el.nodeType === 1) {
                        return el;
                    }
                }
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
            getAttribute: ieVersion < 8 ? function (el, name) {
                return el[name] || '';
            } : function (el, name) {
                return el.getAttribute(name) || '';
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
                    html = dom.parent(body);

                if (ieVersion) {
                    if (!isStrict) {
                        // 在怪异模式下，IE 将 body 的边框也算在了偏移值中，需要先纠正
                        var style = dom.getStyle(body);
                        if (isNaN(top = util.toNumber(style.borderTopWidth))) {
                            top = -2;
                        }
                        if (isNaN(left = util.toNumber(style.borderLeftWidth))) {
                            left = -2;
                        }
                    }

                    var bound = el.getBoundingClientRect();
                    top += html.scrollTop + body.scrollTop - html.clientTop + Math.floor(bound.top);
                    left += html.scrollLeft + body.scrollLeft - html.clientLeft + Math.floor(bound.left);
                } else if (el === body) {
                    top = html.scrollTop + body.scrollTop;
                    left = html.scrollLeft + body.scrollLeft;
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

                    for (parent = dom.parent(el); parent !== body; parent = dom.parent(parent)) {
                        left -= parent.scrollLeft;
                        if (!operaVersion) {
                            style = dom.getStyle(parent);
                            // 以下解决firefox下特殊的布局引发的双倍border边距偏移的问题，使用 html 作为临时变量
                            html = firefoxVersion && style.overflow !== 'visible' && childStyle.position === 'absolute' ? 2 : 1;
                            top += util.toNumber(style.borderTopWidth) * html - parent.scrollTop;
                            left += util.toNumber(style.borderLeftWidth) * html;
                            childStyle = style;
                        } else if (parent.tagName !== 'TR') {
                            top -= parent.scrollTop;
                        }
                    }
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
                    style = el.currentStyle || (ieVersion ? el.style : getComputedStyle(el, null));

                return name ? fixer && fixer.get ? fixer.get(el, style) : style[fixer || name] : style;
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
            insertHTML: firefoxVersion ? function (el, position, html) {
                var name = __ECUI__HTMLPosition[position.toUpperCase()],
                    range = document.createRange();

                range[name](el);
                range.collapse(position.length > 9);
                range.insertNode(range.createContextualFragment(html));
            } : ieVersion === 10 ? function (el, position, html) {
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
            last: function (el) {
                for (el = el.lastChild; el; el = el.previousSibling) {
                    if (el.nodeType === 1) {
                        return el;
                    }
                }
            },

            /**
             * 获取Element 对象的下一个兄弟节点。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {HTMLElement} 下一个兄弟 Element 对象
             */
            next: function (el) {
                for (el = el.nextSibling; el; el = el.nextSibling) {
                    if (el.nodeType === 1) {
                        return el;
                    }
                }
            },

            /**
             * 获取 Element 对象的父 Element 对象。
             * 在 IE 下，Element 对象被 removeChild 方法移除时，parentNode 仍然指向原来的父 Element 对象，与 W3C 标准兼容的属性应该是 parentElement。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {HTMLElement} 父 Element 对象，如果没有，返回 null
             */
            parent: ieVersion < 10 ? function (el) {
                return el.parentElement;
            } : function (el) {
                return el.parentNode;
            },

            /**
             * 获取Element 对象的上一个兄弟节点。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {HTMLElement} 上一个兄弟 Element 对象
             */
            previous: function (el) {
                for (el = el.previousSibling; el; el = el.previousSibling) {
                    if (el.nodeType === 1) {
                        return el;
                    }
                }
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
             * 设置输入框的表单项属性。
             * 如果没有指定一个表单项，setInput 方法将创建一个表单项。
             * @public
             *
             * @param {HTMLElement} el InputElement 对象
             * @param {string} name 新的表单项名称，默认与 el 相同
             * @param {string} type 新的表单项类型，默认为 el 相同
             * @return {HTMLElement} 设置后的 InputElement 对象
             */
            setInput: function (el, name, type) {
                if (!el) {
                    if (type === 'textarea') {
                        el = dom.create('TEXTAREA');
                    } else {
                        if (ieVersion < 9) {
                            return dom.create('<input type="' + (type || '') + '" name="' + (name || '') + '">');
                        }
                        el = dom.create('INPUT');
                    }
                }

                name = name === undefined ? el.name : name;
                type = type === undefined ? el.type : type;

                if (el.name !== name || el.type !== type) {
                    if ((ieVersion < 10 && type !== 'textarea') || (el.type !== type && (el.type === 'textarea' || type === 'textarea'))) {
                        var oldEl = el;
                        dom.insertHTML(
                            oldEl,
                            'AFTEREND',
                            '<' + (type === 'textarea' ? 'textarea' : 'input type="' + type + '"') + ' name="' + name + '" class="' + el.className + '" style="' + el.style.cssText + '" ' + (el.disabled ? 'disabled' : '') + (el.readOnly ? ' readOnly' : '') + '>'
                        );
                        el = oldEl.nextSibling;
                        el.value = oldEl.value;
                        if (type === 'radio' || type === 'checkbox') {
                            el.checked = oldEl.checked;
                        }
                        dom.remove(oldEl);
                    } else {
                        el.type = type;
                        el.name = name;
                    }
                }
                return el;
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
             * @return {object} 操作对象，使用close关闭长连接
             */
            openSocket: function (url, callback, onerror) {
                var recvbuf = '',
                    sendbuf = '';

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

                function websocketErrorHandler() {
                    socket.close();
                    websocket();
                }

                function websocket() {
                    socket = new WebSocket((location.protocol.startsWith('https') ? 'wss://' : 'ws://') + url[0]);
                    socket.onmessage = onrecieve;
                    socket.onerror = onerror || websocketErrorHandler;
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
                        socket.close();
                    },

                    send: function (data) {
                        if (socket.readyState !== 1) {
                            util.timer(this.send, 100, this, data);
                        } else {
                            socket.send(data);
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
                Array.prototype.slice.call(form.elements).forEach(function (item) {
                    if (item.type !== 'radio' && item.type !== 'checkbox') {
                        if (item.defaultValue !== item.value) {
                            update = true;
                        }
                    } else if (item.defaultChecked !== item.checked) {
                        update = true;
                    }
                });
                return update;
            },

            /**
             * 对目标字符串进行 html 解码。
             * @public
             *
             * @param {string} source 目标字符串
             * @return {string} 结果字符串
             */
            decodeHTML: (function () {
                return function (source) {
                    //处理转义的中文和实体字符
                    return source.replace(
                        /&(quot|lt|gt|amp|#([\d]+));/g,
                        function (match, $1, $2) {
                            return __ECUI__EscapeCharacter[$1] || String.fromCharCode(+$2);
                        }
                    );
                };
            }()),

            /**
             * 对目标字符串进行 html 编码。
             * encodeHTML 方法对四个字符进行编码，分别是 &<>"
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
                subClass.superClass = superClass.prototype;

                return subClass.prototype;
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

            /**
             * 设置缺省的属性值。
             * 如果对象的属性已经被设置，setDefault 方法不进行任何处理，否则将默认值设置到指定的属性上。
             * @public
             *
             * @param {object} obj 被设置的对象
             * @param {string} key 属性名
             * @param {object} value 属性的默认值
             */
            setDefault: function (obj, key, value) {
                if (!obj.hasOwnProperty(key)) {
                    obj[key] = value;
                }
            },

            /**
             * 字符串格式化
             *
             * @inner
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

    //{if 1}//var eventNames = ['mousedown', 'mouseover', 'mousemove', 'mouseout', 'mouseup', 'click', 'dblclick', 'focus', 'blur', 'activate', 'deactivate'];//{/if}//

    // 读写特殊的 css 属性操作
    var __ECUI__StyleFixer = {
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

            opacity: ieVersion < 9 ? {
                get: function (el, style) {
                    if (/\(opacity=(\d+)/.test(style.filter)) {
                        return String(+RegExp.$1 / 100);
                    }
                    return '1';
                },

                set: function (el, value) {
                    el.style.filter =
                        el.style.filter.replace(/alpha\([^\)]*\)/gi, '') +
                            (value === '' ? (ieVersion < 8 ? 'alpha' : 'progid:DXImageTransform.Microsoft.Alpha') +
                            '(opacity=' + value * 100 + ')' : '');
                }
            } : undefined,

            'float': ieVersion ? 'styleFloat' : 'cssFloat'
        },

        __ECUI__HTMLPosition = {
            AFTERBEGIN: 'selectNodeContents',
            BEFOREEND: 'selectNodeContents',
            BEFOREBEGIN: 'setStartBefore',
            AFTEREND: 'setEndAfter'
        },

        __ECUI__EscapeCharacter = {
            quot: '"',
            lt: '<',
            gt: '>',
            amp: '&'
        };

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

    try {
        document.execCommand('BackgroundImageCache', false, true);
    } catch (ignore) {
    }

    try {
        new Function('let a')();
    } catch (e) {
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

    /**
     * 当前是否需要处理IOS软键盘。
     * @public
     *
     * @param {HTMLElement} target 用于判断的元素对象，如果为空使用 document.activeElement
     * @return {boolean} 是否需要处理IOS软键盘
     */
    util.hasIOSKeyboard = iosVersion ? function (target) {
        target = target || document.activeElement;
        return !(target.readOnly || target.tagName === 'SELECT' || (target.tagName === 'INPUT' && (target.type === 'radio' || target.type === 'checkbox')));
    } : function () {
        return false;
    };
//{if 0}//
    if (isToucher) {
        dom.addEventListener(document, 'contextmenu', function (event) {
            event.preventDefault();
        });
    }
//{/if}//
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
