//{if $css}//
ecui.__ControlStyle__('\
.ui-m-tab {\
\
    .ui-m-tab-title {\
        position: relative;\
        border-bottom: 0;\
\
        position: relative;\
        white-space: nowrap;\
        display: block !important;\
        width: 100%;\
        box-sizing: border-box;\
        -webkit-transform: translateZ(0px);\
        transform: translateZ(0px);\
\
        .ui-tab-item {\
            white-space: nowrap;\
            display: inline-block!important;\
            vertical-align: top;\
            width: auto;\
            box-sizing: border-box;\
\
            .ui-tab-bar {\
                position: relative !important;\
            }\
        }\
        .ui-tab-bar {\
            position: absolute !important;\
        }\
    }\
\
    .ui-m-tab-container {\
        position: relative;\
        white-space: nowrap;\
        width: 100%;\
        box-sizing: border-box;\
        -webkit-transform: translateZ(0px);\
        transform: translateZ(0px);\
\
        .ui-tab-item {\
            display: inline-block !important;\
            vertical-align: top;\
            width: 100%;\
            box-sizing: border-box;\
        }\
    }\
}\
');
//{/if}//
/*
@example
<div ui="type:m-tab;selected:1">
    <!-- 包含容器的选项卡 -->
    <div>
        <strong>标题1</strong>
        <!-- 这里是容器 -->
        ...
    </div>
    <!-- 仅有标题的选项卡，以下selected定义与控件定义是一致的，可以忽略其中之一 -->
    <strong ui="selected:true">标题2</strong>
</div>

@fields
_eBar            - 下划线 DOM 元素
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 滑动事件处理。
     * @private
     *
     * @param {ECUIEvent} event ECUI 事件对象
     */
    function swipe(event) {
        if (!this.getMain().contains(event.target)) {
            return;
        }
        if (this._bIsTitle) {
            // 如果是在title上触发swipe，忽略tab页的切换
            return;
        }
        var items = this.getItems(),
            index = items.indexOf(this._cSelected);
        if (event.type === 'swiperight') {
            if (index) {
                index--;
            }
        } else if (event.type === 'swipeleft') {
            if (index < items.length - 1) {
                index++;
            }
        }
        if (items[index] !== this._cSelected) {
            var el = this.getContainer();
            el.style.transition = 'all 0.5s';
            event.target = items[index].getBody();
            core.dispatchEvent(items[index], 'click', event);
            util.timer(
                function () {
                    el.style.transition = '';
                },
                500
            );
        } else {
            // 第一个右滑，最后一个左滑时，修正拖拽位移
            this.setSelected(this._cSelected);
        }
    }

    /**
     * 移动端选项卡控件。
     * 每一个选项卡都包含一个头部区域与容器区域，选项卡控件存在互斥性，只有唯一的一个选项卡能被选中并显示容器区域。
     * options 属性：
     * bar         是否需要下划线，默认为false
     * @control
     */
    ui.MTab = core.inherits(
        ui.Tab,
        'ui-m-tab',
        function (el, options) {
            _super(el, options);
            if (options.bar) {
                this._eBar = dom.create({className: this.getUnitClass(ui.MTab, 'bar')});
            }

            if (options.gesture !== false) {
                core.addGestureListeners(this, {
                    swipeleft: swipe,
                    swiperight: swipe
                });
            }
        },
        {
            /**
             * @override
             */
            $activate: function (event) {
                _super.$activate(event);

                var clientWidth = this.getClientWidth(),
                    title = this.getBody(),
                    options = {top: 0, bottom: 0, absolute: true};

                if (title.contains(event.target)) {
                    this._bIsTitle = true;
                    options.left = Math.min(0, clientWidth - title.scrollWidth);
                    options.right = 0;
                } else {
                    this._bIsTitle = false;
                    var x = this.getX();
                    options.left = Math.max(Math.round(0.8 * clientWidth) - this.getContainer().scrollWidth, x - clientWidth);
                    options.right = Math.min(Math.round(0.2 * clientWidth), x + clientWidth);
                    options.limit = {stepX: this.getClientWidth()};
                    options.decelerate = 1000;
                }
                core.drag(this, event, options);
            },

            /**
             * @override
             */
            $dispose: function () {
                core.removeGestureListeners(this);
                _super.$dispose();
                this._eBar = null;
            },

            /**
             * @override
             */
            $dragend: function (event) {
                if (!this._bIsTitle) {
                    var item = this.getItem(Math.round(-this.getX() / this.getClientWidth()));
                    if (item !== this.getSelected()) {
                        this.setSelected(item);
                        event.cancelGesture();
                    }
                }
                delete this._bIsTitle;
                _super.$dragend(event);
            },

            /**
             * 获取内容区滑动的位置。
             * @protected
             *
             * @return {number} container延x轴方向移动的距离
             */
            $getXByContainer: function () {
                return dom.toPixel(dom.getStyle(this.getContainer(), 'transform').split(',')[4]);
            },

            /**
             * 获取标题区滑动的位置。
             * @protected
             *
             * @return {number} title延x轴方向移动的距离
             */
            $getXByTitle: function () {
                return dom.toPixel(dom.getStyle(this.getBody(), 'transform').split(',')[4]);
            },

            /**
             * @override
             */
            $initStructure: function (width, height) {
                _super.$initStructure(width, height);

                var item = this.getSelected();
                if (item) {
                    this.move(this.getItems().indexOf(item));
                }
            },

            /**
             * 滑动内容区到指定的位置。
             * @protected
             *
             * @param {number} x container延x轴方向移动的距离
             */
            $setPositionByContainer: function (x) {
                dom.setStyle(this.getContainer(), 'transform', 'translate3d(' + x + 'px,0px,0px)');
            },

            /**
             * 滑动标题区到指定的位置。
             * @protected
             *
             * @param {number} x title延x轴方向移动的距离
             */
            $setPositionByTitle: function (x) {
                dom.setStyle(this.getBody(), 'transform', 'translate3d(' + x + 'px,0px,0px)');
            },

            /**
             * @override
             */
            getPositionElement: function () {
                return this._bIsTitle ? this.getBody() : this.getContainer();
            },

            /**
             * @override
             */
            getX: function () {
                return this.isShow() ? (this._bIsTitle === undefined ? this.getMain().offsetLeft : this._bIsTitle ? this.$getXByTitle() : this.$getXByContainer()) : 0;
            },

            /**
             * 滑动到指定的tab页。
             * @public
             *
             * @param {number} num tab项的索引值
             */
            move: function (num) {
                var clientWidth = this.getClientWidth(),
                    item = this.getItem(num),
                    itemWidth = item.getWidth(),
                    titleX = this.$getXByTitle(),
                    x = dom.getPosition(item.getMain()).left;

                if (x < 0) {
                    this.$setPositionByTitle(titleX - x);
                } else if (x + itemWidth > clientWidth) {
                    this.$setPositionByTitle(titleX + clientWidth - x - itemWidth);
                }
                this.$setPositionByContainer(-clientWidth * num);
            },

            /**
             * @override
             */
            setPosition: function (x, y) {
                if (this._bIsTitle) {
                    this.$setPositionByTitle(x, y);
                } else {
                    this.$setPositionByContainer(x, y);
                }
            },

            /**
             * @override
             */
            setSelected: function (item) {
                if (typeof item === 'number') {
                    item = this.getItem(item);
                }

                if (item && this._cSelected !== item && this._eBar) {
                    if (this.isReady()) {
                        var main = this.getBody(),
                            parent = this._eBar.parentElement,
                            left = this._eBar.offsetLeft,
                            top = this._eBar.offsetTop - this._eBar.clientHeight,
                            width = this._eBar.offsetWidth;

                        if (parent !== main) {
                            this.$$barMargin = parent.getControl().getClientWidth() - width;
                            this._eBar.style.top = top + 'px';
                            this._eBar.style.left = left + 'px';
                            this._eBar.style.width = width + 'px';
                            main.appendChild(this._eBar);
                        }

                        util.timer(
                            function () {
                                this._eBar.style.left = (item.getX() + this.$$barMargin / 2) + 'px';
                                this._eBar.style.width = (item.getWidth() - this.$$barMargin) + 'px';
                            },
                            0,
                            this
                        );
                    } else {
                        item.getBody().appendChild(this._eBar);
                    }
                }

                _super.setSelected(item);

                if (this.isCached()) {
                    this.move(item ? this.getItems().indexOf(item) : 0);
                }
            }
        }
    );
})();
