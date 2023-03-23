/*
@example
<div ui="type:steps;step:1">
    <div>
        <strong>标题1</strong>
        标题1文本内容
    </div>
    <strong>标题2</strong>
    <strong>标题3</strong>
</div>

@fields
_nStep        - 当前的步数
_eContainer   - 容器 DOM 元素
*/
/*end*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    function changeContainer(oldItem, newItem) {
        if (oldItem && oldItem.getContainer()) {
            dom.removeClass(oldItem.getContainer(), oldItem.getType() + '-selected');
        }
        if (newItem.getContainer()) {
            dom.addClass(newItem.getContainer(), newItem.getType() + '-selected');
        }
    }

    /**
     * 步骤条控件。
     * options 属性：
     * step    当前到达了第几步，第一步取值0
     * @control
     */
    ui.Steps = core.inherits(
        ui.abstractTab,
        'ui-steps',
        function (el, options) {
            _super(el, options);
            if (options.container) {
                this._eContainer = core.$(options.container);
            }
            this._nStep = options.step || 0;
        },
        {
            /**
             * 选项部件。
             * options 属性：
             * selected    当前项是否被选中
             * @unit
             */
            Item: core.inherits(
                ui.abstractTab.prototype.Item,
                'ui-steps-item'
            ),

            /**
             * @override
             */
            $alterItems: util.blank,

            /**
             * @override
             */
            $ready: function () {
                _super.$ready();
                this._nStep = Math.min(this._nStep, this.getLength() - 1);
                for (var i = 0; i <= this._nStep; i++) {
                    var item = this.getItem(i);
                    item.alterStatus('+ready');
                }
                if (item.getContainer()) {
                    dom.addClass(item.getContainer(), item.getType() + '-selected');
                }
            },

            /**
             * 下一步。
             * @public
             */
            next: function () {
                if (this._nStep < this.getLength() - 1) {
                    var oldItem = this.getItem(this._nStep);
                    var item = this.getItem(++this._nStep);
                    item.alterStatus('+ready');
                    changeContainer(oldItem, item);
                }
            },

            /**
             * 上一步。
             * @public
             */
            prev: function () {
                if (this._nStep > 0) {
                    var item = this.getItem(this._nStep);
                    item.alterStatus('-ready');
                    changeContainer(item, this.getItem(--this._nStep));
                }
            }
        }
    );
})();
