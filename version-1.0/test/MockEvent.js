var uiut = {};
if(typeof uiut.MockEvents == 'undefined')
    uiut.MockEvents ={};

    /**
     * Simulates a mouse event using the given event information to populate
     * the generated event object. This method does browser-equalizing
     * calculations to account for differences in the DOM and IE event models
     * as well as different browser quirks.
     * @method mockMouseEvent
     * @private
     * @static
     * @param {HTMLElement} target The target of the given event.
     * @param {String} type The type of event to fire. This can be any one of
     *      the following: click, dblclick, mousedown, mouseup, mouseout,
     *      mouseover, and mousemove.
     * @param {Boolean} bubbles (Optional) Indicates if the event can be
     *      bubbled up. DOM Level 2 specifies that all mouse events bubble by
     *      default. The default is true.
     * @param {Boolean} cancelable (Optional) Indicates if the event can be
     *      canceled using preventDefault(). DOM Level 2 specifies that all
     *      mouse events except mousemove can be cancelled. The default
     *      is true for all events except mousemove, for which the default
     *      is false.
     * @param {Window} view (Optional) The view containing the target. This is
     *      typically the window object. The default is window.
     * @param {int} detail (Optional) The number of times the mouse button has
     *      been used. The default value is 1.
     * @param {int} screenX (Optional) The x-coordinate on the screen at which
     *      point the event occured. The default is 0.
     * @param {int} screenY (Optional) The y-coordinate on the screen at which
     *      point the event occured. The default is 0.
     * @param {int} clientX (Optional) The x-coordinate on the client at which
     *      point the event occured. The default is 0.
     * @param {int} clientY (Optional) The y-coordinate on the client at which
     *      point the event occured. The default is 0.
     * @param {Boolean} ctrlKey (Optional) Indicates if one of the CTRL keys
     *      is pressed while the event is firing. The default is false.
     * @param {Boolean} altKey (Optional) Indicates if one of the ALT keys
     *      is pressed while the event is firing. The default is false.
     * @param {Boolean} shiftKey (Optional) Indicates if one of the SHIFT keys
     *      is pressed while the event is firing. The default is false.
     * @param {Boolean} metaKey (Optional) Indicates if one of the META keys
     *      is pressed while the event is firing. The default is false.
     * @param {int} button (Optional) The button being pressed while the event
     *      is executing. The value should be 0 for the primary mouse button
     *      (typically the left button), 1 for the terciary mouse button
     *      (typically the middle button), and 2 for the secondary mouse button
     *      (typically the right button). The default is 0.
     * @param {HTMLElement} relatedTarget (Optional) For mouseout events,
     *      this is the element that the mouse has moved to. For mouseover
     *      events, this is the element that the mouse has moved from. This
     *      argument is ignored for all other events. The default is null.
     */
