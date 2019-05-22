/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/5/21.
 */
//添加自定义流程名称
exports.addSelfSettingWorkFlow = function(data) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/add/self_setting/work_flow',
        dataType: 'json',
        type: 'post',
        data: data,
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};
//修改自定义流程
exports.editSelfSettingWorkFlow = function(data) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/put/self_setting/work_flow',
        dataType: 'json',
        type: 'put',
        data: data,
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};
//删除自定义流程
exports.delSelfSettingWorkFlow = function(applyId) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/delete/self_setting/work_flow/' + applyId,
        dataType: 'json',
        type: 'delete',
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};
//保存流程规则
exports.saveSelfSettingWorkFlowRules = function(data) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/put/self_setting/work_flow/rules',
        dataType: 'json',
        type: 'put',
        data: data,
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};



