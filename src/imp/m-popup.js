/*
移动端弹出操作集合，提供了从4个不同的方向飞入界面指定位置的操作，弹出层控件支持 enter 与 scale 初始化选项。
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    function hideHandler() {
        core.mask();
        core.removeEventListener(this, 'hide', hideHandler);
    }

    var namedMap = {},
        position = {
            top: ['bottom', true],
            bottom: ['top', true],
            left: ['right', false],
            right: ['left', false]
        },
        locked;

    ui.MPopup = {
        NAME: '$MPopup',

        constructor: function (el, options) {
            var data = namedMap[this.getUID()] = namedMap[this.getUID()] || {};
            data.enter = (position[options.enter || 'bottom'] || position.right).concat([options.scale ? Math.min(1, options.scale.indexOf('%') > 0 ? +options.scale.slice(0, -1) / 100 : +options.scale) : 0]);
            data.mask = options.mask;
        },

        Methods: {
            /**
             * @override
             */
            $click: function (event) {
                if (!locked) {
                    var view = util.getView(),
                        data = namedMap[this.getUID()],
                        popup = this.getPopup(),
                        el = popup.getOuter(),
                        style = el.style;

                    if (!dom.parent(el)) {
                        // 第一次显示时需要进行下拉选项部分的初始化，将其挂载到 DOM 树中
                        core.getBody().appendChild(el);
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
                                height = data.enter[2] ? view.height * data.enter[2] : popup.getHeight(),
                                initValue = view.height + view.top,
                                reverseValue = height;
                        } else {
                            style.top = view.top + 'px';
                            width = data.enter[2] ? view.width * data.enter[2] : popup.getWidth();
                            height = view.height;
                            initValue = view.width + view.left;
                            reverseValue = width;
                        }
                        if (data.enter[2]) {
                            popup.setSize(width, height);
                        }
                        style[data.enter[0]] = initValue + 'px';

                        locked = true;
                        ecui.effect.grade(
                            'round:this.style.' + data.enter[0] + '->' + Math.round(initValue - reverseValue),
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
                this.setPopup();
                delete namedMap[this.getUID()];
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
                return namedMap[this.getUID()].popup;
            },

            /**
             * 设置控件的弹出层。
             * @public
             *
             * @param {ecui.ui.Control} control 弹出层控件
             */
            setPopup: function (control) {
                namedMap[this.getUID()] = namedMap[this.getUID()] || {};
                if (control) {
                    namedMap[this.getUID()].popup = control;
                } else {
                    delete namedMap[this.getUID()].popup;
                }
            }
        }
    };
}());
