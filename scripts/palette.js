/*
HTMLPalette - 定义拾色器的基本操作
拾色器控件，继承自基础控件，内部包含了多个部件，分别是色彩选择区(基础控件)、色彩选择区箭头(基础控件)、亮度条选择区(基
础控件)、亮度条选择区箭头(基础控件)、基本色彩选择区(基础控件组)、色彩显示区(基础控件)、输入区域(输入框控件组)与确认按
钮(基础控件)。

拾色器控件直接HTML初始化的例子:
<div ecui="type:palette">
</div>

属性
_uMain            - 左部色彩选择区
_uMain._uIcon     - 左部色彩选择区箭头
_uLightbar        - 中部亮度条选择区
_uLightbar._uIcon - 中部亮度条选择区箭头
_uColor           - 右部色彩显示区
_aValue           - 右部输入区域
_aButton          - 按钮数组
*/
//{if 0}//
(function () {

    var core = ecui,
        array = core.array,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        undefined,
        DOCUMENT = document,
        MATH = Math,
        REGEXP = RegExp,
        ROUND = MATH.round,

        USER_AGENT = navigator.userAgent,
        ieVersion = /msie (\d+\.\d)/i.test(USER_AGENT) ? DOCUMENT.documentMode || (REGEXP.$1 - 0) : undefined,

        indexOf = array.indexOf,
        children = dom.children,
        inherits = util.inherits,
        timer = util.timer,

        $fastCreate = core.$fastCreate,
        drag = core.drag,
        getKey = core.getKey,
        getMouseX = core.getMouseX,
        getMouseY = core.getMouseY,
        Color = core.Color,

        UI_CONTROL = ui.Control,
        UI_CONTROL_CLASS = UI_CONTROL.prototype,
        UI_COLLECTION = ui.Collection,
        UI_COLLECTION_CLASS = UI_COLLECTION.prototype,
        UI_FORMAT_EDIT = ui.FormatEdit,
        UI_FORMAT_EDIT_CLASS = UI_FORMAT_EDIT.prototype;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化拾色器控件。
     * @public
     *
     * @param {Element} el 关联的 Element 对象
     * @param {Object} params 初始化参数
     */
    //__gzip_original__UI_PALETTE
    //__gzip_original__UI_PALETTE_AREA
    //__gzip_original__UI_PALETTE_COLLECTION
    //__gzip_original__UI_PALETTE_EDIT
    //__gzip_original__UI_PALETTE_BUTTON
    var UI_PALETTE =
        ui.Palette = function (el, params) {
            UI_CONTROL.call(this, el, params);

            //__gzip_original__baseClass
            //__gzip_original__areaParams
            var i = 0,
                baseClass = params.base,
                areaParams = {capture: false},
                list = [
                    '<div class="' + baseClass + '-left" style="float:left"><div class="ec-control ' +
                        baseClass + '-image" style="position:relative;overflow:hidden"><div class="ec-control ' +
                        baseClass + '-cross" style="position:absolute"><div></div></div></div></div><div class="' +
                        baseClass + '-mid" style="float:left"><div class="ec-control ' +
                        baseClass + '-lightbar" style="position:relative">'
                ];

            for (; ++i < 257; ) {
                list[i] = '<div style="height:1px;overflow:hidden"></div>';
            }

            list[i++] =
                '<div class="ec-control ' + baseClass +
                    '-arrow" style="position:absolute"><div></div></div></div></div><div class="' +
                    baseClass + '-right" style="float:left"><p>基本颜色</p><div class="' +
                    baseClass + '-basic" style="white-space:normal">';

            for (; i < 306; ) {
                list[i++] =
                    '<div class="ec-control ' + baseClass + '-area" style="' +
                        (ieVersion < 8 ? 'display:inline;zoom:1' : 'display:inline-block') +
                        ';background:#' + UI_PALETTE_BASIC_COLOR[i - 259] + '"></div>';
            }

            list[i] =
                '</div><table cellspacing="0" cellpadding="0" border="0"><tr><td class="' +
                    baseClass + '-color" rowspan="3"><div class="ec-control ' +
                    baseClass + '-show"></div><input class="ec-edit ' +
                    baseClass + '-value"></td><th>色调:</th><td><input class="ec-edit ' +
                    baseClass + '-edit"></td><th>红:</th><td><input class="ec-edit ' +
                    baseClass + '-edit"></td></tr><tr><th>饱和度:</th><td><input class="ec-edit ' +
                    baseClass + '-edit"></td><th>绿:</th><td><input class="ec-edit ' +
                    baseClass + '-edit"></td></tr><tr><th>亮度:</th><td><input class="ec-edit ' +
                    baseClass + '-edit"></td><th>蓝:</th><td><input class="ec-edit ' +
                    baseClass + '-edit"></td></tr></table><div class="ec-control ' +
                    baseClass + '-button">确定</div><div class="ec-control ' +
                    baseClass + '-button">取消</div></div>';

            el.innerHTML = list.join('');

            // 初始化色彩选择区
            el = el.firstChild;
            params = this._uMain = $fastCreate(UI_PALETTE_AREA, list = el.firstChild, this);
            params._uIcon = $fastCreate(UI_PALETTE_AREA, list.lastChild, params, areaParams);

            // 初始化亮度条选择区
            el = el.nextSibling;
            params = this._uLightbar = $fastCreate(UI_PALETTE_AREA, list = el.firstChild, this);
            params._uIcon = $fastCreate(UI_PALETTE_AREA, list.lastChild, params, areaParams);

            // 初始化基本颜色区
            list = children(el.nextSibling);
            this._uBasic = $fastCreate(UI_PALETTE_COLLECTION, list[1], this);

            // 初始化颜色输入框区域
            el = list[2].getElementsByTagName('td');
            this._uColor = $fastCreate(UI_CONTROL, el[0].firstChild, this);

            this._aValue = [];
            for (i = 0; i < 7; ) {
                this._aValue[i] = $fastCreate(
                    UI_PALETTE_EDIT,
                    el[i].lastChild,
                    this,
                    i++ ? {keyMask: '[0-9]', maxValue: 255} : {keyMask: '[0-9A-Fa-f]', maxLength: 6}
                );
            }

            // 初始化确认与取消按钮
            this._aButton = [
                $fastCreate(UI_PALETTE_BUTTON, list[3], this),
                $fastCreate(UI_PALETTE_BUTTON, list[4], this)
            ];
        },
        UI_PALETTE_CLASS = inherits(UI_PALETTE, UI_CONTROL),

        /**
         * 初始化拾色器控件的区域部件。
         * @public
         *
         * @param {Element} el 关联的 Element 对象
         * @param {Object} params 初始化参数
         */
        UI_PALETTE_AREA = UI_PALETTE.Area = function (el, params) {
            UI_CONTROL.call(this, el, params);
        },
        UI_PALETTE_AREA_CLASS = inherits(UI_PALETTE_AREA, UI_CONTROL),

        /**
         * 初始化拾色器控件的基本色彩区域集合部件。
         * @public
         *
         * @param {Element} el 关联的 Element 对象
         * @param {Object} params 初始化参数
         */
        UI_PALETTE_COLLECTION = UI_PALETTE.Collection = function (el, params) {
            UI_COLLECTION.call(this, el, params);
        },
        UI_PALETTE_COLLECTION_CLASS = inherits(UI_PALETTE_COLLECTION, UI_COLLECTION),

        /**
         * 初始化拾色器控件的输入框部件。
         * @public
         *
         * @param {Element} el 关联的 Element 对象
         * @param {Object} params 初始化参数
         */
        UI_PALETTE_EDIT = UI_PALETTE.Edit = function (el, params) {
            UI_FORMAT_EDIT.call(this, el, params);
        },
        UI_PALETTE_EDIT_CLASS = inherits(UI_PALETTE_EDIT, UI_FORMAT_EDIT),

        /**
         * 初始化拾色器控件的按钮部件。
         * @public
         *
         * @param {Element} el 关联的 Element 对象
         * @param {Object} params 初始化参数
         */
        UI_PALETTE_BUTTON = UI_PALETTE.Button = function (el, params) {
            UI_CONTROL.call(this, el, params);
        },
        UI_PALETTE_BUTTON_CLASS = inherits(UI_PALETTE_BUTTON, UI_CONTROL),

        UI_PALETTE_BASIC_COLOR = [
            'FF8080', 'FFFF80', '80FF80', '00FF80', '80FFFF', '0080F0', 'FF80C0', 'FF80FF',
            'FF0000', 'FFFF00', '80FF00', '00FF40', '00FFFF', '0080C0', '8080C0', 'FF00FF',
            '804040', 'FF8040', '00FF00', '008080', '004080', '8080FF', '800040', 'FF0080',
            '800000', 'FF8000', '008000', '008040', '0000FF', '0000A0', '800080', '8000FF',
            '400000', '804000', '004000', '004040', '000080', '000040', '400040', '400080',
            '000000', '808000', '808040', '808080', '408080', 'C0C0C0', '404040', 'FFFFFF'
        ];
//{else}//
    /**
     * 刷新色彩值输入框。
     * @private
     *
     * @param {ecui.ui.Palette} palette 拾色器控件对象
     * @param {Array} colors 色彩值数组，依次为 RGB, H, R, S, G, L, B，省略的值将不填充
     */
    function UI_PALETTE_VALUES_FLUSH(palette, colors) {
        for (var i = 0; i < 7; i++) {
            if (colors[i] !== undefined) {
                if (!i) {
                    palette._uColor.getBase().style.backgroundColor = '#' + colors[i];
                }
                palette._aValue[i].setValue(colors[i]);
            }
        }
    }

    /**
     * 刷新亮度条选择区。
     * @private
     *
     * @param {ecui.ui.Palette} palette 拾色器控件对象
     * @param {number} hue 色调值(0-1)
     * @param {number} saturation 饱和度值(0-1)
     */
    function UI_PALETTE_LIGHTBAR_FLUSH(palette, hue, saturation) {
        for (var i = 0, list = children(palette._uLightbar.getBody()), color = new Color(); i < 256; ) {
            color.setHSL(hue, saturation, 1 - i / 255);
            list[i++].style.backgroundColor = '#' + color.getRGB();
        }
    }

    /**
     * 刷新箭头位置。
     * @private
     *
     * @param {ecui.ui.Palette} palette 拾色器控件对象
     */
    function UI_PALETTE_POSITION_FLUSH(palette) {
        //__gzip_original__values
        var values = palette._aValue,
            x = values[1].getValue(),
            y = values[3].getValue();

        palette._uMain._uIcon.setPosition(x, 255 - y);
        palette._uLightbar._uIcon.getOuter().style.top = 255 - values[5].getValue() + 'px';
        UI_PALETTE_LIGHTBAR_FLUSH(palette, x / 255, y / 255);
    }

    /**
     * 刷新 RGB 色彩空间相关区域。
     * @private
     *
     * @param {ecui.ui.Palette} palette 拾色器控件对象
     */
    function UI_PALETTE_RGB_FLUSH(palette) {
        //__gzip_original__values
        var values = palette._aValue,
            color = new Color();

        color.setHSL(values[1].getValue() / 255, values[3].getValue() / 255, values[5].getValue() / 255);

        UI_PALETTE_VALUES_FLUSH(palette, [
            color.getRGB(),
            undefined,
            color.getRed(),
            undefined,
            color.getGreen(),
            undefined,
            color.getBlue()
        ]);
    }

    /**
     * 刷新 HSL 色彩空间相关区域。
     * @private
     *
     * @param {ecui.ui.Palette} palette 拾色器控件对象
     */
    function UI_PALETTE_HSL_FLUSH(palette) {
        //__gzip_original__values
        var values = palette._aValue,
            color = new Color();

        color.setRGB(values[2].getValue() - 0, values[4].getValue() - 0, values[6].getValue() - 0);

        UI_PALETTE_VALUES_FLUSH(palette, [
            color.getRGB(),
            ROUND(color.getHue() * 256) % 256,
            undefined,
            ROUND(color.getSaturation() * 255),
            undefined,
            ROUND(color.getLight() * 255)
        ]);

        UI_PALETTE_POSITION_FLUSH(palette);
    }

    /**
     * 色彩选择区箭头或亮度条选择区箭头拖曳移动事件的默认处理。
     * @protected
     *
     * @param {Event} event 事件对象
     * @param {number} x 移动到的 x 轴座标
     * @param {number} y 移动到的 y 轴座标
     */
    UI_PALETTE_AREA_CLASS.$dragmove = function (event, x, y) {
        UI_CONTROL_CLASS.$dragmove.call(this, event, x, y);

        //__gzip_original__values
        var parent = this.getParent(),
            palette = parent.getParent(),
            values = palette._aValue;

        y = 255 - y;
        if (parent == palette._uMain) {
            values[1].setValue(x);
            values[3].setValue(y);
            UI_PALETTE_LIGHTBAR_FLUSH(palette, x / 255, y / 255);
        }
        else {
            values[5].setValue(y);
        }

        UI_PALETTE_RGB_FLUSH(palette);
    };

    /**
     * 色彩选择区或亮度条选择区激活开始事件的默认处理。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_PALETTE_AREA_CLASS.$activate = function (event) {
        UI_CONTROL_CLASS.$activate.call(this, event);

        var control = this._uIcon,
            x,
            y = getMouseY(this),
            range = {top: 0, bottom: 255 + control.getHeight()};

        if (this == this.getParent()._uMain) {
            x = getMouseX(this);
            range.left = 0;
            range.right = 255 + control.getWidth();
        }
        else {
            if (y < 0 || y > 255) {
                return;
            }
            range.left = range.right = x = control.getX();
        }

        control.setPosition(x, y);
        drag(control, event, range);
        control.$dragmove(event, x, y);
    };

    /**
     * 基本色彩区鼠标点击事件的默认处理。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_PALETTE_COLLECTION_CLASS.$click = function (event) {
        UI_COLLECTION_CLASS.$click.call(this, event);
        this.getParent().getParent().setColor(new Color(UI_PALETTE_BASIC_COLOR[this.getIndex()]));
    };

    /**
     * 色彩输入框内容改变事件的默认处理。
     * @protected
     */
    UI_PALETTE_EDIT_CLASS.$change = function () {
        UI_FORMAT_EDIT_CLASS.$change.call(this);

        var parent = this.getParent(),
            text = this.getValue();

        if (this == parent._aValue[0]) {
            text = this.$getInputText();
            if (text && text.length == 6) {
                parent.setColor(new Color(text));
            }
            else {
                this.restore();
            }
        }
        else {
            if (!text) {
                this.setValue(0);
                timer(function () {
                    this.setCaret(1);
                }, 0, this);
            }
            else if (text.charAt(0) == '0') {
                this.setValue(text - 0);
            }

            if (indexOf(parent._aValue, this) % 2) {
                UI_PALETTE_RGB_FLUSH(parent);
                UI_PALETTE_POSITION_FLUSH(parent);
            }
            else {
                UI_PALETTE_HSL_FLUSH(parent);
            }
        }
    };

    /**
     * RGB 色彩输入框键盘按下事件的默认处理。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_PALETTE_EDIT_CLASS.$keydown = function (event) {
        UI_FORMAT_EDIT_CLASS.$keydown.call(this, event);

        var parent = this.getParent(),
            text = this.getValue(),
            start = this.getSelectionStart(),
            end = this.getSelectionEnd(),
            which = getKey();

        if (!event.ctrlKey && this == parent._aValue[0]) {
            if (which == 46 || which == 8) {
                event.preventDefault();
            }
            else if (which != 37 && which != 39) {
                if (start == end) {
                    end++;
                }

                which = String.fromCharCode(which).toUpperCase();
                if (/[0-9A-F]/.test(which)) {
                    text = text.slice(0, start) + which + text.slice(end);
                    if (text.length == 6) {
                        parent.setColor(new Color(text));
                        this.setCaret(end);
                    }
                    event.preventDefault();
                }
            }
        }
    };

    /**
     * 确认或取消按钮鼠标点击事件的默认处理。
     * @protected
     *
     * @param {Event} event 事件对象
     */
    UI_PALETTE_BUTTON_CLASS.$click = function (event) {
        UI_CONTROL_CLASS.$click.call(this, event);

        event = this.getParent();
        if (indexOf(event._aButton, this)) {
            event.hide();
        }
        else if (event.onconfirm) {
            event.onconfirm();
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
    UI_PALETTE_CLASS.$cache = function (style, cacheSize) {
        UI_CONTROL_CLASS.$cache.call(this, style, cacheSize);

        this._uMain.cache(false, true);
        this._uLightbar.cache(false, true);
    };

    /**
     * 控件渲染完成后初始化的默认处理。
     * @protected
     */
    UI_PALETTE_CLASS.$init = function () {
        UI_CONTROL_CLASS.$init.call(this);
        this.setColor(new Color('808080'));
    };

    /**
     * 设置控件的大小。
     * $setSize 方法设置控件实际的大小，不改变其它的如缓存等信息。
     * @protected
     *
     * @param {number} width 宽度，如果不需要设置则将参数设置为等价于逻辑非的值
     * @param {number} height 高度，如果不需要设置则省略此参数
     */
    UI_PALETTE_CLASS.$setSize = function (width, height) {
        UI_CONTROL_CLASS.$setSize.call(this, width, height);

        this._uMain.setBodySize(256, 256);
        this._uLightbar.setBodySize(0, 256);
    };

    /**
     * 获取拾色器当前选中的颜色对象。
     * @public
     *
     * @return {ecui.Color} 拾色器当前选中的颜色对象
     */
    UI_PALETTE_CLASS.getColor = function () {
        return new Color(this._aValue[0].getValue());
    };

    /**
     * 设置拾色器当前选中的颜色对象。
     * @public
     *
     * @param {ecui.Color} color 颜色对象
     */
    UI_PALETTE_CLASS.setColor = function (color) {
        UI_PALETTE_VALUES_FLUSH(this, [
            undefined,
            undefined,
            color.getRed(),
            undefined,
            color.getGreen(),
            undefined,
            color.getBlue()
        ]);
        UI_PALETTE_HSL_FLUSH(this);
    };
//{/if}//
//{if 0}//
})();
//{/if}//