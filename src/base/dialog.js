/*
@example
<div ui="type:dialog">
    <strong>标题</strong>
    窗体HTML文本
</div>
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
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
            var bodyEl = dom.create({className: this.getUnitClass(ui.Dialog, 'body')}),
                titleEl = dom.first(el),
                closeEl;

            if (titleEl && titleEl.tagName === 'STRONG') {
                dom.addClass(titleEl, this.getUnitClass(ui.Dialog, 'title'));
                dom.remove(titleEl);
            } else {
                titleEl = dom.create('STRONG', {className: this.getUnitClass(ui.Dialog, 'title')});
            }

            for (; el.firstChild; ) {
                bodyEl.appendChild(el.firstChild);
            }

            el.innerHTML = '<div class="' + this.getUnitClass(ui.Dialog, 'close') + '"></div>';
            closeEl = el.lastChild;
            el.appendChild(titleEl);
            el.appendChild(bodyEl);

            _super(el, options);

            this.Close = core.$fastCreate(this.Close, closeEl, this);
            this.Title = core.$fastCreate(this.Title, titleEl, this, {userSelect: false});
            this.$setBody(bodyEl);
        },
        {
/*ignore*/
            protected: {
                Close: undefined,
                Title: undefined
            },

            final: ['Close', 'Title'],
/*end*/
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
                        _super.$click(event);
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
                        _super.$activate(event);
                        core.drag(this.getParent(), event);
                    }
                }
            ),

            /**
             * @override
             */
            $cache: function (style) {
                _super.$cache(style);
                style = dom.getStyle(this.getBody());
                this.$$bodyBorder = [util.toNumber(style.borderTopWidth), util.toNumber(style.borderRightWidth), util.toNumber(style.borderBottomWidth), util.toNumber(style.borderLeftWidth)];
                this.$$bodyPadding = [util.toNumber(style.paddingTop), util.toNumber(style.paddingRight), util.toNumber(style.paddingBottom), util.toNumber(style.paddingLeft)];

                this.$$titleHeight = this.Title.getMain().offsetHeight;
            },

            /**
             * @override
             */
            getMinimumHeight: function () {
                return _super.getMinimumHeight() + this.$$bodyBorder[0] + this.$$bodyBorder[2] + this.$$bodyPadding[0] + this.$$bodyPadding[2] + this.$$titleHeight;
            },

            /**
             * @override
             */
            getMinimumWidth: function () {
                return _super.getMinimumWidth() + this.$$bodyBorder[1] + this.$$bodyBorder[3] + this.$$bodyPadding[1] + this.$$bodyPadding[3];
            },

            /**
             * 设置窗体控件标题。
             * @public
             *
             * @param {string} text 窗体标题
             */
            setTitle: function (text) {
                this.Title.setContent(text || '');
            }
        }
    );
}());
