import ajaxPro from './../../../common/ajaxUtil';
import {AUTHS} from 'MOD_DIR/crm/public/utils/crm-util';
const hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
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
 * 提交审批
 */
exports.submitApply = function(obj) {
    var Deferred = $.Deferred();
    var submitData = $.extend(true,{}, obj);
    $.ajax({
        url: '/rest/appuser/apply',
        dataType: 'json',
        type: 'post',
        data: submitData,
        timeout: 180 * 1000,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON || Intl.get('user.apply.detail.send.result.error', '申请结果发送失败'));
        }
    });
    return Deferred.promise();
};

//延期、停用提交审批
// exports.submitMultiAppApply = params => ajaxPro('submitMultiAppApply', params);

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

