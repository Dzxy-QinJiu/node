import ajaxPro from './../../../common/ajaxUtil';
import {AUTHS} from 'MOD_DIR/crm/public/utils/crm-util';
const hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
/**
 * 获取我发起的审批列表
 */
var applyListStartSelfAjax;
exports.getApplyListStartSelf = function(obj) {
    var Deferred = $.Deferred();
    applyListStartSelfAjax && applyListStartSelfAjax.abort();
    applyListStartSelfAjax = $.ajax({
        url: '/rest/apply_list/start/self',
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(data,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(data && data.message || Intl.get('common.get.user.apply.failed', '获取用户审批列表失败'));
            }
        }
    });
    return Deferred.promise();
};

/**
 * 获取我的审批列表
 */
var applyListMyAjax;
exports.getMyApplyLists = function(obj) {
    var Deferred = $.Deferred();
    applyListMyAjax && applyListMyAjax.abort();
    applyListMyAjax = $.ajax({
        url: '/rest/apply_list/approve/my',
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(data,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(data && data.message || Intl.get('common.get.user.apply.failed', '获取用户审批列表失败'));
            }
        }
    });
    return Deferred.promise();
};

/**
 * 获取所有审批列表
 */
var getAllApplyListAjax;
exports.getAllApplyLists = function(obj) {
    var Deferred = $.Deferred();
    getAllApplyListAjax && getAllApplyListAjax.abort();
    getAllApplyListAjax = $.ajax({
        url: '/rest/appuser/apply_list',
        dataType: 'json',
        type: 'get',
        data: obj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(data,textStatus) {
            if(textStatus !== 'abort') {
                Deferred.reject(data && data.message || Intl.get('common.get.user.apply.failed', '获取用户审批列表失败'));
            }
        }
    });
    return Deferred.promise();
};









//申请用户
exports.applyUser = function(data) {
    data = {reqData: JSON.stringify(data)};
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/base/v1/user/apply_grants',
        type: 'post',
        dataType: 'json',
        data: data,
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON || Intl.get('common.apply.failed', '申请失败'));
        }
    });
    return Deferred.promise();
};

// 撤销申请
exports.cancelApplyApprove = function(obj) {
    const ERROR_MSG = Intl.get('user.apply.detail.backout.error', '撤销申请失败');
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/appuser/backout_apply',
        type: 'put',
        dataType: 'json',
        data: obj,
        success: function(result) {
            //操作成功返回true
            if(result === true) {
                Deferred.resolve(result);
            } else {
                Deferred.reject(ERROR_MSG);
            }
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON || ERROR_MSG);
        }
    });
    return Deferred.promise();
};
