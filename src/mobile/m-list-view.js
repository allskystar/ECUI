/*
@example
<ul ui="type:m-list-view">
  <li>单条数据内容</li>
  ...
</ul>

@fields
_eHeader       - 顶部 DOM 元素
_eFooter       - 底部 DOM 元素
_sStatus       - 控件当前状态
_nTopHidden    - 上部隐藏区域高度
_nBottomHidden - 下部隐藏区域高度
_nTopIndex     - 上部隐藏的选项序号
_nBottomIndex  - 下部隐藏的选项序号
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        effect = core.effect,
        ui = core.ui,
        util = core.util,

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
//{/if}//
    function setEnterAndLeave() {
        var range = this.getRange();
        if (range && range.bottom) {
            range.top = Math.min(0, this.getHeight() - this.$$bodyHeight);
            range.bottom = 0;
        }
    }

    function setComplete() {
        var range = this.getRange(),
            scrollRange = this.getScrollRange();
        range.top = scrollRange.top;
        range.bottom = scrollRange.bottom;
    }

    /**
     * 移动端列表展示控件。
     * @control
     */
    ui.MListView = core.inherits(
        ui.Control,
        'ui-mobile-listview',
        [
            function (el, options) {
                var body = this.getBody();
                this._eHeader = dom.insertBefore(dom.create({className: options.classes.join('-header ')}), body);
                this._eFooter = dom.insertAfter(dom.create({className: options.classes.join('-footer ')}), body);
                dom.insertAfter(this._eEmpty, body);
                this._oHandle = util.blank;
            },
            function (el, options) {
                if (options.customEmpty) {
                    dom.addClass(this._eEmpty = dom.remove(dom.last(el)), options.classes.join('-empty-body '));
                } else {
                    this._eEmpty = dom.create({className: options.classes.join('-empty-body ')});
                }
                ui.Control.call(this, el, options);
            }
        ],
        {
            HTML_LOADING: '正在加载...',
            HTML_REFRESH: '下拉刷新',
            HTML_PREPARE: '准备刷新',
            HTML_REFRESHED: '刷新完成',
            HTML_LOADED: '加载完成',
            HTML_NODATA: '没有更多数据',

            /**
             * 选项部件
             * @unit
             */
            Item: core.inherits(ui.Item),

            /**
             * @override
             */
            $alterItems: function () {
                // 第一次进来使用缓存的数据，第二次进来取实际数据
                if (this.isReady()) {
                    var items = this.getItems(),
                        body = this.getBody();

                    this.alterStatus(items.length ? '-empty' : '+empty');
                    this.$$bodyHeight = body.offsetHeight + this._nTopHidden + this._nBottomHidden;
                    items.map(function (item) {
                        item.cache();
                        return item.getOuter().offsetWidth ? item : null;
                    }).forEach(function (item, index) {
                        if (item) {
                            if (index < this._nTopIndex) {
                                item.hide();
                                this._nTopIndex++;
                                this._nTopHidden += item.getHeight();
                                this._nBottomIndex++;
                            } else if (index > this._nBottomIndex) {
                                item.hide();
                                this._nBottomHidden += item.getHeight();
                            } else if (index === this._nBottomIndex) {
                                this._nBottomIndex++;
                            }
                        }
                    }, this);
                }
                // 解决items不够填充整个listview区域
                var top = Math.min(0, this.getHeight() - this.$$bodyHeight);
                this.setScrollRange(
                    {
                        left: 0,
                        right: 0,
                        top: top ? top - this.$$footerHeight : 0,
                        bottom: this.$$headerHeight
                    }
                );
                this.setRange(
                    {
                        top: top,
                        bottom: 0
                    }
                );
                if (this.isReady()) {
                    var y = this.getY();
                    if (y <= top || (y > 0 && !top)) {
                        this.setPosition(0, top);
                    }
                }
            },

            /**
             * @override
             */
            $cache: function (style) {
                ui.Control.prototype.$cache.call(this, style);
                var body = this.getBody();
                style = dom.getStyle(body);
                if (ieVersion < 8) {
                    var list = style.padding.split(' ');
                    this.$$bodyPadding = [util.toNumber(list[0])];
                    this.$$bodyPadding[1] = list[1] ? util.toNumber(list[1]) : this.$$bodyPadding[0];
                    this.$$bodyPadding[2] = list[2] ? util.toNumber(list[2]) : this.$$bodyPadding[0];
                    this.$$bodyPadding[3] = list[3] ? util.toNumber(list[3]) : this.$$bodyPadding[1];
                } else {
                    this.$$bodyPadding = [util.toNumber(style.paddingTop), util.toNumber(style.paddingRight), util.toNumber(style.paddingBottom), util.toNumber(style.paddingLeft)];
                }
                this.$$headerHeight = this._eHeader.offsetHeight;
                this.$$footerHeight = this._eFooter.offsetHeight;
                this.$$bodyHeight = body.offsetHeight;
            },

            /**
             * @override
             */
            $dispose: function () {
                this._oHandle();
                this._eHeader = this._eFooter = this._eEmpty = null;
                ui.Control.prototype.$dispose.call(this);
            },

            /**
             * 拖拽的惯性时间计算。
             * @protected
             *
             * @param {object} speed 速度对象，x/y 值分别表示 x/y 方向上的速度分量
             */
            $draginertia: function (speed) {
                return Math.min(2, Math.abs(speed.y / 400));
            },

            /**
             * 拖拽到最底部事件。
             * @event
             */
            $footercomplete: function () {
                setComplete.call(this);
                if (!this._bLoading && this._eFooter.innerHTML !== this.HTML_NODATA) {
                    // 可以选择是否需要防止重复提交
                    if (core.dispatchEvent(this, 'loaddata')) {
                        this._bLoading = true;
                    }
                    this._eFooter.innerHTML = this.HTML_LOADING;
                }
            },

            /**
             * 拖拽到达底部区域事件。
             * @event
             */
            $footerenter: setEnterAndLeave,

            /**
             * 拖拽离开底部区域事件。
             * @event
             */
            $footerleave: setEnterAndLeave,

            /**
             * 拖拽到最顶部事件。
             * @event
             */
            $headercomplete: setComplete,

            /**
             * 拖拽到达顶部区域事件。
             * @event
             */
            $headerenter: function () {
                setEnterAndLeave.call(this);
                this._eHeader.innerHTML = this.HTML_REFRESH;
            },

            /**
             * 拖拽离开顶部区域事件。
             * @event
             */
            $headerleave: setEnterAndLeave,

            /**
             * @override
             */
            $initStructure: function (width, height) {
                ui.Control.prototype.$initStructure.call(this, width, height);
                this.alterStatus(this.getLength() ? '-empty' : '+empty');
                this.setPosition(0, 0);
            },

            /**
             * 列表数据加载的默认处理。
             * @event
             */
            $loaddata: function () {
                return false;
            },

            /**
             * @override
             */
            $ready: function () {
                ui.Control.prototype.$ready.call(this);
                this._nTopHidden = this._nBottomHidden = 0;
                this._nTopIndex = 0;
                this._nBottomIndex = this.getLength();
            },

            /**
             * 列表刷新的默认处理。
             * @event
             */
            $refresh: function () {
                return false;
            },

            /**
             * 获取空listview元素。
             * @public
             *
             * @return {Element} 空listview的 DOM 元素
             */
            getEmptyBody: function () {
                return this._eEmpty;
            },

            /**
             * 获取底部元素。
             * @public
             *
             * @return {Element} 底部 DOM 元素
             */
            getFooter: function () {
                return this._eFooter;
            },

            /**
             * 获取顶部元素。
             * @public
             *
             * @return {Element} 顶部 DOM 元素
             */
            getHeader: function () {
                return this._eHeader;
            },

            /**
             * 获取当前状态。
             * @public
             *
             * @return {string} 当前状态
             */
            getStatus: function () {
                return this._sStatus;
            },

            /**
             * 重新加载数据。
             * @public
             *
             * @param {Array} data 数据源
             */
            reload: function (data) {
                this._nTopHidden = this._nBottomHidden = 0;
                this._nTopIndex = this._nBottomIndex = 0;
                this.preventAlterItems();
                this.getItems().forEach(function (item) {
                    ui.Items.Methods.remove.call(this, item);
                    item.dispose();
                }, this);
                this.premitAlterItems();
                this.add(data);
                this._eHeader.innerHTML = this.HTML_REFRESHED;
                this.reset();
                this._eFooter.innerHTML = '';
            },

            /**
             * 复位。
             *
             * @param {Function} callback 处理完后回调
             */
            reset: function (callback) {
                if (!this.isScrolling()) {
                    this._oHandle();
                    var status = this._sStatus.slice(0, 6),
                        main = this.getMain(),
                        options = {
                            $: this,
                            onfinish: function () {
                                if (callback) {
                                    callback();
                                }
                            }
                        };

                    if (status === 'header') {
                        options.y = this.getY();
                        this._oHandle = effect.grade(
                            'this.setPosition(0,#$.y->0#)',
                            400,
                            options
                        );
                    } else if (status === 'footer') {
                        options.y = ui.MScroll.Methods.getY.call(this);
                        this._oHandle = effect.grade(
                            'ecui.ui.MScroll.Methods.setPosition.call(this,0,#$.y->' + (main.clientHeight - main.scrollHeight + this.$$footerHeight) + '#)',
                            400,
                            options
                        );
                    }
                }
            }
        },
        ui.MScroll,
        ui.Items,
        {
            /**
             * @override
             */
            $activate: function (event) {
                if (!this._bLoading || this._sStatus !== 'headercomplete') {
                    ui.MScroll.Methods.$activate.call(this, event);
                }
            },

            /**
             * @override
             */
            $dragend: function (event) {
                ui.MScroll.Methods.$dragend.call(this, event);
                if (!this._bLoading) {
                    if (this._sStatus === 'headercomplete') {
                        // 可以选择是否需要防止重复提交
                        if (core.dispatchEvent(this, 'refresh')) {
                            this._eHeader.innerHTML = this.HTML_PREPARE;
                            this._bLoading = true;
                        }
                    } else if (this._sStatus === 'footercomplete') {
                        setEnterAndLeave.call(this);
                        this.reset();
                    }
                }
            },

            /**
             * @override
             */
            $dragstart: function (event) {
                ui.MScroll.Methods.$dragstart.call(this, event);
                this._oHandle();
                this._sStatus = '';
            },

            /**
             * 本控件新增选项只能从顶部或底部。
             * @override
             */
            add: function (item, index) {
                this._bLoading = false;
                var oldLength = this.getLength();
                ui.Items.Methods.add.call(this, item, index);
                setEnterAndLeave.call(this);
                if (this.isReady()) {
                    if (oldLength === this.getLength()) {
                        this._eFooter.innerHTML = this.HTML_NODATA;
                        this.reset();
                    } else {
                        this._eFooter.innerHTML = this.HTML_LOADED;
                    }
                }
            },

            /**
             * @override
             */
            getY: function () {
                return ui.MScroll.Methods.getY.call(this) - this._nTopHidden + this.$$headerHeight;
            },

            /**
             * @override
             */
            remove: function (item) {
                var index = 'number' === typeof item ? item : this.getItems().indexOf(item);
                item = this.getItem(index);
                if (item) {
                    var height = item.getHeight();
                    if (index < this._nTopIndex) {
                        this._nTopIndex--;
                        this._nTopHidden -= height;
                    } else if (index >= this._nBottomIndex) {
                        this._nBottomHidden -= height;
                    }
                    this._nBottomIndex--;
                    this.$$bodyHeight -= height;
                    ui.Items.Methods.remove.call(this, item);
                    this.setPosition(0, this.getY());
                }
            },

            /**
             * @override
             */
            setPosition: function (x, y) {
                this.preventAlterItems();

                var top = ui.MScroll.Methods.getY.call(this);

                if (top < -screen.availHeight * 1.5) {
                    for (; top < -screen.availHeight * 1.5; ) {
                        var item = this.getItem(this._nTopIndex++),
                            height = item.getHeight();

                        item.hide();
                        this._nTopHidden += height;
                        top += height;
                    }
                } else if (top > -screen.availHeight) {
                    for (; top > -screen.availHeight && this._nTopIndex; ) {
                        item = this.getItem(--this._nTopIndex);
                        height = item.getHeight();

                        item.show();
                        this._nTopHidden -= height;
                        top -= height;
                    }
                }

                top = this.getHeight() - this.$$bodyHeight - y + this._nBottomHidden;
                if (top < -screen.availHeight * 1.5) {
                    for (; top < -screen.availHeight * 1.5; ) {
                        item = this.getItem(--this._nBottomIndex);
                        height = item.getHeight();

                        item.hide();
                        this._nBottomHidden += height;
                        top += height;
                    }
                } else if (top > -screen.availHeight) {
                    var length = this.getLength();
                    for (; top > -screen.availHeight && this._nBottomIndex < length; ) {
                        item = this.getItem(this._nBottomIndex++);
                        height = item.getHeight();

                        item.show();
                        this._nBottomHidden -= height;
                        top -= height;
                    }
                }

                this._eHeader.style.transform = 'translateY(' + (y - this.$$headerHeight) + 'px)';
                this._eFooter.style.transform = util.hasIOSKeyboard() ? 'translateY(' + (y + this._nTopHidden - this.$$headerHeight) + 'px)' : '';
                ui.MScroll.Methods.setPosition.call(this, x, y + this._nTopHidden - this.$$headerHeight);

                top = this.getHeight() - this.$$bodyHeight;
                if (y > 0) {
                    status = y < this.$$headerHeight || this.isInertia() ? 'headerenter' : 'headercomplete';
                } else if (y === 0) {
                    // 解决items不够填充整个listview区域，导致footercomplete的触发
                    status = '';
                } else if (y < top && top < 0) {
                    var status = y > top + this.$$footerHeight ? 'footerenter' : 'footercomplete';
                } else {
                    status = '';
                }
                if (this._sStatus && this._sStatus.charAt(0) !== status.charAt(0)) {
                    core.dispatchEvent(this, this._sStatus.slice(0, 6) + 'leave');
                }
                if (this._sStatus !== status) {
                    if (status) {
                        core.dispatchEvent(this, status);
                    }
                    this._sStatus = status;
                }

                this.premitAlterItems();
            }
        }
    );
}());
