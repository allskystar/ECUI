/*
@example
<div ui="type:m-scroll">
  <strong>窗体的标题</strong>
  <!-- 这里放窗体的内容 -->
  ...
</div>

@fields
_bScrolling - 滚动标记
_nTop       - 允许滚动的顶部范围
_nRight     - 允许滚动的右部范围
_nBottom    - 允许滚动的底部范围
_nLeft      - 允许滚动的左部范围
_oRange     - 滚动结束后回弹的区域范围，格式为[top, right, bottom, left, Y轴滚动的最小单位(用于item-scroll), X轴滚动的最小单位(用于item-scroll)]
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    /**
     * 移动端滚动控件。
     * 移动端 scroll 存在惯性，对 onscroll 直接监听的方式无法很好的实现动画效果，本控件提供对移动端滚动事件的封装。
     * @control
     */
    ui.MScroll = core.inherits(
        ui.Control,
        'ui-mobile-scroll',
        function (el, options) {
            var bodyEl = el;

            el = dom.insertBefore(
                dom.create(
                    {
                        className: el.className,
                        style: {
                            cssText: el.style.cssText
                        }
                    }
                ),
                el
            );
            bodyEl.className = options.classes.join('-body ');
            bodyEl.style.cssText = '';
            el.appendChild(bodyEl);

            ui.Control.call(this, el, options);

            this.$setBody(bodyEl);
        },
        {
            /**
             * @override
             */
            $activate: function (event) {
                ui.Control.prototype.$activate.call(this, event);

                var body = this.getBody();

                core.drag(
                    this,
                    event,
                    {
                        el: body,
                        inertia: 0.5,
                        absolute: true,
                        left: this._nLeft !== undefined ? this._nLeft : body.offsetLeft,
                        right: this._nRight !== undefined ? this._nRight : body.offsetLeft,
                        top: this._nTop !== undefined ? this._nTop : body.offsetTop,
                        bottom: this._nBottom !== undefined ? this._nBottom : body.offsetTop,
                        limit: this._oRange
                    }
                );
            },

            /**
             * @override
             */
            $dragend: function (event) {
                ui.Control.prototype.$dragend.call(this, event);
                this._bScrolling = false;
            },

            /**
             * @override
             */
            $dragmove: function (event) {
                ui.Control.prototype.$dragmove.call(this, event);
                var style = this.getBody().style;
                style.left = event.x + 'px';
                style.top = event.y + 'px';
                event.preventDefault();
            },

            /**
             * @override
             */
            $dragstart: function (event) {
                ui.Control.prototype.$dragstart.call(this, event);
                this._bScrolling = true;
                event.preventDefault();
            },

            /**
             * 获取正常显示范围，用于拖拽结束后归位设置。
             * @public
             *
             * @return {Array} 正常显示范围
             */
            getRange: function () {
                return this._oRange;
            },

            /**
             * @override
             */
            getX: function () {
                return this.getBody().offsetLeft;
            },

            /**
             * @override
             */
            getY: function () {
                return this.getBody().offsetTop;
            },

            /**
             * 是否正在滚动。
             * @public
             *
             * @return {boolean} 是否正在滚动
             */
            isScrolling: function () {
                return !!this._bScrolling;
            },

            /**
             * 设置滚动范围。
             * @public
             *
             * @param {Object} range 允许滚动的范围
             */
            setScrollRange: function (range) {
                this._nLeft = range.left;
                this._nTop = range.top;
                this._nRight = range.right;
                this._nBottom = range.bottom;
            },

            /**
             * 设置正常显示范围，用于拖拽结束后归位。
             * @public
             *
             * @param {Object} range 正常显示范围
             */
            setRange: function (range) {
                this._oRange = range;
            }
        }
    );
//{if 0}//
}());
//{/if}//
