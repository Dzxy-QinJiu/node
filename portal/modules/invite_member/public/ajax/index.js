/**
 * Created by hzl on 2019/3/8.
 */

// 邀请成员
exports.inviteMember = (queryObj) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/invite/member',
        dataType: 'json',
        type: 'post',
        data: queryObj,
        success: (result) => {
            Deferred.resolve(result);
        }, error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON || Intl.get('sales.home.invite.member.failed', '邀请成员失败！'));
        }
    });
    return Deferred.promise();
};

//验证姓名唯一性
exports.checkOnlyName = (name) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/invite_member/name/check/' + name,
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

//验证用户名唯一性
exports.checkOnlyUserName = (username) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/invite_member/username/check/' + username,
        dataType: 'json',
        type: 'get',
        success: (result) => {
            Deferred.resolve(result);
        }, error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON || Intl.get('common.username.is.unique', '用户名唯一性校验出错！！'));
        }
    });
    return Deferred.promise();
};

//验证邮箱唯一性
exports.checkOnlyEmail = (phone) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/invite_member/email/check/' + phone,
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