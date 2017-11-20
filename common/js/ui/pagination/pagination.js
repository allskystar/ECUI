/*
pagination - 分页控件。
定制分页控件，继承自基础控件

分页视图控件直接HTML初始化的例子:
<div ui="type:pagination;page:1-20;total:304";id:test></div>

外部调用获取当前点击页数的方法（通过在外部定义go方法，进行业务代码实现）:
ecui.get('test').go = function(pageNo){
    console.log(pageNo);
}

属性
_nCurrentPage     - 当前页数
_nTotalPage       - 总页数

*/
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;

    ui.Pagination = core.inherits(
        ui.Control,
        'ui-pagination',
        function (el, options) {
            ui.Control.call(this, el, options);
            var offset = options.page.split('-');
            var pageSize = +offset[1] - offset[0] + 1;
            // 定义当前页数
            this._nCurrentPage = Math.ceil(+offset[1] / pageSize);
            // 定义总页数
            this._nTotalPage = Math.ceil(options.total / pageSize);
        },
        {
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

                    if (this.go && this.go(this._nCurrentPage) !== false) {
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
                this.getMain().innerHTML = util.stringFormat('<{0}>&lt;&lt;</{0}><{0}>&lt;</{0}>', currentPage === 1 ? 'font' : 'span') + html.join('') + util.stringFormat('<{0}>&gt;</{0}><{0}>&gt;&gt;</{0}>', currentPage === totalPage ? 'font' : 'span');
            }
        }
    );
}());