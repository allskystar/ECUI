/*
@example
<div ui="type:couple-slider;segment:5"></div>
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    /**
     * 组合滑块控件，用于选择一个区间。
     * 缺省设置不可选中内容。
     * options 属性：
     * segment    滑块分多少段
     * @control
     */
    ui.CoupleSlider = core.inherits(
        ui.InputControl,
        'ui-couple-slider',
        function (el, options) {
            var className = this.getUnitClass(ui.CoupleSlider, 'slider');
            dom.insertHTML(el, 'afterBegin', '<div class="' + this.getUnitClass(ui.CoupleSlider, 'bg') + '"></div><div class="' + this.getUnitClass(ui.CoupleSlider, 'mask') + '"></div><div class="' + className + '"></div><div class="' + className + '"></div>');

            var children = dom.children(el);

            _super(el, options);

            this.mask = children[1];
            this.sliders = [core.$fastCreate(this.Slider, children[2], this), core.$fastCreate(this.Slider, children[3], this)];
        },
        {
            DEFAULT_OPTIONS: {
                segment: Number(1)
            },

            private: {
                sliders: undefined,
                mask: undefined,

                _change: function (min, max) {
                    this.$setValue(min + ',' + max);
                    core.dispatchEvent(this, 'change', {min: min, max: max});
                },

                _setMask: function (v1, v2) {
                    var min = Math.min(v1, v2),
                        max = Math.max(v1, v2),
                        style = this.mask.style;

                    style.left = min + 'px';
                    style.width = (max - min) + 'px';
                }
            },

            /**
             * 滑动部件。
             * @unit
             */
            Slider: core.inherits(
                ui.Control,
                {
                    /**
                     * @override
                     */
                    $activate: function (event) {
                        _super.$activate(event);

                        var parent = this.getParent(),
                            sliders = ui.CoupleSlider._cast(parent).sliders,
                            other = sliders[1 - sliders.indexOf(this)],
                            width = parent.getClientWidth();

                        this._nX = other.getX();
                        this._nSeg = this.getX() * ui.CoupleSlider._cast(parent).segment / width;

                        core.drag(this, event, {
                            absolute: true,
                            left: 0,
                            right: width,
                            top: 0,
                            bottom: 0,
                            limit: {
                                stepX: width / ui.CoupleSlider._cast(parent).segment
                            }
                        });
                    },

                    /**
                     * @override
                     */
                    $dragmove: function (event) {
                        _super.$dragmove(event);

                        var parent = this.getParent(),
                            segWidth = parent.getClientWidth() / ui.CoupleSlider._cast(parent).segment,
                            seg = Math.round(event.x / segWidth);

                        ui.CoupleSlider._cast(
                            parent,
                            function () {
                                parent._setMask(this._nX, event.x);
                            }.bind(this)
                        );

                        if (this._nSeg !== seg) {
                            this._nSeg = seg;
                            ui.CoupleSlider._cast(
                                parent,
                                function () {
                                    parent._change(Math.min(seg, this._nX / segWidth), Math.max(seg, this._nX / segWidth));
                                }.bind(this)
                            );
                        }
                    }
                }
            ),

            /**
             * @override
             */
            $click: function (event) {
                _super.$click(event);

                var segWidth = this.getClientWidth() / this.segment,
                    v1 = this.sliders[0].getX(),
                    v2 = this.sliders[1].getX(),
                    pos = dom.getPosition(this.getMain()),
                    x = event.pageX - pos.left;

                if (Math.abs(x - v1) < Math.abs(x - v2)) {
                    v1 = Math.round(x / segWidth) * segWidth;
                    this.sliders[0].setPosition(v1, 0);
                } else {
                    v2 = Math.round(x / segWidth) * segWidth;
                    this.sliders[1].setPosition(v2, 0);
                }

                this._setMask(v1, v2);
                this._change(Math.min(v1, v2) / segWidth, Math.max(v1, v2) / segWidth);
            },

            /**
             * @override
             */
            setValue: function (min, max) {
                var segWidth = this.getClientWidth() / this.segment,
                    value = 'string' === typeof min ? min.split(',') : 'number' === typeof min ? [min, max] : min;

                min = +value[0] * segWidth;
                max = +value[1] * segWidth;
                this.sliders[0].setPosition(min, this.sliders[0].getY());
                this.sliders[1].setPosition(max, this.sliders[1].getY());

                this._setMask(min, max);
                _super.setValue(value.join(','));
            }
        }
    );
//{if 0}//
}());
//{/if}//
