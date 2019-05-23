/*
@example
<select ui="type:filter;placeholder:请输入" name="age">
    <option value="20">20</option>
    <option value="21" selected>21</option>
    <option value="22">22</option>
</select>
或
<div ui="type:filter;name:age;value:21">
    <div ui="value:20">20</div>
    <div ui="value:21">21</div>
    <div ui="value:22">22</div>
</div>
或
<div ui="type:filter">
    <input name="age" value="21" placeholder="请输入">
    <div ui="value:20">20</div>
    <div ui="value:21">21</div>
    <div ui="value:22">22</div>
</div>


@fields
_bCustom    - 是否允许用户自己输入内容，如果不允许，不选择的输入失焦会自动清除
_sUrl       - 服务器获取筛选内容的请求地址
_sRequest   - 当前正在请求的值
_oHandler   - 定时器句柄
*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui,
        util = core.util;
//{/if}//
    /**
     * 筛选框控件。
     * 筛选框动态的响应用户的输入并提供选择，用户不输入时 filter 表现与普通的输入框相同。
     * options 属性：
     * custom     是否允许用户自己输入内容，如果不允许，不选择的输入失焦会自动清除，默认为允许
     * url        动态的从服务器获取筛选内容的请求地址
     * @control
     */
    ui.Filter = core.inherits(
        ui.Combox,
        'ui-filter',
        function (el, options) {
            _super(el, options);
            this._bCustom = options.custom !== false;
            this._sUrl = options.url;
        },
        {
            /**
             * @override
             */
            $blur: function (event) {
                _super.$blur(event);
                if (!this._bCustom && !this.getSelected()) {
                    this.$setValue('');
                }
            },

            /**
             * @override
             */
            $click: function (event) {
                this.$Popup.$click.call(this, event);
            },

            /**
             * @override
             */
            $focus: function (event) {
                _super.$focus(event);
                if (this.getInput().value) {
                    this.popup();
                }
            },

            /**
             * @override
             */
            $input: function (event) {
                function request() {
                    this._sRequest = this.getInput().value;
                    var args = [this._sUrl, this._sRequest];
                    core.request(
                        util.stringFormat.apply(null, args),
                        function (data) {
                            var text = this.getInput().value;
                            if (this._sRequest !== text) {
                                // 数据请求过程中输入框又产生了变化，重新请求
                                if (text) {
                                    this._oHandler = util.timer(request, 1000, this);
                                }
                            } else {
                                delete this._oHandler;
                                this.add(data);
                            }
                        }.bind(this)
                    );
                }

                if (this._sUrl) {
                    if (!this._oHandler) {
                        this.removeAll(true);
                        this._oHandler = util.timer(request, 1000, this);
                    }
                }

                _super.$input(event);

                if (this.getInput().value) {
                    this.popup();
                } else {
                    this.$getSection('Options').hide();
                }
            }
        }
    );
}());
