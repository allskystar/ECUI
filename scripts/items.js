/*
Item/Items - 定义选项操作相关的基本操作。
选项控件，继承自基础控件，用于弹出菜单、下拉框、交换框等控件的单个选项，通常不直接初始化。选项控件必须用在使用选项组接
口(Items)的控件中，选项控件支持移入操作的缓存，不会因为鼠标移出而改变状态，因此可以通过函数调用来改变移入移出状态，选
控件默认屏蔽了 DOM 的文本选中操作。选项组不是控件，是一组对选项进行操作的方法的集合，提供了基本的增/删操作，以及对选项
控件的状态控制的接口，通过将 ecui.ui.Items 对象下的方法复制到类的 prototype 属性下继承接口，最终对象要正常使用还需要在
类构造器中调用 $initItems 方法。
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

        indexOf = array.indexOf,
        remove = array.remove,
        children = dom.children,
        createDom = dom.create,
        insertBefore = dom.insertBefore,
        trim = string.trim,
        blank = util.blank,
        cancel = util.cancel,
        findConstructor = util.findConstructor,
        inherits = util.inherits,

        $fastCreate = core.$fastCreate,
        getParameters = core.getParameters,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化选项控件。
     * options 对象支持的属性如下：
     * parent 父控件对象
     * @public
     *
     * @param {Element} el 关联的 Element 对象
     * @param {string|Object} options 对象
     */
    //__gzip_original__UI_ITEM
    ///__gzip_original__UI_ITEMS
    var UI_ITEM =
        ui.Item = function (el, options) {
            UI_CONTROL.call(this, el, options);

            el.style.overflow = 'hidden';
        },
        UI_ITEM_CLASS = inherits(UI_ITEM, UI_CONTROL),

        UI_ITEMS = ui.Items = {};