uiut.MockEvents._mockMouseEvent = function(
								target /*:HTMLElement*/, type /*:String*/,
                                   bubbles /*:Boolean*/,  cancelable /*:Boolean*/,
                                   view /*:Window*/,        detail /*:int*/,
                                   screenX /*:int*/,        screenY /*:int*/,
                                   clientX /*:int*/,        clientY /*:int*/,
                                   ctrlKey /*:Boolean*/,    altKey /*:Boolean*/,
                                   shiftKey /*:Boolean*/,   metaKey /*:Boolean*/,
                                   button /*:int*/,         relatedTarget /*:HTMLElement*/) /*:Void*/
								{

    switch(type){
        case "mousewheel":
        case "DOMMouseScroll":
        case "mouseover":
        case "mouseout":
        case "mousedown":
        case "mouseup":
        case "click":
        case "dblclick":
        case "mousemove":
            break;
        default:
            throw new Error("simulateMouseEvent(): Event type '" + type + "' not supported.");
    }
    //setup default values
    if (typeof bubbles !="boolean"){
        bubbles = true; //all mouse events bubble
    }
    if (typeof cancelable !="boolean"){
        cancelable = (type != "mousemove"); //mousemove is the only one that can't be cancelled
    }
    if (typeof view !="object"){
        view = window; //view is typically window
    }
    if (typeof detail!="number"){
        detail = 1;  //number of mouse clicks must be at least one
    }
    if (typeof screenX!="number"){
        screenX = 0;
    }
    if (typeof screenY!="number"){
        screenY = 0;
    }
    if (typeof clientX !="number"){
        clientX = 0;
    }
    if (typeof clientY !="number"){
        clientY = 0;
    }
    if (typeof ctrlKey !="boolean"){
        ctrlKey = false;
    }
    if (typeof altKey !="boolean"){
        altKey = false;
    }
    if (typeof shiftKey !="boolean"){
        shiftKey = false;
    }
    if (typeof metaKey !="boolean"){
        metaKey = false;
    }
    if (typeof button !="number"){
        button = 0;
    }

	var customEvent /*:MouseEvent*/ = null;
	if(typeof document.createEvent =="function"){
		customEvent = document.createEvent("MouseEvents");
	    //Safari 2.x (WebKit 418) still doesn't implement initMouseEvent()
        if (customEvent.initMouseEvent){
            customEvent.initMouseEvent(type, bubbles, cancelable, view, detail,
                                 screenX, screenY, clientX, clientY,
                                 ctrlKey, altKey, shiftKey, metaKey,
                                 button, relatedTarget);
        } else { //Safari

            //the closest thing available in Safari 2.x is UIEvents
            customEvent = document.createEvent("UIEvents");
            customEvent.initEvent(type, bubbles, cancelable);
            customEvent.view = view;
            customEvent.detail = detail;
            customEvent.screenX = screenX;
            customEvent.screenY = screenY;
            customEvent.clientX = clientX;
            customEvent.clientY = clientY;
            customEvent.ctrlKey = ctrlKey;
            customEvent.altKey = altKey;
            customEvent.metaKey = metaKey;
            customEvent.shiftKey = shiftKey;
            customEvent.button = button;
            customEvent.relatedTarget = relatedTarget;
        }

	    target.dispatchEvent(customEvent);

	}else if(typeof document.createEventObject =="object"){
        //create an IE event object
        customEvent = document.createEventObject();

        //assign available properties
        customEvent.bubbles = bubbles;
        customEvent.cancelable = cancelable;
        customEvent.view = view;
        customEvent.detail = detail;
        customEvent.screenX = screenX;
        customEvent.screenY = screenY;
        customEvent.clientX = clientX;
        customEvent.clientY = clientY;
        customEvent.ctrlKey = ctrlKey;
        customEvent.altKey = altKey;
        customEvent.metaKey = metaKey;
        customEvent.shiftKey = shiftKey;

        //fix button property for IE's wacky implementation
        switch(button){
            case 0:
                customEvent.button = 1;
                break;
            case 1:
                customEvent.button = 4;
                break;
            case 2:
                //leave as is
                break;
            default:
                customEvent.button = 0;
        }

        /*
         * Have to use relatedTarget because IE won't allow assignment
         * to toElement or fromElement on generic events. This keeps
         * YAHOO.util.customEvent.getRelatedTarget() functional.
         */
        customEvent.relatedTarget = relatedTarget;

        //fire the event
        target.fireEvent("on" + type, customEvent);
	}



}

    /**
     * Simulates a key event using the given event information to populate
     * the generated event object. This method does browser-equalizing
     * calculations to account for differences in the DOM and IE event models
     * as well as different browser quirks. Note: keydown causes Safari 2.x to
     * crash.
     * @method mockKeyEvent
     * @private
     * @static
     * @param {HTMLElement} target The target of the given event.
     * @param {String} type The type of event to fire. This can be any one of
     *      the following: keyup, keydown, and keypress.
     * @param {Boolean} bubbles (Optional) Indicates if the event can be
     *      bubbled up. DOM Level 3 specifies that all key events bubble by
     *      default. The default is true.
     * @param {Boolean} cancelable (Optional) Indicates if the event can be
     *      canceled using preventDefault(). DOM Level 3 specifies that all
     *      key events can be cancelled. The default
     *      is true.
     * @param {Window} view (Optional) The view containing the target. This is
     *      typically the window object. The default is window.
     * @param {Boolean} ctrlKey (Optional) Indicates if one of the CTRL keys
     *      is pressed while the event is firing. The default is false.
     * @param {Boolean} altKey (Optional) Indicates if one of the ALT keys
     *      is pressed while the event is firing. The default is false.
     * @param {Boolean} shiftKey (Optional) Indicates if one of the SHIFT keys
     *      is pressed while the event is firing. The default is false.
     * @param {Boolean} metaKey (Optional) Indicates if one of the META keys
     *      is pressed while the event is firing. The default is false.
     * @param {int} keyCode (Optional) The code for the key that is in use.
     *      The default is 0.
     * @param {int} charCode (Optional) The Unicode code for the character
     *      associated with the key being used. The default is 0.
     */
