/*
@example
<ul ui="type:m-op-list-view">
  <li>
    <div>单条数据内容</div><div>操作项A</div><div>操作项B</div>
  </li>
  ...
</ul>

@fields
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
//{/if}//
    /**
     * 移动端列表展示控件。
     * @control
     */
    ui.MOpListView = core.inherits(
        ui.MListView,
        'ui-mobile-op-listview',
        {
            /**
             * 选项部件
             * @unit
             */
            Item: core.inherits(
                ui.MListView.prototype.Item,
                function (el, options) {
                    ui.MListView.prototype.Item.call(this, el, options);
                    Array.prototype.slice.call(this.getBody().childNodes).forEach(function (item) {
                        if (item.nodeType !== 1) {
                            dom.remove(item);
                        }
                    });
                },
                {
                    $activate: function (event) {
                        ui.MListView.prototype.Item.prototype.$activate.call(this, event);
                        this.getParent().setScrollRange({left: -this.$$sumWidth});
                        this.getParent().setRange({left: 0, right: 0});
                        if (this.getParent()._cItem !== this) {
                            if (this.getParent()._cItem) {
                                core.effect.grade('this.setPosition(#this.getX()->0#)', 400, {$: this.getParent()._cItem});
                            }
                            this.getParent()._cItem = this;
                        }
                    },

                    $cache: function (style) {
                        ui.MListView.prototype.Item.prototype.$cache.call(this, style);
                        this.$$sumWidth = 0;
                        this.$$opWidth = dom.children(this.getBody()).slice(1).map(function (item) {
                            this.$$sumWidth += item.offsetWidth;
                            return item.offsetWidth;
                        }, this);
                    },

                    getX: function () {
                        return +this.getBody().firstChild.style.transform.replace(/translateX\((-?[0-9.]+)px\)/, '$1');
                    },

                    setPosition: function (x) {
                        var sum = this.$$sumWidth;
                        dom.children(this.getBody()).forEach(function (item, index) {
                            if (index) {
                                item.style.transform = 'translateX(' + (x * sum / this.$$sumWidth) + 'px)';
                                sum -= this.$$opWidth[index - 1];
                            } else {
                                item.style.transform = 'translateX(' + x + 'px)';
                            }
                        }, this);
                    }
                }
            ),

            $dragmove: function (event) {
                ui.MListView.prototype.$dragmove.call(this, event);
                if (this._bOperate === undefined) {
                    this._bOperate = (event.track.angle < 45 || (event.track.angle > 135 && event.track.angle < 225) || event.track.angle > 315);
                }
            },

            $dragstart: function (event) {
                ui.MListView.prototype.$dragstart.call(this, event);
                this._bOperate = this.getStatus() ? false : undefined;
            },

            getX: function () {
                if (this._cItem) {
                    return this._cItem.getX();
                }
                return this.getX();
            },

            setPosition: function (x, y) {
                if (this._bOperate === false) {
                    ui.MListView.prototype.setPosition.call(this, 0, y);
                } else if (this._bOperate === true && this._cItem) {
                    this._cItem.setPosition(x);
                }
            }
        }
    );
}());
