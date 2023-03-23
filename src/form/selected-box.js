//{if $css}//
ecui.__ControlStyle__('\
.ui-clone {\
    position: fixed;\
    pointer-events: none;\
}\
');
//{/if}//
/*
@example
<div ui="type:selected-box;name:test">
    <div>选项一</div>
    <div>选项二</div>
    <div>选项三</div>
    <div>选项四</div>
    <div>选项五</div>
    <div>选项六</div>
    <div>选项七</div>
    <div>选项八</div>
</div>

@fields
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 选择框控件，支持拖拽选项。
     * @control
     */
    ui.SelectedBox = core.inherits(
        ui.Listbox,
        'ui-selected-box',
        {
            /**
             * 选项部件。
             * @unit
             */
            Item: core.inherits(
                ui.Listbox.prototype.Item,
                'ui-selected-box-item',
                function (el, options) {
                    _super(el, options);
                    this._oScrollHandler = util.blank;
                },
                {
                    /**
                     * @override
                     */
                    $activate: function (event) {
                        _super.$activate(event);
                        var parent = this.getParent(),
                            pos = dom.getPosition(parent.getMain()),
                            view = dom.getView(),
                            el = this.getMain();
                        this._eCloneNode = el.cloneNode(true);
                        dom.addClass(this._eCloneNode, 'ui-clone');
                        this._nOffsetY = pos.top - view.top;
                        this._eCloneNode.style.top = (dom.getPosition(el).top - pos.top) + 'px';
                        this._eCloneNode.style.left = (pos.left - view.left) + 'px';
                        dom.insertAfter(this._eCloneNode, el);
                        core.drag(
                            this,
                            event,
                            {
                                x: 0,
                                y: dom.getPosition(el).top - pos.top, // 设置起始坐标，因为实际发生移动的是CloneNode所以不能省略
                                left: 0,
                                right: 0,
                                top: 0,
                                bottom: parent.getHeight() + this.getHeight()
                            }
                        );
                    },

                    /**
                     * @override
                     */
                    $dispose: function () {
                        _super.$dispose();
                        this._eCloneNode = null;
                        this._oScrollHandler();
                    },

                    /**
                     * @override
                     */
                    $dragend: function () {
                        this._oScrollHandler();
                        dom.remove(this._eCloneNode);
                        this._eCloneNode = null;
                        var parent = this.getParent(),
                            items = parent.getItems(),
                            start = items.indexOf(this),
                            end = items.indexOf(parent.getSelecting());
                        if (start < end - 1) {
                            parent.remove(this);
                            parent.add(this, end - 1);
                        } else if (start > end) {
                            parent.remove(this);
                            parent.add(this, end);
                            // 如果从后面往前面拉到顶部，需要滚屏使刚插入的选项显示
                            var body = parent.getBody(),
                                top = end * this.getHeight();
                            if (body.scrollTop > top) {
                                body.scrollTop = top;
                            }
                        }
                    },

                    /**
                     * @override
                     */
                    $dragmove: function (event) {
                        this._oScrollHandler();
                        this._eCloneNode.style.top = (this._nOffsetY + event.y) + 'px';
                        var parent = this.getParent(),
                            height = this.getHeight(),
                            body = parent.getBody();
                        if (event.y < height && body.scrollTop > 0) {
                            // 在顶部且不是开始的标签，自动向上滚动
                            this._oScrollHandler = util.timer(function () {
                                parent.setSelecting(Math.max(0, parent.getItems().indexOf(parent.getSelecting()) - 1));
                                if (body.scrollTop <= height) {
                                    body.scrollTop = 0;
                                    this._oScrollHandler();
                                }
                                body.scrollTop -= height;
                            }, -1000, this);
                        } else if (event.clientY - event.y > height) {
                            parent.setSelecting();
                        } else if (event.clientY > event.y && body.scrollTop < body.scrollHeight - body.clientHeight) {
                            // 在尾部且不是结束的标签，自动向下滚动
                            this._oScrollHandler = util.timer(function () {
                                parent.setSelecting(Math.min(parent.getLength() - 1, parent.getItems().indexOf(parent.getSelecting()) + 1));
                                if (body.scrollTop >= body.scrollHeight - body.clientHeight - height) {
                                    body.scrollTop = body.scrollHeight - body.clientHeight;
                                    this._oScrollHandler();
                                }
                                body.scrollTop += height;
                            }, -1000, this);
                        }
                    },

                    /**
                     * @override
                     */
                    $mouseover: function () {
                        this.getParent().setSelecting(this);
                    }
                }
            )
        },
        ui.Control.defineProperty('Selecting')
    );
//{if 0}//
})();
//{/if}//
