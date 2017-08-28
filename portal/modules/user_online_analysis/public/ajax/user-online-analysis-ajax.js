//将ajax请求的url提取出来
var urls = {
    //一个应用为一个卡片，分页展示各个应用的用户在线统计数据
    getUserOnlineAnalysisList : '/rest/online/analysis/summary',
    //获取某个应用的浏览器统计
    getOnlineBrowserByApp : '/rest/online/analysis/browser',
    //获取某个应用的地域信息
    getOnlineZoneByApp : '/rest/online/analysis/zone'
};

//多次翻页时，abort掉上一次的请求
var userOnlineAnalysisListAjax;
//一个应用为一个卡片，分页展示各个应用的用户在线统计数据
exports.getUserOnlineAnalysisList = function(queryObj) {
    queryObj = queryObj || {};
    var Deferred = $.Deferred();
    userOnlineAnalysisListAjax && userOnlineAnalysisListAjax.abort();
    userOnlineAnalysisListAjax = $.ajax({
        url: urls.getUserOnlineAnalysisList + '/' + queryObj.page_size + '/' + queryObj.page,
        dataType: 'json',
        type: 'get',
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (error,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(error && error.description || '获取在线用户统计数据失败');
            }
        }
    });
    return Deferred.promise();
};

//获取某个应用的浏览器统计
exports.getOnlineBrowserByApp = function(queryObj) {
    queryObj = queryObj || {};
    var Deferred = $.Deferred();
    $.ajax({
        url: urls.getOnlineBrowserByApp + '/' + queryObj.app_id,
        dataType: 'json',
        type: 'get',
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (error) {
            Deferred.reject(error && error.description || '获取浏览器统计信息失败');
        }
    });
    return Deferred.promise();
};

//获取某个应用的地域信息
exports.getOnlineZoneByApp = function(queryObj) {
    queryObj = queryObj || {};
    var Deferred = $.Deferred();
    $.ajax({
        url: urls.getOnlineZoneByApp + '/' + queryObj.app_id,
        dataType: 'json',
        type: 'get',
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (error) {
            Deferred.reject(error && error.description || '获取地域统计信息失败');
        }
    });
    return Deferred.promise();
};