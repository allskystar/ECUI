//{if $css}//
ecui.__ControlStyle__('\
.ui-upload {\
    label {\
        display: inline-block;\
    }\
    input[type=file] {\
        opacity: 0;\
    }\
    .ui-empty {\
        display: none;\
    }\
    .ui-upload-progress {\
        display: inline-block;\
        vertical-align: top;\
        .ui-img-fill {\
            width: 100%;\
            height: 80%;\
        }\
    }\
}\
');
//{/if}//
/*
@example
<div ui="type:upload;action:/file?file"></div>

@field
_nCount      正在上传的文件数量
_sAction     文件上传提交的 url
_sName       提交字段名称
_sUploadName 文件上传字段名称
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        io = core.io,
        ui = core.ui,
        util = core.util;
//{/if}//
    function uploaded(control) {
        control._nCount--;
        if (!control._nCount) {
            core.dispatchEvent(control, 'afterupload');
        }
    }


    /**
     * 移动端滚动接口。修复默认手势识别与 iOS/Android 软键盘的支持。
     * options 属性：
     * overflow     拖动时的额外滑动区间
     * @interface
     */
    ui.iDragSort = core.interfaces('DragSort', {
        constructor: function (el, options) {

        },

        /**
         * @override
         */
        $activate: function (event) {
            _class.$activate(event);
            this.cache();

            if (!this.getParent()._bDragSort) {
                return;
            }
            this._nTop = dom.getPosition(this.getParent().getMain()).top - dom.getView().top;
            this._nLeft = dom.getPosition(this.getParent().getMain()).left - dom.getView().left;

            core.drag(
                this,
                event,
                {
                    x: 0,
                    y: 0,
                    left: 0,
                    right: this.getParent().getWidth(),
                    top: 0,
                    bottom: this.getParent().getHeight()
                }
            );
        },
        /**
         * @override
         */
        $dragend: function (event) {
            _class.$dragend(event);
            var eCloneNode = this._eCloneNode;
            util.timer(function () {
                dom.remove(eCloneNode);
                this.getParent().moveDragItem();
            }, 0, this);
        },

        /**
         * @override
         */
        $dragstart: function (event) {
            _class.$dragstart(event);
            this._eCloneNode = this.getMain().cloneNode(true);
            this._eCloneNode.style.position = 'fixed';
            dom.addClass(this._eCloneNode, 'ui-item-clone');
            dom.insertAfter(this._eCloneNode, this.getMain());
            this.getParent()._uDragItem = this;
        },

        onmouseup: function (event) {
            this.getParent()._uDragTargetItem = this;
        },

        setPosition: function (x, y) {
            if (this._eCloneNode) {
                this._eCloneNode.style.top = this._nTop + y + 'px';
                this._eCloneNode.style.left = this._nLeft + x + 'px';
            }
        }
    });
    /**
     * 文件上传控件。
     * 内部必须包含<input type="file">的标签，可以包含或不包含进度控件，如果包含就会自动设置进度控件参数。
     * options 属性：
     * action   文件上传地址与字段名，格式为：[name]-[url]
     * @control
     */
    ui.Upload = core.inherits(
        ui.File,
        'ui-upload',
        function (el, options) {
            _super(el, options);
            this._bDragSort = options.dragSort;
            el = this.getInput();
            this._sName = el.name;
            el.name = '';
            options = options.action.split(':');
            this._sUploadName = options[0];
            this._sAction = options.slice(1).join(':');
            this._nCount = 0;
        },
        {

            /**
             * 常规进度条部件。
             * @unit
             */
            PROGRESS_BAR: core.inherits(
                ui.ProgressBar,
                'ui-upload-progress',
                function (el, options) {
                    var filename = util.encodeHTML(options.file.name);
                    el.innerHTML = util.formatString('<div class="ui-upload-file-icon {0}"></div><div class="ui-upload-name">{1}</div><div class="ui-progress-ratio">0%</div>', filename.split('.').pop(), filename);
                    this._eInput = dom.create('input', { 'type': 'hidden' });
                    el.title = options.file.name;
                    _super(el, options);
                },
                {
                    /**
                     * 清除已经上传的文件信息。
                     * @protected
                     */
                    $clear: function () {
                        dom.removeClass(this.getParent().getMain().lastChild, 'ui-empty');
                        dom.remove(this.getMain());
                        core.dispose(this);
                    },

                    /**
                     * @override
                     */
                    $dispose: function () {
                        _super.$dispose();
                        this._eInput = null;
                    },

                    /**
                     * 设置提交的值，通常是上传后待访问的文件路径。
                     * @public
                     *
                     * @param {string} value 用于提交的值
                     */
                    setValue: function (value, isUploading) {
                        if (typeof value === 'string') {
                            this._eInput.value = value;
                            this._eText.lastChild.innerHTML = '100%';
                            this._eText.appendChild(this._eInput);
                        } else {
                            if (isUploading) {
                                value = value * 0.8;
                            }
                            _super.setValue(value);
                            this._eText.lastChild.innerHTML = (value * 100 / this.getMax()).toFixed(0) + '%';
                        }
                    }
                },
                ui.iDragSort
            ),

            /**
             * 圆型进度条部件。
             * @unit
             */
            PROGRESS_CIRCLE: core.inherits(
                ui.ProgressCircle,
                'ui-upload-progress',
                function (el, options) {
                    var filename = util.encodeHTML(options.file.name);
                    el.innerHTML = util.formatString('<div class="ui-img-fill"><img></div><div class="ui-upload-file-icon {0}"></div><div class="ui-upload-name">{1}</div>', filename.split('.').pop(), filename);
                    this._eInput = dom.create('input', { 'type': 'hidden' });
                    this._cImgFill = core.$fastCreate(ui.ImgFill, el.firstChild, this);
                    el.title = options.file.name;
                    _super(el, options);
                },
                {

                    /**
                     * 清除已经上传的文件信息。
                     * @protected
                     */
                    $clear: function () {
                        dom.removeClass(this.getParent().getMain().lastChild, 'ui-empty');
                        dom.remove(this.getMain());
                        core.dispose(this);
                    },

                    /**
                     * @override
                     */
                    $dispose: function () {
                        _super.$dispose();
                        this._eInput = null;
                    },

                    /**
                     * 设置提交的值，通常是上传后待访问的文件路径。
                     * @public
                     *
                     * @param {string} value 用于提交的值
                     */
                    setValue: function (value) {
                        if (typeof value === 'string') {
                            this.getMain().appendChild(this._eInput);
                            this._eInput.value = value;
                        } else {
                            _super.setValue(value);
                        }
                    }
                },
                ui.iDragSort
            ),

            /**
             * 文件选择内容改变事件。
             * @event
             */
            $change: function () {
                var inputEl = this.getInput(),
                    files = dom.toArray(inputEl.files),
                    control = this,
                    count = control.getUploadedCount();
                if (count && control._nMax === 1) {
                    control.getBody().previousSibling.getControl().$clear();
                }
                if (files.length) {
                    if (!control._nCount) {
                        core.dispatchEvent(control, 'beforeupload');
                    }
                    control._nCount += files.length;
                    if (count === control._nMax && control._nMax > 1) {
                        dom.addClass(control.getMain().lastChild, 'ui-empty');
                    }
                    files.forEach(function (file) {
                        var reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = function () {
                            var progress = control.$createSelected(file),
                                data = new FormData();
                            dom.addClass(progress.getMain(), 'ui-uploading');
                            progress._eInput.name = control._sName;
                            if (progress._cImgFill) {
                                // TODO: 不是图片需要加载特定的背景图
                                progress._cImgFill.loadImage(this.result.startsWith('data:image') ? this.result : '');
                            }
                            data.append(control._sUploadName, file);
                            io.ajax(control._sAction, {
                                method: 'POST',
                                data: data,
                                onupload: function (e) {
                                    progress.setMax(e.total);
                                    progress.setValue(e.loaded, true);
                                },
                                onsuccess: function (text) {
                                    dom.removeClass(progress.getMain(), 'ui-uploading');
                                    core.dispatchEvent(control, 'upload', { item: progress, result: text });
                                    uploaded(control);
                                },
                                onerror: function () {
                                    dom.removeClass(progress.getMain(), 'ui-uploading');
                                    core.dispatchEvent(control, 'failure', { name: file.name });
                                    core.dispatchEvent(progress, 'clear');
                                    uploaded(control);
                                }
                            });
                        };
                    });
                    inputEl.value = '';
                    inputEl = null;
                }
            },

            /**
             * 所有选择的文件上传结束
             * @public
             */
            $afterupload: function () {
                dom.removeClass(this.getMain(), 'ui-uploading');
            },

            /**
             * 上传文件前，添加一些 loading 效果
             * @public
             */
            $beforeupload: function () {
                dom.addClass(this.getMain(), 'ui-uploading');
            },

            /**
             * 上传成功后的处理
             * @public
             *
             * @param {event} event 事件对象
             */
            $upload: function (event) {
                try {
                    var result = JSON.parse(event.result);
                    if (result.code === 0) { // 显示上传的图片
                        event.item.setValue(result.data.id);
                    }
                } catch (e) {}
            },

            moveDragItem: function () {
                if (this._uDragItem && this._uDragItem !== this._uDragTargetItem) {
                    dom.insertBefore(this._uDragItem.getMain(), this._uDragTargetItem ? this._uDragTargetItem.getMain() : this.getBody());
                }
                this._uDragTargetItem = null;
                this._uDragItem = null;
            }
        }
    );

    /**
     * 设置默认进度条部件。
     * @unit
     */
    ui.Upload.prototype.Selected = ui.Upload.prototype.PROGRESS_CIRCLE;
})();
