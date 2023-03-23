/*
data - 数据变化监听插件，代码位于esr.js中，这里写针对不同控件类型的回填处理。
@example:
<div ui="ext-data:[variableName]@#[templateName]"></div>
<div ui="ext-data:[variableName]*@#[templateName]"></div>
<div ui="ext-data:[variableName]@#">[template]</div>
<div ui="ext-data:[variableName]*@#">[template]</div>
<div ui="ext-data:[variableName]@[jsFunctionName]()"></div>
<div ui="ext-data:[variableName]*@[jsFunctionName]()"></div>
<div ui="ext-data:[variableName]@()">=[js expression]</div>
<div ui="ext-data:[variableName]*@()">=[js expression]</div>
<div ui="ext-data:[variableName]@()">[jsFunctionBody]</div>
<div ui="ext-data:[variableName]*@()">=[jsFunctionBody]</div>
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ext = core.ext,
        ui = core.ui;
//{/if}//
    ext.data.Custom = [
        {
            Class: ui.Table,

            init: function () {
                return core.esr.getEngine().compile('<tr>' + this._aHeadCells.map(function (item) {
                    var etpl = item.$getOptions().etpl;
                    return '<td>' + (etpl ? etpl.replace(/{{/g, '<!--').replace(/}}/g, '-->') : '${' + item.getClass() + '}') + '</td>';
                }).join('') + '</tr>');
            },

            setData: function (data, renderer) {
                var ready = this.isReady();
                if (ready) {
                    this.removeAll();
                    this.$restoreStructure();
                }

                var hideCells = [];
                this.getHCells().forEach(function (hcell, index) {
                    if (!hcell.isShow()) {
                        hideCells.push(index);
                    }
                });

                if (data.length) {
                    dom.children(dom.create({
                        innerHTML: '<table><tbody>' + data.map(renderer).join('') + '</tbody></table>'
                    }).lastChild.lastChild).forEach(function (row) {
                        if (hideCells.length) {
                            var cells = dom.children(row);
                            hideCells.forEach(function (index) {
                                cells[index].style.display = 'none';
                            });
                        }
                        return this.$addRow(row);
                    }, this);
                } else {
                    var el = dom.create({ innerHTML: '<table><tbody><tr><td colspan="' + (this.getHCells().length - hideCells.length) + '"><div class="no-result">暂无相关结果</div></td></tr></tbody></table>' });
                    this.$addRow(el.lastChild.lastChild.lastChild);
                }

                core.init(this.getMain());

                if (ready) {
                    this.cache(true);
                    this.initStructure();
                }
            }
        },

        {
            Class: ui.Pagination,

            init: function () {},

            setData: function (data) {
                var el = this.getMain(),
                    lastEl = el.lastElementChild.lastElementChild;
                this._nTotal = data.total;

                this.setPagination(data.pageNo, data.totalPage);
                if (this._uPageSize) {
                    this._uPageSize.setValue(data.pageSize.toString());
                }
                if (this._uSkipInput) {
                    this._uSkipInput.setValue(data.pageNo);
                }
                lastEl.innerHTML = lastEl.innerHTML.replace(/(\d+)/g, data.total);
                lastEl = lastEl.previousElementSibling;
                lastEl.innerHTML = lastEl.innerHTML.replace(/(\d+)/g, data.totalPage);
                if (this._nTotal > 0) {
                    this.show();
                } else {
                    this.hide();
                }
            }
        },

        {
            Class: ui.Select,

            init: function (options) {
                var etpl = options.etpl;
                return core.esr.getEngine().compile('<div ui="value:${value}">' + (etpl ? etpl.replace(/{{/g, '<!--').replace(/}}/g, '-->') : '${text}') + '</div>');
            },

            setData: function (data, renderer) {
                var ready = this.isReady();
                if (ready) {
                    this.removeAll(true);
                } else {
                    this.preventAlterItems();
                }

                this.add(dom.children(dom.create({
                    innerHTML: data.map(renderer).join('')
                })));

                if (!ready) {
                    this.premitAlterItems();
                }
            }
        },

        {
            Class: ui.TreeView,

            init: function (options) {
                var etpl = options.etpl;
                return core.esr.getEngine().compile('<li>' + (etpl ? etpl.replace(/{{/g, '<!--').replace(/}}/g, '-->') : '${text}') + '</li>');
            },

            setData: function (data, renderer) {
                var ready = this.isReady();
                if (ready) {
                    this.removeAll(true);
                }

                dom.children(dom.create({
                    innerHTML: data.map(renderer).join('')
                })).map(function (item, index) {
                    data[index].main = item;
                    return data[index];
                }).forEach(function (item) {
                    this.add(item);
                }, this);
            }
        },

        {
            Class: ui.Multilevel,

            init: function (options) {
                var etpl = options.etpl;
                return etpl ? core.esr.getEngine().compile(etpl.replace(/{{/g, '<!--').replace(/}}/g, '-->')) : null;
            },

            setData: function (data, renderer) {
                // eslint-disable-next-line no-shadow
                function copy(data) {
                    var ret = Object.assign({}, data);
                    ret[core.TEXTNAME] = renderer(data);
                    if (data.children) {
                        ret.children = data.children.map(copy);
                    }
                    return ret;
                }

                if (renderer) {
                    data = data.map(copy);
                }
                this.setData(data);
            }
        }
    ];
//{if 0}//
})();
//{/if}//
