/*
弹出操作集合，提供了基本的点击显示/关闭操作，通过将 ecui.ui.Popup 对象下的方法复制到类的 prototype 属性下继承接口，最终对象要正常使用需要通过 setPopup 方法设置自己关联的弹出层。
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
//{/if}//
    /**
     * 隐藏弹出层控件。
     * @private
     */
    function hidePopupHandler() {
        owners.pop();
        core.removeEventListener(this, 'hide', hidePopupHandler);
    }

    /**
     * 设置控件的弹出层显示的位置。
     * @private
     *
     * @param {ecui.ui.Control} popup 弹出层控件
     */
    function setPopupPosition(popup) {
        var popupEl = popup.getMain(),
            owner = ui.Popup.getOwner(),
            scrollLeft = popupEl.scrollLeft,
            scrollTop = popupEl.scrollTop;

        dom.remove(popupEl);

        for (var el = owner.getMain(), container = dom.parent(el); container !== document.body; container = dom.parent(container)) {
            var overflow = dom.getStyle(container, 'overflow');
            if (container.scrollHeight !== container.clientHeight && (overflow === 'auto' || overflow === 'scroll')) {
                break;
            }
        }
        if (dom.getStyle(container, 'position') === 'static') {
            container.style.position = 'relative';
        }

        if (ieVersion < 8) {
            var style = dom.getStyle(container, 'borderWidth').split(' ');
            style = {borderTopWidth: style[0], borderLeftWidth: style[3] || style[1] || style[0]};
        } else {
            style = dom.getStyle(container);
        }
        var elPos = dom.getPosition(el),
            containerPos = dom.getPosition(container),
            top = elPos.top - containerPos.top - util.toNumber(style.borderTopWidth) + (container === document.body ? 0 : container.scrollTop),
            left = elPos.left - containerPos.left - util.toNumber(style.borderLeftWidth) + (container === document.body ? 0 : container.scrollLeft),
            popupTop = top + owner.getHeight(),
            popupLeft = left,
            height = popup.getHeight(),
            width = popup.getWidth();

        popupEl.style.left = (popupLeft + width <= container.scrollWidth ? popupLeft : Math.max(left - width + owner.getWidth(), 0)) + 'px';
        popupEl.style.top = (popupTop + height <= container.scrollHeight ? popupTop : Math.max(top - height, 0)) + 'px';
        container.appendChild(popupEl);
        popupEl.scrollLeft = scrollLeft;
        popupEl.scrollTop = scrollTop;
    }

    /**
     * 显示弹出层控件，设置控件的弹出层显示的位置。
     * @private
     *
     * @param {ecui.ui.Control} popup 弹出层控件
     */
    function showPopup(popup) {
        popup.show();
        setPopupPosition(popup);
        core.addEventListener(popup, 'hide', hidePopupHandler);
    }

    var owners = [];

    ui.Popup = {
        NAME: '$Popup',

        getOwner: function () {
            return owners[owners.length - 1];
        },

        Methods: {
            /**
             * @override
             */
            $blur: function (event) {
                this.$Popup.$blur.call(this, event);
                this.$PopupData.popup.hide();
            },

            /**
             * @override
             */
            $click: function (event) {
                this.$Popup.$click.call(this, event);
                if (dom.contain(this.getMain(), event.target)) {
                    if (this.$PopupData.popup.isShow()) {
                        this.$PopupData.popup.hide();
                    } else {
                        this.popup();
                    }
                }
            },

            /**
             * @override
             */
            $dispose: function () {
                var el = this.$PopupData.popup.getMain();
                if (el) {
                    dom.remove(el);
                }
                this.setPopup();
                this.$Popup.$dispose.call(this);
            },

            /**
             * @override
             */
            $repaint: function (event) {
                this.$Popup.$repaint.call(this, event);

                if (this.$PopupData.popup.isShow()) {
                    setPopupPosition(this.$PopupData.popup);
                }
            },

            /**
             * @override
             */
            $scroll: function (event) {
                this.$Popup.$scroll.call(this, event);

                if (!dom.contain(this.$PopupData.popup.getMain(), event.target)) {
                    if (event.type === 'mousedown') {
                        // ie6/7/8下有可能scroll事件是由mousedown点击滚动条触发的
                        this.$PopupData.popup.hide();
                    } else if (ui.Popup.getOwner()) {
                        setPopupPosition(this.$PopupData.popup);
                    }
                }
            },

            /**
             * 获取控件的弹出层。
             * @public
             *
             * @return {ecui.ui.Control} 弹出层控件
             */
            getPopup: function () {
                return this.$PopupData.popup;
            },

            /**
             * 显示弹出层。
             * @public
             */
            popup: function () {
                if (!this.$PopupData.popup.isShow()) {
                    owners.push(this);

                    var el = this.$PopupData.popup.getMain();

                    if (!dom.parent(el)) {
                        // 第一次显示时需要进行下拉选项部分的初始化，将其挂载到 DOM 树中
                        document.body.appendChild(el);
                        showPopup(this.$PopupData.popup);
                        if (this.$initPopup) {
                            this.$initPopup();
                        }
                    } else {
                        showPopup(this.$PopupData.popup);
                    }
                }
            },

            /**
             * 设置控件的弹出层。
             * @public
             *
             * @param {ecui.ui.Control} control 弹出层控件
             */
            setPopup: function (control) {
                this.$PopupData.popup = control;
            }
        }
    };
}());
