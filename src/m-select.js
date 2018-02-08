(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    function setSelected(select, item) {
        if (select._cSelected !== item) {
            if (select._cSelected) {
                select._cSelected.alterClass('-selected');
                select._cSelected = null;
            }
            if (item) {
                item.alterClass('+selected');
                select._cSelected = item;
            }
        }
    }

    ui.MSelect = core.inherits(
        ui.Control,
        'ui-mobile-select',
        function (el, options) {
            var values = options.values,
                optionsEl = el;

            if (values) {
                if ('string' === typeof values) {
                    values = values.split(',');
                }
                values[0] = +values[0];
                values[1] = +values[1];
                if (values[2]) {
                    values[2] = +values[2];
                } else {
                    values[2] = 1;
                }
                for (var i = values[0], ret = [];; i += values[2]) {
                    ret.push('<div>' + i + '</div>');
                    if (i === values[1]) {
                        break;
                    }
                }
                el.innerHTML = '<div class="ui-mobile-select-mask"></div><div class="ui-mobile-select-options">' + ret.join('') + '</div>';
                optionsEl = el.lastChild;
            } else {
                el = dom.insertBefore(
                    dom.create(
                        {
                            className: el.className,
                            innerHTML: '<div class="ui-mobile-select-mask"></div>',
                            style: {
                                cssText: el.style.cssText
                            }
                        }
                    ),
                    el
                );
                optionsEl.className = 'ui-mobile-select-options';
                optionsEl.style.cssText = '';
                el.appendChild(optionsEl);
            }

            ui.Control.constructor.call(this, el, options);

            this._nRadius = Math.floor(options.optionSize / 2);
            this.$setBody(optionsEl);
            this.$initItems();
        },
        {
            Item: core.inherits(
                ui.Item,
                'ui-mobile-select-item'
            ),
            $activate: function (event) {
                ui.Control.prototype.$activate.call(this, event);

                var body = this.getBody();

                if (this._oHandler) {
                    this._oHandler();
                }
                core.drag(
                    this,
                    event,
                    {
                        el: body,
                        x: 0,
                        y: body.offsetTop,
                        left: 0,
                        right: 0,
                        top: this._nMinTop,
                        bottom: this._nMaxBottom,
                        inertia: function () {
                            var speed = core.getYSpeed();
                            if (!speed) {
                                return 0;
                            }

                            var y = util.toNumber(body.style.top),
                                sy = speed * 0.5 / 2,  // 计划0.5秒动画结束
                                expectY = Math.round(y + sy);

                            if (expectY < this._nTop) {
                                expectY = Math.max(this._nMinTop, expectY);
                            } else if (expectY > this._nBottom) {
                                expectY = Math.min(this._nMaxBottom, expectY);
                            } else {
                                expectY = Math.round(expectY / this._nItemHeight) * this._nItemHeight;
                            }
                            //计算实际结束时间
                            return (expectY - y) * 2 / speed;
                        },
                        limit: [this._nTop, 0, this._nBottom, 0, this._nItemHeight]
                    }
                );
            },
            $alterItems: function () {
                this._nTop = -this._nItemHeight * (this.getLength() - this._nRadius - 1);
                this._nBottom = this._nItemHeight * this._nRadius;
                this._nMinTop = this._nTop - this._nItemHeight * 2;
                this._nMaxBottom = this._nBottom + this._nItemHeight * 2;
                if (this._cSelected && !this._cSelected.getParent()) {
                    this.getBody().style.top = this._nTop + 'px';
                    setSelected(this, this.getItems().pop());
                }
            },
            $cache: function (style, cacheSize) {
                ui.Control.prototype.$cache.call(this, style, cacheSize);
                this._nItemHeight = this.getItem(0).getMain().offsetHeight;
            },
            $change: util.blank,
            $dispose: function () {
                this._oHandler = null;
                ui.Control.prototype.$dispose.call(this);
            },
            $dragmove: function (event) {
                ui.Control.prototype.$dragmove.call(this, event);
                setSelected(this, this.getItem(Math.round(-event.y / this._nItemHeight) + this._nRadius));
                this.getBody().style.top = event.y + 'px';
                return false;
            },
            $dragstart: function (event) {
                ui.Control.prototype.$dragstart.call(this, event);
                return false;
            },
            $initStructure: function (width, height) {
                height = this._nItemHeight * (this._nRadius * 2 + 1);
                this.getMain().style.height = height + 'px';
                ui.Control.prototype.$initStructure.call(this, width, height);
            },
            $ready: function (event) {
                ui.Control.prototype.init.call(this, event);
                this.setValue(event.options.value);
            },
            getValue: function () {
                return this._cSelected ? this._cSelected.getContent() : null;
            },
            setValue: function (value) {
                if (value !== undefined) {
                    value = String(value);
                    for (var i = 0, items = this.getItems(); i < items.length; i++) {
                        if (items[i].getContent() === value) {
                            setSelected(this, items[i]);
                            this.getBody().style.top = this._nBottom - this._nItemHeight * i;
                            return;
                        }
                    }
                }
                setSelected(this, null);
                this.getBody().style.top = (this._nBottom + this._nItemHeight) + 'px';
            }
        },
        ui.Items
    );
}());
