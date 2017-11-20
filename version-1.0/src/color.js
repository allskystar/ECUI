/*
Color - 色彩类，定义从 RGB 到 HSL 之间的互相转化

属性
_aValue      - 颜色组，依次是红色、绿色、蓝色(0-255)、色调、饱和度、亮度(0-1)
*/
//{if 0}//
(function () {

    var core = ecui,

        MATH = Math,
        MAX = MATH.max,
        MIN = MATH.min,
        ROUND = MATH.round,
        PARSEINT = parseInt;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化色彩对象。
     * @public
     *
     * @param {string} hex 6 字符色彩值(如FFFFFF)，如果为空将使用000000
     */
    //__gzip_original__Color
    var Color =
        core.Color = function (hex) {
            if (hex) {
                this.setRGB(PARSEINT(hex.slice(0, 2), 16), PARSEINT(hex.slice(2, 4), 16), PARSEINT(hex.slice(4), 16));
            }
            else {
                this.setRGB(0, 0, 0);
            }
        },
        COLOR_CLASS = Color.prototype;
//{else}//
    /**
     * 根据色调计算 RGB 模式下的单系色彩值
     * @private
     *
     * @param {number} minValue HSL 色彩中的最小值
     * @param {number} maxValue HSL 色彩中的最大值
     * @param {number} hue 色调
     * @return {number} 色彩值(0-255)
     */
    function COLOR_HUE2RGB(minValue, maxValue, hue) {
        hue = hue < 0 ? hue + 1 : (hue > 1 ? hue - 1 : hue);
        hue = hue < 0.5 ? MIN(6 * hue, 1) : MAX(4 - 6 * hue, 0);
        return ROUND(255 * (minValue + (maxValue - minValue) * hue));
    }

    /**
     * 获取 RGB 模式下的蓝色值
     * @public
     *
     * @return {number} 蓝色值(0-255)
     */
    COLOR_CLASS.getBlue = function () {
        return this._aValue[2];
    };

    /**
     * 获取 RGB 模式下的绿色值
     * @public
     *
     * @return {number} 绿色值(0-255)
     */
    COLOR_CLASS.getGreen = function () {
        return this._aValue[1];
    };

    /**
     * 获取 HSL 模式下的色调
     * @public
     *
     * @return {number} 色调(0-1)
     */
    COLOR_CLASS.getHue = function () {
        return this._aValue[3];
    };

    /**
     * 获取 HSL 模式下的亮度
     * @public
     *
     * @return {number} 亮度(0-1)
     */
    COLOR_CLASS.getLight = function () {
        return this._aValue[5];
    };

    /**
     * 获取 RGB 模式下 6 字符表示的 16 进制色彩值
     * @public
     *
     * @return {string} 6 字符色彩值(如FFFFFF)
     */
    COLOR_CLASS.getRGB = function () {
        //__gzip_original__red
        //__gzip_original__green
        //__gzip_original__blue
        var values = this._aValue,
            red = values[0],
            green = values[1],
            blue = values[2];

        return (
            (red < 16 ? '0' : '') + red.toString(16) + (green < 16 ? '0' : '') + green.toString(16) +
            (blue < 16 ? '0' : '') + blue.toString(16)
        ).toUpperCase();
    };

    /**
     * 获取 RGB 模式下的红色值
     * @public
     *
     * @return {number} 红色值(0-255)
     */
    COLOR_CLASS.getRed = function () {
        return this._aValue[0];
    };

    /**
     * 获取 HSL 模式下的饱和度
     * @public
     *
     * @return {number} 饱和度(0-1)
     */
    COLOR_CLASS.getSaturation = function () {
        return this._aValue[4];
    };

    /**
     * 设置 RGB 模式的色彩
     * @public
     *
     * @param {number} red 红色值(0-255)
     * @param {number} green 绿色值(0-255)
     * @param {number} blue 蓝色值(0-255)
     */
    COLOR_CLASS.setRGB = function (red, green, blue) {
        var redRate = red / 255,
            greenRate = green / 255,
            blueRate = blue / 255,
            minValue = MIN(redRate, greenRate, blueRate),
            maxValue = MAX(redRate, greenRate, blueRate),
            saturation = maxValue - minValue,
            light = (maxValue + minValue) / 2,
            hue;

        if (saturation) {
            hue = redRate == maxValue ?
                (greenRate - blueRate) / 6 / saturation : (greenRate == maxValue ?
                    1 / 3 + (blueRate - redRate) / 6 / saturation : 2 / 3 + (redRate - greenRate) / 6 / saturation
                );
            hue = hue < 0 ? hue += 1 : (hue > 1 ? hue -= 1 : hue);
            saturation = light < 0.5 ? saturation / (maxValue + minValue) : saturation / (2 - maxValue - minValue);
        }
        else {
            hue = 0;
            saturation = 0;
        }

        this._aValue = [red, green, blue, hue, saturation, light];
    };

    /**
     * 设置 HSL 模式的色彩
     * @public
     *
     * @param {number} hue 色调(0-1)
     * @param {number} saturation 饱和度(0-1)
     * @param {number} light 亮度(0-1)
     */
    COLOR_CLASS.setHSL = function (hue, saturation, light) {
        var maxValue = light + MIN(light, 1 - light) * saturation,
            minValue = 2 * light - maxValue;

        this._aValue = [
            COLOR_HUE2RGB(minValue, maxValue, hue + 1 / 3),
            COLOR_HUE2RGB(minValue, maxValue, hue),
            COLOR_HUE2RGB(minValue, maxValue, hue - 1 / 3),
            hue,
            saturation,
            light
        ];
    };
//{if 0}//
})();
//{/if}//
//{/if}//