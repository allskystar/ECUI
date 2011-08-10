/*
Collection - 定义批量控件集的事件与基本操作。
集合控件，继承自基础控件，将大量子控件组合而成的控件。集合控件统一管理，所有子控件的事件允许调用统一的事件方法，可用于日
历、调色板等。

网格控件直接HTML初始化的例子:
<div ecui="type:collection"></div>

属性
_aItem  - 子控件集合
*/
//{if 0}//
(function () {

    var core = ecui,
        array = core.array,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        indexOf = array.indexOf,
        children = dom.children,
        blank = util.blank,
        inherits = util.inherits,

        $fastCreate = core.$fastCreate,

        eventNames = [
            'mousedown', 'mouseover', 'mousemove', 'mouseout', 'mouseup',
            'click', 'focus', 'blur', 'activate', 'deactivate',
            'keydown', 'keypress', 'keyup', 'mousewheel',
            'change', 'resize', 'create', 'init'
        ],

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化网格控件。
     * @public
     *
     * @param {Object} options 初始化选项
     */
    //__gzip_original__UI_COLLECTION
    //__gzip_original__UI_COLLECTION_ITEM
    var UI_COLLECTION =
        ui.Collection = function (el, options) {
            UI_CONTROL.call(this, el, options);

            this._aItem = [];
            for (var i = 0, list = children(el), o; o = list[i]; ) {
                // 设置子控件在整个网格中的序号
                this._aItem[i++] = $fastCreate(UI_COLLECTION_ITEM, o, this);
            }
        },
        UI_COLLECTION_CLASS = inherits(UI_COLLECTION, UI_CONTROL),

        /**
         * 初始化网格控件的选项部件。
         * @public
         *
         * @param {Object} options 初始化选项
         */
        UI_COLLECTION_ITEM = UI_COLLECTION.Item = function (el, options) {
            UI_CONTROL.call(this, el, options);
        },
        UI_COLLECTION_ITEM_CLASS = inherits(UI_COLLECTION_ITEM, UI_CONTROL);
//{else}//
    /**
     * 获取网格子控件在网格控件中的序号。
     * 在网格控件的事件中，事件对应的 this 是真正产生事件的网格子控件，通过 getIndex 方法能知道当前的网格子控件在网格控件中的序号，参见 getItem 方法。
     * @public
     *
     * @return {number} 子控件的序号
     */
    UI_COLLECTION_ITEM_CLASS.getIndex = function () {
        return indexOf(this.getParent()._aItem, this);
    };

    /**
     * 计算控件的缓存。
     * 控件缓存部分核心属性的值，提高控件属性的访问速度，在子控件或者应用程序开发过程中，如果需要避开控件提供的方法(setSize、alterClass 等)直接操作 Element 对象，操作完成后必须调用 clearCache 方法清除控件的属性缓存，否则将引发错误。
     * @protected
     *
     * @param {CssStyle} style 基本 Element 对象的 Css 样式对象
     * @param {boolean} cacheSize 是否需要缓存控件大小，如果控件是另一个控件的部件时，不缓存大小能加快渲染速度，默认缓存
     */
    UI_COLLECTION_CLASS.$cache = function (style, cacheSize) {
        UI_CONTROL_CLASS.$cache.call(this, style, cacheSize);

        // 以下使用cacheSize表示o，使用style表示i
        for (style = 0; cacheSize = this._aItem[style++]; ) {
            cacheSize.cache(false, true);
        }
    };

    /**
     * 获取指定的网格子控件。
     * 子控件的序号从行到列，逐一累加，例如，一个 3*3 的网格控件，第一行第一列序号为 0，第一行第二列序号为 1，第一行第三列序号为 2，第二行第一列序号为3，行二行第二列序号为 4，依此类推。
     * @public
     *
     * @param {number} index 子控件的序号
     * @return {ecui.ui.Control} 子控件对象
     */
    UI_COLLECTION_CLASS.getItem = function (index) {
        return this._aItem[index];
    };

    /**
     * 初始化事件处理函数，以事件名命名，这些函数行为均是判断控件是否可操作/是否需要调用事件/是否需要执行缺省的事件处
     * 理，对应的缺省事件处理函数名以$开头后接事件名，处理函数以及缺省事件处理函数参数均为事件对象，仅执行一次。这些函
     * 数都需要提供给内部的子控件使用，因此需要关联Collection控件。
     */
    (function () {
        function build(name) {
            UI_COLLECTION_CLASS[name] = blank;
            UI_COLLECTION_ITEM_CLASS[name] = function (event) {
                var o = this.getParent();
                if (!this.isDisabled()) {
                    if (!(o['on' + name] && o['on' + name].call(this, event) === false)) {
                        o['$' + name].call(this, event);
                    }
                }
            };
        }
        for (var i = 0; i < 10; ) {
            build(eventNames[i++]);
        }
    })();
//{/if}//
//{if 0}//
})();
//{/if}//