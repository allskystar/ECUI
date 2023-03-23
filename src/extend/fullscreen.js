//{if $css}//
ecui.__ControlStyle__('\
.ui-full-screen {\
    position: fixed !important;\
    top: 0px !important;\
    left: 0px !important;\
    .width100rate();\
    .height100rate();\
}\
');
//{/if}//
/*
fullscreen - 全屏操作插件。
@example:
[HTML]:<div ui="ext-fullscreen">...</div>
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ext = core.ext,
        util = core.util,

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
//{/if}//
    ext.fullscreen = {
        constructor: function (value, options) {
            this._bBrowser = value.trim() === 'true';
            this._sTarget = options.target;
        },

        Events: {
            click: function () {
                this._bFullScreen = !this._bFullScreen;
                var target = this.getMain().parentElement;
                if (target.className.indexOf('ui-full-screen') < 0) {
                    if (target) {
                        ecui.fullScreen(target, this._bBrowser);
                    } else {
                        console.warn('没有被全屏的dom对象：' + this._sTarget);
                    }
                } else {
                    ecui.cancleFullScreen();
                }
            }
        }
    };

    var fullScreen;

    function requestFullScreen() {
        if (document.body.requestFullscreen) {
            document.body.requestFullscreen();
        } else if (document.body.webkitRequestFullScreen) {
            document.body.webkitRequestFullScreen();
        } else if (document.body.mozRequestFullScreen) {
            document.body.mozRequestFullScreen();
        } else if (document.body.msRequestFullScreen) {
            document.body.msRequestFullScreen();
        } else {
            console.warn('The browser doesn\'t support fullscreen');
        }
    }

    function cancleFullScreen() {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msCancelFullScreen) {
            document.msCancelFullScreen();
        }
    }

    /**
     * 退出全屏操作。
     * @public
     *
     */
    core.cancleFullScreen = function () {
        if (document.fullscreenElement) {
            cancleFullScreen();
        } else {
            core.repaint();
        }
        restore();
    };

    function cancelAction(event) {
        event = core.wrapEvent(event);
        if (event.which === 27) {
            // ESC
            core.cancleFullScreen();
        }
    }

    function restore() {
        dom.removeClass(fullScreen, 'ui-full-screen');
        dom.removeEventListener(window, 'keyup', cancelAction);
        dom.removeEventListener(window, 'resize', restore);
        dom.removeEventListener(document, 'fullscreenchange', restore);
    }

    /**
     * 全屏操作(允许指定的元素占满WebView)。
     * @public
     *
     * @param {HTMLElement} el 需要全屏化的元素
     * @param {boolean} browser 是否同时浏览器全屏展示
     */
    core.fullScreen = function (el, browser) {
        dom.addClass(fullScreen = el, 'ui-full-screen');
        dom.addEventListener(window, 'keyup', cancelAction);
        if (browser) {
            requestFullScreen();
            util.timer(function () {
                if (document.fullscreenElement) {
                    if (ieVersion < 10) {
                        dom.addEventListener(window, 'resize', restore);
                    } else {
                        dom.addEventListener(document, 'fullscreenchange', restore);
                    }
                } else {
                    restore();
                }
            }, 1000);
        } else {
            core.repaint();
        }
    };
})();
