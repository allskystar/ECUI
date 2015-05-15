/*
MessageBox - 消息框功能。
*/
//{if 0}//
(function () {

    var core = ecui,
        dom = core.dom,

        WINDOW = window,
        MATH = Math,
        MAX = MATH.max,

        createDom = dom.create,

        createControl = core.create,
        disposeControl = core.dispose;
//{/if}//
//{if $phase == "define"}//
    var ECUI_MESSAGEBOX,
        ECUI_MESSAGEBOX_BOTTOM,
        ECUI_MESSAGEBOX_BUTTONS = [];
//{else}//
    /**
     * 消息框点击事件处理。
     * @private
     * 
     * @param {Event} event 事件对象
     */
    function ECUI_MESSAGEBOX_ONCLICK(event) {
        ECUI_MESSAGEBOX.hide();
        if (this._fAction) {
            this._fAction.call(WINDOW, event);
        }
    }

    /**
     * 消息框显示提示信息，仅包含确认按钮。
     * @protected
     * 
     * @param {string} text 提示信息文本
     * @param {Array} buttonTexts 按钮的文本数组
     * @param {Function} ... 按钮的点击事件处理函数，顺序与参数中按钮文本定义的顺序一致
     */
    core.$messagebox = function (text, buttonTexts) {
        if (!ECUI_MESSAGEBOX) {
            ECUI_MESSAGEBOX = createControl(
                'Form',
                {
                    element: createDom('ec-form ec-messagebox'),
                    hide: true,
                    parent: document.body
                }
            );

            body = ECUI_MESSAGEBOX.getBody();
            body.style.overflow = 'hidden';
            body.innerHTML =
                '<div class="ec-messagebox-text" style="position:absolute;white-space:nowrap"></div>' +
                '<div class="ec-messagebox-bottom" style="position:absolute;white-space:nowrap"></div>';
            ECUI_MESSAGEBOX_BOTTOM = createControl('Control', {element: body.lastChild});
        }

        var i = 0,
            length = buttonTexts.length,
            body = ECUI_MESSAGEBOX.getBody(),
            bottom = body.lastChild,
            o;

        if (!ECUI_MESSAGEBOX.isShow()) {
            while (length > ECUI_MESSAGEBOX_BUTTONS.length) {
                ECUI_MESSAGEBOX_BUTTONS.push(
                    createControl('Control', {element: createDom('', '', 'span'), parent: bottom})
                );
            }

            disposeControl(body = body.firstChild);
            body.innerHTML = text;

            ECUI_MESSAGEBOX.showModal(0);

            for (; o = ECUI_MESSAGEBOX_BUTTONS[i]; i++) {
                if (i < length) {
                    o.$setBodyHTML(buttonTexts[i]);
                    o.show();
                }
                else {
                    o.hide();
                }
                o._fAction = arguments[i + 2];
                o.onclick = ECUI_MESSAGEBOX_ONCLICK;
            }

            bottom.style.width = '';
            bottom.style.height = '';

            // 以下使用 length 表示 body 的高度，使用 o 表示 body 的宽度
            length = body.offsetHeight;
            o = MAX(body.offsetWidth, bottom.offsetWidth);

            ECUI_MESSAGEBOX.setBodySize(o, length + bottom.offsetHeight);
            ECUI_MESSAGEBOX.center();
            bottom.style.top = length + 'px';
            ECUI_MESSAGEBOX_BOTTOM.setSize(o);
        }
    };

    /**
     * 消息框显示提示信息，仅包含确认按钮。
     * @public
     * 
     * @param {string} text 提示信息文本
     * @param {Function} onok 确认按钮点击事件处理函数
     */
    core.alert = function (text, onok) {
        core.$messagebox(text, ['确定'], onok);
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
        core.$messagebox(text, ['确定', '取消'], onok, oncancel);
    };
//{/if}//
//{if 0}//
})();
//{/if}//