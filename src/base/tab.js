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
(function () {
//{if 0}//
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
        ui.$AbstractTab,
        'ui-tab',
        function (el, options) {
            ui.$AbstractTab.call(this, el, options);

            var selectedIndex = +options.selected || 0;
            this.setSelected = function (index) {
                selectedIndex = 'number' === typeof index ? index : Math.max(0, this.getItems().indexOf(index));
            };
            this.getSelected = function () {
                return this.getItem(selectedIndex) || selectedIndex;
            };
        },
        {
            /**
             * 选项部件。
             * options 属性：
             * selected    当前项是否被选中
             * @unit
             */
            Item: core.inherits(
                ui.$AbstractTab.prototype.Item,
                'ui-tab-item',
                function (el, options) {
                    ui.$AbstractTab.prototype.Item.call(this, el, options);

                    if (options.selected && options.parent) {
                        options.parent.setSelected(options.index);
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
            $itemclick: function (event) {
                if (dom.contain(event.item.getBody(), event.target)) {
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

                ui.$AbstractTab.prototype.$remove.call(this, event);
            },

            /**
             * @override
             */
            init: function () {
                ui.$AbstractTab.prototype.init.call(this);
                var selected = this.getSelected();
                delete this.setSelected;
                delete this.getSelected;
                this.setSelected(selected);
            }
        },
        ui.Control.defineProperty('selected')
    );
}());
