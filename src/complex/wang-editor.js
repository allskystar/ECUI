//{if $css}//
__ControlStyle__('\
.ui-wang-editor {\
    cite {\
        display: inline-block;\
        position: relative;\
        font-size: 16px;\
        border-radius: 4px;\
        background-color: #F3F3F3;\
        color: #646A73;\
    }\
    cite:after {\
        content: \' \';\
        position: absolute;\
        width: 16px;\
        height: 16px;\
        right: 0;\
        top: 2px;\
        z-index: 1;\
        background: url(\'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOHB4IiBoZWlnaHQ9IjhweCIgdmlld0JveD0iMCAwIDggOCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48ZyBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtODEuMDAwMDAwLCAtMTQzLjAwMDAwMCkiIGZpbGw9IiNCQkJGQzQiIGZpbGwtcnVsZT0ibm9uemVybyI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODEuMDAwMDAwLCAxNDMuMDAwMDAwKSI+PHBhdGggZD0iTTcuODI4NTcxNDMsMC4xNzE0Mjg1NzEgQzguMDU3MTQyODYsMC40IDguMDU3MTQyODYsMC43NDI4NTcxNDMgNy44Mjg1NzE0MywwLjkxNDI4NTcxNCBMNC43NDI4NTcxNCw0IEw3LjgyODU3MTQzLDcuMDg1NzE0MjkgQzguMDU3MTQyODYsNy4zMTQyODU3MSA4LjA1NzE0Mjg2LDcuNjU3MTQyODYgNy44Mjg1NzE0Myw3LjgyODU3MTQzIEM3LjYsOC4wNTcxNDI4NiA3LjI1NzE0Mjg2LDguMDU3MTQyODYgNy4wODU3MTQyOSw3LjgyODU3MTQzIEw0LDQuNzQyODU3MTQgTDAuOTE0Mjg1NzE0LDcuODI4NTcxNDMgQzAuNjg1NzE0Mjg2LDguMDU3MTQyODYgMC4zNDI4NTcxNDMsOC4wNTcxNDI4NiAwLjE3MTQyODU3MSw3LjgyODU3MTQzIEMtMC4wNTcxNDI4NTcxLDcuNiAtMC4wNTcxNDI4NTcxLDcuMjU3MTQyODYgMC4xNzE0Mjg1NzEsNy4wODU3MTQyOSBMMy4yNTcxNDI4Niw0IEwwLjE3MTQyODU3MSwwLjkxNDI4NTcxNCBDLTAuMDU3MTQyODU3MSwwLjY4NTcxNDI4NiAtMC4wNTcxNDI4NTcxLDAuMzQyODU3MTQzIDAuMTcxNDI4NTcxLDAuMTcxNDI4NTcxIEMwLjQsLTEuNjI0MDk3NjhlLTE2IDAuNzQyODU3MTQzLC0wLjA1NzE0Mjg1NzEgMC45MTQyODU3MTQsMC4xNzE0Mjg1NzEgTDQsMy4yNTcxNDI4NiBMNy4wODU3MTQyOSwwLjE3MTQyODU3MSBDNy4yNTcxNDI4NiwtMC4wNTcxNDI4NTcxIDcuNjU3MTQyODYsLTAuMDU3MTQyODU3MSA3LjgyODU3MTQzLDAuMTcxNDI4NTcxIFoiPjwvcGF0aD48L2c+PC9nPjwvZz48L3N2Zz4=\') center no-repeat;\
        cursor: pointer;\
    }\
}\
');
//{/if}//
/*
@example
<div ui="type:wang-editor">
    <div ui="type:@cite;name:cite;group:注释组名称">注释块一</div>
    <div ui="type:@toolbar;mode:simple"></div>
    <div ui="type:@editor;mode:simple" style="height:500px">请输入</div>
</div>
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    var uid = 0;

    function direction(selection) {
        var anchor = selection.anchor,
            focus = selection.focus;

        for (var i = 0; i < anchor.path.length || i < focus.path.length; i++) {
            if (i >= anchor.path.length) {
                return -1;
            } else if (i >= focus.path.length) {
                return 1;
            }
            if (anchor.path[i] !== focus.path[i]) {
                return anchor.path[i] - focus.path[i];
            }
        }

        return anchor.offset - focus.offset;
    }

    function insertNodes(control, node, nodes) {
        node = Object.assign({}, node);
        delete node.cite;
        delete node.text;
        control._oEditor.insertNode((nodes instanceof Array ? nodes : [nodes]).map(function (item) {
            return Object.assign({}, node, item);
        }));
    }

    function replacePlaceholder(control, nodes) {
        var editor = control._oEditor;

        control.forEach(function (node, path) {
            var index = node.text.indexOf('\0');
            if (index >= 0) {
                editor.select({
                    anchor: {path: path.slice(), offset: index + 1},
                    focus: {path: path.slice(), offset: index + 1}
                });
                editor.deleteBackward();

                if (node.cite) {
                    if (index > node.text.length - index - 1) {
                        index = node.text.length - 1;
                    } else {
                        index = 0;
                    }
                    editor.select({
                        anchor: {path: path.slice(), offset: index},
                        focus: {path: path.slice(), offset: index}
                    });
                }
                insertNodes(control, control.getParent().getResource(0).wangEditor.SlateEditor.node(editor, path)[0], nodes);
                return true;
            }
        });
    }

    /**
     * 富文本编辑器(WangEditor)控件。控件支持文本引用块，一个引用块是一个独立的整体，操作起来与单个字符操作类似。Cite部件如果指定name能接收双击引用块回调的$action事件。
     * @control
     */
    ui.WangEditor = core.inherits(
        ui.Control,
        {
            /**
             * @override
             */
            $ready: function () {
                ui.Control.prototype.$ready.call(this);

                var wangEditor = this.getResource(0).wangEditor;
                wangEditor.Boot.registerModule({
                    renderStyle: function (node, vnode) {
                        if (node.cite && vnode.data['data-slate-length'] !== 0) {
                            for (var elem = vnode; elem.children; elem = elem.children[0]) {
                                // empty
                            }
                            elem.sel = 'cite';
                            if (node.group) {
                                elem.data.className = node.group;
                            }
                        }
                        return vnode;
                    },
                    styleToHtml: function (node, html) {
                        if (node.cite) {
                            return '<cite' + (node.group ? ' class="' + node.group + '"' : '') + '>' + node.text + '</cite>';
                        }
                        return html;
                    },
                    parseStyleHtml: function (elem, node) {
                        if (elem.tagName === 'CITE') {
                            return {
                                cite: true,
                                group: elem.className.trim(),
                                text: elem.innerText,
                                id: uid++
                            };
                        }
                        return node;
                    },
                    editorPlugin: function (editor) {
                        var methods = Object.assign({}, editor);
                        editor.deleteBackward = function (unit) {
                            var point = wangEditor.SlateEditor.before(this, this.selection.focus);
                            if (unit && point && wangEditor.SlateEditor.node(this, point)[0].cite) {
                                wangEditor.SlateTransforms.removeNodes(this, {at: point.path});
                            } else {
                                methods.deleteBackward(unit);
                            }
                        };
                        editor.deleteForward = function (unit) {
                            var point = wangEditor.SlateEditor.after(this, this.selection.focus);
                            if (point && wangEditor.SlateEditor.node(this, point)[0].cite) {
                                wangEditor.SlateTransforms.removeNodes(this, {at: point.path});
                            } else {
                                methods.deleteForward(unit);
                            }
                        };
                        editor.insertNode = function (nodes) {
                            (nodes instanceof Array ? nodes : [nodes]).forEach(function (node) {
                                if (node.cite) {
                                    node.id = uid++;
                                    node.text = '   ' + node.text.trim() + '   ';
                                }
                            });
                            methods.insertNode(nodes);
                        };
                        editor.insertText = function (text) {
                            var node = wangEditor.SlateEditor.node(editor, this.selection.focus)[0];
                            if (node.cite && text !== '\0') {
                                node = Object.assign({}, node);
                                node.text = text;
                                delete node.cite;
                                methods.insertNode(node);
                            } else {
                                methods.insertText(text);
                            }
                        };
                        return editor;
                    }
                });
            },

            /**
             * 引用块部件。
             * @unit
             */
            Cite: core.inherits(
                ui.Control,
                'ui-wang-editor-cite',
                function (el, options) {
                    ui.Control.call(this, el, options);
                    el.setAttribute('draggable', 'true');
                    this._sText = options.text || el.innerText.trim();
                    this._sGroup = options.group || '';
                    this._sName = options.name;
                },
                {
                    /**
                     * 双击引用块将触发动作事件。
                     * @event
                     */
                    $action: util.blank, // console.log(this._sName, this._sText);

                    /**
                     * @override
                     */
                    $click: function (event) {
                        ui.Control.prototype.$click.call(this, event);
                        var editor = this.getParent()._oEditor;
                        if (editor) {
                            editor.insertCite(this._sText, this._sGroup, {name: this._sName});
                            var selection = editor._oEditor.selection;
                            editor._oEditor.focus();
                            editor._oEditor.select(selection);
                        }
                    },

                    /**
                     * 浏览器原生的dragstart事件支持，需要声明draggable="true"
                     */
                    $dragstart: function (event) {
                        var transfer = event.getNative().dataTransfer;
                        transfer.setData('text/plain', '\0');
                        transfer.setData('params', JSON.stringify({cite: true, text: this._sText, group: this._sGroup, name: this._sName}));
                    }
                }
            ),

            /**
             * 工具栏部件。
             * @unit
             */
            Toolbar: core.inherits(
                ui.Control,
                'ui-wang-editor-toolbar',
                function (el, options) {
                    ui.Control.call(this, el, options);
                    this._sMode = options.mode || 'default';
                },
                {
                    /**
                     * @override
                     */
                    $ready: function () {
                        var parent = this.getParent();
                        if (parent._oEditor) {
                            parent.getResource(0).wangEditor.createToolbar({
                                editor: parent._oEditor._oEditor,
                                selector: this.getMain(),
                                config: {},
                                mode: this._sMode
                            });
                            ui.Control.prototype.$ready.call(this);
                        } else {
//{if 0}//
                            if (parent._oToolbar) {
                                console.warn('请不要连续定义Toolbar');
                            }
//{/if}//
                            parent._oToolbar = this;
                        }
                    }
                }
            ),

            /**
             * 编辑器部件。
             * @unit
             */
            Editor: core.inherits(
                ui.Control,
                'ui-wang-editor',
                function (el, options) {
                    ui.Control.call(this, el, options);
                    this._sMode = options.mode || 'default';
                },
                {
                    /**
                     * @override
                     */
                    $blur: function (event) {
                        ui.Control.prototype.$blur.call(this, event);
                        this._oEditor.blur();
                    },

                    /**
                     * 编辑器内容变化时的回调函数。
                     * @event
                     *
                     * @param {Event} event 事件对象
                     */
                    $change: function (event) {
                        var editor = this._oEditor;

                        if (editor.selection) {
                            if (event || !core.getActived()) {
                                var SlateEditor = this.getParent().getResource(0).wangEditor.SlateEditor,
                                    selection = JSON.parse(JSON.stringify(editor.selection));

                                if (direction(selection) < 0) {
                                    var start = selection.anchor,
                                        end = selection.focus;
                                } else {
                                    start = selection.focus;
                                    end = selection.anchor;
                                }
                                var startNode = SlateEditor.node(editor, start)[0],
                                    endNode = SlateEditor.node(editor, end)[0];

                                if (startNode.cite && start.offset !== startNode.text.length) {
                                    start.offset = 0;
                                }

                                if (endNode.cite && end.offset) {
                                    end.offset = endNode.text.length;
                                }

                                editor.select(selection);
                                this.getParent()._oEditor = this;
                            }
                        }
                    },

                    /**
                     * 单击有可能触发删除操作。
                     * @override
                     */
                    $click: function (event) {
                        ui.Control.prototype.$click.call(this, event);
                        if (event.target.tagName === 'CITE') {
                            var editor = this._oEditor,
                                pos = dom.getPosition(event.target),
                                style = getComputedStyle(event.target, ':after'),
                                x = pos.left + event.target.offsetWidth - event.pageX - parseInt(style.right),
                                y = event.pageY - pos.top - parseInt(style.top);

                            if (x >= 0 && x < parseInt(style.width) && y >= 0 && y < parseInt(style.height)) {
                                this.getParent().getResource(0).wangEditor.SlateTransforms.removeNodes(
                                    editor,
                                    {
                                        match: function (node) {
                                            return node.cite && editor.toDOMNode(node).getElementsByTagName('CITE')[0] === event.target;
                                        }
                                    }
                                );
                            }
                        }
                    },

                    /**
                     * 双击引用块需要回调引用块对象的操作事件。
                     * @override
                     */
                    $dblclick: function (event) {
                        ui.Control.prototype.$dblclick.call(this, event);
                        if (event.target.tagName === 'CITE') {
                            var editor = this._oEditor,
                                ret = this.forEach(function (node) {
                                    if (editor.toDOMNode(node).getElementsByTagName('CITE')[0] === event.target) {
                                        return core.query(function (item) {
                                            return item instanceof ui.WangEditor.prototype.Cite;
                                        }).filter(function (item) {
                                            return item._sName === node.name;
                                        });
                                    }
                                });
                            if (ret) {
                                ret.forEach(function (item) {
                                    core.dispatchEvent(item, 'action');
                                });
                            }
                        }
                    },

                    /**
                     * @override
                     */
                    $deactivate: function (event) {
                        ui.Control.prototype.$deactivate.call(this, event);
                        if (event.getNative().type !== 'drop') {
                            this.$change(event);
                        }
                    },

                    /**
                     * @override
                     */
                    $dispose: function () {
                        this._oEditor.destory();
                        ui.Control.prototype.$dispose.call(this);
                    },

                    /**
                     * 拖拽到编辑器内的事件。
                     * @event
                     *
                     * @param {Event} event 拖拽事件对象
                     */
                    $drop: function (event) {
                        var transfer = event.getNative().dataTransfer,
                            html = transfer.getData('text/html'),
                            editor = this._oEditor;

                        if (html) {
                            for (var len = transfer.getData('text/plain').length; len--;) {
                                editor.deleteBackward();
                            }
                            if (/\sdata-slate-fragment="([^"]+)"/.test(html)) {
                                html = RegExp.$1;
                                editor.insertText('\0');
                                replacePlaceholder(this, JSON.parse(decodeURIComponent(util.decodeBase64(html)))[0].children);
                            }
                        } else if ((html = transfer.getData('params'))) {
                            // 按钮拖动
                            replacePlaceholder(this, JSON.parse(html));
                        }
                    },

                    /**
                     * @override
                     */
                    $focus: function (event) {
                        ui.Control.prototype.$focus.call(this, event);
                        this._oEditor.focus();
                    },

                    /**
                     * @override
                     */
                    $keydown: function (event) {
                        ui.Control.prototype.$keydown.call(this, event);

                        var editor = this._oEditor,
                            SlateEditor = this.getParent().getResource(0).wangEditor.SlateEditor,
                            point;

                        switch (event.which) {
                        case 37:
                            // 左方向键
                            if (event.shiftKey) {
                                point = SlateEditor.before(editor, editor.selection.focus);
                                if (!point) {
                                    return false;
                                }
                                if (SlateEditor.node(editor, point)[0].cite) {
                                    editor.select({anchor: editor.selection.anchor, focus: {path: point.path, offset: 0}});
                                    return false;
                                }
                            } else if (direction(editor.selection)) {
                                editor.select({anchor: editor.selection.focus, focus: editor.selection.focus});
                                return false;
                            }
                            break;
                        case 39:
                            // 右方向键
                            if (event.shiftKey) {
                                point = SlateEditor.after(editor, editor.selection.focus);
                                if (!point) {
                                    return false;
                                }
                                var node = SlateEditor.node(editor, point)[0];
                                if (node.cite) {
                                    editor.select({anchor: editor.selection.anchor, focus: {path: point.path, offset: node.text.length}});
                                    return false;
                                }
                            } else if (direction(editor.selection)) {
                                editor.select({anchor: editor.selection.anchor, focus: editor.selection.anchor});
                                return false;
                            }
                            break;
                        // no default
                        }
                    },

                    /**
                     * 粘贴操作事件。
                     * @event
                     *
                     * @param {Event} event 事件对象
                     */
                    $paste: function (event) {
                        // 复制粘贴、拖动都要考虑上标的情况
                        var editor = this._oEditor;

                        if (/data\-slate\-fragment="([^"]+)"/.test(event.clipboardData.getData('text/html'))) {
                            insertNodes(this, this.getParent().getResource(0).wangEditor.SlateEditor.node(editor, editor.selection.focus.path)[0], JSON.parse(decodeURIComponent(util.decodeBase64(RegExp.$1)))[0].children);
                        } else {
                            editor.insertNode({text: event.clipboardData.getData('text/plain')});
                        }
                        event.preventDefault();
                        return false;
                    },

                    /**
                     * @override
                     */
                    $ready: function () {
                        ui.Control.prototype.$ready.call(this);
                        var el = this.getMain(),
                            parent = this.getParent(),
                            text = el.innerText;
                        el.innerText = '';
                        parent._oEditor = this;
                        this._oEditor = parent.getResource(0).wangEditor.createEditor({
                            selector: el,
                            html: '<p><br></p>',
                            config: {
                                placeholder: text,
                                onChange: function () {
                                    this.$change();
                                }.bind(this),
                                customPaste: function (editor, event) {
                                    return this.$paste(event);
                                }.bind(this)
                            },
                            mode: this._sMode || 'default'
                        });
                        if (parent._oToolbar) {
                            parent._oToolbar.$ready();
                            parent._oToolbar = null;
                        }
                        el = null;
                    },

                    /**
                     * 遍历所有节点。如果遍历过程是有return操作，则遍历提前中止。
                     * @public
                     *
                     * @param {function} fn 回调函数，传回的参数为(node, path)
                     */
                    forEach: function (fn) {
                        var path = [],
                            list = [this._oEditor];

                        while (list.length) {
                            var node = list.pop();
                            if (node instanceof Array) {
                                if (node.length) {
                                    list.push(node);
                                    node = node.pop();
                                } else {
                                    path.pop();
                                    list.pop();
                                    continue;
                                }
                            }

                            if (node.children) {
                                path.push(0);
                                var children = node.children.slice();
                                list.push(children.reverse());
                            } else {
                                var ret = fn.call(this, node, path)
                                if (ret !== undefined) {
                                    return ret;
                                }
                                path[path.length - 1]++;
                            }
                        }
                    },

                    /**
                     * 插入引用块。
                     * @public
                     *
                     * @param {string} text 引用块的文本
                     * @param {string} group 引用块所属的组
                     * @param {object} options 引用块的自定义参数
                     */
                    insertCite: function (text, group, options) {
                        this._oEditor.insertNode(Object.assign({}, options, {cite: true, text: text, group: group || ''}));
                    }
                }
            )
        },
        ui.Resource.declare([
            'https://unpkg.com/@wangeditor/editor@latest/dist/index.js',
            'https://unpkg.com/@wangeditor/editor@latest/dist/css/style.css'
        ]),
        {
            /**
             * 重新实现Transforms的removeNodes方法。
             * @override
             */
            $loadResource: function (text, url) {
                var data = ui.Resource.Methods.$loadResource.call(this, text, url);
                if (data) {
                    var removeNodes = data.wangEditor.SlateTransforms.removeNodes;
                    data.wangEditor.SlateTransforms.removeNodes = function (editor, options) {
                        removeNodes.call(this, editor, options);
                        if (!editor.getText()) {
                            editor.selectAll();
                        }
                        text = url = null;
                    };
                }
                return data;
            }
        }
    );
})();
