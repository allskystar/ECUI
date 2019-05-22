/*
模拟系统消息框。
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    var defaultTitle,
        buttonInstances = [],
        instanceClass,
        hideHandle = util.blank,
        tipClass = { 'success': 'tip-success', 'error': 'tip-error', 'warn': 'tip-warn' },
        MessageBox = core.inherits(
            ui.Dialog,
            true,
            'ui-messagebox',
            function (el, options) {
                el.innerHTML = '<div class="ui-messagebox-content"></div><div class="ui-messagebox-buttons"></div>';
                ui.Dialog.call(this, el, options);
            },
            {
                $hide: function (event) {
                    ui.Dialog.prototype.$hide.call(this, event);
                    dom.removeClass(this.getMain(), instanceClass);
                }
            }
        ),
        Tip = core.inherits(
            ui.Control,
            true,
            'ui-tip',
            function (el, options) {
                el.innerHTML = '<div></div>';
                ui.Control.call(this, el, options);
            }
        ),
        Button = core.inherits(
            ui.Button,
            {
                /**
                 * @override
                 */
                $click: function (event) {
                    ui.Button.prototype.$click.call(this, event);
                    core.getSingleton(MessageBox).hide();
                    event.preventDefault();
                }
            }
        );

    /**
     * 消息框初始化。
     * @protected
     *
     * @param {string} className 弹出框样式
     * @param {string|object} text 提示信息文本或信息文件的对象{title: 标题, content: 内容}
     * @param {Array} buttonTexts 按钮的文本数组
     * @param {Function} ... 按钮的点击事件处理函数，顺序与参数中按钮文本定义的顺序一致
     */
    core.$messagebox = function (className, text, buttonTexts) {
        if (!instance) {
            dom.addEventListener(
                window,
                'resize',
                function () {
                    instance.center();
                }
            );
        }

        var instance = core.getSingleton(MessageBox),
            outer = instance.getMain(),
            body = instance.getBody(),
            elContent = body.firstChild,
            elButton = body.lastChild,
            args = arguments;

        delete instance.onkeyup;

        if (!dom.parent(outer)) {
            document.body.appendChild(outer);
        }

        for (; buttonTexts.length > buttonInstances.length; ) {
            buttonInstances.push(core.create(Button, {element: dom.create(), parent: elButton}));
        }

        if ('string' === typeof text) {
            instance.setTitle(defaultTitle || location.host);
        } else {
            instance.setTitle(text.title);
            text = text.content;
        }
        core.dispose(elContent);
        elContent.innerHTML = text;
        core.init(elContent);

        buttonInstances.forEach(function (item, index) {
            if (index < buttonTexts.length) {
                item.getBody().innerHTML = buttonTexts[index];
                item.show();
            } else {
                item.hide();
            }
            item.onclick = args[index + 3];
        });

        dom.addClass(outer, className + ' ui-messagebox-origin');
        dom.removeClass(outer, 'ui-messagebox-text');
        outer.style.width = '';
        outer.style.height = '';
        instance.showModal(0.5);
        for (var width = 0, child = elContent.firstChild; child; child = child.nextSibling) {
            if (child.nodeType === 1 && dom.getStyle(child, 'display') !== 'inline') {
                width = Math.max(width, child.offsetWidth);
            }
        }
        dom.children(elContent).forEach(function (item) {
            dom.addClass(item, 'ui-messagebox-block');
        });
        dom.removeClass(outer, 'ui-messagebox-origin');
        if (!width) {
            dom.addClass(outer, 'ui-messagebox-text');
            width = body.scrollWidth;
        }
        instance.setClientSize(width, body.scrollHeight);
        instance.center();

        instanceClass = className;
    };

    /**
     * 消息框显示提示信息，仅包含确认按钮。
     * @public
     *
     * @param {string} text 提示信息文本
     * @param {Function} onok 确认按钮点击事件处理函数
     */
    core.alert = function (text, onok) {
        core.$messagebox('ui-messagebox-alert', text, ['确定'], onok);
        core.getSingleton(MessageBox).onkeyup = function (event) {
            if (event.which === 13) {
                core.dispatchEvent(buttonInstances[0], 'click');
            }
        };
    };

    /**
     * 关闭消息框。
     * @public
     *
     * @return {boolean} 消息框是否正在工作
     */
    core.closeMessageBox = function () {
        core.getSingleton(MessageBox).hide();
    };

    /**
     * 消息框显示提示信息，包含确认/取消按钮。
     * @public
     *
     * @param {string} text 提示信息文本
     * @param {Function} onok 确认按钮点击事件处理函数
     * @param {Function} oncancel 取消按钮点击事件处理函数
     */
    core.confirm = function (text, onok, oncancel) {
        core.$messagebox('ui-messagebox-confirm', text, ['确定', '取消'], onok, oncancel);
        core.getSingleton(MessageBox).onkeyup = function (event) {
            if (event.which === 13) {
                core.dispatchEvent(buttonInstances[0], 'click');
            } else if (event.which === 27) {
                core.dispatchEvent(buttonInstances[1], 'click');
            }
        };
    };

    /**
     * 检查消息框是否正在工作。
     * @public
     *
     * @return {boolean} 消息框是否正在工作
     */
    core.hasMessageBox = function () {
        return instanceClass !== undefined && core.getSingleton(MessageBox).isShow();
    };

    /**
     * 设置消息框缺省的标题。
     * @public
     *
     * @param {string} title 消息框标题
     */
    core.setMessageBoxTitle = function (title) {
        defaultTitle = title;
    };

    /**
     * 非标准消息提示框框。
     * @public
     *
     * @param {string} type 提示框类型 success、error、warn
     * @param {string} text 提示信息文本、支持html文本
     * @param {Array} delay 提示框延迟消失时间，默认2000ms
     */
    core.tip = function (type, text, delay) {
        var className = tipClass[type],
            instance = core.getSingleton(Tip),
            elContent = instance.getBody().firstChild,
            outer = instance.getMain();

        if (!dom.parent(outer)) {
            document.body.appendChild(outer);
        }

        elContent.className = className;
        elContent.innerHTML = text;

        hideHandle();
        hideHandle = util.timer(instance.hide, delay || 2000, instance);

        instance.show();
        instance.center();
    };
}());