uiut.MockEvents._mockKeyEvent = function (target /*:HTMLElement*/, type /*:String*/,
                                 bubbles /*:Boolean*/,  cancelable /*:Boolean*/,
                                 view /*:Window*/,
                                 ctrlKey /*:Boolean*/,    altKey /*:Boolean*/,
                                 shiftKey /*:Boolean*/,   metaKey /*:Boolean*/,
                                 keyCode /*:int*/,        charCode /*:int*/) /*:Void*/
{

    //check event type

    type = type.toLowerCase();
    switch(type){
        case "keyup":
        case "keydown":
        case "keypress":
            break;
        case "textevent": //DOM Level 3
            type = "keypress";
            break;
            // @TODO was the fallthrough intentional, if so throw error
        default:
            throw new Error("simulateKeyEvent(): Event type '" + type + "' not supported.");
    }

    if (typeof bubbles != "boolean"){
        bubbles = true; //all key events bubble
    }
    if (typeof cancelable != 'boolean'){
        cancelable = true; //all key events can be cancelled
    }
    if (typeof view != "object"){
        view = window; //view is typically window
    }
    if (typeof ctrlKey !="boolean"){
        ctrlKey = false;
    }
    if (typeof altKey !="boolean"){
        altKey = false;
    }
    if (typeof shiftKey !="boolean"){
        shiftKey = false;
    }
    if (typeof metaKey != "boolean"){
        metaKey = false;
    }
    if (typeof keyCode !="number"){
        keyCode = 0;
    }
    if (typeof charCode !="number"){
        charCode = 0;
    }

    //try to create a mouse event
    var customEvent /*:MouseEvent*/ = null;

    //check for DOM-compliant browsers first
    if (typeof document.createEvent == "function"){

        try {

            //try to create key event
            customEvent = document.createEvent("KeyEvents");

            /*
             * Interesting problem: Firefox implemented a non-standard
             * version of initKeyEvent() based on DOM Level 2 specs.
             * Key event was removed from DOM Level 2 and re-introduced
             * in DOM Level 3 with a different interface. Firefox is the
             * only browser with any implementation of Key Events, so for
             * now, assume it's Firefox if the above line doesn't error.
             */
            //TODO: Decipher between Firefox's implementation and a correct one.
            customEvent.initKeyEvent(type, bubbles, cancelable, view, ctrlKey,
                altKey, shiftKey, metaKey, keyCode, charCode);

        } catch (ex /*:Error*/){

            /*
             * If it got here, that means key events aren't officially supported.
             * Safari/WebKit is a real problem now. WebKit 522 won't let you
             * set keyCode, charCode, or other properties if you use a
             * UIEvent, so we first must try to create a generic event. The
             * fun part is that this will throw an error on Safari 2.x. The
             * end result is that we need another try...catch statement just to
             * deal with this mess.
             */
            try {

                //try to create generic event - will fail in Safari 2.x
                customEvent = document.createEvent("Events");

            } catch (uierror /*:Error*/){

                //the above failed, so create a UIEvent for Safari 2.x
                customEvent = document.createEvent("UIEvents");

            } finally {

                customEvent.initEvent(type, bubbles, cancelable);

                //initialize
                customEvent.view = view;
                customEvent.altKey = altKey;
                customEvent.ctrlKey = ctrlKey;
                customEvent.shiftKey = shiftKey;
                customEvent.metaKey = metaKey;
                customEvent.keyCode = keyCode;
                customEvent.which = keyCode;
                customEvent.charCode = charCode;

            }

        }

        //fire the event
        target.dispatchEvent(customEvent);

    } else if (typeof document.createEventObject =="object"){ //IE

        //create an IE event object
        customEvent = document.createEventObject();

        //assign available properties
        customEvent.bubbles = bubbles;
        customEvent.cancelable = cancelable;
        customEvent.view = view;
        customEvent.ctrlKey = ctrlKey;
        customEvent.altKey = altKey;
        customEvent.shiftKey = shiftKey;
        customEvent.metaKey = metaKey;

        /*
         * IE doesn't support charCode explicitly. CharCode should
         * take precedence over any keyCode value for accurate
         * representation.
         */
        customEvent.keyCode = (charCode > 0) ? charCode : keyCode;

        //fire the event
        target.fireEvent("on" + type, customEvent);

    } else {
        throw new Error("simulateKeyEvent(): No event simulation framework present.");
    }
}

