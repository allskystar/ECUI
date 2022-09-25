/*
@example
<div ui="type:multilevel">
    <select name="province"></select>
    <select name="city"></select>
</div>

@fields
_aItems - 用于多级联动的选项组控件列表
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    var childrenMap = {};

    function initItems(items, data) {
        items.forEach(function (item, index) {
            childrenMap[item.getUID()] = data[index].children;
            core.addEventListener(item, 'dispose', disposeHandle);
        });
    }

    function changeHandle() {
        var parent = this.getParent(),
            item = this.getSelected(),
            data = childrenMap[item.getUID()],
            index = parent._aItems.indexOf(this),
            len = parent._aItems.length - 1;

        if ((data instanceof Array && !data.length) || index === len) {
            // 当前节点没有子节点，选择结束，发送事件
            core.dispatchEvent(parent, 'input', {item: item});
            return;
        }

        if (index >= 0) {
            for (var nextItems = null; index < len; ) {
                nextItems = parent._aItems[len--];
                nextItems.removeAll();
            }
            if (nextItems) {
                if (item) {
                    var data = childrenMap[item.getUID()];
                    if (data) {
                        if (data[0]) {
                            nextItems.add(data);
                            if (!(data[0] instanceof ui.Item)) {
                                initItems(childrenMap[item.getUID()] = nextItems.getItems(), data);
                            }
                        }
                    } else {
                        // 动态取子节点信息
                    }
                }
            }
        }
    }

    function disposeHandle() {
        var data = childrenMap[this.getUID()];
        if (data && data[0] instanceof ui.Item && !data[0].getParent()) {
            data.forEach(function (item) {
                item.dispose();
            });
        }
        delete childrenMap[this.getUID()];
    }

    /**
     * 多级联动控件。
     * @control
     */
    ui.Multilevel = core.inherits(
        ui.Control,
        function (el, options) {
            ui.Control.call(this, el, options);
            this._aItems = [];
        },
        {
            /**
             * @override
             */
            $ready: function () {
                ui.Control.prototype.$ready.call(this);

                var el = this.getMain();
                dom.toArray(el.all || el.getElementsByTagName('*')).forEach(
                    function (item) {
                        if (item.getControl) {
                            item = item.getControl();
                            if (item.$Items && this._aItems.indexOf(item) < 0) {
                                this._aItems.push(item);
                                core.addEventListener(item, 'change', changeHandle);
                            }
                        }
                    },
                    this
                );
            },

            /**
             * 设置多级联动的数据。
             * @public
             *
             * @param {object} data 多级联动数据，是一个数组，每一项都包含code,value属性，children属性可以不包含，如果包含，结构与data相同
             */
            setData: function (data) {
                this._aItems.forEach(function (items) {
                    items.removeAll(true);
                });
                this._aItems[0].add(data);
                initItems(this._aItems[0].getItems(), data);
            }
        }
    );
})();
