/*
Tween - 点击及按压动画插件，通过修改click或pressstart/pressend方法来实现移动时的动画效果
*/
//{if 0}//
(function () {

    var core = ecui,
        ext = core.ext,
        util = core.util,

        FUNCTION = Function,
        MATH = Math,
        MIN = MATH.min,
        POW = MATH.pow,

        copy = util.copy,
        timer = util.timer;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化点击时动画效果。
     * params 参数支持的属性如下：
     * second    动画持续的时间
     * pressStep 按压时的间隔，如果省略不支持按压移动的动画效果
     * monitor   需要监控的属性
     * getValue  获取监控属性的值
     * setValue  设置监控属性的值
     * @public
     *
     * @param {Function|ecui.ui.Control} object 需要实现动画效果的类或者是对象
     * @param {Object} params 动画效果的初始化参数
     */
    var EXT_TWEEN =
        ext.Tween = function (object, params) {
            //__gzip_unitize__start
            //__gzip_unitize__value
            //__gzip_unitize__end
            var click = object.$click,
                pressstart = object.$pressstart,
                pressend = object.$pressend,
                totalTime = (params.second * 1000) || 500,
                pressStep = params.pressStep,
                getValue = params.getValue ||
                    new FUNCTION(
                        'o',
                        'return [ecui.util.toNumber(o.' + params.monitor.replace(/\|/g, '),ecui.util.toNumber(o.') +
                            ')]'
                    ),
                setValue = params.setValue ||
                    new FUNCTION(
                        'o',
                        'v',
                        'o.' + params.monitor.replace(/\|/g, '=v[0]+"px";v.splice(0,1);o.') + '=v[0]+"px"'
                    );

            /**
             * 减减速动画。
             * @private
             */
            function decelerate() {
                var params = EXT_TWEEN[this.getUID()],
                    start = params.start,
                    end = params.end,
                    value = params.value = {},
                    x = MIN((params.time += 20) / totalTime, 1),
                    name;

                if (x == 1) {
                    // 移动到达终点准备停止
                    params.stop();
                    EXT_TWEEN[this.getUID()] = null;
                }

                for (name in start) {
                    // 按比例计算当前值
                    value[name] = start[name] + (end[name] - start[name]) * (1 - POW(1 - x, 3));
                }
                setValue(this, value);
            }

            /**
             * 匀速动画。
             * @private
             */
            function steady() {
                var params = EXT_TWEEN[this.getUID()],
                    start = params.start,
                    end = params.end,
                    value = params.value,
                    flag = true,
                    tmp,
                    name;

                // 第一个flag用于检测所有的移动是否都结束
                for (name in start) {
                    tmp = 'number' == typeof pressStep ? pressStep : pressStep[name];
                    if (start[name] < end[name]) {
                        if ((value[name] += tmp) < end[name]) {
                            flag = false;
                        }
                    }
                    else if (start[name] > end[name]) {
                        if ((value[name] -= tmp) > end[name]) {
                            flag = false;
                        }
                    }
                }

                // 以下flag用于检测是否要停止移动
                if (flag) {
                    // 捕获下一步的位置
                    setValue(this, end);
                    click.call(this);
                    tmp = getValue(this);
                    for (name in tmp) {
                        if (end[name] == tmp[name]) {
                            value[name] = tmp[name];
                        }
                        else {
                            flag = false;
                        }
                    }
                    if (flag) {
                        params.stop();
                    }
                    else {
                        // 得到新的结束位置
                        params.end = tmp;
                    }
                }

                setValue(this, value);
            }

            /**
             * 开始动画。
             * @private
             *
             * @param {ecui.ui.Control} control 控件对象
             * @param {Function} action 动画函数
             * @param {number} interval 时间间隔
             * @param {Event} event 事件对象
             */
            function startTween(control, action, interval, event) {
                // 捕获动画的结束点
                click.call(control, event);

                var params = EXT_TWEEN[control.getUID()],
                    start = params.start,
                    end = params.end = getValue(control),
                    flag = false,
                    name;

                for (name in start) {
                    if (start[name] != end[name]) {
                        // 开始与结束的位置有变化，允许开始动画
                        flag = true;
                    }
                }

                if (flag) {
                    params.time = 0;
                    action.call(control);
                    params.stop = timer(action, -interval, control);
                }
            }

            if (pressStep) {

                /**
                 * 实现动画的点击方法。
                 * @protected
                 *
                 * @param {Event} event 事件对象
                 */
                object.$click = function (event) {
                    // 捕获需要到达的位置
                    var value = getValue(this);
                    click.call(this, event);
                    setValue(this, value);
                };

                /**
                 * 实现动画的按压开始方法。
                 * @protected
                 *
                 * @param {Event} event 事件对象
                 */
                object.$pressstart = function (event) {
                    var params = EXT_TWEEN[this.getUID()];

                    if (params) {
                        // 之前存在未结束的动画，直接结束
                        params.stop();
                        setValue(this, params.end);
                    }
                    else {
                        params = EXT_TWEEN[this.getUID()] = {};
                        params.start = getValue(this);
                        params.value = getValue(this);
                    }

                    startTween(this, steady, 40, event);

                    pressstart.call(this, event);
                };

                /**
                 * 实现动画的按压结束方法。
                 * @protected
                 *
                 * @param {Event} event 事件对象
                 */
                object.$pressend = function (event) {
                    var params = EXT_TWEEN[this.getUID()];

                    // 动画转入减减速运动
                    params.stop();
                    params.start = params.value;
                    params.stop = timer(decelerate, -20, this);

                    pressend.call(this, event);
                };
            }
            else {
                /**
                 * 实现动画的点击方法。
                 * @protected
                 *
                 * @param {Event} event 事件对象
                 */
                object.$click = function (event) {
                    var params = EXT_TWEEN[this.getUID()],
                        flag = false,
                        name;

                    if (params) {
                        // 如果之前有未完成的动画，立即结束，以当前的位置作为新的开始点
                        params.stop();
                        setValue(this, params.end);
                        params.start = params.value;
                    }
                    else {
                        // 新的动画开始创建
                        params = EXT_TWEEN[this.getUID()] = {};
                        params.start = getValue(this);
                    }

                    startTween(this, decelerate, 20, event);
                };
            }
        };
//{else}//
//{/if}//
//{if 0}//
})();
//{/if}//