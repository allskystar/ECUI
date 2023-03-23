//{if $css}//
ecui.__ControlStyle__('\
.ui-tab {\
    position: relative;\
\
    .ui-tab-container {\
        .ui-tab-item {\
            display: none !important;\
        }\
\
        .ui-tab-item-selected {\
            display: block !important;\
        }\
    }\
}\
');
//{/if}//
/*
@example
<div ui="type:tab;selected:1">
    <div>
        <strong>标题1</strong>
        标题1文本内容
    </div>
    <strong ui="selected:true">标题2</strong>
</div>
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 选项卡控件。
     * 每一个选项卡都包含一个头部区域与容器区域，选项卡控件存在互斥性，只有唯一的一个选项卡能被选中并显示容器区域。
     * options 属性：
     * selected    选中的选项序号，默认为0
     * @control
     */
    ui.Tab = core.inherits(
        ui.abstractTab,
        'ui-tab',
        {
            /**
             * 选项部件。
             * options 属性：
             * selected    当前项是否被选中
             * @unit
             */
            Item: core.inherits(
                ui.abstractTab.prototype.Item,
                'ui-tab-item',
                function (el, options) {
                    _super(el, options);
                    if (options.selected && options.parent) {
                        options.parent.setSelected(this);
                    }
                }
            ),

            /**
             * @override
             */
            $alterItems: util.blank,

            /**
             * @override
             */
            $create: function (options) {
                _super.$create(options);
                if (!this.getSelected()) {
                    this.setSelected(+options.selected || 0);
                }
            },

            /**
             * @override
             */
            $itemclick: function (event) {
                if (event.item.getBody().contains(event.target)) {
                    if (core.dispatchEvent(this, 'titleclick', event)) {
                        if (event.item !== this.getSelected()) {
                            this.setSelected(event.item);
                            core.dispatchEvent(this, 'change');
                        }
                    }
                } else {
                    core.dispatchEvent(this, 'containerclick', event);
                }
            },

            /**
             * 属性改变事件的默认处理。
             * @event
             */
            $propertychange: function (event) {
                if (event.name === 'selected') {
                    if (event.history) {
                        if (event.history.getContainer() && (!event.item || event.history.getContainer() !== event.item.getContainer())) {
                            dom.removeClass(event.history.getContainer(), event.history.getType() + '-selected');
                        }
                    }

                    if (event.item) {
                        if (event.item.getContainer() && (!event.history || event.history.getContainer() !== event.item.getContainer())) {
                            dom.addClass(event.item.getContainer(), event.item.getType() + '-selected');
                            core.cacheAtShow();
                        }
                    }
                }
            },

            /**
             * @override
             */
            $remove: function (event) {
                if (this.getSelected() === event.child) {
                    var list = this.getItems(),
                        index = list.indexOf(event.child);

                    // 跳到被删除项的后一项
                    this.setSelected(index === list.length - 1 ? index - 1 : index + 1);
                }

                _super.$remove(event);
            }
        },
        ui.Control.defineProperty('selected')
    );
//{if 0}//
})();
//{/if}//
