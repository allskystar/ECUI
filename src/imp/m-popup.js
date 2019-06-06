/*
移动端弹出操作集合，提供了从4个不同的方向飞入界面指定位置的操作，弹出层控件支持 enter 与 scale 初始化选项。
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        effect = core.effect,
        ui = core.ui,
        util = core.util;
//{/if}//
    function hideHandler() {
        core.mask();
        core.removeEventListener(this, 'hide', hideHandler);
    }

    var position = {
            top: ['top', true],
            bottom: ['bottom', true],
            left: ['left', false],
            right: ['right', false]
        },
        locked;

    ui.MPopup = _interface({
        private: {
            popup: undefined,
            enter: undefined,
            mask: undefined
        },

        constructor: function (el, options) {
            this.enter = (position[options.enter || 'bottom'] || position.right);
            this.mask = options.mask;
        },

        /**
         * @override
         */
        $click: function (event) {
            if (!locked) {
                var view = util.getView(),
                    popup = this.getPopup(),
                    el = popup.getMain(),
                    style = el.style;

                if (!dom.parent(el)) {
                    document.body.appendChild(el);
                }

                if (dom.contain(this.getMain(), event.target)) {
                    popup.show();
                    if (this.mask) {
                        core.mask(this.mask);
                        core.addEventListener(popup, 'hide', hideHandler);

                        util.timer(
                            function () {
                                core.addGestureListeners(popup, {
                                    tap: function (event) {
                                        if (!dom.contain(popup.getMain(), event.target)) {
                                            popup.hide();
                                            core.removeGestureListeners(popup);
                                        }
                                    }
                                });
                            },
                            100
                        );
                    }

                    style.top = style.right = style.bottom = style.left = 'auto';
                    if (this.enter[1]) {
                        var width = view.width,
                            height = popup.getHeight(),
                            reverseValue = height;
                    } else {
                        style.top = view.top + 'px';
                        width = popup.getWidth();
                        height = view.height;
                        reverseValue = width;
                    }
                    if (this.enter[2]) {
                        popup.setSize(width, height);
                    }

                    locked = true;
                    effect.grade(
                        'this.style.' + this.enter[0] + '=#' + (-reverseValue) + '->0px#',
                        400,
                        {
                            $: el,
                            onfinish: function () {
                                locked = false;
                            }
                        }
                    );
                }
            }
        },

        /**
         * @override
         */
        $dispose: function () {
            var el = this.popup.getMain();
            if (el) {
                dom.remove(el);
            }

            this.setPopup();
        },

        /**
         * @override
         */
        $repaint: function () {
            var popup = this.getPopup();
            if (popup.isShow()) {
                var view = util.getView();
                popup.setSize(view.width, view.height);
            }
        },

        /**
         * 获取控件的弹出层。
         * @public
         *
         * @return {ecui.ui.Control} 弹出层控件
         */
        getPopup: function () {
            return this.popup;
        },

        /**
         * 设置控件的弹出层。
         * @public
         *
         * @param {ecui.ui.Control} control 弹出层控件
         */
        setPopup: function (control) {
            if (control) {
                this.popup = control;
            } else {
                delete this.popup;
            }
        }
    });
}());
