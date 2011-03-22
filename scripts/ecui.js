(function () {

//{assign var="phases" value="define,body" delimiter=","}//
//{foreach item="item" from=$phases}//
//{assign var="phase" value=$item}//
//{if $adapter}//
//{else}//
//{include file="adapter.js"}//
//{/if}//
//{if $core_js}////{include file="core.js"}////{/if}//
//{if $control_js}////{include file="control.js"}////{/if}//
//{if $label_js}////{include file="label.js"}////{/if}//
//{if $progress_js}////{include file="progress.js"}////{/if}//
//{if $form_js}////{include file="form.js"}////{/if}//
//{if $collection_js}////{include file="collection.js"}////{/if}//
//{if $calendar_js}////{include file="calendar.js"}////{/if}//
//{if $items_js}////{include file="items.js"}////{/if}//
//{if $popup_js}////{include file="popup.js"}////{/if}//
//{if $tab_js}////{include file="tab.js"}////{/if}//
//{if $edit_js}////{include file="edit.js"}////{/if}//
//{if $format_edit_js}////{include file="format-edit.js"}////{/if}//
//{if $checkbox_js}////{include file="checkbox.js"}////{/if}//
//{if $radio_js}////{include file="radio.js"}////{/if}//
//{if $tree_js}////{include file="tree.js"}////{/if}//
//{if $radio_tree_js}////{include file="radio-tree.js"}////{/if}//
//{if $check_tree_js}////{include file="check-tree.js"}////{/if}//
//{if $palette_js}////{include file="color.js"}////{/if}//
//{if $palette_js}////{include file="palette.js"}////{/if}//
//{if $scroll_js}////{include file="scroll.js"}////{/if}//
//{if $panel_js}////{include file="panel.js"}////{/if}//
//{if $listbox_js}////{include file="listbox.js"}////{/if}//
//{if $select_js}////{include file="select.js"}////{/if}//
//{if $combox_js}////{include file="combox.js"}////{/if}//
//{if $multi_select_js}////{include file="multi-select.js"}////{/if}//
//{if $table_js}////{include file="table.js"}////{/if}//
//{if $locked_table_js}////{include file="locked-table.js"}////{/if}//
//{if $decorator_js}////{include file="decorator.js"}////{/if}//
//{if $tween_js}////{include file="tween.js"}////{/if}//
//{/foreach}//
})();
