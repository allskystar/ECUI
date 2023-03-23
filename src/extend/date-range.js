/*
dateRange - 两个日期控件进行范围选择，在开始日期上使用此扩展即可在两个控件上建立连接。
*/
(function () {
//{if 0}//
    var core = ecui,
        ext = core.ext,
        ui = core.ui,
        util = core.util;
//{/if}//
    var configures = {};

    ext.dateRange = {
        constructor: function (value) {

            this.getFormValue = function () {
                var values = [this.getValue()],
                    end = configures[this.__ECUI__uid];
                if (!end.isDisabled() && end.getValue()) {
                    values.push(end.getValue());
                }
                return values.join(',');
            };

            core.delegate(function (control, hasCreated) {
                if (!hasCreated && control !== this && control instanceof ui.Date) {
                    return control;
                }
            }, function (control) {
                configures[this.__ECUI__uid] = control;
                configures[control.__ECUI__uid] = this;
                control.getFormName = util.blank;
                core.addEventListener(control, 'input', function (event) {
                    event.isEnd = true;
                    ext.dateRange.Events.input.call(this, event);
                });
                if (value) {
                    var el = control.getMain();
                    el.insertAdjacentHTML('afterEnd', '<div class="ui-date-delay inline-block"><div class="ui-checkbox"></div>' + value + '</div>');
                    core.addEventListener(control, 'validate', function (event) {
                        if (this.isRequired() && !checkbox.isChecked() && !this.getValue()) {
                            event.addError(this.ERROR_MINLENGTH1);
                            core.dispatchEvent(configures[this.__ECUI__uid], 'error', event);
                            event.preventDefault();
                        }
                    });

                    var checkbox = core.$fastCreate(ui.Checkbox, el.nextSibling.firstChild, control.getParent(), { disabled: this.isDisabled() });
                    core.addEventListener(checkbox, 'change', function () {
                        control[this.isChecked() ? 'disable' : 'enable']();
                        if (this.isChecked()) {
                            control.setValue('');
                        }
                    });
                    if (!control.getValue() && this.getValue()) {
                        checkbox.setChecked(true);
                        core.dispatchEvent(checkbox, 'change');
                    }
                    el = null;
                }
            }, this);
        },

        Events: {
            input: function (event) {
                function swap(start, end) {
                    var value = start.getValue();
                    start.setValue(end.getValue());
                    end.setValue(value);
                }

                var srcDate = this.getDate(),
                    desDate = configures[this.__ECUI__uid].getDate();
                if (event.isEnd ? srcDate < desDate : srcDate > desDate) {
                    swap(this, configures[this.__ECUI__uid]);
                }
            }
        }
    };
})();
