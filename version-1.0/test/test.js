/*
ECUI Test - ECUI 集成测试框架，支持异步方式的测试。
*/
(function () {

    /**
     * 根据 id 获取 DOM 对象
     * @public
     *
     * @param {string} id DOM 的 id
     * @return {HTMLElement} DOM 对象
     */
    function g(id) {
        return document.getElementById(id);
    }

    /**
     * 一组测试数据信息类
     * @public
     *
     * @param {string} name 一组测试数据的名称
     * @param {Object} entries 一组测试数据的原始信息，信息的格式为 {K: V, ...}，其中 K 表示单个测试数据名称，V 表示单个测试函数
     */
    function Suite(name, entries) {

        /**
         * 测试用例信息类
         * @public
         *
         * @param {string} name 测试数据的名称
         * @param {Function} target 测试函数
         */
        function Case(name, target) {
            // index 当前用例在总用例中的编号，wait 是否处于等待状态标志，用于异步控制，exception 异常对象，如果正常此值为空
            var index = totalCase++,
                wait,
                exception;

            this.end = function () {
                // 单个用例的后置方法，释放单个用例占用的资源
                after && after();

                g('progress').innerHTML = Math.floor(++testedCase / totalCase * 100);
                g('case_' + index).className = exception ? 'exception' : 'success';

                if (exception) {
                    // 运行中产生异常
                    var s = exception.failure,
                        el = ecui.dom.create();
                    if (s) {
                        el.innerHTML =
                            s == 1
                            ? '<div>当前值:<p>' + ecui.string.encodeHTML(exception.actual.toString())
                                + '</p>期待值:<p>' + ecui.string.encodeHTML(exception.expect.toString())
                            : '期待不是 \'' + ecui.string.encodeHTML(exception.actual.toString()) + '\'<p>';
                        s = 'total_failures';
                    }
                    else {
                        el.innerHTML = exception.message + '(' + exception.lineNumber + ')';
                        s = 'total_errors';
                    }
                    g('case_' + index).appendChild(el);
                    g(s).innerHTML = parseInt(g(s).innerHTML) + 1;
                    caseException = true;
                }

                // 执行下个用例
                new ecui.util.timer(parent.next, 0, parent);
            };

            /**
             * 生成测试用例的日志 HTML 结构
             * @public
             */
            this.log = function () {
                return '<li id="case_' + index + '"><h4>' + ecui.string.encodeHTML(name)
                    + '</h4><pre class="examples-code"><code>' + ecui.string.encodeHTML(target.toString())
                    + '</code></pre></li>';
            };

            /**
             * 运行当前测试用例
             * @public
             */
            this.run = function () {
                wait = false;
                try {
                    target.call(this);
                    // 没有处于异步等待状态，测试用例运行结束
                    wait || this.end();
                }
                catch (e) {
                    exception = e;
                    this.end();
                }
            };

            /**
             * 设置测试用例为等待状态，等待异步处理返回
             * @public
             *
             * @param {Function} func 测试用例下阶段代码片断的函数
             * @param {number} delay 等待时间
             */
            this.wait = function (func, delay) {
                wait = true;
                target = func;
                new ecui.util.timer(this.run, delay, this);
            };
        }

        // parent 测试用例组，before 用例前置函数，after 用例后置函数，cases 用例数组，index 用例组的编号，testedCaseInSuite 当前激活的用例在用例组中的编号，caseException 用例是否产生过异常
        var parent = this,
            before,
            after,
            cases = [],
            index = suites.length,
            testedCaseInSuite = 0,
            caseException = false;

        for (var key in entries) {
            if (key == 'before') {
                before = entries[key];
            }
            else if (key == 'after') {
                after = entries[key];
            }
            else {
                cases.push(new Case(key, entries[key]));
            }
        }

        /**
         * 生成测试用例组的日志 HTML 结构
         * @public
         */
        this.log = function () {
            var html = '<li id="suite_' + index + '"><h3>' + ecui.string.encodeHTML(name)
                + '</h3><ul id="suite_' + index + '_cases" class="examples">';

            for (var i = 0; i < cases.length; i++) {
                html += cases[i].log();
            }

            return html + '</ul></li>';
        };

        /**
         * 执行下一个用例，如果组内已经没有用例，将自动执行下一个组的第一个用例
         * @public
         */
        this.next = function () {
            var o = cases[testedCaseInSuite++];
            if (o) {
                before && before();
                o.run();
            }
            else {
                g('suite_' + index).className = caseException ? 'exception' : 'success';
                caseException || (g('suite_' + index + '_cases').style.display = 'none');
                setTimeout(NEXT_GROUP, 0);
            }
        };
    }

    /**
     * 判断两个对象是否相等
     * @private
     *
     * @param {Object} src 源对象
     * @param {Object} des 目标对象
     * @return {boolean} 比较结果，是否相等
     */
    function EQUALS(src, des) {
        if (src === des) {
            return true;
        }

        if (typeof src != typeof des || typeof src != 'object' || src.nodeType) {
            return false;
        }

        var srcKeys = [],
            desKeys = [];

        for (var key in src) {
            srcKeys.push(key);
        }
        for (var key in des) {
            desKeys.push(key);
        }

        if (srcKeys.length != desKeys.length) {
            return false;
        }

        for (var i = 0; i < srcKeys.length; i++) {
            if (!EQUALS(src[srcKeys[i]], des[srcKeys[i]])) {
                return false;
            }
        }

        return true;
    }

    /**
     * 构造包装对象，用于比较两个对象是否相等
     * @private
     *
     * @param {Object} value 需要包装的值
     */
    function Value(value) {
        var type = Object.prototype.toString.call(value);

        /**
         * 判断被包装的对象是否等于另一个对象
         * @public
         *
         * @param {Object} expectValue 期待的值
         */
        this.should_be = function (expectValue) {
            if (type != Object.prototype.toString.call(expectValue) || !EQUALS(value, expectValue)) {
                throw {failure: 1, expect: (expectValue === null || expectValue === undefined) ? String(expectValue) : expectValue, actual: value};
            }
        };

        /**
         * 判断被包装的对象是否等于 true
         * @public
         */
        this.should_be_true = function () {
            this.should_be(true);
        };

        /**
         * 判断被包装的对象是否等于 false
         * @public
         */
        this.should_be_false = function () {
            this.should_be(false);
        };

        /**
         * 判断被包装的对象是否不等于另一个对象
         * @public
         *
         * @param {Object} expectValue 不期待的值
         */
        this.should_not_be = function (expectValue) {
            if (type == Object.prototype.toString.call(expectValue) && EQUALS(value, expectValue)) {
                throw {failure: 2, expect: expectValue, actual: value};
            }
        };
    }

    /**
     * 执行下一个用例组中的用例
     * @private
     */
    function NEXT_GROUP() {
        var o = suites[testedSuite++];
        o && o.next();
        g('total_elapsed').innerHTML = (new Date().getTime() - startTime) / 1000;
        if (!o && onPageFinish) {
            onPageFinish();
        }
    }

    var suites = [],
        testedCase = 0,
        testedSuite = 0,
        totalCase = 0,
        startTime;

    ecui.test = {

        /**
         * 添加一个测试用例组
         * @public
         *
         * @param {string} name 测试用例组名称
         * @param {Object} entries 测试用例组的描述对象
         */
        describe: function (name, entries) {
            suites.push(new Suite(name, entries));
        },

        /**
         * 添加一个测试用例组
         * @public
         *
         * @param {string} name 测试用例组名称
         * @param {Object} entries 测试用例组的描述对象
         */
        value_of: function (value) {
            return new Value(value);
        }
    };

    /**
     * 标题点击事件
     * @private
     */
    function H3_CLICK() {
        var style = this.nextSibling.style;
        style.display = style.display ? '' : 'none';
    }

    ecui.util.attachEvent(window, 'load', function () {
        var el = ecui.dom.create(),
            html = '<div id="title" class="success"><h1>ECUI Test</h1><ul>'
                + '<li>共 <span id="total_cases">' + totalCase + '</span> 项</li>'
                + '<li><span id="total_failures">0</span> 失败</li>'
                + '<li><span id="total_errors">0</span> 错误</li>'
                + '<li><span id="progress">0</span>% 完成</li>'
                + '<li><span id="total_elapsed">0</span> 秒</li>'
                + '</ul></div><div id="log"><ul class="specs">';
        el.id = 'jsspec_container';

        for (var i = 0; i < suites.length; i++) {
            html += suites[i].log();
        }
        el.innerHTML = html + '</ul></div>';

        html = el.getElementsByTagName('h3');
        for (i = 0; i < html.length; i++) {
            html[i].onclick = H3_CLICK;
        }

        document.body.appendChild(el);
        startTime = new Date().getTime();
        NEXT_GROUP();
    });
})();

describe = ecui.test.describe;
value_of = ecui.test.value_of;
