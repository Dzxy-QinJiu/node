/**
 * Created by hzl on 2019/3/5.
 */
//通过或者驳回申请
let approveMemberApplyPassOrRejectAjax = null;
exports.approveMemberApplyPassOrReject = function(obj) {
    var Deferred = $.Deferred();
    approveMemberApplyPassOrRejectAjax && approveMemberApplyPassOrRejectAjax.abort();
    approveMemberApplyPassOrRejectAjax = $.ajax({
        url: '/rest/member_apply/submitApply',
        dataType: 'json',
        type: 'post',
        data: obj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

//验证姓名唯一性
exports.checkOnlyName = (name) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/member_apply/name/check/' + name,
        dataType: 'json',
        type: 'get',
        success: (result) => {
            Deferred.resolve(result);
        }, error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON || Intl.get('common.nickname.is.unique', '姓名唯一性校验出错！'));
        }
    });
    return Deferred.promise();
};

//验证邮箱唯一性
exports.checkOnlyEmail = (phone) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/member_apply/email/check/' + phone,
        dataType: 'json',
        type: 'get',
        success: (result) => {
            Deferred.resolve(result);
        }, error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON || Intl.get('user.email.only.error', '邮箱唯一性验证失败'));
        }
    });
    return Deferred.promise();
};
