(function(){var h=true,i=false,j=null,m=ecui={},bY=m.array={},E=m.dom={},aE=m.ext={},aH=m.string={},w=m.ui={},$=m.util={},p,t=document,N=Math.floor,q=Math.max,x=Math.min,aM=Math.round,as=parseInt,aB=navigator.userAgent,bt=t.compatMode=="CSS1Compat",u=/msie (\d+\.\d)/i.test(aB)?t.documentMode||+RegExp.$1:p,ao=/firefox\/(\d+\.\d)/i.test(aB)?+RegExp.$1:p,bv=/opera\/(\d+\.\d)/i.test(aB)?+RegExp.$1:p,cs=/(\d+\.\d)(\.\d)?\s+safari/i.test(aB)&&!/chrome/i.test(aB)?+RegExp.$1:p,b_={utf8:{getLength:function(a){return a.replace(/[\x80-\u07ff]/g,"  ").replace(/[\u0800-\uffff]/g,"   ").length},codeLength:function(a){return a>2047?3:a>127?2:1}},gbk:{getLength:function(a){return a.replace(/[\x80-\uffff]/g,"  ").length},codeLength:function(a){return a>127?2:1}}},b5={display:u<8?{get:function(b,a){return a.display=="inline"&&a.zoom==1?"inline-block":a.display},set:function(b,a){if(a=="inline-block"){a="inline";b.style.zoom=1}b.style.display=a}}:ao<3?{get:function(b,a){return a.display=="-moz-inline-box"?"inline-block":a.display},set:function(b,a){b.style.display=a=="inline-block"?"-moz-inline-box":a}}:p,opacity:u?{get:function(b,a){return /alpha\(opacity=(\d+)/.test(a.filter)?+RegExp.$1/100+"":"1"},set:function(b,a){b.style.filter=b.style.filter.replace(/alpha\([^\)]*\)/gi,"")+"alpha(opacity="+a*100+")"}}:p,"float":u?"styleFloat":"cssFloat"},J=bY.indexOf=function(f,a){for(var d=f.length;d--;)if(f[d]===a)break;return d},aY=bY.remove=function(f,a){for(var d=f.length;d--;)f[d]===a&&f.splice(d,1)},bp=E.addClass=function(b,a){b.className+=(" "+a)},U=E.children=function(b){for(var c=[],a=b.firstChild;a;a=a.nextSibling)a.nodeType==1&&c.push(a);return c},b0=E.contain=function(a,b){return a.contains?a.contains(b):a==b||!(!(a.compareDocumentPosition(b)&16))},y=E.create=function(a,b,c){c=t.createElement(c||"div");a&&(c.className=a);b&&(c.style.cssText=b);return c},ag=E.first=function(b){return bu(b.firstChild,"nextSibling")},s=E.getParent=u?function(b){return b.parentElement}:function(b){return b.parentNode},ah=E.getPosition=function(b){var c=0,d=0,e=t.body,f=s(e);if(u){if(!bt){a=F(e);isNaN(c=as(a.borderTopWidth))&&(c=-2);isNaN(d=as(a.borderLeftWidth))&&(d=-2)}a=b.getBoundingClientRect();c+=f.scrollTop+e.scrollTop-f.clientTop+N(a.top);d+=f.scrollLeft+e.scrollLeft-f.clientLeft+N(a.left)}else if(b==e){c=f.scrollTop+e.scrollTop;d=f.scrollLeft+e.scrollLeft}else{for(a=b;a;a=a.offsetParent){c+=a.offsetTop;d+=a.offsetLeft}if(bv||/webkit/i.test(aB)&&F(b,"position")=="absolute")c-=e.offsetTop;for(var a=s(b),g=F(b);a!=e;a=s(a),g=b){d-=a.scrollLeft;if(bv)a.tagName!="TR"&&(c-=a.scrollTop);else{b=F(a);f=ao&&b.overflow!="visible"&&g.position=="absolute"?2:1;c+=n(b.borderTopWidth)*f-a.scrollTop;d+=n(b.borderLeftWidth)*f}}}return{top:c,left:d}},F=E.getStyle=function(b,a){var c=b5[a],d=b.currentStyle||(u?b.style:getComputedStyle(b,j));return a?c&&c.get?c.get(b,d):d[c||a]:d},br=E.getText=ao?function(b){return b.textContent}:function(b){return b.innerText},co=E.insertAfter=function(b,a){var c=s(a);return c?c.insertBefore(b,a.nextSibling):K(b)},ai=E.insertBefore=function(b,a){var c=s(a);return c?c.insertBefore(b,a):K(b)},bb=E.insertHTML=function(b,a,c){if(b.insertAdjacentHTML)b.insertAdjacentHTML(a,c);else{var e=({AFTERBEGIN:"selectNodeContents",BEFOREEND:"selectNodeContents",BEFOREBEGIN:"setStartBefore",AFTEREND:"setEndAfter"})[a.toUpperCase()],d=t.createRange();d[e](b);d.collapse(a.length>9);d.insertNode(d.createContextualFragment(c))}},cp=E.last=function(b){return bu(b.lastChild,"previousSibling")},ap=E.moveElements=function(b,c,d){for(var a=b.firstChild;a;a=b){b=a.nextSibling;(d||a.nodeType==1)&&c.appendChild(a)}},cq=E.next=function(b){return bu(b.nextSibling,"nextSibling")},K=E.remove=function(b){var a=s(b);a&&a.removeChild(b);return b},bx=E.removeClass=function(b,a){var c=b.className.split(/\s+/).sort(),f=a.split(/\s+/).sort(),d=c.length,e=f.length;for(;d&&e;)c[d-1]==f[e-1]?c.splice(--d,1):c[d-1]<f[e-1]?e--:d--;b.className=c.join(" ")},aj=E.setInput=function(b,a,c){if(!b){if(u<9)return y("","",'<input type="'+(c||"")+'" name="'+(a||"")+'">');b=y("","","input")}a=a===p?b.name:a;c=c===p?b.type:c;if(b.name!=a||b.type!=c)if(u){bb(b,"AFTEREND",'<input type="'+c+'" name="'+a+'" class="'+b.className+'" style="'+b.style.cssText+'" '+(b.disabled?"disabled":"")+(b.readOnly?" readOnly":"")+">");a=b;(b=b.nextSibling).value=a.value;c=="radio"&&(b.checked=a.checked);K(a)}else{b.type=c;b.name=a}return b},by=E.setStyle=function(b,a,c){var d=b5[a];d&&d.set?d.set(b,c):b.style[d||a]=c},ct=E.setText=ao?function(b,a){b.textContent=a}:function(b,a){b.innerText=a},cn=aH.encodeHTML=function(a){return a.replace(/[&<>"']/g,function(a){return"&#"+a.charCodeAt(0)+";"})},b2=aH.getByteLength=function(a,b){return b?b_[b].getLength(a):a.length},cu=aH.sliceByte=function(a,b,c){if(c){for(var d=0,e=b_[c].codeLength;d<a.length;d++){b-=e(a.charCodeAt(d));if(b<0)return a.slice(0,d)}return a}return a.slice(0,b)},bz=aH.toCamelCase=function(a){if(a.indexOf("-")<0)return a;return a.replace(/\-./g,function(a){return a.charAt(1).toUpperCase()})},cv=aH.toHalfWidth=function(a){return a.replace(/[\u3000\uFF01-\uFF5E]/g,function(a){return String.fromCharCode(q(a.charCodeAt(0)-65248,32))})},aI=aH.trim=function(a){return a&&a.replace(/^\s+|\s+$/g,"")},T=$.attachEvent=function(a,b,c){a.attachEvent?a.attachEvent("on"+b,c):a.addEventListener(b,c,i)},O=$.blank=function(){},cw=$.cancel=function(){return i},L=$.copy=function(a,b){for(var c in b)a[c]=b[c];return a},aD=$.detachEvent=function(a,b,c){a.detachEvent?a.detachEvent("on"+b,c):a.removeEventListener(b,c,i)},aS=$.findConstructor=function(a,b){for(;a;a=a.superClass){a=a.constructor;if(a[b])return a[b]}},aG=$.getView=function(){var a=t.body,b=s(a),c=bt?b:a,e=b.scrollTop+a.scrollTop,d=b.scrollLeft+a.scrollLeft;return{top:e,right:d+c.clientWidth,bottom:e+c.clientHeight,left:d,width:c.clientWidth,height:c.clientHeight,maxWidth:q(b.scrollWidth,a.scrollWidth,c.clientWidth),maxHeight:q(b.scrollHeight,a.scrollHeight,c.clientHeight)}},l=$.inherits=function(a,b){var d=a.prototype,c=new Function();c.prototype=b.prototype;L(a.prototype=new c(),d);a.prototype.constructor=a;a.superClass=b.prototype;return a.prototype},Z=$.timer=function(a,b,c){var d=Array.prototype.slice.call(arguments,3),e=(b<0?setInterval:setTimeout)(function(){a.apply(c,d);b>=0&&(a=c=d=j)},Math.abs(b));return function(){(b<0?clearInterval:clearTimeout)(e);a=c=d=j}},n=$.toNumber=function(a){return as(a)||0},cr=E.ready=(function(){var g=i,f=[],b,c;function e(){if(!g){g=h;for(var d=0,a;a=f[d++];)a()}}t.addEventListener&&!bv?t.addEventListener("DOMContentLoaded",e,i):u&&window==top?(b=function(){try{t.documentElement.doScroll("left");e()}catch(a){Z(b,0)}}):cs&&(b=function(){var d=0,f,a=t.readyState;if(a!="loaded"&&a!="complete")Z(b,0);else{if(c===p){c=0;if(f=t.getElementsByTagName("style"))c+=f.length;if(f=t.getElementsByTagName("link"))for(;a=f[d++];)a.getAttribute("rel")=="stylesheet"&&c++}t.styleSheets.length!=c?Z(b,0):e()}});b&&b();T(window,"load",e);return function(a){g?a():f.push(a)}})(),aL=m.NORMAL=0,aK=m.INIT=1,bB=m.PAINT=2,aZ,a$,bc,o,bA,a6,bZ,b$,a7,cm,a8,a9,R=m.findControl=function(b){for(;b;b=s(b))if(b.getControl)return b.getControl();return j},b1,b3,aF,aT,aU,aV,b4,bq,ba,bs,aW,aX,V,bw,aq,ar,G,aR=["mousedown","mouseover","mousemove","mouseout","mouseup","pressstart","pressover","pressmove","pressout","pressend","click","focus","blur","keydown","keypress","keyup","mousewheel","change","resize","create","init"],k=w.Control=function(b,e){this._bCapture=e.capture!==i;this._bSelect=e.select!==i;this._bFocusable=e.focus!==i;this._bEnabled=e.enabled!==i;this._sBaseClass=this._sClass=e.base;this._sUID=e.uid;this._sType=e.type;this._eBase=this._eBody=b;this._cParent=j;this._sWidth=b.style.width;this._sHeight=b.style.height;this._aStatus=[""," "];aZ(b,this)},g=k.prototype,au,bI=l(w.Label=function(b,e){k.call(this,b,e);a$(this,this.setFor,e["for"])},k),bj=l(w.Progress=function(b,e){k.call(this,b,e);var a=b.innerHTML;b.innerHTML='<div class="'+e.base+'-text" style="position:absolute;top:0px;left:0px"></div><div class="'+e.base+'-mask" style="position:absolute;top:0px;left:0px"></div>';this._eText=b.firstChild;this._eMask=b.lastChild;this.setText(e.rate||0,a)},k),ab=l(w.Form=function(b,e){k.call(this,b,e);var a=y(e.base+"-main","position:relative;overflow:auto"),c=ag(b);ap(b,a,h);if(c&&c.tagName=="LABEL"){b.innerHTML='<div class="ec-control '+e.base+'-close" style="position:absolute"></div>';b.insertBefore(c,b.firstChild);c.className="ec-control "+(c.className||e.base+"-title");c.style.cssText+=";position:absolute"}else{b.innerHTML='<div class="ec-control '+e.base+'-title" style="position:absolute"></div><div class="ec-control '+e.base+'-close" style="position:absolute"></div>';c=b.firstChild}b.style.overflow="hidden";b.appendChild(a);this._bHide=e.hide;this._bAuto=e.titleAuto!==i;this._uTitle=o(w.Form.Title,c,this,{select:i});this._uClose=o(w.Form.Close,c.nextSibling,this,{select:i});this.getOuter().style.zIndex=aP.push(this)+4095},k),cd=l(w.Form.Title=function(b,e){k.call(this,b,e)},k),cc=l(w.Form.Close=function(b,e){k.call(this,b,e)},k),aP=[],aO=l(w.Collection=function(b,e){k.call(this,b,e);this._aItem=[];for(var d=0,f=U(b),a;a=f[d];)this._aItem[d++]=o(w.Collection.Item,a,this)},k),bF=l(w.Collection.Item=function(b,e){k.call(this,b,e)},k),ak=l(w.Calendar=function(b,e){k.call(this,b,e);b.style.overflow="auto";for(var d=0,f=[],a=e.base;d<7;)f[d]='<div class="ec-collection-item '+a+'-name-item" style="float:left">'+["\u65e5","\u4e00","\u4e8c","\u4e09","\u56db","\u4e94","\u516d"][d++]+"</div>";f[d]='</div><div class="ec-collection '+a+'-date" style="padding:0px;border:0px">';for(;++d<50;)f[d]='<div class="ec-collection-item '+a+'-date-item" style="float:left"></div>';b.innerHTML='<div class="ec-collection '+a+'-name" style="padding:0px;border:0px">'+f.join("")+"</div>";this._uName=o(w.Collection,b.firstChild,this);this._uDate=o(w.Calendar.Date,b.lastChild,this);this.setDate(e.year,e.month)},k),ca=l(w.Calendar.Date=function(b,e){w.Collection.call(this,b,e)},w.Collection),P=l(w.Item=function(b,e){k.call(this,b,e);b.style.overflow="hidden"},k),r=w.Items={},Q=l(w.Popup=function(b,e){k.call(this,b,e);K(b);b.style.cssText+=";position:absolute;overflow:hidden";if(this._nOptionSize=e.optionSize){var a=y(e.base+"-main","position:absolute;top:0px;left:0px");ap(b,a);b.innerHTML='<div class="ec-control '+e.base+'-prev" style="position:absolute;top:0px;left:0px"></div><div class="ec-control '+e.base+'-next" style="position:absolute"></div>';this.$setBody(b.insertBefore(a,b=b.firstChild));this._uPrev=o(w.Popup.Button,b,this,{select:i,focus:i});this._uNext=o(w.Popup.Button,b.nextSibling,this,{select:i,focus:i})}this.$initItems()},k),ch=l(w.Popup.Button=function(b,e){k.call(this,b,e)},k),am=l(w.Popup.Item=function(b,e){w.Item.call(this,b,e);var a=ag(b),c;if(a&&a.tagName=="LABEL"){ap(b,c=y("ec-popup "+e.parent.getBaseClass()));b.appendChild(a);this._cPopup=o(w.Popup,c,this,L({},e))}bS(this)},w.Item),a1,al,ad=l(w.Tab=function(b,e){k.call(this,b,e);var a=y(e.type+"-title "+e.base+"-title","position:relative;overflow:hidden");this._oSelected=e.selected||0;a.innerHTML='<div class="'+e.type+"-title-prev "+e.base+'-title-prev" style="position:absolute;left:0px;display:none"></div><div class="'+e.type+"-title-next "+e.base+'-title-next" style="position:absolute;display:none"></div><div class="'+e.base+'-title-main" style="position:absolute;white-space:nowrap"></div>';ap(b,e=a.lastChild);b.appendChild(a);this.$setBody(e);this.$initItems();this._uNext=o(w.Tab.Button,e=e.previousSibling,this,{select:i});this._uPrev=o(w.Tab.Button,e.previousSibling,this,{select:i})},k),cl=l(w.Tab.Button=function(b,e){k.call(this,b,e)},k),az=l(w.Tab.Item=function(b,e){w.Item.call(this,b,e);if(b.tagName!="LABEL"){var a=ag(b),c;ap(b,c=y(e.base+"-content"),h);b.appendChild(a);this.setContent(c)}by(b,"display","inline-block");e.parent&&e.selected&&(e.parent._oSelected=this)},w.Item),v=l(w.Edit=function(b,e){var a=b;if(b.tagName=="INPUT"){b=y(a.className,a.style.cssText+";overflow:hidden");a.className="";a.style.cssText="border:0px";ai(b,a).appendChild(a)}else{b.style.overflow="hidden";if(!(a=b.getElementsByTagName("input")[0])){a=aj(j,e.name,e.input);a.value=e.value||"";b.appendChild(a)}a.style.border="0px"}if(this._bHidden=e.hidden)a.style.display="none";by(b,"display","inline-block");this._eInput=a;bG(this);k.call(this,b,e)},k),X={},Y=l(w.FormatEdit=function(b,e){w.Edit.call(this,b,e);this._bSymbol=e.symbol!==i;this._bTrim=e.trim!==i;this._sCharset=e.charset;this._oKeyMask=e.keyMask?new RegExp(e.keyMask,"g"):j;this._nMinLength=e.minLength;this._nMaxLength=e.maxLength;this._nMinValue=e.minValue;this._nMaxValue=e.maxValue;this._oFormat=e.format?new RegExp("^"+e.format+"$"):j;this._aSegment=["","",""]},w.Edit),W=l(w.Checkbox=function(b,e){e.hidden=h;e.input="checkbox";w.Edit.call(this,b,e);e.checked&&(this.getInput().checked=h);this._aInferior=[];a$(this,this.setSuperior,e.superior)},w.Edit),af=l(w.Radio=function(b,e){e.hidden=h;e.input="radio";w.Edit.call(this,b,e);e.checked&&(this.getInput().checked=h)},w.Edit),B=l(w.Tree=function(b,e){var a=ag(b),c=this._aTree=[];k.call(this,b,e);this._bFold=i;if(a&&a.tagName=="LABEL")for(var d=0,f=U(b).slice(1),b=bX(this,y());a=f[d];){b.appendChild(a);(c[d++]=bW(a,this,e)).$setParent(this)}e.fold?this.setFold():a5(this)},k),ax=l(w.RadioTree=function(b,e){w.Tree.call(this,b,e);this._sName=e.name;this._sValue=e.value},w.Tree),at=l(w.CheckTree=function(b,e){w.Tree.call(this,b,e);this._oSuperior=e.superior;for(var d=0,a=this._uCheckbox=o(w.Checkbox,b.insertBefore(y("ec-checkbox "+this.getBaseClass()+"-checkbox"),b.firstChild),this,e),f=this.getChildTrees();b=f[d++];)if(e=b._oSuperior){b=b._uCheckbox;e===h?b.setSuperior(a):a$(b,b.setSuperior,e)}},w.Tree),_=(m.Color=function(a){a?this.setRGB(as(a.slice(0,2),16),as(a.slice(2,4),16),as(a.slice(4),16)):this.setRGB(0,0,0)}).prototype,aQ=l(w.Palette=function(b,e){k.call(this,b,e);var d=0,f=['<div class="'+e.base+'-left" style="float:left"><div class="ec-control '+e.base+'-image" style="position:relative;overflow:hidden"><div class="ec-control '+e.base+'-cross" style="position:absolute"><div></div></div></div></div><div class="'+e.base+'-mid" style="float:left"><div class="ec-control '+e.base+'-lightbar" style="position:relative">'];for(;++d<257;)f[d]='<div style="height:1px;overflow:hidden"></div>';f[d++]='<div class="ec-control '+e.base+'-arrow" style="position:absolute"><div></div></div></div></div><div class="'+e.base+'-right" style="float:left"><p>\u57fa\u672c\u989c\u8272</p><div class="'+e.base+'-basic" style="white-space:normal">';for(;d<306;)f[d++]='<div class="ec-control '+e.base+'-area" style="'+(u<8?"display:inline;zoom:1":"display:inline-block")+";background:#"+bM[d-259]+'"></div>';f[d]='</div><table cellspacing="0" cellpadding="0" border="0"><tr><td class="'+e.base+'-color" rowspan="3"><div class="ec-control '+e.base+'-show"></div><input class="ec-edit '+e.base+'-value"></td><th>\u8272\u8c03:</th><td><input class="ec-edit '+e.base+'-edit"></td><th>\u7ea2:</th><td><input class="ec-edit '+e.base+'-edit"></td></tr><tr><th>\u9971\u548c\u5ea6:</th><td><input class="ec-edit '+e.base+'-edit"></td><th>\u7eff:</th><td><input class="ec-edit '+e.base+'-edit"></td></tr><tr><th>\u4eae\u5ea6:</th><td><input class="ec-edit '+e.base+'-edit"></td><th>\u84dd:</th><td><input class="ec-edit '+e.base+'-edit"></td></tr></table><div class="ec-control '+e.base+'-button">\u786e\u5b9a</div><div class="ec-control '+e.base+'-button">\u53d6\u6d88</div></div>';b.innerHTML=f.join("");b=b.firstChild;e=this._uMain=o(w.Palette.Area,f=b.firstChild,this);e._uIcon=o(w.Palette.Area,f.lastChild,e,{capture:i});b=b.nextSibling;e=this._uLightbar=o(w.Palette.Area,f=b.firstChild,this);e._uIcon=o(w.Palette.Area,f.lastChild,e,{capture:i});f=U(b.nextSibling);this._uBasic=o(w.Palette.Collection,f[1],this);b=f[2].getElementsByTagName("td");this._uColor=o(k,b[0].firstChild,this);this._aValue=[];for(d=0;d<7;)this._aValue[d]=o(w.Palette.Edit,b[d].lastChild,this,d++?{keyMask:"[0-9]",maxValue:255}:{keyMask:"[0-9A-Fa-f]",maxLength:6});this._aButton=[o(w.Palette.Button,f[3],this),o(w.Palette.Button,f[4],this)]},k),bL=l(w.Palette.Area=function(b,e){k.call(this,b,e)},k),cg=l(w.Palette.Collection=function(b,e){w.Collection.call(this,b,e)},w.Collection),bN=l(w.Palette.Edit=function(b,e){w.FormatEdit.call(this,b,e)},w.FormatEdit),cf=l(w.Palette.Button=function(b,e){k.call(this,b,e)},k),bM=["FF8080","FFFF80","80FF80","00FF80","80FFFF","0080F0","FF80C0","FF80FF","FF0000","FFFF00","80FF00","00FF40","00FFFF","0080C0","8080C0","FF00FF","804040","FF8040","00FF00","008080","004080","8080FF","800040","FF0080","800000","FF8000","008000","008040","0000FF","0000A0","800080","8000FF","400000","804000","004000","004040","000080","000040","400040","400080","000000","808000","808040","808080","408080","C0C0C0","404040","FFFFFF"],D=l(w.Scroll=function(b,e){k.call(this,b,L(e,{select:i,focus:i}));b.innerHTML='<div class="'+e.type+"-prev "+e.base+'-prev" style="position:absolute;top:0px;left:0px"></div><div class="'+e.type+"-next "+e.base+'-next" style="position:absolute;top:0px;left:0px"></div><div class="'+e.type+"-block "+e.base+'-block" style="position:absolute"></div>';b=U(b);this._nValue=this._nTotal=0;this._nStep=1;this._uPrev=o(w.Scroll.Button,b[0],this,{select:i,focus:i});this._uNext=o(w.Scroll.Button,b[1],this,{select:i,focus:i});this._uBlock=o(w.Scroll.Block,b[2],this,{select:i,focus:i})},k),bk=l(w.Scroll.Block=function(b,e){k.call(this,b,e)},k),a2=l(w.Scroll.Button=function(b,e){k.call(this,b,e)},k),aA=l(w.VScroll=function(b,e){w.Scroll.call(this,b,e)},w.Scroll),av=l(w.HScroll=function(b,e){w.Scroll.call(this,b,e)},w.Scroll),aN=function(b,e){k.call(this,b,e);aD(b,"scroll",this.scroll);T(b,"scroll",this.scroll)},z=l(aN,k),bE=function(b,e){aN.call(this,b,e);this._aProperty=["overflowY","scrollTop","height",j,"offsetHeight"]},bD=function(b,e){aN.call(this,b,e);this._aProperty=["overflowX","scrollLeft","width","offsetWidth",j]},bC=O,b9=l(bC,k),M=l(w.Panel=function(b,e){k.call(this,b,e);var d=0,c=e.browser,j=e.vScroll!==i,g=e.hScroll!==i,f=[[j,"_uVScroll",c?bE:w.VScroll],[g,"_uHScroll",c?bD:w.HScroll],[j&&g,"_uCorner",c?bC:k]],a=y(e.base+"-main","position:absolute;top:0px;left:0px"+(g?";white-space:nowrap":""));b.style.overflow="hidden";ap(b,a,h);b.innerHTML=(c?'<div style="position:absolute;top:0px;left:0px;overflow:auto;padding:0px;border:0px"><div style="width:1px;height:1px;padding:0px;border:0px"></div></div>':(j?'<div class="ec-vscroll '+e.base+'-vscroll" style="position:absolute"></div>':"")+(g?'<div class="ec-hscroll '+e.base+'-hscroll" style="position:absolute"></div>':"")+(j&&g?'<div class="'+e.type+"-corner "+e.base+'-corner" style="position:absolute"></div>':""))+'<div class="'+e.base+'-layout" style="position:relative;overflow:hidden"></div>';this.$setBody(b.lastChild.appendChild(a));this._bAbsolute=e.absolute;this._nWheelDelta=e.wheelDelta;b=b.firstChild;c&&(this._eBrowser=b);for(;a=f[d++];)if(a[0]){this[a[1]]=o(a[2],b,this);c||(b=b.nextSibling)}},k),aw=l(w.Listbox=function(b,e){e.hScroll=i;w.Panel.call(this,b,e);this._sName=e.name||"";this.$initItems()},w.Panel),ae=l(w.Listbox.Item=function(b,e){w.Item.call(this,b,e);b.appendChild(this._eInput=aj(j,e.parent._sName,"hidden")).value=e.value===p?br(b):e.value;this.setSelected(!(!e.selected))},w.Item),C=l(w.Select=function(b,e){e.hidden=h;var d=0,f=[],j=b.name||e.name||"",l=b.value||e.value||"",g=b.options,c=y("ec-panel "+e.base+"-options","position:absolute;z-index:65535;display:none"),a=b;if(g){b=ai(y(b.className,b.style.cssText),b);K(a);for(;a=g[d];)f[d++]="<div "+b1()+'="value:'+cn(a.value)+'">'+a.text+"</div>";c.innerHTML=f.join("")}else ap(b,c);b.innerHTML='<div class="ec-item '+e.base+'-text"></div><div class="ec-control '+e.base+'-button" style="position:absolute"></div><input name="'+j+'">';w.Edit.call(this,b,e);this.$setBody((this._uOptions=o(w.Select.Options,c,this,{hScroll:i,browser:e.browser})).getBody());b=U(b);this._uText=o(w.Item,b[0],this,{capture:i});this._uButton=o(k,b[1],this,{capture:i});b[2].value=l;this._nOptionSize=e.optionSize||5;this.$initItems()},w.Edit),cj=l(w.Select.Options=function(b,e){w.Panel.call(this,b,e)},w.Panel),bm=l(w.Select.Item=function(b,e){w.Item.call(this,b,e);this._sValue=e.value===p?br(b):""+e.value},w.Item),cb=l(w.Combox=function(b,e){w.Select.call(this,b,e);this.getInput().style.display="";this.$getSection("Text").getOuter().style.display="none"},w.Select),I=l(w.MultiSelect=function(b,e){w.Select.call(this,b,e);K(this.getInput())},w.Edit),a0=l(w.MultiSelect.Item=function(b,e){w.Select.Item.call(this,b,e);b=this._eInput=e.parent.getBase().appendChild(aj(j,e.parent.getName(),"checkbox"));b.value=e.value||"";b.style.display="none"},w.Select.Item),A=l(w.Table=function(b,e){var d=0,h=this._aRow=[],r=this._aCol=[],m=ag(b),f=U(m),g=f[0],c,a;K(m);e.wheelDelta=1;w.Panel.call(this,b,e);if(g.tagName!="THEAD"){b=ai(y("","","thead"),g).appendChild((f=U(g)).shift());g=s(b)}else{f=U(f[1]);b=cp(g)}m.setAttribute("cellSpacing","0");if(a=this.$getSection("VScroll"))a.setValue=bV;if(a=this.$getSection("HScroll"))a.setValue=bV;a=y(e.type+"-area "+e.base+"-area","position:absolute;top:0px;overflow:hidden");a.innerHTML='<div style="white-space:nowrap;position:absolute"><table cellspacing="0"><tbody></tbody></table></div>';(this._uHead=o(k,this.getBase().appendChild(a),this)).$setBody(b);for(c=aS(this,"Row");a=f[d];d++){a.className=e.type+"-row "+(aI(a.className)||e.base+"-row");f[d]=ag(a);(h[d]=o(c,a,this))._aCol=[]}for(d=0,g=U(b);g[d];d++)for(c=0;h[c];c++){a=f[c];if(h[c]._aCol[d]===p){h[c]._aCol[d]=a;f[c]=cq(a);var l=n(a.getAttribute("rowSpan"))||1,q=n(a.getAttribute("colSpan"))||1;while(l--){l||q--;for(a=q;a--;)h[c+l]._aCol.push(l?i:j)}}}for(d=0;b=g[d];d++){a=b.className.split(/\s+/);a=a[0]||a[1]||e.base;b.className=e.type+"-head "+(aI(b.className)||a+"-head");r[d]=o(w.Table.Col,b,this);for(c=0;f=h[c];c++)if(b=f._aCol[d]){b.className=e.type+"-item "+(aI(b.className)||a+"-item");b.getControl=u==8?ay():ay}}this.getBody().appendChild(m)},w.Panel),an=l(w.Table.Row=function(b,e){











k.call(this,b,e)},k),a4=l(w.Table.Col=function(b,e){











k.call(this,b,e)},k),a3=l(w.Table.Cell=function(b,e){











k.call(this,b,e)},k),ay=u==8?function(){












var a;
return function(){a||(a=o(w.Table.Cell,this,s(this).getControl()));



return a}}:function(){


this.getControl=j;
return o(w.Table.Cell,this,s(this).getControl())},




















































ac=l(w.LockedTable=function(b,e){

w.Table.call(this,b,e);

var d=0,g=this.getRows(),c=y("","position:absolute;top:0px;left:0px;overflow:hidden"),f=[],h=this._aLockedRow=[],a;






this._nLeft=e.leftLock||0;
this._nRight=this.getColCount()-(e.rightLock||0);


for(;b=g[d];){
b=b.getBase();
f[d++]='<tr class="'+b.className+'" style="'+b.style.cssText+'"><td style="padding:0px;border:0px"></td></tr>'}




c.innerHTML='<div class="'+e.type+"-area "+e.base+'-area"><div style="white-space:nowrap;position:absolute"><table cellspacing="0"><thead><tr><td style="padding:0px;border:0px"></td></tr></thead></table></div></div><div class="'+e.type+"-layout "+e.base+'-layout" style="position:relative;overflow:hidden"><div style="white-space:nowrap;position:absolute;top:0px;left:0px"><table cellspacing="0"><tbody>'+f.join("")+"</tbody></table></div></div>";




a=this._uLockedHead=o(k,c.firstChild,this);
a.$setBody(a.getBase().lastChild.lastChild.firstChild.lastChild);
a._cJoint=this.$getSection("Head");
a._eFill=a.getBody().lastChild;

a=this._uLockedMain=o(k,b=c.lastChild,this);
a.$setBody(b=b.lastChild);

for(d=0,f=U(b.lastChild.lastChild);a=f[d];)h[d]=bJ(this,a,g[d++]);


ai(c,s(this.getBody()))},w.Table),bK=l(w.LockedTable.Row=function(b,e){











w.Table.Row.call(this,b,e)},w.Table.Row),























S=aE.Decorator=function(b,c,f){



var d=b.getUID(),a=(this._oInner=S[d]||b).getOuter();


ai(this._eOuter=y(this._sClass=c),a).appendChild(a);
aZ(this._eOuter,b);

S[d]=this;


L(b,aJ);if(f){


for(d=0;a=f[d];)f[d++]='<div class="'+c+"-"+a+'" style="position:absolute;top:0px;left:0px"></div>';





bb(this._eOuter,"BEFOREEND",f.join(""))}},H=S.prototype,aJ={},

















b6=aE.LRDecorator=function(a,b){

S.call(this,a,b,["left","right"])},













b8=aE.TBDecorator=function(a,b){

S.call(this,a,b,["top","bottom"])},













b7=aE.MagicDecorator=function(a,b){

S.call(this,a,b,["widget0","widget1","widget2","widget3","widget5","widget6","widget7","widget8"])},





























aa=aE.Tween=function(a,e){




var m=a.$click,q=a.$pressstart,p=a.$pressend,s=e.second*1000||500,l=e.pressStep,g=e.getValue||new Function("o","return [ecui.util.toNumber(o."+e.monitor.replace(/\|/g,"),ecui.util.toNumber(o.")+")]"),k=e.setValue||new Function("o","v","o."+e.monitor.replace(/\|/g,'=v[0]+"px";v.splice(0,1);o.')+'=v[0]+"px"');





















function n(){
var e=aa[this.getUID()],d=e.start,b=e.end,f=e.value={},c=x((e.time+=20)/s,1),a;if(c==1){








e.stop();
aa[this.getUID()]=j}for(a in d)f[a]=d[a]+(b[a]-d[a])*(1-Math.pow(1-c,3));






k(this,f)}






function r(){
var e=aa[this.getUID()],d=e.start,b=e.end,f=e.value,j=h,c,a;for(a in d){









c="number"==typeof l?l:l[a];d[a]<b[a]?(f[a]+=c)<b[a]&&(j=i):d[a]>b[a]&&(f[a]-=c)>b[a]&&(j=i)}if(j){















k(this,b);
m.call(this);
c=g(this);for(a in c)b[a]==c[a]?(f[a]=c[a]):j=i;j?e.stop():e.end=c}

















k(this,f)}










function o(a,f,j){

m.call(a,c);

var e=aa[a.getUID()],d=e.start,b=e.end=g(a),l=i,k;for(k in d)d[k]!=b[k]&&(l=h);if(l){













e.time=0;
f.call(a);
e.stop=Z(f,-j,a)}}if(l){











a.$click=function(c){

var f=g(this);
m.call(this,c);
k(this,f)};








a.$pressstart=function(c){
var e=aa[this.getUID()];if(e){



e.stop();
k(this,e.end)}else{


e=aa[this.getUID()]={};
e.start=g(this);
e.value=g(this)}


o(this,r,40);

q.call(this,c)};








a.$pressend=function(c){
var e=aa[this.getUID()];


e.stop();
e.start=e.value;
e.stop=Z(n,-20,this);

p.call(this,c)}}else a.$click=function(c){










var e=aa[this.getUID()],a=i,b;if(e){





e.stop();
k(this,e.end);
e.start=e.value}else{



e=aa[this.getUID()]={};
e.start=g(this)}


o(this,n,20)}};


















function bu(b,a){
for(;b;b=b[a])if(b.nodeType==1)break;




return b}






(function(){
var X="ecui",ag,S,_,ak,N=0,aj,ab={},P=[],D,E,I=0,B,Q=[],aa=[],H,al=0,W={},A,r,J,z,ad=[],l={mousedown:function(c){

































c=G(c);



var a=c.getTarget();
r=j;if(a){if(ai(c)){if(u<8)return}else U(a,c);









for(;a;a=a.getParent())if(a.isFocusable()){a!=r&&a.contain(z)||ar(a);




break}}else(a=R(c.target))?U(a,c,h):ar()},mouseover:function(c){
















c=G(c);


var a=c.getTarget(),d=ae(a,J),b=l.type;




b=b!="drag"&&b!="zoom"&&r&&(!d||d.contain(r));



C(J,"mouseout",c,d);b&&r.contain(J)&&r.pressout(c);



C(a,"mouseover",c,d);b&&r.contain(a)&&r.pressover(c);




J=a},mousemove:function(c){



c=G(c);


var a=c.getTarget();


C(a,"mousemove",c);r&&r.contain(a)&&r.pressmove(c)},mouseup:function(c){






c=G(c);


var a=c.getTarget();

C(a,"mouseup",c);if(r){

r.pressend(c);a==r&&r.click(c);




r=j}}},v={type:"drag",mousemove:function(c){








c=G(c);



var a=l.target,e=a.getX()+D-l.x,f=a.getY()+E-l.y,b=x(q(e,l.left),l.right),d=x(q(f,l.top),l.bottom);a.ondragmove&&a.ondragmove(c,b,d)===i||a.$dragmove(c,b,d)===i||a.setPosition(b,d);












l.x=D+a.getX()-e;
l.y=E+a.getY()-f},mouseup:function(c){



c=G(c);


var a=l.target;a.ondragend&&a.ondragend(c)===i||a.$dragend(c);



aq();u&&t.body.releaseCapture(i);




l.mouseup(c)}},af={type:"intercept",mousedown:function(c){







c=G(c);


var a=l.target,d=l,b=c.getTarget();ai(c)||(b&&!b.isFocusable()?U(b,c):a.onintercept&&a.onintercept(c)===i||a.$intercept(c)===i?d==l?b&&U(b,c):l.mousedown(c):aq())}},M={type:"zoom",mousemove:function(c){






























c=G(c);






var a=l.target,d=l.width=D-l.x+l.width,b=l.height=E-l.y+l.height;







l.x=D;
l.y=E;

d=l.minWidth>d?l.minWidth:l.maxWidth<d?l.maxWidth:d;
b=l.minHeight>b?l.minHeight:l.maxHeight<b?l.maxHeight:b;


a.setPosition(l.left+x(d,0),l.top+x(b,0));a.onzoom&&a.onzoom(c)===i||a.$zoom(c)===i||a.setSize(Math.abs(d),Math.abs(b))},mouseup:function(c){






c=G(c);


var a=l.target;a.onzoomend&&a.onzoomend(c)===i||a.$zoomend(c);



aq();u&&t.body.releaseCapture(i);a==A?a.hide():Y();











l.mouseup(c)}},Y=m.paint=function(){









var d=0,f=[],a;if(u){




a=(bt?t.documentElement:t.body).clientWidth;if(aj!=a)aj=a;else return}









B=bB;
a=l.type;
V(i);if(a!="zoom"){a=="drag"&&l.mouseup();





for(a=j;a!==p;a=f[d++])for(var 
b=0,c=bw({parent:a});a=c[b++];)a.isShow()&&f.push(a);






for(d=0;a=f[d++];){
a.paint=O;
a.resize();
delete a.paint;if(u<8){


a=F(b=a.getBase());a.width=="auto"&&a.display=="block"&&(b.style.width="100%")}}if(u<8)for(;a=f[--d];){








b=a.getBase();
b.style.width=b.offsetWidth-(S?a.getInvalidWidth(h)*2:0)+"px"}



for(d=0;a=f[d++];)a.cache(h,h);


for(d=0;a=f[d++];)a.$setSize(a.getWidth(),a.getHeight())}u<8?Z(V,0,j,h):V(h);









B=aL};











aZ=m.$bind=function(b,a){if(!b.getControl){

b._cControl=a;
b.getControl=am;
return h}

return i};











a$=m.$connect=function(a,b,c){if(c){

var d=H[c];d?b.call(a,d):(W[c]=W[c]||[]).push({func:b,caller:a})}};
























bc=m.$create=function(c,e){
e=e||{};




var d=0,b=e.element||y(),a=e.base||"";if(b.getControl)return b.getControl();












e.uid="ec-"+ ++al;

b.className+=(" "+(e.type&&e.type!=c?e.type:e.type="ec-"+c.toLowerCase())+" "+a);if(!a){




a=b.className.split(/\s+/);
e.base=a[0]||a[1]}



c=new w[bz(c.charAt(0).toUpperCase()+c.slice(1))](b,e);e.parent?c.setParent(e.parent):(a=R(s(c.getOuter())))?a.onappend&&a.onappend(c)===i||a.$append(c)===i||c.$setParent(a):c.$setParent();














Q.push(c);
aa.push(c);
c.create(e);if(e.id){


H[e.id]=c;ag&&(window[e.id]=c)}if(b=W[e.id])for(W[e.id]=j;a=b[d++];)a.func.call(a.caller,c);












return c};













o=m.$fastCreate=function(c,b,d,e){N||(B=aK);



var a=b.className.split(" ");

e=e||{};

e.uid="ec-"+ ++al;
e.type=a[0];
e.base=a[1];


c=new c(b,e);
c.$setParent(d);
c.create(e);

Q.push(c);N||(B=aL);



return c};









bA=m.$register=function(a,b){
ab[a]=b};










a6=m.calcHeightRevise=function(a){
return S?n(a.borderTopWidth)+n(a.borderBottomWidth)+n(a.paddingTop)+n(a.paddingBottom):0};












bZ=m.calcLeftRevise=function(b){

var a=F(b.offsetParent);
return!ao||a.overflow!="visible"&&F(b,"position")=="absolute"?n(a.borderLeftWidth)*_:0};











b$=m.calcTopRevise=function(b){

var a=F(b.offsetParent);
return!ao||a.overflow!="visible"&&F(b,"position")=="absolute"?n(a.borderTopWidth)*_:0};











a7=m.calcWidthRevise=function(a){
return S?n(a.borderLeftWidth)+n(a.borderRightWidth)+n(a.paddingLeft)+n(a.paddingRight):0};


















cm=m.create=function(a,e){N||(B=aK);



a=bc(a,e);
a.cache();
a.init();N||(B=aL);



return a};








a8=m.dispose=function(b){
var d=0,e=b instanceof k,c={},a;e?aX(b):z&&b0(b,z.getOuter())&&ar(R(s(b)));for(a in H)c[H[a].getUID()]=a;

















for(;a=Q[d++];)if(e?b.contain(a):b0(b,a.getOuter())){a==J&&(J=j);a==r&&(r=j);







a.dispose();
aY(aa,a);(a=c[a.getUID()])&&delete H[a];



Q.splice(--d,1)}};


















a9=m.drag=function(a,c,d){if(c.type=="mousedown"){


var b=a.getOuter(),e=b.offsetParent,f=F(e);




L(v,e.tagName=="BODY"||e.tagName=="HTML"?aG():{top:0,right:e.offsetWidth-n(f.borderLeftWidth)-n(f.borderRightWidth),bottom:e.offsetHeight-n(f.borderTopWidth)-n(f.borderBottomWidth),left:0});





L(v,d);
v.right=q(v.right-a.getWidth(),v.left);
v.bottom=q(v.bottom-a.getHeight(),v.top);
v.target=a;
ac(v);


b.style.top=a.getY()+"px";
b.style.left=a.getX()+"px";
b.style.position="absolute";u&&t.body.setCapture();a.ondragstart&&a.ondragstart(c)===i||a.$dragstart(c)}};

























G=m.event=function(c){
var a=t.body,b=s(a);if(u){



c=window.event;
c.pageX=b.scrollLeft+a.scrollLeft-b.clientLeft+c.clientX-a.clientLeft;
c.pageY=b.scrollTop+a.scrollTop-b.clientTop+c.clientY-a.clientTop;
c.target=c.srcElement;
c.which=c.keyCode;
c.stopPropagation=au;
c.preventDefault=at}


c.getTarget=an;

D=c.pageX;
E=c.pageY;

return c};










m.get=function(b){if(!H){for(a in l)T(t,a,l[a]);






H={};



var a=aV(t.body,"data-ecui");


X=a.name||X;
ag=a.globalId;

bb(t.body,"BEFOREEND",'<div style="position:absolute;overflow:scroll;top:-90px;left:-90px;width:80px;height:80px;border:1px solid"><div style="position:absolute;top:0px;height:90px"></div></div>');





a=t.body.lastChild;
S=a.offsetWidth>80;
_=a.lastChild.offsetTop;
ak=a.offsetWidth-a.clientWidth-2;
K(a);
T(window,"resize",Y);
T(window,"unload",as);
T(window,"scroll",ap);


m.init(t.body);
B=aL}

return H[b]||j};









b1=m.getAttributeName=function(){
return X};








b3=m.getFocused=function(){
return z||j};









aF=m.getKey=function(){
return I};










aT=m.getMouseX=function(a){if(a){

a=a.getOuter();
return D-ah(a).left-n(F(a,"borderLeftWidth"))}

return D};










aU=m.getMouseY=function(a){if(a){

a=a.getOuter();
return E-ah(a).top-n(F(a,"borderTopWidth"))}

return E};










aV=m.getParameters=function(b,a){
a=a||X;

var c=b.getAttribute(a),e={};if(c)for(b.removeAttribute(a);/\s*([\w-]+)\s*(:\s*|:\s*([^;\s]+(\s+[^;\s]+)*)\s*)?($|;)/.test(c);){







c=RegExp["$'"];

b=RegExp.$3;
e[bz(RegExp.$1)]=!b||b=="true"?h:b=="false"?i:isNaN(+b)?b:+b}




return e};









b4=m.getPressed=function(){
return r||j};









bq=m.getScrollNarrow=function(){
return ak};









ba=m.getStatus=function(){
return B};









m.init=function(b){
var d=0,f=[],e=b.all||b.getElementsByTagName("*"),c=[b],a;if(!N++){






B=aK;
aD(window,"resize",Y)}



for(;a=e[d++];)c[d]=a;



for(d=0;b=c[d];d++)if(s(b)){

e=aV(b);
e.element=b;e.type&&f.push(b=bc(e.type,e));for(a in ab){e[a]&&ab[a](b,e[a]);








b instanceof k&&b["$init"+a]&&b["$init"+a](e)}}





for(d=0;a=f[d++];)a.cache();


for(d=0;a=f[d++];)a.init();if(!(--N)){




T(window,"resize",Y);
B=aL}};










bs=m.intercept=function(a){
af.target=a;
ac(af)};








aW=m.isFixedSize=function(){
return S};









aX=m.loseFocus=function(a){a.contain(z)&&ar(a.getParent())};













V=m.mask=function(b,c){

var d=0,a=aG(),g=q(a.top-a.height*2,0),f=q(a.left-a.width*2,0),e=";top:"+g+"px;left:"+f+"px;width:"+x(a.width*5,a.maxWidth-f)+"px;height:"+x(a.height*5,a.maxHeight-g)+"px;display:";if("boolean"==typeof b){









e+=b?"block":"none";
for(;a=P[d++];)a.style.cssText+=e}else if(b===p){




K(P.pop());P.length||bx(t.body,"mask")}else{P.length||bp(t.body,"mask");








P.push(a=t.body.appendChild(y("","position:absolute;background-color:#000;z-index:"+(c||32767))));



by(a,"opacity",b);
a.style.cssText+=(e+"block")}};














bw=m.query=function(b){
b=b||{};


for(var 
d=0,e=[],c=b.custom,a;a=aa[d++];)(!b.type||a instanceof b.type)&&(b.parent===p||a.getParent()==b.parent)&&(!c||c(a))&&e.push(a);












return e};







aq=m.restore=function(){
$(l,h);
$(l=ad.pop())};












m.select=function(a,c,d){
function e(b){
A["$zoom"+b]=function(c){a["onselect"+b]&&a["onselect"+b](c)===i||a["$select"+b](c)}}if(c.type=="mousedown"){if(!A){









bb(t.body,"BEFOREEND",'<div class="ec-control ec-selector" style="overflow:hidden"><div class="ec-selector-box"></div></div>');





A=o(k,t.body.lastChild);

A.$setSize=function(a,c){

var b=this.getOuter().firstChild;

g.$setSize.call(this,a,c);

b.style.width=q(1,a-a7(b))+"px";
b.style.height=q(1,c-a6(b))+"px"}}



e("start");
e("");
e("end");


A.setPosition(D,E);
A.setSize(1,1);
A.setClass(d||"ec-selector");
A.show();

m.zoom(A,c)}


c=j};









ar=m.setFocused=function(a){
var b=ae(z,a);


C(z,"blur",j,b);
C(z=a,"focus",j,b);


I=-I};















m.zoom=function(a,c,b){if(c.type=="mousedown"){


a.getOuter().style.position="absolute";b&&L(M,b);





M.top=a.getY();
M.left=a.getX();
M.width=a.getWidth();
M.height=a.getHeight();
M.target=a;
ac(M);u&&t.body.setCapture();a.onzoomstart&&a.onzoomstart(c)===i||a.$zoomstart(c)}};
















l.keydown=l.keypress=l.keyup=function(c){
c=G(c);



c.type=="keydown"&&Math.abs(I)!=c.which&&(I=c.which);





for(var a=z;a;a=a.getParent())if(a[c.type](c)===i){

c.preventDefault();
break}c.type=="keyup"&&Math.abs(I)==c.which&&(I=0)};if(u){















l.dblclick=function(c){
l.mousedown(c);
l.mouseup(c)};


l.selectstart=function(c){
c=G(c);
U(R(c.target),c,h)}}









l[ao?"DOMMouseScroll":"mousewheel"]=function(c){
c=G(c);c.detail===p&&(c.detail=c.wheelDelta/-40);(l.type=="drag"||C(J,"mousewheel",c)===i||C(z,"mousewheel",c)===i)&&c.preventDefault()};



















function U(a,c,b){if(!b){

C(r=a,"mousedown",c);
r.pressstart(c)}

for(;a;a=a.getParent())a.isSelectStart()&&c.preventDefault()}
















function C(a,b,c,d){
for(;a!=d;a=a.getParent())if(a[b](c)===i)return i}














function ae(a,b){if(a!=b){

var d=0,c=[],e=[];




for(;a;a=a.getParent())c.push(a);


for(;b;b=b.getParent())e.push(b);



c.reverse();
e.reverse();


for(;c[d]==e[d];d++);
a=c[d-1]}


return a||j}









function am(){
return this._cControl}








function an(){
var a=R(this.target);if(a&&a.isEnabled()){for(;a;a=a.getParent())if(a.isCapture())return a};







return j}









function ai(c){
var a=c.target,b=ah(a),d=F(a);


return c.pageX-b.left-n(d.borderLeftWidth)>=a.clientWidth!=c.pageY-b.top-n(d.borderTopWidth)>=a.clientHeight}







function ap(){
V(h)}






function as(){
for(var d=0,a;a=Q[d++];)try{a.dispose()}catch(b){}








t=P=j}






function at(){
this.returnValue=i}








function ac(b){
var a={};
$(l,h);

L(a,l);
L(a,b);
a.x=D;
a.y=E;
$(a);

ad.push(l);
l=a}









function $(b,c){
for(var d=0,e=c?aD:T,a;d<5;)b[a=aR[d++]]&&e(t,a,b[a])}










function au(){
this.cancelBubble=h}


cr(m.get)})();



















































g.$blur=function(){
this.alterClass("focus",h)};










g.$cache=function(c,e){

for(var 
d=0,f=["borderTopWidth","borderLeftWidth","borderRightWidth","borderBottomWidth","paddingTop","paddingLeft","paddingRight","paddingBottom"],b=this._eBase,g=aW(),a;a=f[d++];)this["$cache$"+a]=n(c[a]);












this.$cache$position=c.position;if(e!==i){


this._nWidth=b.offsetWidth||n(c.width||b.style.width)+(g?this.getInvalidWidth(h):0);


this._nHeight=b.offsetHeight||n(c.height||b.style.height)+(g?this.getInvalidHeight(h):0)}};










g.$dispose=function(){
this._eBase.getControl=p;
this._eBase=this._eBody=j;
this.$ready=O};







g.$focus=function(){
this.alterClass("focus")};










g.$getSection=function(a){
return this["_u"+a]};






g.$hide=function(){if(this._sDisplay===p){

var a=this.getOuter().style;

this._sDisplay=a.display;
a.display="none";

aX(this)}};








g.$init=function(){
this.alterClass("disabled",this._bEnabled);
this.$setSize(this.getWidth(),this.getHeight());if(this.$ready)if(ba()!=aK||au===j)this.$ready();else{if(!au){







au=[];
Z(function(){
for(var d=0,a;a=au[d++];)a.$ready();


au=j})}


au.push(this)}};









g.$locate=function(){this.$cache$position!="absolute"&&(this._eBase.style.position=this.$cache$position="relative")};












g.$mouseout=function(){
this.alterClass("over",h)};









g.$mouseover=function(){
this.alterClass("over")};









g.$pressend=g.$pressout=function(){
this.alterClass("press",h)};









g.$pressover=g.$pressstart=function(){
this.alterClass("press")};






g.$resize=function(){


var b=this._eBase;


b.style.width=this._sWidth;if(u<8&&ba()!=bB){


var a=F(b);if(a.width=="auto"&&a.display=="block"){

b.style.width="100%";
b.style.width=b.offsetWidth-(aW()?this.getInvalidWidth(h)*2:0)+"px"}}


b.style.height=this._sHeight;
this.paint()};









g.$setBody=function(b){
this._eBody=b};








g.$setBodyHTML=function(a){
this._eBody.innerHTML=a};









g.$setParent=function(a){
this._cParent=a};










g.$setSize=function(a,b){

var c=aW();if(a){



this._eBase.style.width=a-(c?this.getInvalidWidth(h):0)+"px";
this._nWidth=a}if(b){



this._eBase.style.height=b-(c?this.getInvalidHeight(h):0)+"px";
this._nHeight=b}};







g.$show=function(){
this.getOuter().style.display=this._sDisplay||"";
this._sDisplay=p};









g.alterClass=function(a,b){
a="-"+a+" ";

(b?bx:bp)(this._eBase,this._sType+a+this._sClass+a);b?aY(this._aStatus,a):this._aStatus.push(a)};




















g.cache=function(a,b){if(b||!this._bCache){

this._bCache=h;
this.$cache(F(this._eBase),a)}};








g.clearCache=function(){
this._bCache=i};










g.contain=function(a){
for(;a;a=a._cParent)if(a==this)return h;




return i};







g.dispose=function(){try{this.ondispose&&this.ondispose()}catch(a){}







this.$dispose()};









g.getBase=function(){
return this._eBase};









g.getBaseClass=function(){
return this._sBaseClass};









g.getBody=function(){
return this._eBody};









g.getBodyHeight=function(){
return this.getHeight(h)-this.getInvalidHeight(h)};









g.getBodyWidth=function(){
return this.getWidth(h)-this.getInvalidWidth(h)};









g.getClass=function(){
return this._sClass};








g.getHeight=function(){
this.cache();
return this._nHeight};








g.getInvalidHeight=function(){
this.cache();
return this.$cache$borderTopWidth+this.$cache$borderBottomWidth+this.$cache$paddingTop+this.$cache$paddingBottom};









g.getInvalidWidth=function(){
this.cache();
return this.$cache$borderLeftWidth+this.$cache$borderRightWidth+this.$cache$paddingLeft+this.$cache$paddingRight};










g.getOuter=function(){
return this._eBase};








g.getParent=function(){
return this._cParent||j};









g.getType=function(){
return this._sType};









g.getUID=function(){
return this._sUID};








g.getWidth=function(){
this.cache();
return this._nWidth};









g.getX=function(){
var b=this.getOuter();

return this.isShow()?b.offsetLeft-bZ(b):0};









g.getY=function(){
var b=this.getOuter();

return this.isShow()?b.offsetTop-b$(b):0};









g.hide=function(){this.isShow()&&(this.onhide&&this.onhide()===i||this.$hide())};














g.isCapture=function(){
return this._bCapture};









g.isEnabled=function(){

return this._bEnabled&&(!this._cParent||this._cParent.isEnabled())};









g.isFocusable=function(){
return this._bFocusable};








g.isSelectStart=function(){
return this._bSelect};








g.isShow=function(){
return!(!this.getOuter().offsetWidth)};







g.paint=function(){
this.cache(h,h);
this.$setSize(this.getWidth(),this.getHeight())};










g.setBodySize=function(a,b){
this.setSize(a&&a+this.getInvalidWidth(),b&&b+this.getInvalidHeight())};









g.setCapture=function(a){
this._bCapture=a!==i};









g.setClass=function(a){
var b=this._sClass,c=this._sType;


a=a||this._sBaseClass;if(a!=b){



this._eBase.className=this._aStatus.join(c)+this._aStatus.join(a)+this._eBase.className.replace(new RegExp("^\\s+|("+b+"|"+c+")(-[^\\s]+)?(\\s+|$)|\\s+$","g"),"");






this._sClass=a}};










g.setEnabled=function(a){
a=a!==i;if(this._bEnabled!=a){



this.alterClass("disabled",a);a||aX(this);




this._bEnabled=a}};










g.setFocusable=function(a){
this._bFocusable=a!==i};









g.setParent=function(a){
var d=this._cParent,b=this.getOuter(),c;if(a)if(a instanceof k)c=a._eBody;else{









c=a;
a=R(a)}if(a!=d||c!=s(b)){if(d){d.onremove&&d.onremove(this);









d.$remove(this)}if(a){if(a.onappend&&a.onappend(this)===i||a.$append(this)===i)a=c=j};c?c.appendChild(b):K(b);













this.$setParent(a);
this.clearCache()}};











g.setPosition=function(a,b){
var c=this.getOuter().style;
c.left=a+"px";
c.top=b+"px"};









g.setSize=function(a,b){



this.$setSize(a,b);a&&(this._sWidth=this._eBase.style.width);b&&(this._sHeight=this._eBase.style.height)};













g.show=function(){this.isShow()||this.onshow&&this.onshow()===i||this.$show()};







(function(){
function b(a,b){
g[a]=function(c){if(b||this.isEnabled()){if(this["on"+a]&&this["on"+a](c)===i||this["$"+a](c)===i)return i}};








g["$"+a]=g["$"+a]||O}



for(var d=0,a;a=aR[d++];)b(a,d>17||d==10);




g.$intercept=g.$append=g.$remove=g.$selectstart=g.$select=g.$selectend=g.$zoomstart=g.$zoom=g.$zoomend=g.$dragstart=g.$dragmove=g.$dragend=O})();























bI.$click=function(c){
g.$click.call(this,c);


this._cFor&&this._cFor.click(c)};












bI.setFor=function(a){
this._cFor=a};




















bj.$dispose=function(){
this._eText=this._eMask=j;
g.$dispose.call(this)};









bj.$setSize=function(a,b){
g.$setSize.call(this,a,b);
this.$locate();





this._eText.style.width=this._eMask.style.width=this.getBodyWidth()+"px";
this._eText.style.height=this._eMask.style.height=this.getBodyHeight()+"px"};









bj.setText=function(a,b){
a=x(q(0,a),1);b!==p&&(this._eText.innerHTML=this._eMask.innerHTML=b||aM(a*100)+"%");



this._eMask.style.clip="rect(0px,"+N(a*this.getBodyWidth())+"px,"+this.getBodyHeight()+"px,0px)"};


































cd.$pressstart=function(c){
g.$pressstart.call(this,c);
a9(this.getParent(),c)};








cc.$click=function(c){
g.$click.call(this,c);
this.getParent().hide()};










ab.$cache=function(a,b){
g.$cache.call(this,a,b);

a=F(this.getBase().lastChild);
this.$cache$mainWidthRevise=a7(a);
this.$cache$mainHeightRevise=a6(a);
this._uTitle.cache(h,h);
this._uClose.cache(h,h)};







ab.$focus=function(){
g.$focus.call(this);

var d=J(aP,this),a;if(this.getOuter().style.zIndex<32768){




aP.push(aP.splice(d,1)[0]);
for(;a=aP[d++];)a.getOuter().style.zIndex=4095+d}};










ab.$hide=function(){
g.$hide.call(this);this.getOuter().style.zIndex==32768&&V()};










ab.$init=function(){
g.$init.call(this);
this._uTitle.$init();
this._uClose.$init();this._bHide&&this.$hide()};












ab.$setSize=function(a,b){
g.$setSize.call(this,a,b);
this.$locate();

var c=this.getBase().lastChild.style;

c.width=this.getBodyWidth()-this.$cache$mainWidthRevise+"px";
c.height=this.getBodyHeight()-this.$cache$mainHeightRevise+"px";this._bAuto&&this._uTitle.$setSize(this.getBodyWidth())};









ab.center=function(){
a=this.getOuter().offsetParent;if(a.tagName=="BODY"||a.tagName=="HTML")var 


a=aG(),b=a.right+a.left,c=a.bottom+a.top;else{




b=a.offsetWidth;
c=a.offsetHeight}


this.setPosition((b-this.getWidth())/2,(c-this.getHeight())/2)};








ab.setTitle=function(a){
this._uTitle.$setBodyHTML(a||"")};









ab.show=function(){this.contain(b3())||ar(this);



return g.show.call(this)};









ab.showModal=function(a){
this.show();
this.getOuter().style.zIndex=32768;
V(a!==p?a:.05)};























bF.getIndex=function(){
return J(this.getParent()._aItem,this)};










aO.$cache=function(a,b){
g.$cache.call(this,a,b);


for(a=0;b=this._aItem[a++];)b.cache(i,h)};












aO.getItem=function(a){
return this._aItem[a]};







(function(){
function b(b){
aO[b]=O;
bF[b]=function(c){
var a=this.getParent();this.isEnabled()&&(a["on"+b]&&a["on"+b].call(this,c)===i||a["$"+b].call(this,c))}}







for(var d=0;d<13;)b(aR[d++])})();































ca.$click=function(c){
aO.$click.call(this,c);
var a=this.getParent().getParent();a.ondateclick&&a.ondateclick(c,new Date(a._nYear,a._nMonth,this._nDay))};













ak.$cache=function(a,b){
g.$cache.call(this,a,b);
this._uName.cache(h,h);
this._uDate.cache(h,h)};







ak.$init=function(){
g.$init.call(this);
this._uName.$init()};










ak.$setSize=function(a,b){
g.$setSize.call(this,a);



for(var 
d=0,c=N((a-this.getInvalidWidth(h))/7),e=N((b-this.getInvalidHeight(h)-this._uName.getHeight())/6);d<7;)this._uName.getItem(d++).$setSize(c);








for(d=0;d<42;)this._uDate.getItem(d++).$setSize(c,e);



this._uName.$setSize(c*7);
this._uDate.$setSize(c*7)};








ak.getMonth=function(){
return this._nMonth+1};








ak.getYear=function(){
return this._nYear};









ak.move=function(a){
var b=new Date(this._nYear,this._nMonth+a,1);
this.setDate(b.getFullYear(),b.getMonth()+1)};









ak.setDate=function(b,c){

var d=0,g=new Date(),b=b||g.getFullYear(),c=c?c-1:g.getMonth(),a=new Date(b,c,0),e=1-(a.getDay()+1)%7,h=a.getDate(),f=new Date(b,c+1,0).getDate();if(this._nYear!=b||this._nMonth!=c){












this._nYear=b;
this._nMonth=c;

for(;c=this._uDate.getItem(d++);){

c.setEnabled(b=e>0&&e<=f);
ct(c.getBody(),b?e:e>f?e-f:h+e);



c._nDay=e++}


b=this._uDate.getItem(35).isEnabled();
for(d=35;d<42;)this._uDate.getItem(d++).alterClass("extra",b);



this.change()}};
























function aC(a,b){









function e(a,c){
for(;a;a=a.constructor.superClass)if(a[b]==c){

for(;a=a.constructor.superClass;)if(a[b]!=c)return a[b];




return j}}





var d=aC.caller,c=e(a.constructor.prototype,d);c===p&&(c=e(a.constructor.prototype,d.caller));if(c)return c.apply(a,d["arguments"])}




















P.$click=function(c){
g.$click.call(this,c);

var a=this.getParent();a&&a.onitemclick&&a.onitemclick(c,J(r[a.getUID()],this))};












P.$mouseover=function(c){
g.$mouseover.call(this,c);
this.getParent().$setActived(this)};










r.$append=function(a){if(!(a instanceof(aS(this,"Item")||w.Item))||aC(this,"$append")===i)return i;




r[this.getUID()].push(a);
this.$alterItems()};










r.$cache=function(b,c){
aC(this,"$cache");

for(var d=0,f=r[this.getUID()],a;a=f[d++];)a.cache(h,h)};









r.$init=function(){
aC(this,"$init");
this.$alterItems()};







r.$initItems=function(){
this.$alterItems=O;


r[this.getUID()]=[];


for(var d=0,f=U(this.getBody()),a;a=f[d++];)this.add(a);



delete this.$alterItems};









r.$remove=function(a){
aC(this,"$remove");
aY(r[this.getUID()],a);
this.$alterItems()};









r.$setActived=function(a){
var f=r[this.getUID()],b=f._cActive;if(b!=a){b&&b.alterClass("active",h);a&&a.alterClass("active");









f._cActive=a}};













r.add=function(b,c,e){
var f=r[this.getUID()],a;if(b instanceof w.Item)b.setParent(this);else{if("string"==typeof b){









this.getBody().appendChild(a=y());
a.innerHTML=b;
b=a}


b.className="ec-item "+(aI(b.className)||this.getBaseClass()+"-item");

e=e||aV(b);
e.parent=this;
e.select=i;
f.push(b=o(aS(this,"Item")||w.Item,b,this,e));
this.$alterItems()}if(b.getParent()&&(a=f[c])&&a!=b){




ai(b.getOuter(),a.getOuter());
f.splice(c,0,f.pop())}


return b};











r.append=function(a,e){
this.add(a,p,e)};







r.dispose=function(){
delete r[this.getUID()];
aC(this,"dispose")};








r.getActived=function(){
return r[this.getUID()]._cActive||j};








r.getItems=function(){
return r[this.getUID()].slice()};









r.remove=function(a){"number"==typeof a&&(a=r[this.getUID()][a]);a&&a.setParent();






return a||j};









r.setItemSize=function(b,c){
for(var d=0,f=r[this.getUID()],a;a=f[d++];)a.$setSize(b,c)};












































function bS(a){a&&a.setClass(a.getBaseClass()+(a.getItems().length?"-complex":""))}





L(Q,r);







ch.$click=function(c){
g.$click.call(this,c);


var a=this.getParent(),e=a.getBody().style,f=a.getItems(),b=f[0].getHeight(),d=a._uPrev.getHeight(),h=(n(e.top)-d)/b;







a.$setActived();
e.top=x(q(a._uPrev==this?++h:--h,a._nOptionSize-f.length),0)*b+d+"px"};









am.$click=function(c){
P.$click.call(this,c);this.getItems().length||a1.hide()};











am.$mouseout=function(c){
P.$mouseout.call(this,c);this.getItems().length||this.getParent().$setActived()};











am.$mouseover=function(c){

P.$mouseover.call(this,c);

var a=aG(),e=this._cPopup,f=this.getParent(),i=f._cSuperior,b=f._cInferior,h=ah(this.getOuter()),d=h.left,g;if(b!=e){b&&b.hide();if(this.getItems().length){















e.show();


g=e.getWidth();
b=d+this.getWidth()-4;
d-=g-4;


e.setPosition(b+g>a.right||i&&i.getX()>f.getX()&&d>a.left?d:b,h.top-4)}}};














am.$pressend=function(c){
P.$pressend.call(this,c);this.contain(c.getTarget())||a1.hide()};














am.add=function(a,b){
return (this._cPopup=this._cPopup||o(w.Popup,y("ec-popup "+this.getParent().getBaseClass()),this)).add(a,b)};










am.getItems=function(){
return this._cPopup&&this._cPopup.getItems()||[]};









am.remove=function(a){
return this._cPopup&&this._cPopup.remove(a)};







Q.$alterItems=function(){
bS(this.getParent());if(s(this.getOuter())){



var f=this.getItems(),g=f.length,a=g&&f[0].getHeight(),c=this._uPrev,b=this._uNext,d=0,e=this.getBodyWidth();








this.setItemSize(e,a);

a*=x(this._nOptionSize,g);if(this._nOptionSize)if(g>this._nOptionSize){


c.show();
b.show();
c.$setSize(e);
b.$setSize(e);


d=c.getHeight();
b.setPosition(0,d+a);
a+=d+b.getHeight()}else{


c.hide();
b.hide()}



this.getBody().style.top=d+"px";
this.setBodySize(0,a)}};











Q.$cache=function(a,b){
r.$cache.call(this,a,b);this._uPrev&&this._uPrev.cache(h,h);this._uNext&&this._uNext.cache(h,h)};














Q.$hide=function(){
g.$hide.call(this);if(al=this._cSuperior){


this._cSuperior=j;
al._cInferior=j}else aq()};













Q.$intercept=function(c){R(c.target) instanceof w.Popup.Item||a1.hide();



return i};









Q.$setActived=function(a){
r.$setActived.call(this,a);a||this._cInferior&&this._cInferior.hide()};












Q.$show=function(){
g.$show.call(this);


this.$setActived();

var a=aG(),b=this.getOuter(),c;if(!s(b)){




t.body.appendChild(b);
this.$alterItems()}


c=ah(b);


this.setPosition(x(q(c.left,a.left),a.right-this.getWidth()),x(q(c.top,a.top),a.bottom-this.getHeight()));if(al){






b.style.zIndex=n(F(al.getOuter(),"zIndex"))+1;
this._cSuperior=al;
al._cInferior=this}else{



b.style.zIndex=32768;
bs(a1=this)}


al=this};










Q.cache=function(a,b){s(this.getOuter())&&g.cache.call(this,a,b)};










Q.dispose=function(){
this.hide();
r.dispose.call(this)};









Q.getInferior=function(){
return this._cInferior};









Q.getSuperior=function(){
return this._cSuperior};







Q.paint=function(){s(this.getOuter())&&g.paint.call(this)};












Q.setParent=O;







































function bn(a){
var b=n(a.getBody().style.left);

a._uPrev.setEnabled(b<a._uPrev.getWidth());
a._uNext.setEnabled(b>a.getBodyWidth()-a.$cache$bodyWidth-a._uNext.getWidth())}




L(ad,r);







cl.$click=function(c){
g.$click.call(this,c);


var a=this.getParent(),d=a.getBody().style,b=a.$getLeftMostIndex();




b=x(q(0,b+(a._uPrev==this?n(d.left)!=a._aPosition[b]?0:-1:1)),a._aPosition.length-1);



d.left=q(a._aPosition[b],a.getBodyWidth()-a.$cache$bodyWidth-a._uNext.getWidth())+"px";

bn(a)};










az.$cache=function(a,b){
P.$cache.call(this,a,b);

this.$cache$marginLeft=n(a.marginLeft);
this.$cache$marginRight=n(a.marginRight)};









az.$click=function(c){
P.$click.call(this,c);
this.getParent().setSelected(this)};







az.$dispose=function(){
this._eContent=j;
P.$dispose.call(this)};








az.$setParent=function(a){

var b=this._eContent;

P.$setParent.call(this,a);b&&(a?a.getBase().appendChild(b):K(b))};
















az.getContent=function(){
return this._eContent};








az.setContent=function(b){
this._eContent=b;b&&(this._sContentDisplay=b.style.display)};










ad.$alterItems=function(){this._aPosition&&this.$setSize(this.getWidth());





for(var 
d=0,f=this.getItems(),c=this._aPosition=[this._uPrev.getWidth()],b={$cache$marginRight:0},a;a=f[d++];b=a)c[d]=c[d-1]-q(b.$cache$marginRight,a.$cache$marginLeft)-a.getWidth()};



















ad.$cache=function(a,b){
r.$cache.call(this,a,b);

this._uPrev.cache(h,h);
this._uNext.cache(h,h);

this.$cache$bodyWidth=this.getBody().offsetWidth};








ad.$getLeftMostIndex=function(){
for(var b=n(this.getBody().style.left),a=this._aPosition,d=a.length;d--;)if(b<=a[d])return d};











ad.$init=function(){
this._uPrev.$init();
this._uNext.$init();
r.$init.call(this);
for(var d=0,f=this.getItems(),a;a=f[d++];)a.$setSize(a.getWidth(),a.getHeight());


this.setSelected(this._oSelected)};









ad.$remove=function(a){if(this._cSelected==a){

var f=this.getItems(),b=J(f,a);



this.setSelected(b==f.length-1?b-1:b+1)}


r.$remove.call(this,a)};









ad.$setSize=function(a,b){
g.$setSize.call(this,a,b);



var c=this._uNext,d=this.getBody().style;



a=this.getBodyWidth();if(this.$cache$bodyWidth>a){

a-=c.getWidth();
c.getOuter().style.left=a+"px";if(this._bButton){



a-=this.$cache$bodyWidth;n(d.left)<a&&(d.left=a+"px")}else{





this._uPrev.$show();
c.$show();
d.left=this._uPrev.getWidth()+"px";
this._bButton=h}


bn(this)}else if(this._bButton){


this._uPrev.$hide();
c.$hide();
d.left="0px";
this._bButton=i}};








ad.getSelected=function(){
return this._cSelected};








ad.setSelected=function(b){

var d=0,f=this.getItems(),c=this.getBody().style,e=n(c.left),a;"number"==typeof b&&(b=f[b]);if(this._cSelected!=b){










for(;a=f[d++];)a._eContent&&(a._eContent.style.display=a==b?a._sContentDisplay:"none");this._cSelected&&this._cSelected.alterClass("selected",h);if(b){










b.alterClass("selected");
a=this._aPosition[J(f,b)]-(this._uPrev.isShow()?0:this._uPrev.getWidth());if(e<a)c.left=a+"px";else{




a-=b.getWidth()+this._uPrev.getWidth()+this._uNext.getWidth()-this.getBodyWidth();e>a&&(c.left=a+"px")}




bn(this)}


this._cSelected=b;
this.change()}};






























function bH(c){
c=G(c);



for(var d=0,f=c.target.elements,a;a=f[d++];)if(a.getControl){

a=a.getControl();a.onsubmit&&a.onsubmit(c)===i||a.$submit(c)}}













function bG(a){if(aZ(a._eInput,a)){if(!a._bHidden)for(var b in X)T(a._eInput,b,X[b])}}















X.blur=X.focus=function(c){



c=R(G(c).target);

c["$"+c.type]=g["$"+c.type];c.type=="blur"?c.isEnabled()&&aX(c):c.isEnabled()?ar(c):c._eInput.blur();














delete c["$"+c.type]};









X.dragover=X.drop=function(c){
c=G(c);
c.stopPropagation();
c.preventDefault()};u?(X.propertychange=function(c){c.propertyName=="value"&&R(G(c).target).change()}):X.input=function(){

















R(this).change()};








v.$dispose=function(){
this._eInput.getControl=p;
this._eInput=j;
g.$dispose.call(this)};








v.$setParent=function(a){
g.$setParent.call(this,a);if(a=this._eInput.form){

aD(a,"submit",bH);
T(a,"submit",bH)}};










v.$setSize=function(a,b){
g.$setSize.call(this,a,b);
this._eInput.style.width=this.getBodyWidth()+"px";
this._eInput.style.height=this.getBodyHeight()+"px"};








v.$submit=O;







v.getInput=function(){
return this._eInput};









v.getName=function(){
return this._eInput.name};








v.getSelectionEnd=u?function(){
var a=t.selection.createRange().duplicate();

a.moveStart("character",-this._eInput.value.length);
return a.text.length}:function(){

return this._eInput.selectionEnd};








v.getSelectionStart=u?function(){

var a=t.selection.createRange().duplicate();


a.moveEnd("character",this._eInput.value.length);
return this._eInput.value.length-a.text.length}:function(){

return this._eInput.selectionStart};









v.getValue=function(){
return this._eInput.value};








v.setCaret=u?function(a){
var b=this._eInput.createTextRange();
b.collapse();
b.select();
b.moveStart("character",a);
b.collapse();
b.select()}:function(a){

this._eInput.setSelectionRange(a,a)};









v.setName=function(a){
this._eInput=aj(this._eInput,a||"");
bG(this)};









v.setValue=function(a){

var b=X.propertychange;b&&aD(this._eInput,"propertychange",b);




this._eInput.value=a;b&&T(this._eInput,"propertychange",b)};





(function(){
function a(a){
v["$"+a]=function(){
g["$"+a].call(this);

Z(function(){

if(this._eInput){

aD(this._eInput,a,X.blur);try{this._eInput[a]()}catch(b){}





T(this._eInput,a,X.blur)}},0,this)}}





a("blur");
a("focus")})();



































Y.$blur=function(){
v.$blur.call(this);
this.validate()};








Y.$getInputText=function(){
return this._sInput};









Y.$keydown=Y.$mousemove=function(c){
v["$"+c.type].call(this,c);

var a=this.getInput().value,d=this.getSelectionStart(),b=this.getSelectionEnd();



this._aSegment=[a.slice(0,d),a.slice(d,b),a.slice(b)]};








Y.$submit=function(c){
v.$submit.call(this,c);this.validate()||c.preventDefault()};









Y.change=function(){








var a=this.getValue(),c=this._nMaxLength,d=this._nMaxValue,b=a.length-this._aSegment[2].length;if(a=b<0?p:a.slice(this._aSegment[0].length,b)){this._bSymbol&&(a=cv(a));this._bTrim&&(a=aI(a));this._oKeyMask&&(a=(a.match(this._oKeyMask)||[]).join(""));c&&(a=cu(a,c-b2(this._aSegment[0]+this._aSegment[2],this._sCharset),this._sCharset));if(!a){

































this.restore();
return}d===p||d>=+(this._aSegment[0]+a+this._aSegment[2])||(a=this._aSegment[1]);







this.setValue(this._aSegment[0]+a+this._aSegment[2]);
this.setCaret(this._aSegment[0].length+a.length)}

this._sInput=a;

v.change.call(this)};






Y.restore=function(){
this.setValue(this._aSegment.join(""));
this.setCaret(this._aSegment[0].length)};








Y.validate=function(){





var b={},c=this.getValue(),d=b2(c,this._sCharset),a=h;if(this._nMinLength>d){










b.minLength=this._nMinLength;
a=i}if(this._nMaxLength<d){


b.maxLength=this._nMaxLength;
a=i}if(this._nMinValue>+c){


b.minValue=this._nMinValue;
a=i}if(this._nMaxValue<+c){


b.maxValue=this._nMaxValue;
a=i}if(this._oFormat&&!this._oFormat.test(c)){


b.format=h;
a=i}a||this.onerror&&this.onerror(b);







return a};































function be(a,b){if(b!==a._nStatus){


a.setClass(a.getBaseClass()+["-checked","","-part"][b]);

a._nStatus=b;
a.getInput().checked=!b;a._cSuperior&&bf(a._cSuperior);






a.change()}}









function bf(b){
for(var d=0,c,a;a=b._aInferior[d++];){if(c!==p&&c!=a._nStatus){

c=2;
break}

c=a._nStatus}c!==p&&be(b,c)}














W.$click=function(c){
v.$click.call(this,c);
this.setChecked(!(!this._nStatus))};









W.$keydown=W.$keypress=W.$keyup=function(c){
v["$"+c.type].call(this,c);if(c.which==32){c.type=="keyup"&&aF()==32&&this.setChecked(!(!this._nStatus));




return i}};








W.$ready=function(){this._aInferior.length||be(this,this.getInput().checked?0:1)};












W.$setParent=function(a){
v.$setParent.call(this,a);!a&&ba()!=aK&&this.setSuperior()};












W.getInferiors=function(){
return this._aInferior.slice()};









W.getSuperior=function(){
return this._cSuperior||j};








W.isChecked=function(){
return!this._nStatus};








W.setChecked=function(b){
be(this,b!==i?0:1);

for(var d=0,a;a=this._aInferior[d++];)a.setChecked(b)};











W.setSuperior=function(a){
var b=this._cSuperior;if(b!=a){

this._cSuperior=a;if(b){



aY(b._aInferior,this);
bf(b)}if(a){



a._aInferior.push(this);
bf(a)}}};
























function bT(a,b){b!==p&&(a.getInput().checked=b);



a.setClass(a.getBaseClass()+(a.isChecked()?"-checked":""))}









af.$click=function(c){
v.$click.call(this,c);
this.checked()};









af.$keydown=af.$keypress=af.$keyup=function(c){
v["$"+c.type].call(this,c);if(c.which==32){c.type=="keyup"&&aF()==32&&this.checked();




return i}};








af.$ready=function(){
bT(this)};







af.checked=function(){if(!this.isChecked())for(var 

d=0,f=this.getItems(),a;a=f[d++];)bT(a,a==this)};












af.getItems=function(){

var d=0,f=this.getInput(),a=f.name,b=[];if(f.form)for(f=f.form[a];a=f[d++];)a.getControl&&b.push(a.getControl());else if(a)return bw({type:w.Radio,custom:function(b){














return!b.getInput().form&&b.getName()==a}});else return[this]};













af.isChecked=function(){
return this.getInput().checked};

































function bX(a,b){
a._eItems=b;
b.className=a.getType()+"-items "+a.getBaseClass()+"-items";
b.style.cssText="";
return b}








function a5(a){
a.setClass(a.getBaseClass()+(a._aTree.length?a._bFold?"-fold":"-nonleaf":""))}













function bW(b,a,e){
b.className=a.getType()+" "+(aI(b.className)||a.getBaseClass());
return o(a.constructor,b,j,L(L({},e),aV(b)))}









function bo(b,c){
for(var d=0,a;a=b._aTree[d++];){
a.setFold(c);
bo(a,c)}}










B.$click=function(c){
g.$click.call(this,c);
this.setFold(!this.isFold())};






B.$cache=B.$resize=B.$setSize=O;





B.$dispose=function(){
this._eItems=j;
g.$dispose.call(this)};







B.$hide=function(){
g.$hide.call(this);this._eItems&&(this._eItems.style.display="none")};











B.$init=function(){
g.$init.call(this);
for(var d=0,f=this._aTree,a;a=f[d++];)a.$init()};










B.$setParent=function(a){
var b=this.getParent();

g.$setParent.call(this,a);if(b instanceof w.Tree){


aY(b._aTree,this);
a5(b)}this._eItems&&co(this._eItems,this.getOuter())};












B.$show=function(){
g.$show.call(this);this._eItems&&!this._bFold&&(this._eItems.style.display="block");





for(var a=this;a=a.getParent();)a.setFold(i)};













B.add=function(b,c,e){
var f=this._aTree,a;if("string"==typeof b){



a=y();
a.innerHTML=b;
b=bW(a,this,e)}if(a=f[c])a=a.getOuter();else{






c=f.length;
a=j}

f.splice(c,0,b);
(this._eItems||bX(this,y())).insertBefore(b.getOuter(),a);

b.$setParent(this);
a5(this);

return b};







B.collapse=function(){
bo(this)};







B.expand=function(){
bo(this,i)};









B.getChildTrees=function(){
return this._aTree.slice()};








B.getFirst=function(){
return this._aTree[0]||j};








B.getLast=function(){
return this._aTree[this._aTree.length-1]||j};








B.getNext=function(){
var a=this.getParent();
return a instanceof w.Tree&&a._aTree[J(a._aTree,this)+1]||j};








B.getPrev=function(){
var a=this.getParent();
return a instanceof w.Tree&&a._aTree[J(a._aTree,this)-1]||j};








B.getRoot=function(){
for(var 
a=this,b;(b=a.getParent())instanceof w.Tree&&J(b._aTree,a)>=0;a=b);




return a};








B.isFold=function(){
return!this._eItems||this._bFold};









B.setFold=function(a){if(this._eItems){

this._eItems.style.display=(this._bFold=a!==i)?"none":"block";
a5(this)}};
































function ci(a,b){
a.getBody().appendChild(a._eInput=aj(b,a._sName,"hidden"));
a._eInput.value=a._sValue}








ax.$click=function(c){if(aT(this)<=n(F(this.getBase(),"paddingLeft"))){

var b=this.getRoot(),a=b._cSelected;if(a!=this){if(a){




a.alterClass("selected",h);
a=a._eInput}

ci(this,a);
this.alterClass("selected");
b._cSelected=this}


this.setFold=O}


B.$click.call(this,c);
delete this.setFold};







ax.$dispose=function(){
this._eInput=j;
B.$dispose.call(this)};








ax.$setParent=function(a){
var c=this.getRoot(),b=c._cSelected;


B.$setParent.call(this,a);if(this==b){


b.alterClass("selected",h);b._eInput&&K(b._eInput);



c._cSelected=j}


b=this._cSelected;if(b){

b.alterClass("selected",h);b._eInput&&K(b._eInput);



this._cSelected=j}};









ax.getName=function(){
return this._sName};








ax.getSelected=function(){
return this.getRoot()._cSelected};








ax.getValue=function(){
return this._sValue};
































at.$cache=function(a,b){
B.$cache.call(this,a,b);
this._uCheckbox.cache(h,h)};







at.$init=function(){
B.$init.call(this);
this._uCheckbox.$init()};








at.getChecked=function(){
for(var d=0,f=this.getChildTrees(),b=this.isChecked()?[this]:[],a;a=f[d++];)b=b.concat(a.getChecked());


return b};








at.getValue=function(){
return this._uCheckbox.getValue()};








at.isChecked=function(){
return this._uCheckbox.isChecked()};








at.setChecked=function(a){
this._uCheckbox.setChecked(a)};




















function bd(a,b,c){
c=c<0?c+1:c>1?c-1:c;
c=c<.5?x(6*c,1):q(4-6*c,0);
return aM(255*(a+(b-a)*c))}








_.getBlue=function(){
return this._aValue[2]};








_.getGreen=function(){
return this._aValue[1]};








_.getHue=function(){
return this._aValue[3]};








_.getLight=function(){
return this._aValue[5]};








_.getRGB=function(){



var a=this._aValue;




return((a[0]<16?"0":"")+a[0].toString(16)+(a[1]<16?"0":"")+a[1].toString(16)+(a[2]<16?"0":"")+a[2].toString(16)).toUpperCase()};











_.getRed=function(){
return this._aValue[0]};








_.getSaturation=function(){
return this._aValue[4]};










_.setRGB=function(a,b,c){
var h=a/255,g=b/255,i=c/255,j=x(h,g,i),f=q(h,g,i),e=f-j,k=(f+j)/2,d;if(e){









d=h==f?(g-i)/6/e:g==f?.3333333333333333+(i-h)/6/e:.6666666666666666+(h-g)/6/e;



d=d<0?(d+=1):d>1?(d-=1):d;
e=k<.5?e/(f+j):e/(2-f-j)}else{


d=0;
e=0}


this._aValue=[a,b,c,d,e,k]};










_.setHSL=function(a,b,c){
var d=c+x(c,1-c)*b,e=2*c-d;


this._aValue=[bd(e,d,a+.3333333333333333),bd(e,d,a),bd(e,d,a-.3333333333333333),a,b,c]};






































function bi(a,b){
for(var d=0;d<7;d++)if(b[d]!==p){d||(a._uColor.getBase().style.backgroundColor="#"+b[d]);




a._aValue[d].setValue(b[d])}}












function bP(a,b,c){
for(var d=0,f=U(a._uLightbar.getBody()),e=new m.Color();d<256;){
e.setHSL(b,c,1-d/255);
f[d++].style.backgroundColor="#"+e.getRGB()}}









function bQ(a){

var b=a._aValue[1].getValue(),c=a._aValue[3].getValue();



a._uMain._uIcon.setPosition(b,255-c);
a._uLightbar._uIcon.getOuter().style.top=255-a._aValue[5].getValue()+"px";
bP(a,b/255,c/255)}








function bR(a){

var b=new m.Color();


b.setHSL(a._aValue[1].getValue()/255,a._aValue[3].getValue()/255,a._aValue[5].getValue()/255);

bi(a,[b.getRGB(),p,b.getRed(),p,b.getGreen(),p,b.getBlue()])}
















function bO(a){

var b=new m.Color();


b.setRGB(+a._aValue[2].getValue(),+a._aValue[4].getValue(),+a._aValue[6].getValue());

bi(a,[b.getRGB(),aM(b.getHue()*256)%256,p,aM(b.getSaturation()*255),p,aM(b.getLight()*255)]);








bQ(a)}










bL.$dragmove=function(c,a,b){
g.$dragmove.call(this,c,a,b);


var e=this.getParent(),d=e.getParent();



b=255-b;if(e==d._uMain){

d._aValue[1].setValue(a);
d._aValue[3].setValue(b);
bP(d,a/255,b/255)}else d._aValue[5].setValue(b);





bR(d)};








bL.$pressstart=function(c){
g.$pressstart.call(this,c);

var a=this._uIcon,d,e=aU(this),b={top:0,bottom:255+a.getHeight()};if(this==this.getParent()._uMain){





d=aT(this);
b.left=0;
b.right=255+a.getWidth()}else{if(e<0||e>255)return;





b.left=b.right=d=a.getX()}


a.setPosition(d,e);
a9(a,c,b);
a.$dragmove(c,d,e)};








cg.$click=function(c){
aO.$click.call(this,c);
this.getParent().getParent().setColor(new m.Color(bM[this.getIndex()]))};






bN.$change=function(){
Y.$change.call(this);

var b=this.getParent(),a=this.getValue();if(this==b._aValue[0]){



a=this.$getInputText();a&&a.length==6?b.setColor(new m.Color(a)):this.restore()}else{if(a)a.charAt(0)=="0"&&this.setValue(+a);else{









this.setValue(0);
Z(function(){
this.setCaret(1)},0,this)}if(J(b._aValue,this)%2){







bR(b);
bQ(b)}else bO(b)}};













bN.$keydown=function(c){
Y.$keydown.call(this,c);

var e=this.getParent(),b=this.getValue(),f=this.getSelectionStart(),d=this.getSelectionEnd(),a=aF();if(!c.ctrlKey&&this==e._aValue[0]){if(a==46||a==8)c.preventDefault();else if(a!=37&&a!=39){f==d&&d++;














a=String.fromCharCode(a).toUpperCase();if(/[0-9A-F]/.test(a)){

b=b.slice(0,f)+a+b.slice(d);if(b.length==6){

e.setColor(new m.Color(b));
this.setCaret(d)}

c.preventDefault()}}}};











cf.$click=function(c){
g.$click.call(this,c);

c=this.getParent();J(c._aButton,this)?c.hide():c.onconfirm&&c.onconfirm()};
















aQ.$cache=function(a,b){
g.$cache.call(this,a,b);

this._uMain.cache(i,h);
this._uLightbar.cache(i,h)};






aQ.$init=function(){
g.$init.call(this);
this.setColor(new m.Color("808080"))};










aQ.$setSize=function(a,b){
g.$setSize.call(this,a,b);

this._uMain.setBodySize(256,256);
this._uLightbar.setBodySize(0,256)};








aQ.getColor=function(){
return new m.Color(this._aValue[0].getValue())};








aQ.setColor=function(a){
bi(this,[p,p,a.getRed(),p,a.getGreen(),p,a.getBlue()]);








bO(this)};
































function bl(a,b,c){

var d=a.getParent(),e=d._uPrev==a;d._oStop&&d._oStop();if(e&&d._nValue||!e&&d._nValue<d._nTotal){e?d.$allowPrev()&&d.setValue(d._nValue-b):d.$allowNext()&&d.setValue(d._nValue+b);


















d._oStop=Z(bl,c||200,j,a,b,40)}}











bk.$dragmove=function(c,a,b){
g.$dragmove.call(this,c,a,b);

var d=this.getParent(),e=d.$calcDragValue(a,b);



d.$setValue(e==d._nTotal?e:e-e%d._nStep);
d.scroll()};








bk.$pressstart=function(c){
g.$pressstart.call(this,c);

a9(this,c,this._oRange)};











bk.setRange=function(a,b,c,d){
this._oRange={top:a,right:b,bottom:c,left:d}};













a2.$pressend=a2.$pressout=function(c){
g[c.type=="mouseup"?"$pressend":"$pressout"].call(this,c);
this.getParent()._oStop()};








a2.$pressover=a2.$pressstart=function(c){
g[c.type=="mousedown"?"$pressstart":"$pressover"].call(this,c);
bl(this,q(this.getParent()._nStep,5))};










D.$cache=function(a,b){
g.$cache.call(this,a,b);

this._uPrev.cache(h,h);
this._uNext.cache(h,h);
this._uBlock.cache(h,h)};







D.$hide=function(){
g.$hide.call(this);
D.setValue.call(this,0)};







D.$init=function(){
g.$init.call(this);
this._uPrev.$init();
this._uNext.$init();
this._uBlock.$init()};








D.$pressend=D.$pressout=function(c){
g[c.type=="mouseup"?"$pressend":"$pressout"].call(this,c);
this._oStop()};








D.$pressover=D.$pressstart=function(c){
g[c.type=="mousedown"?"$pressstart":"$pressover"].call(this,c);
bl(c.type=="mousedown"?(this._cButton=this.$allowPrev()?this._uPrev:this._uNext):this._cButton,this.$getPageStep())};











D.$setPageStep=function(a){
this._nPageStep=a};









D.$setSize=function(a,b){
g.$setSize.call(this,a,b);
this.$locate()};









D.$setValue=function(a){
this._nValue=a};









D.getStep=function(){
return this._nStep};









D.getTotal=function(){
return this._nTotal};









D.getValue=function(){
return this._nValue};







D.scroll=function(){
var a=this.getParent();a&&(a.onscroll&&a.onscroll()===i||a.$scroll())};














D.setStep=function(a){a>0&&(this._nStep=a)};












D.setTotal=function(a){if(a>=0&&this._nTotal!=a){

this._nTotal=a;if(this._nValue>a){



this._nValue=a;
this.scroll()}

this.$flush()}};










D.setValue=function(a){
a=x(q(0,a),this._nTotal);if(this._nValue!=a){


this._nValue=a;
this.scroll();
this.$flush()}};










D.skip=function(a){
this.setValue(this._nValue+a*this._nStep)};










aA.$allowNext=function(){
return aU(this)>this._uBlock.getY()+this._uBlock.getHeight()};









aA.$allowPrev=function(){
return aU(this)<this._uBlock.getY()};










aA.$calcDragValue=function(a,b){

var c=this._uBlock;

return(b-c._oRange.top)/(c._oRange.bottom-this._uPrev.getHeight()-c.getHeight())*this._nTotal};







aA.$flush=function(){

var a=this._uBlock,d=this._nTotal,f=this.getHeight(),c=this._uPrev.getHeight(),b=this.getBodyHeight(),e=q(N(b*f/(f+d)),a.getInvalidHeight()+5);if(d){







a.$setSize(0,e);
a.setPosition(0,c+N(this._nValue/d*(b-e)));
a.setRange(c,0,b+c,0)}};










aA.$getPageStep=function(){
var a=this.getHeight();
return this._nPageStep||a-a%this._nStep};









aA.$setSize=function(a,b){
D.$setSize.call(this,a,b);


var c=this.getBodyWidth(),d=this.$cache$paddingTop;




this._uPrev.$setSize(c,d);
this._uNext.$setSize(c,this.$cache$paddingBottom);
this._uBlock.$setSize(c);
this._uNext.setPosition(0,this.getBodyHeight()+d);

this.$flush()};










av.$allowNext=function(){
return aT(this)>this._uBlock.getX()+this._uBlock.getWidth()};









av.$allowPrev=function(){
return aT(this)<this._uBlock.getX()};










av.$calcDragValue=function(a,b){

var c=this._uBlock;

return(a-c._oRange.left)/(c._oRange.right-this._uPrev.getWidth()-c.getWidth())*this._nTotal};







av.$flush=function(){

var a=this._uBlock,d=this._nTotal,f=this.getWidth(),c=this._uPrev.getWidth(),b=this.getBodyWidth(),e=q(N(b*f/(f+d)),a.getInvalidWidth()+5);if(d){







a.$setSize(e);
a.setPosition(c+N(this._nValue/d*(b-e)),0);
a.setRange(0,b+c,0,c)}};










av.$getPageStep=function(){
var a=this.getWidth();
return a-a%this._nStep};









av.$setSize=function(a,b){
D.$setSize.call(this,a,b);


var c=this.getBodyHeight(),d=this.$cache$paddingLeft;




this._uPrev.$setSize(d,c);
this._uNext.$setSize(this.$cache$paddingRight,c);
this._uBlock.$setSize(0,c);
this._uNext.setPosition(this.getBodyWidth()+d,0);

this.$flush()};



































z.$hide=z.hide=function(){
this.getBase().style[this._aProperty[0]]="hidden";
z.setValue.call(this,0)};








z.$setValue=z.setValue=function(a){
this.getBase()[this._aProperty[1]]=x(q(0,a),this.getTotal())};






z.$show=z.show=function(){
this.getBase().style[this._aProperty[0]]="scroll"};








z.getHeight=function(){
return this._aProperty[4]?this.getBase()[this._aProperty[4]]:bq()};









z.getTotal=function(){
return n(this.getBase().lastChild.style[this._aProperty[2]])};









z.getValue=function(){
return this.getBase()[this._aProperty[1]]};








z.getWidth=function(){
return this._aProperty[3]?this.getBase()[this._aProperty[3]]:bq()};








z.isShow=function(){
return this.getBase().style[this._aProperty[0]]!="hidden"};







z.scroll=function(c){
c=R(G(c).target).getParent();c.onscroll&&c.onscroll()===i||c.$scroll()};












z.setTotal=function(a){
this.getBase().lastChild.style[this._aProperty[2]]=a+"px"};


z.$cache=z.$getPageStep=z.$init=z.$setPageStep=z.$setSize=z.alterClass=z.cache=z.getStep=z.setPosition=z.setStep=z.skip=O;






l(bE,aN);


l(bD,aN);


(function(){for(var a in g)b9[a]=O})();














M.$cache=function(a,b){
g.$cache.call(this,a,b);

var c=this.getBody(),i=c.offsetWidth,e=c.offsetHeight;



a=F(s(c));
this.$cache$layoutWidthRevise=a7(a);
this.$cache$layoutHeightRevise=a6(a);if(this._bAbsolute){for(var 




d=0,f=c.all||c.getElementsByTagName("*"),j=ah(c);c=f[d++];)if(c.offsetWidth&&F(c,"position")=="absolute"){






a=ah(c);
i=q(i,a.left-j.left+c.offsetWidth);
e=q(e,a.top-j.top+c.offsetHeight)}}




this.$cache$mainWidth=i;
this.$cache$mainHeight=e;this._uVScroll&&this._uVScroll.cache(h,h);this._uHScroll&&this._uHScroll.cache(h,h);this._uCorner&&this._uCorner.cache(h,h)};

















M.$dispose=function(){
this._eBrowser=j;
g.$dispose.call(this)};







M.$init=function(){this._uVScroll&&this._uVScroll.$init();this._uHScroll&&this._uHScroll.$init();this._uCorner&&this._uCorner.$init();









g.$init.call(this)};









M.$keydown=M.$keypress=function(c){
var a=aF(),b=a%2?this._uHScroll:this._uVScroll;if(a>=37&&a<=40&&!c.target.value){b&&b.skip(a+a%2-39);






return i}};










M.$mousewheel=function(c){
a=this._uVScroll;if(a&&a.isShow()){



var d=a.getValue(),b=this._nWheelDelta||N(20/a.getStep())||1,a;



a.skip(c.detail>0?b:-b);
return d==a.getValue()}};








M.$scroll=function(){
var a=this.getBody().style;
a.left=-q(this.getScrollLeft(),0)+"px";
a.top=-q(this.getScrollTop(),0)+"px"};










M.$setSize=function(a,b){
g.$setSize.call(this,a,b);
this.$locate();

var q=this.$cache$paddingLeft+this.$cache$paddingRight,p=this.$cache$paddingTop+this.$cache$paddingBottom,k=this.getBodyWidth(),j=this.getBodyHeight(),n=this.$cache$mainWidth,m=this.$cache$mainHeight,l=this._eBrowser,d=this._uVScroll,c=this._uHScroll,e=this._uCorner,u=d&&d.getWidth(),t=c&&c.getHeight(),i=k-u,f=j-t,o=i+q,r=f+p;d&&d.setPosition(o,0);c&&c.setPosition(0,r);e&&e.setPosition(o,r);if(n<=k&&m<=j){d&&d.$hide();c&&c.$hide();e&&e.$hide();






































i=k;
f=j}else for(;;){if(e){if(n>i&&m>f){






c.$setSize(o);
c.setTotal(n-(l?0:i));
c.$show();
d.$setSize(0,r);
d.setTotal(m-(l?0:f));
d.$show();
e.$setSize(u,t);
e.$show();
break}

e.$hide()}if(c)if(n>k){




c.$setSize(k+q);
c.setTotal(n-(l?0:k));
c.$show();d&&d.$hide();



i=k}else c.$hide();if(d)if(m>j){








d.$setSize(0,j+p);
d.setTotal(m-(l?0:j));
d.$show();c&&c.$hide();



f=j}else d.$hide();





break}



i-=this.$cache$layoutWidthRevise;
f-=this.$cache$layoutHeightRevise;d&&d.$setPageStep(f);c&&c.$setPageStep(i);if(l){










e=l.style;
e.width=k+q+"px";
e.height=j+p+"px"}


e=s(this.getBody()).style;
e.width=i+"px";
e.height=f+"px"};









M.getScrollLeft=function(){
var a=this._uHScroll;
return a?a.getValue():-1};









M.getScrollTop=function(){
var a=this._uVScroll;
return a?a.getValue():-1};





























function bg(b){
var d=b.getParent(),e=d.$getSection("VScroll"),f=e.getStep(),a=aU(d),c=b._nTop;





b._nTop=a;if(a>d.getHeight()){a<c?(a=0):(a=N((a-q(0,c))/3))?e.skip(a):b._nTop=c;
















a+=b._nLast}else if(a<0){a>c?(a=0):(a=Math.ceil((a-x(0,c))/3))?e.skip(a):b._nTop=c;
















a+=b._nLast}else a=N((d.getScrollTop()+a)/f);





return x(q(0,a),d.getItems().length-1)}


L(aw,r);






ae.$dispose=function(){
this._eInput=j;
P.$dispose.call(this)};








ae.$pressstart=function(c){
P.$pressstart.call(this,c);
m.select(this,c,"listbox")};






ae.$select=function(){



var a=bg(this),f=this.getParent().getItems(),b=this._nLast,c=0,e=-1,d=0,g=-1;if(a>b)if(a<this._nStart){











c=b;
e=a-1}else if(b<this._nStart){



c=b;
e=this._nStart-1;
d=this._nStart+1;
g=a}else{



d=b+1;
g=a}else if(a<b)if(a>this._nStart){





c=a+1;
e=b}else if(b>this._nStart){



c=this._nStart+1;
e=b;
d=a;
g=this._nStart-1}else{



d=a;
g=b-1}



this._nLast=a;


for(;c<=e;){
a=f[c++];
a.alterClass("selected",!a.isSelected())}



for(;d<=g;)f[d++].alterClass("selected")};








ae.$selectend=function(){


var a=bg(this),f=this.getParent().getItems(),b=this._nStart,c=x(b,a),d=q(b,a);if(b==a)this.setSelected(!this.isSelected());else for(;c<=d;)f[c++].setSelected()};





















ae.$selectstart=function(){
this._nStart=this._nLast=bg(this);
this.alterClass("selected")};








ae.$setParent=function(a){
P.$setParent.call(this,a);a instanceof w.Listbox&&(this._eInput=aj(this._eInput,a._sName))};












ae.isSelected=function(){
return!this._eInput.disabled};








ae.setSelected=function(a){
this.alterClass("selected",this._eInput.disabled=a===i)};







aw.$alterItems=function(){

var f=this.getItems(),b=this.$getSection("VScroll"),a=f.length&&f[0].getHeight();if(a){




b.setStep(a);
this.setItemSize(this.getBodyWidth()-(f.length*a>this.getBodyHeight()?b.getWidth():0),a);



this.$setSize(0,this.getHeight())}};










aw.getName=function(){
return this._sName};








aw.getSelected=function(){
for(var d=0,f=this.getItems(),a,b=[];a=f[d++];)a.isSelected()&&b.push(a);




return b};







aw.selectAll=function(){
for(var d=0,f=this.getItems(),a;a=f[d++];)a.setSelected()};











aw.setName=function(b){
for(var d=0,f=this.getItems(),a;a=f[d++];)a._eInput=aj(a._eInput,b);



this._sName=b};










































function bU(a){

var e=a._uOptions.$getSection("VScroll"),b=a._uOptions.getOuter(),c=ah(a.getOuter()),f=a._cSelected,d=c.top+a.getHeight();if(!s(b)){








t.body.appendChild(b);
a.$alterItems()}if(a._uOptions.isShow()){



a.$setActived(f);
e.setValue(e.getStep()*J(a.getItems(),f));


a=a._uOptions.getHeight();


a._uOptions.setPosition(c.left,d+a<=aG().bottom?d:c.top-a)}}






L(C,r);






cj.$dispose=function(){if(this.isShow()){


V();
aq()}

M.$dispose.call(this)};









bm.getValue=function(){
return this._sValue};









bm.setValue=function(a){
var b=this.getParent();
this._sValue=a;b&&this==b._cSelected&&v.setValue.call(b,a)};










C.$alterItems=function(){

var d=this._uOptions.$getSection("VScroll"),c=this._nOptionSize,a=this.getBodyHeight(),e=this.getWidth(),b=this.getItems().length;if(s(this._uOptions.getOuter())){








d.setStep(a);


this.setItemSize(e-this._uOptions.getInvalidWidth()-(b>c?d.getWidth():0),a);





this._uOptions.cache(i);
this._uOptions.$setSize(e,(x(b,c)||1)*a+this._uOptions.getInvalidHeight())}};











C.$cache=function(a,b){
(s(this._uOptions.getOuter())?r:v).$cache.call(this,a,b);
this._uText.cache(i,h);
this._uButton.cache(i,h)};









C.$intercept=function(c){

var a=R(c.target);
this._uOptions.hide();
V();if(a instanceof w.Select.Item&&a!=this._cSelected){



this.setSelected(a);
this.change()}};










C.$keydown=C.$keypress=function(c){
v["$"+c.type](c);



var b=this._uOptions.$getSection("VScroll"),e=this._nOptionSize,a=c.which,f=this.getItems(),d=this.getActived();if(b4()!=this){if(a==40||a==38){if(f.length)if(this._uOptions.isShow()){












this.$setActived(f[a=x(q(0,J(f,d)+a-39),f.length-1)]);
a-=b.getValue()/b.getStep();
b.skip(a<0?a:a>=e?a-e+1:0)}else this.setSelected(x(q(0,J(f,this._cSelected)+a-39),f.length-1));





return i}else if(a==27||a==13&&this._uOptions.isShow()){a==13&&this.setSelected(d);






this._uOptions.hide();
V();
aq();
return i}}};











C.$mousewheel=function(c){


var f=this.getItems();this._uOptions.isShow()?this._uOptions.$mousewheel(c):this.setSelected(f.length?x(q(0,J(f,this._cSelected)+(c.detail>0?1:-1)),f.length-1):j);











return i};









C.$pressstart=function(c){
v.$pressstart.call(this,c);
this._uOptions.show();

bs(this);
V(0,65534);
bU(this)};







C.$ready=function(){
this.setValue(this.getValue())};









C.$remove=function(a){a==this._cSelected&&this.setSelected();



r.$remove.call(this,a)};









C.$setSize=function(a,b){
v.$setSize.call(this,a,b);
this.$locate();
b=this.getBodyHeight();


this._uText.$setSize(a=this.getBodyWidth()-b,b);


this._uButton.$setSize(b,b);
this._uButton.setPosition(a,0)};








C.getSelected=function(){
return this._cSelected||j};









C.setOptionSize=function(a){
this._nOptionSize=a;
this.$alterItems();
bU(this)};








C.setSelected=function(a){

a="number"==typeof a?this.getItems()[a]:a||j;if(a!==this._cSelected){


this._uText.$setBodyHTML(a?a.getBody().innerHTML:"");
v.setValue.call(this,a?a._sValue:"");
this._cSelected=a;this._uOptions.isShow()&&this.$setActived(a)}};













C.setValue=function(b){
for(var d=0,f=this.getItems(),a;a=f[d++];)if(a._sValue==b){

this.setSelected(a);
return}




this.setSelected()};


































cb.$setSize=function(a,b){
C.$setSize.call(this,a,b);
this.getInput().style.width=this.$getSection("Text").getWidth()+"px"};


































function a_(b){if(b){

for(var d=0,f=b.getItems(),a,c=[];a=f[d++];)a.isSelected()&&c.push(br(a.getBody()));




b.$getSection("Text").$setBodyHTML(c.join(","))}}



L(I,r);








a0.$click=function(c){
bm.$click.call(this,c);
this.setSelected(!this.isSelected())};







a0.$dispose=function(){
this._eInput=j;
w.Select.Item.$dispose.call(this)};








a0.isSelected=function(){
return this._eInput.checked};








a0.setSelected=function(a){
this.alterClass("selected",!(this._eInput.checked=a!==i));
a_(this.getParent())};







I.$alterItems=function(){
C.$alterItems.call(this);
a_(this)};










I.$append=function(a){
C.$append.call(this,a);
this.getBase().appendChild(aj(a._eInput,this.getName()))};










I.$cache=C.$cache;








I.$intercept=function(c){if(R(c.target) instanceof w.MultiSelect.Item)return i;



this.$getSection("Options").hide();
V()};









I.$keydown=I.$keypress=I.$keyup=function(c){

v["$"+c.type].call(this,c);if(!this.$getSection("Options").isShow())return i;




var a=aF();if(a==13||a==32){if(c.type=="keyup"){


a=this.getActived();
a.setSelected(!a.isSelected())}

return i}};










I.$mousewheel=function(c){
var a=this.$getSection("Options");a.isShow()&&a.$mousewheel(c);



return i};









I.$pressend=C.$pressend;








I.$pressstart=C.$pressstart;






I.$ready=function(){
a_(this)};









I.$remove=function(a){
C.$remove.call(this,a);
this.getBase().removeChild(a._eInput)};









I.$setSize=C.$setSize;







I.getSelected=function(){
for(var d=0,f=this.getItems(),a,b=[];a=f[d++];)a.isSelected()&&b.push(a);




return b};









I.setOptionSize=C.setOptionSize;







I.setValue=function(b){
for(var d=0,f=this.getItems(),a;a=f[d++];)a.setSelected(J(b,a._eInput.value)>=0);


a_(this)};

















































function ck(c){
for(var d=0,f=c.getParent()._aCol,b,a;a=f[d];)if(b=c._aCol[d++]){

a=a.getWidth()-a.getInvalidWidth();
while(c._aCol[d]===j)a+=f[d++].getWidth();


b.style.width=a+"px"}}











function bV(a){

var d=1,f=this.getParent()[this instanceof w.VScroll?"_aRow":"_aCol"],b=this.getValue();




a=x(q(0,a),this.getTotal());if(a==b)return;if(a>b){if(f.length==1){







D.setValue.call(this,this.getTotal());
return}

for(;;d++)if(a<=f[d].$cache$pos){b<f[d-1].$cache$pos&&d--;





break}}else for(d=f.length;d--;)if(a>=f[d].$cache$pos){d<f.length-1&&b>f[d+1].$cache$pos&&d++;










break}




D.setValue.call(this,f[d].$cache$pos)}









an.$click=function(c){
var a=this.getParent();a.onrowclick&&a.onrowclick(c)===i||g.$click.call(this,c)};










an.$dispose=function(){
this._aCol=j;
g.$dispose.call(this)};








an.$getCols=function(){
return this._aCol.slice()};








an.getCol=function(a){
return this._aCol[a]?this._aCol[a].getControl():j};








an.getCols=function(){
for(var d=this._aCol.length,a=[];d--;)a[d]=this.getCol(d);



return a};






a4.$hide=function(){
this.$setStyles("display","none",-this.getWidth())};











a4.$setStyles=function(b,c,e){

var d=0,h=this.getParent(),g=this.getBody(),m=J(h._aCol,this),a=s(s(s(g))).style,f;







g.style[b]=c;e&&(a.width=ag(h.getBody()).style.width=n(a.width)+e+"px");




for(;a=h._aRow[d++];){

g=a._aCol;
a=g[m];a&&(a.style[b]=c);if(e&&a!==i){




for(f=m;!(a=g[f]);f--);

var k=-h._aCol[f].getInvalidWidth(),l=0;


do if(!h._aCol[f].getOuter().style.display){

k+=h._aCol[f].getWidth();
l++}while(g[++f]===j);if(k>0){





a.style.display="";
a.style.width=k+"px";
a.setAttribute("colSpan",l)}else a.style.display="none"}}e>0?h.resize():h.paint()};


















a4.$show=function(){
this.$setStyles("display","",this.getWidth())};








a4.setSize=function(a){
var b=this.getWidth();

this.$setSize(a);
this.$setStyles("width",a-this.getInvalidWidth(h)+"px",a-b)};









a3.$click=function(c){
var a=this.getParent().getParent();a.oncellclick&&a.oncellclick(c)!==i||g.$click.call(this,c)};











a3.getHeight=function(){
return this.getOuter().offsetHeight};








a3.getWidth=function(){
return this.getOuter().offsetWidth};










A.$cache=function(a,b){
M.$cache.call(this,a,b);

this._uHead.cache(i,h);


this.$cache$mainHeight-=(this.$cache$paddingTop=s(this._uHead.getBody()).offsetHeight);
for(var d=0,c=0;a=this._aRow[d++];){
a.$cache$pos=c;
a.cache(h,h);a.getOuter().style.display||(c+=a.getHeight())}




for(d=0,c=0;a=this._aCol[d++];){
a.$cache$pos=c;
a.cache(h,h);a.getOuter().style.display||(c+=a.getWidth())}




this.$cache$mainWidth=c};











A.$getCell=function(a,b){

var d=this._aRow[a]&&this._aRow[a]._aCol,c=d&&d[b];if(c===p)c=j;else if(!c){







for(;c===i;c=(d=this._aRow[--a]._aCol)[b]);
for(;!c;c=d[--b]);}

return c};







A.$init=function(){
M.$init.call(this);

for(var d=0,a;a=this._aCol[d++];)a.$setSize(a.getWidth());


for(d=0;a=this._aRow[d++];)ck(a);


ai(s(this._uHead.getBody()),this._uHead.getBase().lastChild.lastChild.firstChild)};






A.$scroll=function(){
M.$scroll.call(this);
this._uHead.getBase().lastChild.style.left=this.getBody().style.left};









A.$setSize=function(b,c){
var k=this.getBody(),f=this.$getSection("VScroll"),d=this.$getSection("HScroll"),e=this.$cache$mainWidth,g=this.$cache$mainHeight,r=f&&f.getWidth(),l=d&&d.getHeight(),o=this.getInvalidWidth(h),m=this.getInvalidHeight(h),q=e+o,p=g+m,j=b-o,i=c-m,a;














this.getBase().style.paddingTop=this.$cache$paddingTop+"px";
ag(k).style.width=this._uHead.getBase().lastChild.lastChild.style.width=e+"px";if(e<=j&&g<=i){



b=q;
c=p}else if(!(f&&d&&e>j-r&&g>i-l)){




a=q+(!f||i>=g?0:r);
b=d?x(b,a):a;
a=p+(!d||j>=e?0:l);
c=f?x(c,a):a}


M.$setSize.call(this,b,c);

this._uHead.$setSize(n(s(k).style.width),this.$cache$paddingTop)};














A.addCol=function(e,c){

var d=0,h=this.getType(),m=e.base||this.getBaseClass(),b=y(h+"-head "+m+"-head","","th"),g=o(w.Table.Col,b,this),a=this._aCol[c],f;a?(a=a.getOuter()):c=this._aCol.length;















this._aCol.splice(c,0,g);
b.innerHTML=e.title||"";
this._uHead.getBody().insertBefore(b,a);

h=h+"-item "+m+"-item";
for(;f=this._aRow[d];d++){
a=f._aCol[c];if(a!==j){


for(l=c;!a;){
a=f._aCol[++l];if(a===p)break}




f._aCol.splice(c,0,a=f.getBody().insertBefore(y(h,"","td"),a));
a.getControl=ay}else{



var k=this.$getCell(d,c),l=n(k.getAttribute("rowspan"))||1;


k.setAttribute("colSpan",n(k.getAttribute("colSpan"))+1);
f._aCol.splice(c,0,a);
for(;--l;)this._aRow[++d]._aCol.splice(c,0,i)}}





g.$setSize(e.width);
g.$setStyles("width",b.style.width,e.width);

return g};










A.addRow=function(c,e){
var d=0,p=1,s=this.getBody().lastChild.lastChild,r=this.getType(),b=y(),l=['<table><tbody><tr class="'+r+"-row "+this.getBaseClass()+'-row">'],k=[],g=this._aRow[e],f;g||(e=this._aRow.length);













for(;f=this._aCol[d];)if(g&&g._aCol[d]===i||c[d]===i)k[d++]=i;else{





k[d]=h;
l[p++]='<td class="'+r+"-item "+f.getBaseClass().slice(0,-5)+'-item" style="';
for(var 
a=d,m=f.isShow()?1:0,q=-f.getInvalidWidth();(f=this._aCol[++d])&&c[d]===j;){




k[d]=j;if(f.isShow()){

m++;
q+=f.getWidth()}}


k[a]=h;
l[p++]=(m?"width:"+q+'px" colSpan="'+m:"display:none")+'">'+c[a]+"</td>"}




l[p]="</tr></tbody></table>";
b.innerHTML=l.join("");
b=b.lastChild.lastChild.lastChild;

s.insertBefore(b,g&&g.getOuter());
g=o(aS(this,"Row"),b,this);
this._aRow.splice(e--,0,g);


for(d=0,b=b.firstChild,f=j;this._aCol[d];d++)if(a=k[d]){

k[d]=b;
b.getControl=ay;
b=b.nextSibling}else if(a===i){


a=this.$getCell(e,d);if(a!=f){

a.setAttribute("rowSpan",(n(a.getAttribute("rowSpan"))||1)+1);
f=a}}




g._aCol=k;
this.paint();

return g};










A.getCell=function(a,b){
a=this._aRow[a];
return a&&a.getCol(b)||j};










A.getCol=function(a){
return this._aCol[a]||j};








A.getColCount=function(){
return this._aCol.length};








A.getCols=function(){
return this._aCol.slice()};









A.getRow=function(a){
return this._aRow[a]||j};








A.getRowCount=function(){
return this._aRow.length};








A.getRows=function(){
return this._aRow.slice()};








A.removeCol=function(b){
var d=0,c=this._aCol,a=c[b];if(a){




a.hide();

K(a.getOuter());
a8(a);
c.splice(b,1);

for(;a=this._aRow[d++];){
c=a._aCol;if(a=c[b]){if(c[b+1]===j){



c.splice(b+1,1);
continue}

K(a);a.getControl!=ay&&a8(a.getControl())}




c.splice(b,1)}}};










A.removeRow=function(b){

var d=0,g=this._aRow[b],e=this._aRow[b+1],c,f,a;if(g){








for(;this._aCol[d];d++){
a=g._aCol[d];if(a===i){

a=this.$getCell(b-1,d);if(c!=a){

a.setAttribute("rowSpan",n(a.getAttribute("rowSpan"))-1);
c=a}}else if(a&&(f=n(a.getAttribute("rowSpan")))>1){



a.setAttribute("rowSpan",f-1);
e._aCol[d++]=a;
for(;g._aCol[d]===j;)e._aCol[d++]=j;


for(f=d--;;){
c=e._aCol[f++];if(c||c===p)break}





e.getBody().insertBefore(a,c);a.getControl!=ay&&a.getControl().$setParent(e)}}






K(g.getOuter());
a8(g);
this._aRow.splice(b,1);

this.paint()}};




(function(){
function a(a){
var b=a.slice(5);

an[a]=function(c){
var d=this.getParent();d["onrow"+b]&&d["onrow"+b](c)===i||g[a].call(this,c)};





a3[a]=function(c){
var d=this.getParent().getParent();d["oncell"+b]&&d["oncell"+b](c)===i||g[a].call(this,c)}}






for(var d=0;d<5;)a(aR[d++])})();


















































function bJ(a,b,c){
b=o(aS(a,"Row"),b,a);
b._eFill=b.getBase().lastChild;
b._cJoint=c;
c._cJoint=b;

return b}








function bh(c){
var d=0,e=c.getParent(),i=c._cJoint.$getCols,h=e.getCols(),f=i?c._cJoint.$getCols():h,g=c._cJoint.getBody(),j=c.getBody(),b=j.firstChild,a;









for(;h[d];){d==e._nLeft&&(b=g.firstChild);if(a=f[d++]){i||(a=a.getOuter());b!=a?(d<=e._nLeft||d>e._nRight?j:g).insertBefore(a,b):b=b.nextSibling}d==e._nRight&&(b=c._eFill.nextSibling)}}


























function ce(b){
bh(b._uLockedHead);
for(var d=0,a;a=b._aLockedRow[d++];)bh(a)}









bK.$dispose=function(){
this._eFill=j;
an.$dispose.call(this)};










ac.$cache=function(a,b){
A.$cache.call(this,a,b);

var d=0,f=this.getRows(),e=this.getCols(),c=e[this._nLeft].$cache$pos;




this.$cache$paddingTop=q(this.$cache$paddingTop,this._uLockedHead.getBody().offsetHeight);
this.$cache$mainWidth-=((this.$cache$paddingLeft=c)+(this.$cache$paddingRight=this._nRight<e.length?this.$cache$mainWidth-e[this._nRight].$cache$pos:0));





for(;a=e[d++];)a.$cache$pos-=c;



for(d=0,c=0;a=f[d++];){
a.getCol(this._nLeft).cache(i,h);
a.$cache$pos=c;
a._cJoint.cache(h,h);
c+=q(a.getHeight(),a._cJoint.getHeight())}


this.$cache$mainHeight=c};







ac.$dispose=function(){
this._uLockedHead._eFill=j;
A.$dispose.call(this)};







ac.$init=function(){
A.$init.call(this);
ce(this)};






ac.$resize=function(){
var a=this.getBase().style;
a.paddingLeft=a.paddingRight="";
this.$cache$paddingLeft=this.$cache$paddingRight=0;
A.$resize.call(this)};






ac.$scroll=function(){
A.$scroll.call(this);
this._uLockedMain.getBody().style.top=this.getBody().style.top};









ac.$setSize=function(b,c){
var a=this.getBase().style,d=0,g=s(this.getBody()),f=this._uLockedHead,e=s(s(f.getBody())).style;





a.paddingLeft=this.$cache$paddingLeft+"px";
a.paddingRight=this.$cache$paddingRight+"px";

A.$setSize.call(this,b,c);

a=f._cJoint.getWidth()+this.$cache$paddingLeft+this.$cache$paddingRight;
f.$setSize(0,this.$cache$paddingTop);
e.height=this.$cache$paddingTop+"px";
this._uLockedMain.$setSize(a,this.getBodyHeight());
e.width=this._uLockedMain.getBody().lastChild.style.width=a+"px";

b=g.style.width;
f._eFill.style.width=b;

e=g.previousSibling.style;
e.width=n(b)+this.$cache$paddingLeft+this.$cache$paddingRight+"px";
e.height=n(g.style.height)+this.$cache$paddingTop+"px";

for(;a=this._aLockedRow[d++];){
a._eFill.style.width=b;

e=q(a.getHeight(),a._cJoint.getHeight());
a._eFill.style.height=e+"px";
a._cJoint.getCol(this._nLeft).$setSize(0,e)}};















ac.addCol=function(e,a){if(a>=0){a<this._nLeft&&this._nLeft++;a<this._nRight&&this._nRight++}








return A.addCol.call(this,e,a)};










ac.addRow=function(c,d){
this.paint=O;


var e=A.addRow.call(this,c,d),d=J(this.getRows(),e),b=e.getBase(),a=y();





a.innerHTML='<table cellspacing="0"><tbody><tr class="'+b.className+'" style="'+b.style.cssText+'"><td style="padding:0px;border:0px"></td></tr></tbody></table>';


a=bJ(this,b=a.lastChild.lastChild.lastChild,e);
this._uLockedMain.getBody().lastChild.lastChild.insertBefore(b,this._aLockedRow[d]&&this._aLockedRow[d].getOuter());
this._aLockedRow.splice(d,0,a);
bh(a);

delete this.paint;
this.paint();

return e};








ac.removeCol=function(a){
A.removeCol.call(this,a);if(a>=0){a<this._nLeft&&this._nLeft--;a<this._nRight&&this._nRight--}};















(function(){
function a(a){
bK[a]=function(c){
g[a].call(this,c);
g[a].call(this._cJoint,c)}}



for(var d=0;d<13;)a("$"+aR[d++])})();
























H.$cache=function(a,b){
this._oInner.$cache(a,b,h);
g.$cache.call(this,F(this._eOuter),i);
this._oInner.$cache$position="relative";
this.$cache$position=a.position=="absolute"?"absolute":"relative";
this.$cache$layout=";top:"+a.top+";left:"+a.left+";display:"+a.display+(u?";zoom:"+a.zoom:"")};








H.$dispose=function(){
this._eOuter=j};






H.$init=function(){
this._eOuter.style.cssText="position:"+this.$cache$position+this.$cache$layout;
this._oInner.getOuter(h).style.cssText+=";position:relative;top:auto;left:auto;display:block";
this._oInner.$init(h)};






H.$resize=function(){



this._eOuter.style.width="";u||(this._eOuter.style.height="");



this._oInner.$resize(h)};









H.$setSize=function(a,b){


var e=g.getInvalidWidth.call(this),d=g.getInvalidHeight.call(this),c=aW();





this._oInner.$setSize(a&&a-e,b&&b-d,h);

this._eOuter.style.width=this._oInner.getWidth(h)+(c?0:e)+"px";
this._eOuter.style.height=this._oInner.getHeight(h)+(c?0:d)+"px"};









H.alterClass=function(a,b){
(b?bx:bp)(this._eOuter,this._sClass+"-"+a);
this._oInner.alterClass(a,b,h)};










H.cache=function(a,b){
this._oInner.cache(a,b,h)};








H.getClass=function(){
return this._sClass};








H.getHeight=function(){
return this._oInner.getHeight(h)+g.getInvalidHeight.call(this)};








H.getInner=function(){
return this._oInner};








H.getInvalidHeight=function(){
return this._oInner.getInvalidHeight(h)+g.getInvalidHeight.call(this)};








H.getInvalidWidth=function(){
return this._oInner.getInvalidWidth(h)+g.getInvalidWidth.call(this)};








H.getOuter=function(){
return this._eOuter};








H.getWidth=function(){
return this._oInner.getWidth(h)+g.getInvalidWidth.call(this)};






aJ.$dispose=function(){
this.clear();
this.$dispose()};






aJ.clear=function(){for(a in aJ)delete this[a];





var b=this.getUID(),a=S[b];


ai(this.getOuter(),a._eOuter);
K(a._eOuter);
for(;a!=this;a=a._oInner)a.$dispose();


delete S[b]};


(function(){
function c(b,c){
aJ[b]=function(){
var a=S[this.getUID()],d=arguments;


return d[c]?this.constructor.prototype[b].apply(this,d):a[b].apply(a,d)}}




for(var 
d=0,b=[["$cache",2],["$init",0],["$resize",0],["$setSize",2],["alterClass",2],["cache",2],["getHeight",0],["getInvalidHeight",0],["getInvalidWidth",0],["getOuter",0],["getWidth",0]];d<11;)c(b[d][0],b[d++][1])})();











bA("decorate",function(a,b){
b.replace(/([A-Za-z0-9\-]+) *\( *([^)]+)\)/g,function(b,c,e){

c=aE[bz(c.charAt(0).toUpperCase()+c.slice(1))];


e=e.split(/\s+/);

for(var d=0;b=e[d++];)new c(a,b)})});
















l(b6,S).$setSize=function(b,c){
H.$setSize.call(this,b,c);

var a=this._eOuter.lastChild,d=";top:"+this.$cache$paddingTop+"px;height:"+this._oInner.getHeight(h)+"px;width:";


a.style.cssText+=(d+this.$cache$paddingRight+"px;left:"+(this.$cache$paddingLeft+this._oInner.getWidth(h))+"px");


a.previousSibling.style.cssText+=(d+this.$cache$paddingLeft+"px")};













l(b8,S).$setSize=function(b,c){
H.$setSize.call(this,b,c);

var a=this._eOuter.lastChild,d=";left:"+this.$cache$paddingLeft+"px;width:"+this._oInner.getWidth(h)+"px;height:";


a.style.cssText+=(d+this.$cache$paddingBottom+"px;top:"+(this.$cache$paddingTop+this._oInner.getHeight(h))+"px");


a.previousSibling.style.cssText+=(d+this.$cache$paddingTop+"px")};













l(b7,S).$setSize=function(b,c){
H.$setSize.call(this,b,c);

var a=this._eOuter.lastChild,d=9,i=this.$cache$paddingTop,g=this.$cache$paddingLeft,f=this._oInner.getWidth(h),e=this._oInner.getHeight(h),k=[0,i,i+e],j=[0,g,g+f];








f=[g,f,this.$cache$paddingRight];
e=[i,e,this.$cache$paddingBottom];

for(;d--;)if(d!=4){

a.style.cssText+=(";top:"+k[N(d/3)]+"px;left:"+j[d%3]+"px;width:"+f[d%3]+"px;height:"+e[N(d/3)]+"px");


a=a.previousSibling}}})()