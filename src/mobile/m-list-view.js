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
        ui = core.ui,
        util = core.util,

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
//{/if}//
    function setEnterAndLeave() {
        var range = this.getRange();
        if (range && range.bottom) {
            range.top = this.getHeight() - this.$$bodyHeight;
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
                this._eFooter = dom.insertBefore(dom.create({className: options.classes.join('-footer ')}), body);
                this._oHandle = util.blank;
            }
        ],
        {
            HTML_LOADING: '正在加载...',
            HTML_REFRESH: '下拉刷新',
            HTML_PREPARE: '准备刷新',
            HTML_LOADED: '加载完成',
            HTML_NODATA: '没有更多数据',

            /**
             * @override
             */
            $alterItems: function () {
                // 第一次进来使用缓存的数据，第二次进来取实际数据
                if (this.isReady()) {
                    var items = this.getItems(),
                        body = this.getBody();

                    this.alterClass(items.length ? '-empty' : '+empty');
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
                    top = Math.min(top + this._nTopHidden, 0);
                    if (ui.MScroll.Methods.getY.call(this) < top) {
                        ui.MScroll.Methods.setPosition.call(this, 0, top);
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
                this._eHeader = this._eFooter = null;
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
            $headercomplete: function () {
                setComplete.call(this);
                this._eHeader.innerHTML = this.HTML_PREPARE;
            },

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
                this.alterClass(this.getLength() ? '-empty' : '+empty');
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
                    var y = this.getY(),
                        top = Math.min(0, this.getHeight() - this.$$bodyHeight + this.$$headerHeight),
                        options = {
                            onfinish: callback && function () {
                                this._sStatus = '';
                                callback();
                            }.bind(this)
                        };

                    top = top ? top - this.$$footerHeight : 0;
                    // 解决items不够填充整个listview区域，导致footercomplete的触发，应该先判断head，
                    if (y > 0) {
                        y = ui.MScroll.Methods.getY.call(this);
                        top = util.toNumber(this._eHeader.style.top);

                        this._oHandle = core.effect.grade(
                            function (percent) {
                                ui.MScroll.Methods.setPosition.call(this, 0, Math.round(y * (1 - percent)));
                                this._eHeader.style.top = (top + (-this.$$headerHeight - top) * percent) + 'px';
                            }.bind(this),
                            1000,
                            options
                        );
                    } else if (y < top) {
                        y = ui.MScroll.Methods.getY.call(this);
                        var bottom = util.toNumber(this._eFooter.style.bottom);
                        // y !== 0解决items不够填充整个listview区域的问题
                        this._oHandle = core.effect.grade(
                            function (percent) {
                                ui.MScroll.Methods.setPosition.call(this, 0, Math.round(y + (top - this.$$footerHeight + this._nTopHidden - y) * percent));
                                this._eFooter.style.bottom = (bottom + (-this.$$footerHeight - bottom) * percent) + 'px';
                            }.bind(this),
                            1000,
                            options
                        );
                    } else {
                        this._eHeader.style.top = -this.$$headerHeight + 'px';
                        this._eFooter.style.bottom = -this.$$footerHeight + 'px';
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
                if (!this._bLoading && this._sStatus === 'headercomplete') {
                    // 可以选择是否需要防止重复提交
                    if (core.dispatchEvent(this, 'refresh')) {
                        this._bLoading = true;
                    }
                } else {
                    util.timer(function () {
                        this.reset();
                    }.bind(this));
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
                    this._eFooter.style.bottom = '0px';
                    this._eFooter.innerHTML = oldLength === this.getLength() ? this.HTML_NODATA : this.HTML_LOADED;
                }
            },

            /**
             * @override
             */
            getY: function () {
                return ui.MScroll.Methods.getY.call(this) - this._nTopHidden;
            },

            /**
             * 本控件不支持删除选项的操作。
             * @override
             */
            remove: util.blank,

            /**
             * @override
             */
            setPosition: function (x, y) {
                var top = ui.MScroll.Methods.getY.call(this);

                if (top < -screen.availHeight * 0.5) {
                    for (; top < -screen.availHeight * 0.5; ) {
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

                ui.MScroll.Methods.setPosition.call(this, x, y + this._nTopHidden);

                top = this.getHeight() - this.$$bodyHeight;
                if (y > 0) {
                    status = y < this.$$headerHeight ? 'headerenter' : 'headercomplete';
                    this._eHeader.style.top = (y - this.$$headerHeight) + 'px';
                } else if (y === 0) {
                    // 解决items不够填充整个listview区域，导致footercomplete的触发
                    status = '';
                } else if (y < top) {
                    var status = y > top + this.$$footerHeight ? 'footerenter' : 'footercomplete';
                    this._eFooter.style.bottom = (top - this.$$footerHeight - y) + 'px';
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
            }
        }
    );
}());