uiut.MockEvents._mockEvent = function(element, eventType, canBubble, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown) {
    canBubble = (typeof(canBubble) == undefined) ? true : canBubble;
    if (element.fireEvent && element.ownerDocument && element.ownerDocument.createEventObject) { // IE
        var evt = createEventObject(element, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown);
        element.fireEvent('on' + eventType, evt);
    }
    else {
        var evt = document.createEvent('HTMLEvents');

        try {
            evt.shiftKey = shiftKeyDown;
            evt.metaKey = metaKeyDown;
            evt.altKey = altKeyDown;
            evt.ctrlKey = controlKeyDown;
        } catch (e) {
            // On Firefox 1.0, you can only set these during initMouseEvent or initKeyEvent
            // we'll have to ignore them here
            LOG.exception(e);
        }

        evt.initEvent(eventType, canBubble, true);
        element.dispatchEvent(evt);
    }
}
uiut.MockEvents._fireMouseEvent = function (target /*:HTMLElement*/, type /*:String*/,
                           options /*:Object*/) /*:Void*/{
    options = options || {};
    uiut.MockEvents._mockMouseEvent(target, type, options.bubbles,
        options.cancelable, options.view, options.detail, options.screenX,
        options.screenY, options.clientX, options.clientY, options.ctrlKey,
        options.altKey, options.shiftKey, options.metaKey, options.button,
        options.relatedTarget);
}
uiut.MockEvents._getKeyCodeFromKeySequence = function(keySequence) {
    var match = /^\\(\d{1,3})$/.exec(keySequence);
    if (match != null) {
        return Number(match[1]);
    }
    match = /^.$/.exec(keySequence);
    if (match != null) {
        return Number(match[0].charCodeAt(0));
    }
    // this is for backward compatibility with existing tests
    // 1 digit ascii codes will break however because they are used for the digit chars
    match = /^\d{2,3}$/.exec(keySequence);
    if (match != null) {
        return Number(match[0]);
    }
    throw new Error("invalid keySequence");
}
uiut.MockEvents._fireKeyEvent = function (target /*:HTMLElement*/, type /*:String*/, keysequence,
                           options /*:Object*/) /*:Void*/{
    var keycode = uiut.MockEvents._getKeyCodeFromKeySequence(keysequence);
    options = options || {};
    uiut.MockEvents._mockKeyEvent(target /*:HTMLElement*/, type /*:String*/,
                                 options.bubbles /*:Boolean*/,  options.cancelable /*:Boolean*/,
                                 options.view /*:Window*/,
                                 options.ctrlKey /*:Boolean*/,    options.altKey /*:Boolean*/,
                                 options.shiftKey /*:Boolean*/,   options.metaKey /*:Boolean*/,
                                 keycode /*:int*/,        keycode /*:int*/);
}
uiut.MockEvents.focus = function(/*DOM*/target,/*Object*/options){
    if (target.fireEvent) {
        target.fireEvent("onfocus");
    }
    else {
        var evt = document.createEvent('HTMLEvents');
        evt.initEvent('focus', true, true);
        target.dispatchEvent(evt);  
    }
}
uiut.MockEvents.blur = function(/*DOM*/target,/*Object*/options){
    if (target.fireEvent) {
        target.fireEvent("onblur");
    }
    else {
        var evt = document.createEvent('HTMLEvents');
        evt.initEvent('blur', true, true);
        target.dispatchEvent(evt);  
    }
}
uiut.MockEvents.click = function(/*DOM*/target,/*Object*/options){
	uiut.MockEvents._fireMouseEvent(target,"click",options);
}
uiut.MockEvents.dblclick = function(/*DOM*/target,/*Object*/options){
	uiut.MockEvents._fireMouseEvent(target,"dblclick",options);
}

uiut.MockEvents.mousewheel = function (target, options){
    uiut.MockEvents._fireMouseEvent(target, /firefox\/(\d+\.\d)/i.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel", options);
}

uiut.MockEvents.mousedown = function (target, options){
    uiut.MockEvents._fireMouseEvent(target, "mousedown", options);
}

uiut.MockEvents.mousemove = function (target, options){
    uiut.MockEvents._fireMouseEvent(target, "mousemove", options);
}

uiut.MockEvents.mouseout = function (target, options){
    uiut.MockEvents._fireMouseEvent(target, "mouseout", options);
}
uiut.MockEvents.mouseover = function (target, options){
    uiut.MockEvents._fireMouseEvent(target, "mouseover", options);
}
uiut.MockEvents.mouseup = function (target, options){
    uiut.MockEvents._fireMouseEvent(target, "mouseup", options);
}

uiut.MockEvents.keypress = function(target,keysequence,options){
	uiut.MockEvents._fireKeyEvent(target,"keypress",keysequence,options);
}
uiut.MockEvents.keydown = function(target,keysequence,options){
	uiut.MockEvents._fireKeyEvent(target,"keydown",keysequence,options);
}
uiut.MockEvents.keyup = function(target,keysequence,options){
	uiut.MockEvents._fireKeyEvent(target,"keyup",keysequence,options);
}
