//{if $css}//
ecui.__ControlStyle__('\
.ui-mobile-confirm {\
    position: relative;\
    .m-width100rate();\
\
    .ui-mobile-confirm-title {\
        position: absolute !important;\
        top: 0px;\
        left: 0px;\
        .m-width100rate();\
        z-index: 1 !important;\
    }\
\
    .ui-mobile-confirm-layout {\
        position: relative;\
        .m-width100rate();\
        height: 100%;\
        /*解决数据多的时候确定会跟着拖动的workaround*/\
        overflow: hidden; \
    }\
}\
');
//{/if}//
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    var SubmitButton = core.inherits(
            ui.Control,
            {
                $click: function (event) {
                    _super.$click(event);
                    var popup = this.getParent();
                    core.dispatchEvent(popup.getParent(), 'confirm');
                    popup.hide();
                }
            }
        ),
        CancelButton = core.inherits(
            ui.Control,
            {
                $click: function (event) {
                    _super.$click(event);
                    this.getParent().hide();
                }
            }
        );

    /**
     * 移动端确认框接口。在当前控件外嵌套确认/取消按钮。
     * options 属性：
     * confirm     确认框的标题
     * @interface
     */
    ui.iMConfirm = core.interfaces('MConfirm', {
        constructor: function (el, options) {
            var title = dom.create({
                    className: 'ui-mobile-confirm-title',
                    innerHTML: '<div class="confirm-cancel">取消</div><div class="confirm-title">' + (options.title || '') + '</div><div class="confirm-sure">确定</div>'
                }),
                layout = dom.create({
                    className: 'ui-mobile-confirm-layout'
                });
            for (; el.firstChild;) {
                layout.appendChild(el.firstChild);
            }
            el.appendChild(layout);
            el.appendChild(title);
            dom.addClass(el, 'ui-mobile-confirm');
            if (el === this.getBody()) {
                this.$setBody(layout);
            }
            this._eTitle = title;
            core.$fastCreate(CancelButton, title.firstChild, this, {focusable: false});
            core.$fastCreate(SubmitButton, title.lastChild, this, {focusable: false});
        },

        /**
         * @override
         */
        $cache: function (style) {
            _class.$cache(style);
            this._nTitleHeight = this._eTitle.offsetHeight;
        },

        /**
         * @override
         */
        $ready: function () {
            _class.$ready();
            this.getMain().style.paddingTop = this._nTitleHeight + 'px';
        }
    });
})();
