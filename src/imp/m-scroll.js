/*
滚动操作集合。
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    var namedMap = {},
        tx = /(\-?\d+)px\s*,\s*(\-?\d+)/;

    ui.MScroll = {
        NAME: '$MScroll',

        constructor: function (el, options) {
            var bodyEl = dom.create(
                    {
                        className: options.classes.join('-body ') + 'ui-mobile-scroll-body'
                    }
                );

            for (; el.firstChild; ) {
                bodyEl.appendChild(el.firstChild);
            }

            dom.addClass(el, 'ui-mobile-scroll');
            el.appendChild(bodyEl);
            this.$setBody(bodyEl);

            namedMap[this.getUID()] = {x: 0, y: 0};
        },

        Methods: {
            /**
             * @override
             */
            $activate: function (event) {
                this.$MScroll.$activate.call(this, event);

                var main = this.getMain(),
                    body = this.getBody(),
                    data = namedMap[this.getUID()];

                core.drag(
                    this,
                    event,
                    {
                        el: body,
                        decelerate: 400,
                        absolute: true,
                        left: data.left !== undefined ? data.left : main.clientWidth - body.scrollWidth,
                        right: data.right !== undefined ? data.right : 0,
                        top: data.top !== undefined ? data.top : main.clientHeight - body.scrollHeight,
                        bottom: data.bottom !== undefined ? data.bottom : 0,
                        limit: data.range
                    }
                );
            },

            /**
             * @override
             */
            $dragend: function (event) {
                this.$MScroll.$dragend.call(this, event);
                namedMap[this.getUID()].scrolling = false;
            },

            /**
             * @override
             */
            $dragstart: function (event) {
                this.$MScroll.$dragstart.call(this, event);
                namedMap[this.getUID()].scrolling = true;
            },

            /**
             * 获取正常显示范围，用于拖拽结束后归位设置。
             * @public
             *
             * @return {Array} 正常显示范围
             */
            getRange: function () {
                return namedMap[this.getUID()].range;
            },

            /**
             * 获取滚动范围。
             * @public
             *
             * @return {Array} 正常显示范围
             */
            getScrollRange: function () {
                var data = namedMap[this.getUID()];
                return {
                    left: data.left,
                    top: data.top,
                    right: data.right,
                    bottom: data.bottom
                };
            },

            /**
             * @override
             */
            getX: function () {
                return (tx.test(this.getBody().style.transform) ? +RegExp.$1 : 0) - this.getMain().scrollLeft;
            },

            /**
             * @override
             */
            getY: function () {
                return (tx.test(this.getBody().style.transform) ? +RegExp.$2 : 0) - this.getMain().scrollTop;
            },

            /**
             * 是否正在滚动。
             * @public
             *
             * @return {boolean} 是否正在滚动
             */
            isScrolling: function () {
                return !!namedMap[this.getUID()].scrolling;
            },

            /**
             * @override
             */
            setPosition: function (x, y) {
                var main = this.getMain();
                if (this.getX() !== x || this.getY() !== y) {
                    main.scrollLeft = 0;
                    main.scrollTop = 0;
                    this.getBody().style.transform = 'translate(' + x + 'px,' + y + 'px)';
                }
            },

            /**
             * 设置滚动范围。
             * @public
             *
             * @param {object} range 允许滚动的范围
             */
            setScrollRange: function (range) {
                var data = namedMap[this.getUID()];
                if (range.left !== undefined) {
                    data.left = range.left;
                }
                if (range.top !== undefined) {
                    data.top = range.top;
                }
                if (range.right !== undefined) {
                    data.right = range.right;
                }
                if (range.bottom !== undefined) {
                    data.bottom = range.bottom;
                }
            },

            /**
             * 设置正常显示范围，用于拖拽结束后归位。
             * @public
             *
             * @param {object} range 正常显示范围
             */
            setRange: function (range) {
                namedMap[this.getUID()].range = range;
            }
        }
    };
}());
