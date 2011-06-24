/*
Shield - 分组屏蔽功能插件，通过修改setEnabled方法实现同组的控件同时屏蔽或取消屏蔽，通过增加遮罩层实现完全的disabled效果。
*/
//{if 0}//
(function () {

    var core = ecui,
        array = core.array,
        dom = core.dom,
        ext = core.ext,

        DOCUMENT = document,
        REGEXP = RegExp,

        USER_AGENT = navigator.userAgent,
        ieVersion = /msie (\d+\.\d)/i.test(USER_AGENT) ? DOCUMENT.documentMode || (REGEXP.$1 - 0) : undefined,
        
        remove = array.remove,
        createDom = dom.create,
        getStyle = dom.getStyle,
        insertBefore = dom.insertBefore,
        setStyle = dom.setStyle,

        $register = core.$register;
//{/if}//
//{if $phase == "define"}//
    /**
     * 初始化屏蔽层效果。
     * @public
     *
     * @param {ecui.ui.Control} control 需要提供屏蔽功能的控件
     * @param {string} baseClass 屏蔽层的样式名称
     * @param {Array} groupList 屏蔽的分组列表
     */
    var EXT_SHIELD =
        ext.Shield = function (control, baseClass, groupList) {
            var i = 0,
                id = control.getUID(),
                o;

            if (!EXT_SHIELD[id]) {
                for (; o = groupList[i++]; ) {
                    (EXT_SHIELD_GROUP[o] = EXT_SHIELD_GROUP[o] || []).push(control);
                }

                id = EXT_SHIELD[id] = {
                    base: baseClass,
                    group: groupList
                };

                for (o in EXT_SHIELD_PROXY) {
                    id[o] = control[o];
                    control[o] = EXT_SHIELD_PROXY[o];
                }
            }
        },

        EXT_SHIELD_PROXY = {},
        EXT_SHIELD_GROUP = {};
//{else}//
    /**
     * 销毁控件的默认处理。
     * 页面卸载时将销毁所有的控件，释放循环引用，防止在 IE 下发生内存泄漏，$dispose 方法的调用不会受到 ondispose 事件返回值的影响。
     * @protected
     */
    EXT_SHIELD_PROXY.$dispose = function () {
        for (var i = 0, id = this.getUID(), data = EXT_SHIELD[id], o; o = data.group[i++]; ) {
            remove(EXT_SHIELD_GROUP[o], this);
        }

        data.$dispose.call(this);
        delete EXT_SHIELD[id];
    };

    /**
     * 设置控件的大小。
     * $setSize 方法设置控件实际的大小，不改变其它的如缓存等信息。
     * @protected
     *
     * @param {number} width 宽度，如果不需要设置则将参数设置为等价于逻辑非的值
     * @param {number} height 高度，如果不需要设置则省略此参数
     */
    EXT_SHIELD_PROXY.$setSize = function () {
        var data = EXT_SHIELD[this.getUID()],
            el = this.getOuter();

        data.$setSize.apply(this, arguments);
        if (data.element) {
            data.element.style.width = el.scrollWidth + 'px';
            data.element.style.height = el.scrollHeight + 'px';
        }
    };

    /**
     * 设置控件的可操作状态。
     * 如果控件设置为不可操作，调用 alterClass 方法为控件添加扩展样式 -disabled，同时自动失去焦点；如果设置为可操作，移除控件的扩展样式 -disabled。setEnabled 方法只是设置控件自身的可操作状态，然后控件设置为可操作，并不代表调用 isEnabled 方法返回的值一定是 true，控件的可操作状态还受到父控件的可操作状态的影响。
     * @public
     *
     * @param {boolean} status 控件是否可操作，默认为 true
     * @param {boolean} flag 控件是否不需要分组联动改变
     * @return {boolean} 状态是否发生改变
     */
    EXT_SHIELD_PROXY.setEnabled = function (status, flag) {
        var i = 0,
            j = 0,
            id = this.getUID(),
            data = EXT_SHIELD[this.getUID()],
            el = this.getOuter(),
            o = data.element;

        if (status !== false) {
            if (o) {
                o.style.display = 'hide';
            }
        }
        else {
            if (o) {
                o.style.display = 'block';
            }
            else {
                o = data.element =
                    insertBefore(
                        createDom(
                            data.base,
                            'position:absolute;top:0px;left:0px;z-index:65535;width:' +
                                el.scrollWidth + 'px;height:' + el.scrollHeight + 'px'
                        ),
                        el.firstChild
                    );
                if (ieVersion < 8 && getStyle(o, 'backgroundColor') == 'transparent') {
                    o.style.backgroundColor = '#000';
                    setStyle(o, 'opacity', 0);
                }
            }
        }

        if (!flag) {
            for (; o = data.group[i++]; ) {
                for (; id = EXT_SHIELD_GROUP[o][j++]; ) {
                    id.setEnabled(status, true);
                }
            }
        }

        return data.setEnabled.call(this, status);
    };

    $register('shield', function (control, param) {
        param.replace(/([A-Za-z0-9\-]+)? *(\(([^)]+)\))?/g, function ($0, $1, $2, $3) {
            EXT_SHIELD(control, $1, $3 && $3.split(/\s+/));
        });
    });
//{/if}//
//{if 0}//
})();
//{/if}//
