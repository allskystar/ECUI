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

        isToucher = document.ontouchstart !== undefined,
        iosVersion = /(iPhone|iPad).+OS (\d+)/i.test(navigator.userAgent) ?  +(RegExp.$2) : undefined,
        safariVersion = !/(chrome|crios|ucbrowser)/i.test(navigator.userAgent) && /(\d+\.\d)(\.\d)?\s+.*safari/i.test(navigator.userAgent) ? +RegExp.$1 : undefined;
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

    function findPanel(el) {
        for (var control = core.findControl(el); control; control = control.getParent()) {
            if (control instanceof ui.MPanel) {
                return control;
            }
        }
    }

    if (isToucher) {
        if (iosVersion) {
            var keyboardHeight = 0,
                keyboardHandle = util.blank,
                focusout,
                basicHeight;

            core.ready(function () {
                basicHeight = util.toNumber(document.body.style.height);
            });

            dom.addEventListener(document, 'focusin', function (event) {
                keyboardHandle();

                if (event.target.readOnly || event.target.tagName === 'SELECT' || (event.target.tagName === 'INPUT' && (event.target.type === 'radio' || event.target.type === 'checkbox'))) {
                    return;
                }

                var target = event.target,
                    panel = findPanel(target);

                if (keyboardHeight) {
                    keyboardHandle = util.timer(function () {
                        if (panel) {
                            if (focusout) {
                                panel.setPosition(panel.getX(), Math.min(0, Math.max(panel.getY() - window.scrollY, dom.getPosition(panel.getOuter()).top - target.offsetTop + (panel.getHeight() - keyboardHeight - target.offsetHeight) / 2)));
                            } else {
                                document.body.style.height = (basicHeight - keyboardHeight) + 'px';
                                panel.setPosition(panel.getX(), panel.getY() - window.scrollY);
                            }
                            window.scrollTo(0, 0);
                        }
                    }, 500);
                } else {
                    keyboardHandle = util.timer(function () {
                        var lastScrollY = window.scrollY;
                        document.body.style.visibility = 'hidden';
                        window.scrollTo(0, 100000000);
                        util.timer(function () {
                            keyboardHeight = window.scrollY + document.body.clientHeight - document.body.scrollHeight - (safariVersion ? 45 : 0);
                            document.body.style.visibility = '';
                            document.body.style.height = (basicHeight - keyboardHeight) + 'px';

                            if (panel) {
                                panel.setPosition(panel.getX(), panel.getY() - lastScrollY);
                                window.scrollTo(0, 0);
                            } else {
                                window.scrollTo(0, lastScrollY);
                            }
                        }, 100);
                    }, 500);
                }
            });

            dom.addEventListener(document, 'focusout', function (event) {
                keyboardHandle();

                if (event.target.readOnly || event.target.tagName === 'SELECT' || (event.target.tagName === 'INPUT' && (event.target.type === 'radio' || event.target.type === 'checkbox'))) {
                    return;
                }

                focusout = true;
                keyboardHandle = util.timer(function () {
                    focusout = false;
                    document.body.style.height = basicHeight + 'px';
                    var panel = findPanel(event.target);
                    if (panel) {
                        panel.refresh();
                    }
                }, 300);
            });
        } else {
            // android，处理软键盘问题
            dom.addEventListener(window, 'resize', function () {
                if (document.documentElement.clientHeight < util.toNumber(document.body.style.height)) {
                    document.activeElement.scrollIntoViewIfNeeded();

                    var panel = findPanel(document.activeElement);

                    if (panel) {
                        panel.setPosition(panel.getX(), panel.getY() - window.scrollY);
                        window.scrollTo(0, 0);
                    }
                }
            });

            dom.addEventListener(document, 'focusout', function (event) {
                var panel = findPanel(event.target);
                if (panel) {
                    panel.refresh();
                }
            });
        }
    }
}());
