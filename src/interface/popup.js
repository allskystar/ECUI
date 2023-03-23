//{if $css}//
ecui.__ControlStyle__('\
.ui-popup {\
    position: absolute !important;\
    z-index: 32700;\
}\
');
ecui.__ControlStyle__('\
.ui-mobile-popup {\
    position: fixed !important;\
    .m-width100rate();\
    z-index: 32700;\
}\
');
//{/if}//
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        effect = core.effect,
        ui = core.ui,
        util = core.util;
//{/if}//
    var owners = {};

    /**
     * 隐藏弹出层控件。
     * @private
     */
    function popupHideHandler() {
        delete owners[this.__ECUI__uid];
        var parent = this.getParent(),
            inf = parent.$Popup.constructor;
        parent.alterStatus('-popup');
        core.removeEventListener(this, 'hide', popupHideHandler);
        core.removeEventListener(this, 'resize', inf.popupResizeHandler);
        inf.popupHideHandler.call(this);
        if (core.isSingleton(this)) {
            this.$setParent();
        }
    }

    /**
     * 弹出框接口。提供了基本的点击显示/关闭操作。
     * @interface
     */
    var Popup = core.interfaces('$Popup', {
        /**
         * @override
         */
        $blur: function (event) {
            _class.$blur(event);
            this._cControl.hide();
        },

        /**
         * @override
         */
        $click: function (event) {
            _class.$click(event);
            if (this.getMain().contains(event.target)) {
                // popview可能动态创建，控件使用了ecui.ui.iPopup，但是没有创建popcontrol 会报错
                if (this._cControl) {
                    if (this._cControl.isShow()) {
                        if (!this.getMain().contains(document.activeElement)) {
                            this._cControl.hide();
                        }
                    } else {
                        this.popup();
                    }
                }
            }
        },

        /**
         * @override
         */
        $dispose: function () {
            var el = this._cControl && this._cControl.getMain();
            if (el) {
                core.dispose(el);
            }
            this.setPopup();
            _class.$dispose();
        },

        /**
         * 获取控件的弹出层。
         * @public
         *
         * @return {ecui.ui.Control} 弹出层控件
         */
        getPopup: function () {
            return this._cControl;
        },

        /**
         * 显示弹出层。
         * @public
         */
        popup: function () {
            var popup = this.getPopup();
            if (core.isSingleton(popup)) {
                popup.$setParent(this);
            }
            if (!popup.isShow()) {
                owners[popup.__ECUI__uid] = this;
                var el = popup.getMain();
                if (!document.body.contains(el)) {
                    // 第一次显示时需要进行下拉选项部分的初始化，将其挂载到 DOM 树中
                    document.body.appendChild(el);
                }
                popup.show();
                if (this.$initPopup) {
                    // 如果弹出层控件是单例，必须声明这个函数初始化
                    this.$initPopup(popup);
                }
                this.$Popup.constructor.popupResizeHandler.call(popup);
                this.alterStatus('+popup');
                core.addEventListener(popup, 'hide', popupHideHandler);
                core.addEventListener(popup, 'resize', this.$Popup.constructor.popupResizeHandler);
            }
        },

        /**
         * 设置控件的弹出层。
         * @public
         *
         * @param {ecui.ui.Control} control 弹出层控件
         */
        setPopup: function (control) {
            if (control) {
                this._cControl = control;
                dom.addClass(control.getMain(), this.$Popup.constructor.TYPE + ' ui-hide');
            }
        }
    });

    ui.iPopup = core.interfaces('Popup', [Popup], {
        /**
         * @override
         */
        $scroll: function (event) {
            _class.$scroll(event);
            // pop内容延迟加载，这个地方会报错，做一个容错
            var popup = this.getPopup();
            if (!popup){
                return;
            }
            if (!popup.getMain().contains(event.target)) {
                if (event.type === 'mousedown') {
                    // ie6/7/8下有可能scroll事件是由mousedown点击滚动条触发的
                    popup.hide();
                } else if (owners[popup.__ECUI__uid]) {
                    // 当前的pop弹出的时候，才能进行该操作
                    ui.iPopup.popupResizeHandler.call(popup);
                }
            }
        }
    });

    ui.iPopup.popupHideHandler = util.blank;

    /**
     * 设置控件的弹出层显示的位置。
     * @public
     */
    ui.iPopup.popupResizeHandler = function () {
        var popupEl = this.getMain(),
            owner = owners[this.__ECUI__uid],
            scrollLeft = popupEl.scrollLeft,
            scrollTop = popupEl.scrollTop;

        dom.remove(popupEl);

        for (var el = owner.getMain(), container = el.parentElement; container !== document.body; container = container.parentElement) {
            var overflow = dom.getStyle(container, 'overflow');
            if (container.scrollHeight !== container.clientHeight && (overflow === 'auto' || overflow === 'scroll')) {
                break;
            }
        }
        if (dom.getStyle(container, 'position') === 'static') {
            container.style.position = 'relative';
        }

        var style = window.getComputedStyle(container),
            elPos = dom.getPosition(el),
            containerPos = dom.getPosition(container),
            top = elPos.top - containerPos.top - dom.toPixel(style.borderTopWidth) + (container === document.body ? 0 : container.scrollTop),
            left = elPos.left - containerPos.left - dom.toPixel(style.borderLeftWidth) + (container === document.body ? 0 : container.scrollLeft),
            popupTop = top + owner.getHeight(),
            popupLeft = left,
            height = this.getHeight(),
            width = this.getWidth();

        popupEl.style.left = (popupLeft + width <= container.scrollWidth ? popupLeft : Math.max(left - width + owner.getWidth(), 0)) + 'px';
        popupEl.style.top = (popupTop + height <= container.scrollHeight ? popupTop : Math.max(top - height, 0)) + 'px';
        container.appendChild(popupEl);
        popupEl.scrollLeft = scrollLeft;
        popupEl.scrollTop = scrollTop;
    };
    ui.iPopup.TYPE = 'ui-popup';

    var position = {
        top: ['top', true],
        bottom: ['bottom', true],
        left: ['left', false],
        right: ['right', false]
    };

    ui.iMPopup = core.interfaces('Popup', [Popup], {
        constructor: function (el, options) {
            this._oEnter = (position[options.enter || 'bottom'] || position.right);
            this._nMask = options.mask;
            this._nZIndex = options.zIndex || '';
        },

        /**
         * @override
         */
        popup: function () {
            _class.popup();

            var view = dom.getView(),
                popup = this.getPopup(),
                el = popup.getMain(),
                style = el.style;

            if (this._nMask) {
                core.mask(this._nMask, this._nZIndex);
                util.timer(function () {
                    core.addGestureListeners(popup, {
                        tap: function (event) {
                            if (!popup.getMain().contains(event.target)) {
                                popup.hide();
                                core.removeGestureListeners(popup);
                            }
                        }
                    });
                }, 100);
            }

            style.top = style.right = style.bottom = style.left = 'auto';
            if (this._oEnter[1]) {
                var width = view.width,
                    height = popup.getHeight(),
                    reverseValue = height;
            } else {
                style.top = view.top + 'px';
                width = popup.getWidth();
                height = view.height;
                reverseValue = width;
            }
            if (this._oEnter[2]) {
                popup.setSize(width, height);
            }

            effect.grade('this.style.' + this._oEnter[0] + '=#' + (-reverseValue) + '->0px#', 400, el);
        }
    });

    ui.iMPopup.popupHideHandler = function () {
        if (ui.iMPopup.getData(this.getParent())._nMask) {
            core.mask();
        }
    };

    ui.iMPopup.popupResizeHandler = util.blank;

    ui.iMPopup.TYPE = 'ui-mobile-popup';
})();
