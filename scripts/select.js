/*
Select - 定义模拟下拉框行为的基本操作。
下拉框控件，继承自输入框控件，实现了选项组接口，内部包含了三个部件，分别是下拉框显示的文本(选项控件)、下拉框的按钮(基
础控件)与下拉选项框(截面控件，只使用垂直滚动条)。下拉框控件扩展了原生 SelectElement 的功能，允许指定下拉选项框的最大选
项数量，在屏幕显示不下的时候，会自动显示在下拉框的上方。在没有选项时，下拉选项框有一个选项的高度。下拉框控件允许使用键
盘与滚轮操作，在下拉选项框打开时，可以通过回车键或鼠标点击选择，上下键选择选项的当前条目，在关闭下拉选项框后，只要拥有
焦点，就可以通过滚轮上下选择选项。

下拉框控件直接HTML初始化的例子:
<select ecui="type:select;option-size:3" name="test">
    <!-- 这里放选项内容 -->
    <option value="值">文本</option>
    ...
    <option value="值" selected>文本</option>
    ...
</select>

如果需要自定义特殊的选项效果，请按下列方法初始化:
<div ecui="type:select;name:test;option-size:3">
    <!-- 这里放选项内容 -->
    <li ecui="value:值">文本</li>
    ...
</div>

属性
_nOptionSize  - 下接选择框可以用于选择的条目数量
_cSelected    - 当前选中的选项
_uText        - 下拉框的文本框
_uButton      - 下拉框的按钮
_uOptions     - 下拉选择框
*/
//{if 0}//
(function () {

    var core = ecui,
        array = core.array,
        dom = core.dom,
        string = core.string,
        ui = core.ui,
        util = core.util,

        undefined,
        DOCUMENT = document,
        MATH = Math,
        MAX = MATH.max,
        MIN = MATH.min,

        indexOf = array.indexOf,
        children = dom.children,
        createDom = dom.create,
        getParent = dom.getParent,
        getPosition = dom.getPosition,
        getText = dom.getText,
        insertBefore = dom.insertBefore,
        moveElements = dom.moveElements,
        removeDom = dom.remove,
        encodeHTML = string.encodeHTML,
        extend = util.extend,
        getView = util.getView,
        inherits = util.inherits,

        $fastCreate = core.$fastCreate,
        findControl = core.findControl,
        getActived = core.getActived,
        getAttributeName = core.getAttributeName,
        intercept = core.intercept,
        mask = core.mask,
        restore = core.restore,

        UI_EDIT = ui.Edit,
        UI_EDIT_CLASS = UI_EDIT.prototype,
        UI_CONTROL = ui.Control,
        UI_PANEL = ui.Panel,
        UI_PANEL_CLASS = UI_PANEL.prototype,
        UI_ITEM = ui.Item,
        UI_ITEMS = ui.Items;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化下拉框控件。
     * options 对象支持的属性如下：
     * browser    是否使用浏览器原生的滚动条，默认使用模拟的滚动条
     * optionSize 下拉框最大允许显示的选项数量，默认为5
     * @public
     *
     * @param {Object} options 初始化选项
     */
    //__gzip_original__UI_SELECT
    //__gzip_original__UI_SELECT_OPTIONS
    //__gzip_original__UI_SELECT_ITEM
    var UI_SELECT =
        ui.Select = function (el, options) {
            options.hidden = true;

            //__gzip_original__baseClass
            //__gzip_original__partParams
            var i = 0,
                list = [],
                baseClass = options.base,
                partParams = {capture: false},
                name = el.name || options.name || '',
                value = el.value || options.value || '',
                elements = el.options,
                optionsEl = createDom(
                    'ec-panel ' + baseClass + '-options',
                    'position:absolute;z-index:65535;display:none'
                ),
                o = el;

            if (elements) {
                // 移除select标签
                el = insertBefore(createDom(el.className, el.style.cssText), el);
                removeDom(o);

                // 转化select标签
                for (; o = elements[i]; ) {
                    // 这里的text不进行转义，特殊字符不保证安全
                    list[i++] =
                        '<div ' + getAttributeName() + '="value:' + encodeHTML(o.value) + '">' + o.text + '</div>';
                }
                optionsEl.innerHTML = list.join('');
            }
            else {
                moveElements(el, optionsEl);
            }

            el.innerHTML =
                '<div class="ec-item ' + baseClass + '-text"></div><div class="ec-control ' + baseClass +
                    '-button" style="position:absolute"></div><input name="' + name + '">';

            UI_EDIT.call(this, el, options);

            // 初始化下拉区域，下拉区域需要强制置顶
            ;
            this.$setBody(
                (this._uOptions =
                    $fastCreate(UI_SELECT_OPTIONS, optionsEl, this, {hScroll: false, browser: options.browser}))
                .getBody());

            el = children(el);

            this._uText = $fastCreate(UI_ITEM, el[0], this, partParams);
            this._uButton = $fastCreate(UI_CONTROL, el[1], this, partParams);
            el[2].defaultValue = el[2].value = value;

            // 初始化下拉区域最多显示的选项数量
            this._nOptionSize = options.optionSize || 5;

            this.$initItems();
        },
        UI_SELECT_CLASS = inherits(UI_SELECT, UI_EDIT),

        /**
         * 初始化下拉框控件的下拉选项框部件。
         * @public
         *
         * @param {Object} options 初始化选项
         */
        UI_SELECT_OPTIONS = UI_SELECT.Options = function (el, options) {
            UI_PANEL.call(this, el, options);
        },
        UI_SELECT_OPTIONS_CLASS = inherits(UI_SELECT_OPTIONS, UI_PANEL),

        /**
         * 初始化下拉框控件的选项部件。
         * @public
         *
         * @param {Object} options 初始化选项
         */
        UI_SELECT_ITEM = UI_SELECT.Item = function (el, options) {
            UI_ITEM.call(this, el, options);
            this._sValue = options.value === undefined ? getText(el) : '' + options.value;
        },
        UI_SELECT_ITEM_CLASS = inherits(UI_SELECT_ITEM, UI_ITEM);
//{else}//
    /**
     * 下拉框刷新。
     * @private
     *
     * @param {ecui.ui.Select} control 下拉框控件
     */
    function UI_SELECT_FLUSH(control) {
        //__gzip_original__options
        var options = control._uOptions,
            scroll = options.$getSection('VScroll'),
            el = options.getOuter(),
            pos = getPosition(control.getOuter()),
            selected = control._cSelected,
            optionTop = pos.top + control.getHeight();

        // 第一次显示时需要进行下拉选项部分的初始化
        if (!getParent(el)) {
            DOCUMENT.body.appendChild(el);
            control.$alterItems();
        }

        if (options.isShow()) {
            control.$setActived(selected);
            scroll.setValue(scroll.getStep() * indexOf(control.getItems(), selected));

            // 以下使用control代替optionHeight
            control = options.getHeight();

            // 如果浏览器下部高度不够，将显示在控件的上部
            options.setPosition(
                pos.left,
                optionTop + control <= getView().bottom ? optionTop : pos.top - control
            );
        }
    }

    extend(UI_SELECT_CLASS, UI_ITEMS);

    /**
     * 销毁控件的默认处理。
     * 页面卸载时将销毁所有的控件，释放循环引用，防止在 IE 下发生内存泄漏，$dispose 方法的调用不会受到 ondispose 事件返回值的影响。
     * @protected
     */
    UI_SELECT_OPTIONS_CLASS.$dispose = function () {
        // 下拉选项框处于显示状态，需要先恢复状态
        if (this.isShow()) {
            mask();
            restore();
        }
        UI_PANEL_CLASS.$dispose.call(this);
    };

    /**
     * 获取选项的值。
     * getValue 方法返回选项控件的值，即选项选中时整个下拉框控件的值。
     * @public
     *
     * @return {string} 选项的值
     */
    UI_SELECT_ITEM_CLASS.getValue = function () {
        return this._sValue;
    };

    /**
     * 设置选项的值。
     * setValue 方法设置选项控件的值，即选项选中时整个下拉框控件的值。
     * @public
     *
     * @param {string} value 选项的值
     */
    UI_SELECT_ITEM_CLASS.setValue = function (value) {
        var parent = this.getParent();
        this._sValue = value;
        if (parent && this == parent._cSelected) {
            UI_EDIT_CLASS.setValue.call(parent, value);
        }
    };

    /**
     * 选项控件发生变化的处理。
     * 在 选项组接口 中，选项控件发生增加/减少操作时调用此方法。
     * @protected
     */
    UI_SELECT_CLASS.$alterItems = function () {
        //__gzip_original__options
        var options = this._uOptions,
            scroll = options.$getSection('VScroll'),
            optionSize = this._nOptionSize,
            step = this.getBodyHeight(),
            width = this.getWidth(),
            itemLength = this.getItems().length;

        if (getParent(options.getOuter())) {
            // 设置选项框
            scroll.setStep(step);

            // 为了设置激活状态样式, 因此必须控制下拉框中的选项必须在滚动条以内
            this.setItemSize(
                width - options.getInvalidWidth() - (itemLength > optionSize ? scroll.getWidth() : 0),
                step
            );

            // 设置options框的大小，如果没有元素，至少有一个单位的高度
            options.cache(false);
            options.$setSize(width, (MIN(itemLength, optionSize) || 1) * step + options.getInvalidHeight());
        }
    };

    /**
     * 计算控件的缓存。
     * 控件缓存部分核心属性的值，提高控件属性的访问速度，在子控件或者应用程序开发过程中，如果需要避开控件提供的方法(setSize、alterClass 等)直接操作 Element 对象，操作完成后必须调用 clearCache 方法清除控件的属性缓存，否则将引发错误。
     * @protected
     *
     * @param {CssStyle} style 基本 Element 对象的 Css 样式对象
     * @param {boolean} cacheSize 是否需要缓存控件大小，如果控件是另一个控件的部件时，不缓存大小能加快渲染速度，默认缓存
     */
    UI_SELECT_CLASS.$cache = function (style, cacheSize) {
        (getParent(this._uOptions.getOuter()) ? UI_ITEMS : UI_EDIT_CLASS).$cache.call(this, style, cacheSize);
        this._uText.cache(false, true);
        this._uButton.cache(false, true);
    };

    /**
     * 界面点击强制拦截事件的默认处理。
     * 控件在下拉框展开时，需要拦截浏览器的点击事件，如果点击在下拉选项区域，则选中当前项，否则直接隐藏下拉选项框，但不会改变控件激活状态。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_SELECT_CLASS.$intercept = function (event) {
        //__transform__control_o
        var control = findControl(event.target);
        this._uOptions.hide();
        mask();

        // 检查点击是否在当前下拉框的选项上
        if (control instanceof UI_SELECT_ITEM && control != this._cSelected) {
            this.setSelected(control);
            this.change();
        }
    };

    /**
     * 控件拥有焦点时，键盘事件的默认处理。
     * 屏蔽空格键按下事件。Opera 下仅用 keydown 不能屏蔽空格键事件，还需要在 keypress 中屏蔽。如果控件处于可操作状态(参见 isEnabled)，keydown/keypress 方法触发 onkeydown/onkeypress 事件，如果事件返回值不为 false，则调用 $keydown/$keypress 方法。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_SELECT_CLASS.$keydown = UI_SELECT_CLASS.$keypress = function (event) {
        UI_EDIT_CLASS['$' + event.type](event);

        //__gzip_original__options
        //__gzip_original__length
        var options = this._uOptions,
            scroll = options.$getSection('VScroll'),
            optionSize = this._nOptionSize,
            which = event.which,
            list = this.getItems(),
            length = list.length,
            active = this.getActived();

        if (getActived() != this) {
            // 当前不能存在鼠标操作，否则屏蔽按键
            if (which == 40 || which == 38) {
                if (length) {
                    if (options.isShow()) {
                        this.$setActived(list[which = MIN(MAX(0, indexOf(list, active) + which - 39), length - 1)]);
                        which -= scroll.getValue() / scroll.getStep();
                        scroll.skip(which < 0 ? which : which >= optionSize ? which - optionSize + 1 : 0);
                    }
                    else {
                        this.setSelected(MIN(MAX(0, indexOf(list, this._cSelected) + which - 39), length - 1));
                    }
                }
                return false;
            }
            else if (which == 27 || which == 13 && options.isShow()) {
                // 回车键选中，ESC键取消
                if (which == 13) {
                    this.setSelected(active);
                }
                options.hide();
                mask();
                restore();
                return false;
            }
        }
    };

    /**
     * 鼠标在控件区域滚动滚轮事件的默认处理。
     * 如果控件拥有焦点，则当前选中项随滚轮滚动而自动指向前一项或者后一项。如果控件处于可操作状态(参见 isEnabled)，mousewheel 方法触发 onmousewheel 事件，如果事件返回值不为 false，则调用 $mousewheel 方法。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_SELECT_CLASS.$mousewheel = function (event) {
        //__gzip_original__options
        //__gzip_original__length
        var options = this._uOptions,
            list = this.getItems(),
            length = list.length;

        if (options.isShow()) {
            options.$mousewheel(event);
        }
        else {
            this.setSelected(
                length ? MIN(MAX(0, indexOf(list, this._cSelected) + (event.detail > 0 ? 1 : -1)), length - 1) : null
            );
        }
        return false;
    };

    /**
     * 控件激活状态开始事件的默认处理。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_SELECT_CLASS.$activate = function (event) {
        UI_EDIT_CLASS.$activate.call(this, event);
        this._uOptions.show();
        // 拦截之后的点击，同时屏蔽所有的控件点击事件
        intercept(this);
        mask(0, 65534);
        UI_SELECT_FLUSH(this);
    };

    /**
     * 控件自动渲染全部完成后的处理。
     * 页面刷新时，部分浏览器会回填输入框的值，需要在回填结束后触发设置控件的状态。
     * @protected
     */
    UI_SELECT_CLASS.$ready = function () {
        this.setValue(this.getValue());
    };

    /**
     * 控件移除子控件事件的默认处理。
     * 下拉框移除子选项时需要检查选项是否被选中，如果被选中需要清除状态。
     * @protected
     *
     * @param {Item} item 选项控件
     */
    UI_SELECT_CLASS.$remove = function (item) {
        if (item == this._cSelected) {
            this.setSelected();
        }
        UI_ITEMS.$remove.call(this, item);
    };

    /**
     * 设置控件的大小。
     * @protected
     *
     * @param {number} width 宽度，如果不需要设置则将参数设置为等价于逻辑非的值
     * @param {number} height 高度，如果不需要设置则省略此参数
     */
    UI_SELECT_CLASS.$setSize = function (width, height) {
        UI_EDIT_CLASS.$setSize.call(this, width, height);
        this.$locate();
        height = this.getBodyHeight();

        // 设置文本区域
        this._uText.$setSize(width = this.getBodyWidth() - height, height);

        // 设置下拉按钮
        this._uButton.$setSize(height, height);
        this._uButton.setPosition(width, 0);
    };

    /**
     * 获取被选中的选项控件。
     * @public
     *
     * @return {ecui.ui.Item} 选项控件
     */
    UI_SELECT_CLASS.getSelected = function () {
        return this._cSelected || null;
    };

    /**
     * 设置下拉框允许显示的选项数量。
     * 如果实际选项数量小于这个数量，没有影响，否则将出现垂直滚动条，通过滚动条控制其它选项的显示。
     * @public
     *
     * @param {number} value 显示的选项数量，必须大于 1
     */
    UI_SELECT_CLASS.setOptionSize = function (value) {
        this._nOptionSize = value;
        this.$alterItems();
        UI_SELECT_FLUSH(this);
    };

    /**
     * 选中选项。
     * @public
     *
     * @param {number|ecui.ui.Item} item 选项的序号/选项控件
     */
    UI_SELECT_CLASS.setSelected = function (item) {
        // 将选项序号转换成选项
        item = 'number' == typeof item ? this.getItems()[item] : item || null;

        if (item !== this._cSelected) {
            this._uText.$setBodyHTML(item ? item.getBody().innerHTML : '');
            UI_EDIT_CLASS.setValue.call(this, item ? item._sValue : '');
            this._cSelected = item;
            if (this._uOptions.isShow()) {
                this.$setActived(item);
            }
        }
    };

    /**
     * 设置控件的值。
     * setValue 方法设置控件的值，设置的值必须与一个子选项的值相等，否则将被设置为空，使用 getValue 方法获取设置的值。
     * @public
     *
     * @param {string} value 需要选中的值
     */
    UI_SELECT_CLASS.setValue = function (value) {
        for (var i = 0, list = this.getItems(), o; o = list[i++]; ) {
            if (o._sValue == value) {
                this.setSelected(o);
                return;
            }
        }

        // 找不到满足条件的项，将选中的值清除
        this.setSelected();
    };
//{/if}//
//{if 0}//
})();
//{/if}//