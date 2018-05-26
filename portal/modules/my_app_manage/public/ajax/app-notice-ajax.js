// 获取系统公告信息
var appNoticeAjax = null;

exports.getAppNoticeList = function(searchObj){
    var queryObj = {
        application_id: searchObj.appId,
        page_num : searchObj.page,
        page_size: searchObj.pageSize
    };
    var Deferred = $.Deferred();
    appNoticeAjax && appNoticeAjax.abort();

    appNoticeAjax = $.ajax({
        url: '/rest/get_app/notice',
        type: 'get',
        data : queryObj,
        dateType: 'json',
        success : function(result){
            Deferred.resolve(result);
        },
        error : function(xhr, state) {
            if ('abort' !== state){
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

// 添加公告信息
exports.addAppNotice = function(newNoticeInfo){
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/add_app/notice',
        type: 'post',
        dateType: 'json',
        data: newNoticeInfo,
        success: function(result) {
            Deferred.resolve(result);
        },
        error : function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};