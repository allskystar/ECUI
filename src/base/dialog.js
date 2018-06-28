/*
@example
<div ui="type:dialog">
  <!-- 这里放滚动的内容 -->
  ...
</div>

@fields
_uTitle     - 标题栏
_uClose     - 关闭按钮
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    /**
     * 窗体控件。
     * 定义独立于文档布局的内容区域，如果在其中包含 iframe 标签，在当前页面打开一个新的页面，可以仿真浏览器的多窗体效果，避免了使用 window.open 在不同浏览器下的兼容性问题。多个窗体控件同时工作时，当前激活的窗体在最上层。窗体控件的标题栏默认可以拖拽，窗体可以设置置顶方式显示，在置顶模式下，只有当前窗体可以响应操作。窗体控件的 z-index 从4096开始，页面开发请不要使用大于或等于4096的 z-index 值。
     * @control
     */
    ui.Dialog = core.inherits(
        ui.Layer,
        'ui-dialog',
        function (el, options) {
            var bodyEl = el,
                titleEl = dom.first(el);

            if (titleEl && titleEl.tagName !== 'STRONG') {
                titleEl = undefined;
            }

            el = dom.insertBefore(
                dom.create(
                    {
                        // 生成标题控件与内容区域控件对应的Element对象
                        className: el.className,
                        style: {
                            cssText: bodyEl.style.cssText
                        },
                        innerHTML: '<div class="' + options.classes.join('-close ') + '"></div>' + (titleEl ? '' : '<strong class="' + options.classes.join('-title ') + '"></strong>')
                    }
                ),
                el
            );

            if (titleEl) {
                titleEl.className += ' ' + options.classes.join('-title ');
                el.appendChild(titleEl);
            } else {
                titleEl = el.lastChild;
            }

            bodyEl.className = options.classes.join('-body ');
            bodyEl.style.cssText = '';
            el.appendChild(bodyEl);

            ui.Control.call(this, el, options);

            this._uClose = core.$fastCreate(this.Close, el.firstChild, this);
            this._uTitle = core.$fastCreate(this.Title, titleEl, this, {userSelect: false});
            this.$setBody(bodyEl);
        },
        {
            /**
             * 关闭按钮部件。
             * @unit
             */
            Close: core.inherits(
                ui.Button,
                {
                    /**
                     * 窗体关闭按钮点击关闭窗体。
                     * @override
                     */
                    $click: function (event) {
                        ui.Control.prototype.$click.call(this, event);
                        this.getParent().hide();
                    }
                }
            ),

            /**
             * 标题栏部件。
             * @unit
             */
            Title: core.inherits(
                ui.Control,
                {
                    /**
                     * 标题栏激活时触发拖动，如果当前窗体未得到焦点则得到焦点。
                     * @override
                     */
                    $activate: function (event) {
                        ui.Control.prototype.$activate.call(this, event);
                        core.drag(this.getParent(), event);
                    }
                }
            ),

            /**
             * 设置窗体控件标题。
             * @public
             *
             * @param {string} text 窗体标题
             */
            setTitle: function (text) {
                this._uTitle.setContent(text || '');
            }
        }
    );
}());
