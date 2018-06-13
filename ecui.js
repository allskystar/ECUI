var ecui;
(function () {
    document.write('<script type="text/javascript" src="src/adapter.js"></script>');

    document.write('<script type="text/javascript" src="src/core.js"></script>');
    document.write('<script type="text/javascript" src="src/control.js"></script>');
    document.write('<script type="text/javascript" src="src/input-control.js"></script>');

    document.write('<script type="text/javascript" src="src/items.js"></script>');
    document.write('<script type="text/javascript" src="src/popup.js"></script>');

    document.write('<script type="text/javascript" src="src/input-group.js"></script>');
    document.write('<script type="text/javascript" src="src/button.js"></script>');
    document.write('<script type="text/javascript" src="src/submit.js"></script>');
    document.write('<script type="text/javascript" src="src/cancel.js"></script>');
    document.write('<script type="text/javascript" src="src/layer.js"></script>');
    document.write('<script type="text/javascript" src="src/dialog.js"></script>');
    document.write('<script type="text/javascript" src="src/label.js"></script>');
    document.write('<script type="text/javascript" src="src/month-view.js"></script>');
    document.write('<script type="text/javascript" src="src/progress.js"></script>');
    document.write('<script type="text/javascript" src="src/progress-bar.js"></script>');
    document.write('<script type="text/javascript" src="src/progress-circle.js"></script>');
    document.write('<script type="text/javascript" src="src/retina.js"></script>');
    document.write('<script type="text/javascript" src="src/tab.js"></script>');
    document.write('<script type="text/javascript" src="src/table.js"></script>');
    document.write('<script type="text/javascript" src="src/tree-view.js"></script>');

    document.write('<script type="text/javascript" src="src/text.js"></script>');
    document.write('<script type="text/javascript" src="src/checkbox.js"></script>');
    document.write('<script type="text/javascript" src="src/radio.js"></script>');
    document.write('<script type="text/javascript" src="src/abstract-select.js"></script>');
    document.write('<script type="text/javascript" src="src/select.js"></script>');
    document.write('<script type="text/javascript" src="src/combox.js"></script>');
    document.write('<script type="text/javascript" src="src/listbox.js"></script>');

    document.write('<script type="text/javascript" src="src/calendar.js"></script>');
    document.write('<script type="text/javascript" src="src/calendar-input.js"></script>');
    document.write('<script type="text/javascript" src="src/locked-table.js"></script>');
    document.write('<script type="text/javascript" src="src/check-tree.js"></script>');
    document.write('<script type="text/javascript" src="src/multilevel-select.js"></script>');
    document.write('<script type="text/javascript" src="src/upload.js"></script>');

    document.write('<script type="text/javascript" src="src/messagebox.js"></script>');

    document.write('<script type="text/javascript" src="src/anchor.js"></script>');
    document.write('<script type="text/javascript" src="src/decorate.js"></script>');
    document.write('<script type="text/javascript" src="src/effect.js"></script>');
    document.write('<script type="text/javascript" src="src/etpl.js"></script>');
    document.write('<script type="text/javascript" src="src/esr.js"></script>');

    document.write('<script type="text/javascript" src="src/m-scroll.js"></script>');
    document.write('<script type="text/javascript" src="src/m-popup.js"></script>');
    document.write('<script type="text/javascript" src="src/m-pop-select.js"></script>');
    document.write('<script type="text/javascript" src="src/m-select.js"></script>');
    document.write('<script type="text/javascript" src="src/m-calendar.js"></script>');
    document.write('<script type="text/javascript" src="src/m-list-view.js"></script>');

    document.write('<script type="text/javascript" src="src/m-photo-hotspot.js"></script>');
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
