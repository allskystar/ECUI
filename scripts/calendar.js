/*
Calendar - 定义日历显示的基本操作。
日历控件，继承自基础控件，内部包含了两个部件，分别是星期名称(网格控件)与日期(网格控件)。在日期网格控件里，第一行包含上
个月最后几天的信息，最后一行包含下个月最前几天的信息。日历控件不包含年/月/日的快速选择与切换，如果需要实现这些功能，请
将下拉框(选择月份)、输入框(输入年份)等组合使用建立新的控件或直接在页面上布局并调用接口。

日历控件直接HTML初始化的例子:
<div ecui="type:calendar;year:2009;month:11"></div>

属性
_nYear      - 年份
_nMonth     - 月份(0-11)
_uName      - 星期名称网格
_uDate      - 日期网格

子控件属性
_nDay       - 从本月1号开始计算的天数，如果是上个月，是负数，如果是下个月，会大于当月最大的天数
*/
//{if 0}//
(function () {

    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        DATE = Date,
        MATH = Math,
        FLOOR = MATH.floor,

        setText = dom.setText,
        inherits = util.inherits,

        $fastCreate = core.$fastCreate,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_COLLECTION = ui.Collection,
        UI_COLLECTION_CLASS = UI_COLLECTION.prototype;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化日历控件。
     * params 参数支持的属性如下：
     * year    日历控件的年份
     * month   日历控件的月份(1-12)
     * @public
     *
     * @param {Element} el 关联的 Element 对象
     * @param {Object} params 初始化参数
     */
    //__gzip_original__UI_CALENDAR
    //__gzip_original__UI_CALENDAR_DATE_COLLECTION
    var UI_CALENDAR =
        ui.Calendar = function (el, params) {
            UI_CONTROL.call(this, el, params);

            el.style.overflow = 'auto';

            // 分别插入日期网格与星期名称网格需要使用的层，星期名称网格初始化
            for (var i = 0, list = [], baseClass = params.base; i < 7; ) {
                list[i] =
                    '<div class="ec-collection-item ' + baseClass + '-name-item" style="float:left">' +
                        ['日', '一', '二', '三', '四', '五', '六'][i++] + '</div>';
            }
            list[i] =
                '</div><div class="ec-collection ' + baseClass + '-date" style="padding:0px;border:0px">';
            for (; ++i < 50; ) {
                list[i] = '<div class="ec-collection-item ' + baseClass + '-date-item" style="float:left"></div>';
            }

            el.innerHTML =
                '<div class="ec-collection ' + baseClass + '-name" style="padding:0px;border:0px">' +
                    list.join('') + '</div>';

            this._uName = $fastCreate(UI_COLLECTION, el.firstChild, this);
            this._uDate = $fastCreate(UI_CALENDAR_DATE_COLLECTION, el.lastChild, this);

            this.setDate(params.year, params.month);
        },
        UI_CALENDAR_CLASS = inherits(UI_CALENDAR, UI_CONTROL),

        /**
         * 初始化日历控件的日期集合部件。
         * @public
         *
         * @param {Element} el 关联的 Element 对象
         * @param {Object} params 初始化参数
         */
         UI_CALENDAR_DATE_COLLECTION = UI_CALENDAR.Date = function (el, params) {
            UI_COLLECTION.call(this, el, params);
        },
        UI_CALENDAR_DATE_COLLECTION_CLASS = inherits(UI_CALENDAR_DATE_COLLECTION, UI_COLLECTION);
//{else}//
    /**
     * 日期网格控件点击处理，将事件转发到日历控件的ondateclick事件上
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_CALENDAR_DATE_COLLECTION_CLASS.$click = function (event) {
        UI_COLLECTION_CLASS.$click.call(this, event);
        var calendar = this.getParent().getParent();
        if (calendar.ondateclick) {
            calendar.ondateclick(event, new DATE(calendar._nYear, calendar._nMonth, this._nDay));
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
    UI_CALENDAR_CLASS.$cache = function (style, cacheSize) {
        UI_CONTROL_CLASS.$cache.call(this, style, cacheSize);
        this._uName.cache(true, true);
        this._uDate.cache(true, true);
    };

    /**
     * 控件渲染完成后初始化的默认处理。
     * $init 方法在控件渲染完成后调用，参见 create 与 init 方法。
     * @protected
     */
    UI_CALENDAR_CLASS.$init = function () {
        UI_CONTROL_CLASS.$init.call(this);
        this._uName.$init();
    };

    /**
     * 设置控件的大小。
     * 日历控件与 网格控件 类似，$setSize 方法设置的大小不一定是实际控件的大小，受到了内部部件的影响。
     * @protected
     *
     * @param {number} width 宽度，如果不需要设置则将参数设置为等价于逻辑非的值
     * @param {number} height 高度，如果不需要设置则省略此参数
     */
    UI_CALENDAR_CLASS.$setSize = function (width, height) {
        UI_CONTROL_CLASS.$setSize.call(this, width);

        //__gzip_original__name
        //__gzip_original__date
        for (
            var i = 0,
                name = this._uName,
                date = this._uDate,
                itemWidth = FLOOR((width - this.getInvalidWidth(true)) / 7),
                itemHeight = FLOOR((height - this.getInvalidHeight(true) - name.getHeight()) / 6);
            i < 7;
        ) {
            name.getItem(i++).$setSize(itemWidth);
        }
        for (i = 0; i < 42; ) {
            date.getItem(i++).$setSize(itemWidth, itemHeight);
        }

        name.$setSize(itemWidth * 7);
        date.$setSize(itemWidth * 7);
    };

    /**
     * 获取日历控件当前显示的月份。
     * @public
     *
     * @return {number} 月份(1-12)
     */
    UI_CALENDAR_CLASS.getMonth = function () {
        return this._nMonth + 1;
    };

    /**
     * 获取日历控件当前显示的年份。
     * @public
     *
     * @return {number} 年份(19xx-20xx)
     */
    UI_CALENDAR_CLASS.getYear = function () {
        return this._nYear;
    };

    /**
     * 日历显示移动指定的月份数。
     * 参数为正整数则表示向当前月份之后的月份移动，负数则表示向当前月份之前的月份移动，设置后日历控件会刷新以显示新的日期。
     * @public
     *
     * @param {number} offsetMonth 日历移动的月份数
     */
    UI_CALENDAR_CLASS.move = function (offsetMonth) {
        var time = new DATE(this._nYear, this._nMonth + offsetMonth, 1);
        this.setDate(time.getFullYear(), time.getMonth() + 1);
    };

    /**
     * 设置日历控件当前显示的日期。
     * @public
     *
     * @param {number} year 年份(19xx-20xx)，如果省略使用浏览器的当前年份
     * @param {number} month 月份(1-12)，如果省略使用浏览器的当前月份
     */
    UI_CALENDAR_CLASS.setDate = function (year, month) {
        //__gzip_original__date
        var i = 0,
            date = this._uDate,
            today = new DATE(),
            year = year || today.getFullYear(),
            month = month ? month - 1 : today.getMonth(),
            // 得到上个月的最后几天的信息，用于补齐当前月日历的上月信息位置
            o = new DATE(year, month, 0),
            day = 1 - (o.getDay() + 1) % 7,
            lastDayOfLastMonth = o.getDate(),
            // 得到当前月的天数
            lastDayOfCurrMonth = new DATE(year, month + 1, 0).getDate();

        if (this._nYear != year || this._nMonth != month) {
            this._nYear = year;
            this._nMonth = month;

            for (; month = date.getItem(i++); ) {
                // 以下year变量表示日期是否为当月的flag，month变量表示日期单元格控件o
                month.setEnabled(year = day > 0 && day <= lastDayOfCurrMonth);
                setText(
                    month.getBody(),
                    year ? day : day > lastDayOfCurrMonth ? day - lastDayOfCurrMonth : lastDayOfLastMonth + day
                );
                month._nDay = day++;
            }

            year = date.getItem(35).isEnabled();
            for (i = 35; i < 42; ) {
                date.getItem(i++).alterClass('extra', year);
            }

            this.change();
        }
    };
//{/if}//
//{if 0}//
})();
//{/if}//