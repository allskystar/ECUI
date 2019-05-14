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
                var el = this.getMain(),
                    uid = this.getUID(),
                    holder = configures[uid].holder;

                document.body.removeChild(dom.parent(el));
                dom.insertBefore(el, holder);
                dom.remove(holder);
                delete configures[uid];
            },

            ready: function () {
                var el = this.getMain(),
                    width = this.getWidth(),
                    pos = dom.getPosition(el),
                    layout = dom.create(
                        {
                            style: {
                                position: 'absolute',
                                top: pos.top + 'px',
                                width: width + 'px'
                            }
                        }
                    );

                configures[this.getUID()].holder = dom.insertBefore(
                    dom.create(
                        {
                            style: {
                                width: width + 'px',
                                height: this.getHeight() + 'px'
                            }
                        }
                    ),
                    el
                );
                layout.appendChild(el);
                document.body.appendChild(layout);
            },

            scroll: function () {
                var data = configures[this.getUID()],
                    layout = dom.parent(this.getMain());
                if (isToucher) {
                    dom.setStyle(layout, 'transform', 'translate3D(0px,' + (Math.max(data.top, dom.getPosition(data.holder).top) + util.getView().top - util.toNumber(layout.style.top)) + 'px,0px)');
                } else {
                    layout.style.top = Math.max(data.top + util.getView().top, dom.getPosition(data.holder).top) + 'px';
                }
            }
        }
    };
}());
