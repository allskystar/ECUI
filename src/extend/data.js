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
                return etpl.compile('<tr>' + this._aHeadCells.map(function (item) {
                    return '<td>' + (item.$getOptions().etpl || '${' + item.getClass() + '}') + '</td>';
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

                if (ready) {
                    this.cache(true);
                    this.initStructure();
                }
            }
        },

        {
            Class: ui.Select,

            init: function (options) {
                return etpl.compile('<div ui="value:${value}">' + (options.etpl || '${text}') + '</div>');
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
                return etpl.compile('<li>' + (options.etpl || '${text}') + '</li>');
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
                return options.etpl ? etpl.compile(options.etpl) : null;
            },

            setData: function (data, renderer) {
                // eslint-disable-next-line no-shadow
                function copy(data) {
                    var ret = Object.assign({}, data);
                    ret[this.TEXTNAME || '#text'] = renderer(data);
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
