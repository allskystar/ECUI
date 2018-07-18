/*
滚动操作集合。
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    var namedMap = {};

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
                return namedMap[this.getUID()].x;
            },

            /**
             * @override
             */
            getY: function () {
                return namedMap[this.getUID()].y;
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
                var data = namedMap[this.getUID()];
                if (data.x !== x || data.y !== y) {
                    data.x = x;
                    data.y = y;
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
                data.left = range.left;
                data.top = range.top;
                data.right = range.right;
                data.bottom = range.bottom;
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