//{else}//
    /**
     * 调用指定对象超类的指定方法。
     * callSuper 用于不确定超类类型时的访问，例如接口内定义的方法，需要注意的是，接口不能被一个类实现两次，否则将会引发死循环。
     * @public
     *
     * @param {Object} object 需要操作的对象
     * @param {string} name 方法名称
     * @param {Array} args 调用者的参数
     * @return {Object} 方法的返回值
     */
    function callSuper(object, name) {

        /**
         * 查找指定的方法对应的超类方法。
         * @private
         *
         * @param {Object} clazz 查找的起始类对象
         * @param {Function} caller 基准方法，即查找 caller 对应的超类方法
         * @return {Function} 基准方法对应的超类方法，没有找到基准方法返回 undefined，基准方法没有超类方法返回 null
         */
        function findPrototype(clazz, caller) {
            for (; clazz; clazz = clazz.constructor.superClass) {
                if (clazz[name] == caller) {
                    for (; clazz = clazz.constructor.superClass; ) {
                        if (clazz[name] != caller) {
                            return clazz[name];
                        }
                    }
                    return null;
                }
            }
        }

        //__gzip_original__clazz
        var clazz = object.constructor.prototype,
            caller = callSuper.caller,
            func = findPrototype(clazz, caller);

        if (func === undefined) {
            // 如果Items的方法直接位于prototype链上，是caller，如果是间接被别的方法调用Items.xxx.call，是caller.caller
            func = findPrototype(clazz, caller.caller);
        }

        if (func) {
            return func.apply(object, caller.arguments);
        }
    }

    /**
     * 鼠标单击控件事件的默认处理。
     * 如果控件处于可操作状态(参见 isEnabled)，click 方法触发 onclick 事件，如果事件返回值不为 false，则调用 $click 方法。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_ITEM_CLASS.$click = function (event) {
        UI_CONTROL_CLASS.$click.call(this, event);

        var parent = this.getParent();
        if (parent && parent.onitemclick) {
            parent.onitemclick(event, indexOf(UI_ITEMS[parent.getUID()], this));
        }
    };

    /**
     * 鼠标移入控件区域事件的默认处理。
     * 鼠标移入控件区域时默认调用 $mouseover 方法。如果控件处于可操作状态(参见 isEnabled)，mouseover 方法触发 onmouseover 事件，如果事件返回值不为 false，则调用 $mouseover 方法。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_ITEM_CLASS.$mouseover = function (event) {
        UI_CONTROL_CLASS.$mouseover.call(this, event);
        this.getParent().$setActived(this);
    };

    /**
     * 控件增加子控件事件的默认处理。
     * 选项组增加子选项时需要判断子控件的类型，并额外添加引用。
     * @protected
     *
     * @param {ecui.ui.Item} child 选项控件
     * @return {boolean} 是否允许增加子控件，默认允许
     */
    UI_ITEMS.$append = function (child) {
        // 检查待新增的控件是否为选项控件
        if (!(child instanceof (findConstructor(this, 'Item') || UI_ITEM)) || callSuper(this, '$append') === false) {
            return false;
        }
        UI_ITEMS[this.getUID()].push(child);
        this.$alterItems();
    };

    /**
     * 计算控件的缓存。
     * 控件缓存部分核心属性的值，提高控件属性的访问速度，在子控件或者应用程序开发过程中，如果需要避开控件提供的方法(setSize、alterClass 等)直接操作 Element 对象，操作完成后必须调用 clearCache 方法清除控件的属性缓存，否则将引发错误。
     * @protected
     *
     * @param {CssStyle} style 基本 Element 对象的 Css 样式对象
     * @param {boolean} cacheSize 是否需要缓存控件大小，如果控件是另一个控件的部件时，不缓存大小能加快渲染速度，默认缓存
     */
    UI_ITEMS.$cache = function (style, cacheSize) {
        callSuper(this, '$cache');

        for (var i = 0, list = UI_ITEMS[this.getUID()], o; o = list[i++]; ) {
            o.cache(true, true);
        }
    };

    /**
     * 控件渲染完成后初始化的默认处理。
     * $init 方法在控件渲染完成后调用，参见 create 与 init 方法。
     * @protected
     */
    UI_ITEMS.$init = function () {
        callSuper(this, '$init');
        this.$alterItems();
    };

    /**
     * 初始化选项组对应的 Element 对象。
     * 实现了 Items 接口的类在初始化时需要调用 $initItems 方法自动生成选项控件，$initItems 方法保证一个控件对象只允许被调用一次，多次的调用无效。
     * @protected
     */
    UI_ITEMS.$initItems = function () {
        this.$alterItems = blank;

        // 防止对一个控件进行两次包装操作
        UI_ITEMS[this.getUID()] = [];

        // 初始化选项控件
        for (var i = 0, list = children(this.getBody()), o; o = list[i++]; ) {
            this.add(o);
        }

        delete this.$alterItems;
    };

    /**
     * 控件移除子控件事件的默认处理。
     * 选项组移除子选项时需要额外移除引用。
     * @protected
     *
     * @param {ecui.ui.Item} child 选项控件
     */
    UI_ITEMS.$remove = function (child) {
        callSuper(this, '$remove');
        remove(UI_ITEMS[this.getUID()], child);
        this.$alterItems();
    };

    /**
     * 设置激活的选项。
     * $setActived 方法改变选项组控件中当前激活项的效果。
     * @protected
     *
     * @param {ecui.ui.Item} item 选项控件
     */
    UI_ITEMS.$setActived = function (item) {
        var list = UI_ITEMS[this.getUID()],
            actived = list._cActive;

        if (actived != item) {
            if (actived) {
                actived.alterClass('active', true);
            }
            if (item) {
                item.alterClass('active');
            }
            list._cActive = item;
        }
    };

    /**
     * 添加子选项控件。
     * add 方法中如果位置序号不合法，子选项控件将添加在末尾的位置。
     * @public
     *
     * @param {string|HTMLElement|ecui.ui.Item} item 控件的 html 内容/控件对应的 Element 对象/选项控件
     * @param {number} index 子选项控件需要添加的位置序号
     * @param {Object} options 子控件初始化选项
     * @return {ecui.ui.Item} 子选项控件
     */
    UI_ITEMS.add = function (item, index, options) {
        var list = UI_ITEMS[this.getUID()],
            o;

        if (item instanceof UI_ITEM) {
            // 选项控件，直接添加
            item.setParent(this);
        }
        else {
            // 根据是字符串还是Element对象选择不同的初始化方式
            if ('string' == typeof item) {
                this.getBody().appendChild(o = createDom());
                o.innerHTML = item;
                item = o;
            }

            item.className = 'ec-item ' + (trim(item.className) || this.getBaseClass() + '-item');

            options = options || getParameters(item);
            options.parent = this;
            options.select = false;
            list.push(item = $fastCreate(findConstructor(this, 'Item') || UI_ITEM, item, this, options));
            this.$alterItems();
        }

        // 改变选项控件的位置
        if (item.getParent() && (o = list[index]) && o != item) {
            insertBefore(item.getOuter(), o.getOuter());
            list.splice(index, 0, list.pop());
        }

        return item;
    };

    /**
     * 向选项组最后添加子选项控件。
     * append 方法是 add 方法去掉第二个 index 参数的版本。
     * @public
     *
     * @param {string|Element|ecui.ui.Item} item 控件的 html 内容/控件对应的 Element 对象/选项控件
     * @param {Object} 子控件初始化选项
     * @return {ecui.ui.Item} 子选项控件
     */
    UI_ITEMS.append = function (item, options) {
        this.add(item, undefined, options);
    };

    /**
     * 销毁控件。
     * dispose 方法触发 ondispose 事件，然后调用 $dispose 方法，dispose 方法在页面卸载时会被自动调用，通常不需要直接调用。
     * @public
     */
    UI_ITEMS.dispose = function () {
        delete UI_ITEMS[this.getUID()];
        callSuper(this, 'dispose');
    };

    /**
     * 获取当前处于激活状态的选项。
     * @public
     *
     * @return {ecui.ui.Item} 子选项控件
     */
    UI_ITEMS.getActived = function () {
        return UI_ITEMS[this.getUID()]._cActive || null;
    };

    /**
     * 获取全部的子选项控件。
     * @public
     *
     * @return {Array} 子选项控件数组
     */
    UI_ITEMS.getItems = function () {
        return UI_ITEMS[this.getUID()].slice();
    };

    /**
     * 移除子选项控件。
     * @public
     *
     * @param {number|ecui.ui.Item} item 选项控件的位置序号/选项控件
     * @return {ecui.ui.Item} 被移除的子选项控件
     */
    UI_ITEMS.remove = function (item) {
        if ('number' == typeof item) {
            item = UI_ITEMS[this.getUID()][item];
        }
        if (item) {
            item.setParent();
        }
        return item || null;
    };

    /**
     * 设置控件内所有子选项控件的大小。
     * @public
     *
     * @param {number} itemWidth 子选项控件的宽度
     * @param {number} itemHeight 子选项控件的高度
     */
    UI_ITEMS.setItemSize = function (itemWidth, itemHeight) {
        for (var i = 0, list = UI_ITEMS[this.getUID()], o; o = list[i++]; ) {
            o.$setSize(itemWidth, itemHeight);
        }
    };
//{/if}//
//{if 0}//
})();
//{/if}//
