(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    function load() {
        var control = this.getControl();
        control.w = this.width;
        control.h = this.height;
    }
    ui.Cropper = ecui.inherits(
        ui.Control,
        function (el, options) {
            ui.Control.call(this, el, options);
            this._pUpload = core.$fastCreate(this.Upload, dom.first(el), this, options);
            this._pDrag = core.$fastCreate(this.Drag, dom.last(el), this, options);
        },
        {
            Upload: ecui.inherits(
                ui.Upload,
                function (el, options) {
                    ui.Upload.call(this, el, options);
                    this._eImg = el.getElementsByTagName('IMG')[0];
                    this._eFile = el.getElementsByTagName('INPUT')[0];
                    this._eInput = el.getElementsByTagName('INPUT')[1];
                },
                {

                    $click: function (event) {
                        ui.Upload.prototype.$click.call(this, event);
                        this._eFile.click();
                    },
                    onupload: function (res) {
                        res = JSON.parse(res);
                        this._eFile.value = ''; // 解决连续操作上传删除同一张图片时，第二次上传失败问题
                        if (res.code === 0) { // 显示上传的图片
                            this._eImg.src = res.data.url;
                            this._eInput.value = res.data.id;
                            this.getParent().setImg(this._eImg.src);
                        } else if (res.code === 12020) {
                            ecui.tip('error', '最大支持10m图片，请重新选择');
                        }
                    },
                    onerror: function (err) {
                        console.warn(err);
                        this._eFile.value = '';
                    },
                    getInputEl: function () {
                        return this._eInput;
                    }
                }
            ),
            Drag: ecui.inherits(
                ui.Control,
                function (el, options) {
                    ui.Control.call(this, el, options);
                    this._bImg = core.$fastCreate(this.BImg, dom.first(el), this);
                    this._pBox = core.$fastCreate(this.BImg, dom.last(el), this);
                    this._cImg = core.$fastCreate(this.PImg, dom.first(dom.last(el)), this);
                    this._bImg.getMain().src = this._cImg.getMain().src = this.src = options.src || 'images/car.png';
                },
                {
                    offset: {
                        x: 0,
                        y: 0,
                        bx: 0,
                        by: 0,
                        px: 0,
                        py: 0
                    },
                    w: 0,
                    h: 0,
                    crop: {
                        x: 0,
                        y: 0,
                        w: 0,
                        h: 0
                    },
                    BImg: ecui.inherits(
                        ui.Control
                    ),
                    PImg: ecui.inherits(
                        ui.Control,
                        function (el, options) {
                            dom.addEventListener(el, 'load', load);
                            ui.Control.call(this, el, options);
                        },
                        {
                            offset: {
                                x: 0,
                                y: 0
                            },
                            w: 0,
                            h: 0,
                            $ready: function () {
                                util.timer(function () {
                                    this.offset.x = this.getX();
                                    this.offset.y = this.getY();
                                }.bind(this), 100);
                            }
                        }
                    ),
                    $ready: function () {
                        util.timer(function () {
                            this.offset.x = this.getX();
                            this.offset.y = this.getY();

                            this.w = this.getWidth();
                            this.h = this.getHeight();
                        }.bind(this), 1);
                    },
                    $mousedown: function (event) {
                        this.offset.bx = this._bImg.getX();
                        this.offset.by = this._bImg.getY();
                        this.offset.px = this._cImg.getX();
                        this.offset.py = this._cImg.getY();
                        ecui.drag(this, event, { left: -this._cImg.w * 10, top: -this._cImg.h * 10, right: this._cImg.w * 10, bottom: this._cImg.h * 10 });
                    },
                    $dragmove: function (event) {
                        var x = event.x - this.offset.x,
                            y = event.y - this.offset.y,
                            rx = -this._cImg.offset.x,
                            ry = -this._cImg.offset.y,
                            rx_min = this.w - rx - this._cImg.w,
                            ry_min = this.h - ry - this._cImg.h;

                        this._bImg.setPosition(this.range(rx_min, x + this.offset.bx, rx), this.range(ry_min, y + this.offset.by, ry));
                        var cx = this.range(rx_min - rx, x + this.offset.px, 0);
                        var cy = this.range(ry_min - ry, y + this.offset.py, 0);
                        this._cImg.setPosition(cx, cy);
                        this.getParent().setPreviewPosition(cx, cy);
                        return false;
                    },
                    $dragend: function () {
                        this.crop.x = -this._cImg.getX();
                        this.crop.y = -this._cImg.getY();
                        this.crop.w = this._pBox.getWidth();
                        this.crop.h = this._pBox.getHeight();
                        console.log(this.crop);
                    },
                    range: function (x, y, z) {
                        return Math.min(Math.max(x, y), z);
                    },
                    getCropData: function () {
                        // var style = ecui.dom.getStyle(this._pBox.getMain());
                        // var x = parseFloat(style.left || '0');
                        // var y = parseFloat(style.top || '0');
                        return this.crop;
                    }
                }
            ),
            setImg: function (src) {
                this._pDrag._bImg.getMain().src = this._pDrag._cImg.getMain().src = src;
            },
            setPreviewPosition: function (x, y) {
                this._pUpload._eImg.style.left = x + 'px';
                this._pUpload._eImg.style.top = y + 'px';
            }
        }
    );
})();