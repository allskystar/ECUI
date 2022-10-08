/**
 * ETPL (Enterprise Template)
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file 模板引擎
 * @author errorrik(errorrik@gmail.com)
 *         otakustay(otakustay@gmail.com)
 */


// HACK: 可见的重复代码未抽取成function和var是为了gzip size，吐槽的一边去
/* eslint-env node */

(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        io = core.io,
        util = core.util,

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
//{/if}//
    /**
     * 唯一id的起始值
     *
     * @inner
     * @type {number}
     */
    var guidIndex = 0;
    /**
     * 获取唯一id，用于匿名target或编译代码的变量名生成
     *
     * @inner
     * @return {string} 唯一id
     */
    function generateGUID() {
        return '_' + (guidIndex++);
    }

    /**
     * 默认filter
     *
     * @inner
     * @const
     * @type {object}
     */
    var DEFAULT_FILTERS = {
        /**
         * HTML转义filter
         *
         * @param {string} source 源串
         * @return {string} 替换结果串
         */
        // html: util.encodeHTML,
        html: function (source) {
            // 敏感词处理
            if (etpl.SENSITIVE_WORD_REGEXP) {
                source = source.replace(etpl.SENSITIVE_WORD_REGEXP, etpl.SENSITIVE_WORD);
            }
            return util.encodeHTML(source);
        },

        /**
         * URL编码filter
         *
         * @param {string} source 源串
         * @return {string} 替换结果串
         */
        url: encodeURIComponent,

        /**
         * JS编码filter
         *
         * @param {string} source 源串
         * @return {string} 替换结果串
         */
        js: util.encodeJS,

        json: function (source) {
            return JSON.stringify(source);
        },

        /**
         * 源串filter，用于在默认开启HTML转义时获取源串，不进行转义
         *
         * @param {string} source 源串
         * @return {string} 替换结果串
         */
        raw: function (source) {
            return source;
        },

        /**
         * 默认数据filter
         *
         * @param {string} source 源串
         * @return {string} 替换结果串
         */
        'default': function (source, defaultValue) {
            return source !== undefined && source !== null ? source : (defaultValue !== undefined ? defaultValue : '--');
        },

        /**
         * 金融格式化filter
         *
         * @param {string} source 源串
         * @return {string} 替换结果串
         */
        finance: util.formatFinance,

        /**
         * 日期格式化filter
         *
         * @param {string} source 源串
         * @return {string} 替换结果串
         */
        date: function (source, format) {
            return (new Date(source).toString() === 'Invalid Date') ? source : util.formatDate(new Date(source), format);
        },

        /**
         * 指定保留小数位数filter
         *
         * @param {string|number} source 源串
         * @param {string} fixedNum      保留小数位数
         * @param {number} divisor       被除数
         * @return {string} 替换结果串
         */
        fixed: function (source, fixedNum, divisor) {
            return (+source / (divisor || 1)).toFixed(fixedNum);
        }
    };


    /**
     * 用于render的字符串变量声明语句
     *
     * @inner
     * @const
     * @type {string}
     */
    var RENDER_STRING_DECLATION = 'var r="";';

    /**
     * 用于render的字符串内容添加语句（起始）
     *
     * @inner
     * @const
     * @type {string}
     */
    var RENDER_STRING_ADD_START = 'r+=';

    /**
     * 用于render的字符串内容添加语句（结束）
     *
     * @inner
     * @const
     * @type {string}
     */
    var RENDER_STRING_ADD_END = ';';

    /**
     * 用于render的字符串内容返回语句
     *
     * @inner
     * @const
     * @type {string}
     */
    var RENDER_STRING_RETURN = 'return r;';

    // HACK: IE8-时，编译后的renderer使用join Array的策略进行字符串拼接
    if (ieVersion < 8) {
        RENDER_STRING_DECLATION = 'var r=[],j=0;';
        RENDER_STRING_ADD_START = 'r[j++]=';
        RENDER_STRING_RETURN = 'return r.join("");';
    }

    /**
     * 将访问变量名称转换成getVariable调用的编译语句
     * 用于if、var等命令生成编译代码
     *
     * @inner
     * @param {string} name 访问变量名
     * @return {string} getVariable调用的编译语句
     */
    function toGetVariableLiteral(name) {
        var args = [];

        name.replace(/^\s*\*/, '').replace(
            /(\[('([^']+)'|"([^"]+)"|[^\]]+)\]|(\.|^)([^.\[]+))/g,
            // eslint-disable-next-line no-shadow
            function (match, all, name, sing, doub, flag, normal) {
                all = sing || doub || normal;
                args.push(all ? '"' + all + '"' : toGetVariableLiteral(name));
            }
        );

        return util.formatString(
            'A({0},[{1}])',
            JSON.stringify(name),
            args.join(',')
        );
    }

    /**
     * 解析文本片段中以固定字符串开头和结尾的包含块
     * 用于 命令串：<!-- ... --> 和 变量替换串：${...} 的解析
     *
     * @inner
     * @param {string} source 要解析的文本
     * @param {string} open 包含块开头
     * @param {string} close 包含块结束
     * @param {boolean} greedy 是否贪婪匹配
     * @param {function ({string})} onInBlock 包含块内文本的处理函数
     * @param {function ({string})} onOutBlock 非包含块内文本的处理函数
     */
    function parseTextBlock(source, open, close, greedy, onInBlock, onOutBlock) {
        var closeLen = close.length;
        var level = Math.max(greedy - 1, 0);
        var buf = [];

        source.split(open).forEach(function (text, i) {
            if (i) {
                var openBegin = 1;
                level++;
                /* eslint-disable no-constant-condition */
                for (;;) {
                    var closeIndex = text.indexOf(close);
                    if (closeIndex < 0) {
                        buf.push(level > 1 && openBegin ? open : '', text);
                        break;
                    }

                    level = greedy ? level - 1 : 0;
                    buf.push(
                        level > 0 && openBegin ? open : '',
                        text.slice(0, closeIndex),
                        level > 0 ? close : ''
                    );
                    text = text.slice(closeIndex + closeLen);
                    openBegin = 0;

                    if (level === 0) {
                        break;
                    }
                }
                /* eslint-enable no-constant-condition */

                if (level === 0) {
                    onInBlock(buf.join(''));
                    onOutBlock(text);
                    buf = [];
                }
            } else if (text) {
                if (level) {
                    closeIndex = text.indexOf(close);
                    if (closeIndex >= 0) {
                        onInBlock(text.slice(0, closeIndex));
                        text = text.slice(closeIndex + closeLen);
                        level--;
                    }
                }
                onOutBlock(text);
            }
        });

        if (level > 0 && buf.length > 0) {
            onOutBlock(open);
            onOutBlock(buf.join(''));
        }
    }

    /**
     * 编译变量访问和变量替换的代码
     * 用于普通文本或if、var、filter等命令生成编译代码
     *
     * @inner
     * @param {string} source 源代码
     * @param {Engine} engine 引擎实例
     * @param {boolean} forText 是否为输出文本的变量替换
     * @return {string} 编译代码
     */
    function compileVariable(source, engine, forText) {
        var code = [];

        var toStringHead = '';
        var toStringFoot = '';
        var wrapHead = '';
        var wrapFoot = '';

        // 默认的filter，当forText模式时有效
        var defaultFilter;

        if (forText) {
            toStringHead = 'B(';
            toStringFoot = ')';
            wrapHead = RENDER_STRING_ADD_START;
            wrapFoot = RENDER_STRING_ADD_END;
            defaultFilter = engine.options.defaultFilter;
        }

        parseTextBlock(
            source,
            engine.options.variableOpen,
            engine.options.variableClose,
            1,
            function (text) {
                // 加入默认filter
                // 只有当处理forText时，需要加入默认filter
                // 处理if/var/use等command时，不需要加入默认filter
                if (forText) {
                    if (text.indexOf('|') < 0 && defaultFilter) {
                        text += '|' + defaultFilter;
                    }
                }

                // variableCode是一个A调用，然后通过循环，在外面包filter的调用
                // 形成filter["b"](filter["a"](A(...)))
                //
                // 当forText模式，处理的是文本中的变量替换时
                // 传递给filter的需要是字符串形式，所以A外需要包一层B调用
                // 形成filter["b"](filter["a"](B(A(...))))
                //
                // 当variableName以*起始时，忽略B调用，直接传递原值给filter
                var filterCharIndex = text.indexOf('|');
                var variableName = (filterCharIndex > 0 ? text.slice(0, filterCharIndex) : text).replace(/^\s+/, '').replace(/\s+$/, '');
                var filterSource = filterCharIndex > 0 ? text.slice(filterCharIndex + 1) : '';

                var variableRawValue = variableName.indexOf('*') === 0;
                var variableCode = [
                    variableRawValue ? '' : toStringHead,
                    toGetVariableLiteral(variableName),
                    variableRawValue ? '' : toStringFoot
                ];

                if (filterSource) {
                    filterSource = compileVariable(filterSource, engine);
                    filterSource.split('|').forEach(function (seg) {
                        if (/^\s*([a-z0-9_-]+)(\((.*)\))?\s*$/i.test(seg)) {
                            variableCode.unshift('f["' + RegExp.$1 + '"](');

                            if (RegExp.$3) {
                                variableCode.push(',', RegExp.$3);
                            }

                            variableCode.push(')');
                        }
                    });
                }

                code.push(
                    wrapHead,
                    variableCode.join(''),
                    wrapFoot
                );
            },

            function (text) {
                code.push(
                    wrapHead,
                    forText ? JSON.stringify(text) : text,
                    wrapFoot
                );
            }
        );

        return code.join('');
    }

    /**
     * 文本节点类
     *
     * @inner
     * @constructor
     * @param {string} value 文本节点的内容文本
     * @param {Engine} engine 引擎实例
     */
    function TextNode(value, engine) {
        this.value = value;
        this.engine = engine;
    }

    TextNode.prototype = {
        /**
         * 获取renderer body的生成代码
         *
         * @return {string} 生成代码
         */
        getRendererBody: function () {
            if (!this.value || (this.engine.options.strip && /^\s*$/.test(this.value))) {
                return '';
            }

            var engine = this.engine;
            var code = [];

            this.value.replace(
                engine.options.replaceSyntax,
                function ($$, $1) {
                    if ($$.charAt(0) === '#') {
//{if 0}//
                        var name = $1.split(':');
                        if (!multiLanguage) {
                            console.warn('Multiple languages haven\'t been defined, please call etpl.defineLanguages() first.');
                        } else if (name.length !== multiLanguage.length) {
                            console.warn('All the translations don\'t match:\n' + multiLanguage.join(':') + '\n' + $1);
                        }
                        name = name[0];
                        if (checkList[name]) {
                            if (checkList[name].indexOf($1) < 0) {
                                console.warn('All the translations don\'t match:\n' + checkList[name].join('\n') + '\n' + $1);
                                checkList[name].push($1);
                            }
                        } else {
                            checkList[name] = [$1];
                        }
//{/if}//
                        return engine.options.assignOpen + 'etpl.lang([' + $1.split(':').map(function (item) {
                            return '"' + util.encodeJS(util.decodeHTML(item)) + '"';
                        }).join(',') + '])' + engine.options.variableClose;
                    // eslint-disable-next-line no-else-return
                    } else {
                        return '&' + engine.options.variableOpen + '*' + $1 + '|json|url' + engine.options.variableClose;
                    }
                }
            ).split(engine.options.assignOpen).forEach(function (text, i) {
                if (i) {
                    var firstOutput = true;
                    var leftText = '';
                    parseTextBlock(
                        text,
                        engine.options.variableOpen,
                        engine.options.variableClose,
                        2,
                        function (text) {
                            text = firstOutput ? leftText + text : '${' + text + '}';
                            firstOutput = false;
                            code.push(
                                RENDER_STRING_ADD_START,
                                'f["' + engine.options.defaultFilter + '"](B(' + compileVariable(text, engine) + '))',
                                RENDER_STRING_ADD_END
                            );
                        },
                        function (text) {
                            if (firstOutput) {
                                leftText = text;
                            } else {
                                code.push(compileVariable(text, engine, 1));
                            }
                        }
                    );
                    if (firstOutput && leftText) {
                        code.push(compileVariable(leftText, engine, 1));
                    }
                } else {
                    code.push(compileVariable(text, engine, 1));
                }
            });

            return code.join('');
        },

        /**
         * 复制节点的方法
         *
         * @return {TextNode} 节点复制对象
         */
        clone: function () {
            return this;
        }
    };

    /**
     * 命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function Command(value, engine) {
        this.value = value;
        this.engine = engine;
        this.children = [];
        this.cloneProps = [];
    }

    Command.prototype = {
        /**
         * 添加子节点
         *
         * @param {TextNode|Command} node 子节点
         */
        addChild: function (node) {
            this.children.push(node);
        },

        /**
         * 节点open，解析开始
         *
         * @param {object} context 语法分析环境对象
         */
        open: function (context) {
            var parent = context.stack.top();
            if (parent) {
                parent.addChild(this);
            }
            context.stack.push(this);
        },

        /**
         * 节点闭合，解析结束
         *
         * @param {object} context 语法分析环境对象
         */
        close: function (context) {
            if (context.stack.top() === this) {
                context.stack.pop();
            }
        },

        /**
         * 获取renderer body的生成代码
         *
         * @return {string} 生成代码
         */
        getRendererBody: function () {
            return this.children.map(function (child) {
                return child.getRendererBody();
            }).join('');
        },

        /**
         * 复制节点的方法
         *
         * @return {Command} 节点复制对象
         */
        clone: function () {
            var node = new this.constructor(this.value, this.engine);

            this.children.forEach(function (child) {
                node.addChild(child.clone());
            });

            this.cloneProps.forEach(
                function (prop) {
                    node[prop] = this[prop];
                },
                this
            );

            return node;
        }
    };

    /**
     * 命令自动闭合
     *
     * @inner
     * @param {object} context 语法分析环境对象
     * @param {Function=} CommandType 自闭合的节点类型
     * @return {Command} 被闭合的节点
     */
    function autoCloseCommand(context, CommandType) {
        var closeEnd = CommandType ? context.stack.find(
            function (item) {
                return item instanceof CommandType;
            }
        ) : context.stack[0];

        if (closeEnd) {
            var node;

            for (; (node = context.stack.top()) !== closeEnd;) {
                // 如果节点对象不包含autoClose方法
                // 则认为该节点不支持自动闭合，需要抛出错误
                // for等节点不支持自动闭合
                if (!node.autoClose) {
                    throw new Error(node.type + ' must be closed manually: ' + node.value);
                }

                node.autoClose(context);
            }

            closeEnd.close(context);
        }

        return closeEnd;
    }

    /**
     * renderer body起始代码段
     *
     * @inner
     * @const
     * @type {string}
     */
    var RENDERER_BODY_START =
        'u=u||{};' +
        'var f=e.filters,g="function"==typeof u.get,' +
        //a:name b:properties
        'A=function (a,b){' +
        'var d=v[b[0]];' +
        'if(d==null){' +
        'if(g)return u.get(a);' +
        'd=u[b[0]];' +
        'if(d==null)d=this[b[0]];' +
        '}' +
        'for(var i=1,l=b.length;i<l;i++)if(d!=null)d=d[b[i]];' +
        'return d;' +
        '},' +
        'B=function (a){' +
        'if("string"===typeof a)return a;' +
        'if(a==null)a="";' +
        'return ""+a;' +
        '};';

    // v: variables
    // f: filters
    // A: getVariable
    // B: toString
    // g: hasGetter

    /**
     * Target命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function TargetCommand(value, engine) {
        if (!/^\s*([a-z0-9\/._-]+)\s*(\(\s*master\s*=\s*([a-z0-9\.\/_-]+)\s*\))?\s*/i.test(value)) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }

        this.master = RegExp.$3;
        this.name = RegExp.$1;
        Command.call(this, value, engine);

        this.blocks = {};
    }

    // 创建Target命令节点继承关系
    util.inherits(TargetCommand, Command);

    /**
     * Block命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function BlockCommand(value, engine) {
        if (!/^\s*([a-z0-9\/_-]+)\s*$/i.test(value)) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }

        this.name = RegExp.$1;
        Command.call(this, value, engine);
        this.cloneProps = ['name'];
    }

    // 创建Block命令节点继承关系
    util.inherits(BlockCommand, Command);

    /**
     * Import命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function ImportCommand(value, engine) {
        if (!/^\s*([a-z0-9\/_-]+)\s*$/i.test(value)) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }

        this.name = RegExp.$1;
        Command.call(this, value, engine);
        this.cloneProps = ['name', 'state', 'blocks'];
        this.blocks = {};
    }

    // 创建Import命令节点继承关系
    util.inherits(ImportCommand, Command);

    /**
     * Var命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function VarCommand(value, engine) {
        if (!/^\s*([a-z0-9_]+)\s*=([\s\S]*)$/i.test(value)) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }

        this.name = RegExp.$1;
        this.expr = RegExp.$2;
        Command.call(this, value, engine);
        this.cloneProps = ['name', 'expr'];
    }

    // 创建Var命令节点继承关系
    util.inherits(VarCommand, Command);

    /**
     * filter命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function FilterCommand(value, engine) {
        if (!/^\s*([a-z0-9_-]+)\s*(\(([\s\S]*)\))?\s*$/i.test(value)) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }

        this.name = RegExp.$1;
        this.args = RegExp.$3;
        Command.call(this, value, engine);
        this.cloneProps = ['name', 'args'];
    }

    // 创建filter命令节点继承关系
    util.inherits(FilterCommand, Command);

    /**
     * Use命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function UseCommand(value, engine) {
        if (!/^\s*([^(\s]+)\s*(\(([\s\S]*)\))?\s*$/i.test(value)) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }

        this.name = RegExp.$1;
        this.args = RegExp.$3;
        Command.call(this, value, engine);
        this.cloneProps = ['name', 'args'];
    }

    // 创建Use命令节点继承关系
    util.inherits(UseCommand, Command);

    /**
     * for命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function ForCommand(value, engine) {
        var rule = new RegExp(
            util.formatString(
                '^\\s*({0}[\\s\\S]+{1})\\s+as\\s+{0}([0-9a-z_]+){1}\\s*(,\\s*{0}([0-9a-z_]+){1})?\\s*$',
                util.encodeRegExp(engine.options.variableOpen),
                util.encodeRegExp(engine.options.variableClose)
            ),
            'i'
        );

        if (!rule.test(value)) {
            throw new Error('Invalid ' + this.type + ' syntax: ' + value);
        }

        this.list = RegExp.$1;
        this.item = RegExp.$2;
        this.index = RegExp.$4;
        Command.call(this, value, engine);
        this.cloneProps = ['list', 'item', 'index'];
    }

    // 创建for命令节点继承关系
    util.inherits(ForCommand, Command);

    /**
     * if命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function IfCommand(value, engine) {
        Command.call(this, value, engine);
    }

    // 创建if命令节点继承关系
    util.inherits(IfCommand, Command);

    /**
     * elif命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function ElifCommand(value, engine) {
        IfCommand.call(this, value, engine);
    }

    // 创建elif命令节点继承关系
    util.inherits(ElifCommand, IfCommand);

    /**
     * else命令节点类
     *
     * @inner
     * @constructor
     * @param {string} value 命令节点的value
     * @param {Engine} engine 引擎实例
     */
    function ElseCommand(value, engine) {
        Command.call(this, value, engine);
    }

    // 创建else命令节点继承关系
    util.inherits(ElseCommand, IfCommand);

    /**
     * Target的节点状态
     *
     * @inner
     */
    var TargetState = {
        READING: 1,
        READED: 2,
        APPLIED: 3,
        READY: 4
    };

    /**
     * 应用其继承的母版，返回是否成功应用母版
     *
     * @param {string} masterName 模板名称
     * @return {boolean} 是否成功应用母版
     */
    ImportCommand.prototype.applyMaster = TargetCommand.prototype.applyMaster = function (masterName) {
        if (this.state >= TargetState.APPLIED) {
            return 1;
        }

        var blocks = this.blocks;

        function replaceBlock(node) {
            var children = node.children;

            if (children instanceof Array) {
                children.forEach(function (child, index) {
                    if (child instanceof BlockCommand && blocks[child.name]) {
                        child = children[index] = blocks[child.name];
                    }

                    replaceBlock(child);
                });
            }
        }

        var master = this.engine.targets[masterName] || etpl.targets[masterName];
        if (master && master.applyMaster(master.master)) {
            this.children = master.clone().children;
            replaceBlock(this);
            this.state = TargetState.APPLIED;
            return 1;
        }
    };

    /**
     * 判断target是否ready
     * 包括是否成功应用母版，以及import语句依赖的target是否ready
     *
     * @return {boolean} target是否ready
     */
    TargetCommand.prototype.isReady = function () {
        if (this.state >= TargetState.READY) {
            return 1;
        }

        var engine = this.engine;
        var readyState = 1;

        /**
         * 递归检查节点的ready状态
         *
         * @inner
         * @param {Command|TextNode} node 目标节点
         */
        function checkReadyState(node) {
            node.children.forEach(function (child) {
                if (child instanceof ImportCommand) {
                    var target = engine.targets[child.name] || etpl.targets[child.name];
                    readyState = readyState && target && target.isReady();
                } else if (child instanceof Command) {
                    checkReadyState(child);
                }
            });
        }

        if (this.applyMaster(this.master)) {
            checkReadyState(this);
            if (readyState) {
                this.state = TargetState.READY;
            }
            return readyState;
        }
    };

    /**
     * 获取target的renderer函数
     *
     * @return {function (Object):string} renderer函数
     */
    TargetCommand.prototype.getRenderer = function () {
        if (this.renderer) {
            return this.renderer;
        }

        if (this.isReady()) {
            // console.log(this.name + ' ------------------');
            // console.log(RENDERER_BODY_START + RENDER_STRING_DECLATION
            //     + this.getRendererBody()
            //     + RENDER_STRING_RETURN);

            var realRenderer = new Function(
                'u',
                'e',
                'v',
                [
                    RENDERER_BODY_START,
                    RENDER_STRING_DECLATION,
                    this.getRendererBody(),
                    RENDER_STRING_RETURN
                ].join('')
            );

            var engine = this.engine;
            this.renderer = function (data) {
                return realRenderer(data, engine, Object.assign({NS: engine.ns}, globals));
            };

            return this.renderer;
        }

        return null;
    };

    /**
     * 将target节点对象添加到语法分析环境中
     *
     * @inner
     * @param {TargetCommand} target target节点对象
     * @param {object} context 语法分析环境对象
     */
    function addTargetToContext(target, context) {
        context.target = target;
        if (context.engine.targets[target.name]) {
            switch (context.engine.options.namingConflict) {
            case 'override':
                context.engine.targets[target.name] = target;
                context.targets.push(target.name);
                break;
            case 'ignore':
                break;
            default:
                throw new Error('Target exists: ' + target.name);
            }
        } else {
            context.engine.targets[target.name] = target;
            context.targets.push(target.name);
        }
    }

    /**
     * target节点open，解析开始
     *
     * @param {object} context 语法分析环境对象
     */
    TargetCommand.prototype.open = function (context) {
        autoCloseCommand(context);
        Command.prototype.open.call(this, context);
        this.state = TargetState.READING;
        addTargetToContext(this, context);
    };

    /**
     * Var/Use节点open，解析开始
     *
     * @param {object} context 语法分析环境对象
     */
    VarCommand.prototype.open = UseCommand.prototype.open = function (context) {
        context.stack.top().addChild(this);
    };

    /**
     * Block节点open，解析开始
     *
     * @param {object} context 语法分析环境对象
     */
    BlockCommand.prototype.open = function (context) {
        Command.prototype.open.call(this, context);
        (context.imp || context.target).blocks[this.name] = this;
    };

    /**
     * elif节点open，解析开始
     *
     * @param {object} context 语法分析环境对象
     */
    ElifCommand.prototype.open = function (context) {
        var elseCommand = new ElseCommand();
        elseCommand.open(context);

        var ifCommand = autoCloseCommand(context, IfCommand);
        ifCommand.addChild(this);
        context.stack.push(this);
    };

    /**
     * else节点open，解析开始
     *
     * @param {object} context 语法分析环境对象
     */
    ElseCommand.prototype.open = function (context) {
        var ifCommand = autoCloseCommand(context, IfCommand);
        ifCommand.addChild(this);
        context.stack.push(this);
    };

    /**
     * import节点open，解析开始
     *
     * @param {object} context 语法分析环境对象
     */
    ImportCommand.prototype.open = function (context) {
        this.parent = context.stack.top();
        this.target = context.target;
        Command.prototype.open.call(this, context);
        this.state = TargetState.READING;
        context.imp = this;
    };

    /**
     * 节点解析结束
     * 由于var/use节点无需闭合，处理时不会入栈，所以将close置为空函数
     *
     * @param {object} context 语法分析环境对象
     */
    UseCommand.prototype.close = VarCommand.prototype.close = function () {};

    /**
     * 节点解析结束
     *
     * @param {object} context 语法分析环境对象
     */
    ImportCommand.prototype.close = function (context) {
        Command.prototype.close.call(this, context);
        this.state = TargetState.READED;
        context.imp = null;
    };

    /**
     * 节点闭合，解析结束
     *
     * @param {object} context 语法分析环境对象
     */
    TargetCommand.prototype.close = function (context) {
        Command.prototype.close.call(this, context);
        this.state = this.master ? TargetState.READED : TargetState.APPLIED;
        context.target = null;
    };

    /**
     * 节点自动闭合，解析结束
     * ImportCommand的自动结束逻辑为，在其开始位置后马上结束
     * 所以，其自动结束时children应赋予其所属的parent
     *
     * @param {object} context 语法分析环境对象
     */
    ImportCommand.prototype.autoClose = function (context) {
        // move children to parent
        this.parent.children.push.apply(this.parent.children, this.children);
        this.children.length = 0;

        // move blocks to target
        for (var key in this.blocks) {
            if (this.blocks.hasOwnProperty(key)) {
                this.target.blocks[key] = this.blocks[key];
            }
        }
        this.blocks = {};

        // do close
        this.close(context);
    };

    /**
     * 节点open前的处理动作：节点不在target中时，自动创建匿名target
     *
     * @param {object} context 语法分析环境对象
     */
    UseCommand.prototype.beforeOpen = ImportCommand.prototype.beforeOpen = VarCommand.prototype.beforeOpen = ForCommand.prototype.beforeOpen = FilterCommand.prototype.beforeOpen = BlockCommand.prototype.beforeOpen = IfCommand.prototype.beforeOpen = TextNode.prototype.beforeAdd = function (context) {
        if (context.stack[0]) {
            return;
        }

        var target = new TargetCommand(generateGUID(), context.engine);
        target.open(context);
    };

    /**
     * 获取renderer body的生成代码
     *
     * @return {string} 生成代码
     */
    ImportCommand.prototype.getRendererBody = function () {
        this.applyMaster(this.name);
        return Command.prototype.getRendererBody.call(this);
    };

    /**
     * 获取renderer body的生成代码
     *
     * @return {string} 生成代码
     */
    UseCommand.prototype.getRendererBody = function () {
        var rule = new RegExp(
            util.formatString(
                '{0}([^}]+){1}',
                util.encodeRegExp(this.engine.options.variableOpen),
                util.encodeRegExp(this.engine.options.variableClose)
            ),
            'g'
        );

        return util.formatString(
            '{0}e.render({2},{3}){1}',
            RENDER_STRING_ADD_START,
            RENDER_STRING_ADD_END,
            JSON.stringify(this.name).replace(
                rule,
                function (match, name) {
                    return '"+' + toGetVariableLiteral(name) + '+"';
                }
            ),
            this.args ? '{' + compileVariable(this.args, this.engine).replace(
                /(^|,)\s*([a-z0-9_]+)\s*=/ig,
                function (match, start, argName) {
                    return (start || '') + JSON.stringify(argName) + ':';
                }
            ) + '}' : 'u'
        );
    };

    /**
     * 获取renderer body的生成代码
     *
     * @return {string} 生成代码
     */
    VarCommand.prototype.getRendererBody = function () {
        if (this.expr) {
            return util.formatString(
                'v[{0}]={1};',
                JSON.stringify(this.name),
                compileVariable(this.expr, this.engine)
            );
        }

        return '';
    };

    /**
     * 获取renderer body的生成代码
     *
     * @return {string} 生成代码
     */
    IfCommand.prototype.getRendererBody = function () {
        return util.formatString(
            'if({0}){{1}}',
            compileVariable(this.value, this.engine),
            Command.prototype.getRendererBody.call(this)
        );
    };

    /**
     * 获取renderer body的生成代码
     *
     * @return {string} 生成代码
     */
    ElseCommand.prototype.getRendererBody = function () {
        return util.formatString(
            '}else{{0}',
            Command.prototype.getRendererBody.call(this)
        );
    };

    /**
     * 获取renderer body的生成代码
     *
     * @return {string} 生成代码
     */
    ForCommand.prototype.getRendererBody = function () {
        return util.formatString(
            'var {0}={1};' +
                'if({0} instanceof Array)' +
                'for(var {4}=0,{5}={0}.length;{4}<{5};{4}++){v[{2}]={4};v[{3}]={0}[{4}];{6}}' +
                'else if(typeof {0}==="object")' +
                'for(var {4} in {0}){v[{2}]={4};v[{3}]={0}[{4}];{6}}',
            generateGUID(),
            compileVariable(this.list, this.engine),
            JSON.stringify(this.index || generateGUID()),
            JSON.stringify(this.item),
            generateGUID(),
            generateGUID(),
            Command.prototype.getRendererBody.call(this)
        );
    };

    /**
     * 获取renderer body的生成代码
     *
     * @return {string} 生成代码
     */
    FilterCommand.prototype.getRendererBody = function () {
        var args = this.args;
        return util.formatString(
            '{2}f[{5}]((function (){{0}{4}{1}})(){6}){3}',
            RENDER_STRING_DECLATION,
            RENDER_STRING_RETURN,
            RENDER_STRING_ADD_START,
            RENDER_STRING_ADD_END,
            Command.prototype.getRendererBody.call(this),
            JSON.stringify(this.name),
            args ? ',' + compileVariable(args, this.engine) : ''
        );
    };

    /**
     * 命令类型集合
     *
     * @type {object}
     */
    var commandTypes = {};

    /**
     * 添加命令类型
     *
     * @inner
     * @param {string} name 命令名称
     * @param {Function} Type 处理命令用到的类
     */
    function addCommandType(name, Type) {
        commandTypes[name] = Type;
        Type.prototype.type = name;
    }

    addCommandType('target', TargetCommand);
    addCommandType('block', BlockCommand);
    addCommandType('import', ImportCommand);
    addCommandType('use', UseCommand);
    addCommandType('var', VarCommand);
    addCommandType('for', ForCommand);
    addCommandType('if', IfCommand);
    addCommandType('elif', ElifCommand);
    addCommandType('else', ElseCommand);
    addCommandType('filter', FilterCommand);


    /**
     * etpl引擎类
     *
     * @constructor
     * @param {Object=} options 引擎参数
     * @param {string=} options.commandOpen 命令语法起始串
     * @param {string=} options.commandClose 命令语法结束串
     * @param {string=} options.variableOpen 变量语法起始串
     * @param {string=} options.variableClose 变量语法结束串
     * @param {string=} options.defaultFilter 默认变量替换的filter
     * @param {boolean=} options.strip 是否清除命令标签前后的空白字符
     * @param {string=} options.namingConflict target名字冲突时的处理策略
     */
    function Engine(options) {
        this.options = {
            commandOpen: '<!--',
            commandClose: '-->',
            commandSyntax: /^\s*(\/)?([a-z]+)\s*(?::([\s\S]*))?$/,
            variableOpen: '${',
            variableClose: '}',
            defaultFilter: 'html'
        };

        this.config(options);
        this.targets = {};
        this.filters = Object.assign({}, DEFAULT_FILTERS);
    }

    /**
     * 配置引擎参数，设置的参数将被合并到现有参数中
     *
     * @param {object} options 参数对象
     * @param {string=} options.commandOpen 命令语法起始串
     * @param {string=} options.commandClose 命令语法结束串
     * @param {string=} options.variableOpen 变量语法起始串
     * @param {string=} options.variableClose 变量语法结束串
     * @param {string=} options.defaultFilter 默认变量替换的filter
     * @param {boolean=} options.strip 是否清除命令标签前后的空白字符
     * @param {string=} options.namingConflict target名字冲突时的处理策略
     */
    Engine.prototype.config = function (options) {
        Object.assign(this.options, options);
        this.options.assignOpen = this.options.variableOpen.replace(/\$/g, '=');
        this.options.replaceSyntax = new RegExp('[&#]' + util.encodeRegExp(this.options.variableOpen.replace(/\$/g, '')) + '(.+?)' + util.encodeRegExp(this.options.variableClose), 'g');
    };

   /**
     * 解析模板并编译，返回第一个target编译后的renderer函数。
     * parse该方法的存在为了兼容老模板引擎
     *
     * @param {string} source 模板源代码
     * @return {function (Object):string} renderer函数
     */
    Engine.prototype.compile = Engine.prototype.parse = function (source) {
        if (source) {
            var targetNames = parseSource(source, this);
            if (targetNames.length) {
                return this.targets[targetNames[0]].getRenderer();
            }
        }

        return new Function('return ""');
    };

    /**
     * 根据target名称获取编译后的renderer函数
     *
     * @param {string} name target名称
     * @return {function (Object):string} renderer函数
     */
    Engine.prototype.getRenderer = function (name) {
        var target = this.targets[name] || etpl.targets[name];
        if (target) {
            return target.getRenderer();
        }
    };

    /**
     * 执行模板渲染，返回渲染后的字符串。
     *
     * @param {string} name target名称
     * @param {Object=} data 模板数据。
     *      可以是plain object，
     *      也可以是带有 {string}get({string}name) 方法的对象
     * @return {string} 渲染结果
     */
    Engine.prototype.render = function (name, data) {
        var renderer = this.getRenderer(name);
        if (renderer) {
            return renderer(data);
        }

        return '';
    };

    /**
     * 增加过滤器
     *
     * @param {string} name 过滤器名称
     * @param {Function} filter 过滤函数
     */
    Engine.prototype.addFilter = function (name, filter) {
        if (etpl === this) {
            DEFAULT_FILTERS[name] = filter;
        }
        this.filters[name] = filter;
    };

    /**
     * 解析源代码
     *
     * @inner
     * @param {string} source 模板源代码
     * @param {Engine} engine 引擎实例
     * @return {Array} target名称列表
     */
    function parseSource(source, engine) {
        var commandOpen = engine.options.commandOpen;
        var commandClose = engine.options.commandClose;
        var commandSyntax = engine.options.commandSyntax;

        var stack = [];
        var analyseContext = {
            engine: engine,
            targets: [],
            stack: stack,
            target: null
        };

        // text节点内容缓冲区，用于合并多text
        var textBuf = [];

        stack.top = function () {
            return this[this.length - 1];
        };

        stack.find = function (condition) {
            for (var index = this.length; index--;) {
                var item = this[index];
                if (condition(item)) {
                    return item;
                }
            }
        };

        /**
         * 将缓冲区中的text节点内容写入
         *
         * @inner
         */
        function flushTextBuf() {
            var text;
            if (textBuf.length > 0 && (text = textBuf.join(''))) {
                var textNode = new TextNode(text, engine);
                textNode.beforeAdd(analyseContext);

                stack.top().addChild(textNode);
                textBuf = [];

                if (engine.options.strip && analyseContext.current instanceof Command) {
                    textNode.value = text.replace(/^[\x20\t\r]*\n/, '');
                }
                analyseContext.current = textNode;
            }
        }

        var NodeType;

        parseTextBlock(
            source,
            commandOpen,
            commandClose,
            0,
            function (text) { // <!--...-->内文本的处理函数
                var match = commandSyntax.exec(text);

                // 符合command规则，并且存在相应的Command类，说明是合法有含义的Command
                // 否则，为不具有command含义的普通文本
                if (match && (NodeType = commandTypes[match[2].toLowerCase()]) && typeof NodeType === 'function') {
                    // 先将缓冲区中的text节点内容写入
                    flushTextBuf();

                    var currentNode = analyseContext.current;
                    if (engine.options.strip && currentNode instanceof TextNode) {
                        currentNode.value = currentNode.value.replace(/\r?\n[\x20\t]*$/, '\n');
                    }

                    if (match[1]) {
                        currentNode = autoCloseCommand(analyseContext, NodeType);
                    } else {
                        currentNode = new NodeType(match[3], engine);
                        if (typeof currentNode.beforeOpen === 'function') {
                            currentNode.beforeOpen(analyseContext);
                        }
                        currentNode.open(analyseContext);
                    }

                    analyseContext.current = currentNode;
                } else if (!/^\s*\/\//.test(text)) {
                    // 如果不是模板注释，则作为普通文本，写入缓冲区
                    textBuf.push(commandOpen, text, commandClose);
                }

                NodeType = null;
            },

            function (text) { // <!--...-->外，普通文本的处理函数
                // 普通文本直接写入缓冲区
                textBuf.push(text);
            }
        );

        flushTextBuf(); // 将缓冲区中的text节点内容写入
        autoCloseCommand(analyseContext);

        return analyseContext.targets;
    }

    etpl = new Engine();

    /**
     * 设置只属于引擎的命名空间，每次renderer时数据容器自动添加，命名为NS。
     * @public
     *
     * @param {object} data 数据对象
     */
    Engine.prototype.setNamespace = function (data) {
        this.ns = data;
    };

