
var gsGraphicsPath = "common/";
var gsStoreName="workshop";
var gsTabControl="";
var gaDivs = new Array();
var gaTabs = new Array();
var goPersist = null;		// creation of this object is defered until after the entire objectmembers system
// has been rendered.  That is because I need a reference to content div.
var gsPageId = "";
function CPersist(attachedTo, storePath){
if( oBD.doesPersistence ){
this._obj = attachedTo;
this._obj.addBehavior("#default#userData");
this._path = storePath;
this._loaded = false;
}
}
CPersist.prototype.Save = function(){
if( oBD.doesPersistence ){
if(this.IsLoaded()){
var enabled = true;
var code = "try{ this.GetAttached().save(this._path); } catch(e) {enabled = false;}";
eval(code);
}
}
}
CPersist.prototype.Load = function(){
if( oBD.doesPersistence ){
if(!this.IsLoaded()){
var enabled = true;
var code = "try{ this.GetAttached().load(this._path); } catch(e) {enabled = false;}";
eval(code);
if(!enabled) return;
this._loaded = true;
}
}
}
CPersist.prototype.GetAttached = function(){
if( oBD.doesPersistence ) return this._obj;
}
CPersist.prototype.IsLoaded = function(){
if( oBD.doesPersistence ) return this._loaded;
}
CPersist.prototype.SetAttribute = function(key, value){
if( oBD.doesPersistence ){
if( !this.IsLoaded() ) this.Load();
if( this.IsLoaded() ){			// confirm that the load actually happened.  Cannot add data if load failed.
if( !gsPageId ) pageID = "unknown"; else pageID = gsPageId;
this.GetAttached().setAttribute(pageID + "." + key, value);
}
this.Save();
}
}
CPersist.prototype.GetAttribute = function(key){
if( oBD.doesPersistence ){
if( !this.IsLoaded() ) this.Load();
if( this.IsLoaded() ){			// confirm that the load actually happened.  Cannot get data if load failed.
if( !gsPageId ) pageID = "unknown"; else pageID = gsPageId;
var value = this.GetAttached().getAttribute(pageID + "." + key);
}
if(key == "selectedTab"){
if(!value) value = 0;
} else if(key == "expanded"){
if(value == "true")
value = true;
else
value = false;
} else if(key == "scroll"){
if(!value) value = 0;
}
return value;
}
}
// initilizes a new, logical tab for objectmembers.  A "tab" consists of both
// the tab and the member content.
function CTabber(newTab){
this._caption = ""; this._content = null; this._tab = null;
// only initialize of this is actually a tab.  Tabs are identifed by a @tabName attribute.
if(newTab.tabName){
this._initializeComponent(newTab);
} else {
return null;
}
}
// Returns the caption used for the tab.
CTabber.prototype.GetCaption = function(){
return this._caption;
}
// Sets the caption used for the tab.  Also updates the tabbed title bar.
CTabber.prototype.SetCaption = function(newCaption){
this._caption = newCaption;
if(this.IsActive){		// should only change title bar if currently active.
oMTitle.innerText = newCaption;
}
}
//
// Returns the <div> that is attached to this tab object.
CTabber.prototype.GetContent = function(){
return this._content;
}
// Returns the rendered tab (<TD>) for this tab object.
CTabber.prototype.GetTab = function(){
return this._tab;
}
// Returns true if this tab object is currently being rendered (e.g. the <div> is displayed),
// otherwise returns false.
CTabber.prototype.IsActive = function(){
return (this.GetTab().className == "oMTabOn" ? true : false);
}
// Not used, ignore.
CTabber.prototype._setColumnHeaders = function(){
var heads = this.GetContent().getElementsByTagName("TH");
for(var i=0; i<heads.length; i++){
var cn = heads[i].cloneNode(true);
oMHeadings.appendChild(cn);
heads[i].style.display = "none";
}
}
//
// Forces a an inactive tab to become active.  That means that the
// tab itself changes state and the <div> is rendered.
// Any previously active tab is made inactive first.
CTabber.prototype.MakeActive = function(){
var tab = this.GetActiveTab();
if(tab) tab.MakeInActive();
oMTitle.innerText = this.GetCaption();
this.GetTab().className = "oMTabOn";
oMTData.appendChild(this.GetContent());
this.GetContent().style.display = "block";
this.SetScrollPosition(0);		// reset the scroll bar.
oMTData.scrollTop = this.GetScrollPosition();
// save the state to a userData store.
goPersist.SetAttribute("selectedTab", this.GetCaption());
}
CTabber.prototype.GetActiveTab  = function(){
for(var i=0; i<gaTabs.length; i++){
var tab = gaTabs[i];
if(tab.IsActive()) return tab;
}
}
// Forces an active tab to become inactive.  Changes the state of the tab
// and removes the <div> from the screen.
CTabber.prototype.MakeInActive = function(){
this.GetContent().style.display = "none";
this.GetTab().className = "oMTab";
oMTitle.innerText = "";
}
// Event for when the mouse moves over the tab button.
CTabber.prototype.OnMouseHover = function(){
if(!this.IsActive())		// should only run event if not already active.
this.GetTab().className = "oMTabHover";
}
// Event for when the user clicks the tab button.
CTabber.prototype.OnMouseClick = function(){
if(!this.IsActive()){		// should only run event if not already active.
this.MakeActive();
}
}
// Event for when the user moves the mouse from within the tab button area.
CTabber.prototype.OnMouseFlee = function(){
if(!this.IsActive())		// should only run event if not alreay active.
this.GetTab().className = "oMTab";
}
//
// Returns the scroll position for the <div> associated with this tab object.
CTabber.prototype.GetScrollPosition = function(){
this._scroll;
}
// Sets the scroll position for the <div> associated with this tab object.
CTabber.prototype.SetScrollPosition = function(newValue){
this._scroll = newValue;
if(this.IsActive()) oMTData.scrollTop = newValue;
goPersist.SetAttribute("scroll", newValue);
goPersist.Save();
}
// Initializes the state of the tab.  This includes creating the physical tab
// as well as associated a <div> with it.
CTabber.prototype._initializeComponent = function(newTab){
this._caption = newTab.tabName;			// the name used for the tab.
this._content = newTab;					// the <div> that contains the tabbed data.
this._scroll = 0;						// position of the scroll bar.
// prepare the tab for use.  Create the necessary structure.
this._tab = document.createElement("TD");
this._tab.onmouseover = onMouseOverRedirect;
this._tab.onmouseout = onMouseOutRedirect;
this._tab.onmousedown = onMouseClickRedirect;
this._tab.onkeypress = onMouseClickRedirect;
this._tab.onclick = onMouseClickRedirect;
this._tab.title = this.GetCaption();
this._tab.className = "oMTab";
this._tab.tabIndex = "0";
this._tab.innerText = this.GetCaption();
this._tab.tab = this;					// simply attachs a reference to this tab object onto the <TD>.
this.GetContent().tab = this;
}
// functions that dispatch the event to the correct handler.  This is done because
// when an event fires, there is no way for the system to know which user-defined
// object (CTabber) is being invoked.  The <TD> has a reference to the owning tab object
// so that the event can be invoked on the correct object.
function onMouseOverRedirect(){
this.tab.OnMouseHover();
}
function onMouseOutRedirect(){
this.tab.OnMouseFlee();
}
function onMouseClickRedirect(){
this.tab.OnMouseClick();
}
function expand_onclick_handler(){
toggleExpandDataView();
}
function scroll_onscroll_handler(){
gaTabs[0].GetActiveTab().SetScrollPosition(oMTData.scrollTop);
}
// Expands or collapses the list based on the interaction with the expand/collapse glyph.
function toggleExpandDataView(){
if(oCollapso.state == "collapsed"){
// the state is collapase so force environment to be expanded.
oCollapso.title = "折叠";
oMTData.style.overflow = "visible";
oCollapso.src = gsGraphicsPath + "UI_OM_collapse.gif";
oCollapso.state = "expanded";
// now that the view is being expanded, must save this state.
goPersist.SetAttribute("expanded", "true");
} else {
// the state is expanded so force environment to be expanded.
oCollapso.title = "展开";
oMTData.style.overflow = "auto";
oCollapso.src = gsGraphicsPath + "UI_OM_expand.gif";
oCollapso.state = "collapsed";
// now that the view is being collapsed, must remove expanded state.
goPersist.SetAttribute("expanded", "false");
}
}
function initTabbedMembers()
{
if(document.getElementById("oMT")){
var mshaid = document.all("MS-HAID");		// need to get the topic id for this page.
if(mshaid) gsPageId = mshaid.getAttribute("content");
locateAvailableTabs();				// assembly an array of all the divs that are tabs.
divscol=document.all.tags("div");
divsize=divscol.length;
if (divsize>0)
{
oMTExplanation.style.display = "block";
gsTabControl=''
// this defines the tabbed title bar.
gsTabControl=gsTabControl+'<TABLE class="oMembersTable" border="0" cellpadding="0" cellspacing="0" style="border-colapse:collapse" bordercolor="#111111" width="90%">';
gsTabControl=gsTabControl+'	<STYLE>';
gsTabControl=gsTabControl+'		.oMembersTable	{}';
gsTabControl=gsTabControl+'		TD				{}';
gsTabControl=gsTabControl+'		.oMTab			{background:#eeeeee; width:100%; height:20px; border-top=1px solid #6699cc; padding:7px; padding-left:7px; cursor:hand;}';
gsTabControl=gsTabControl+'		.oMTabOn		{background:#999999; width:100%; height:20px; color:#ffffff; border-top:1px groove white; padding:7px; padding-left:7px; cursor:hand;}';
gsTabControl=gsTabControl+'		.oMTabHover		{background:#dddddd; width:100%; height:20px; border-top=1px solid #6699cc; padding:7px; padding-left:7px; cursor:hand;}';
gsTabControl=gsTabControl+'	</STYLE>';
gsTabControl=gsTabControl+'	<TR>';
gsTabControl=gsTabControl+'		<TD width="100%" bgcolor="#6699cc">';
gsTabControl=gsTabControl+'			<TABLE border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse" bordercolor="#111111" width="100%" id="AutoNumber4">';
gsTabControl=gsTabControl+'				<TR>';
gsTabControl=gsTabControl+'					<TD width="4" height="25px" style="background-image:url(\'' + gsGraphicsPath + 'UI_OM_top_left_corner.gif\'); background-repeat:no-repeat">&nbsp;</TD>';
gsTabControl=gsTabControl+'					<TD width="*" height="25px">';
gsTabControl=gsTabControl+'						<DIV id="oMTitle" style="color:white; font-weight:bold; font-size:11pt; font-family:arial">&nbsp;</DIV>';
gsTabControl=gsTabControl+'					</TD>';
gsTabControl=gsTabControl+'					<TD width="25" height="25px" style="padding-top:2px">';
gsTabControl=gsTabControl+'						<IMG id="oCollapso" src="' + gsGraphicsPath + 'UI_OM_expand.gif" onclick="expand_onclick_handler();" title="展开" state="collapsed" style="cursor:hand" width="21 height="18">';
gsTabControl=gsTabControl+'					</TD>';
gsTabControl=gsTabControl+'					<TD width="4" height="25px" style="background-image:url(\'' + gsGraphicsPath + 'UI_OM_top_right_corner.gif\'); background-repeat:no-repeat; background-position:top right;">&nbsp;</TD>';
gsTabControl=gsTabControl+'				</TR>';
gsTabControl=gsTabControl+'			</TABLE>';
gsTabControl=gsTabControl+'		</TD>';
gsTabControl=gsTabControl+'	</TR>';
gsTabControl=gsTabControl+'	<TR>';
gsTabControl=gsTabControl+'		<TD width="100%">';
gsTabControl=gsTabControl+'			<TABLE border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse" bordercolor="#111111" width="100%">';
gsTabControl=gsTabControl+'				<TR>';
gsTabControl=gsTabControl+'					<TD width="95px" style="padding:5px; padding-top:0px; background:#eeeeee; border-top:1px solid white; border-left:1px solid #6699cc; border-bottom:1px solid #6699cc; border-right:4px solid #6699cc" valign="top">';
gsTabControl=gsTabControl+'						<TABLE border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse" bordercolor="#111111" width="100%">';
gsTabControl=gsTabControl+'							<TBODY id="oMTabberList">';
gsTabControl=gsTabControl+'								<TR>';
gsTabControl=gsTabControl+'									<TD width="100%"  height="20px" bgcolor="#eeeeee" style="padding-left:2px;"><B>SHOW:</B></TD>';
gsTabControl=gsTabControl+'								</TR>';
// the tabs will be dynamically built later based on the <div> content.
gsTabControl=gsTabControl+'							</TBODY>';
gsTabControl=gsTabControl+'						</TABLE>';
gsTabControl=gsTabControl+'					</TD>';
gsTabControl=gsTabControl+'					<TD width="*" valign="top" style="border-right:1px solid #6699cc; border-bottom:1px solid #6699cc" id="oMTabberContent">';
gsTabControl=gsTabControl+'						<TABLE border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse" bordercolor="#111111" height="100%" width="100%>';
gsTabControl=gsTabControl+'							<TR>';
gsTabControl=gsTabControl+'								<TD height="20" width="100%" bgcolor="#dddddd" style="border-collapse:collapse" bordercolor="#111111" height="100%">';
gsTabControl=gsTabControl+'									<TABLE border="0" cellpadding="0" cellspaceing="0" style="border-collapse: collapse" bordercolor="#111111" width="100%">';
gsTabControl=gsTabControl+'										<TR>';
gsTabControl=gsTabControl+'											<TD width="100%" height="*">';
gsTabControl=gsTabControl+'												<DIV id="oMTData" onscroll="scroll_onscroll_handler();" style="height:255px; overflow:auto; overflow-x:hidden;"></DIV>';
gsTabControl=gsTabControl+'											</TD>';
gsTabControl=gsTabControl+'										</TR>';
gsTabControl=gsTabControl+'									</TABLE>';
gsTabControl=gsTabControl+'								</TD>';
gsTabControl=gsTabControl+'							</TR>';
gsTabControl=gsTabControl+'						</TABLE>';
// the actual member links appear here based on the selected tabs.
gsTabControl=gsTabControl+'					</TD>';
gsTabControl=gsTabControl+'				</TR>';
gsTabControl=gsTabControl+'			</TABLE>';
gsTabControl=gsTabControl+'		</TD>';
gsTabControl=gsTabControl+'	</TR>';
gsTabControl=gsTabControl+'</TABLE>';
oMT.insertAdjacentHTML("beforeBegin", gsTabControl);	// renders the initial, constant, content.
goPersist = new CPersist(oMTData, gsStoreName);		// now I create the instance.
// cycles through all the tabs and renders the tab buttons.
for(var i=0; i<gaTabs.length; i++){
var tab = gaTabs[i];
var tr = document.createElement("TR");
tr.appendChild(tab.GetTab());
oMTabberList.appendChild(tr);
}
// determine the initial tab to display.  If there is persistent
// information, they use that, otherwise, just use the first
// tab in the list.
restoreInitState()
}
}
}
// cyncles through all the <div> tags and locate any that might be tabs.
function locateAvailableTabs(){
var divs = document.all.tags("div");
var key;
for(key in divs){
var div = divs[key];
if(div.tabName){	// this is a tag.  Try to add it to the tab collection for later use.
gaTabs[div.tabName] = gaTabs[gaTabs.length] = new CTabber(div);
div.style.display = "none";
}
}
}
function restoreInitState(){
persistTab = goPersist.GetAttribute("selectedTab");
persistExpand = goPersist.GetAttribute("expanded");
persistScroll = goPersist.GetAttribute("scroll");
if(gaTabs[persistTab]) gaTabs[persistTab].MakeActive(); else gaTabs[0].MakeActive();
if(persistExpand) toggleExpandDataView();
if(persistScroll) gaTabs[0].GetActiveTab().SetScrollPosition(persistScroll);
}
