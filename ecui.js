// 为方便beyond compare比对差异提供的函数，仅在2.x.x版本中使用
function _interface(name, superClass, methods) {
    var inf = {
            NAME: name
        };
    if (superClass instanceof Array) {
        inf.SUPER = superClass;
        inf.Methods = methods;
    } else {
        inf.Methods = superClass;
    }
    if (inf.Methods.constructor) {
        inf.constructor = inf.Methods.constructor;
        delete inf.Methods.constructor;
    }
    return inf;
}

var ecui;
(function () {
    document.write('<script type="text/javascript" src="src/adapter.js"></script>');
    document.write('<script type="text/javascript" src="src/effect.js"></script>');
    document.write('<script type="text/javascript" src="src/etpl.js"></script>');
    document.write('<script type="text/javascript" src="src/core.js"></script>');
    document.write('<script type="text/javascript" src="src/control.js"></script>');
    document.write('<script type="text/javascript" src="src/input/form-input.js"></script>');
    document.write('<script type="text/javascript" src="src/esr.js"></script>');

    document.write('<script type="text/javascript" src="src/extend/ios-fixed.js"></script>');

    document.write('<script type="text/javascript" src="src/imp/items.js"></script>');
    document.write('<script type="text/javascript" src="src/imp/popup.js"></script>');
    document.write('<script type="text/javascript" src="src/imp/m-confirm.js"></script>');
    document.write('<script type="text/javascript" src="src/imp/m-scroll.js"></script>');
    document.write('<script type="text/javascript" src="src/imp/m-popup.js"></script>');
    document.write('<script type="text/javascript" src="src/imp/m-options.js"></script>');

    document.write('<script type="text/javascript" src="src/base/button.js"></script>');
    document.write('<script type="text/javascript" src="src/base/popup-menu.js"></script>');
    document.write('<script type="text/javascript" src="src/base/image.js"></script>');
    document.write('<script type="text/javascript" src="src/base/signature.js"></script>');
    document.write('<script type="text/javascript" src="src/base/month-view.js"></script>');
    document.write('<script type="text/javascript" src="src/base/calendar.js"></script>');
    document.write('<script type="text/javascript" src="src/base/range-calendar.js"></script>');
    document.write('<script type="text/javascript" src="src/base/abstract-tab.js"></script>');
    document.write('<script type="text/javascript" src="src/base/tab.js"></script>');
    document.write('<script type="text/javascript" src="src/base/steps.js"></script>');
    document.write('<script type="text/javascript" src="src/base/table.js"></script>');
    document.write('<script type="text/javascript" src="src/base/tree-view.js"></script>');
    document.write('<script type="text/javascript" src="src/base/pyramid-tree.js"></script>');
    document.write('<script type="text/javascript" src="src/base/layer.js"></script>');
    document.write('<script type="text/javascript" src="src/base/dialog.js"></script>');
    document.write('<script type="text/javascript" src="src/base/progress.js"></script>');
    document.write('<script type="text/javascript" src="src/base/progress-bar.js"></script>');
    document.write('<script type="text/javascript" src="src/base/progress-circle.js"></script>');
    document.write('<script type="text/javascript" src="src/base/locked-table.js"></script>');
    document.write('<script type="text/javascript" src="src/base/inline-table.js"></script>');
    document.write('<script type="text/javascript" src="src/base/timer.js"></script>');
    document.write('<script type="text/javascript" src="src/base/clock.js"></script>');
    document.write('<script type="text/javascript" src="src/base/img-fill.js"></script>');

    document.write('<script type="text/javascript" src="src/input/upload.js"></script>');
    document.write('<script type="text/javascript" src="src/input/input-control.js"></script>');
    document.write('<script type="text/javascript" src="src/input/input-group.js"></script>');
    document.write('<script type="text/javascript" src="src/input/label.js"></script>');
    document.write('<script type="text/javascript" src="src/input/text.js"></script>');
    document.write('<script type="text/javascript" src="src/input/number.js"></script>');
    document.write('<script type="text/javascript" src="src/input/finance.js"></script>');
    document.write('<script type="text/javascript" src="src/input/time.js"></script>');
    document.write('<script type="text/javascript" src="src/input/checkbox.js"></script>');
    document.write('<script type="text/javascript" src="src/input/radio.js"></script>');
    document.write('<script type="text/javascript" src="src/input/abstract-select.js"></script>');
    document.write('<script type="text/javascript" src="src/input/select.js"></script>');
    document.write('<script type="text/javascript" src="src/input/combox.js"></script>');
    document.write('<script type="text/javascript" src="src/input/filter.js"></script>');
    document.write('<script type="text/javascript" src="src/input/listbox.js"></script>');
    document.write('<script type="text/javascript" src="src/input/calendar-input.js"></script>');
    document.write('<script type="text/javascript" src="src/input/date-range.js"></script>');
    document.write('<script type="text/javascript" src="src/input/multilevel-select.js"></script>');
    document.write('<script type="text/javascript" src="src/input/multi-select.js"></script>');
    document.write('<script type="text/javascript" src="src/input/couple-slider.js"></script>');
    document.write('<script type="text/javascript" src="src/input/checkbox-tree.js"></script>');

    document.write('<script type="text/javascript" src="src/complex/pagination.js"></script>');
    document.write('<script type="text/javascript" src="src/complex/schema-tree.js"></script>');

    document.write('<script type="text/javascript" src="src/mobile/m-panel.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-select.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-multi-options.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-calendar.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-list-view.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-op-list-view.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-op-text.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-photo-hotspot.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-multilevel-select.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-carousel.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-book.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-tab.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-textarea.js"></script>');

    document.write('<script type="text/javascript" src="src/extend/anchor.js"></script>');
    document.write('<script type="text/javascript" src="src/extend/clear.js"></script>');
    document.write('<script type="text/javascript" src="src/extend/link.js"></script>');
    document.write('<script type="text/javascript" src="src/extend/messagebox.js"></script>');
    document.write('<script type="text/javascript" src="src/extend/ceiling.js"></script>');
    document.write('<script type="text/javascript" src="src/extend/fullscreen.js"></script>');

    document.write('<script type="text/javascript" src="src/bi/cities.js"></script>');
    document.write('<script type="text/javascript" src="src/bi/cropper.js"></script>');
    document.write('<script type="text/javascript" src="src/bi/date-time-input.js"></script>');
    document.write('<script type="text/javascript" src="src/bi/double-date-time-input.js"></script>');
    document.write('<script type="text/javascript" src="src/bi/m-send-text.js"></script>');
    document.write('<script type="text/javascript" src="src/bi/month-input.js"></script>');
    document.write('<script type="text/javascript" src="src/bi/multi-select.js"></script>');
    document.write('<script type="text/javascript" src="src/bi/quarter-input.js"></script>');
    document.write('<script type="text/javascript" src="src/bi/table-list-route.js"></script>');
    document.write('<script type="text/javascript" src="src/bi/queryButton.js"></script>');
    document.write('<script type="text/javascript" src="src/bi/selectTree.js"></script>');

    document.write('<script type="text/javascript" src="src/svg/svg.js"></script>');
    document.write('<script type="text/javascript" src="src/svg/y-v-axis.js"></script>');
//{if 0}//
    var ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
    document.write('<script type="text/javascript" src="tools/debug.js"></script>');
    if (ieVersion < 9) {
        document.write('<script type="text/javascript" src="tools/html5shiv.js"></script>');
    }
    document.write('<script type="text/javascript" src="tools/less.js"></script>');
    document.write('<script type="text/javascript" src="tools/less-funcs.js"></script>');
//{/if}//
}());
