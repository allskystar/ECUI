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
        if (!range.bottom) {
            range.top = this.getHeight() - this.$$bodyHeight + this.$$footerHeight;
            range.bottom = -this.$$headerHeight;
        }
    }

    function setComplete() {
        var range = this.getRange();
        range.top = this.getHeight() - this.$$bodyHeight;
        range.bottom = 0;
    }

    /**
     * 移动端列表展示控件。
     * @control
     */
    ui.MListView = core.inherits(
        ui.MScroll,
        'ui-mobile-listview',
        function (el, options) {
            ui.MScroll.call(this, el, options);

            var body = this.getBody();
            this._eHeader = dom.insertBefore(dom.create({className: options.classes.join('-header ')}), body);
            this._eFooter = dom.insertAfter(dom.create({className: options.classes.join('-footer ')}), body);
        },
        {
            /**
             * @override
             */
            $alterItems: function () {
                // 第一次进来使用缓存的数据，第二次进来取实际数据
                if (this.isReady()) {
                    this.$$bodyHeight = this.getBody().offsetHeight + this._nTopHidden + this._nBottomHidden;
                    this.getItems().map(function (item) {
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
                } else {
                    this._nTopHidden = this._nBottomHidden = 0;
                    this._nTopIndex = 0;
                    this._nBottomIndex = this.getLength();
                }
                // 解决items不够填充整个listview区域
                var top = Math.min(-this.$$headerHeight, this.getHeight() - this.$$bodyHeight);
                this.setScrollRange(
                    {
                        left: 0,
                        right: 0,
                        top: top,
                        bottom: 0
                    }
                );
                this.setRange(
                    {
                        top: top + this.$$footerHeight,
                        bottom: -this.$$headerHeight
                    }
                );
            },

            /**
             * @override
             */
            $cache: function (style, cacheSize) {
                ui.MScroll.prototype.$cache.call(this, style, cacheSize);
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
                this.$$bodyHeight = body.offsetHeight + this.$$headerHeight + this.$$footerHeight;
            },

            /**
             * @override
             */
            $dispose: function () {
                this._eHeader = this._eFooter = null;
                ui.MScroll.prototype.$dispose.call(this);
            },

            /**
             * 拖拽的惯性时间计算。
             * @protected
             *
             * @param {Object} speed 速度对象，x/y 值分别表示 x/y 方向上的速度分量
             */
            $draginertia: function (speed) {
                return Math.min(2, Math.abs(speed.y / 400));
            },

            /**
             * @override
             */
            $dragmove: function (event) {
                var y = event.y,
                    top = util.toNumber(this.getBody().style.top);

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
                event.y += this._nTopHidden;

                ui.MScroll.prototype.$dragmove.call(this, event);

                top = this.getHeight() - this.$$bodyHeight;
                if (y > -this.$$headerHeight) {
                    status = y < 0 ? 'headerenter' : 'headercomplete';
                } else if (y === -this.$$headerHeight) {
                    // 解决items不够填充整个listview区域，导致footercomplete的触发
                    status = '';
                } else if (y < top + this.$$footerHeight) {
                    var status = y > top ? 'footerenter' : 'footercomplete';
                } else {
                    status = '';
                }
                if (this._sStatus && this._sStatus.charAt(0) !== status.charAt(0)) {
                    core.triggerEvent(this, this._sStatus.slice(0, 6) + 'leave');
                }
                if (this._sStatus !== status) {
                    if (status) {
                        core.triggerEvent(this, status);
                    }
                    this._sStatus = status;
                }
            },

            /**
             * @override
             */
            $dragstart: function (event) {
                ui.MScroll.prototype.$dragstart.call(this, event);
                if (this._oHandle) {
                    this._oHandle();
                }
                this._sStatus = '';
            },

            /**
             * 拖拽到最底部事件。
             * @event
             */
            $footercomplete: setComplete,

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
            $headerenter: setEnterAndLeave,

            /**
             * 拖拽离开顶部区域事件。
             * @event
             */
            $headerleave: setEnterAndLeave,

            /**
             * @override
             */
            $initStructure: function (width, height) {
                ui.MScroll.prototype.$initStructure.call(this, width, height);
                var style = this.getBody().style;
                style.paddingTop = (this.$$bodyPadding[0] + this.$$headerHeight) + 'px';
                style.paddingBottom = (this.$$bodyPadding[2] + this.$$footerHeight) + 'px';
            },

            /**
             * @override
             */
            $ready: function (event) {
                ui.MScroll.prototype.$ready.call(this, event);
                this.getBody().style.top = -this.$$headerHeight + 'px';
            },

            /**
             * @override
             */
            $resize: function () {
                ui.MScroll.prototype.$resize.call(this);
                var style = this.getBody().style;
                style.paddingTop = '';
                style.paddingBottom = '';
            },

            /**
             * 本控件新增选项只能从顶部或底部。
             * @override
             */
            add: function (item, index) {
                if (!index) {
                    ui.Items.Methods.add.call(this, item, index);
                }
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
             * @override
             */
            getY: function () {
                return ui.MScroll.prototype.getY.call(this) - this._nTopHidden;
            },

            /**
             * 本控件不支持删除选项的操作。
             * @override
             */
            remove: util.blank,

            /**
             * 复位。
             *
             * @param {Function} callback 处理完后回调
             */
            reset: function (callback) {
                var y = this.getY(),
                    top = this.getHeight() - this.$$bodyHeight + this.$$footerHeight,
                    options = {
                        $: this.getBody(),
                        onstep: callback && function (percent) {
                            if (percent >= 1) {
                                callback();
                            }
                        }
                    };
                // 解决items不够填充整个listview区域，导致footercomplete的触发，应该先判断head，
                if (y > -this.$$headerHeight) {
                    this._oHandle = core.effect.grade('this.style.top->' + -this.$$headerHeight, 1000, options);
                } else if (y < top) {
                    this._oHandle = core.effect.grade('this.style.top->' + (top + this._nTopHidden), 1000, options);
                }
            }
        },
        ui.Items
    );
}());
