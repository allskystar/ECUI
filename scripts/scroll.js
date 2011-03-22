/*
Scroll - 定义在一个区间轴内移动的基本操作。
滚动条控件，继承自基础控件，滚动条控件，内部包含三个部件，分别是向前(滚动条的当前值变小)滚动按钮(基础控件)、向后(滚动
条的当前值变大)滚动按钮(基础控件)与滑动块(基础控件)。滚动条控件是滚动行为的虚拟实现，不允许直接初始化，它的子类通常情
况下也不会被直接初始化，而是作为控件的一部分用于控制父控件的行为。

属性
_nTotal         - 滚动条区域允许设置的最大值
_nStep          - 滚动条移动一次时的基本步长
_nValue         - 滚动条当前设置的值
_oStop          - 定时器的句柄，用于连续滚动处理
_cButton        - 当前正在执行动作的按钮，用于连续滚动的控制
_uPrev          - 向前滚动按钮
_uNext          - 向后滚动按钮
_uBlock         - 滑动块

滑动块属性
_oRange         - 滑动块的合法滑动区间
*/
//{if 0}//
(function () {

    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        MATH = Math,
        FLOOR = MATH.floor,
        MAX = MATH.max,
        MIN = MATH.min,

        children = dom.children,
        copy = util.copy,
        inherits = util.inherits,
        timer = util.timer,

        $fastCreate = core.$fastCreate,
        drag = core.drag,
        getMouseX = core.getMouseX,
        getMouseY = core.getMouseY,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化滚动条控件。
     * @protected
     *
     * @param {Element} el 关联的 Element 对象
     * @param {Object} params 初始化参数
     */
    //__gzip_original__UI_SCROLL
    //__gzip_original__UI_SCROLL_BLOCK
    //__gzip_original__UI_SCROLL_BUTTON
    //__gzip_original__UI_VSCROLL
    //__gzip_original__UI_HSCROLL
    var UI_SCROLL =
        ui.Scroll = function (el, params) {
            //__gzip_original__baseClass
            //__gzip_original__typeClass
            //__gzip_original__partParams
            var baseClass = params.base,
                typeClass = params.type,
                partParams = {select: false, focus: false};

            UI_CONTROL.call(this, el, copy(params, partParams));

            el.innerHTML =
                '<div class="' + typeClass + '-prev ' +
                    baseClass + '-prev" style="position:absolute;top:0px;left:0px"></div><div class="' +
                    typeClass + '-next ' +
                    baseClass + '-next" style="position:absolute;top:0px;left:0px"></div><div class="' +
                    typeClass + '-block ' +
                    baseClass + '-block" style="position:absolute"></div>';

            // 使用 el 代替 children
            el = children(el);

            // 初始化滚动条控件
            this._nValue = this._nTotal = 0;
            this._nStep = 1;

            // 创建向前/向后滚动按钮与滑动块
            this._uPrev = $fastCreate(UI_SCROLL_BUTTON, el[0], this, partParams);
            this._uNext = $fastCreate(UI_SCROLL_BUTTON, el[1], this, partParams);
            this._uBlock = $fastCreate(UI_SCROLL_BLOCK, el[2], this, partParams);
        },
        UI_SCROLL_CLASS = inherits(UI_SCROLL, UI_CONTROL),

        /**
         * 初始化滚动条控件的滑动块部件。
         * @protected
         *
         * @param {Element} el 关联的 Element 对象
         * @param {Object} params 初始化参数
         */
        UI_SCROLL_BLOCK = UI_SCROLL.Block = function (el, params) {
            UI_CONTROL.call(this, el, params);
        },
        UI_SCROLL_BLOCK_CLASS = inherits(UI_SCROLL_BLOCK, UI_CONTROL),

        /**
         * 初始化滚动条控件的按钮部件。
         * @protected
         *
         * @param {Element} el 关联的 Element 对象
         * @param {Object} params 初始化参数
         */
        UI_SCROLL_BUTTON = UI_SCROLL.Button = function (el, params) {
            UI_CONTROL.call(this, el, params);
        },
        UI_SCROLL_BUTTON_CLASS = inherits(UI_SCROLL_BUTTON, UI_CONTROL);
//{else}//
    /**
     * 控扭控件自动滚动。
     * @private
     *
     * @param {ecui.ui.Scroll.Button} button 触发滚动的按钮
     * @param {number} step 单次滚动步长
     * @param {number} interval 触发时间间隔，默认50ms
     */
    function UI_SCROLL_MOVE(button, step, interval) {
        //__gzip_original__value
        var scroll = button.getParent(),
            value = scroll._nValue,
            isPrev = scroll._uPrev == button;

        if (scroll._oStop) {
            scroll._oStop();
        }

        if (isPrev && value || !isPrev && value < scroll._nTotal) {
            if (isPrev) {
                if (scroll.$allowPrev()) {
                    scroll.setValue(value - step);
                }
            }
            else {
                if (scroll.$allowNext()) {
                    scroll.setValue(value + step);
                }
            }
            scroll._oStop = timer(UI_SCROLL_MOVE, interval || 200, null, button, step, 40);
        }
    }

    /**
     * 滑动块拖拽移动事件的默认处理。
     * @protected
     *
     * @param {Event} event 事件对象
     * @param {number} x 滑动块实际到达的X轴坐标
     * @param {number} y 滑动块实际到达的Y轴坐标
     */
    UI_SCROLL_BLOCK_CLASS.$dragmove = function (event, x, y) {
        UI_CONTROL_CLASS.$dragmove.call(this, event, x, y);

        var parent = this.getParent(),
            value = parent.$calcDragValue(x, y);

        // 应该滚动step的整倍数
        parent.$setValue(value == parent._nTotal ? value : value - value % parent._nStep);
        parent.scroll();
    };

    /**
     * 鼠标在滑动块区域内按压开始事件的默认处理，触发滑动块拖动功能。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_SCROLL_BLOCK_CLASS.$pressstart = function (event) {
        UI_CONTROL_CLASS.$pressstart.call(this, event);

        drag(this, event, this._oRange);
    };

    /**
     * 设置滑动块的合法拖拽区间。
     * @public
     *
     * @param {number} top 允许拖拽的最上部区域
     * @param {number} right 允许拖拽的最右部区域
     * @param {number} bottom 允许拖拽的最下部区域
     * @param {number} left 允许拖拽的最左部区域
     */
    UI_SCROLL_BLOCK_CLASS.setRange = function (top, right, bottom, left) {
        this._oRange = {
            top: top,
            right: right,
            bottom: bottom,
            left: left
        };
    };

    /**
     * 控扭控件按压状态结束事件与控扭控件按压状态中鼠标移出控件区域事件的默认处理。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_SCROLL_BUTTON_CLASS.$pressend = UI_SCROLL_BUTTON_CLASS.$pressout = function (event) {
        UI_CONTROL_CLASS[event.type == 'mouseup' ? '$pressend' : '$pressout'].call(this, event);
        this.getParent()._oStop();
    };

    /**
     * 控扭控件按压状态中鼠标移入控件区域事件与控扭控件按压状态开始事件的默认处理。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_SCROLL_BUTTON_CLASS.$pressover = UI_SCROLL_BUTTON_CLASS.$pressstart = function (event) {
        UI_CONTROL_CLASS[event.type == 'mousedown' ? '$pressstart' : '$pressover'].call(this, event);
        UI_SCROLL_MOVE(this, MAX(this.getParent()._nStep, 5));
    };

    /**
     * 计算控件的缓存。
     * 控件缓存部分核心属性的值，提高控件属性的访问速度，在子控件或者应用程序开发过程中，如果需要避开控件提供的方法(setSize、alterClass 等)直接操作 Element 对象，操作完成后必须调用 clearCache 方法清除控件的属性缓存，否则将引发错误。
     * @protected
     *
     * @param {CssStyle} style 基本 Element 对象的 Css 样式对象
     * @param {boolean} cacheSize 是否需要缓存控件大小，如果控件是另一个控件的部件时，不缓存大小能加快渲染速度，默认缓存
     */
    UI_SCROLL_CLASS.$cache = function (style, cacheSize) {
        UI_CONTROL_CLASS.$cache.call(this, style, cacheSize);

        this._uPrev.cache(true, true);
        this._uNext.cache(true, true);
        this._uBlock.cache(true, true);
    };

    /**
     * 隐藏控件。
     * 隐藏滚动条控件时，滚动条控件的当前值需要复位为0，参见 setValue 与 setTotal 方法。
     * @protected
     */
    UI_SCROLL_CLASS.$hide = function () {
        UI_CONTROL_CLASS.$hide.call(this);
        UI_SCROLL_CLASS.setValue.call(this, 0);
    };

    /**
     * 控件渲染完成后初始化的默认处理。
     * $init 方法在控件渲染完成后调用，参见 create 与 init 方法。
     * @protected
     */
    UI_SCROLL_CLASS.$init = function () {
        UI_CONTROL_CLASS.$init.call(this);
        this._uPrev.$init();
        this._uNext.$init();
        this._uBlock.$init();
    };

    /**
     * 控件按压状态结束事件与控件按压状态中鼠标移出控件区域事件的默认处理。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_SCROLL_CLASS.$pressend = UI_SCROLL_CLASS.$pressout = function (event) {
        UI_CONTROL_CLASS[event.type == 'mouseup' ? '$pressend' : '$pressout'].call(this, event);
        this._oStop();
    };

    /**
     * 控件按压状态中鼠标移入控件区域事件与控件按压状态开始事件的默认处理。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_SCROLL_CLASS.$pressover = UI_SCROLL_CLASS.$pressstart = function (event) {
        UI_CONTROL_CLASS[event.type == 'mousedown' ? '$pressstart' : '$pressover'].call(this, event);
        UI_SCROLL_MOVE(
            event.type == 'mousedown' ? this._cButton = this.$allowPrev() ? this._uPrev : this._uNext : this._cButton,
            this.$getPageStep()
        );
    };

    /**
     * 设置滚动条控件的单页滚动距离。
     * @protected
     *
     * @param {number} value 单页滚动距离
     */
    UI_SCROLL_CLASS.$setPageStep = function (value) {
        this._nPageStep = value;
    };

    /**
     * 设置滚动条控件的大小。
     * @protected
     *
     * @param {number} width 控件区域的宽度
     * @param {number} height 控件区域的高度
     */
    UI_SCROLL_CLASS.$setSize = function (width, height) {
        UI_CONTROL_CLASS.$setSize.call(this, width, height);
        this.$locate();
    };

    /**
     * 直接设置控件的当前值。
     * $setValue 仅仅设置控件的参数值，不进行合法性验证，也不改变滑动块的位置信息，用于滑动块滚动时同步设置当前值。
     * @protected
     *
     * @param {number} value 控件的当前值
     */
    UI_SCROLL_CLASS.$setValue = function (value) {
        this._nValue = value;
    };

    /**
     * 获取滚动条控件的单次滚动距离。
     * getStep 方法返回滚动条控件发生滚动时，移动的最小步长值，通过 setStep 设置。
     * @public
     *
     * @return {number} 单次滚动距离
     */
    UI_SCROLL_CLASS.getStep = function () {
        return this._nStep;
    };

    /**
     * 获取滚动条控件的最大值。
     * getTotal 方法返回滚动条控件允许滚动的最大值，最大值、当前值与滑动块控件的实际位置互相影响，通过 setTotal 设置。
     * @public
     *
     * @return {number} 控件的最大值
     */
    UI_SCROLL_CLASS.getTotal = function () {
        return this._nTotal;
    };

    /**
     * 获取滚动条控件的当前值。
     * getValue 方法返回滚动条控件的当前值，最大值、当前值与滑动块控件的实际位置互相影响，但是当前值不允许超过最大值，通过 setValue 方法设置。
     * @public
     *
     * @return {number} 滚动条控件的当前值
     */
    UI_SCROLL_CLASS.getValue = function () {
        return this._nValue;
    };

    /**
     * 滚动条滚动。
     * scroll 方法首先调用 change 方法，之后触发父控件的 onscroll 事件，如果事件返回值不为 false，则调用父控件的 $scroll 方法。
     * @public
     */
    UI_SCROLL_CLASS.scroll = function () {
        var parent = this.getParent();
        if (parent) {
            if (!(parent.onscroll && parent.onscroll() === false)) {
                parent.$scroll();
            }
        }
    };

    /**
     * 设置滚动条控件的单次滚动距离。
     * setStep 方法设置的值必须大于0，否则不会进行操作。
     * @public
     *
     * @param {number} value 单次滚动距离
     */
    UI_SCROLL_CLASS.setStep = function (value) {
        if (value > 0) {
            this._nStep = value;
        }
    };

    /**
     * 设置滚动条控件的最大值。
     * setTotal 方法设置的值不能为负数，并且当前值如果大于最大值，将改变当前值，并调用 scroll 方法，最大值发生改变将导致滚动条控件刷新。
     * @public
     *
     * @param {number} value 控件的最大值
     */
    UI_SCROLL_CLASS.setTotal = function (value) {
        if (value >= 0 && this._nTotal != value) {
            this._nTotal = value;
            // 检查滚动条控件的当前值是否已经越界
            if (this._nValue > value) {
                // 值发生改变时触发相应的事件
                this._nValue = value;
                this.scroll();
            }
            this.$flush();
        }
    };

    /**
     * 设置滚动条控件的当前值。
     * setValue 方法设置的值不能为负数，也不允许超过使用 setTotal 方法设置的控件的最大值，如果当前值不合法，将自动设置为最接近合法值的数值，如果当前值发生改变将导致滚动条控件刷新，并调用 scroll 方法。
     * @public
     *
     * @param {number} value 控件的当前值
     */
    UI_SCROLL_CLASS.setValue = function (value) {
        value = MIN(MAX(0, value), this._nTotal);
        if (this._nValue != value) {
            // 值发生改变时触发相应的事件
            this._nValue = value;
            this.scroll();
            this.$flush();
        }
    };

    /**
     * 滚动条控件当前值移动指定的步长次数。
     * 参数 value 必须是整数, 正数则向最大值方向移动，负数则向0方向移动，允许移动的区间在0-最大值之间，参见 setStep、setTotal 与 setValue 方法。
     * @public
     *
     * @param {number} n 移动的步长次数
     */
    UI_SCROLL_CLASS.skip = function (n) {
        this.setValue(this._nValue + n * this._nStep);
    };
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化垂直滚动条控件。
     * @public
     *
     * @param {Element} el 关联的 Element 对象
     * @param {Object} params 初始化参数
     */
    var UI_VSCROLL = ui.VScroll = function (el, params) {
            UI_SCROLL.call(this, el, params);
        },

        UI_VSCROLL_CLASS = inherits(UI_VSCROLL, UI_SCROLL);
//{else}//
    /**
     * 判断是否允许当前值向最大值方向移动。
     * 受当前鼠标位置的影响，在当前值向最大值方向移动的过程中需要先判断移动是否得到许可。
     * @protected
     *
     * @return {boolean} 是否允许向最大值方向移动
     */
    UI_VSCROLL_CLASS.$allowNext = function () {
        return getMouseY(this) > this._uBlock.getY() + this._uBlock.getHeight();
    };

    /**
     * 判断是否允许当前值向0方向移动。
     * 受当前鼠标位置的影响，在当前值向0方向移动的过程中需要先判断移动是否得到许可。
     * @protected
     *
     * @return {boolean} 是否允许向0方向移动
     */
    UI_VSCROLL_CLASS.$allowPrev = function () {
        return getMouseY(this) < this._uBlock.getY();
    };

    /**
     * 计算滑动块拖拽时滚动条的当前值。
     * 虚方法，继承自滚动条控件的控件必须实现。
     * @protected
     *
     * @param {number} x 滑动块实际到达的X轴坐标
     * @param {number} y 滑动块实际到达的Y轴坐标
     */
    UI_VSCROLL_CLASS.$calcDragValue = function (x, y) {
        //__gzip_original__range
        var block = this._uBlock,
            range = block._oRange;
        return (y - range.top) / (range.bottom - this._uPrev.getHeight() - block.getHeight()) * this._nTotal;
    };

    /**
     * 垂直滚动条控件刷新。
     * 滚动条控件的大小，最大值/当前值发生变化时，调用 $flash 方法刷新滑动块的大小与位置。
     * @protected
     */
    UI_VSCROLL_CLASS.$flush = function () {
        // 计算滑动块高度与位置
        var block = this._uBlock,
            total = this._nTotal,
            height = this.getHeight(),
            prevHeight = this._uPrev.getHeight(),
            bodyHeight = this.getBodyHeight(),
            blockHeight = MAX(FLOOR(bodyHeight * height / (height + total)), block.getInvalidHeight() + 5);

        if (total) {
            block.$setSize(0, blockHeight);
            block.setPosition(0, prevHeight + FLOOR((this._nValue / total) * (bodyHeight - blockHeight)));
            block.setRange(prevHeight, 0, bodyHeight + prevHeight, 0);
        }
    };

    /**
     * 获取一页的步长。
     * $getPageStep 方法根据 getStep 方法获取的步长，计算父控件一页的步长的大小，一页的步长一定是滚动条控件步长的整数倍。
     * @protected
     *
     * @return {number} 一页的步长
     */
    UI_VSCROLL_CLASS.$getPageStep = function () {
        var height = this.getHeight();
        return this._nPageStep || height - height % this._nStep;
    };

    /**
     * 设置垂直滚动条控件的大小。
     * @protected
     *
     * @param {number} width 控件区域的宽度
     * @param {number} height 控件区域的高度
     */
    UI_VSCROLL_CLASS.$setSize = function (width, height) {
        UI_SCROLL_CLASS.$setSize.call(this, width, height);

        //__gzip_original__next
        var bodyWidth = this.getBodyWidth(),
            prevHeight = this.$cache$paddingTop,
            next = this._uNext;

        // 设置滚动按钮与滑动块的信息
        this._uPrev.$setSize(bodyWidth, prevHeight);
        next.$setSize(bodyWidth, this.$cache$paddingBottom);
        this._uBlock.$setSize(bodyWidth);
        next.setPosition(0, this.getBodyHeight() + prevHeight);

        this.$flush();
    };
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化水平滚动条控件。
     * @public
     *
     * @param {Element} el 关联的 Element 对象
     * @param {Object} params 初始化参数
     */
    var UI_HSCROLL = ui.HScroll = function (el, params) {
            UI_SCROLL.call(this, el, params);
        },

        UI_HSCROLL_CLASS = inherits(UI_HSCROLL, UI_SCROLL);
//{else}//
    /**
     * 判断是否允许当前值向最大值方向移动。
     * 受当前鼠标位置的影响，在当前值向最大值方向移动的过程中需要先判断移动是否得到许可。
     * @protected
     *
     * @return {boolean} 是否允许向最大值方向移动
     */
    UI_HSCROLL_CLASS.$allowNext = function () {
        return getMouseX(this) > this._uBlock.getX() + this._uBlock.getWidth();
    };

    /**
     * 判断是否允许当前值向0方向移动。
     * 受当前鼠标位置的影响，在当前值向0方向移动的过程中需要先判断移动是否得到许可。
     * @protected
     *
     * @return {boolean} 是否允许向0方向移动
     */
    UI_HSCROLL_CLASS.$allowPrev = function () {
        return getMouseX(this) < this._uBlock.getX();
    };

    /**
     * 计算滑动块拖拽时滚动条的当前值。
     * 虚方法，继承自滚动条控件的控件必须实现。
     * @protected
     *
     * @param {number} x 滑动块实际到达的X轴坐标
     * @param {number} y 滑动块实际到达的Y轴坐标
     */
    UI_HSCROLL_CLASS.$calcDragValue = function (x, y) {
        //__gzip_original__range
        var block = this._uBlock,
            range = block._oRange;
        return (x - range.left) / (range.right - this._uPrev.getWidth() - block.getWidth()) * this._nTotal;
    };

    /**
     * 水平滚动条控件刷新。
     * 滚动条控件的大小，最大值/当前值发生变化时，调用 $flash 方法刷新滑动块的大小与位置。
     * @protected
     */
    UI_HSCROLL_CLASS.$flush = function () {
        // 计算滑动块高度与位置
        var block = this._uBlock,
            total = this._nTotal,
            width = this.getWidth(),
            prevWidth = this._uPrev.getWidth(),
            bodyWidth = this.getBodyWidth(),
            blockWidth = MAX(FLOOR(bodyWidth * width / (width + total)), block.getInvalidWidth() + 5);

        if (total) {
            block.$setSize(blockWidth);
            block.setPosition(prevWidth + FLOOR((this._nValue / total) * (bodyWidth - blockWidth)), 0);
            block.setRange(0, bodyWidth + prevWidth, 0, prevWidth);
        }
    };

    /**
     * 获取一页的步长。
     * $getPageStep 方法根据 getStep 方法获取的步长，计算父控件一页的步长的大小，一页的步长一定是滚动条控件步长的整数倍。
     * @protected
     *
     * @return {number} 一页的步长
     */
    UI_HSCROLL_CLASS.$getPageStep = function () {
        var width = this.getWidth();
        return width - width % this._nStep;
    };

    /**
     * 设置水平滚动条控件的大小。
     * @protected
     *
     * @param {number} width 控件区域的宽度
     * @param {number} height 控件区域的高度
     */
    UI_HSCROLL_CLASS.$setSize = function (width, height) {
        UI_SCROLL_CLASS.$setSize.call(this, width, height);

        //__gzip_original__next
        var bodyHeight = this.getBodyHeight(),
            prevWidth = this.$cache$paddingLeft,
            next = this._uNext;

        // 设置滚动按钮与滑动块的信息
        this._uPrev.$setSize(prevWidth, bodyHeight);
        next.$setSize(this.$cache$paddingRight, bodyHeight);
        this._uBlock.$setSize(0, bodyHeight);
        next.setPosition(this.getBodyWidth() + prevWidth, 0);

        this.$flush();
    };
//{/if}//
//{if 0}//
})();
//{/if}//