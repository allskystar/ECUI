/*
@example
<div ui="type:file"></div>

@field
_nMax        限制上传的文件数量
_nSize       文件上传的大小限制
_sAccept     支持的文件格式
_oAccept     文件格式过滤正则表达式
_aValue      控件的值对象
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    var types = {
        'ppt': 'ppt|pptx',
        'doc': 'doc|docx',
        'xls': 'xls|xlsx',
        'jpeg': 'jpg|jpe|jpeg'
    };

    function changeHandler(event) {
        var control = event.target.getControl();
        if (control.validate()) {
            core.dispatchEvent(control, 'change');
        }
    }

    /**
     * 文件选择控件。
     * @control
     * options 属性：
     * max      最多能上传的文件数量，默认为1
     * size     文件上传的大小限制，单位为 M(1024*1024)
     * accept   支持的文件格式(使用逗号分隔)
     */
    ui.File = core.inherits(
        ui.abstractInput,
        'ui-file',
        function (el, options) {
            _super(el, Object.assign({inputType: 'file'}, options));
            el = this.getMain();
            var label = dom.create('LABEL');
            for (; el.firstChild;) {
                label.appendChild(el.firstChild);
            }
            el.appendChild(label);
            this.$setBody(label);
            this._nMax = +options.max || 1;
            this._aValue = [];

            el = this.getInput();
            if (el.getAttribute('title') === null) {
                el.setAttribute('title', '');
            }
            if (this._nMax === 1 && el.getAttribute('multiple') !== null) {
                el.removeAttribute('multiple');
            }
            this._nSize = +options.size * 1024 * 1024 || this.MAXSIZE;
            if (options.accept) {
                this._sAccept = options.accept;
                this._oAccept = new RegExp('.+\\.(' + options.accept.split(',').map(function (item) {
                    return types[item] || item;
                }).join('|') + ')$');
            }
            dom.addEventListener(el, 'change', changeHandler);

            if (options.files && options.files instanceof Array) {
                options.files.forEach(function (file) {
                    var progress = this.$createSelected(file);
                    progress._eInput.name = this._sName;
                    progress.setValue(file.id);
                }, this);
            }
        },
        {
            MAXSIZE: 5 * 1024 * 1024,
            ERROR_MAX: '文件个数超过 {0} 个的上限',
            ERROR_ACCEPT: '文件格式不符，系统支持格式：{0}',
            ERROR_SIZE: '文件大小不能超过 {0}M',

            Selected: core.inherits(
                ui.Control,
                'ui-file-selected',
                function (el, options) {
                    _super(el, options);
                    this._oFile = options.file;
                    el.innerHTML = options.file.name;
                },
                {
                    $clear: function () {
                        var parent = this.getParent();
                        util.remove(parent._aValue, this._oFile);
                        parent.getInput().style.display = '';
                        dom.remove(this.getMain());
                        core.dispose(this);
                    }
                }
            ),

            /**
             * 文件选择内容改变事件。
             * @event
             */
            $change: function () {
                var inputEl = this.getInput(),
                    count = this.getUploadedCount();
                if (!count || this._nMax > 1) {
                    dom.toArray(this.getInput().files).forEach(function (file) {
                        this.$createSelected(file);
                        this._aValue.push(file);
                    }, this);
                    if (count === this._nMax && this._nMax > 1) {
                        inputEl.style.display = 'none';
                    }
                } else {
                    var control = this.getBody().previousSibling.getControl();
                    this._aValue[0] = control._oFile = inputEl.files[0];
                    control.getMain().innerHTML = inputEl.files[0].name;
                }
                inputEl.value = '';
            },

            /**
             * 创建一个文件选择控件。
             * @protected
             *
             * @param {File} 文件对象
             * @return {ecui.ui.File.prototype.Selected} 文件选择控件
             */
            $createSelected: function (file) {
                var selected = core.$create(this.Selected, { file: file, ext: this._nMax > 1 ? { clear: '' } : {} });
                selected.$setParent(this);
                dom.insertBefore(selected.getMain(), this.getBody());
                return selected;
            },

            /**
             * @override
             */
            $validate: function (event) {
                var result = _super.$validate(event),
                    inputEl = this.getInput();
                if (this._nMax > 1 && inputEl.files.length + this.getUploadedCount() > this._nMax) {
                    event.addError(util.formatString(this.ERROR_MAX, this._nMax));
                    return false;
                }
                var acceptValid = true,
                    sizeValid = true;

                dom.toArray(inputEl.files).forEach(function (file) {
                    if (this._oAccept && !this._oAccept.test(file.name.toLocaleLowerCase())) {
                        acceptValid = false;
                    } else {
                        var reader = new FileReader();
                        reader.readAsDataURL(file);
                        if (file.size > this._nSize) {
                            sizeValid = false;
                        }
                    }
                }, this);
                if (!acceptValid) {
                    event.addError(util.formatString(this.ERROR_ACCEPT, this._sAccept));
                    return false;
                }
                if (!sizeValid) {
                    event.addError(util.formatString(this.ERROR_SIZE, this._nSize / 1024 / 1024));
                    return false;
                }
                return result;
            },

            /**
             * @override
             */
            getFormValue: function () {
                return this._aValue;
            },

            /**
             * 获取已经上传的文件数量。
             * @public
             *
             * @return {number} 已经上传的文件数量
             */
            getUploadedCount: function () {
                // 简易文件控件这个值为0
                return dom.children(this.getMain()).length - 1;
            }
        }
    );
})();
