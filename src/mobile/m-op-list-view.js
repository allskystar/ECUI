//{if $css}//
ecui.__ControlStyle__('\
.ui-mobile-op-listview {\
    .ui-item {\
        width: 100% !important;\
        white-space: nowrap !important;\
\
        > * {\
            display: inline-block !important;\
            vertical-align: top;\
        }\
\
        > *:first-child {\
            width: 100% !important;\
        }\
    }\
}\
');
//{/if}//
/*
@example
<ul ui="type:m-op-list-view">
  <li>
    <div>单条数据内容</div><div>操作项A</div><div>操作项B</div>
  </li>
  ...
</ul>

@fields
_bOperate - 操作状态，如果为true表示处理左右滑动，如果是false表示处理上下滑动，如果是undefined表示不确定
_cItem    - 当前处于激活的选项
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        effect = core.effect,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 移动端可操作列表展示控件。
     * @control
     */
    ui.MOpListView = core.inherits(
        ui.MListView,
        'ui-mobile-op-listview',
        function (el, options) {
            _super(el, options);
            this._bOperate = false;
        },
        {
            /**
             * 选项部件
             * @unit
             */
            Item: core.inherits(
                ui.MListView.prototype.Item,
                function (el, options) {
                    _super(el, options);
                    dom.toArray(this.getBody().childNodes).forEach(function (item) {
                        if (item.nodeType !== 1) {
                            dom.remove(item);
                        }
                    });
                    this._oHandle = util.blank;
                },
                {
                    /**
                     * @override
                     */
                    $activate: function (event) {
                        _super.$activate(event);

                        var parent = this.getParent();
                        if (parent._cItem !== this) {
                            if (parent._cItem) {
                                parent._cItem._oHandle = effect.grade('this.setPosition(#this.getX()->0#)', 400, {$: parent._cItem});
                            }
                            parent._cItem = this;
                        }
                    },

                    /**
                     * @override
                     */
                    $cache: function (style) {
                        _super.$cache(style);
                        this.$$sumWidth = 0;
                        this.$$opWidth = dom.children(this.getBody()).slice(1).map(
                            function (item) {
                                this.$$sumWidth += item.offsetWidth;
                                return item.offsetWidth;
                            },
                            this
                        );
                    },

                    /**
                     * @override
                     */
                    $click: function (event) {
                        _super.$click(event);

                        var parent = this.getParent();
                        if (parent && parent._cItem) {
                            parent._cItem._oHandle = effect.grade('this.setPosition(#this.getX()->0#)', 400, {$: parent._cItem});
                            parent._cItem = null;
                        }
                    },

                    /**
                     * @override
                     */
                    $dispose: function () {
                        this._oHandle();
                        _super.$dispose();
                    },

                    /**
                     * @override
                     */
                    $initStructure: function (width, height) {
                        _super.$initStructure(width, height);
                        height = this.getClientHeight();
                        dom.children(this.getBody()).forEach(function (item, index) {
                            if (index) {
                                item.style.height = height + 'px';
                            }
                        });
                    },

                    /**
                     * @override
                     */
                    $restoreStructure: function () {
                        _super.$restoreStructure();
                        dom.children(this.getBody()).forEach(function (item, index) {
                            if (index) {
                                item.style.height = '';
                            }
                        });
                    },

                    /**
                     * @override
                     */
                    getX: function () {
                        return +this.getBody().firstElementChild.style.transform.replace(/translateX\((-?[0-9.]+)px\)/, '$1');
                    },

                    /**
                     * @override
                     */
                    setPosition: function (x) {
                        this.cache();
                        var sum = this.$$sumWidth,
                            offset = 0;
                            // item被删除之后，这边直接调用会报错
                        if (this.getParent()) {
                            if (x < -sum * 3 / 4) {
                                if (!this._bComplete) {
                                    this._bComplete = true;
                                    core.drag(this.getParent(), {limit: {right: -sum}});
                                }
                            } else {
                                // eslint-disable-next-line no-lonely-if
                                if (this._bComplete) {
                                    this._bComplete = false;
                                    core.drag(this.getParent(), {limit: {right: sum}});
                                }
                            }
                            dom.children(this.getBody()).forEach(
                                function (item, index) {
                                    if (index) {
                                        item.style.transform = 'translateX(' + (x * sum / this.$$sumWidth - offset) + 'px)';
                                        sum -= this.$$opWidth[index - 1];
                                        offset += this.$$opWidth[index - 1];
                                    } else {
                                        item.style.transform = 'translateX(' + x + 'px)';
                                    }
                                },
                                this
                            );
                        }
                    }
                }
            ),

            /**
             * @override
             */
            $dragmove: function (event) {
                _super.$dragmove(event);
                if (this._bOperate === undefined) {
                    this._bOperate = (event.track.angle < 45 || (event.track.angle > 135 && event.track.angle < 225) || event.track.angle > 315);
                    if (this._bOperate) {
                        core.drag(this, {left: -this._cItem.$$sumWidth, limit: {ratio: 1}});
                        this._cItem._bComplete = false;
                    }
                }
            },

            /**
             * @override
             */
            $dragstart: function (event) {
                _super.$dragstart(event);
                this._bOperate = this.getStatus() ? false : undefined;
            },

            /**
             * @override
             */
            $remove: function (event) {
                _super.$remove(event);
                if (event.returnValue !== false) {
                    if (event.child === this._cItem) {
                        this._cItem = null;
                    }
                }
            },

            /**
             * @override
             */
            getX: function () {
                if (this._cItem) {
                    return this._cItem.getX();
                }
                return _super.getX();
            },

            /**
             * @override
             */
            reload: function (data) {
                _super.reload(data);
                this._cItem = null;
            },

            /**
             * @override
             */
            setPosition: function (x, y) {
                if (this._bOperate === false) {
                    _super.setPosition(0, y);
                } else if (this._bOperate === true && this._cItem) {
                    this._cItem.setPosition(x);
                }
            }
        }
    );
//{if 0}//
})();
//{/if}//
