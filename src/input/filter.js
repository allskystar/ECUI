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
        {
            DEFAULT_OPTIONS: {
                url: '',
                custom: Boolean(true)
            },

            private: {
                value: undefined,
                handler: undefined
            },

            /**
             * @override
             */
            $blur: function (event) {
                _super.$blur(event);
                if (!this.custom && !this.getSelected()) {
                    this.$setValue('');
                }
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
                    this.value = this.getInput().value;
                    var args = [this.url, this.value];
                    core.request(
                        util.stringFormat.apply(null, args),
                        function (data) {
                            var text = this.getInput().value;
                            if (this.value !== text) {
                                // 数据请求过程中输入框又产生了变化，重新请求
                                if (text) {
                                    this.handler = util.timer(request, 1000, this);
                                }
                            } else {
                                delete this.handler;
                                this.add(data);
                            }
                        }.bind(this)
                    );
                }

                if (this.url) {
                    if (!this.handler) {
                        this.removeAll(true);
                        this.handler = util.timer(request, 1000, this);
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
