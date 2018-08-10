/*
弹出操作集合，提供了基本的点击显示/关闭操作，通过将 ecui.ui.Popup 对象下的方法复制到类的 prototype 属性下继承接口，最终对象要正常使用需要通过 setPopup 方法设置自己关联的弹出层。
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    /**
     * 设置控件的弹出层显示的位置。
     * @public
     */
    function setPopupPosition() {
        var popupEl = this.getOuter();
        dom.remove(popupEl);

        for (var el = owner.getOuter(), container = dom.parent(el); container !== document.body; container = dom.parent(container)) {
            if (container.scrollHeight !== container.clientHeight) {
                break;
            }
        }
        if (dom.getStyle(container, 'position') === 'static') {
            container.style.position = 'relative';
        }

        var top = 0,
            left = 0;
        for (; el !== container; ) {
            top += el.offsetTop;
            left += el.offsetLeft;
            el = el.offsetParent;
        }

        var popupTop = top + owner.getHeight(),
            height = this.getHeight();

        popupEl.style.left = left + 'px';
        popupEl.style.top = (popupTop + height <= container.scrollHeight ? popupTop : Math.max(top - height, 0)) + 'px';
        container.appendChild(popupEl);
    }

    var owner;

    ui.Popup = {
        NAME: '$Popup',

        getOwner: function () {
            return owner;
        },

        Methods: {
            /**
             * @override
             */
            $click: function (event) {
                this.$Popup.$click.call(this, event);
                var popup = this.$PopupData.popup;
                if (dom.contain(this.getOuter(), event.target)) {
                    if (popup.isShow()) {
                        owner = null;

                        popup.hide();
                    } else {
                        owner = this;

                        var el = popup.getOuter();

                        if (!dom.parent(el)) {
                            // 第一次显示时需要进行下拉选项部分的初始化，将其挂载到 DOM 树中
                            document.body.appendChild(el);
                            popup.show();
                            if (this.$initPopup) {
                                this.$initPopup();
                            }
                        } else {
                            popup.show();
                        }
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
                    setPopupPosition.call(this.$PopupData.popup);
                }
            },

            /**
             * @override
             */
            $scroll: function (event) {
                this.$Popup.$scroll.call(this, event);

                if (event.type === 'mousedown' && !dom.contain(this.$PopupData.popup.getOuter(), event.target)) {
                    // ie6/7/8下有可能scroll事件是由mousedown点击滚动条触发的
                    this.$PopupData.popup.hide();
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
             * 设置控件的弹出层。
             * @public
             *
             * @param {ecui.ui.Control} control 弹出层控件
             */
            setPopup: function (control) {
                if (this.$PopupData.popup) {
                    core.removeEventListener(this.$PopupData.popup, 'show', setPopupPosition);
                    delete this.$PopupData.popup;
                }
                if (control) {
                    core.addEventListener(control, 'show', setPopupPosition);
                    this.$PopupData.popup = control;
                }
            }
        }
    };
}());
