/*
@example
<div ui="type:m-panel"><!-- 这里放任意内容 --></div>
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        iosVersion = /(iPhone|iPad).+OS (\d+)/i.test(navigator.userAgent) ?  +(RegExp.$2) : undefined,
        safariVersion = /(\d+\.\d)(\.\d)?\s+.*safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent) ? +RegExp.$1 : undefined;
//{/if}//
    /**
     * 移动端容器控件。
     * 实现了对原生滚动操作的功能扩展。
     * @control
     */
    ui.MPanel = core.inherits(
        ui.Control,
        'ui-panel',
        ui.MScroll,
        {
            refresh: function () {
                var main = this.getMain(),
                    body = this.getBody();

                this.setPosition(Math.max(this.getX(), main.clientWidth - body.scrollWidth), Math.min(0, Math.max(this.getY(), main.clientHeight - body.scrollHeight)));
            }
        }
    );

    var oldRemove = dom.remove;
    dom.remove = function (el) {
        for (var parent = dom.parent(el); parent; parent = dom.parent(parent)) {
            if (parent.getControl) {
                var control = parent.getControl();
                if (control instanceof ui.MPanel) {
                    util.timer(control.refresh, 0, control);
                }
            }
        }
        return oldRemove(el);
    };

    function findPanel(control) {
        for (; control; control = control.getParent()) {
            if (control instanceof ui.MPanel) {
                return control;
            }
        }
    }

    if (iosVersion) {
        var keyboardHeight = 0,
            keyboardHandle = util.blank;

        dom.addEventListener(document, 'focusin', function (event) {
            if (event.target.readOnly || event.target.tagName === 'SELECT' || (event.target.tagName === 'INPUT' && (event.target.type === 'radio' || event.target.type === 'checkbox'))) {
                return;
            }

            event = core.wrapEvent(event);

            if (keyboardHeight) {
                util.timer(function () {
                    var lastScrollY = window.scrollY;
                    document.body.style.height = (util.toNumber(document.body.style.height) - keyboardHeight) + 'px';
                    window.scrollTo(0, 0);
                    var panel = findPanel(event.getControl());
                    if (panel) {
                        panel.setPosition(panel.getX(), panel.getY() - lastScrollY);
                    }
                }, 500);
            } else {
                keyboardHandle = util.timer(function () {
                    var lastScrollY = window.scrollY;
                    document.body.style.visibility = 'hidden';
                    window.scrollTo(0, 100000000);
                    util.timer(function () {
                        keyboardHeight = window.scrollY - (safariVersion ? 45 : 0);
                        document.body.style.visibility = '';
                        document.body.style.height = (util.toNumber(document.body.style.height) - keyboardHeight) + 'px';
                        window.scrollTo(0, 0);
                        var panel = findPanel(event.getControl());
                        if (panel) {
                            panel.setPosition(panel.getX(), panel.getY() - lastScrollY);
                        }
                    }, 100);
                }, 500);
            }
        });

        dom.addEventListener(document, 'focusout', function (event) {
            if (event.target.readOnly || event.target.tagName === 'SELECT' || (event.target.tagName === 'INPUT' && (event.target.type === 'radio' || event.target.type === 'checkbox'))) {
                return;
            }

            keyboardHandle();
            document.body.style.height = (util.toNumber(document.body.style.height) + keyboardHeight) + 'px';
            var panel = findPanel(core.wrapEvent(event).getControl());
            if (panel) {
                panel.refresh();
            }
        });
    }
}());
