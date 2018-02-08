/*
弹出操作集合，提供了基本的点击显示/关闭操作，通过将 ecui.ui.Popup 对象下的方法复制到类的 prototype 属性下继承接口，最终对象要正常使用需要通过 setPopup 方法设置自己关联的弹出层。
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    function setPopup(control) {
        var view = util.getView(),
            data = namedMap[control.getUID()],
            style = control.constructor.POPUP.getOuter().style,
            width = view.width * data[1],
            height = view.height * data[0];

        control.constructor.POPUP.setSize(view.width, view.height);

        style.backgroundColor = 'white';
        style.position = 'fixed';
        style.overflow = 'auto';
        style.top = height + 'px';
        style.left = width + 'px';
        style.display = '';
        ecui.effect.grade('this.style.left->' + (width * data[2]) + ';this.style.top->' + (height * data[2]), 1000, {$: control.constructor.POPUP.getOuter()});
    }

    var namedMap = {},
        position = {
            top: [-1, 0],
            bottom: [1, 0],
            left: [0, -1],
            right: [0, 1]
        };

    ui.MPopup = {
        NAME: '$MPopup',

        constructor: function (el, options) {
            var data = namedMap[this.getUID()] = position[options.enter || 'right'] || position.right,
                scale = options.scale;
            data[2] = scale ? Math.max(0, 1 - (scale.indexOf('%') > 0 ? +scale.slice(0, -1) / 100 : +scale)) : 0;

            if (!this.constructor.POPUP) {
                this.constructor.POPUP = core.$fastCreate(
                    ui.Control,
                    document.body.appendChild(
                        dom.create(
                            'DIV',
                            {
                                style: {
                                    display: 'none'
                                }
                            }
                        )
                    ),
                    ''
                );
            }
        },

        Methods: {
            /**
             * @override
             */
            $cache: function (style, cacheSize) {
                this.$MPopup.$cache.call(this, style, cacheSize);
                if (this.constructor.POPUP) {
                    this.constructor.POPUP.cache(true, true);
                }
            },

            /**
             * @override
             */
            $click: function (event) {
                this.$MPopup.$click.call(this, event);

                var el = this.constructor.POPUP.getOuter();
                setPopup(this);

                if (!dom.getParent(el)) {
                    // 第一次显示时需要进行下拉选项部分的初始化，将其挂载到 DOM 树中
                    document.body.appendChild(el);
                    this.constructor.POPUP.cache(true, true);
                }

                this.constructor.POPUP.show();
            },

            /**
             * @override
             */
            $dispose: function () {
                delete namedMap[this.getUID()];
                this.$MPopup.$dispose.call(this);
            },

            /**
             * @override
             */
            $repaint: function (event) {
                this.$MPopup.$repaint.call(this, event);
                setPopup(this);
            }
        }
    };
}());
