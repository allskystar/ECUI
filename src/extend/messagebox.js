/*
模拟系统消息框。
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    var buttonInstances = [],
        instanceClass,
        MessageBox = core.inherits(
            ui.Dialog,
            true,
            'ui-messagebox',
            {
                $hide: function (event) {
                    ui.Dialog.prototype.$hide.call(this, event);
                    dom.removeClass(this.getOuter(), instanceClass);
                }
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
                }
            }
        );

    /**
     * 消息框初始化。
     * @protected
     *
     * @param {string} className 弹出框样式
     * @param {string} text 提示信息文本
     * @param {Array} buttonTexts 按钮的文本数组
     * @param {Function} ... 按钮的点击事件处理函数，顺序与参数中按钮文本定义的顺序一致
     */
    core.$messagebox = function (className, text, buttonTexts) {
        if (!instance) {
            dom.addEventListener(window, 'resize', function () {
                instance.center();
            });
        }

        var instance = core.getSingleton(
                MessageBox,
                function () {
                    return dom.create({
                        className: MessageBox.CLASS + 'ui-hide',
                        innerHTML: '<div class="ui-messagebox-content"></div><div class="ui-messagebox-buttons"></div>'
                    });
                }
            ),
            outer = instance.getOuter(),
            body = instance.getBody(),
            elContent = body.firstChild,
            elButton = body.lastChild,
            args = arguments;

        if (!dom.parent(outer)) {
            document.body.appendChild(outer);
        }

        if (!instance.isShow()) {
            for (; buttonTexts.length > buttonInstances.length; ) {
                buttonInstances.push(core.create(Button, {element: dom.create(), parent: elButton}));
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
        }

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
}());
