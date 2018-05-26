import PositionStore from '../store/index';

// 添加座席号
exports.addPhoneOrder = function(queryObj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/add/phoneorder',
        dataType: 'json',
        type: 'post',
        data: queryObj,
        success: (data) => {
            Deferred.resolve(data);
        },
        error: (xhr) => {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};
// 获取电话座席号列表
exports.getPhoneOrderList = function(reqObj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/get/phoneorder',
        dataType: 'json',
        type: 'get',
        data: reqObj,
        success: (data) => {
            Deferred.resolve(data);
        },
        error: (xhr) => {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};
// 获取未绑定座席号的成员列表
exports.getUnbindMemberList = function(reqRealm) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/get/unbind/member/list',
        dataType: 'json',
        type: 'get',
        data: reqRealm,
        success: (data) => {
            Deferred.resolve(data);
        },
        error: (xhr) => {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};
// 修改座席号(座席号、地域)
exports.updatePhoneOrder = function(phoneObj) {
    let queryObj = {
        id: phoneObj.user_id || phoneObj.id
    };
    if (phoneObj.phone_order) {
        queryObj.phone_order = phoneObj.phone_order;
    }
    if (phoneObj.phone_order_location) {
        queryObj.phone_order_location = phoneObj.phone_order_location;
    }
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/update/phoneorder',
        dataType: 'json',
        type: 'put',
        data: queryObj,
        success: function(data) {
            Deferred.resolve(data);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};
// 成员绑定座席号
exports.memberBindPhoneOrder = function(reqObj) {
    var memberList = PositionStore.getState().unbindMember.data;
    let filterData = _.filter(memberList, (item) => {
        return item.nick_name == reqObj.user_id;
    });
    if (_.isArray(filterData) && filterData.length) {
        reqObj.user_id = filterData[0].user_id;
    }
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/bind/phoneorder',
        dataType: 'json',
        type: 'put',
        data: reqObj,
        success: function(data) {
            Deferred.resolve(data);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};
// 获取安全域信息列表
exports.getRealmList = function() {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/get/realm/list',
        dataType: 'json',
        type: 'get',
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};