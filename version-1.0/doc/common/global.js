var ToolBar_Supported = ToolBar_Supported ;
if (ToolBar_Supported != null && ToolBar_Supported == true)
{
//To Turn on/off Instrumentation set DoInstrumentation = true/false.
DoInstrumentation= false;
// Customize default MS menu color - bgColor, fontColor, mouseoverColor
setDefaultMSMenuColor("#000000", "white", "red");
// Customize toolbar background color
setToolbarBGColor("white");
// display default ICP Banner
setICPBanner("../common/banner.gif","/isapi/gomscom.asp?target=/","microsoft.com Home") ;
// display MSCOM Banner
setMSBanner("mslogo.gif","/isapi/gomscom.asp?target=/","microsoft.com Home") ;
// display ADS
//setAds("/library/toolbar/images/ADS/ad.gif","","") ;
//***** Add Standard Microsoft.com menus *****
//ProductsMenu
addMSMenu("ProductsMenu", "All Products", "","/isapi/gomscom.asp?target=/catalog/default.asp?subid=22");
addMSSubMenu("ProductsMenu","Downloads","/isapi/gomscom.asp?target=/downloads/");
addMSSubMenu("ProductsMenu","MS Product Catalog","/isapi/gomscom.asp?target=/catalog/default.asp?subid=22");
addMSSubMenu("ProductsMenu","Microsoft Accessibility","/isapi/gomscom.asp?target=/enable/");
addMSSubMenuLine("ProductsMenu");
addMSSubMenu("ProductsMenu","Servers","/isapi/gomscom.asp?target=/servers/");
addMSSubMenu("ProductsMenu","Developer Tools","/isapi/gomsdn.asp?target=/vstudio/");
addMSSubMenu("ProductsMenu","Office","http://office.microsoft.com");
addMSSubMenu("ProductsMenu","Windows","/isapi/gomscom.asp?target=/windows/");
addMSSubMenu("ProductsMenu","MSN","http://www.msn.com/");
addMSMenu("SupportMenu", "Support", "","http://support.microsoft.com");
addMSSubMenu("SupportMenu","Knowledge Base","http://support.microsoft.com/search/");
addMSSubMenu("SupportMenu","Developer Support","http://msdn.microsoft.com/support/");
addMSSubMenu("SupportMenu","IT Pro Support"," http://www.microsoft.com/technet/support/");
addMSSubMenu("SupportMenu","Product Support Options","http://support.microsoft.com");
addMSSubMenu("SupportMenu","Service Providers","http://directory.microsoft.com/resourcedirectory/services.aspx");
addMSMenu("SearchMenu", "Search", "","/isapi/gosearch.asp?target=/us/default.asp");
addMSSubMenu("SearchMenu","Search Microsoft.com","/isapi/gosearch.asp?target=/us/default.asp");
addMSSubMenu("SearchMenu","MSN Web Search","http://search.msn.com/");
//MicrosoftMenu
addMSMenu("MicrosoftMenu", "Microsoft.com Guide", "","/isapi/gomscom.asp?target=/");
addMSSubMenu("MicrosoftMenu","Microsoft.com Home","/isapi/gomscom.asp?target=/");
addMSSubMenu("MicrosoftMenu","MSN Home","http://www.msn.com/");
addMSSubMenuLine("MicrosoftMenu");
addMSSubMenu("MicrosoftMenu","Contact Us","/isapi/goregwiz.asp?target=/regwiz/forms/contactus.asp");
addMSSubMenu("MicrosoftMenu","Events","/isapi/gomscom.asp?target=/usa/events/default.asp");
addMSSubMenu("MicrosoftMenu","Newsletters","/isapi/goregwiz.asp?target=/regsys/pic.asp?sec=0");
addMSSubMenu("MicrosoftMenu","Profile Center","/isapi/goregwiz.asp?target=/regsys/pic.asp");
addMSSubMenu("MicrosoftMenu","Training & Certification","/isapi/gomscom.asp?target=/traincert");
addMSSubMenu("MicrosoftMenu","Free E-mail Account","http://www.hotmail.com/");
}
