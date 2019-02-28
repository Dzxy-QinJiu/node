/**
 * Created by hzl on 2019/2/28.
 */

// 邀请成员
exports.inviteMember = function(queryObj){
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/invite/member',
        dataType: 'json',
        type: 'post',
        data: queryObj,
        success: (result) => {
            Deferred.resolve(result);
        }, error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//验证用户名唯一性
exports.checkOnlyUserName = function(queryObj){
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/invite_member/name/check',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: (result) => {
            Deferred.resolve(result);
        }, error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON || Intl.get('common.username.is.unique', '用户名唯一性校验出错！！'));
        }
    });
    return Deferred.promise();
};

//验证邮箱唯一性
exports.checkOnlyEmail = function(queryObj) {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/invite_member/email/check',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: (result) => {
            Deferred.resolve(result);
        }, error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};