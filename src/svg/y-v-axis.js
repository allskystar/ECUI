/*
@example
<!-- 以下***表示具体的展现类型 -->
<div ui="type:YV***AxisChart">
    <!-- 参见svg.js -->
</div>
<script>
var options = {
    xAxis: {
        grid: [1, 1, 2, 2, 1],
        line: false,
        data: ['', '二手车', '新车']
    },
    yAxis: {
        grid: [1, 4, 1],
        line: false,
        max: 50, // 坐标轴最大值
        min: -50, // 坐标轴最小值
        formatter: '{0}%' // 值显示的格式
    },
    series: {
        ratio: {
            width: 1 / 2, // 宽度相对分类的总宽度比例
            text: 1, // 文本相对于当前选项高度的比例
            ellipse: 1 / 3 // 椭圆的高宽比例，仅对YVCylinderAxis有效
        },
        data: [0, -20, 50] // 取值
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
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * Y轴为值，X轴为分类的分类图基类。
     * @control
     */
    ui.YVAxisChart = core.inherits(
        ui.SVG,
        {
            /**
             * 绘制分类图。
             * @param {Object} options 分类图参数
             */
            render: function (options) {
                var width = this.getWidth(),
                    height = this.getHeight(),
                    xUnit = width / util.sum(options.xAxis.grid),
                    yUnit = height / util.sum(options.yAxis.grid),
                    yGrid = options.yAxis.grid[1],
                    min = options.yAxis.min,
                    max = options.yAxis.max,

                    x1 = xUnit * options.xAxis.grid[0],
                    y1 = yUnit * options.yAxis.grid[0],
                    x2 = width - xUnit * options.xAxis.grid[options.xAxis.grid.length - 1],
                    y2 = height - yUnit * options.yAxis.grid[2];

                for (var i = 0, y = y1, value = min, step = (max - value) / yGrid; i < yGrid + 1; i++) {
                    this.drawLine(x1, height - y, x2, height - y, value || options.yAxis.line === false ? 'align-line' : 'axis-line');
                    this.drawText(0, height - y, options.yAxis.formatter ? util.formatString(options.yAxis.formatter, value) : value, 'axis-text');
                    y += yUnit;
                    value += step;
                }
                if (options.xAxis.line !== false) {
                    this.drawLine(x1, height - y1, x1, height - y2, 'axis-line');
                }

                var x = x1;
                options.xAxis.data.forEach(
                    function (item, index) {
                        var grid = options.xAxis.grid[index + 1],
                            w = grid * xUnit;

                        if (item) {
                            var value = options.series.data[index],
                                h0 = Math.max(0, (y2 - y1) * -min / (max - min)),
                                h = (y2 - y1) * (value - min) / (max - min) - h0,
                                cx = x + w / 2,
                                cy = height - y1 - h / 2 - h0;

                            this.drawText(cx, height - y1, item, 'category-text');
                            this.$drawItem(index, cx, cy, w * options.series.ratio.width, Math.abs(h), options.series);
                            this.drawText(cx, height - y1 - Math.max(0, h * options.series.ratio.text) - h0, options.yAxis.formatter ? util.formatString(options.yAxis.formatter, value) : value, 'item-text');
                        }
                        x += w;
                    },
                    this
                );

                ui.SVG.prototype.render.call(this);
            }
        }
    );

    /**
     * 方块分类图。
     * @control
     */
    ui.YVBarAxisChart = core.inherits(
        ui.YVAxisChart,
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
    ui.YVCylinderAxisChart = core.inherits(
        ui.YVAxisChart,
        {
            /**
             * @override
             */
            $drawItem: function (index, x, y, w, h, series) {
                var ellipseHeight = w * series.ratio.ellipse / 2;
                this.drawRect(x - w / 2, y - h / 2, w, h, 'item-body item' + index + '-body');
                this.drawEllipse(x, y + h / 2, w / 2, ellipseHeight, 'item-foot item' + index + '-foot');
                this.drawEllipse(x, y - h / 2, w / 2, ellipseHeight, 'item-head item' + index + '-head');
            }
        }
    );
//{if 0}//
}());
//{/if}//
