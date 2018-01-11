
/**
 * 获取用户审批列表
 */
var applyListAjax;
exports.getApplyList = function(obj) {
    var Deferred = $.Deferred();
    applyListAjax && applyListAjax.abort();
    applyListAjax = $.ajax({
        url: '/rest/appuser/apply_list',
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (data,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(data && data.message || Intl.get("common.get.user.apply.failed", "获取用户审批列表失败"));
            }
        }
    });
    return Deferred.promise();
};

/**
 * 获取申请详情
 */
var applyDetailAjax;
exports.getApplyDetail = function(id) {
    var Deferred = $.Deferred();
    applyDetailAjax && applyDetailAjax.abort();
    applyDetailAjax = $.ajax({
        url: '/rest/appuser/apply/' + id,
        dataType: 'json',
        type: 'get',
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(xhr && xhr.responseJSON || Intl.get("user.apply.detail.get.failed", "获取申请详情失败"));
            }
        }
    });
    return Deferred.promise();
};


/**
 * 获取申请的回复列表
 */
exports.getReplyList = function (id) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/appuser/replylist/' + id,
        dataType: 'json',
        type: 'get',
        timeout : 180 * 1000,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr) {
            Deferred.reject(xhr.responseJSON || Intl.get("user.apply.reply.get.list.failed", "回复列表获取失败"));
        }
    });
    return Deferred.promise();
};

/**
 * 提交审批
 */
exports.submitApply = function(obj) {
    var Deferred = $.Deferred();
    var submitData = $.extend(true,{}, obj);
    $.ajax({
        url: '/rest/appuser/apply/' + obj.message_id,
        dataType: 'json',
        type: 'post',
        data : submitData,
        timeout : 180 * 1000,
        success: function (data) {
            Deferred.resolve(data);
        },
        error: function (xhr) {
            Deferred.reject(xhr.responseJSON || Intl.get("user.apply.detail.send.result.error", "申请结果发送失败"));
        }
    });
    return Deferred.promise();
};

//申请用户
exports.applyUser = function (data) {
    data = {reqData: JSON.stringify(data)};
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/base/v1/user/apply_grants',
        type: 'post',
        dataType: 'json',
        data: data,
        success: function (result) {
            Deferred.resolve(result);
        },
        error: function () {
            Deferred.reject( Intl.get("common.apply.failed", "申请失败"));
        }
    });
    return Deferred.promise();
};

//添加回复
exports.addReply = function(data) {
    const ERROR_MSG = Intl.get("user.apply.reply.error", "添加回复失败");
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/appuser/add_reply',
        type: 'post',
        dataType: 'json',
        data: data,
        success: function (result) {
            Deferred.resolve(result);
        },
        error: function (xhr) {
            Deferred.reject(xhr.responseJSON || ERROR_MSG);
        }
    });
    return Deferred.promise();
};

// 撤销申请
exports.saleBackoutApply = function(obj) {
    const ERROR_MSG =Intl.get("user.apply.detail.backout.error", "撤销申请失败");
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/appuser/backout_apply',
        type: 'put',
        dataType: 'json',
        data: obj,
        success: function (result) {
            //操作成功返回true
            if(result === true) {
                Deferred.resolve(result);
            } else {
                Deferred.reject(ERROR_MSG);
            }
        },
        error: function (xhr) {
            Deferred.reject(xhr.responseJSON || ERROR_MSG);
        }
    });
    return Deferred.promise();
};
