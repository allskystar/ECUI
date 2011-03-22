//return the persistence wrapper
var asd;
function EnsurePersistence()
{
if (typeof(EnsurePersistence.oPersistence) == 'object')
{
return EnsurePersistence.oPersistence;
}
else
{
EnsurePersistence.oPersistence = new CPersistence();
return EnsurePersistence.oPersistence;
}
}
//Constructor for the persistence object
function CPersistence()
{
this.bXMLDocLoadedFlag=false;         //Indicates if the XML Document has been loaded yet.
this.bEnabled = false;            //Indicates that the browser supports the persistent feature
this.sPersistedMember;              //The current selection from of the members drop down
this.sStoreName="INETSDKStore";         //The name of the persistent data store
this.sSectionPath="";             //The path to the section objects in the XML doc
this.sMemberPath="";              //The path to the members object in the XML doc
var oHost=document.all.tags("H1").item(0);	//JSK: appendChild is not supported in IE4. Moved persistence to an element knonw to exist on the page.
this._oHostElem = oHost; // cache ref to element that hosts userdata behavior
}
//Persists the users choice of a show/hide section
CPersistence.prototype.persistSection = function(oSection, sText, sShowHide)
{
if (this.bEnabled)
{
var oSectionNode = this.getObject(this.XMLDoc,this.sSectionPath + oSection.id);
var bSave = false;
if (sShowHide == "show" && oSectionNode == null)
{
oSectionNode=this.insertObject(this.XMLDoc,this.sSectionPath + oSection.id);
if (oSectionNode)
{
oSectionNode.setAttribute("sValue",sText);
bSave = true;
}
}
else if (sShowHide == "hide" && oSectionNode != null)
{
if (this.removeObject(this.XMLDoc,this.sSectionPath + oSection.id))
bSave = true;
}
if (bSave)
this._oHostElem.save(this.sStoreName);
}
}
//Persists what text should be highlited in example code
CPersistence.prototype.persistHilite = function(oCode, sToken, oSample)
{
if (this.bEnabled)
{
var oSectionNode=this.getObject(this.XMLDoc,this.sSectionPath + oSample.id);
if (oSectionNode!=null)
{
oSectionNode.setAttribute("sToken",sToken);
oSectionNode.setAttribute("sCode",oCode.id);
this._oHostElem.save(this.sStoreName);
}
}
}
//Persists the user's selection from the members drop down
CPersistence.prototype.persistMembers = function(sSelection)
{
// Persist the current filter
if (this.bEnabled)
{
var oMemberNode=this.getObject(this.XMLDoc,this.sMemberPath);
if (oMemberNode == null)
{
oMemberNode=this.insertObject(this.XMLDoc,this.sMemberPath);
}
if (oMemberNode != null)
{
oMemberNode.setAttribute("sValue",sSelection);
this._oHostElem.save(this.sStoreName);
this.sPersistedMember=sSelection
}
}
}
//Returns the user's last selection from the members drop down
CPersistence.prototype.getPersistedMembers = function()
{
this.LoadXML();
if (this.bEnabled)
{
if (!this.sPersistedMember)
{
var oNode=this.getObject(this.XMLDoc,this.sMemberPath);
if (oNode != null)
{
this.sPersistedMember=oNode.getAttribute("sValue");
}
}
return this.sPersistedMember;
}
else
{
return null;
}
}
//Expands a section that has been stored.
CPersistence.prototype.getPersistedSection = function(oElem, sCaption)
{
this.LoadXML();
if (this.bEnabled)
{
var oSectionNode = this.getObject(this.XMLDoc,this.sSectionPath + oElem.id);
if (oSectionNode != null)
{
sCaption=oSectionNode.getAttribute("sValue");
ShowHideSection(oElem,sCaption);
if (oSectionNode.getAttribute("sToken") && oSectionNode.getAttribute("sCode"))
{
HiliteText(document.all(oSectionNode.getAttribute("sCode")), oSectionNode.getAttribute("sToken"));
}
}
}
}
var gRegBS = new RegExp("[\\\\]", "g");
function JustFName(sPath)
{
sPath = sPath.replace(gRegBS, "/")
return sPath.substring(sPath.lastIndexOf("/")+1).split('.')[0]
}
//Initialization routine for most of the object properties
//Provides TWO pieces of functionality.
//Loads the persistent XML document if needed.
//Determines if this is a post beta1 build.
CPersistence.prototype.LoadXML = function()
{
if (!this.bXMLDocLoadedFlag)
{
this.bXMLDocLoadedFlag=true;  //set flag regardless to prevent repeated initialization
this.bEnabled = (oBD.browser == "MSIE" && oBD.majorVer == 5);
if (this.bEnabled)
{
this._oHostElem.addBehavior("#default#userData");
var sLoad = "try { this._oHostElem.load(this.sStoreName); } catch(e) { this.bEnabled = false; }";
eval(sLoad); // protect <= JScript 3 from try/catch
if (!this.bEnabled)
return;
if (!this._oHostElem.XMLDocument)
{
this._oHostElem.save(this.sStoreName);
}
this.XMLDoc=this._oHostElem.XMLDocument;
var oRegBadXMLChars = new RegExp("[~]", "g"); // strip chars that are illegal for XML node names
var sFName = JustFName(document.location.pathname).replace(oRegBadXMLChars, "").toLowerCase();
this.sSectionPath= sFName + "/sections/";
this.sMemberPath= sFName + "/members";
}
}
return;
}
//Takes a path, converts to lowercase, strips leading slash and creates an array.
//Assumes "/" character is the delimiter.
var gRegLS = new RegExp("^[/]")
CPersistence.prototype.getObjectHierarchy = function(sPath)
{
sPath=sPath.replace(gRegLS, "");
return sPath.split("/");
}
//Returns the XML object at the position in the document indicated by sPath.
CPersistence.prototype.getObject = function(docObject, sPath)
{
return docObject.documentElement.selectSingleNode(sPath);
}
//Inserts an object in the XML document indicated by sPath
CPersistence.prototype.insertObject = function(docObject, sPath)
{
var aHierarchy = this.getObjectHierarchy(sPath);
var oCurNode=docObject.documentElement;
var iDepth = 0;
var bFound=false;
while (iDepth<aHierarchy.length)
{
bFound=false;
for (var i=0;i<oCurNode.childNodes.length;i++)
{
if (oCurNode.childNodes.item(i).nodeName==aHierarchy[iDepth])
{
oCurNode=oCurNode.childNodes.item(i);
bFound=true;
break;
}
}
if (!bFound)
{
var newNode=docObject.createElement(aHierarchy[iDepth])
oCurNode.insertBefore(newNode,null);
oCurNode=newNode;
}
iDepth++;
}
return oCurNode;
}
//Removes the object from the XML document indicated by sPath.
//If the removal of the object causes the parent to have no children then the parent is also removed.
//This process continues recursively up to the but not including the docuement root
CPersistence.prototype.removeObject = function(docObject, sPath)
{
var oCurNode=this.getObject(docObject,sPath);
if (oCurNode==null)
return false;
var oParent=oCurNode.parentNode;
oParent.removeChild(oCurNode);
while (oParent.childNodes.length==0 && oParent != docObject.documentElement)
{
oCurNode=oParent;
oParent=oCurNode.parentNode;
oParent.removeChild(oCurNode);
}
return true;
}
// Hilites the text in the code sample
// oStart - reference to start of block
// sText - string to find and hilite
function HiliteText(oStart, sText)
{
if (!oBD.getsNavBar)
{
// IE4/Mac doesn't support text ranges
return false;
}
var oRng = document.body.createTextRange();
oRng.moveToElementText(oStart);
var oRngFixed = oRng.duplicate();
if (typeof(HiliteText.tokens) == 'undefined')
{
HiliteText.tokens = new Array(1);
}
else
{
for (i = 0; i < HiliteText.tokens.length; i++)
{
if (HiliteText.tokens[i].m_sSectionID == oStart.id && HiliteText.tokens[i].m_sToken == sText)
{
return true;
}
}
HiliteText.tokens.length++;
}
while (oRng.findText(sText, 1000000, 6) && oRngFixed.inRange(oRng))
{
oRng.execCommand('bold');
oRng.collapse(false);
}
HiliteText.tokens[HiliteText.tokens.length-1] = new CHilitedToken(oStart.id, sText);
return true;
}
// a tuple representing the id of the section and the token to be hilited
// the object is stored in an array to prevent the code from running twice on the same section
function CHilitedToken(sSectionID, sToken)
{
this.m_sSectionID = sSectionID;
this.m_sToken = sToken;
}
// Toggles the display of the content contained within oCode
// oCode - reference to code block
// sToken - string to bolden
function ToggleSample(oCode, sToken)
{
if (ShowHideSection(window.event.srcElement, 'Sample Code'))
{
HiliteText(oCode, sToken);
var oPersistence = EnsurePersistence();
oPersistence.persistHilite(oCode, sToken, window.event.srcElement);
}
}
// If hidden, show. If shown, hide. Modify the caption of the element appropriately
// Returns true if showing on return, false if hidden on return
function ShowHideSection(oHead, sText)
{
var bRet = false;
var oChild = document.all(oHead.getAttribute('child', false));
if (typeof(oChild) == null)
{
return bRet;
}
var sClass = oChild.className;
var sAction = "Show";
if (sClass == "clsCollapsed")
{
sAction = "Hide";
bRet = true; // we'll be showing upon return, so return true
var oPersistence = EnsurePersistence();
oPersistence.persistSection(oHead, sText, "show")
}
else
{
var oPersistence = EnsurePersistence();
oPersistence.persistSection(oHead, sText, "hide")
}
sAction = sAction + ' ' + sText;
oChild.className = (sClass == "clsCollapsed" ? "clsExpanded" : "clsCollapsed");
oHead.innerText = sAction;
return bRet;
}
// Set the caption of the specified element
// oElem - reference to element to modify. Typically a Hn
// sCaption - New caption for the element
// bShow - boolean indicating whether or not the element should be made visible
function SetExpandableCaption(oElem, sCaption, bShow)
{
oElem.innerText = sCaption;
if (bShow) oElem.style.display = 'inline';
var oPersistence = EnsurePersistence();
oPersistence.getPersistedSection(oElem, sCaption);
}
function CheckCAB(n)
{
return true;
}
// Perform universal document post-processing at load time.
function PostGBInit()
{
if (oBD.getsNavBar)
{
if ("function" == typeof(CommonLoad)) CommonLoad();
DecorateSnippets();
if ('object' == typeof(oATTable) && 'object' == typeof(oATC) && 'function' == typeof(fnATInit))
{
fnATInit();
}
//at EmitStandardsGlyphs();  removed cause it doesn't resolve at runtime in legacy asp.
if ('object' == typeof(_topicdata) && 5<=oBD.majorVer) SetTopicData();
}
}
// Decorate the contents of specially designated (AUTOHILITE) PREs
function DecorateSnippets()
{
if (oBD.majorVer<5) // behaviors are an IE5 thing
{
return;
}
// if the global holding the location of our behavior is missing, we're sunk...
if (typeof(gsCodeDecoPath) != 'string')
{
return;
}
// we know there's at least one DIV on the page, so attach it to the first one, and
// let the behavior do the walking so we don't have to instantiate multiple instances of a run-once behavior
var oDIVs = document.all.tags("DIV");
if (0 == oDIVs.length)
{
return;
}
var oDIV = oDIVs[0];
// set properties on the DIV so that the hilite behavior will know the topic's name and persistent name
var sTopicName, sPN;
var oPD = EnsurePageData();
if (oPD && oPD.IsRefTopic())
{
if (sTopicName = oPD.GetTopicName())
{
oDIV.setAttribute("TOPICNAME", sTopicName);
}
if (sPN = oPD.GetPersistentName())
{
oDIV.setAttribute("PERSISTENTNAME", sPN);
}
}
oDIV.addBehavior(gsCodeDecoPath);
}
// Encapsulates data about the page
function CPageData()
{
// contains all the reference pagetypes
this._oRegRef = new RegExp("(ref|const|struct|iface|isv_element|enum|function|object|method|pi|property|attribute|pseudo_class|pseudo_element|declaration|rule|event|collection|behavior|srcdisp|class|dhfilter|dhfilter_property|winmsg|dhcmdid)");
if (typeof(_topicdata) == 'object')
{
this._sTopicName = _topicdata.getAttribute("name");
this._sPN = _topicdata.getAttribute("pn");
this._sLocation = _topicdata.getAttribute("pubpath");
if (!this._sLocation)
{
this._sLocation = window.document.location.pathName;
}
}
this._bRefTopic = false;
if (typeof(pagetype) == 'object')
{
this._sPageType = pagetype.content;
if (this._sPageType)
{
this._bRefTopic = this._oRegRef.test(this._sPageType);
}
}
}
// returns a reference to a CPageData instance
function EnsurePageData()
{
if (!EnsurePageData._data)
{
EnsurePageData._data = new CPageData();
}
var oPD = EnsurePageData._data;
return oPD;
}
// retrieves the name of the topic from the metadata
CPageData.prototype.GetTopicName = function()
{
//  return this._sTopicName;
return "abc";
}
// retrieves the persistent name of the topic from the metadata
CPageData.prototype.GetPersistentName = function()
{
//  return this._sPN;
return "bbb";
}
// indicates whether or not the topic is a ref topic
CPageData.prototype.IsRefTopic = function()
{
//  return this._bRefTopic;
return "ccc";
}
// indicates whether or not the topic is a ref topic
CPageData.prototype.GetTopicLocation = function()
{
//  return this._sLocation;
return "ddd";
}
// return whether or not this code is currently running on Win2000
function IsWin2000()
{
var sPlatVer;
return ((oBD.platform == "NT") && (sPlatVer = oBD.platVer) && (parseInt(sPlatVer) >= 5));
}
// Add product/platform specific features based on information from _topicdata.  SetTopicData is called if oBD.majorVer is greater than 5 and _topicdata exists (DOM and XMLDOM members are employed).
function SetTopicData(){
var oDocument=window.document;
var sProject=_topicdata.getAttribute("proj");
// add splat icon for new reference pages where the project is workshop, and the product is IE
if((sProject) && (sProject == "workshop"))
{
var aH1 = null;
var oPD = null;
var oIMG = null;
var sTPath = "";
var sAtt = "";
var sStd = "";
var sImg = "";
var oProductIE=_topicdata.XMLDocument.selectSingleNode("/root/product[@rid='prod:IE']/@minver");
if(oProductIE)
{
var iMinVer=parseFloat(oProductIE.value);
if(iMinVer==5.5)
{
aH1=oDocument.body.getElementsByTagName("H1");
if(aH1.length)
{
oPD = EnsurePageData();
sTPath = oPD.GetTopicLocation();
oIMG=oDocument.createElement("<IMG SRC='" + MakeRelative(sTPath, "/workshop/graphics/new55.gif") + "' ALT='This feature is new for Internet Explorer 5.5.' ALIGN='middle' HEIGHT='10' WIDTH='40'>");
aH1[0].appendChild(oIMG);
}
}
}
/* Standards glyph showing is not done for now.  Uncomment this code to turn them on.
var sAtt=_topicdata.getAttribute("standard");
if(sAtt)
{
aH1=oDocument.body.getElementsByTagName("H1");
if(aH1.length)
{
oPD = EnsurePageData();
sTPath = oPD.GetTopicLocation();
sStd = sAtt.toLowerCase();
if (sStd.indexOf("css1")>-1)
{
sImg = "<IMG SRC='" + MakeRelative(sTPath, "../common/std_css1.gif") + "' ALT='CSS1' ALIGN='top' HSPACE='5'>";
}
else if (sStd.indexOf("css2")>-1)
{
sImg = "<IMG SRC='" + MakeRelative(sTPath, "../common/std_css2.gif") + "' ALT='CSS2' ALIGN='top' HSPACE='5'>";
}
else if (sStd.indexOf("css3")>-1)
{
sImg = "<IMG SRC='" + MakeRelative(sTPath, "../common/std_css3.gif") + "' ALT='CSS3' ALIGN='top' HSPACE='5'>";
}
else if (sStd.indexOf("dom1")>-1)
{
sImg = "<IMG SRC='" + MakeRelative(sTPath, "../common/std_dom1.gif") + "' ALT='DOM1' ALIGN='top' HSPACE='5'>";
}
else if (sStd.indexOf("dom2")>-1)
{
sImg = "<IMG SRC='" + MakeRelative(sTPath, "../common/std_dom2.gif") + "' ALT='DOM2' ALIGN='top' HSPACE='5'>";
}
else if (sStd.indexOf("html32")>-1)
{
sImg = "<IMG SRC='" + MakeRelative(sTPath, "../common/std_html32.gif") + "' ALT='HTML 3.2' ALIGN='top' HSPACE='5'>";
}
else if (sStd.indexOf("html40")>-1)
{
sImg = "<IMG SRC='" + MakeRelative(sTPath, "../common/std_html40.gif") + "' ALT='HTML 4.0' ALIGN='top' HSPACE='5'>";
}
if (sImg)
{
oIMG=oDocument.createElement(sImg);
aH1[0].appendChild(oIMG);
}
}
}
// Standards glyph showing.
*/
}
}
// Walk the images collection and turn install icons into show me buttons
function SetShowMes()
{
var oImages = document.images;
var aContainers = new Array();
// collect references to DIVs that contain qualifying IMGs
for (i = oImages.length-1; i >= 0 ; i--)
{
var oImg = oImages[i];
var fMinVer = parseFloat(oImg.getAttribute('MINVER', 1));
if (!fMinVer ||
(!oImg.getAttribute('SAMPLEPATH', 1)) ||
(oImg.parentElement.tagName != "A") ||
(oImg.src.lastIndexOf("ieget_animated.gif") == -1) ||
(oImg.parentElement.parentElement.tagName != "DIV") ||
(oImg.parentElement.parentElement.children(0).tagName != "DIV")
)
{
continue; // not a showme
}
else if (oBD.fullVer < fMinVer)
{
continue;
}
else
{
aContainers[aContainers.length] = oImg.parentElement.parentElement;
}
}
var sShowMeClass = "clsShowme";
if (oBD.majorVer >= 5)
{
sShowMeClass += "5";
}
// walk the containing DIVs
for (i = 0; i < aContainers.length; i++)
{
var oCntr = aContainers[i];
var bNewGifPresent = false;
// gather data
var sToolTip, sClickCode;
var oImg = oCntr.children(1).children(0);
if (!oImg || !oImg.src || oImg.src.indexOf("ieget_animated.gif") == -1)
{
bNewGifPresent = true;
oImg = oCntr.children(3).children(0);
}
var sSamplePath = oImg.SAMPLEPATH;
  asd=sSamplePath=="about:blank"?true:false;
sToolTip = (!oImg.getAttribute('SAMPLETEXT', 1) ? "Click here to see a demonstration of this technology." : oImg.SAMPLETEXT);
var oReg = new RegExp("^direct$", "i");
if (sSamplePath.match(oReg))
{
sClickCode =oImg.getAttribute('CODE', 1);
}
else
{
sClickCode = "aa=window.open(\'" + sSamplePath + "\'" + ", null, \'" + (oImg.getAttribute('FEATURES', 1) ? oImg.FEATURES : "toolbar=no, resizable=1, scrollbars=1") + "\')";
}
// change the innerHTML of the containing DIV to a BUTTON
oCntr.innerHTML = "";
if (bNewGifPresent)
oCntr.innerHTML += '<IMG src="' + gsGraphicsPath + 'new.gif">&nbsp;';
oCntr.innerHTML += '<BUTTON CLASS="' + sShowMeClass + '" TITLE="' + sToolTip + '" STYLE="cursor:hand" HIDEFOCUS="true" onclick="' + sClickCode +';if(asd) aa.document.write(document.all.tags(\'pre\')['+i+'].innerText)"><SPAN>Show Me</SPAN></BUTTON>';
}
}
// Compose a path to the specified destination path relative to the specified container path
// The composition is performed case insensitively
function MakeRelative(sContainer, sDestPath)
{
// c:/sitebuilder/workshop/author/dhtml/reference/properties.htm
//   /sitebuilder/shared/css/ie4-wks.css
//   ../../../../shared/css/ie4-wks.css
// c:/sitebuilder/workshop/author/dhtml/reference/properties.htm
//               /workshop/author/dhtml/reference/properties/accessKey.htm
//                                                properties/accessKey.htm
// c:/sitebuilder/workshop/author/dhtml/reference/properties.htm
//               /workshop/code/common.js
//               ../../../code/common.js
var oRegBS = new RegExp("\\\\", "g");
sContainer = sContainer.replace(oRegBS, "/");
sDestPath = sDestPath.replace(oRegBS, "/");
var oRegHTTP = new RegExp("^http:\/\/", "i");
if (oRegHTTP.test(sDestPath))
{
return sDestPath;
}
// IE peculiarity: In local path case, drive letter is preceded by forward slash
var oRegNoProtocol = new RegExp("^(file:\/\/\/)?\/?([a-zA-z]):", "i");
sContainer = sContainer.replace(oRegNoProtocol, "");
sDestPath = sDestPath.replace(oRegNoProtocol, "");
var oRegBeginFS = new RegExp("^\/");
sDestPath = sDestPath.replace(oRegBeginFS, ""); // lop leading slash to eliminate empty first array element after split
var oRegFS = new RegExp("\/");
var aSrc = sContainer.split(oRegFS);
aSrc.length -= 1; // lop off the filename from the container (assume container is a reference to a file)
var oRegTS = new RegExp("\/$");
var bTrailingSlash = (oRegTS.test(sDestPath)); // preserve trailing slash
var aDest = sDestPath.split(oRegFS);
var iSrcLen = aSrc.length, iDestLen = aDest.length;
var iSrcIndex = 0, iDestIndex = 0, iNoMatch = 0;
// walk forward looking for matching portion of path
var bMatched = 0;
for (iSrcIndex = 0; iSrcIndex < iSrcLen; iSrcIndex++)
{
if (aSrc[iSrcIndex].toLowerCase() != aDest[iDestIndex].toLowerCase())
{
iNoMatch++;
}
else
{
bMatched =  1;
break;
}
}
if (bMatched)
{
var aRelPath = new Array();
while (iSrcIndex < iSrcLen && iDestIndex < iDestLen && aSrc[iSrcIndex].toLowerCase() == aDest[iDestIndex].toLowerCase())
{
iSrcIndex++; iDestIndex++;
}
// tack remaining portion of destination path onto the end of the result
while (iDestIndex < iDestLen)
{
aRelPath[aRelPath.length] = aDest[iDestIndex];
iDestIndex++;
}
var sRelPath = aRelPath.join('/');
// climb out of what remains of the source (excluding the filename)
while (iSrcIndex < iSrcLen)
{
sRelPath = "../" + sRelPath;
iSrcIndex++;
}
return sRelPath + (bTrailingSlash ? "/" : "");
}
else
{
return sDestPath;
}
}
// Function that adds the "view-source:" prefix to the specified vroot
// View-source syntax:
//    view-source:http:
// Note that view-source only takes an absolute path, and thus the function below
// does the munging of the protocol + host to the vroot, resulting in an absolute path.
// Sample Usage:
//    <A HREF="javascript:HandleViewSource('/workshop/samples/components/scriptoid/calc/engine.sct')">engine.sct</A>
function HandleViewSource(sURL)
{
location.href = "view-source:" + location.protocol + "//" + location.host + sURL;
}
// Generate an ID unique to the page
function GenerateID(sPrefix)
{
if ("MSIE" == oBD.browser && oBD.majorVer >= 5)
{
return (sPrefix ? sPrefix : '') + document.uniqueID;
}
else
{
for (iTry = 0; iTry < 3; iTry++)
{
var sUniqueID = (sPrefix ? sPrefix : '') + Math.round(Math.random()*100000000);
if (document.all(sUniqueID) == null) // verify that the ID is not already in use
{
return sUniqueID;
}
}
}
return null;
}
// Add client caps to the specified element on the page
// returns the element to which the behavior was added
// oElem - optional. The element to which the behavior was added (BODY is the default)
function EnableClientCaps(oElem)
{
if (!oBD.getsNavBar || oBD.majorVer < 5) // new for IE5
{
return null;
}
if (typeof(EnableClientCaps.oCaps) == 'object') // already cached? return it
{
return EnableClientCaps.oCaps;
}
if (typeof(oElem) != 'object') // validate params
{
oElem = document.body;
}
// addBehavior came in IE5 B2, so check a B2 property before making call
if (typeof(oElem.behaviorUrns) != 'object')
{
return null;
}
oElem.addBehavior("#default#clientcaps");
if (typeof(oElem.platform) == 'string')
{
EnableClientCaps.oCaps = oElem;
return oElem;
}
else
{
EnableClientCaps.oCaps = null;
return null;
}
}
function toggle(oElement)
{
if (!oElement)
oElement=event.srcElement;
s=oElement.ShowHideType;
var SpanIndex=oElement.sourceIndex;
var oPre=document.all.item(SpanIndex+1);
var o=oPre;
var oDiv=oPre;
o=o.nextSibling;
if (o && o.nodeName=="DIV")
{
oDiv=o;
}
var oFC = oDiv.all.item(0);
if (oPre.style.display=="none")
{
oPre.style.display="block";
if( oFC && (oFC.tagName == "BUTTON" || oFC.className == "clsShowMe") )
oDiv.style.display="block";
oElement.innerText="Òþ²Ø" + s;
}
else
{
oPre.style.display="none";
if( oFC && (oFC.tagName == "BUTTON" || oFC.className == "clsShowMe") )
oDiv.style.display="none";
oElement.innerText="ÏÔÊ¾" + s;
}
return;
}
function hideExamples()
{
var colPre=document.getElementsByTagName("PRE");
for (var i=0;i<colPre.length;i++)
{
if (colPre.item(i).className=="clsCode")
{
if (colPre.item(i).offsetHeight > 100)
{
var oSpan=document.createElement("P");
colPre.item(i).parentNode.insertBefore(oSpan,colPre.item(i));
oSpan.onclick=toggle;
oSpan.ShowHideType="Ê¾Àý";
oSpan.innerHTML = "Òþ²ØÊ¾Àý";
oSpan.style.textDecorationUnderline=true;
oSpan.style.fontWeight="bold";
oSpan.style.cursor="hand";
oSpan.style.backgroundColor="#E9E9E9";
// Code decoration (IE 5+ only) will hide the example
//if ( oBD.majorVer < 5 )
toggle(oSpan);
}
}
}
}


function formatHTML(html) {
	var tagNames = [], textNode = true;
	html = html.replace(/\s+<\s+/g, "<").replace(/\s+>\s+/g, ">").replace(/[\r\n]/g, '');
	html = html.replace(/<(\/)?(\w+)[^>]*>/g, function ($0, $1, $2) {
		if ($1) {
			var tagName;
			while (tagName = tagNames.pop()) {
				if (tagName == $2) {
					if (textNode) {
						textNode = false;
						return $0;
					}
					break;
				}
				textNode = false;
			}
		}

		for (var i = tagNames.length - 1, indent = "\n"; i >= 0; i--) {
			indent += "&nbsp;&nbsp;";
		}

		if (!$1) {
			tagNames.push($2);
			textNode = true;
		}
		
		return indent + $0;
	});
	return html;
}
