var RTL = false;
var scFlag = false;
var scrollcount = 0;
if (document.dir == 'rtl')
RTL = true;
var Strict_Compat = false;
var ToolBar_Supported = false;
var Frame_Supported   = false;
var DoInstrumentation = false;
var doImage = doImage;
var TType = TType;
if (navigator.userAgent.indexOf("MSIE")    != -1 &&
navigator.userAgent.indexOf("Windows") != -1 &&
navigator.appVersion.substring(0,1) > 3)
{
ToolBar_Supported = true;
if(!RTL){
if (document.compatMode == "CSS1Compat")
{
//alert("strict!");
Strict_Compat = true;
}
}
}
if(doImage == null)
{
var a= new Array();
a[0] = prepTrackingString(window.location.hostname,7);
if (TType == null)
{
a[1] = prepTrackingString('PV',8);
}
else
{
a[1] = prepTrackingString(TType,8);
}
a[2] = prepTrackingString(window.location.pathname,0);
if( '' != window.document.referrer)
{
a[a.length] = prepTrackingString(window.document.referrer,5);
}
if (navigator.userAgent.indexOf("SunOS") == -1 && navigator.userAgent.indexOf("Linux") == -1)
{
buildIMG(a);
}
}
if (ToolBar_Supported)
{
var newLineChar = String.fromCharCode(10);
var char34 = String.fromCharCode(34);
var LastMSMenu = "";
var LastICPMenu = "";
var CurICPMenu = "";
var IsMSMenu = false;
var IsMenuDropDown = true;
var HTMLStr;
var FooterStr;
var TBLStr;
var x = 0;
var y = 0;
var x2 = 0;
var y2 = 0;
var x3 = 0;
var MSMenuWidth;
var ToolbarMinWidth;
var ToolbarMenu;
var ToolbarBGColor;
var ToolbarLoaded = false;
var aDefMSColor  = new Array(3);
var aDefICPColor = new Array(3);
var aCurMSColor  = new Array(3);
var aCurICPColor = new Array(3);
var MSFont;
var ICPFont;
var MSFTFont;
var ICPFTFont;
var MaxMenu = 30;
var TotalMenu = 0;
var arrMenuInfo = new Array(30);
var bFstICPTBMenu = true;
var bFstICPFTMenu = true;
// Output style sheet and toolbar ID
document.write("<SPAN ID='StartMenu' STYLE='display:none;'></SPAN>");
// Build Footer template
if ( !RTL ){
FooterStr = "<TABLE ID='idFooter1' STYLE='background-color:white;' cellSpacing='0' cellPadding='0' border='0'>" +
"<TR VALIGN='BOTTOM'><TD ID='idPosition' WIDTH='185'>&nbsp;</TD><TD ID='idFooterDate1' STYLE='background-color:white;height:30' NOWRAP><!--ICP_FOOTERDATE1_TITLES--></TD></TR>" +
"<TR VALIGN='BOTTOM'><TD COLSPAN='2' ID='idFooterDate2' STYLE='background-color:white;height:13;width:100%' NOWRAP><!--ICP_FOOTERDATE2_TITLES--></TD></TR>" +
"</TABLE><TABLE ID='idFooter' STYLE='background-color:white;width:100%' cellSpacing='0' cellPadding='0' border='0'>" +
"<TR VALIGN='MIDDLE'><TD ID='idFooterRow1' STYLE='background-color:white;height:20;width:100%' NOWRAP><!--ICP_FOOTERMENU_TITLES--></TD></TR>" +
"<TR VALIGN='MIDDLE'><TD ID='idFooterRow2' STYLE='background-color:white;height:30;width:100%' NOWRAP><!--MS_FOOTERMENU_TITLES--></TD></TR>" +
"</TABLE>";
}else if(RTL){
// Shailr - Not sure if I need this code yet.
// RTL Correction: Check if <html> or <body> have the dir="rtl" attribute
var isRTL = false;
var isIE5 = navigator.appVersion.indexOf("MSIE 4") == -1;
if (isIE5)
{
if (document.body.dir == 'rtl' || document.dir == 'rtl')
isRTL = true;
}
else // test RTL in IE4
{
var ht = document.body.outerHTML;
ht = ht.substring(1, ht.indexOf(">")).toLowerCase();
//if (ht.indexOf("dir=rtl") > -1) isRTL = true;
if ((ht.indexOf("iedir=rtl") > -1) || (ht.indexOf("dir=rtl") > -1)) isRTL = true;
}
// End of RTL Correction.
// MNP1 addition - Build Footer template
FooterStr = "<TABLE ID='idFooter1' STYLE='background-color:white;' cellSpacing='0' cellPadding='0' border='0'>" +
"<TR VALIGN='BOTTOM'><TD ID='idPosition' WIDTH='185'>&nbsp;</TD><TD ID='idFooterDate1' STYLE='background-color:white;height:30' NOWRAP><!--ICP_FOOTERDATE1_TITLES--></TD></TR>" +
"<TR VALIGN='BOTTOM'><TD COLSPAN='2' ID='idFooterDate2' STYLE='background-color:white;height:13;width:100%' NOWRAP><!--ICP_FOOTERDATE2_TITLES--></TD></TR>" +
"</TABLE><TABLE ID='idFooter' STYLE='background-color:white;width:100%' cellSpacing='0' cellPadding='0' border='0'>" +
"<TR VALIGN='MIDDLE'><TD ID='idFooterRow1' STYLE='background-color:white;height:20;width:100%' NOWRAP><!--ICP_FOOTERMENU_TITLES--></TD></TR>" +
"<TR VALIGN='MIDDLE'><TD ID='idFooterRow2' STYLE='background-color:white;height:30;width:100%' NOWRAP><!--MS_FOOTERMENU_TITLES--></TD></TR>" +
"</TABLE>";
//end of MNP1 addition
//isRTL = true;
}
// Build toolbar template
HTMLStr = "<DIV ID='idToolbar'     STYLE='background-color:white;width:100%;'>";
HTMLStr += "<DIV ID='idRow1'        STYLE='position:relative;height:20px;'>";
//HTMLStr += "<DIV ID='idICPBanner'   STYLE='position:absolute;top:0px;left:0px;height:60px;width:250px;overflow:hidden;vertical-align:top;'><!--BEG_ICP_BANNER--><!--END_ICP_BANNER--></DIV>";
if (!RTL){
//HTMLStr = "<DIV ID='idToolbar'     STYLE='background-color:white;width:100%'>";
//HTMLStr += "<DIV ID='idRow1'        STYLE='position:relative;height:20px;'>";
HTMLStr += "<DIV ID='idICPBanner'   STYLE='position:absolute;top:0px;left:0px;height:60px;width:250px;overflow:hidden;vertical-align:top;'><!--BEG_ICP_BANNER--><!--END_ICP_BANNER--></DIV>";
HTMLStr += "<DIV ID='idMSMenuCurve' STYLE='position:absolute;top:0px;left:250px;height:20px;width:18px;overflow:hidden;vertical-align:top;'><IMG SRC='../commom/curve.gif' BORDER=0></DIV>";
HTMLStr += "<DIV ID='idMSMenuPane'  STYLE='position:absolute;top:0px;left:250px;height:20px;width:10px;background-color:black;float:right;' NOWRAP><!--MS_MENU_TITLES--></DIV>";
HTMLStr += "</DIV>";
}else if(RTL){
TBLStr  = "<TABLE BORDER=0 CELLPADDING=0 CELLSPACING=0><TR STYLE='height:20;vertical-align:middle'><!--ICP_MENU_TITLES--></TR></TABLE>";
//HTMLStr = "<DIV ID='idToolbar'     STYLE='background-color:white;width:100%'>";
//HTMLStr += "<DIV ID='idRow1'        STYLE='position:relative;height:20;'>";
HTMLStr += "<DIV ID='idICPBanner'   STYLE='position:absolute;top:0;left:0;height:60;width:250;overflow:hidden;vertical-align:top;'><!--BEG_ICP_BANNER--><!--END_ICP_BANNER--></DIV>";
HTMLStr += "<DIV ID='idMSMenuCurve' STYLE='position:absolute;top:0;left:250;height:20;width:18;overflow:hidden;vertical-align:top;'><IMG SRC='../commom/curve.gif' BORDER=0></DIV>";
// RTL Correction: added: dir='ltr' (forcing LTR!), added: &nbsp; (prevents last menu problem)
HTMLStr += "<DIV dir='ltr' lang='he' ID='idMSMenuPane'  STYLE='position:absolute;top:0;left:250;height:20;width:10;color:white;background-color:black;float:left;' NOWRAP><!--MS_MENU_TITLES-->&nbsp;</DIV>";
HTMLStr += "</DIV>";
}
if(!RTL){
HTMLStr += "<DIV ID='idRow2' STYLE='position:relative;left:250px;height:40px;'>";
HTMLStr += "<DIV ID='idADSBanner'   STYLE='position:absolute;top:0px;left:0px;height:40px;width:200px;vertical-align:top;overflow:hidden;'><!--BEG_ADS_BANNER--><!--END_ADS_BANNER--></DIV>";
HTMLStr += "<DIV ID='idMSCBanner'   STYLE='position:absolute;top:0px;left:180px;height:40px;width:112px;vertical-align:top;overflow:hidden;' ALIGN=RIGHT><!--BEG_MSC_BANNER--><!--END_MSC_BANNER--></DIV>";
HTMLStr += "</DIV>";
}else if(RTL){
HTMLStr += "<DIV ID='idRow2' STYLE='position:relative;left:000;height:40px;'>" ; // RTL Correction: was left:250
HTMLStr += "<DIV ID='idADSBanner'   STYLE='position:absolute;top:0;left:0;height:40;width:200;vertical-align:top;overflow:hidden;'><!--BEG_ADS_BANNER--><!--END_ADS_BANNER--></DIV>";
HTMLStr += "<DIV ID='idMSCBanner'   STYLE='position:absolute;top:0;left:200;height:40;width:112;vertical-align:top;overflow:hidden;' ALIGN=LEFT><!--BEG_MSC_BANNER--><!--END_MSC_BANNER--></DIV>";
HTMLStr += "</DIV>";
}
if(!RTL){
HTMLStr += "<DIV ID='idRow3' STYLE='position:relative;height:20px;width:100%'>";
// zIndex Correction
HTMLStr += "<DIV ID='idICPMenuPane' STYLE='position:absolute;top:0px;left:0px;height:20px;background-color:black;' NOWRAP><!--ICP_MENU_TITLES--></DIV>";
HTMLStr += "</DIV>";
HTMLStr += "</DIV>";
}else if (RTL){
HTMLStr += "<DIV ID='idRow3' STYLE='position:relative;height:20px;width:100%'>";
// RTL Correction: added: dir='rtl'
HTMLStr += "<DIV dir='rtl' ID='idICPMenuPane' STYLE='position:absolute;top:0;left:0;height:20px;color:white;background-color:black;' NOWRAP><!--ICP_MENU_TITLES--></DIV>";
HTMLStr += "</DIV>";
HTMLStr += "</DIV>";
HTMLStr += "<SCRIPT FOR=idToolbar EVENT=onresize>resizeToolbar();</SCRIPT>";
HTMLStr += "<SCRIPT FOR=idToolbar EVENT=onmouseover>hideMenu();</SCRIPT>";
}
HTMLStr += 	"<SCRIPT TYPE='text/javascript'>" +
"   var ToolbarMenu = StartMenu;" +
"</SCRIPT>" +
"<DIV WIDTH=100%>";
// Define event handlers
if(!RTL){
window.onresize  = resizeToolbar;
window.onscroll  = scrollbaroptions;
}
// Intialize global variables
ToolbarBGColor	= "white";						// toolbar background color
if (Strict_Compat)
{
MSFont  = "bold x-small Arial";
ICPFont = "bold x-small Verdana";
}
else
{
if( !RTL ){
MSFont  = "xx-small Verdana";
ICPFont = "bold xx-small Verdana";
}else if(RTL){
MSFont  = "x-small Arial";	 // RTL Correction: (was Verdana)
ICPFont = "bold x-small Arial"; // RTL Correction: (was Verdana)
//MNP1 RTL revision
MSFTFont = "11px Arial";
ICPFTFont = "bold 11px Arial"
}
}
aDefMSColor[0]	= aCurMSColor[0]  = "black";	// bgcolor;
aDefMSColor[1]	= aCurMSColor[1]  = "white";	// text font color
aDefMSColor[2]  = aCurMSColor[2]  = "red";		// mouseover font color
aDefICPColor[0]	= aCurICPColor[0] = "#6699CC";	// bgcolor;
aDefICPColor[1] = aCurICPColor[1] = "white";	// text font color
aDefICPColor[2] = aCurICPColor[2] = "red";		// mouseover font color
}
// The hard-coded numbers in functions - drawToolbar() & resizeToolbar()
// correspond to the dimension of the four gif files:
//		ICP_BANNER: 60h x 250w
//		ADS_BANNER: 40h x 200w
//		MSC_BANNER: 40h x 112w
//		Curve:	    20h x 18w
function drawFooter(sLastUpdated, position)
{
if(!RTL){
var re = "<!--TEMPCOLOR-->";
var sUpdatedDate = "";
if (ToolbarBGColor.toUpperCase() == "WHITE" || ToolbarBGColor.toUpperCase() == "#FFFFFF")
{
while (FooterStr.indexOf(re) != -1)
FooterStr = FooterStr.replace(re, "000000");
}
else
{
while (FooterStr.indexOf(re) != -1)
FooterStr = FooterStr.replace(re, aDefICPColor[1]);
}
var re2 = "<!--TEMPCOLOR2-->";
while (FooterStr.indexOf(re2) != -1)
FooterStr = FooterStr.replace(re2, aDefICPColor[2]);
}else if (RTL){
var re = /<!--TEMPCOLOR-->/g;
var sUpdatedDate = "";
if (ToolbarBGColor.toUpperCase() == "WHITE" || ToolbarBGColor.toUpperCase() == "#FFFFFF")
FooterStr = FooterStr.replace(re, "000000");
else
FooterStr = FooterStr.replace(re, aDefICPColor[1]);
var re2 = /<!--TEMPCOLOR2-->/g;
FooterStr = FooterStr.replace(re2, aDefICPColor[2]);
}
sUpdatedDate = "<SPAN STYLE='font:" + MSFont + "'>"
if (typeof sLastUpdated != "undefined")
sUpdatedDate += sLastUpdated;
sUpdatedDate += "</SPAN>";
FooterStr = FooterStr.replace("<!--ICP_FOOTERDATE1_TITLES-->", sUpdatedDate);
document.body.innerHTML += FooterStr;
idFooterRow1.style.backgroundColor  = aDefICPColor[0];
idFooterRow2.style.backgroundColor  = ToolbarBGColor;
if (typeof sLastUpdated == "undefined")
idFooter1.style.display = "none";
if (typeof position != "undefined")
idPosition.width = position;
}
function drawToolbar()
{
HTMLStr += "</DIV>";
document.write(HTMLStr);
ToolbarLoaded = true;
MSMenuWidth     = Math.max(idMSMenuPane.offsetWidth, (200+112));
ToolbarMinWidth = (250+18) + MSMenuWidth;
idToolbar.style.backgroundColor     = ToolbarBGColor;
idMSMenuPane.style.backgroundColor  = aDefMSColor[0];
idICPMenuPane.style.backgroundColor = aDefICPColor[0];
if (RTL){
idMSMenuPane.style.color			= aDefMSColor[1];
idICPMenuPane.style.color			= aDefICPColor[1];
}
resizeToolbar();
for (i = 0; i < TotalMenu; i++)
{
thisMenu = document.all(arrMenuInfo[i].IDStr);
if (thisMenu != null)
{
if (arrMenuInfo[i].IDStr == LastMSMenu && arrMenuInfo[i].type == "R")
{
//Last MSMenu has to be absolute width
arrMenuInfo[i].type = "A";
arrMenuInfo[i].unit = 200;
}
if (arrMenuInfo[i].type == "A")
if(!RTL){
thisMenu.style.width = arrMenuInfo[i].unit + 'px';
}else{
thisMenu.style.width = arrMenuInfo[i].unit;
}
else
thisMenu.style.width = Math.round(arrMenuInfo[i].width * arrMenuInfo[i].unit) + 'em';
}
}
}
function resizeToolbar()
{
scFlag = false;
scrollcount = 0;
if (ToolBar_Supported == false) return;
w = Math.max(ToolbarMinWidth, document.body.clientWidth) - ToolbarMinWidth;
if ( !RTL ){
if (document.all("idMSMenuCurve"))
{
idMSMenuCurve.style.left  = (250+w) + 'px';
idMSMenuPane.style.left   = (250+w+18) + 'px';
idMSMenuPane.style.width  = MSMenuWidth  + 'px';
idADSBanner.style.left    = (w+18)  + 'px';
idMSCBanner.style.left    = (w+18+200)  + 'px';
idMSCBanner.style.width   = (MSMenuWidth - 200)  + 'px';
idICPMenuPane.style.width = ToolbarMinWidth + w  + 'px';
}
}else if( RTL ){
idMSMenuCurve.style.left  = MSMenuWidth;	// RTL Correction: was (250+w);
idMSMenuPane.style.left   = 0;			// RTL Correction: was (250+w+18);
idMSMenuPane.style.width  = MSMenuWidth;
idADSBanner.style.left    = 112;		// RTL Correction: was (w+18);
idMSCBanner.style.left    = 0;			// RTL Correction: was (w+18+200);
idMSCBanner.style.width   = (MSMenuWidth - 200);
idICPMenuPane.style.width = ToolbarMinWidth + w;
idICPBanner.style.left    = MSMenuWidth + 18 + w; // RTL Correction: line added for ICPBanner positioning
}
}
function setToolbarBGColor(color)
{
ToolbarBGColor = color;
if (ToolbarLoaded == true)
idToolbar.style.backgroundColor = ToolbarBGColor;
}
function setBannerColor(bannerColor, bgColor, fontColor, mouseoverColor)
{
if (bannerColor.toUpperCase() != "WHITE" && bannerColor.toUpperCase() != "FFFFFF")
bgColor = bannerColor;
setToolbarBGColor(bannerColor);
setDefaultICPMenuColor(bgColor, fontColor, mouseoverColor);
}
function setMSMenuFont(sFont)
{
MSFont = sFont;
}
function setICPMenuFont(sFont)
{
ICPFont = sFont;
}
function setDefaultMSMenuColor(bgColor, fontColor, mouseoverColor)
{
if (bgColor   != "")	  aDefMSColor[0] = bgColor;
if (fontColor != "")	  aDefMSColor[1] = fontColor;
if (mouseoverColor != "") aDefMSColor[2] = mouseoverColor;
}
function setDefaultICPMenuColor(bgColor, fontColor, mouseoverColor)
{
if (bgColor   != "")	  aDefICPColor[0] = bgColor;
if (fontColor != "")	  aDefICPColor[1] = fontColor;
if (mouseoverColor != "") aDefICPColor[2] = mouseoverColor;
}
function setICPMenuColor(MenuIDStr, bgColor, fontColor, mouseoverColor)
{
if (ToolbarLoaded == false) return;
// Reset previous ICP Menu color if any
if (CurICPMenu != "")
{
PrevID = CurICPMenu.substring(4);
CurICPMenu = "";
setICPMenuColor(PrevID, aDefICPColor[0], aDefICPColor[1], aDefICPColor[2]);
}
var	id = "AM_" + "ICP_" + MenuIDStr;
var thisMenu = document.all(id);
if (thisMenu != null)
{
CurICPMenu = "ICP_" + MenuIDStr;
aCurICPColor[0] = bgColor;
aCurICPColor[1] = fontColor;
aCurICPColor[2] = mouseoverColor;
// Change menu color
if (bgColor != "")
thisMenu.style.backgroundColor = bgColor;
if (fontColor != "")
thisMenu.style.color = fontColor;
// Change subMenu color
id = "ICP_" + MenuIDStr;
thisMenu = document.all(id);
if (thisMenu != null)
{
if (bgColor != "")
thisMenu.style.backgroundColor = bgColor;
if (fontColor != "")
{
i = 0;
id = "AS_" + "ICP_" + MenuIDStr;
thisMenu = document.all.item(id,i);
while (thisMenu != null)
{
thisMenu.style.color = fontColor;
i += 1;
thisMenu = document.all.item(id,i);
}
}
}
}
}
function setAds(Gif,Url,AltStr)
{	setBanner(Gif,Url,AltStr,"<!--BEG_ADS_BANNER-->","<!--END_ADS_BANNER-->");
}
function setICPBanner(Gif,Url,AltStr)
{
if(RTL){
if (Gif.indexOf("training_banner_training.gif") > 0){
Gif = "training_banner_training.gif";
}
}
setBanner(Gif,Url,AltStr,"<!--BEG_ICP_BANNER-->","<!--END_ICP_BANNER-->");
}
function setMSBanner(Gif,Url,AltStr)
{	tempGif = "/library/toolbar/images/" + Gif;
setBanner(tempGif,Url,AltStr,"<!--BEG_MSC_BANNER-->","<!--END_MSC_BANNER-->");
}
function setBanner(BanGif, BanUrl, BanAltStr, BanBegTag, BanEndTag)
{
begPos = HTMLStr.indexOf(BanBegTag);
endPos = HTMLStr.indexOf(BanEndTag) + BanEndTag.length;
SubStr = HTMLStr.substring(begPos, endPos);
SrcStr = "";
if (BanUrl != "")
SrcStr += "<A Target='_top' HREF='" + formatURL(BanUrl, BanGif) + "'>";
SrcStr += "<IMG SRC='" + BanGif + "' ALT='" + BanAltStr + "' BORDER=0>";
if (BanUrl != "")
SrcStr += "</A>";
SrcStr = BanBegTag + SrcStr + BanEndTag;
HTMLStr = HTMLStr.replace(SubStr, SrcStr);
}
function setICPSubMenuWidth(MenuIDStr, WidthType, WidthUnit)
{	tempID = "ICP_" + MenuIDStr;
setSubMenuWidth(tempID, WidthType, WidthUnit);
}
function setMSSubMenuWidth(MenuIDStr, WidthType, WidthUnit)
{	tempID = "MS_" + MenuIDStr;
setSubMenuWidth(tempID, WidthType, WidthUnit);
}
function setSubMenuWidth(MenuIDStr, WidthType, WidthUnit)
{
var fFound = false;
if (TotalMenu == MaxMenu)
{
alert("Unable to process menu. Maximum of " + MaxMenu + " reached.");
return;
}
for (i = 0; i < TotalMenu; i++)
if (arrMenuInfo[i].IDStr == MenuIDStr)
{
fFound = true;
break;
}
if (!fFound)
{
arrMenuInfo[i] = new menuInfo(MenuIDStr);
TotalMenu += 1;
}
if (!fFound && WidthType.toUpperCase().indexOf("DEFAULT") != -1)
{
arrMenuInfo[i].type = "A";
arrMenuInfo[i].unit = 160;
}
else
{
arrMenuInfo[i].type = (WidthType.toUpperCase().indexOf("ABSOLUTE") != -1)? "A" : "R";
arrMenuInfo[i].unit = WidthUnit;
}
}
// This function creates a menuInfo object instance.
function menuInfo(MenuIDStr)
{
this.IDStr = MenuIDStr;
this.type  = "";
this.unit  = 0;
this.width = 0;
this.count = 0;
}
function updateSubMenuWidth(MenuIDStr)
{
for (i = 0; i < TotalMenu; i++)
if (arrMenuInfo[i].IDStr == MenuIDStr)
{
if (arrMenuInfo[i].width < MenuIDStr.length)
arrMenuInfo[i].width = MenuIDStr.length;
arrMenuInfo[i].count = arrMenuInfo[i].count + 1;
break;
}
}
function addICPMenu(MenuIDStr, MenuDisplayStr, MenuHelpStr, MenuURLStr)
{
if(RTL){
if (LastICPMenu == "") HTMLStr = HTMLStr.replace("<!--ICP_MENU_TITLES-->", TBLStr);
}
if (addICPMenu.arguments.length > 4)
TargetStr = addICPMenu.arguments[4];
else
TargetStr = "_top";
tempID = "ICP_" + MenuIDStr;
addMenu(tempID, MenuDisplayStr, MenuHelpStr, MenuURLStr, TargetStr, true);
if (RTL){
LastICPMenu = tempID;
}else{
bFstICPTBMenu=false;
}
}
function addMSMenu(MenuIDStr, MenuDisplayStr, MenuHelpStr, MenuURLStr)
{
TargetStr = "_top";
tempID = "MS_" + MenuIDStr;
//alert(" TempID: " + tempID +  " MenuDisplayString: " + MenuDisplayStr + " Menu Help String :" + MenuHelpStr + " MenuUrl:" + MenuURLStr + " Target:" + TargetStr);
addMenu(tempID, MenuDisplayStr, MenuHelpStr, MenuURLStr, TargetStr, false);
LastMSMenu = tempID;
}
function addMenu(MenuIDStr, MenuDisplayStr, MenuHelpStr, MenuURLStr, TargetStr, bICPMenu)
{
cFont   = bICPMenu? ICPFont : MSFont;
cColor0 = bICPMenu? aDefICPColor[0] : aDefMSColor[0];
cColor1 = bICPMenu? aDefICPColor[1] : aDefMSColor[1];
cColor2 = bICPMenu? aDefICPColor[2] : aDefMSColor[2];
if (RTL){
cStyle  = "font:" + cFont + ";background-color:" + cColor0 + ";color:" + cColor1 + ";";
if (MenuHelpStr == "") MenuHelpStr = MenuDisplayStr; // Shailr. This line should have been before the line MenuStr = newLineChar; but I am tryig to avoid another if..else
}
tagStr  = bICPMenu? "<!--ICP_MENU_TITLES-->" : "<!--MS_MENU_TITLES-->";
MenuStr = newLineChar;
if (!RTL){
if ((bICPMenu == false && LastMSMenu != "") || (bICPMenu == true && bFstICPTBMenu==false))
MenuStr += "<SPAN STYLE='font:" + cFont + ";color:" + cColor1 + "'>|&nbsp;</SPAN>";
MenuStr += "<A TARGET='" + TargetStr + "' TITLE='" + MenuHelpStr + "'" +
"   ID='AM_" + MenuIDStr + "'" +
"   STYLE='text-decoration:none;cursor:hand;font:" + cFont + ";background-color:" + cColor0 + ";color:" + cColor1 + ";'";
if (MenuURLStr != "")
{
if (bICPMenu)
MenuStr += " HREF='" + formatURL(MenuURLStr, ("ICP_" + MenuDisplayStr)) + "'";
else
MenuStr += " HREF='" + formatURL(MenuURLStr, ("MS_" + MenuDisplayStr)) + "'";
}
else
MenuStr += " HREF='' onclick='window.event.returnValue=false;'";
MenuStr += 	" onmouseout="  + char34 + "mouseMenu('out' ,'" + MenuIDStr + "'); hideMenu();" + char34 +
" onmouseover=" + char34 + "mouseMenu('over','" + MenuIDStr + "'); doMenu('"+ MenuIDStr + "');" + char34 + ">" +
"&nbsp;" + MenuDisplayStr + "&nbsp;</a>";
MenuStr += tagStr;
}
if ( RTL ){
if (bICPMenu)
MenuStr += "<TD STYLE='" + cStyle + "' ID='AM_" + MenuIDStr + "' NOWRAP>";
else{
// RTL Correction: added: dir='rtl' (for MSMenu)
MenuStr += "<SPAN dir='rtl' STYLE='" + cStyle + "'>";
if (LastMSMenu != "") MenuStr += "|";
MenuStr += "&nbsp;";
}
MenuStr += "<A STYLE='text-decoration:none;cursor:hand;font:" + cFont + ";color:" + cColor1 + ";'" +
"   TARGET='" + TargetStr + "'" +
"   TITLE=" + char34 + MenuHelpStr + char34;
if (MenuURLStr != "")
MenuStr += " HREF='" + formatURL(MenuURLStr, ((bICPMenu? "ICP_":"MS_") + MenuDisplayStr)) + "'";
else
MenuStr += " HREF='' onclick='window.event.returnValue=false;'";
MenuStr += " onmouseout="  + char34 + "mouseMenu('out' ,'" + MenuIDStr + "'); hideMenu();" + char34 +
" onmouseover=" + char34 + "mouseMenu('over','" + MenuIDStr + "'); doMenu('"+ MenuIDStr + "');" + char34 + ">" +
"&nbsp;" + MenuDisplayStr + "&nbsp;</a>";
if (bICPMenu)
MenuStr += "&nbsp;</TD><TD STYLE='" + cStyle + "'>|</TD>";
else
MenuStr += "</SPAN>";
MenuStr += tagStr;
}
HTMLStr = HTMLStr.replace(tagStr, MenuStr);
setSubMenuWidth(MenuIDStr,"default",0);
}
function addICPSubMenu(MenuIDStr, SubMenuStr, SubMenuURLStr)
{
if (addICPSubMenu.arguments.length > 3)
TargetStr = addICPSubMenu.arguments[3];
else
TargetStr = "_top";
tempID = "ICP_" + MenuIDStr;
addSubMenu(tempID,SubMenuStr,SubMenuURLStr,TargetStr,true);
}
function addMSSubMenu(MenuIDStr, SubMenuStr, SubMenuURLStr)
{
TargetStr = "_top";
tempID = "MS_" + MenuIDStr;
//alert("TempID: " + tempID + "\nSubMenuStr: " + SubMenuStr + "\n SubMenuURLStr: " + SubMenuURLStr + "\n TargetStr: " + TargetStr);
addSubMenu(tempID,SubMenuStr,SubMenuURLStr,TargetStr,false);
}
function addSubMenu(MenuIDStr, SubMenuStr, SubMenuURLStr, TargetStr, bICPMenu)
{
cFont   = bICPMenu? ICPFont : MSFont;
cColor0 = bICPMenu? aDefICPColor[0] : aDefMSColor[0];
cColor1 = bICPMenu? aDefICPColor[1] : aDefMSColor[1];
cColor2 = bICPMenu? aDefICPColor[2] : aDefMSColor[2];
var MenuPos = MenuIDStr.toUpperCase().indexOf("MENU");
if (MenuPos == -1) { MenuPos = MenuIDStr.length; }
InstrumentStr = MenuIDStr.substring(0 , MenuPos) + "|" + SubMenuStr;
URLStr        = formatURL(SubMenuURLStr, InstrumentStr);
var LookUpTag  = "<!--" + MenuIDStr + "-->";
var sPos = HTMLStr.indexOf(LookUpTag);
if (sPos <= 0)
{
HTMLStr += newLineChar + newLineChar +
"<SPAN ID='" + MenuIDStr + "'";
if (!RTL){
HTMLStr += 	" STYLE='display:none;position:absolute;width:160px;background-color:" + cColor0 + ";padding-top:0px;padding-left:0px;padding-bottom:20px;z-index:9px;'";
}else if (RTL){
HTMLStr += 	" STYLE='display:none;position:absolute;width:160;background-color:" + cColor0 + ";padding-top:0;padding-left:0;padding-bottom:20;z-index:9;'";
}
HTMLStr += "onmouseout='hideMenu();'>";
if (Frame_Supported == false || bICPMenu == false)
if (!RTL){
HTMLStr += "<HR  STYLE='position:absolute;left:0px;top:0px;color:" + cColor1 + "' SIZE=1>";
HTMLStr += "<DIV STYLE='position:relative;left:0px;top:8px;'>";
} else if (RTL){
HTMLStr += "<HR  STYLE='position:absolute;left:0;top:0;color:" + cColor1 + "' SIZE=1>";
HTMLStr += "<DIV STYLE='right:0;top:8;' dir='rtl'>";
}
}
TempStr = newLineChar +
"<A ID='AS_" + MenuIDStr + "'" +
"   STYLE='text-decoration:none;cursor:hand;font:" + cFont + ";color:" + cColor1 + "'" +
"   HREF='" + URLStr + "' TARGET='" + TargetStr + "'" +
" onmouseout="  + char34 + "mouseMenu('out' ,'" + MenuIDStr + "');" + char34 +
" onmouseover=" + char34 + "mouseMenu('over','" + MenuIDStr + "');" + char34 + ">" +
"&nbsp;" + SubMenuStr + "</A><BR>" + LookUpTag;
if (sPos <= 0)
HTMLStr += TempStr + "</DIV></SPAN>";
else
HTMLStr = HTMLStr.replace(LookUpTag, TempStr);
updateSubMenuWidth(MenuIDStr);
}
function addICPSubMenuLine(MenuIDStr)
{
tempID = "ICP_" + MenuIDStr;
addSubMenuLine(tempID,true);
}
function addMSSubMenuLine(MenuIDStr)
{
tempID = "MS_" + MenuIDStr;
addSubMenuLine(tempID,false);
}
function addSubMenuLine(MenuIDStr, bICPMenu)
{
var LookUpTag = "<!--" + MenuIDStr + "-->";
var sPos = HTMLStr.indexOf(LookUpTag);
if (sPos > 0)
{
cColor  = bICPMenu? aDefICPColor[1] : aDefMSColor[1];
TempStr = newLineChar + "<HR STYLE='color:" + cColor + "' SIZE=1>" + LookUpTag;
HTMLStr = HTMLStr.replace(LookUpTag, TempStr);
}
}
function addMSFooterMenu(MenuDisplayStr, MenuURLStr)
{
addFooterMenu(MenuDisplayStr, MenuURLStr, false)
}
function addICPFooterMenu(MenuDisplayStr, MenuURLStr)
{
addFooterMenu(MenuDisplayStr, MenuURLStr, true)
bFstICPFTMenu = false;
}
function addFooterMenu(MenuDisplayStr, MenuURLStr, bICPMenu)
{
cFont   = bICPMenu? ICPFont : MSFont;
cColor1 = aDefICPColor[1];
cColor2 = aDefICPColor[2];
tagStr  = bICPMenu? "<!--ICP_FOOTERMENU_TITLES-->" : "<!--MS_FOOTERMENU_TITLES-->";
MenuStr = "";
if ((bICPMenu) && bFstICPFTMenu == false)
MenuStr += "<SPAN STYLE='font:" + cFont + ";color:" + cColor1 + "'>&nbsp;|</SPAN>";
if ((bICPMenu == false) && (MenuURLStr == ''))
MenuStr += "<SPAN STYLE='font:" + cFont + ";color:<!--TEMPCOLOR-->'>&nbsp;" + MenuDisplayStr + "&nbsp;</SPAN>";
else
{
MenuStr += "&nbsp;<A TARGET='_top' STYLE='";
if (bICPMenu)
MenuStr += "text-decoration:none;";
MenuStr += "cursor:hand;font:" + cFont + ";"
if (bICPMenu)
MenuStr += "color:" + cColor1 + ";'";
else
MenuStr += "color:<!--TEMPCOLOR-->" + ";'";
MenuStr += " HREF='" + MenuURLStr + "'";
MenuStr += 	" onmouseout=" + char34 + "this.style.color = '";
if (bICPMenu)
MenuStr += cColor1;
else
MenuStr += "<!--TEMPCOLOR-->";
MenuStr += "'" + char34 + " onmouseover=" + char34 + "this.style.color = '"
if (bICPMenu)
MenuStr += cColor2
else
MenuStr += "<!--TEMPCOLOR2-->";
MenuStr += "'" + char34 + ">" + MenuDisplayStr + "</A>&nbsp;";
}
MenuStr += tagStr;
FooterStr = FooterStr.replace(tagStr, MenuStr);
}
function mouseMenu(id, MenuIDStr)
{
IsMSMenu   = (MenuIDStr.toUpperCase().indexOf("MS_") != -1);
IsMouseout = (id.toUpperCase().indexOf("OUT") != -1);
if (IsMouseout)
{
color = IsMSMenu? aDefMSColor[1] : aDefICPColor[1];
if (MenuIDStr == CurICPMenu && aCurICPColor[1] != "")
color = aCurICPColor[1];
}
else
{
color = IsMSMenu? aDefMSColor[2] : aDefICPColor[2];
if (MenuIDStr == CurICPMenu && aCurICPColor[2] != "")
color = aCurICPColor[2];
}
window.event.srcElement.style.color = color;
}
function doMenu(MenuIDStr)
{
var thisMenu = document.all(MenuIDStr);
if (ToolbarMenu == null || thisMenu == null || thisMenu == ToolbarMenu)
{
window.event.cancelBubble = true;
return false;
}
// Reset dropdown menu
window.event.cancelBubble = true;
ToolbarMenu.style.display = "none";
showElement("SELECT");
showElement("OBJECT");
ToolbarMenu = thisMenu;
IsMSMenu = (MenuIDStr.toUpperCase().indexOf("MS_") != -1);
// Set dropdown menu display position
x  = window.event.srcElement.offsetLeft +
window.event.srcElement.offsetParent.offsetLeft;
if (RTL){
// RTL correction:
var ICPstart = 0;
if (!IsMSMenu)
{
if (isIE5)
ICPstart = window.event.srcElement.offsetParent.offsetParent.offsetLeft;
else // for IE4 we must use...
ICPstart = window.event.srcElement.offsetParent.offsetParent.offsetParent.offsetParent.offsetWidth -
window.event.srcElement.offsetParent.offsetParent.offsetWidth;
x += ICPstart;
}
x -= thisMenu.style.posWidth;
x += IsMSMenu ? 8 : -2;
if (x < 0) x = 0;
// End of RTL Correction
}
if (MenuIDStr == LastMSMenu){
if (!RTL){
x += (window.event.srcElement.offsetWidth - thisMenu.style.posWidth);
}else if (RTL){
if (x < 0) x = 0;
}
}
x2 = x + window.event.srcElement.offsetWidth;
y  = (IsMSMenu)?
(idRow1.offsetHeight) :
(idRow1.offsetHeight + idRow2.offsetHeight + idRow3.offsetHeight);
if (RTL){
// Get main menu width
// RTL Correction:
if (IsMSMenu)
x2 = window.event.srcElement.offsetLeft - window.event.srcElement.offsetWidth;
else
x2 = window.event.srcElement.offsetParent.offsetLeft + ICPstart;
// End of RTL Correction.
// Get dropdown menu width
x3 = x + 160;
for (i = 0; i < TotalMenu; i++){
if (arrMenuInfo[i].IDStr == MenuIDStr)
{
x3 = x+ arrMenuInfo[i].unit;
break;
}
}
}
thisMenu.style.top  = y;
thisMenu.style.left = x;
thisMenu.style.clip = "rect(0 0 0 0)";
thisMenu.style.display = "block";
thisMenu.style.zIndex = 102;
// delay 2 millsecond to allow the value of ToolbarMenu.offsetHeight be set
window.setTimeout("showMenu()", 2);
return true;
}
function showMenu()
{
if (ToolbarMenu != null)
{
IsMenuDropDown = (Frame_Supported && IsMSMenu == false)? false : true;
if (IsMenuDropDown == false)
{
y = (y - ToolbarMenu.offsetHeight - idRow3.offsetHeight);
if (y < 0) y = 0;
ToolbarMenu.style.top = y;
}
y2 = y + ToolbarMenu.offsetHeight;
ToolbarMenu.style.clip = "rect(auto auto auto auto)";
hideElement("SELECT");
hideElement("OBJECT");
if (!RTL)
x2 = x + ToolbarMenu.offsetWidth;
hideElement("IFRAME");
}
}
function hideMenu()
{
if (ToolbarMenu != null && ToolbarMenu != StartMenu)
{
// Don't hide the menu if the mouse move between the menu and submenus
if (!RTL){
cY = event.clientY + document.body.scrollTop;
cX = event.clientX;
if (document.body.offsetWidth > x && scFlag) {
cX = x + 9;
}
if ( (cX >= (x+5) && cX<=x2) &&
((IsMenuDropDown == true  && cY > (y-10) && cY <= y2)      ||
(IsMenuDropDown == false && cY >= y     && cY <= (y2+10)) ))
{
window.event.cancelBubble = true;
return;
}
}else if(RTL){
var cX = event.clientX //+ document.body.scrollLeft;
// RTL correction: considers left scrollbar width!
if (isRTL) cX -= 16;
var cY = event.clientY + document.body.scrollTop;
var bHideMenu = true;
if (cX > document.body.scrollLeft && document.body.scrollLeft > 1){
cX = x3;	//x + 9;
}
if (IsMenuDropDown == true)
{// RTL Correction: cY-8 instead of cY
if ( cY-8 >= (y - idRow3.offsetHeight) && cY < y)
{// RTL Correction: [x,x2] --> [x2,x3]
if (cX >= (x2+5) && cX <= x3) bHideMenu = false;
}
else if (cY >= y && cY <= y2)
{
if (cX > (x+5) && cX <= x3) bHideMenu = false;
}
}
else
{
if (cY >= y2 && cY < (y2 + idRow3.offsetHeight))
{// RTL Correction: [x,x2] --> [x2,x3]
if (cX >= (x2+5) && cX <= x3) bHideMenu = false;
}
else if (cY >= y && cY <= y2)
{
if (cX > (x+5) && cX <= x3) bHideMenu = false;
}
}
if (! bHideMenu)
{
window.event.cancelBubble = true;
return;
}
}
ToolbarMenu.style.display = "none";
ToolbarMenu = StartMenu;
window.event.cancelBubble = true;
showElement("SELECT");
showElement("OBJECT");
if(!RTL){
showElement("IFRAME");
}
}
}
function hideElement(elmID)
{
for (i = 0; i < document.all.tags(elmID).length; i++)
{
obj = document.all.tags(elmID)[i];
if (! obj || ! obj.offsetParent)
continue;
// Find the element's offsetTop and offsetLeft relative to the BODY tag.
objLeft   = obj.offsetLeft;
objTop    = obj.offsetTop;
objParent = obj.offsetParent;
while (objParent.tagName.toUpperCase() != "BODY")
{
objLeft  += objParent.offsetLeft;
objTop   += objParent.offsetTop;
objParent = objParent.offsetParent;
}
// Adjust the element's offsetTop relative to the dropdown menu
objTop = objTop - y;
if (x > (objLeft + obj.offsetWidth) || objLeft > (x + ToolbarMenu.offsetWidth))
;
else if (objTop > ToolbarMenu.offsetHeight)
;
else if (IsMSMenu && (y + ToolbarMenu.offsetHeight) <= 80)
;
else
obj.style.visibility = "hidden";
}
}
function showElement(elmID)
{
for (i = 0; i < document.all.tags(elmID).length; i++)
{
obj = document.all.tags(elmID)[i];
if (! obj || ! obj.offsetParent)
continue;
obj.style.visibility = "";
}
}
function formatURL(URLStr, InstrumentStr)
{
var tempStr = URLStr;
if (DoInstrumentation && URLStr != "" )
{
var ParamPos1 = URLStr.indexOf("?");
var ParamPos2 = URLStr.lastIndexOf("?");
var ParamPos3 = URLStr.toLowerCase().indexOf("target=");
var ParamPos4 = URLStr.indexOf("#");
var Bookmark  = "";
var URL = URLStr;
if (ParamPos4 >= 0)
{
URL = URLStr.substr(0, ParamPos4);
Bookmark = URLStr.substr(ParamPos4);
}
if (ParamPos1 == -1)
tempStr = "?MSCOMTB=";
else if (ParamPos1 == ParamPos2 && ParamPos3 == -1)
tempStr = "&MSCOMTB=";
else if (ParamPos1 == ParamPos2 && ParamPos3 != -1)
tempStr = "?MSCOMTB=";
else if (ParamPos1 < ParamPos2)
tempStr = "&MSCOMTB=";
tempStr = URL + tempStr + InstrumentStr.replace(" ","%20") + Bookmark;
}
return tempStr;
}
function prepTrackingString(ts, type)
{
var rArray;
var rString;
var pName = '';
if (0 == type)
{
pName = 'p=';
rString = ts.substring(1);
rArray = rString.split('/');
}
if (1 == type)
{
pName = 'qs=';
rString = ts.substring(1);
rArray = rString.split('&');
}
if (2 == type)
{
pName = 'f=';
rString = escape(ts);
return pName + rString;
}
if (3 == type)
{
pName = 'tPage=';
rString = escape(ts);
return pName+rString;
}
if (4 == type)
{
pName = 'sPage=';
rString = escape(ts);
return pName + rString;
}
if (5 == type)
{
pName = 'r=';
rString = escape(ts);
return pName + rString;
}
if (6 == type)
{
pName = 'MSID=';
rString = escape(ts);
return pName + rString;
}
if (7 == type)
{
pName = 'source=';
rString = ts.toLowerCase();
if(rString.indexOf("microsoft.com") != -1)
{
rString = rString.substring(0,rString.indexOf("microsoft.com"));
if('' == rString)
{
rString = "www";
}
else
{
rString = rString.substring(0,rString.length -1);
}
}
return pName + rString;
}
if (8 == type)
{
pName = 'TYPE=';
rString = escape(ts);
return pName + rString;
}
rString = '';
if(null != rArray)
{
if(0 == type)
{
for( j=0; j < rArray.length - 1; j++)
{
rString += rArray[j] + '_';
}
}
else
{
for( j=0; j < rArray.length  ; j++)
{
rString += rArray[j] + '_';
}
}
}
rString = rString.substring(0, rString.length - 1);
return pName + rString;
}
function buildIMG(pArr)
{
var TG = '<LAYER visibility="hide"><div style="display:none;"><IMG src="' + location.protocol + '/trans_pixel.asp?';
for(var i=0; i<pArr.length; i++)
{
if(0 == i)
{
TG +=  pArr[i];
}
else
{
TG += '&' + pArr[i];
}
}
TG +='" height="0" width="0" hspace="0" vspace="0" Border="0"></div></layer>';
if (!RTL){
document.writeln(TG);
return;
}else if (RTL){
document.write(TG);
}
}
function setToolbarLocale(toolbarLocale)
{
document.writeln("<" + "script language='JavaScript' src='../commom/global.js' type='text/javascript'></" + "script>");
return;
}
function scrollbaroptions(){
scrollcount ++;
if ( scrollcount < 3  )
{
scFlag = true;
}else{
scrollcount = 0;
scFlag = false;
}
}
