/*
@example
<div ui="type:m-panel"><!-- 这里放任意内容 --></div>
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 移动端容器控件。
     * 实现了对原生滚动操作的功能扩展。
     * @control
     */
    ui.MPanel = core.inherits(
        ui.Control,
        'ui-mobile-panel',
        [
            function (el) {
                dom.addClass(el, 'ui-mobile-panel-location');
            }
        ],
        {
            /**
             * @override
             */
            $dragend: function (event) {
                ui.Control.prototype.$dragend.call(this, event);
                var activeElement = document.activeElement;
                if (util.hasIOSKeyboard(activeElement)) {
                    // dom.remove(activeElement.previousSibling);
                    // activeElement.style.display = '';
                    // activeElement.style.visibility = '';
                    this._oHandler = util.timer(
                        function () {
                            dom.setStyle(activeElement, 'userSelect', '');
                            delete this._oHandler;
                        },
                        50,
                        this
                    );
                }

            },

            /**
             * @override
             */
            $dragstart: function (event) {
                ui.Control.prototype.$dragstart.call(this, event);
                if (util.hasIOSKeyboard(document.activeElement)) {
                    if (this._oHandler) {
                        this._oHandler();
                    } else {
                        dom.setStyle(document.activeElement, 'userSelect', 'none');
                    }
                    // dom.insertBefore(dom.create(document.activeElement.tagName, {
                    //     value: document.activeElement.value,
                    //     className: document.activeElement.className,
                    //     style: {
                    //         cssText: document.activeElement.style.cssText
                    //     }
                    // }), document.activeElement);
                    // document.activeElement.style.visibility = 'hidden';
                    // document.activeElement.style.display = 'none';
                }
            },

            /**
             * @override
             */
            $initStructure: function (width, height) {
                ui.Control.prototype.$initStructure.call(this, width, height);
                this.$setSize(width, height);
                dom.removeClass(this.getMain(), 'ui-mobile-panel-location');
            },

            /**
             * @override
             */
            $resize: function (event) {
                ui.Control.prototype.$resize.call(this, event);
                dom.addClass(this.getMain(), 'ui-mobile-panel-location');
            }
        },
        ui.MScroll,
        {
            /**
             * @override
             */
            $activate: function (event) {
                if (!util.hasIOSKeyboard(event.target)) {
                    ui.MScroll.Methods.$activate.call(this, event);
                }
            }
        }
    );
}());
