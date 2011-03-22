
var g_oMemberSettings = new Object();
// _iState
// 0 - initializing
// 1 - binding
//var g_fMembersDSC = false; // indicates the data set is complete (DSO)
//var g_fMembersRSC = false; // indicates the table is complete (TABLE)
var g_fMemberTableReady = false;
//var g_sCurMemberView = "attributes"; // cache the default view in global since we need to filter asynchronously
var g_FilterMap = new Array();
//'(ref_friendly = * \/ *) | invoke_kind = 0'; // old attribute filter
g_FilterMap["attributes"] = "invoke_kind=0 | ((invoke_kind=2 | invoke_kind=6) & ref_persistent <> null)"; // look for text pattern; requires a space followed by slash followed by space to match
g_FilterMap["all"] = 'ref_dynamic <> null'; // show all dynamic member
g_FilterMap["properties"] = '((invoke_kind=2 | invoke_kind=4 | invoke_kind=6) & ref_dynamic <> null)';
g_FilterMap["methods"] = 'invoke_kind=1';
g_FilterMap["events"] = 'invoke_kind=8';
g_FilterMap["collections"] = 'invoke_kind=32';
g_FilterMap["behaviors"] = 'invoke_kind=128';
g_FilterMap["filters"] = 'invoke_kind=256';
var g_aMemberImg2Str = new Array();
g_aMemberImg2Str["method"] = "Method";
g_aMemberImg2Str["prop_ro"] = "Read-Only Property";
g_aMemberImg2Str["prop_rw"] = "Read/Write Property";
g_aMemberImg2Str["prop_wo"] = "Write-Only Property";
g_aMemberImg2Str["event"] = "Event";
g_aMemberImg2Str["collection"] = "Collection";
g_aMemberImg2Str["object"] = "Object";
g_aMemberImg2Str["attribute"] = "Attribute";
g_aMemberImg2Str["behavior"] = "Behavior";
g_aMemberImg2Str["filter"] = "Filter";
g_oRegImgTitle = new RegExp("(method|prop_ro|prop_rw|prop_wo|event|collection|object|attribute|behavior|filter)\.gif");
g_oRegProp = new RegExp("(prop_..|attribute)");
var g_aMemberViewByNum = new Array();
g_aMemberViewByNum["all"] = 0;
g_aMemberViewByNum["attributes"] = 1;
g_aMemberViewByNum["properties"] = 2;
g_aMemberViewByNum["methods"] = 3;
g_aMemberViewByNum["events"] = 4;
g_aMemberViewByNum["collections"] = 5;
g_aMemberViewByNum["behaviors"] = 6;
g_aMemberViewByNum["filters"] = 7;
/*
Insert object-page-specific data-bound tables into the page. IE4/Windows only
vCtx - hash containing context information for the current binding. Valid keys include:
defView - default filter (acceptable values: all, methods, properties, events, attributes (default), or collections)
dataPath - location of the data set to which the DSOs are to bind
- for legacy reasons, this parameter may also specify a string representing the default view
specifying default filter for members table.
sCSSLink - optional string specifying name of field to surround with hyperlink
acceptable values: cssattr (default), prop
*/
function AddObjTables(vCtx, sCSSLink)
{
if (!oBD.getsNavBar) // so that down-level links show up in Mac and Unix
{
if (typeof(divMembers) == 'object')
{
divMembers.children(0).className = "clsExpanded";
}
if (typeof(divCSS) == 'object')
{
divCSS.children(0).className = "clsExpanded";
}
return false;
}
var vDefView = "";
var sDataPath = "../data/"; // using relative path allows this code to be used by ANY reference
// dig data out of the context object
if (typeof(vCtx) == 'object' && vCtx != null)
{
if (typeof(vCtx.defView) == 'string')
{
vDefView = vCtx.defView;
}
if (typeof(vCtx.dataPath) == 'string')
{
sDataPath = vCtx.dataPath;
}
}
else if (typeof(vCtx) == 'string')
{
vDefView = vCtx;
}
var oReg = new RegExp("[\\\\]", "g");
var sPath = location.pathname.replace(oReg, "/"); // Normalize the path on or off-line
aPath = sPath.split("/");
var sObjName = aPath[aPath.length-1].split(".")[0];
if (typeof(divMembers) == 'object')
{
var oPersistence = EnsurePersistence();
var sPM = oPersistence.getPersistedMembers();
if (sPM)
{
vDefView = sPM;
}
// coerce to a sensible default if nothing passed
if (!vDefView)
{
// if nothing explicit is passed, and it's a collection, show all; otherwise show attribs only
vDefView = (IsCollection(document)) ? "all" : "attributes";
}
g_oMemberSettings._sDefView = vDefView;
// 8/6/1999: set the charset explicitly
// filter on attribs first so that we can build the HTML syntax
sMembers = '<OBJECT classid="clsid:333C7BC4-460F-11D0-BC04-0080C7055A83" ' +
'ID=tdcMembers ondatasetcomplete="handle_members_dsc()" HEIGHT=0 WIDTH=0>' +
'<PARAM NAME="DataURL" VALUE="' + sDataPath + sObjName + '_members.csv">' +
'<PARAM NAME="UseHeader" VALUE="True">' +
'<PARAM NAME="TextQualifier" VALUE="|">' +
'<PARAM NAME="charset" VALUE="windows-1252">' +
'<PARAM NAME="CaseSensitive" VALUE="False">' +
'<PARAM NAME="Sort" VALUE="' + GetFriendlyCol('attributes') + '">' +
'<PARAM NAME="Filter" VALUE="' + g_FilterMap['attributes'] + '">' +
'</OBJECT>';
g_oMemberSettings._iState = 0;
document.body.insertAdjacentHTML('afterBegin', sMembers);
// bug/feature optimizes out dbinding when no elements on the page bind to the data source
// so trigger the binding
var oRS = tdcMembers.recordset;
}
if (typeof(divCSS) == 'object') // CSS is optional if object doesn't support it.
{
AddCSSTable(divCSS, sDataPath + sObjName + '_css.csv', sCSSLink);
}
return true;
}
// Once the syntax is built,
// refilter the data
// inject the member table
function AddMemberTable()
{
if (AddMemberTable._bAdded)
{
// only add the table once!
return;
}
AddMemberTable._bAdded = true;
var cImgCol = GetImgCol(g_oMemberSettings._sDefView);
var cNameCol = GetFriendlyCol(g_oMemberSettings._sDefView);
divMembers.innerHTML = "<TABLE CLASS='clsStd' STYLE='table-layout:fixed' ID=tblMembers onreadystatechange='handle_members_rsc()'>" +
"<COL ID=colMembersSel WIDTH='20%'><COL WIDTH='40px'><COL WIDTH='*'>" +
"<THEAD><TR VALIGN=TOP BGCOLOR=#DDDDDD><TH>" +
BuildViewCombo() +
"</TH><TH>&nbsp;</TH><TH>Description</TH></TR></THEAD>" +
"<TBODY><TR><TD NOWRAP><A DATAFLD=ref_link>" +
"<SPAN ID=ref_friendly onmouseover='handle_member_hover()' DATAFLD=" + cNameCol + "></SPAN></A></TD>" +
"<TD ALIGN='center'><IMG ID=ref_icon DATAFLD=" + cImgCol + "></TD>" +
"<TD><SPAN DATAFLD=ref_desc DATAFORMATAS=html></SPAN></TD></TR></TABLE>" +
"<DIV ID='divProposed' STYLE='display:none'>* denotes an extension to the W3C DOM.</DIV>";
if(cboInvokeKind.offsetWidth > colMembersSel.offsetWidth){
colMembersSel.width = cboInvokeKind.offsetWidth;
}
cboInvokeKind.selectedIndex = MapViewToOption(g_oMemberSettings._sDefView);
//FilterMembers(cboInvokeKind, tdcMembers, "#tdcMembers");
return true;
}
// deal with clipping of member cells
function handle_member_hover()
{
var oSpan = window.event.srcElement;
var oTD = oSpan.parentElement.parentElement;
if (IsClipped(oTD) && oSpan.title == "")
oSpan.title = oSpan.innerText;
}
function IsClipped(o)
{
return (o.scrollWidth > o.offsetWidth ? true : false);
}
// Add the data bound CSS table to the document
function AddCSSTable(oContainer, sPathToData, sLinkFld)
{
// wrap the CSS attribute name in a link unless prop is explicitly specified
// sort by the field surrounded by the link
if (!sLinkFld || sLinkFld != "cssattr")
{
sLinkFld = "prop";
}
var sCSS = '<OBJECT WIDTH=0 HEIGHT=0 id=tdcCSS CLASSID="clsid:333C7BC4-460F-11D0-BC04-0080C7055A83" ondatasetcomplete="handle_css_dsc()">' +
'<PARAM NAME="DataURL" VALUE="' + sPathToData + '">' +
'<PARAM NAME="UseHeader" VALUE="True">' +
'<PARAM NAME="charset" VALUE="windows-1252">' +
'<PARAM NAME="TextQualifier" VALUE="|">' +
'<PARAM NAME="Sort" VALUE="' + sLinkFld + '">' +
'</OBJECT>'
document.body.insertAdjacentHTML('afterBegin', sCSS);
oContainer.innerHTML = "<TABLE CLASS='clsStd' STYLE='table-layout:fixed' DATASRC=#tdcCSS onreadystatechange='FixCSSTable()'>" +
"<COL WIDTH='20%'><COL WIDTH='15%'><COL WIDTH='*'>" +
"<THEAD><TR VALIGN=TOP BGCOLOR=#DDDDDD><TH>Style property</TH><TH>Style attribute</TH><TH>Description</TH></TR>" +
"<TBODY><TR>" +
GenBoundCell('prop', null, null, (sLinkFld == "prop" ? "<A DATAFLD=propurl>" : null), (sLinkFld == "prop" ? "</A>" : null)) +
GenBoundCell('cssattr', null, null, (sLinkFld == "cssattr" ? "<A DATAFLD=propurl>" : null), (sLinkFld == "cssattr" ? "</A>" : null)) +
GenBoundCell('css_desc', null, 'html') +
"</TR>" +
"</TABLE>";
return true;
}
// fires when the ondatasetcomplete event fires on the CSS DSO
// Only if this happens should the related styles block be displayed
function handle_css_dsc()
{
SetExpandableCaption(pStyles, "Show Styles", true);
}
// Return true if the document represents a collection
function IsCollection(oDoc)
{
var oReg = new RegExp("Collection");
return (oDoc.title.match(oReg) ? true : false);
}
function GenBoundCell(cField, cElem, cFormat, cPre, cPost)
{
if (!cElem)
{
cElem = 'SPAN';
}
if (!cFormat)
{
cFormat="text"
}
if (!cPre)
{
cPre = '';
}
if (!cPost)
{
cPost = '';
}
return '<TD>' + cPre + '<' + cElem + ' DATAFLD=' + cField + ' DATAFORMATAS=' + cFormat + '>' + '</' + cElem + '>' + cPost + '</TD>';
}
// Filter the members displayed supplied by a TDC
// oSelect - reference to a select
// oTDC - reference to a TDC
function FilterMembers(oSelect, oTDC, sDataSrc)
{
var sView = g_oMemberSettings._sDefView = oSelect.options(oSelect.selectedIndex).value;
g_fMemberTableReady = false;
var sNameCol = GetFriendlyCol(sView)
if (RebindMTCols(tblMembers, sNameCol, GetImgCol(sView), sDataSrc))
{
oTDC.object.Sort = sNameCol;
}
//oSelect.parentElement.title =
oTDC.object.Filter = GetFilterExpr(sView);
var oPersistence = EnsurePersistence();
oPersistence.persistMembers(sView);
oTDC.Reset();
return true;
}
// Rebind the name/img column of the member table to the appropriate field in the data set (but only if necessary)
function RebindMTCols(oTable, sNewFCol, sNewImgCol, sDataSrc)
{
// Don't bother rebinding to the same column
if (!sDataSrc && g_oMemberSettings._sFC == sNewFCol)
{
return false;
}
if (!sDataSrc)
{
sDataSrc = oTable.dataSrc;
}
oTable.dataSrc = '';
ref_friendly.dataFld = sNewFCol;
ref_icon.dataFld = sNewImgCol;
oTable.dataSrc = sDataSrc;
g_oMemberSettings._sFC = sNewFCol;
return true;
}
// Fired when a member image loads. Allows us to set the tooltip
// oImg - reference to an image object
// no need to specify a full vroot here.
function handle_members_dsc()
{
if (g_oMemberSettings._iState == 0)
{
g_oMemberSettings._iState = 1;
if (typeof(blkHTML) != 'undefined' && !blkHTML.getAttribute("_GENERATED"))
{
BuildHTMLSyntax(tdcMembers.recordset.Clone(1), blkHTML);
}
AddMemberTable();
// TDC BUG: Can't modify the TDC state (filter/sort) during dsc event, so use a timeout instead
window.setTimeout("SyncMemberView()", 0);
}
else if (g_oMemberSettings._iState == 1)
{
ModifyMemberRows();
}
}
function SyncMemberView()
{
var sView = g_oMemberSettings._sDefView;
var sNewFilter = GetFilterExpr(sView);
if (tdcMembers.object.Filter != sNewFilter)
{
tdcMembers.object.Filter = sNewFilter;
tdcMembers.object.Sort = GetFriendlyCol(sView);
tdcMembers.Reset();
}
else
{
ModifyMemberRows();
}
tblMembers.dataSrc = "#tdcMembers";
}
function BuildHTMLSyntax(oRS, oDest)
{
if (!oDest)
{
// The XSL Transform determined that the object wasn't worthy of HTML syntax
// since it didn't output the container
return;
}
oDest.setAttribute("_GENERATED", "1"); // prevent reentry; we only have to build syntax once
if (oRS.BOF && oRS.EOF)
{
// no attributes; hide the syntax block. #104158
document.all[oDest.sourceIndex-1].style.display = "none";
return;
}
var sPN = oDest.getAttribute("PN");
var sSyntax = "<PRE CLASS='clsSyntax'>&lt;<B>" + sPN + "</B>";
oRS.MoveFirst();
while (!oRS.EOF)
{
//invoke_kind=2 | invoke_kind=4 | invoke_kind=6) & ref_dynamic <> null
var sAttr = oRS.Fields("ref_persistent").value;
if (sAttr != "null")
{
sSyntax += "<DIV STYLE='margin-left:20px'><B>" + sAttr + "</B>=<I>" + sAttr.toLowerCase() + "</I></DIV>";
}
oRS.MoveNext();
}
sSyntax += "<DIV>&gt;</DIV>";
if (!oDest.getAttribute("CLOSING_OPTIONAL"))
{
sSyntax += "<B>&lt;/" + sPN + "&gt;</B>"
}
oDest.innerHTML = sSyntax + "</PRE>";
}
function AddProposedAdorner(oTbl, oRow, oRS)
{
//BUGBUG: Remove this test when all data files are synchronized to include 'proposed' column
if (oRS.fields.count != 9) return false;
oRS.AbsolutePosition = oRow.recordNumber;
if (oRS.fields("proposed").value == 1)
{
oRow.cells(0).innerHTML += "*";
return 1;
}
return 0;
}
function ModifyMemberRows()
{
if (!g_fMemberTableReady)
{
window.setTimeout("ModifyMemberRows()", 1000);
return;
}
var iProposed = 0;
for (var i = 1; i < tblMembers.rows.length; i++)
{
ModifyMemberRow(tblMembers.rows[i].cells(1).children(0), tdcMembers);
iProposed += AddProposedAdorner(tblMembers, tblMembers.rows[i], tdcMembers.recordset);
}
divProposed.style.display = (iProposed ? "inline" : "none");
}
function handle_members_rsc()
{
// see if the table is complete
if (window.event.srcElement.readyState == 'complete')
{
g_fMemberTableReady = true;
}
}
function ModifyMemberRow(oImg, oTDC)
{
var sImgPath = oImg.href.toLowerCase();
var aMatch = sImgPath.match(g_oRegImgTitle);
oImg.title = (null != aMatch ? g_aMemberImg2Str[aMatch[1]] : "Member");
if (g_oRegProp.test((null != aMatch ? aMatch[1] : sImgPath)))
{
var oRow = tblMembers.rows[oImg.recordNumber];
if (oRow)
{
ModPropAttr(oRow.children(0).all(1), oTDC);
}
}
return true;
}
// Builds a string and sets the tooltip for the cell
// When All is selected, the property rather than the attribute is displayed
// When Attrib is selected, the attrib is displayed and the tooltip is arranged appropriately
// When property is selected, the property is displayed ...
// oPropCell - the cell to be tipped
function ModPropAttr(oPropCell, oTDC)
{
// added robustness and stack var to handle quirk on some machines
if (typeof(oTDC) != 'object')
{
return false;
}
var oRS = oTDC.recordset;
if (!oRS)
{
return false;
}
oRS.AbsolutePosition = oPropCell.recordNumber;
var iFilter = cboInvokeKind.options(cboInvokeKind.selectedIndex).value;
var sPropValue = null, sAttrValue = null;
with (oRS.fields)
{
sPropValue = item('ref_dynamic').value;
sAttrValue = item('ref_persistent').value;
if (sPropValue == 'null' || sAttrValue == 'null')
{
return false;
}
}
var sProp = sPropValue + ' property';
var sAttr = sAttrValue + ' attribute';
var sTip = 'The ' + (iFilter==0 ? sAttr : sProp) + ' corresponds to the ' + (iFilter==0 ? sProp : sAttr) + '.';
oPropCell.className = "clsPropattr";
oPropCell.title = sTip;
return true;
}
// Map an invoke_kind to a filter expression for use by the TDC
function GetFilterExpr(sValue)
{
sValue = sValue.toLowerCase();
return (typeof(g_FilterMap[sValue]) == "string" ? g_FilterMap[sValue] : "");
}
function GetFriendlyCol(sValue)
{
return (sValue.toLowerCase() == "attributes") ? "ref_persistent" : "ref_dynamic";
}
function GetImgCol(sValue)
{
return (sValue == "attributes") ? "pers_icon" : "dyn_icon";
}
// map the specified view to an index into a SELECT defined below
function MapViewToOption(vView)
{
return (typeof(g_aMemberViewByNum[vView]) == 'number' ? g_aMemberViewByNum[vView] : 0);
}
// return a string representing the SELECT to be injected into the data bound table
function BuildViewCombo()
{
return "<SELECT ID='cboInvokeKind' onchange='FilterMembers(this, tdcMembers)'>" +
"<OPTION VALUE='all'>All" +
"<OPTION VALUE='attributes'>Attributes" +
"<OPTION VALUE='properties'>Properties" +
"<OPTION VALUE='methods'>Methods" +
"<OPTION VALUE='events'>Events" +
"<OPTION VALUE='collections'>Collections" +
"<OPTION VALUE='behaviors'>Behaviors" +
"<OPTION VALUE='filters'>Filters" +
"</SELECT>";
}
// BUGBUG: code assumes that run-time column is 0 and that this is the linked column
function fixNA()
{
var tblStyles = divCSS.children(0);
var iLen = tblStyles.rows.length;
for (var i = 1; i< iLen; i++)
{
var oRow = tblStyles.rows(i);
var oProp = oRow.children(0);
var sText = oProp.innerText;
if (sText == "N/A")
{
var sHREF = oProp.children(0).href;
var oAttr = oRow.children(1);
var sAttrText = oRow.children(1).innerText;
oAttr.innerHTML = "<A HREF='" + sHREF + "'>" + sAttrText + "</A>";
oProp.innerHTML = sText;
}
else
{
break;
}
}
return true;
}
// behavior attribute is only proposed, so append some text to that effect
function addProposed()
{
var tbl=divCSS.children(0);
for (i=0;i<tbl.rows.length;i++)
{
if (tbl.rows(i).cells(1).innerText=="behavior")
{
tbl.rows(i).cells(1).insertAdjacentText("beforeEnd"," (proposed)");
break;
}
}
return true;
}
// patch the style table
function FixCSSTable()
{
var tbl=event.srcElement;
if (tbl.readyState=="complete")
{
window.setTimeout("addProposed()", 0);
window.setTimeout("fixNA()", 0);
}
return true;
}
/*
function Trace(s)
{
if (typeof(divTrace) != 'object')
{
document.body.insertAdjacentHTML('beforeEnd', '<DIV ID="divTrace" STYLE="background-color:lime;overflow:scroll;height:300px;width:400px"></DIV><BUTTON onclick="Trace_Clear()">Clear</BUTTON>');
}
divTrace.innerHTML += s + "<BR>";
}
function Trace_Clear()
{
if (typeof(divTrace) == 'object')
{
divTrace.innerHTML = "";
}
}
*/
