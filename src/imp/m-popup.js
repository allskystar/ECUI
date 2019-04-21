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
        if (this.$MPopupData.parent) {
            this.$MPopupData.parent.insertBefore(this.getOuter(), this.$MPopupData.next);
        }
    }

    var position = {
            top: ['top', true],
            bottom: ['bottom', true],
            left: ['left', false],
            right: ['right', false]
        },
        locked;

    ui.MPopup = {
        NAME: '$MPopup',

        constructor: function (el, options) {
            this.$MPopupData.enter = (position[options.enter || 'bottom'] || position.right);
            this.$MPopupData.mask = options.mask;
        },

        Methods: {
            /**
             * @override
             */
            $click: function (event) {
                if (!locked) {
                    var view = util.getView(),
                        data = this.$MPopupData,
                        popup = this.getPopup(),
                        el = popup.getOuter(),
                        style = el.style;

                    this.$MPopupData.parent = dom.parent(el);
                    if (this.$MPopupData.parent !== document.body) {
                        this.$MPopupData.next = el.nextSibling;
                        // 第一次显示时需要进行下拉选项部分的初始化，将其挂载到 DOM 树中
                        document.body.appendChild(el);
                    } else {
                        delete this.$MPopupData.parent;
                    }

                    this.$MPopup.$click.call(this, event);

                    if (dom.contain(this.getOuter(), event.target)) {
                        popup.show();
                        if (data.mask) {
                            core.mask(data.mask);
                            core.addEventListener(popup, 'hide', hideHandler);

                            util.timer(function () {
                                core.addGestureListeners(popup, {
                                    tap: function (event) {
                                        if (!dom.contain(popup.getMain(), event.target)) {
                                            popup.hide();
                                            core.removeGestureListeners(popup);
                                        }
                                    }
                                });
                            }, 100);
                        }

                        style.top = style.right = style.bottom = style.left = 'auto';
                        if (data.enter[1]) {
                            var width = view.width,
                                height = popup.getHeight(),
                                reverseValue = height;
                        } else {
                            style.top = view.top + 'px';
                            width = popup.getWidth();
                            height = view.height;
                            reverseValue = width;
                        }
                        if (data.enter[2]) {
                            popup.setSize(width, height);
                        }

                        locked = true;
                        effect.grade(
                            'this.style.' + data.enter[0] + '=#' + (-reverseValue) + '->0px#',
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
                var el = this.$MPopupData.popup.getOuter();
                if (el) {
                    dom.remove(el);
                }

                this.setPopup();
                this.$MPopup.$dispose.call(this);
            },

            /**
             * @override
             */
            $repaint: function (event) {
                this.$MPopup.$repaint.call(this, event);

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
                return this.$MPopupData.popup;
            },

            /**
             * 设置控件的弹出层。
             * @public
             *
             * @param {ecui.ui.Control} control 弹出层控件
             */
            setPopup: function (control) {
                if (control) {
                    this.$MPopupData.popup = control;
                } else {
                    delete this.$MPopupData.popup;
                }
            }
        }
    };
}());
