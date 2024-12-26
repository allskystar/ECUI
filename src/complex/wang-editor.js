//{if $css}//
ecui.__ControlStyle__('\
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
        top: 4px;\
        z-index: 1;\
        background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOHB4IiBoZWlnaHQ9IjhweCIgdmlld0JveD0iMCAwIDggOCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48ZyBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtODEuMDAwMDAwLCAtMTQzLjAwMDAwMCkiIGZpbGw9IiNCQkJGQzQiIGZpbGwtcnVsZT0ibm9uemVybyI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODEuMDAwMDAwLCAxNDMuMDAwMDAwKSI+PHBhdGggZD0iTTcuODI4NTcxNDMsMC4xNzE0Mjg1NzEgQzguMDU3MTQyODYsMC40IDguMDU3MTQyODYsMC43NDI4NTcxNDMgNy44Mjg1NzE0MywwLjkxNDI4NTcxNCBMNC43NDI4NTcxNCw0IEw3LjgyODU3MTQzLDcuMDg1NzE0MjkgQzguMDU3MTQyODYsNy4zMTQyODU3MSA4LjA1NzE0Mjg2LDcuNjU3MTQyODYgNy44Mjg1NzE0Myw3LjgyODU3MTQzIEM3LjYsOC4wNTcxNDI4NiA3LjI1NzE0Mjg2LDguMDU3MTQyODYgNy4wODU3MTQyOSw3LjgyODU3MTQzIEw0LDQuNzQyODU3MTQgTDAuOTE0Mjg1NzE0LDcuODI4NTcxNDMgQzAuNjg1NzE0Mjg2LDguMDU3MTQyODYgMC4zNDI4NTcxNDMsOC4wNTcxNDI4NiAwLjE3MTQyODU3MSw3LjgyODU3MTQzIEMtMC4wNTcxNDI4NTcxLDcuNiAtMC4wNTcxNDI4NTcxLDcuMjU3MTQyODYgMC4xNzE0Mjg1NzEsNy4wODU3MTQyOSBMMy4yNTcxNDI4Niw0IEwwLjE3MTQyODU3MSwwLjkxNDI4NTcxNCBDLTAuMDU3MTQyODU3MSwwLjY4NTcxNDI4NiAtMC4wNTcxNDI4NTcxLDAuMzQyODU3MTQzIDAuMTcxNDI4NTcxLDAuMTcxNDI4NTcxIEMwLjQsLTEuNjI0MDk3NjhlLTE2IDAuNzQyODU3MTQzLC0wLjA1NzE0Mjg1NzEgMC45MTQyODU3MTQsMC4xNzE0Mjg1NzEgTDQsMy4yNTcxNDI4NiBMNy4wODU3MTQyOSwwLjE3MTQyODU3MSBDNy4yNTcxNDI4NiwtMC4wNTcxNDI4NTcxIDcuNjU3MTQyODYsLTAuMDU3MTQyODU3MSA3LjgyODU3MTQzLDAuMTcxNDI4NTcxIFoiPjwvcGF0aD48L2c+PC9nPjwvZz48L3N2Zz4=") center no-repeat;\
        cursor: pointer;\
    }\
}\
');
//{/if}//
/*
@example
<div ui="type:wang-editor-area">
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

    function formatText(text) {
        return text ? '　' + text + '　' : '　';
    }

    function forEach(editor, fn, path, isLast) {
        if (path.length) {
            var list = [],
                node = editor._oEditor;

            path.forEach(function (item) {
                var children = node.children.slice();
                node = node.children[item];
                if (isLast) {
                    children.splice(item, children.length - item);
                } else {
                    children.splice(0, item + 1);
                    children.reverse();
                }
                list.push(children);
            });
            if (node) {
                list[list.length - 1].push(node);
            }
        } else {
            list = [editor._oEditor];
        }

        while (list.length) {
            node = list.pop();
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

            var children = node.children;
            if (children) {
                path.push(isLast ? children.length - 1 : 0);
                children = children.slice();
                if (!isLast) {
                    list.push(children.reverse());
                }
                list.push(children);
            } else {
                var ret = fn.call(this, node, path.slice());
                if (ret !== undefined) {
                    return ret;
                }
                if (isLast) {
                    path[path.length - 1]--;
                } else {
                    path[path.length - 1]++;
                }
            }
        }
    }

    /**
     * 富文本编辑器区域控件，一个区域内可以支持多个富文本编辑器，但是此时工具栏必须明确的指定自己属于哪个富文本编辑器（通过 index 属性），否则将产生一个警告并绑定到最后的富文本编辑器上。定文本编辑器区域支持“引用”控件，一个“引用”是一个独立的整体，操作起来与对单个字符的操作类似，一次全部写入、全部删除，不允许对“引用”的内容单独编辑。“引用”控件如果指定 name，在它被双击时会调用“引用”控件的 $action 事件。
     * @control
     */
    ui.WangEditorArea = core.inherits(
        ui.Control,
        function (el, options) {
            _super(el, options);
            this._aEditors = [];
        },
        {
            /**
             * 引用部件。
             * @unit
             */
            Cite: core.inherits(
                ui.Control,
                'ui-wang-editor-cite',
                function (el, options) {
                    _super(el, options);
                    el.setAttribute('draggable', 'draggable');
                    this._sText = options.text === undefined ? el.innerText.trim() : '';
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
                     * 点击将自己添加到之前有过操作的编辑器中。
                     * @override
                     */
                    $click: function (event) {
                        _super.$click(event);
                        var editor = this.getParent()._oActiveEditor;
                        if (editor) {
                            editor.insertCite(this._sText, this._sGroup, this._sName ? {name: this._sName} : undefined);
                            editor.focus();
                        }
                    },

                    /**
                     * 浏览器原生的 dragstart 事件发生时，触发这个方法设置 dataTransfer 的值，需要控件元素声明 draggable="true"
                     * @override
                     */
                    $dataTransfer: function (transfer) {
                        transfer.setData('text/html', '<cite class="' + this._sGroup + '" draggable="true">' + this._sText + '</cite>');
                        transfer.setData(
                            'application/x-slate-node',
                            JSON.stringify(
                                this._sName ?
                                    {cite: true, text: this._sText, group: this._sGroup, name: this._sName} :
                                    {cite: true, text: this._sText, group: this._sGroup}
                            )
                        );
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
                    _super(el, options);
                    this._sMode = options.mode || 'default';
                    this._nIndex = +options.index;
                    this._oConfig = options.config || {};
                },
                {
                    /**
                     * @override
                     */
                    $ready: function () {
                        var parent = this.getParent();
//{if 0}//
                        if (parent._aEditors.length) {
                            if (parent._aEditors.length > 1 && isNaN(this._nIndex)) {
                                console.warn('有多个编辑器，工具条需要指定序号');
                            }
//{/if}//
                            parent.getResource(0).wangEditor.createToolbar({
                                editor: parent._aEditors[this._nIndex || 0]._oEditor,
                                selector: this.getMain(),
                                config: this._oConfig,
                                mode: this._sMode
                            });
                            _super.$ready();
//{if 0}//
                        } else {
                            console.warn('没有创建编辑器不能创建工具条');
                        }
//{/if}//
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
                    _super(el, options);
                    this._sMode = options.mode || 'default';
                    this._UIWangEditor_oHandler = util.blank;
                },
                {
                    /**
                     * 编辑器内容变化时的回调函数。
                     * @event
                     *
                     * @param {Event} event 事件对象
                     */
                    $change: function (event) {
                        var editor = this._oEditor;

                        if (editor.selection) {
                            if (editor.isEmpty()) {
                                if (editor.children[0].children[0].cite) {
                                    util.timer(function () {
                                        editor.setHtml('');
                                    });
                                }
                            } else if (event || !core.getActived()) {
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
                            }
                            this.getParent()._oActiveEditor = this;
                        }
                    },

                    /**
                     * 单击有可能触发删除操作。
                     * @override
                     */
                    $click: function (event) {
                        _super.$click(event);
                        if (event.target.tagName === 'CITE') {
                            var pos = dom.getPosition(event.target),
                                style = window.getComputedStyle(event.target, ':after'),
                                x = pos.left + event.target.offsetWidth - event.pageX - parseInt(style.right),
                                y = event.pageY - pos.top - parseInt(style.top),
                                editor = this._oEditor,
                                SlateTransforms = this.getParent().getResource(0).wangEditor.SlateTransforms;

                            if (x >= 0 && x < parseInt(style.width) && y >= 0 && y < parseInt(style.height)) {
                                this.forEach(function (node, path) {
                                    if (node.cite && node.text.length > 1 && editor.toDOMNode(node).getElementsByTagName('CITE')[0] === event.target) {
                                        SlateTransforms.removeNodes(editor, {at: path});
                                        return true;
                                    }
                                });
                            }
                        }
                    },

                    /**
                     * @override
                     */
                    $create: function (options) {
                        _super.$create(options);
                        var el = this.getMain(),
                            parent = options.parent,
                            text = el.innerText,
                            activeElement = document.activeElement;
                        if (activeElement.tagName !== 'BODY') {
                            var start = dom.getSelectionStart(activeElement),
                                end = dom.getSelectionEnd(activeElement);
                        }
                        el.innerText = '';
                        parent._aEditors.push(this);
                        this._oEditor = parent.getResource(0).wangEditor.createEditor({
                            selector: el,
                            html: '<p><br></p>',
                            config: {
                                placeholder: text,
                                onChange: function () {
                                    return this.$change();
                                }.bind(this),
                                customPaste: function (editor, event) {
                                    return this.$paste(event);
                                }.bind(this)
                            },
                            mode: this._sMode || 'default'
                        });
                        if (activeElement.tagName === 'BODY') {
                            document.activeElement.blur();
                        } else {
                            activeElement.focus();
                            dom.setSelection(activeElement, start, end);
                        }
                        el = activeElement = null;
                    },

                    /**
                     * 双击引用块需要回调引用块对象的操作事件。
                     * @override
                     */
                    $dblclick: function (event) {
                        _super.$dblclick(event);
                        if (event.target.tagName === 'CITE') {
                            var editor = this._oEditor,
                                ret = this.forEach(function (node) {
                                    if (node.cite && editor.toDOMNode(node).getElementsByTagName('CITE')[0] === event.target) {
                                        return core.query(function (item) {
                                            return item instanceof ui.WangEditorArea.prototype.Cite;
                                        }).filter(function (item) {
                                            return node.name && item._sName === node.name;
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
                        _super.$deactivate(event);
                        this.$change(event);
                    },

                    /**
                     * @override
                     */
                    $dispose: function () {
                        this._oEditor.destroy();
                        _super.$dispose();
                    },

                    /**
                     * @override
                     */
                    $focus: function (event) {
                        _super.$focus(event);
                        // 初始化时会获得focusin，需要屏蔽
                        // if (this._oEditor) {
                            // 调用focus后光标定位会出问题需要重新设置，原因不明
                        var selection = this._oEditor.selection;
                        this._oEditor.focus();
                        this._oEditor.select(selection);
                        // }
                    },

                    /**
                     * @override
                     */
                    $keydown: function (event) {
                        _super.$keydown(event);

                        var editor = this._oEditor,
                            SlateEditor = this.getParent().getResource(0).wangEditor.SlateEditor,
                            point;

                        switch (event.which) {
                        case 32:
                            if (Date.now() - this._nlastTime < 400) {
                                // 修复快速两次空格的错误问题
                                var selection = editor.selection;
                                util.timer(function () {
                                    editor.setHtml(editor.getHtml());
                                    util.timer(function () {
                                        editor.select(selection);
                                        editor.insertText(' ');
                                    });
                                });
                                event.preventDefault();
                                return;
                            }
                            this._nlastTime = Date.now();
                            break;
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
                     * @override
                     */
                    $mousedown: function (event) {
                        _super.$mousedown(event);
                        if (event.target.tagName === 'CITE') {
                            if (!direction(this._oEditor.selection)) {
                                this._UIWangEditor_oHandler = util.timer(function () {
                                    var selection = JSON.parse(JSON.stringify(this._oEditor.selection));
                                    selection.anchor.offset = 0;
                                    selection.focus.offset = this.getParent().getResource(0).wangEditor.SlateEditor.node(this._oEditor, selection.focus.path)[0].text.length;
                                    this._oEditor.select(selection);
                                }, 500, this);
                            }
                        }
                    },

                    /**
                     * @override
                     */
                    $mousemove: function (event) {
                        _super.$mousemove(event);
                        this._UIWangEditor_oHandler();
                    },

                    /**
                     * 粘贴操作事件。
                     * @event
                     *
                     * @param {Event} event 事件对象
                     */
                    $paste: function (event) {
                        // 复制粘贴、拖动都要考虑上标的情况
                        var editor = this._oEditor,
                            fragment = event.clipboardData.getData('application/x-slate-fragment');
                        if (fragment) {
                            var node = Object.assign({}, this.getParent().getResource(0).wangEditor.SlateEditor.node(editor, editor.selection.focus.path)[0]),
                                nodes = JSON.parse(decodeURIComponent(window.atob(fragment)))[0].children;
                            delete node.cite;
                            delete node.text;
                            delete node.group;
                            delete node.name;
                            delete node.id;
                            this._oEditor.insertNode((nodes instanceof Array ? nodes : [nodes]).map(function (item) {
                                return Object.assign({}, node, item);
                            }));
                        } else {
                            editor.insertText(event.clipboardData.getData('text/plain'));
                        }
                        event.preventDefault();
                        return false;
                    },

                    /**
                     * 遍历所有节点。如果遍历过程是有 return 操作，则遍历提前中止。
                     * @public
                     *
                     * @param {function} fn 回调函数，参数为(node, path)，返回值作为本函数的返回值
                     * @return {object} fn 的返回值
                     */
                    forEach: function (fn) {
                        return forEach(this, fn, []);
                    },

                    /**
                     * 根据引用名称获得所有引用节点。
                     * @public
                     *
                     * @param {string} name 引用名称
                     * @return {Array} 引用节点列表，每一项是一个数组，第一个值是节点对象，第二个值是节点 path
                     */
                    getCitesByName: function (name) {
                        var ret = [];
                        this.forEach(function (node, path) {
                            if (node.cite && node.name === name) {
                                ret.push([node, path]);
                            }
                        });
                        return ret;
                    },

                    /**
                     * 从指定的 path 开始从前向后查找。
                     * @public
                     *
                     * @param {Path} path 参见 Slate 的 Location 中对 Path 的定义
                     * @param {function} fn 查找的处理函数，返回值作为本函数的返回值
                     * @return {object} fn 的返回值
                     */
                    indexOf: function (path, fn) {
                        return forEach(this, fn, path.slice());
                    },

                    /**
                     * 插入引用节点。
                     * @public
                     *
                     * @param {string} text 引用块的文本
                     * @param {string} group 引用块所属的组
                     * @param {object} options 引用块的自定义参数
                     */
                    insertCite: function (text, group, options) {
                        if (!options) {
                            options = {};
                        } else {
                            options = Object.assign({}, options);
                        }
                        options.cite = true;
                        options.text = text;
                        options.group = group || '';
                        this._oEditor.insertNode(options);
                    },

                    /**
                     * 从指定的 path 开始从后向前查找。
                     * @public
                     *
                     * @param {Path} path 参见 Slate 的 Location 中对 Path 的定义
                     * @param {function} fn 查找的处理函数，返回值作为本函数的返回值
                     * @return {object} fn 的返回值
                     */
                    lastIndexOf: function (path, fn) {
                        return forEach(this, fn, path.slice(), true);
                    }
                }
            )
        },
        ui.iResource.declare(
            [
                'static/wangeditor/wangeditor.js',
                'static/wangeditor/wangeditor.css'
            ]
        ),
        {
            /**
             * 重新实现 Transforms 的 removeNodes 方法。
             * @override
             */
            $loadResource: function (text, url) {
                var data = _class.$loadResource(text, url);
                if (data) {
                    var wangEditor = data.wangEditor,
                        removeNodes = wangEditor.SlateTransforms.removeNodes;

                    wangEditor.SlateTransforms.removeNodes = function (editor, options) {
                        removeNodes.call(this, editor, options);
                        if (options.at) {
                            var node = editor.children[options.at[0]];
                            if (node && node.children.length === 1 && !node.children[0].text.length) {
                                var point = {
                                    path: [options.at[0], 0],
                                    offset: 0
                                };
                                editor.select({anchor: point, focus: point});
                            }
                        }
                        text = url = null;
                    };

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
                                return '<cite' + (node.group ? ' class="' + node.group + '"' : '') + (node.name ? ' data-name="' + node.name + '"' : '') + '>' + node.text.trim() + '</cite>';
                            }
                            return html;
                        },
                        preParseHtml: [{
                            selector: 'cite',
                            preParseHtml: function (elem) {
                                var name = elem.getAttribute('data-name'),
                                    ret = dom.create('span');
                                ret.className = elem.className;
                                ret.innerText = elem.innerText.trim();
                                ret.setAttribute('data-type', 'cite');
                                if (name) {
                                    ret.setAttribute('data-name', name);
                                }
                                return ret;
                            }
                        }],
                        parseStyleHtml: function (elem, node) {
                            if (elem.tagName === 'SPAN' && elem.getAttribute('data-type') === 'cite') {
                                var name = elem.getAttribute('data-name'),
                                    ret = {
                                        cite: true,
                                        group: elem.className.trim(),
                                        text: formatText(elem.innerText),
                                        id: uid++
                                    };
                                if (name) {
                                    ret.name = name;
                                }
                                return ret;
                            }
                            return node;
                        },
                        editorPlugin: function (editor) {
                            var methods = Object.assign({}, editor);
                            editor.deleteBackward = function (unit) {
                                var point = wangEditor.SlateEditor.before(this, this.selection.focus);
                                if (unit && point && this.selection.focus.path[0] === point.path[0] && wangEditor.SlateEditor.node(this, point)[0].cite) {
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
                                        node.text = node.text.trim();
                                        node.text = formatText(node.text);
                                    }
                                });
                                methods.insertNode(nodes);
                            };
                            editor.insertText = function (text) {
                                var node = wangEditor.SlateEditor.node(this, this.selection.focus)[0];
                                if (node.cite && text !== '\0') {
                                    node = Object.assign({}, node);
                                    node.text = text;
                                    delete node.cite;
                                    delete node.group;
                                    delete node.name;
                                    delete node.id;
                                    methods.insertNode(node);
                                } else {
                                    methods.insertText(text);
                                }
                            };
                            editor.insertData = function (data) {
                                var node = wangEditor.SlateEditor.node(this, this.selection.focus)[0],
                                    offset = this.selection.focus.offset,
                                    text = data.getData('application/x-slate-node');

                                if (node.cite) {
                                    if (offset > node.text.length - offset) {
                                        offset = node.text.length;
                                    } else {
                                        offset = 0;
                                    }
                                    this.select({
                                        anchor: {path: this.selection.focus.path, offset: offset},
                                        focus: {path: this.selection.focus.path, offset: offset}
                                    });
                                }

                                if (text) {
                                    this.insertNode(JSON.parse(text));
                                } else {
                                    methods.insertData(data);
                                    methods.insertText(' ');
                                    methods.deleteBackward();
                                }
                                text = JSON.parse(JSON.stringify(this.selection));
                                util.timer(function () {
                                    this.select(text);
                                }, 0, this);
                            };
                            return editor;
                        }
                    });
                }
                return data;
            }
        }
    );
})();
