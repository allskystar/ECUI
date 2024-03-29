//{if $css}//
ecui.__ControlStyle__('\
.ui-mobile-listview {\
    touch-action: none !important;\
\
    .ui-mobile-listview-header {\
    	position: relative;\
        .m-width100rate();\
\
        .ui-mobile-listview-title {\
        	position: absolute;\
        	width: 100%;\
        	bottom: 0px;\
        }\
    }\
\
    .ui-mobile-listview-footer {\
        .m-width100rate();\
    }\
}\
');
//{/if}//
/*
@example
<ul ui="type:m-list-view">
  <li>单条数据内容</li>
  <li>单条数据内容</li>
</ul>

@fields
_bOptimize     - 是否开启性能优化
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
        util = core.util;
//{/if}//
    function setEnterAndLeave() {
        if (this._bComplete) {
            core.drag(
                this,
                {
                    limit: {
                        top: this.$$footerHeight,
                        bottom: -this.$$headerHeight
                    }
                }
            );
            this._bComplete = false;
        }
    }

    function setComplete() {
        this._bComplete = true;
        core.drag(
            this,
            {
                limit: {
                    top: -this.$$footerHeight,
                    bottom: this.$$headerHeight
                }
            }
        );
    }

    /**
     * 移动端列表展示控件。
     * options 属性：
     * optimize   性能优化，数据量非常大时，使用此选项优化性能，默认不开启。
     * @control
     */
    ui.MListView = core.inherits(
        ui.Control,
        'ui-mobile-listview',
        function (el, options) {
            if (options.customEmpty) {
                dom.addClass(this._eEmpty = dom.remove(el.lastElementChild), this.getUnitClass(ui.MListView, 'empty-body'));
            } else {
                this._eEmpty = dom.create({ className: this.getUnitClass(ui.MListView, 'empty-body') });
            }
            var first = el.firstElementChild;
            if (first && first.tagName === 'STRONG') {
                this._eTitle = first;
                el.removeChild(first);
                dom.addClass(first, this.getUnitClass(ui.MListView, 'title'));
            }
            _super(el, options);
            this._sStatus = '';
            this._bOptimize = !!options.optimize;
        },
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
                if (this._bOptimize) {
                    // 第一次进来使用缓存的数据，第二次进来取实际数据
                    if (this.isReady()) {
                        var items = this.getItems(),
                            body = this.getBody();

                        this.alterStatus(items.length ? '-empty' : '+empty');
                        this.$$bodyHeight = body.offsetHeight + this._nTopHidden + this._nBottomHidden;
                        items.map(function (item) {
                            item.cache();
                            return item.getMain().offsetWidth ? item : null;
                        }).forEach(
                            function (item, index) {
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
                            },
                            this
                        );
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
                            bottom: this.$$titleHeight
                        }
                    );
                    if (this.isReady()) {
                        var y = this.getY();
                        if (y <= top || (y > this.$$titleHeight && !top)) {
                            this.setPosition(0, top);
                        }
                    }
                } else {
                    if (this.isReady()) {
                        this.alterStatus(this.getItems().length ? '-empty' : '+empty');
                    }

                    this.$$bodyHeight = this.getBody().offsetHeight;
                    this.refresh();
                }
            },

            /**
             * @override
             */
            $cache: function (style) {
                _super.$cache(style);
                var body = this.getBody();
                style = window.getComputedStyle(body);
                this.$$bodyPadding = [dom.toPixel(style.paddingTop), dom.toPixel(style.paddingRight), dom.toPixel(style.paddingBottom), dom.toPixel(style.paddingLeft)];
                this.$$headerHeight = this._eHeader.offsetHeight;
                this.$$titleHeight = this._eTitle ? this._eTitle.offsetHeight : 0;
                this.$$footerHeight = this._eFooter.offsetHeight;
                this.$$bodyHeight = body.offsetHeight;
            },

            /**
             * @override
             */
            $create: function (options) {
                _super.$create(options);
                var body = this.getBody();
                this._eHeader = dom.insertBefore(dom.create({className: this.getUnitClass(ui.MListView, 'header'), innerHTML: '<div></div>'}), body);
                if (this._eTitle) {
                    this._eHeader.appendChild(this._eTitle);
                }
                this._eFooter = dom.insertAfter(dom.create({className: this.getUnitClass(ui.MListView, 'footer')}), body);
                dom.insertAfter(this._eEmpty, body);
                this._oHandle = util.blank;
            },

            /**
             * @override
             */
            $dispose: function () {
                this._oHandle();
                _super.$dispose();
                this._eHeader = this._eFooter = this._eTitle = this._eEmpty = null;
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
                this._eHeader.firstChild.innerHTML = this.HTML_REFRESH;
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
                _super.$initStructure(width, height);
                this.alterStatus(this.getLength() ? '-empty' : '+empty');
                this.alterStatus(this.getLength() ? '-init' : '+init');
                if (this.isReady()) {
                    this.setPosition(0, this.$$titleHeight);
                }
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
                _super.$ready();
                this._nTopHidden = this._nBottomHidden = 0;
                this._nTopIndex = 0;
                this._nBottomIndex = this.getLength();
                this.setPosition(0, this.$$titleHeight);
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
                this.removeAll(true);
                this.add(data);
                this._eHeader.firstChild.innerHTML = this.HTML_REFRESHED;
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
                            y: this.getY(),
                            onfinish: function () {
                                if (callback) {
                                    callback();
                                }
                            }
                        };

                    if (status === 'header') {
                        this._oHandle = effect.grade(
                            'this.setPosition(0,#$.y->' + (this.$$titleHeight + window.scrollY) + '#)',
                            400,
                            this,
                            options
                        );
                    } else if (status === 'footer') {
                        this._oHandle = effect.grade(
                            // main.scrollHeight 会随着 body 的 translate3d 的值得变化而变化，所以取 body.clientHeight 值做计算，body clientHeight 包含，this.$$footerHeight， this.$$headerHeight 的高度，所以不用加这两个高度
                            // 'this.setPosition(0,#$.y->' + (main.clientHeight - core.getKeyboardHeight() - main.scrollHeight + this.$$footerHeight - this._nTopHidden + this.$$headerHeight + window.scrollY) + '#)',
                            'this.setPosition(0,#$.y->' + (main.clientHeight - core.getKeyboardHeight() - this.getBody().clientHeight - this._nTopHidden + window.scrollY) + '#)',
                            400,
                            this,
                            options
                        );
                    }
                }
            }
        },
        ui.iMScroll,
        ui.iItems,
        {
            /**
             * @override
             */
            $activate: function (event) {
                if (!this._bLoading || this._sStatus !== 'headercomplete') {
                    _class.$activate(event);
                    if (!this._bOptimize) {
                        core.drag(
                            this,
                            {
                                top: -this.$$footerHeight,
                                bottom: this.$$headerHeight
                            }
                        );
                    }
                }
            },

            /**
             * @override
             */
            $dragend: function (event) {
                _class.$dragend(event);
                if (!this._bLoading) {
                    if (this._sStatus === 'headercomplete') {
                        // 可以选择是否需要防止重复提交
                        if (core.dispatchEvent(this, 'refresh')) {
                            this._eHeader.firstChild.innerHTML = this.HTML_PREPARE;
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
                _class.$dragstart(event);
                this._oHandle();
                if (!this._bLoading) {
                    this._sStatus = '';
                }
            },

            /**
             * 本控件新增选项只能从顶部或底部。
             * @override
             */
            add: function (item, index) {
                this._bLoading = false;
                var oldLength = this.getLength();
                _class.add(item, index);
                setEnterAndLeave.call(this);
                if (this.isReady()) {
                    if (oldLength === this.getLength()) {
                        this._eFooter.innerHTML = this.HTML_NODATA;
                        this.reset();
                    } else {
                        this._eFooter.innerHTML = this.HTML_LOADED;
                        this.setPosition(0, this.getY());
                    }
                }
            },

            /**
             * @override
             */
            getY: function () {
                return _class.getY() - this._nTopHidden + this.$$headerHeight;
            },

            /**
             * 是否正在加载数据。
             * @public
             *
             * @return {boolean} 是否在loading状态
             */
            isLoading: function () {
                return this._bLoading;
            },

            /**
             * @override
             */
            remove: function (item) {
                if (this._bOptimize) {
                    var index = typeof item === 'number' ? item : this.getItems().indexOf(item);
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
                    }
                }
                _class.remove(item);
                this.setPosition(0, this.getY());
            },

            /**
             * @override
             */
            setPosition: function (x, y) {
                this.preventAlterItems();

                if (this._bOptimize && (!this.isScrolling() || this.isInertia())) {
                    var top = _class.getY();

                    if (top < -screen.availHeight * 1.5) {
                        for (; top < -screen.availHeight * 1.5;) {
                            var item = this.getItem(this._nTopIndex++),
                                height = item.getHeight();

                            item.hide();
                            this._nTopHidden += height;
                            top += height;
                        }
                    } else if (top > -screen.availHeight) {
                        for (; top > -screen.availHeight && this._nTopIndex;) {
                            item = this.getItem(--this._nTopIndex);
                            height = item.getHeight();

                            item.show();
                            this._nTopHidden -= height;
                            top -= height;
                        }
                    }

                    top = this.getHeight() - this.$$bodyHeight - y + this._nBottomHidden;
                    if (top < -screen.availHeight * 1.5) {
                        for (; top < -screen.availHeight * 1.5;) {
                            item = this.getItem(--this._nBottomIndex);
                            height = item.getHeight();

                            item.hide();
                            this._nBottomHidden += height;
                            top += height;
                        }
                    } else if (top > -screen.availHeight) {
                        var length = this.getLength();
                        for (; top > -screen.availHeight && this._nBottomIndex < length;) {
                            item = this.getItem(this._nBottomIndex++);
                            height = item.getHeight();

                            item.show();
                            this._nBottomHidden -= height;
                            top -= height;
                        }
                    }
                }

                this._eHeader.style.transform = 'translateY(' + (y - this.$$headerHeight) + 'px)';
                this._eFooter.style.transform = 'translateY(' + (y + this._nTopHidden - this.$$headerHeight) + 'px)';
                _class.setPosition(x, y + this._nTopHidden - this.$$headerHeight);

                top = this.getHeight() - core.getKeyboardHeight() - this.$$bodyHeight;
                if (y > window.scrollY) {
                    status = y - window.scrollY < this.$$headerHeight || (this.isInertia() && this._sStatus.indexOf('complete') < 0) ? 'headerenter' : 'headercomplete';
                } else if (y === window.scrollY) {
                    // 解决items不够填充整个listview区域，导致footercomplete的触发
                    status = '';
                } else if (y < top && top < 0) {
                    // 三倍屏浮点数会造成相差1像素，高度实际是xx.72, clientHeight会取整，后续想有没有好办法
                    var status = y - (top - this.$$footerHeight) > 1 || (this.isInertia() && this._sStatus.indexOf('complete') < 0) ? 'footerenter' : 'footercomplete';
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
})();
