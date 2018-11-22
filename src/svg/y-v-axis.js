/*
@example
<!-- 以下***表示具体的展现类型 -->
<div ui="type:YV***Axis"></div>
<script>
var options = {
    xAxis: {
        grid: [1, 1, 2, 2, 1], // 左间隔，[各个分类]，右间隔的宽度比例
        line: false, // 不显示轴线
        data: ['', '二手车', '新车']
    },
    yAxis: {
        grid: [1, 4, 1], // 左间隔，主区域，右间隔的高度比例
        line: false, // 不显示轴线
        max: 100, // 坐标轴最大值
        min: 0, // 坐标轴最小值
        format: '{0}%' // 值显示的格式
    },
    series: {
        ratio: [1 / 2, 1, 1 / 3], // 依次是宽度，文本相对位置，椭圆的长宽比
        data: [0, 5, 95] // 分类
    }
};
YVCylinderAxisControl.render(options);
YVBarAxisControl.render(options);
</script>
<style>
.axis-line {
    stroke: rgb(200, 200, 200);
}
.align-line {
    stroke: rgb(50, 50, 50);
}
.axis-text {
    fill: rgb(255, 255, 255);
    transform: translateX(50px) translateY(-10px);
}
.category-text {
    fill: rgb(255, 255, 255);
    text-anchor: middle;
}
.item-text {
    fill: rgb(255, 255, 255);
    text-anchor: middle;
}
.cylinder {
    .category-text {
        transform: translateY(30px);
    }
    .item-text {
        transform: translateY(-17px);
    }
    .item1-body {
        fill: rgba(38, 127, 232, 0.6)
    }
    .item1-head {
        fill: rgb(28, 133, 255)
    }
    .item1-foot {
        fill: rgb(37, 99, 172)
    }
    .item2-body {
        fill: rgba(32, 225, 247, 0.6)
    }
    .item2-head {
        fill: rgb(33, 228, 247)
    }
    .item2-foot {
        fill: rgb(17, 164, 180)
    }
}
.bar {
    .category-text {
        transform: translateY(20px);
    }
    .item-text {
        transform: translateY(-7px);
    }
    .item1 {
        fill: rgba(38, 127, 232, 0.6)
    }
    .item2 {
        fill: rgba(32, 225, 247, 0.6)
    }
}
</style>
*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
    function sum(array) {
        var ret = 0;
        array.forEach(function (n) {
            ret += n;
        });
        return ret;
    }

    /**
     * Y轴为值，X轴为分类的分类图基类。
     * @control
     */
    ui.YVAxis = core.inherits(
        ui.SVG,
        {
            /**
             * 绘制分类图。
             * @param {Object} options 分类图参数
             */
            render: function (options) {
                var width = this.getWidth(),
                    height = this.getHeight(),
                    xUnit = width / sum(options.xAxis.grid),
                    yUnit = height / sum(options.yAxis.grid),
                    yGrid = options.yAxis.grid[1],
                    min = options.yAxis.min,
                    max = options.yAxis.max,

                    x1 = xUnit * options.xAxis.grid[0],
                    y1 = yUnit * options.yAxis.grid[0],
                    x2 = width - xUnit * options.xAxis.grid[options.xAxis.grid.length - 1],
                    y2 = height - yUnit * options.yAxis.grid[2];

                for (var i = 0, y = y1, value = min, step = (max - value) / yGrid; i < yGrid + 1; i++) {
                    this.drawLine(x1, height - y, x2, height - y, value || options.yAxis.line === false ? 'align-line' : 'axis-line');
                    this.drawText(0, height - y, options.yAxis.format ? util.stringFormat(options.yAxis.format, value) : value, 'axis-text');
                    y += yUnit;
                    value += step;
                }
                if (options.xAxis.line !== false) {
                    this.drawLine(x1, height - y1, x1, height - y2, 'axis-line');
                }

                var x = x1;
                options.xAxis.data.forEach(function (item, index) {
                    var grid = options.xAxis.grid[index + 1],
                        w = grid * xUnit;

                    if (item) {
                        var value = options.series.data[index],
                            h0 = Math.max(0, (y2 - y1) * -min / (max - min)),
                            h = (y2 - y1) * (value - min) / (max - min) - h0,
                            cx = x + w / 2,
                            cy = height - y1 - h / 2 - h0;

                        this.drawText(cx, height - y1, item, 'category-text');
                        this.$drawItem(index, cx, cy, w * options.series.ratio[0], Math.abs(h), options.series);
                        this.drawText(cx, height - y1 - Math.max(0, h * options.series.ratio[1]) - h0, options.yAxis.format ? util.stringFormat(options.yAxis.format, value) : value, 'item-text');
                    }
                    x += w;
                }, this);

                ui.SVG.prototype.render.call(this);
            }
        }
    );

    /**
     * 方块分类图。
     * @control
     */
    ui.YVBarAxis = core.inherits(
        ui.YVAxis,
        {
            /**
             * @override
             */
            $drawItem: function (index, x, y, w, h) {
                this.drawRect(x - w / 2, y - h / 2, w, h, 'item item' + index);
            }
        }
    );

    /**
     * 圆柱分类图。
     * @control
     */
    ui.YVCylinderAxis = core.inherits(
        ui.YVAxis,
        {
            /**
             * @override
             */
            $drawItem: function (index, x, y, w, h, series) {
                var ellipseHeight = w * series.ratio[2] / 2;
                this.drawRect(x - w / 2, y - h / 2, w, h, 'item-body item' + index + '-body');
                this.drawEllipse(x, y + h / 2, w / 2, ellipseHeight, 'item-foot item' + index + '-foot');
                this.drawEllipse(x, y - h / 2, w / 2, ellipseHeight, 'item-head item' + index + '-head');
            }
        }
    );
}());
