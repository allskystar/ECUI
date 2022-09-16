/*
@example
<div ui="type:layer">
  <!-- 这里放滚动的内容 -->
  ...
</div>
*/
/*ignore*/
/*
@fields
_bCenter     - 是否居中显示s
_fModal      - 用于关闭mask层的函数s
*/
/*end*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
    var layers = [],    // 当前显示的全部窗体
        modalCount = 0;  // 当前showModal的窗体数

    /**
     * 刷新所有显示的窗体的zIndex属性。
     * @private
     */
    function refresh(layer) {
        util.remove(layers, layer);
        layers.push(layer);

        // 改变当前窗体之后的全部窗体z轴位置，将当前窗体置顶
        layers.forEach(function (item, index) {
            index = 16384 + index * 2;
            item.getMain().style.zIndex = index;
            if (item._fModal) {
                item._fModal.setZIndex(index - 1);
            }
        });
    }

    /**
     * 窗体控件。
     * 定义独立于文档布局的内容区域，如果在其中包含 iframe 标签，在当前页面打开一个新的页面，可以仿真浏览器的多窗体效果，避免了使用 window.open 在不同浏览器下的兼容性问题。多个窗体控件同时工作时，当前激活的窗体在最上层。窗体控件的标题栏默认可以拖拽，窗体可以设置置顶方式显示，在置顶模式下，只有当前窗体可以响应操作。窗体控件的 z-index 从4096开始，页面开发请不要使用大于或等于4096的 z-index 值。
     * @control
     */
    ui.Layer = core.inherits(
        ui.Control,
        {
            /**
             * 销毁窗体时需要先关闭窗体，并不再保留窗体的索引。
             * @override
             */
            $dispose: function () {
                if (layers.indexOf(this) >= 0) {
                    // 窗口处于显示状态，需要强制关闭
                    this.$hide();
                }
                ui.Control.prototype.$dispose.call(this);
            },

            /**
             * 窗体控件获得焦点时需要将自己置于所有窗体控件的顶部。
             * @override
             */
            $focus: function () {
                ui.Control.prototype.$focus.call(this);
                refresh(this);
            },

            /**
             * 窗体隐藏时将失去焦点状态，如果窗体是以 showModal 方式打开的，隐藏窗体时，需要恢复页面的状态。
             * @override
             */
            $hide: function () {
                // showModal模式下隐藏窗体需要释放遮罩层
                var i = layers.indexOf(this);
                if (i >= 0) {
                    layers.splice(i, 1);

                    if (this._fModal) {
                        this._fModal();
                        delete this._fModal;
                    }
                    core.loseFocus(this);
                }

                this._bCenter = false;
                ui.Control.prototype.$hide.call(this);
            },

            /**
             * 窗体显示时将获得焦点状态。
             * @override
             */
            $initStructure: function () {
                ui.Control.prototype.$initStructure.call(this);
                if (this._bCenter) {
                    this.center();
                }
            },

            /**
             * @override
             */
            $ready: function () {
                ui.Control.prototype.$ready.call(this);
                if (this.isCached()) {
                    layers.push(this);
                }
            },

            /**
             * 窗体显示时将获得焦点状态。
             * @override
             */
            $show: function () {
                layers.push(this);
                ui.Control.prototype.$show.call(this);
                core.setFocused(this);
            },

            /**
             * 设置居中时如果窗体大小发生变化，也将触发居中处理。
             * @override
             */
            center: function (top) {
                ui.Control.prototype.center.call(this, top);
                this._bCenter = true;
            },

            /**
             * @override
             */
            show: function () {
                var result = ui.Control.prototype.show.call(this);
                refresh(this);
                return result;
            },

            /**
             * 窗体以独占方式显示
             * showModal 方法将窗体控件以独占方式显示，此时鼠标点击窗体以外的内容无效，关闭窗体后自动恢复。
             * @public
             *
             * @param {number} opacity 遮罩层透明度，默认为0.5
             */
            showModal: function (opacity) {
                if (!this._fModal) {
                    this.center();
                    this._fModal = core.mask(opacity !== undefined ? opacity : 0.5);
                    this.show();
                }
            }
        }
    );
}());
    