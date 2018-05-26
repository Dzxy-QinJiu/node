// 获取版本升级日志信息

var appRecordsAjax = null;

exports.getAppRecordsList = function(searchObj){
    var queryObj = {
        application_id: searchObj.appId,
        page_size: searchObj.pageSize,
        page_num: searchObj.page
    };
    var Deferred = $.Deferred();
    appRecordsAjax && appRecordsAjax.abort();
    appRecordsAjax = $.ajax({
        url: '/rest/get_app/version/records',
        type: 'get',
        data: queryObj,
        dateType: 'json',
        success: function(result){
            Deferred.resolve(result);
        },
        error: function(xhr, state) {
            if ('abort' !== state){
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};