/*
Panel - 定义在一个小区域内截取显示大区域内容的基本操作。
截面控件，继承自基础控件，内部包含三个部件，分别是垂直滚动条、水平滚动条与两个滚动条之间的夹角(基础控件)。截面控件的内
容区域可以超过控件实际大小，通过拖拽滚动条显示完整的内容，截面控件可以设置参数决定是否自动显示水平/垂直滚动条，如果设
置不显示水平/垂直滚动条，水平/垂直内容超出的部分将直接被截断，当设置两个滚动条都不显示时，层控件从显示效果上等同于基础
控件。在层控件上滚动鼠标滑轮，将控制层控件往垂直方向(如果没有垂直滚动条则在水平方向)前移或者后移滚动条，在获得焦点后，
通过键盘的方向键也可以操作层控件的滚动条。

层控件直接HTML初始化的例子:
<div ecui="type:panel;vertical-scroll:true;horizontal-scroll:true;wheel-delta:20;absolute:true">
    <!-- 这里放内容 -->
    ...
</div>

属性
_bAbsolute                - 是否包含绝对定位的Element
_nWheelDelta              - 鼠标滚轮滚动一次的差值
_eBrowser                 - 用于浏览器原生的滚动条实现的Element
_uVScroll                 - 垂直滚动条控件
_uHScroll                 - 水平滚动条控件
_uCorner                  - 夹角控件
$cache$layoutWidthRevise  - layout区域的宽度修正值
$cache$layoutHeightRevise - layout区域的高度修正值
$cache$mainWidth          - layout区域的实际宽度
$cache$mainHeight         - layout区域的实际高度
*/
//{if 0}//
(function () {

    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        MATH = Math,
        MAX = MATH.max,
        MIN = MATH.min,
        FLOOR = MATH.floor,

        createDom = dom.create,
        getParent = dom.getParent,
        getPosition = dom.getPosition,
        getStyle = dom.getStyle,
        moveElements = dom.moveElements,
        attachEvent = util.attachEvent,
        blank = util.blank,
        detachEvent = util.detachEvent,
        inherits = util.inherits,
        toNumber = util.toNumber,

        $fastCreate = core.$fastCreate,
        calcHeightRevise = core.calcHeightRevise,
        calcWidthRevise = core.calcWidthRevise,
        findControl = core.findControl,
        getKey = core.getKey,
        getScrollNarrow = core.getScrollNarrow,
        standardEvent = core.event,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_VSCROLL = ui.VScroll,
        UI_HSCROLL = ui.HScroll;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化浏览器原生滚动条控件。
     * @protected
     *
     * @param {Element} el 关联的 Element 对象
     * @param {Object} options 初始化选项
     */
    var UI_BROWSER_SCROLL =
        function (el, options) {
            UI_CONTROL.call(this, el, options);
            detachEvent(el, 'scroll', this.scroll);
            attachEvent(el, 'scroll', this.scroll);
        },
        UI_BROWSER_SCROLL_CLASS = inherits(UI_BROWSER_SCROLL, UI_CONTROL);
//{else}//
    /**
     * 隐藏控件。
     * @protected
     */
    UI_BROWSER_SCROLL_CLASS.$hide = UI_BROWSER_SCROLL_CLASS.hide = function () {
        this.getBase().style[this._aProperty[0]] = 'hidden';
        UI_BROWSER_SCROLL_CLASS.setValue.call(this, 0);
    };

    /**
     * 直接设置控件的当前值。
     * @protected
     *
     * @param {number} value 控件的当前值
     */
    UI_BROWSER_SCROLL_CLASS.$setValue = UI_BROWSER_SCROLL_CLASS.setValue = function (value) {
        this.getBase()[this._aProperty[1]] = MIN(MAX(0, value), this.getTotal());
    };

    /**
     * 显示控件。
     * @protected
     */
    UI_BROWSER_SCROLL_CLASS.$show = UI_BROWSER_SCROLL_CLASS.show = function () {
        this.getBase().style[this._aProperty[0]] = 'scroll';
    };

    /**
     * 获取控件区域的高度。
     * @public
     *
     * @return {number} 控件的高度
     */
    UI_BROWSER_SCROLL_CLASS.getHeight = function () {
        return this._aProperty[4] ? this.getBase()[this._aProperty[4]] : getScrollNarrow();
    };

    /**
     * 获取滚动条控件的最大值。
     * getTotal 方法返回滚动条控件允许滚动的最大值，最大值、当前值与滑动块控件的实际位置互相影响，通过 setTotal 设置。
     * @public
     *
     * @return {number} 控件的最大值
     */
    UI_BROWSER_SCROLL_CLASS.getTotal = function () {
        return toNumber(this.getBase().lastChild.style[this._aProperty[2]]);
    };

    /**
     * 获取滚动条控件的当前值。
     * getValue 方法返回滚动条控件的当前值，最大值、当前值与滑动块控件的实际位置互相影响，但是当前值不允许超过最大值，通过 setValue 方法设置。
     * @public
     *
     * @return {number} 滚动条控件的当前值
     */
    UI_BROWSER_SCROLL_CLASS.getValue = function () {
        return this.getBase()[this._aProperty[1]];
    };

    /**
     * 获取控件区域的宽度。
     * @public
     *
     * @return {number} 控件的宽度
     */
    UI_BROWSER_SCROLL_CLASS.getWidth = function () {
        return this._aProperty[3] ? this.getBase()[this._aProperty[3]] : getScrollNarrow();
    };

    /**
     * 判断控件是否处于显示状态。
     * @public
     *
     * @return {boolean} 控件是否显示
     */
    UI_BROWSER_SCROLL_CLASS.isShow = function () {
        return this.getBase().style[this._aProperty[0]] != 'hidden';
    };

    /**
     * 滚动条滚动。
     * scroll 方法首先调用 change 方法，之后触发父控件的 onscroll 事件，如果事件返回值不为 false，则调用父控件的 $scroll 方法。
     * @public
     */
    UI_BROWSER_SCROLL_CLASS.scroll = function (event) {
        event = findControl(standardEvent(event).target).getParent();
        if (!(event.onscroll && event.onscroll() === false)) {
            event.$scroll();
        }
    };

    /**
     * 设置滚动条控件的最大值。
     * setTotal 方法设置的值不能为负数，并且当前值如果大于最大值，将改变当前值，并调用 scroll 方法，最大值发生改变将导致滚动条控件刷新。
     * @public
     *
     * @param {number} value 控件的最大值
     */
    UI_BROWSER_SCROLL_CLASS.setTotal = function (value) {
        this.getBase().lastChild.style[this._aProperty[2]] = value + 'px';
    };

    UI_BROWSER_SCROLL_CLASS.$cache = UI_BROWSER_SCROLL_CLASS.$getPageStep =
        UI_BROWSER_SCROLL_CLASS.$init = UI_BROWSER_SCROLL_CLASS.$setPageStep =
        UI_BROWSER_SCROLL_CLASS.$setSize = UI_BROWSER_SCROLL_CLASS.alterClass = UI_BROWSER_SCROLL_CLASS.cache =
        UI_BROWSER_SCROLL_CLASS.getStep = UI_BROWSER_SCROLL_CLASS.setPosition =
        UI_BROWSER_SCROLL_CLASS.setStep = UI_BROWSER_SCROLL_CLASS.skip = blank;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化浏览器原生垂直滚动条控件。
     * @public
     *
     * @param {Element} el 关联的 Element 对象
     * @param {Object} options 初始化选项
     */
    var UI_BROWSER_VSCROLL =
        function (el, options) {
            UI_BROWSER_SCROLL.call(this, el, options);
            this._aProperty = ['overflowY', 'scrollTop', 'height', null, 'offsetHeight'];
        };
//{else}//
    inherits(UI_BROWSER_VSCROLL, UI_BROWSER_SCROLL);
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化浏览器原生水平滚动条控件。
     * @public
     *
     * @param {Element} el 关联的 Element 对象
     * @param {Object} options 初始化选项
     */
    var UI_BROWSER_HSCROLL =
        function (el, options) {
            UI_BROWSER_SCROLL.call(this, el, options);
            this._aProperty = ['overflowX', 'scrollLeft', 'width', 'offsetWidth', null];
        };
//{else}//
    inherits(UI_BROWSER_HSCROLL, UI_BROWSER_SCROLL);
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化夹角控件。
     * @public
     *
     * @param {Element} el 关联的 Element 对象
     * @param {Object} options 初始化选项
     */
    var UI_BROWSER_CORNER = blank,
        UI_BROWSER_CORNER_CLASS = inherits(UI_BROWSER_CORNER, UI_CONTROL);
//{else}//
    (function () {
        for (var name in UI_CONTROL_CLASS) {
            UI_BROWSER_CORNER_CLASS[name] = blank;
        }
    })();
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化层控件，层控件支持自动展现滚动条控件，允许指定需要自动展现的垂直或水平滚动条。
     * options 对象支持的属性如下：
     * vScroll    是否自动展现垂直滚动条，默认展现
     * hScroll    是否自动展现水平滚动条，默认展现
     * browser    是否使用浏览器原生的滚动条，默认使用模拟的滚动条
     * absolute   是否包含绝对定位的Element，默认不包含
     * wheelDelta 鼠标滚轮的步长，即滚动一次移动的最小步长单位，默认总步长(差值*步长)为不大于20像素的最大值
     * @public
     *
     * @param {Element} el 关联的 Element 对象
     * @param {Object} options 初始化选项
     */
    //__gzip_original__UI_PANEL
    var UI_PANEL =
        ui.Panel = function (el, options) {
            UI_CONTROL.call(this, el, options);

            //__gzip_original__baseClass
            var i = 0,
                baseClass = options.base,
                browser = options.browser,
                vscroll = options.vScroll !== false,
                hscroll = options.hScroll !== false,
                list = [
                    [vscroll, '_uVScroll', browser ? UI_BROWSER_VSCROLL : UI_VSCROLL],
                    [hscroll, '_uHScroll', browser ? UI_BROWSER_HSCROLL : UI_HSCROLL],
                    [vscroll && hscroll, '_uCorner', browser ? UI_BROWSER_CORNER : UI_CONTROL]
                ],
                o = createDom(
                    baseClass + '-main',
                    'position:absolute;top:0px;left:0px' + (hscroll ? ';white-space:nowrap' : '')
                );

            el.style.overflow = 'hidden';
            moveElements(el, o, true);

            el.innerHTML =
                (browser ?
                    '<div style="position:absolute;top:0px;left:0px;overflow:auto;padding:0px;border:0px">' +
                        '<div style="width:1px;height:1px;padding:0px;border:0px"></div></div>'
                    : (vscroll ?
                        '<div class="ec-vscroll ' + baseClass + '-vscroll" style="position:absolute"></div>' : '') +
                        (hscroll ?
                            '<div class="ec-hscroll ' + baseClass + '-hscroll" style="position:absolute"></div>'
                            : '') +
                        (vscroll && hscroll ?
                            '<div class="' + options.type + '-corner ' + baseClass +
                                '-corner" style="position:absolute"></div>'
                            : '')
                ) + '<div class="' + baseClass + '-layout" style="position:relative;overflow:hidden"></div>';

            this.$setBody(el.lastChild.appendChild(o));

            this._bAbsolute = options.absolute;
            this._nWheelDelta = options.wheelDelta;

            el = el.firstChild;
            if (browser) {
                this._eBrowser = el;
            }

            // 生成中心区域的Element层容器，滚动是通过改变容器的left与top属性实现
            for (; o = list[i++]; ) {
                if (o[0]) {
                    this[o[1]] = $fastCreate(o[2], el, this);
                    if (!browser) {
                        el = el.nextSibling;
                    }
                }
            }
        },
        UI_PANEL_CLASS = inherits(UI_PANEL, UI_CONTROL);
//{else}//
    /**
     * 计算控件的缓存。
     * 控件缓存部分核心属性的值，提高控件属性的访问速度，在子控件或者应用程序开发过程中，如果需要避开控件提供的方法(setSize、alterClass 等)直接操作 Element 对象，操作完成后必须调用 clearCache 方法清除控件的属性缓存，否则将引发错误。
     * @protected
     *
     * @param {CssStyle} style 基本 Element 对象的 Css 样式对象
     * @param {boolean} cacheSize 是否需要缓存控件大小，如果控件是另一个控件的部件时，不缓存大小能加快渲染速度，默认缓存
     */
    UI_PANEL_CLASS.$cache = function (style, cacheSize) {
        UI_CONTROL_CLASS.$cache.call(this, style, cacheSize);

        var body = this.getBody(),
            mainWidth = body.offsetWidth,
            mainHeight = body.offsetHeight;

        style = getStyle(getParent(body));
        this.$cache$layoutWidthRevise = calcWidthRevise(style);
        this.$cache$layoutHeightRevise = calcHeightRevise(style);

        // 考虑到内部Element绝对定位的问题，中心区域的宽度与高度修正
        if (this._bAbsolute) {
            for (
                var i = 0,
                    list = body.all || body.getElementsByTagName('*'),
                    pos = getPosition(body);
                // 以下使用 body 代替临时的 DOM 节点对象
                body = list[i++];
            ) {
                if (body.offsetWidth && getStyle(body, 'position') == 'absolute') {
                    style = getPosition(body);
                    mainWidth = MAX(mainWidth, style.left - pos.left + body.offsetWidth);
                    mainHeight = MAX(mainHeight, style.top - pos.top + body.offsetHeight);
                }
            }
        }

        this.$cache$mainWidth = mainWidth;
        this.$cache$mainHeight = mainHeight;

        if (this._uVScroll) {
             this._uVScroll.cache(true, true);
        }
        if (this._uHScroll) {
             this._uHScroll.cache(true, true);
        }
        if (this._uCorner) {
            this._uCorner.cache(true, true);
        }
    };

    /**
     * 销毁控件的默认处理。
     * 页面卸载时将销毁所有的控件，释放循环引用，防止在 IE 下发生内存泄漏，$dispose 方法的调用不会受到 ondispose 事件返回值的影响。
     * @protected
     */
    UI_PANEL_CLASS.$dispose = function () {
        this._eBrowser = null;
        UI_CONTROL_CLASS.$dispose.call(this);
    };

    /**
     * 控件渲染完成后初始化的默认处理。
     * $init 方法在控件渲染完成后调用，参见 create 与 init 方法。
     * @protected
     */
    UI_PANEL_CLASS.$init = function () {
        if (this._uVScroll) {
            this._uVScroll.$init();
        }
        if (this._uHScroll) {
            this._uHScroll.$init();
        }
        if (this._uCorner) {
            this._uCorner.$init();
        }
        UI_CONTROL_CLASS.$init.call(this);
    };

    /**
     * 控件拥有焦点时，键盘按压事件的默认处理。Opera 下仅用 keydown 不能屏蔽方向键事件，还需要在 keypress 中屏蔽。
     * 如果控件处于可操作状态(参见 isEnabled)，keydown/keypress 方法触发 onkeydown/onkeypress 事件，如果事件返回值不为 false，则调用 $keydown/$keypress 方法。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_PANEL_CLASS.$keydown = UI_PANEL_CLASS.$keypress = function (event) {
        var which = getKey(),
            scroll = which % 2 ? this._uHScroll : this._uVScroll;

        if (which >= 37 && which <= 40 && !event.target.value) {
            if (scroll) {
                scroll.skip(which + which % 2 - 39);
            }
            return false;
        }
    };

    /**
     * 鼠标在控件区域滚动滚轮事件的默认处理。
     * 如果有垂直滚动条，则垂直滚动条随滚轮滚动。如果控件处于可操作状态(参见 isEnabled)，mousewheel 方法触发 onmousewheel 事件，如果事件返回值不为 false，则调用 $mousewheel 方法。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_PANEL_CLASS.$mousewheel = function (event) {
        scroll = this._uVScroll;

        if (scroll && scroll.isShow()) {
            // 计算滚动的次数，至少要滚动一次
            var value = scroll.getValue(),
                delta = this._nWheelDelta || FLOOR(20 / scroll.getStep()) || 1,
                scroll;

            scroll.skip(event.detail > 0 ? delta : -delta);
            return value == scroll.getValue();
        }
    };

    /**
     * 控件的滚动条发生滚动的默认处理。
     * 如果控件包含滚动条，滚动条滚动时触发 onscroll 事件，如果事件返回值不为 false，则调用 $scroll 方法。
     * @protected
     */
    UI_PANEL_CLASS.$scroll = function () {
        var style = this.getBody().style;
        style.left = -MAX(this.getScrollLeft(), 0) + 'px';
        style.top = -MAX(this.getScrollTop(), 0) + 'px';
    };

    /**
     * 设置控件的大小。
     * $setSize 方法设置控件实际的大小，不改变其它的如缓存等信息。
     * @protected
     *
     * @param {number} width 宽度，如果不需要设置则将参数设置为等价于逻辑非的值
     * @param {number} height 高度，如果不需要设置则省略此参数
     */
    UI_PANEL_CLASS.$setSize = function (width, height) {
        UI_CONTROL_CLASS.$setSize.call(this, width, height);
        this.$locate();

        var paddingWidth = this.$cache$paddingLeft + this.$cache$paddingRight,
            paddingHeight = this.$cache$paddingTop + this.$cache$paddingBottom,
            bodyWidth = this.getBodyWidth(),
            bodyHeight = this.getBodyHeight(),
            mainWidth = this.$cache$mainWidth,
            mainHeight = this.$cache$mainHeight,
            browser = this._eBrowser,
            vscroll = this._uVScroll,
            hscroll = this._uHScroll,
            corner = this._uCorner,
            vsWidth = vscroll && vscroll.getWidth(),
            hsHeight = hscroll && hscroll.getHeight(),
            innerWidth = bodyWidth - vsWidth,
            innerHeight = bodyHeight - hsHeight,
            hsWidth = innerWidth + paddingWidth,
            vsHeight = innerHeight + paddingHeight;

        // 设置垂直与水平滚动条与夹角控件的位置
        if (vscroll) {
            vscroll.setPosition(hsWidth, 0);
        }
        if (hscroll) {
            hscroll.setPosition(0, vsHeight);
        }
        if (corner) {
            corner.setPosition(hsWidth, vsHeight);
        }

        if (mainWidth <= bodyWidth && mainHeight <= bodyHeight) {
            // 宽度与高度都没有超过层控件的宽度与高度，不需要显示滚动条
            if (vscroll) {
                vscroll.$hide();
            }
            if (hscroll) {
                hscroll.$hide();
            }
            if (corner) {
                corner.$hide();
            }
            innerWidth = bodyWidth;
            innerHeight = bodyHeight;
        }
        else {
            while (true) {
                if (corner) {
                    // 宽度与高度都超出了显示滚动条后余下的宽度与高度，垂直与水平滚动条同时显示
                    if (mainWidth > innerWidth && mainHeight > innerHeight) {
                        hscroll.$setSize(hsWidth);
                        hscroll.setTotal(mainWidth - (browser ? 0 : innerWidth));
                        hscroll.$show();
                        vscroll.$setSize(0, vsHeight);
                        vscroll.setTotal(mainHeight - (browser ? 0 : innerHeight));
                        vscroll.$show();
                        corner.$setSize(vsWidth, hsHeight);
                        corner.$show();
                        break;
                    }
                    corner.$hide();
                }
                if (hscroll) {
                    if (mainWidth > bodyWidth) {
                        // 宽度超出控件的宽度，高度没有超出显示水平滚动条后余下的高度，只显示水平滚动条
                        hscroll.$setSize(bodyWidth + paddingWidth);
                        hscroll.setTotal(mainWidth - (browser ? 0 : bodyWidth));
                        hscroll.$show();
                        if (vscroll) {
                            vscroll.$hide();
                        }
                        innerWidth = bodyWidth;
                    }
                    else {
                        hscroll.$hide();
                    }
                }
                if (vscroll) {
                    if (mainHeight > bodyHeight) {
                        // 高度超出控件的高度，宽度没有超出显示水平滚动条后余下的宽度，只显示水平滚动条
                        vscroll.$setSize(0, bodyHeight + paddingHeight);
                        vscroll.setTotal(mainHeight - (browser ? 0 : bodyHeight));
                        vscroll.$show();
                        if (hscroll) {
                            hscroll.$hide();
                        }
                        innerHeight = bodyHeight;
                    }
                    else {
                        vscroll.$hide();
                    }
                }
                break;
            }
        }

        innerWidth -= this.$cache$layoutWidthRevise;
        innerHeight -= this.$cache$layoutHeightRevise;

        if (vscroll) {
            vscroll.$setPageStep(innerHeight);
        }
        if (hscroll) {
            hscroll.$setPageStep(innerWidth);
        }
    
        // 设置内部定位器的大小，以下使用 corner 表示 style
        if (browser) {
            corner = browser.style;
            corner.width = bodyWidth + paddingWidth + 'px';
            corner.height = bodyHeight + paddingHeight + 'px';
        }

        corner = getParent(this.getBody()).style;
        corner.width = innerWidth + 'px';
        corner.height = innerHeight + 'px';
    };

    /**
     * 获取水平滚动条的当前值。
     * getScrollLeft 方法提供了对水平滚动条当前值的快捷访问方式，参见 getValue。
     * @public
     *
     * @return {number} 水平滚动条的当前值，如果没有水平滚动条返回-1
     */
    UI_PANEL_CLASS.getScrollLeft = function () {
        var scroll = this._uHScroll;
        return scroll ? scroll.getValue() : -1;
    };

    /**
     * 获取垂直滚动条的当前值。
     * getScrollTop 方法提供了对水平滚动条当前值的快捷访问方式，参见 getValue。
     * @public
     *
     * @return {number} 垂直滚动条的当前值，如果没有垂直滚动条返回-1
     */
    UI_PANEL_CLASS.getScrollTop = function () {
        var scroll = this._uVScroll;
        return scroll ? scroll.getValue() : -1;
    };
//{/if}//
//{if 0}//
})();
//{/if}//