// The method is called when the user positions the mouse cursor over a glossary term in a document.
// Current implementation assumes the existence of an associative array (g_glossary).
// The keys of the array correspond to the argument passed to this function.
var bGlossary=true;
var oDialog;
var oTimeout="";
var oTimein="";
var iTimein=.5;
var iTimeout=30;
var oLastNode;
var oNode;
var bInit=false;
var aTerms=new Array();
// Called from mouseover and when the contextmenu behavior fires oncontextopen.
function clearDef(){
if((event)&&(event.toElement!=null)){
if(typeof(oTimein)=="number"){
window.clearTimeout(oTimein);
}
if(oDialog.dlg_status==true){
hideDef();
}
}
}
function hideDef(){
window.clearTimeout(oTimeout);
oTimeout="";
oDialog.style.display="none";
oDialog.dlg_status=false;
}
function showDef(oSource){
if(bInit==false){
glossaryInit();
bInit=true;
}
if(bGlossary==true){
if(typeof(arguments[0])=="object"){
oNode=oSource;
}
else{
oNode=window.event.srcElement;
}
var bStatus=oDialog.dlg_status; // BUGBUG: oDialog is null.
if((oLastNode!=oNode)||(bStatus==false)){
if((typeof(oTimein)=="number")&&(event)&&(event.fromElement!=null)){
window.clearTimeout(oTimein);
}
oTimein=window.setTimeout("openDialog(oNode)",iTimein*1000);
}
}
}
function glossaryInit(){
oDialog=fnCreateDialog(150,50);
}
function navigateTerm(){
var oNode=event.srcElement;
var iTermID=oNode.termID;
if(oNode!=aTerms[iTermID]){
var iAbsTop=getAbsoluteTop(aTerms[iTermID]);
if(iAbsTop<document.body.scrollTop){
window.scrollTo(document.body.scrollLeft,getAbsoluteTop(aTerms[iTermID]));
}
openDialog(aTerms[iTermID]);
}
}
function disableGlossary(){
if(bGlossary==true){
event.srcElement.innerText="Enable Automatic Glossary";
bGlossary=false;
hideDef();
}
else{
event.srcElement.innerText="Disable Automatic Glossary";
bGlossary=true;
}
}
function openGlossary(){
}
function fnSetMenus(){
var oNode=event.srcElement;
var oMenu=oNode.createMenu("SPAN","G_RID");
var oSubItem1=oNode.createMenuItem("Glossary",fnStub,oMenu,true);
document.body.createMenuItem("Open External Glossary",openGlossary,oSubItem1.subMenu);
document.body.createMenuItem("Disable Automatic Glossary",disableGlossary,oSubItem1.subMenu);
for(var i=0;i<aTerms.length;i++){
var oItem=document.body.createMenuItem(aTerms[i].innerText,navigateTerm,oMenu);
oItem.termID=i;
}
}
// This is a bogus stub.  It should be sniffed out rather than added in.
function fnStub(){
}
function fnAttachMenus(aTips){
// This walk is only necessary for the context menu.
var aTips=document.body.all.tags("SPAN");
for(var i=0;i<aTips.length;i++){
var oNode=aTips[i];
if(oNode.getAttribute("G_RID")){
var sTerm=oNode.getAttribute("G_RID");
if(typeof(g_glossary[sTerm])=="string"){
// Removed client-side scripting to add events.  This entire process should be singled out for IE 5 and later .. and, its only for the context menu.
aTerms[aTerms.length]=oNode;
}
}
}
if(oBD.majorVer>=5){
document.body.addBehavior(gsContextMenuPath);
document.body.onbehaviorready="fnSetMenus()";
document.body.oncontextopen="clearDef()";
}
}
// Called by showDef.  The showDef function sniffs for initialization.
function openDialog(oNode,x,y){
var bStatus=oDialog.dlg_status; // BUGBUG: This code assumes that oDialog has been initialized
if(bStatus==false){
oDialog.dlg_status=true;
oDialog.style.display="block";
}
else{
if(typeof(oTimeout)=="number"){
window.clearTimeout(oTimeout);
}
}
var sTerm=oNode.getAttribute("G_RID");
var oDef=oNode.children(0);
var sDef=oDef.text;
sDef=sDef.substr(4,sDef.length-7);	//Strips the html comment markers from the definition.
oDialog.innerHTML=sDef
var iScrollLeft=document.body.scrollLeft;
var iScrollTop=document.body.scrollTop;
var iOffsetLeft=getAbsoluteLeft(oNode)// - iScrollLeft;
var iOffsetWidth=oNode.offsetWidth;
var oParent=oNode.parentElement;
var iOffsetParentLeft=getAbsoluteLeft(oParent);
var iOffsetTop=getAbsoluteTop(oNode); //- iScrollTop;
var iOffsetDialogWidth=oDialog.offsetWidth;
if((iOffsetLeft + iOffsetWidth) > (iOffsetParentLeft + oParent.offsetWidth)){
iOffsetLeft=iOffsetParentLeft;
if(iOffsetLeft - iOffsetDialogWidth>0){
iOffsetTop+=oNode.offsetHeight;
}
}
var iLeft=0;
var iTop=0;
if((iOffsetLeft + iOffsetWidth - iScrollLeft + iOffsetDialogWidth) < document.body.offsetWidth ){
iLeft=iOffsetLeft + iOffsetWidth;
}
else{
if(iOffsetLeft - iOffsetDialogWidth>0){
iLeft=iOffsetLeft - iOffsetDialogWidth;
}
else{
iLeft=iOffsetParentLeft;
}
}
if(iOffsetTop - iScrollTop<oDialog.offsetHeight){
iTop=iOffsetTop + oNode.offsetHeight;
}
else{
iTop=iOffsetTop - oDialog.offsetHeight;
}
oDialog.style.top=iTop;
oDialog.style.left=iLeft;
oTimeout=window.setTimeout("hideDef()",iTimeout*1000);
}
function getAbsoluteTop(oNode){
var oCurrentNode=oNode;
var iTop=0;
while(oCurrentNode.tagName!="BODY"){
iTop+=oCurrentNode.offsetTop;
oCurrentNode=oCurrentNode.offsetParent;
}
return iTop;
}
function getAbsoluteLeft(oNode){
var oCurrentNode=oNode;
var iLeft=0;
while(oCurrentNode.tagName!="BODY"){
iLeft+=oCurrentNode.offsetLeft;
oCurrentNode=oCurrentNode.offsetParent;
}
return iLeft;
}
function fnCreateDialog(iWidth,iHeight){
document.body.insertAdjacentHTML("BeforeEnd","<DIV></DIV>");
oNewDialog=document.body.children(document.body.children.length-1);
oNewDialog.className="clsTooltip";
oNewDialog.style.width=iWidth;
oNewDialog.dlg_status=false;
return oNewDialog;
}
