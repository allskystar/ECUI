// 为方便beyond compare比对差异提供的函数，仅在2.x.x版本中使用
(function () {
//{if 0}//
    if (document.head.lastElementChild.getAttribute('version') === 'release') {
        document.write('<link rel="stylesheet" type="text/css" href="release/ecui-2.0.0.css" />');
        document.write('<script type="text/javascript" src="release/ecui-2.0.0-all.js"></script>');
        return;
    }
//{/if}//
//{if 1}//    var patch = window.ecui;//{/if}//
    document.write('<script type="text/javascript" src="src/adapter.js"></script>');
    document.write('<script type="text/javascript" src="src/core.js"></script>');
    document.write('<script type="text/javascript" src="src/etpl.js"></script>');
    document.write('<script type="text/javascript" src="src/control.js"></script>');

    document.write('<script type="text/javascript" src="src/interface/items.js"></script>');
    document.write('<script type="text/javascript" src="src/interface/selector.js"></script>');
    document.write('<script type="text/javascript" src="src/interface/popup.js"></script>');
    document.write('<script type="text/javascript" src="src/interface/m-confirm.js"></script>');
    document.write('<script type="text/javascript" src="src/interface/m-scroll.js"></script>');
    document.write('<script type="text/javascript" src="src/interface/m-options.js"></script>');
    document.write('<script type="text/javascript" src="src/interface/resource.js"></script>');

    document.write('<script type="text/javascript" src="src/extend/clear.js"></script>');

    document.write('<script type="text/javascript" src="src/base/button.js"></script>');
    document.write('<script type="text/javascript" src="src/base/options.js"></script>');
    document.write('<script type="text/javascript" src="src/base/popup-menu.js"></script>');
    document.write('<script type="text/javascript" src="src/base/icon.js"></script>');
    document.write('<script type="text/javascript" src="src/base/image.js"></script>');
    document.write('<script type="text/javascript" src="src/base/img-fill.js"></script>');
    document.write('<script type="text/javascript" src="src/base/signature.js"></script>');
    document.write('<script type="text/javascript" src="src/base/month-view.js"></script>');
    document.write('<script type="text/javascript" src="src/base/calendar.js"></script>');
    document.write('<script type="text/javascript" src="src/base/range-calendar.js"></script>');
    document.write('<script type="text/javascript" src="src/base/abstract-tab.js"></script>');
    document.write('<script type="text/javascript" src="src/base/tab.js"></script>');
    document.write('<script type="text/javascript" src="src/base/steps.js"></script>');
    document.write('<script type="text/javascript" src="src/base/timer.js"></script>');
    document.write('<script type="text/javascript" src="src/base/clock.js"></script>');
    document.write('<script type="text/javascript" src="src/base/progress.js"></script>');
    document.write('<script type="text/javascript" src="src/base/progress-bar.js"></script>');
    document.write('<script type="text/javascript" src="src/base/progress-circle.js"></script>');
    document.write('<script type="text/javascript" src="src/base/layer.js"></script>');
    document.write('<script type="text/javascript" src="src/base/dialog.js"></script>');
    document.write('<script type="text/javascript" src="src/base/tree-view.js"></script>');
    document.write('<script type="text/javascript" src="src/base/pyramid-tree.js"></script>');
    document.write('<script type="text/javascript" src="src/base/table.js"></script>');
    document.write('<script type="text/javascript" src="src/base/locked-table.js"></script>');
    document.write('<script type="text/javascript" src="src/base/inline-table.js"></script>');

    document.write('<script type="text/javascript" src="src/form/form-input.js"></script>');
    document.write('<script type="text/javascript" src="src/form/abstract-input.js"></script>');
    document.write('<script type="text/javascript" src="src/form/input-group.js"></script>');
    document.write('<script type="text/javascript" src="src/form/text.js"></script>');
    document.write('<script type="text/javascript" src="src/form/number.js"></script>');
    document.write('<script type="text/javascript" src="src/form/finance.js"></script>');
    document.write('<script type="text/javascript" src="src/form/phone.js"></script>');
    document.write('<script type="text/javascript" src="src/form/email.js"></script>');
    document.write('<script type="text/javascript" src="src/form/time.js"></script>');
    document.write('<script type="text/javascript" src="src/form/abstract-item-input.js"></script>');
    document.write('<script type="text/javascript" src="src/form/checkbox.js"></script>');
    document.write('<script type="text/javascript" src="src/form/radio.js"></script>');
    document.write('<script type="text/javascript" src="src/form/abstract-select.js"></script>');
    document.write('<script type="text/javascript" src="src/form/select.js"></script>');
    document.write('<script type="text/javascript" src="src/form/combox.js"></script>');
    document.write('<script type="text/javascript" src="src/form/date.js"></script>');
    document.write('<script type="text/javascript" src="src/form/date-range.js"></script>');
    document.write('<script type="text/javascript" src="src/form/couple-slider.js"></script>');
    document.write('<script type="text/javascript" src="src/form/listbox.js"></script>');
    document.write('<script type="text/javascript" src="src/form/selected-box.js"></script>');
    document.write('<script type="text/javascript" src="src/form/checkbox-tree.js"></script>');
    document.write('<script type="text/javascript" src="src/form/file.js"></script>');
    document.write('<script type="text/javascript" src="src/form/upload.js"></script>');

    document.write('<script type="text/javascript" src="src/complex/pagination.js"></script>');
    document.write('<script type="text/javascript" src="src/complex/schema-tree.js"></script>');
    document.write('<script type="text/javascript" src="src/complex/multilevel.js"></script>');
    document.write('<script type="text/javascript" src="src/complex/cascader.js"></script>');
    document.write('<script type="text/javascript" src="src/complex/wang-editor.js"></script>');
    document.write('<script type="text/javascript" src="src/complex/cities.js"></script>');
    document.write('<script type="text/javascript" src="src/complex/multi-select.js"></script>');
    document.write('<script type="text/javascript" src="src/complex/transfer-tree.js"></script>');

    document.write('<script type="text/javascript" src="src/mobile/m-panel.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-select.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-multi-options.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-date.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-list-view.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-op-list-view.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-op-text.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-photo-hotspot.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-multilevel-select.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-carousel.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-book.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-tab.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-textarea.js"></script>');

    document.write('<script type="text/javascript" src="src/esr.js"></script>');
    document.write('<script type="text/javascript" src="src/extend/date-range.js"></script>');
    document.write('<script type="text/javascript" src="src/extend/anchor.js"></script>');
    document.write('<script type="text/javascript" src="src/extend/link.js"></script>');
    document.write('<script type="text/javascript" src="src/extend/ceiling.js"></script>');
    document.write('<script type="text/javascript" src="src/extend/data.js"></script>');
    document.write('<script type="text/javascript" src="src/extend/fullscreen.js"></script>');
    document.write('<script type="text/javascript" src="src/extend/ios-fixed.js"></script>');

    document.write('<script type="text/javascript" src="src/messagebox.js"></script>');
//{if 0}//
    var ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
    document.write('<script type="text/javascript" src="tools/debug.js"></script>');
    if (ieVersion < 9) {
        document.write('<script type="text/javascript" src="tools/html5shiv.js"></script>');
    }
    document.write('<script type="text/javascript" src="tools/less-funcs.js"></script>');
    document.write('<script type="text/javascript" src="tools/less.js"></script>');
//{/if}//
})();
