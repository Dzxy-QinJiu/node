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



