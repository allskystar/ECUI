
// General comments are stored in this string.
var sGeneralComments="";
// Style comments are stored in this string.
var sStyleComments="";
// Default help text.
var sHelpText="Move the mouse pointer over an element in the Applies To list to display availability information for the listed platforms.";
var _gvRowData=new Array();
_gvRowData["win16"]={"name":"16-bit Windows","displayName":"Win16","row":0};
_gvRowData["win32"]={"name":"32-bit Windows","displayName":"Win32","row":0};
_gvRowData["ce"]={"name":"Windows CE","displayName":"Windows&nbsp;CE","row":0};
_gvRowData["unix"]={"name":"Unix","displayName":"Unix","row":0};
_gvRowData["mac"]={"name":"Macintosh","displayName":"Mac","row":0};
_gvRowData["plat:win"]={"name":"Windows","displayName":"Win","row":0};
var bATInit=false;
function fnATInit(){
if(typeof(oATTable) != 'undefined' && bATInit==false){
fnPostATInit();
bATInit=true;
}
}
function fnPostATInit(){
// Setup table when browser version is greater or equal to 4.
var oATNodes=oATData.all.tags("A");
if(oATNodes.length==0) oATNodes = oATData.all.tags("link");
var iMinVer=-1;
var vUseRowData={};
var vUseRowNames=new Array();
var iStyleVer=0;
var iCurrentStyleVer=0;
var iRuntimeStyleVer=0;
var iMinStyleVer=0;
var oExp=new RegExp("\\s","g");
for(var i=0;i<oATNodes.length;i++){
var oNode=oATNodes[i];
if(oNode.tagName=="A" || oNode.tagName=="link"){
oNode.onfocus=fnATData;
oNode.onblur=fnATClear;
var sPlatInfo=oNode.getAttribute("PLATINFO");
var sLinkName=oNode.innerText;
if(sPlatInfo!=null){
var aTemp=sPlatInfo.split(";");
for(var p=0;p<aTemp.length;p++){
var aThrash=aTemp[p].split("=");
var sVer=aThrash[1].replace(oExp,"");
var sPlatName=aThrash[0];
if((!vUseRowData[sPlatName])){
vUseRowData[sPlatName]=1;
vUseRowNames[vUseRowNames.length]=sPlatName;
}
var iVer=parseFloat(aThrash[1]);
if(iVer>0 && iMinVer<0){
iMinVer=iVer;
}
if(iVer>0 && iVer<iMinVer){
iMinVer=iVer;
}
if(iVer>0){
switch(sLinkName){
case "style":
iStyleVer=(iVer<iStyleVer || iStyleVer==0)?iVer:iStyleVer;
iMinStyleVer=(iVer<iMinStyleVer || iMinStyleVer==0)?iVer:iMinStyleVer;
break;
case "runtimeStyle":
iRuntimeStyleVer=(iVer<iRuntimeStyleVer || iRuntimeStyleVer==0)?iVer:iRuntimeStyleVer;
iMinStyleVer=(iVer<iMinStyleVer || iMinStyleVer==0)?iVer:iMinStyleVer;
break;
case "currentStyle":
iCurrentStyleVer=(iVer<iCurrentStyleVer || iCurrentStyleVer==0)?iVer:iCurrentStyleVer;
iMinStyleVer=(iVer<iMinStyleVer || iMinStyleVer==0)?iVer:iMinStyleVer;
break;
}
}
}
}
}
}
// Get project name from _topicdata XML data island, set project specific help strings.
if(typeof(_topicdata)=="object" && _topicdata.tagName=="XML"){
var sMemberName=_topicdata.getAttribute("name");
var sPN=_topicdata.getAttribute("pn");
var sMemberType=(sPN==null)?"property":"attribute";
sMemberName=(sPN==null)?sMemberName:sPN;
var sProj=_topicdata.getAttribute("proj");
var sAddHelpString="";
// Add project specific help messages here.
if(sProj){
switch(sProj){
case "pchealth":
break;
case "workshop":
sAddHelpString="  Internet Explorer does not expose this member on platforms that are not listed.";
break;
}
}
sHelpText+=sAddHelpString;
// Check _topicdata to determine if the reference is a style and/or currentstyle member
var bIsCurrentStyleProp=(_topicdata.getAttribute("is_currentstyle_prop"))?true:false;
var bIsStyleProp=(_topicdata.getAttribute("is_style_prop"))?true:false;
// If the member name or persistent name exists on _topicdata, and the document is a style or current style property, then formulate the dynamic sentence.
if(sMemberName!=null && (bIsStyleProp ||  bIsCurrentStyleProp)){
var vUseVer=iMinStyleVer;
var vStyleLink='<A STYLE="color: #2277FF;" HREF="../objects/obj_style.html">style</A>';
var vCurrentStyleLink='<A STYLE="color: #2277FF;" HREF="../objects/currentStyle.html">currentStyle</A>';
var vRuntimeStyleLink='<A STYLE="color: #2277FF;" HREF="../objects/runtimeStyle.html">runtimeStyle</A>';
// The style property was first available in IE 4.  This condition is present for error-checking.
if(iMinStyleVer<4 && iMinStyleVer>0){
vUseVer="4.0";
}
// Use iMark to determine the grammar of the prepositional phrase (object., or object, object, object, or object).
var iMark=0;
// If the member is a style property, the style property is greater than 0 (default), and the style property version is equal to the minimum *style version, then add the link and increment iMark.
var aStyleObjList = new Array();
if(bIsStyleProp && iStyleVer>0 && iStyleVer==iMinStyleVer){
aStyleObjList[aStyleObjList.length] = vStyleLink;
}
if(iCurrentStyleVer>0 && iCurrentStyleVer==iMinStyleVer){
aStyleObjList[aStyleObjList.length] = vCurrentStyleLink;
}
if(iRuntimeStyleVer>0 && iRuntimeStyleVer==iMinStyleVer){
aStyleObjList[aStyleObjList.length] = vRuntimeStyleLink;
}
if (aStyleObjList.length > 0)
{
sStyleComments="Objects that expose the <B>" + sMemberName + "</B> " + sMemberType + " as of Internet Explorer " + vUseVer + " or later are accessible through script using the ";
switch(aStyleObjList.length)
{
case 1:
sStyleComments += aStyleObjList[0];
break;
case 2:
sStyleComments += aStyleObjList[0] + " or " + aStyleObjList[1];
break;
default:
for (var i = 0; i < aStyleObjList.length; i++)
{
sStyleComments += aStyleObjList[i];
if (i == aStyleObjList.length-2)
{
sStyleComments += ", or ";
}
else
{
sStyleComments += ", ";
}
}
sStyleComments = sStyleComments.replace(/,\s*$/, "");
}
sStyleComments += " object" + (aStyleObjList.length > 1 ? "s" : "") + ".";
}
// This condition checks if the member was exposed to the style object before or at the same time as the currentStyle and runtimeStyle objects.
if(iCurrentStyleVer > iMinStyleVer || iRuntimeStyleVer>iMinStyleVer){
var iNextMin=(iRuntimeStyleVer>iMinStyleVer && iRuntimeStyleVer<=((iCurrentStyleVer>iMinStyleVer)?iCurrentStyleVer:iRuntimeStyleVer))?iRuntimeStyleVer:iCurrentStyleVer;
sStyleComments+="  They are also accessible in Internet Explorer " + iNextMin + " or later using the ";
if(iCurrentStyleVer==iRuntimeStyleVer){
sStyleComments+=vCurrentStyleLink + " object or the " + vRuntimeStyleLink + " object.";
}
else{
if(iCurrentStyleVer > iMinStyleVer && iCurrentStyleVer==iNextMin){
sStyleComments+=vCurrentStyleLink + " object";
}
if(iRuntimeStyleVer>iMinStyleVer && iRuntimeStyleVer==iNextMin){
sStyleComments+=vRuntimeStyleLink + " object";
}
}
if(iCurrentStyleVer > iNextMin || iRuntimeStyleVer>iNextMin){
var iMax=(iCurrentStyleVer>iRuntimeStyleVer)?iCurrentStyleVer:iRuntimeStyleVer;
var vLink=(iCurrentStyleVer>iRuntimeStyleVer)?vCurrentStyleLink:vRuntimeStyleLink;
sStyleComments+=", and in Internet Explorer " + iMax + " or later using the " + vLink + " object.";
}
else{
sStyleComments+=".";
}
}
}
}
// Create the platform columns.
fnAddATDataRows(vUseRowNames);
// Set display styles and event handlers.
if(vUseRowNames.length>0){
oATData.width="85%";
oPlatData.width="100%";
oPlatData.parentElement.style.display="block";
oATData.onmouseover=fnATData;
oATData.onmouseout=fnATClear;
oATData.onfocus=fnATData;
oATData.onblur=fnATClear;
var oATC=oATTable.rows(oATTable.rows.length-1).cells(0);
oATC.innerHTML=sHelpText;
oATC.style.display="block";
var oHasFocus=document.activeElement;
if(oHasFocus.parentElement==oATData){
fnUnPack(oHasFocus,true);
}
else{
oATHelp.style.display="block";
}
}
}
function fnAddATDataRows(aUseRowNames){
var sTableData='<TABLE CLASS="TMATPD" ID="oPlatData" BORDER="0" CELLSPACING="1">';
sTableData+='<TR><TH STYLE="font-weight: normal;" CLASS="atLabel" TITLE="The name of the object that has focus or is selected in the applies to list." COLSPAN=2>[ Object Name ]</TH></TR>';
sTableData+='<TR><TH CLASS="atLabel" TITLE="Platforms that run Internet Explorer.">Platform</TH><TH  CLASS="atLabel" TITLE="This column lists the first version of Internet Explorer that the selected element supported this member." >Version</TH></TR>';
// iRowIndex is set to 2 because the first two rows (above) are used for labels.
var iRowIndex=2;
var iUseLen=aUseRowNames.length;
for(var i=0;i<iUseLen;i++){
var sPlatName=aUseRowNames[i];
var vData=_gvRowData[sPlatName];
// If the platform name is defined in the global hash (defined at top of this file), then add the row and record the row index for use when updating the values.
// The row is hidden until the first call fnUnPack()
if(vData){
sTableData+='<TR STYLE="cursor: default;display: none;" TITLE="Version of Internet Explorer that the selected element supported this member for the ' + vData.name + ' platform."><TD>' + vData.displayName + ':</TD><TD STYLE="text-align: right;"></TD></TR>';
_gvRowData[sPlatName].row=iRowIndex;
iRowIndex++;
}
}
// Add the help row.
sTableData+='<TR STYLE="display: none; font-size: 8pt;" ID=oATHelp><TD COLSPAN=2>Version data is listed when the mouse hovers over a link, or the link has focus.</TD></TR>';
sTableData+='</TABLE>';
if(iUseLen>0){
// Insert the HTML into the applies-to table.
oATTable.rows(0).cells(0).innerHTML=sTableData;
}
}
function fnATClear(){
var oHasFocus=document.activeElement;
if(oHasFocus.parentElement==oATData){
fnUnPack(oHasFocus,false);
}
}
function fnATData(){
var oWorkItem=event.srcElement;
if(oWorkItem.tagName=="A" || oWorkItem.tagName=="link"){
fnUnPack(oWorkItem,false);
}
}
function fnUnPack(oNode,bWasActiveElement){
if((typeof(oATHelp)=='object') && (typeof(oPlatData)=='object')){
if(oATHelp.style.display!="none" || bWasActiveElement){
oATHelp.style.display="none";
for(var i=0;i<oPlatData.rows.length;i++){
var oRow=oPlatData.rows[i];
if(oRow!=oATHelp){
oRow.style.display="block";
}
}
}
// all values default to N/A
// first two rows, and the last row, are for labels
var aRows=oPlatData.rows;
for(var i=2;i<aRows.length-1;i++){
aRows(i).cells(1).innerText="N/A";
}
// Split the value of the PLATINFO attribute and display it in the appropriate row.
var sPlatInfo=oNode.getAttribute("PLATINFO");
if(sPlatInfo){
var aATThrash=sPlatInfo.split(";");
var oExp=new RegExp("\\s","g");
for(var i=0;i<aATThrash.length;i++){
var aPlatThrash=aATThrash[i].split("=");
var sPlatName=aPlatThrash[0];
if((sPlatName!="")&&(aPlatThrash[1]!="")){
var vData=_gvRowData[sPlatName];
if(vData && vData.row){
var oRow=oPlatData.rows[vData.row];
var sVer=aPlatThrash[1];
sVer=sVer.replace(oExp,"");
if(sVer=="NA"){
sVer="N/A";
}
oRow.cells(1).innerText=sVer;
}
}
}
}
// Clip the label if the length is greater than 13; this is for display purposes.
var sLabelName=oNode.innerText;
if(sLabelName.length>13){
sLabelName=sLabelName.substring(0,13) + "...";
}
// Set the label and tooltip to the anchor caption.
oPlatData.rows(0).cells(0).innerText=sLabelName;
oPlatData.rows(0).cells(0).title=oNode.innerText;
var oATComment=document.all[oNode.sourceIndex+1];
var sATComment="";
var oATC=oATTable.rows(oATTable.rows.length-1).cells(0);
if(typeof(oATComment)=="object"){
if((oATComment.tagName=="!")||(oATComment.tagName=="COMMENT")){
sATComment=oATComment.outerHTML;
var oExp=new RegExp("(<!--|-->)","g");
sATComment=sATComment.replace(oExp,"");
}
}
if(sATComment!=""){
oATC.innerHTML=sATComment + "<BR>";
oATC.innerHTML+=sGeneralComments + sStyleComments;
}
else{
if((sGeneralComments=="")&&(sStyleComments=="")){
oATC.innerHTML=sHelpText;
}
else{
oATC.innerHTML=sGeneralComments + sStyleComments;
}
}
}
}
