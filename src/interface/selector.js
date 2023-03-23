//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui;
//{/if}//
    ui.iSelector = core.interfaces('Selector', {
        /**
         * 获取全部被选中的子控件。
         * @public
         *
         * @return {Array} 全部选中的子控件列表
         */
        getSelected: function () {
            var ret = [];
            this.forEach(function (item) {
                if (item.isSelected()) {
                    ret.push(item);
                }
            });
            return ret;
        },

        /**
         * 批量选择控件。
         * @public
         *
         * @param {string|ecui.ui.Control|Array} items 控件的值或控件对象或它们的数组
         */
        select: function (items) {
            if (!(items instanceof Array)) {
                items = [items];
            }
            this.forEach(function (item) {
                if (items.indexOf(item) >= 0 || items.indexOf(item.getValue ? item.getValue() : item.getContent()) >= 0) {
                    item.setSelected(true);
                }
            });
        },

        /**
         * 批量取消选择控件。
         * @public
         *
         * @param {string|ecui.ui.Control|Array} items 控件的值或控件对象或它们的数组
         */
        deselect: function (items) {
            if (!(items instanceof Array)) {
                items = [items];
            }
            this.forEach(function (item) {
                if (items.indexOf(item) >= 0 || items.indexOf(item.getValue ? item.getValue() : item.getContent()) >= 0) {
                    item.setSelected(false);
                }
            });
        }
    });
//{if 0}//
})();
//{/if}//
