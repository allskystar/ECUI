function onPageFinish () {
    var RES_PROC_URL = 'http://localhost/ecuiTest/getErrCase.php',
        STORAGE_KEY = 'ecui_test_failed_cases',
        each = baidu.array.each,
        domQuery = baidu.dom.query,
        first = baidu.dom.first,
        getAncestorByTag = baidu.dom.getAncestorByTag,
        jsonStringify = baidu.json.stringify,
        jsonParse = baidu.json.parse,
        setInput = ecui.dom.setInput,
        ex = [],
        page = location.href.match(/([^\/]+).html\?(\w+)/);

    page = page[1] + '_' + page[2];
    each(domQuery('ul.specs>li.exception', baidu.g('log')), function (n, i) {
        var suiteInfo = {
            suite: first(n).innerHTML, 
            cases: []
        };
        each(domQuery('li.exception>h4', n), function (caseItem, j) {
            suiteInfo.cases.push(caseItem.innerHTML);
        });
        ex.push(suiteInfo);
    });
   
    // 结果写入本地储存
    if (document.domain) {
        USTORE.init();
        var storedfailedCases = jsonParse(USTORE.getValue(STORAGE_KEY) || '{}');
        storedfailedCases[page] = jsonStringify(ex);
        USTORE.setValue(STORAGE_KEY, jsonStringify(storedfailedCases));
    }
}
