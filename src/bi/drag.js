/*
drag - 拖拽控件
<table ui="type:test" border="0" cellpadding="0" cellspacing="0">
    <tr>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
    </tr>
</table>
*/
(function () {
//{if 0}//
    var core = ecui,
        ui = core.ui;
//{/if}//
    var left, width, start, oldIndex;
    ui.BDrag = ecui.inherits(
        ecui.ui.Control,
        'ui-drag',
        {
            $clear: function () {
                var boxes = this.getMain().getElementsByTagName('TD');
                for (var i = 0, item; item = boxes[i++]; ) {
                    ecui.dom.removeClass(item, 'hover');
                    ecui.dom.removeClass(item, 'selected');
                }
            },
            $mousedown: function (event) {
                left = ecui.dom.getPosition(this.getOuter()).left;
                var boxes = this.getMain().getElementsByTagName('TD');
                this.$clear();
                width = boxes[0].offsetWidth;
                oldIndex = start = Math.floor((event.pageX - left) / width);
                ecui.dom.addClass(boxes[start], 'hover');
                ecui.drag(this, event);
            },
            $dragmove: function (event) {
                var boxes = this.getMain().getElementsByTagName('TD'),
                    index = Math.max(0, Math.min(boxes.length - 1, Math.floor((event.pageX - left) / width)));
                if (oldIndex !== index) {
                    var step = oldIndex < start ? -1 : 1;
                    for (var i = start; i !== oldIndex; ) {
                        i += step;
                        ecui.dom.removeClass(boxes[i], 'hover');
                    }
                    step = index < start ? -1 : 1;
                    for (i = start; i !== index; ) {
                        i += step;
                        ecui.dom.addClass(boxes[i], 'hover');
                    }
                    oldIndex = index;
                }
                return false;
            },
            $dragend: function () {
                var boxes = this.getMain().getElementsByTagName('TD');
                var ret = [start];
                var step = oldIndex < start ? -1 : 1;
                var item;
                for (var i = start; i !== oldIndex; ) {
                    i += step;
                    ret.push(i);
                }
                for (i = 0; item = ret[i++]; ) {
                    ecui.dom.addClass(boxes[item], 'selected');
                }
                this.ondragend(ret, start, oldIndex);
            }
        }
    );
}());