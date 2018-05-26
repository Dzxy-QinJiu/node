//获取日程管理列表
exports.getScheduleList = function(queryObj) {
    var Deferred = $.Deferred();
    var url = '/rest/customer/get/schedule';
    // delete queryObj.page_size;
    // if (queryObj.id){
    //     url = url + "&id=" + queryObj.id;
    //     delete queryObj.id;
    // }
    $.ajax({
        url: '/rest/customer/get/schedule',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function(resData) {
            Deferred.resolve(resData);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//增加日程管理
exports.addSchedule = function(reqData) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/customer/add/schedule',
        dataType: 'json',
        type: 'post',
        data: reqData,
        success: function(resData) {
            Deferred.resolve(resData);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//编辑日程管理
exports.editAlert = function(reqData) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/customer/alert',
        dataType: 'json',
        type: 'put',
        data: reqData,
        success: function(resData) {
            Deferred.resolve(resData);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//删除日程管理
exports.deleteSchedule = function(reqData) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/customer/delete/schedule',
        dataType: 'json',
        type: 'delete',
        data: reqData,
        success: function(resData) {
            Deferred.resolve(resData);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
//修改某条日程管理的状态
exports.handleScheduleStatus = function(reqData) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/customer/change/schedule/' + reqData.id + '/' + reqData.status,
        dataType: 'json',
        type: 'put',
        success: function(resData) {
            Deferred.resolve(resData);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
