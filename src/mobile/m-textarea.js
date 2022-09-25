/*
@example
<textarea ui="type:m-textarea"><!-- 这里放任意内容 --></textarea>
*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui;
//{/if}//
    /**
     * 移动端文本框控件。
     * 使文本框能够滑动内容区域。
     * @control
     */
    ui.MTextarea = core.inherits(
        ui.FormInput,
        'ui-mobile-textarea',
        {
            /**
             * @override
             */
            $activate: function (event) {
                var main = this.getMain();
                // 当前激活元素是当前控件，并且内容区域出现滚动时，滚动当前控件内容，阻止父级控件滚动
                if (main.clientHeight < main.scrollHeight) {
                    core.drag(this, event, {
                        absolute: true,
                        left: main.clientWidth - main.scrollWidth,
                        top: main.clientHeight - main.scrollHeight,
                        right: 0,
                        bottom: 0
                    });
                    event.stopPropagation();
                } else {
                    ui.Control.prototype.$activate.call(this, event);
                }
            },

            /**
             * @override
             */
            getX: function () {
                return -this.getMain().scrollLeft;
            },

            /**
             * @override
             */
            getY: function () {
                return -this.getMain().scrollTop;
            },

            /**
             * @override
             */
            setPosition: function (x, y) {
                var main = this.getMain();
                main.scrollLeft = -x;
                main.scrollTop = -y;
            }
        }
    );
})();
