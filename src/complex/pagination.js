/*
pagination - 分页控件。
定制分页控件，继承自基础控件

分页视图控件直接HTML初始化的例子:
<div ui="type:pagination;total:304;id:test;page:0,674,20,34;route:customerListTable;hasPageSize:true;skipInput:true;"></div>

外部调用获取当前点击页数的方法（通过在外部定义go方法，进行业务代码实现）:
ecui.get('test').go = function (pageNo){
    console.log(pageNo);
}

属性
_nCurrentPage     - 当前页数
_nTotalPage       - 总页数

*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    ui.Pagination = core.inherits(
        ui.Control,
        'ui-pagination',
        function (el, options) {
            ui.Control.call(this, el, options);
            // page值的形式: offset,total,pageSize,totalPage
            var page = options.page.split(',');
            // 定义当前页数
            this._nCurrentPage = Math.ceil((+page[0] + 1) / +page[2]);
            // 定义总页数
            this._nTotalPage = +page[3];

            el.innerHTML = '<div class="pagination"></div>' +
                            '<div class="pagination-msgBox clearfix">' +
                            (options.hasPageSize ? this.pageSizes : '') +
                            (options.skipInput ? '<div class="pagination-msg">跳至<input class="ui-text ui-input" value="' + this._nCurrentPage + '" />页</div>' : '') +
                            '<div class="pagination-msg">共' + this._nTotalPage + '页</div>' +
                            '<div class="pagination-msg">共' + page[1] + '条</div>' +
                            '</div>';

            this.$setBody(dom.first(el));
            var childrens = dom.children(el);
            if (options.hasPageSize) {
                core.$fastCreate(
                    this.Select,
                    dom.first(childrens[1]),
                    this,
                    { value: page[2] }
                );
            }
            if (options.skipInput) {
                core.$fastCreate(
                    this.Number,
                    dom.first(options.hasPageSize ? dom.children(childrens[1])[1] : dom.first(childrens[1])),
                    this,
                    { min: 1, max: +page[3] }
                );
            }
        },
        {
            Select: core.inherits(
                ui.Select,
                {
                    $change: function (event) {
                        ui.Select.prototype.$change.call(this, event);
                        this.getParent().go(null, +this.getValue());
                    }
                }
            ),

            Number: core.inherits(
                ui.Number,
                {
                    $keydown: function (event) {
                        ui.Number.prototype.$keydown.call(this, event);
                        if (event.which === 13) {
                            // 回车跳转到指定页
                            this.go();
                        }
                    },

                    $blur: function (event) {
                        ui.Number.prototype.$blur.call(this, event);
                        this.go();
                    },
                    go: function () {
                        var parent = this.getParent();
                        parent.setPagination(+this.getValue());
                        parent.go(parent._nCurrentPage);
                    }
                }
            ),

            /**
             * 分页条数选择数据
             */
            pageSizes:
                '<div class="pagination-msg page-size ui-select ui-input">' +
                    '<div ui="value:10">10条/页</div>' +
                    '<div ui="value:20">20条/页</div>' +
                    '<div ui="value:40">40条/页</div>' +
                    '<div ui="value:80">80条/页</div>' +
                    '<div ui="value:100">100条/页</div>' +
                    '<div ui="value:200">200条/页</div>' +
                '</div>',
            /**
             * 分页展示格式,表示
             *
             * @param {number} maxPage    分页数字按钮区域最多展示按钮个数
             * @param {number} middlePage 分页数字按钮区中心按钮
             */
            PAGEFORMAT: { maxPage: 10, middlePage: 5},
            /**
             * 分页区域整体点击时，根据点击的节点来进行不同的处理
             * @override
             */
            $click: function (event) {
                ui.Control.prototype.$click.call(this, event);
                var target = event.target;
                // 对处于disalbed的按钮、空白区域、按钮的margin区域以外的分页按钮进行点击事件处理
                if (target.tagName === 'SPAN') {
                    // 获取target的内容
                    var text = dom.getText(target);
                    switch (text) {
                    case '<<':
                        this._nCurrentPage = 1;
                        break;
                    case '<':
                        this._nCurrentPage = this._nCurrentPage - 1;
                        break;
                    case '>':
                        this._nCurrentPage = this._nCurrentPage + 1;
                        break;
                    case '>>':
                        this._nCurrentPage = this._nTotalPage;
                        break;
                    default:
                        this._nCurrentPage = +text;
                        break;
                    }

                    if (this.go(this._nCurrentPage) !== false) {
                        this.setPagination();
                    }
                }
            },
            /**
             * 初始化完成后，填充数字按钮区域。
             * @override
             */
            $ready: function (options) {
                ui.Control.prototype.$ready.call(this, options);
                // 填充数字按钮区域
                this.setPagination();

            },
            /**
             * 生成并填充分页数字按钮区域。
             * @public
             *
             * @param {number} current 当前页码
             * @param {number} total   总页数(如果不传，则沿用原来的总页数)
             */
            setPagination: function (current, total) {
                var currentPage = this._nCurrentPage = current || this._nCurrentPage,
                    totalPage = this._nTotalPage = total || this._nTotalPage,
                    html = [],
                    maxPage = this.PAGEFORMAT.maxPage,
                    middlePage = this.PAGEFORMAT.middlePage;

                for (var start = Math.max(1, Math.min(totalPage - maxPage + 1, currentPage - middlePage + 1)), end = Math.min(totalPage, Math.max(maxPage, currentPage + maxPage - middlePage)); start <= end; start++) {
                    html.push(start === currentPage ? '<strong>' + start + '</strong>' : '<span>' + start + '</span>');
                }

                // 填充数字按钮区
                this.getBody().innerHTML = util.formatString('<{0} class="first">&lt;&lt;</{0}><{0} class="prev">&lt;</{0}>', currentPage === 1 ? 'font' : 'span') + html.join('') + util.formatString('<{0} class="next">&gt;</{0}><{0} class="last">&gt;&gt;</{0}>', currentPage === totalPage ? 'font' : 'span');
            },
            go: function (pageNo, pageSize) {
/*                var routeUrl = ecui.esr.findRoute(this).NAME;
                if (pageNo) {
                    routeUrl += '~pageNo=' + pageNo;
                }
                if (pageSize) {
                    routeUrl += '~pageSize=' + pageSize;
                }
                ecui.esr.callRoute(routeUrl, true);
                if (pageNo) {
                    this._nCurrentPage = pageNo;
                }*/
            }
        }
    );
})();
