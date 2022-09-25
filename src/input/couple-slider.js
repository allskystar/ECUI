//{if $css}//
__ControlStyle__('\
.ui-couple-slider {\
    position: relative;\
    overflow: visible !important;\
\
    input {\
        display: none !important;\
    }\
\
    .ui-couple-slider-bg {\
        .width100rate();\
        .height100rate();\
    }\
\
    .ui-couple-slider-slider {\
        position: absolute !important;\
    }\
\
    .ui-couple-slider-mask {\
        position: absolute !important;\
    }\
}\
');
//{/if}//
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
    function change(control, min, max) {
        control.$setValue(min + ',' + max);
        core.dispatchEvent(control, 'change', {min: min, max: max});
    }

    function setMask(control, v1, v2) {
        var min = Math.min(v1, v2),
            max = Math.max(v1, v2),
            style = control._eMask.style;

        style.left = min + 'px';
        style.width = (max - min) + 'px';
    }

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
            var html = '<div class="' + this.getUnitClass(ui.CoupleSlider, 'slider') + '"></div>';
            dom.insertHTML(
                el,
                'afterBegin',
                '<div class="' + this.getUnitClass(ui.CoupleSlider, 'bg') + '"></div>' +
                    '<div class="' + this.getUnitClass(ui.CoupleSlider, 'mask') + '"></div>' + html + html
            );

            var children = dom.children(el);

            ui.InputControl.call(this, el, options);

            this._nSegment = options.segment;
            this._eMask = children[1];
            this._aSlider = [core.$fastCreate(this.Slider, children[2], this), core.$fastCreate(this.Slider, children[3], this)];
        },
        {
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
                        ui.Control.prototype.$activate.call(this, event);

                        var parent = this.getParent(),
                            other = parent._aSlider[1 - parent._aSlider.indexOf(this)],
                            width = parent.getClientWidth();

                        this._nX = other.getX();
                        this._nSeg = this.getX() * parent._nSegment / width;

                        core.drag(this, event, {
                            absolute: true,
                            left: 0,
                            right: width,
                            top: 0,
                            bottom: 0,
                            limit: {
                                stepX: width / parent._nSegment
                            }
                        });
                    },

                    /**
                     * @override
                     */
                    $dragmove: function (event) {
                        ui.Control.prototype.$dragmove.call(this, event);

                        var parent = this.getParent(),
                            segWidth = parent.getClientWidth() / parent._nSegment,
                            seg = Math.round(event.x / segWidth);

                        setMask(parent, this._nX, event.x);

                        if (this._nSeg !== seg) {
                            this._nSeg = seg;
                            change(parent, Math.min(seg, this._nX / segWidth), Math.max(seg, this._nX / segWidth));
                        }
                    }
                }
            ),

            /**
             * @override
             */
            $click: function (event) {
                ui.InputControl.prototype.$click.call(this, event);

                var segWidth = this.getClientWidth() / this._nSegment,
                    v1 = this._aSlider[0].getX(),
                    v2 = this._aSlider[1].getX(),
                    pos = dom.getPosition(this.getMain()),
                    x = event.pageX - pos.left;

                if (Math.abs(x - v1) < Math.abs(x - v2)) {
                    v1 = Math.round(x / segWidth) * segWidth;
                    this._aSlider[0].setPosition(v1, 0);
                } else {
                    v2 = Math.round(x / segWidth) * segWidth;
                    this._aSlider[1].setPosition(v2, 0);
                }

                setMask(this, v1, v2);
                change(this, Math.min(v1, v2) / segWidth, Math.max(v1, v2) / segWidth);
            },

            /**
             * @override
             */
            setValue: function (min, max) {
                var segWidth = this.getClientWidth() / this._nSegment,
                    value = typeof min === 'string' ? min.split(',') : typeof min === 'number' ? [min, max] : min;

                min = +value[0] * segWidth;
                max = +value[1] * segWidth;
                this._aSlider[0].setPosition(min, this._aSlider[0].getY());
                this._aSlider[1].setPosition(max, this._aSlider[1].getY());

                setMask(this, min, max);
                ui.InputControl.prototype.setValue.call(this, value.join(','));
            }
        }
    );
//{if 0}//
})();
//{/if}//
