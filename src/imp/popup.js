/*
弹出操作集合，提供了基本的点击显示/关闭操作，通过将 ecui.ui.Popup 对象下的方法复制到类的 prototype 属性下继承接口，最终对象要正常使用需要通过 setPopup 方法设置自己关联的弹出层。
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
/*ignore*/
    var ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
/*end*/
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

        var style = dom.getStyle(container),
            elPos = dom.getPosition(el),
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

    var owners = [],
        singletons = {};

    ui.Popup = _interface('$Popup', {
        /**
         * @override
         */
        $blur: function (event) {
/*ignore*/
            this.$Popup.$blur.call(this, event);
/*end*/
            this.$PopupData.control.hide();
        },

        /**
         * @override
         */
        $click: function (event) {
/*ignore*/
            this.$Popup.$click.call(this, event);
/*end*/
            if (dom.contain(this.getMain(), event.target)) {
                // popview可能动态创建，控件使用了ecui.ui.Popup，但是没有创建popcontrol 会报错
                if(this.$PopupData && this.$PopupData.control){
                    if (this.$PopupData.control.isShow()) {
                        this.$PopupData.control.hide();
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
            var el = this.$PopupData.control.getMain();
            if (el) {
                dom.remove(el);
            }
            this.setPopup();
/*ignore*/
            this.$Popup.$dispose.call(this);
/*end*/
        },

        /**
         * @override
         */
        $repaint: function (event) {
/*ignore*/
            this.$Popup.$repaint.call(this, event);
/*end*/
            if (this.$PopupData.control.isShow()) {
                setPopupPosition(this.$PopupData.control);
            }
        },

        /**
         * @override
         */
        $scroll: function (event) {
/*ignore*/
            this.$Popup.$scroll.call(this, event);
/*end*/
            // pop内容延迟加载，这个地方会报错，做一个容错
            if(this.$PopupData.control === undefined || this.$PopupData.control === null){
                return;
            }
            if (!dom.contain(this.$PopupData.control.getMain(), event.target)) {
                if (event.type === 'mousedown') {
                    // ie6/7/8下有可能scroll事件是由mousedown点击滚动条触发的
                    this.$PopupData.control.hide();
                } else if (ui.Popup.getOwner() && this.$PopupData.control.isShow()) {
                    // 当前的pop弹出的时候，才能进行该操作
                    setPopupPosition(this.$PopupData.control);
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
            return this.$PopupData.control;
        },

        /**
         * 显示弹出层。
         * @public
         */
        popup: function () {
            if (!this.$PopupData.control.isShow()) {
                owners.push(this);

                var el = this.$PopupData.control.getMain();

                if (!ecui.dom.contain(document.body, el)) {
                    // 第一次显示时需要进行下拉选项部分的初始化，将其挂载到 DOM 树中
                    document.body.appendChild(el);
                    showPopup(this.$PopupData.control);
                    if (this.$initPopup) {
                        this.$initPopup();
                    }
                } else {
                    showPopup(this.$PopupData.control);
                }
            }
        },

        /**
         * 设置控件的弹出层。
         * @public
         *
         * @param {ecui.ui.Control} control 弹出层控件
         * @param {Function} fn 打开弹出层时的初始化函数(用于单例模式，每次弹出时需要重新初始化参数)
         */
        setPopup: function (control, fn) {
            this.$PopupData.control = control;
            if (control && control.constructor.singleton && !singletons[this.getUID()]) {
                this.$PopupData.fn = fn;
                singletons[this.getUID()] = true;
                dom.addClass(control.getMain(), 'ui-popup ui-hide');
                core.addEventListener(control, 'dispose', function () {
                    delete singletons[this.getUID()];
                });
                core.addEventListener(control, 'hide', function () {
                    this.$setParent();
                });
                core.addEventListener(control, 'show', function () {
                    var parent = ui.Popup.getOwner();
                    this.$setParent(parent);
                    if (parent.$PopupData.fn) {
                        parent.$PopupData.fn.call(this);
                    }
                });
            }
        },

        //TODO，bug fix临时处理
        setPopupPosition: setPopupPosition,
        updatePosition: function () {
            if (this.$PopupData.control.isShow()) {
                setPopupPosition(this.$PopupData.control);
            }
        }
    });

    ui.Popup.getOwner = function () {
        return owners[owners.length - 1];
    };
}());
