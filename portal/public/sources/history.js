/**
 * 全局通用history
 * 用来在页面中进行跳转时使用
 * https://github.com/mjackson/history/blob/master/docs/GettingStarted.md#navigation
 */
var createHistory = require('history').createBrowserHistory;
var url = require('url');
var pathname = window.location.pathname || '';
var history = createHistory();
history.listen(function(location) {
    var parseObj = url.parse(window.location.href);
    if (pathname !== location.pathname) {
        pathname = location.pathname;
        alt.flush();
        if (typeof (_paq) != 'undefined') {
            var currentUrl = parseObj.href;
            _paq.push(['setReferrerUrl', currentUrl]);
            _paq.push(['setDocumentTitle', location.pathname]);
            _paq.push(['setCustomUrl', parseObj.protocol + '//' + parseObj.host + '/']);
            _paq.push(['trackPageView']);
            _paq.push(['enableHeartBeatTimer', 30]);
        }
    }
});
module.exports = history;