// 获取版本升级日志信息

var appRecordsAjax = null;

exports.getAppRecordsList = function(searchObj){
    var queryObj = {
        application_id: searchObj.appId,
        page_size: searchObj.pageSize,
        page_num : searchObj.page
    };
    var Deferred = $.Deferred();
    appRecordsAjax && appRecordsAjax.abort();
    appRecordsAjax = $.ajax({
        url: '/rest/get_app/version/records',
        type: 'get',
        data : queryObj,
        dateType: 'json',
        success : function(result){
            Deferred.resolve(result);
        },
        error : function (xhr, state) {
            if ('abort' !== state){
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

// 添加版本升级日志版本号和升级内容信息
exports.addAppVersion = function(versionContent){
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/add_app/version/record',
        type: 'post',
        dateType: 'json',
        data: versionContent,
        success: function (result) {
            Deferred.resolve(result);
        },
        error: function (errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

// 添加上传版本升级
exports.addUploadVersion = function(formData){
    var Deferred = $.Deferred();
    $.ajax({
        url:"/rest/my_app/upload/version_upgrade",
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        cache: false,
        success : function(result){
            Deferred.resolve(result);
        },
        error : function (errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });

    return Deferred.promise();
};

// 删除版本升级记录
exports.deleteAppVersionRecord = function(recordId){
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/delete_app/version/record/' + recordId ,
        type: 'delete',
        success: function (result) {
            Deferred.resolve(result);
        },
        error: function (errorInfo) {
            Deferred.reject(errorInfo.responseJSON || "该记录删除失败！");
        }
    });
    return Deferred.promise();
};