//{if 0}//
    var checkList = {};
//{/if}//
    var multiLanguage, lang;

    etpl.lang = function (data) {
        return data[lang] || data[0];
    };
    etpl.defineLanguages = function (value) {
        multiLanguage = value.split(':');
        navigator.languages.forEach(function (item) {
            if (lang === undefined) {
                item = multiLanguage.indexOf(item);
                if (item >= 0) {
                    lang = item;
                }
            }
        });
    };
    etpl.setLanguage = function (language) {
        lang = Math.max(0, multiLanguage.indexOf(language));
    };

    var globals = {};

    /**
     * 增加一个全局变量，每次renderer时自动添加到数据容器中。
     * @public
     *
     * @param {string} name 数据名
     * @param {object} value 数据值
     */
    etpl.addGlobal = function (name, value) {
//{if 0}//
        if (globals[name]) {
            console.warn('The name("' + name + '") has existed.');
        }
//{/if}//
        globals[name] = value;
    };
    etpl.Engine = Engine;

//{if 0}//
    var readyList = [];

    function loadInit() {
//{/if}//
//{if 1}//core.ready(function () {//{/if}//
        etpl.config({
            commandOpen: '<<<',
            commandClose: '>>>'
        });

        for (var el = document.body.firstChild; el; el = nextSibling) {
            var nextSibling = el.nextSibling;
            if (el.nodeType === 8) {
                etpl.compile(el.textContent || el.nodeValue);
                dom.remove(el);
            }
        }

        etpl.config({
            commandOpen: '<!--',
            commandClose: '-->'
        });
//{if 1}//});//{/if}//
//{if 0}//
        readyList.forEach(function (fn) {
            fn();
        });

        readyList = undefined;
    }

    core.ready(function () {
        var tplList = [];

        for (var el = document.body.firstChild; el; el = el.nextSibling) {
            if (el.nodeType === 8) {
                if (/^\s*import:\s*([A-Za-z0-9.-_\-]+)\s*$/.test(el.textContent || el.nodeValue)) {
                    tplList.push([el, RegExp.$1]);
                }
            }
        }

        (function loadTpl() {
            if (tplList.length) {
                var item = tplList.splice(0, 1)[0];
                io.ajax(item[1], {
                    cache: true,
                    onsuccess: function (text) {
                        item[0].parentNode.insertBefore(
                            document.createComment(text.replace(/<!--/g, '<<<').replace(/-->/g, '>>>')),
                            item[0]
                        );
                        item[0].parentNode.removeChild(item[0]);
                        loadTpl();
                    },
                    onerror: function () {
                        console.warn('No such file: ' + item[1]);
                        loadTpl();
                    }
                });
            } else {
                loadInit();
            }
        })();
    });

    etpl.ready = function (fn) {
        if (readyList) {
            readyList.push(fn);
        } else {
            fn();
        }
    };
//{/if}//
})();
