/*
ceiling - 吸顶插件，使用ext-ceiling的方式引用，指定的吸顶时距离顶部的位置。
@example:
[HTML]:<div ui="ext-ceiling:0">...</div>
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ext = core.ext,
        util = core.util,

        isToucher = document.ontouchstart !== undefined;
//{/if}//
    var configures = {};

    ext.ceiling = {

        /**
         * 吸顶插件初始化。
         * @public
         *
         * @param {string} value 插件的参数，表示吸顶的位置
         */
        constructor: function (value) {
            configures[this.getUID()] = {
                top: +value
            };
        },

        Events: {
            dispose: function () {
                ext.ceiling.pause(this);
                delete configures[this.getUID()];
            },

            ready: function () {
                ext.ceiling.resume(this);
            },

            scroll: function () {
                var configure = configures[this.getUID()],
                    layout = dom.parent(this.getMain());
                if (configure.holder) {
                    if (isToucher) {
                        dom.setStyle(layout, 'transform', 'translate3D(0px,' + (Math.max(configure.top, dom.getPosition(configure.holder).top) + util.getView().top - util.toNumber(layout.style.top)) + 'px,0px)');
                    } else {
                        layout.style.top = Math.max(configure.top + util.getView().top, dom.getPosition(configure.holder).top) + 'px';
                    }
                }
            }
        },

        pause: function (control) {
            var el = control.getMain(),
                configure = configures[control.getUID()];

            if (configure.holder) {
                configure.cssText = el.style.cssText;
                el.style.position = 'relative';
                el.style.top = '0px';
                el.style.top = (dom.getPosition(dom.parent(el)).top - dom.getPosition(configure.holder).top) + 'px';

                document.body.removeChild(dom.parent(el));
                dom.insertBefore(el, configure.holder);
                dom.remove(configure.holder);
                delete configure.holder;
            }
        },

        resume: function (control) {
            var el = control.getMain(),
                configure = configures[control.getUID()];

            if (!configure.holder) {
                if (configure.hasOwnProperty('cssText')) {
                    el.style.cssText = configure.cssText;
                    delete configure.cssText;
                }

                var width = control.getWidth(),
                    pos = dom.getPosition(el),
                    layout = dom.create(
                        {
                            style: {
                                position: 'absolute',
                                top: Math.max(pos.top, configure.top) + 'px',
                                width: width + 'px'
                            }
                        }
                    );

                configure.holder = dom.insertBefore(
                    dom.create(
                        {
                            style: {
                                width: width + 'px',
                                height: control.getHeight() + 'px'
                            }
                        }
                    ),
                    el
                );
                layout.appendChild(el);
                document.body.appendChild(layout);
            }
        }
    };
}());
