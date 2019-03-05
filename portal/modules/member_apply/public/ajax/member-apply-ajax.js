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
