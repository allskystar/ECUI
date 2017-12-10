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

    ui.MScroll = core.inherits(
        ui.Control,
        'ui-mobile-scroll',
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
                el.innerHTML = '<div class="ui-mobile-scroll-mask"></div><div class="ui-mobile-scroll-options">' + ret.join('') + '</div>';
                optionsEl = el.lastChild;
            } else {
                el = dom.insertBefore(
                    dom.create(
                        {
                            className: el.className,
                            innerHTML: '<div class="ui-mobile-scroll-mask"></div>',
                            style: {
                                cssText: el.style.cssText
                            }
                        }
                    ),
                    el
                );
                optionsEl.className = 'ui-mobile-scroll-options';
                optionsEl.style.cssText = '';
                el.appendChild(optionsEl);
            }

            ui.Control.call(this, el, options);

            this._nRadius = Math.floor(options.optionSize / 2);
            this.$setBody(optionsEl);
            this.$initItems();
        },
        {
            Item: core.inherits(
                ui.Item,
                'ui-mobile-scroll-item'
            ),
            $activate: function (event) {
                ui.Control.prototype.$activate.call(this, event);
                if (this._oHandler) {
                    this._oHandler();
                }
                core.drag(this, event, {x: 0, y: this.getBody().offsetTop, left: 0, right: 0, top: this._nMinTop, bottom: this._nMaxBottom});
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
            $deactivate: function (event) {
                ui.Control.prototype.$deactivate.call(this, event);

                var speed = core.getYSpeed() / 10,
                    control = this,
                    body = this.getBody(),
                    expectY = Math.round(util.toNumber(body.style.top) + speed),
                    y;

                if (expectY < this._nTop) {
                    y = Math.max(this._nMinTop, expectY);
                    expectY = this._nTop;
                } else if (expectY > this._nBottom) {
                    y = Math.min(this._nMaxBottom, expectY);
                    expectY = this._nBottom;
                } else {
                    y = Math.round(expectY / this._nItemHeight) * this._nItemHeight;
                    expectY = undefined;
                }

                this._oHandler = util.timer(function () {
                    control._oHandler = core.effect.grade(
                        'this.style.top->' + y,
                        1000,
                        {
                            $: body,
                            onstep: function (percent) {
                                var top = util.toNumber(body.style.top);
                                setSelected(control, control.getItem(Math.round(-top / control._nItemHeight) + control._nRadius));
                                if (percent === 1 || (expectY !== undefined && Math.abs(top - y) < control._nItemHeight / 2)) {
                                    control._oHandler();
                                    if (expectY !== undefined) {
                                        control._oHandler = core.effect.grade(
                                            'this.style.top->' + expectY,
                                            500,
                                            {
                                                $: body,
                                                onstep: function (percent) {
                                                    setSelected(control, control.getItem(Math.round(-util.toNumber(body.style.top) / control._nItemHeight) + control._nRadius));
                                                    if (percent === 1) {
                                                        core.triggerEvent(control, 'change', event);
                                                    }
                                                }
                                            }
                                        );
                                    } else {
                                        core.triggerEvent(control, 'change', event);
                                    }
                                }
                            }
                        },
                        function (percent) {
                            return 1 - Math.pow(1 - percent, 4);
                        }
                    );
                }, 0);
            },
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
