/*
@example
<form action="javascript: void(0);" ui="type:b-m-send-text;len:1-20">
    <input maxlength="20" type="text" placeholder="请输入">
    <input type="text" class="send"/>
</form>
或
<div ui="type:BMSendText;len:1-20">
    <input maxlength="20" type="text" placeholder="请输入">
    <input type="text" class="send"/>
</div>
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        util = core.util,
        iosVersion = /(iPhone|iPad).*?OS (\d+(_\d+)?)/i.test(navigator.userAgent) ?  +(RegExp.$2.replace('_', '.')) : undefined,
        ui = core.ui;
//{/if}//
    /**
     * 移动端发送信息控件。
     * @control
     */
    ui.BMSendText = core.inherits(
        ecui.ui.Text,
        'ui-m-send-text',
        function (el, options) {
            ecui.ui.Text.call(this, el, options);
            ecui.$fastCreate(this.Send, dom.last(el), this, options);
        },
        {
            /**
             * 发送按钮部件。
             * @unit
             */
            Send: ecui.inherits(
                ecui.ui.Control,
                {
                    /**
                     * 按钮点击事件。
                     * 阻止冒泡
                     *
                     */
                    onclick: function (event) {
                        event.preventDefault();
                        event.stopPropagation();
                        return false;
                    },

                    /**
                     * 获得焦点事件。
                     * 发送按钮获得焦点后，将焦点转移到内容输入框上
                     *
                     */
                    onfocus: iosVersion ? function () {
                        var parent = this.getParent();
                        // 设置文本输入框获得焦点
                        if (parent.getValue() === '') {
                            this._bEmpty = true;
                            parent.setValue(parent.getInput().placeholder);
                            parent.setSelection(parent.getValue().length);
                        } else {
                            parent.setSelection(0, 0);
                        }
                        util.timer(function () {
                            if (this._bEmpty) {
                                delete this._bEmpty;
                                parent.setValue('');
                                parent.setSelection(0, 0);
                            } else {
                                parent.setSelection(parent.getValue().length);
                            }
                            core.setFocused(parent);
                        }, 0, this);
                    } : util.blank
                }
            )
        }
    );
}());