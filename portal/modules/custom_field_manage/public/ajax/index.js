/**
 * Created by hzl on 2020/5/15.
 */

// 获取自定义参数配置
let getAjax = null;
exports.getCustomFieldConfig = (data) => {
    const Deferred = $.Deferred();
    getAjax && getAjax.abort();
    getAjax = $.ajax({
        url: '/rest/get/custom/field',
        dataType: 'json',
        type: 'get',
        data: data,
        success: (list) => {
            Deferred.resolve(list);
        },
        error: (errorMsg, status) => {
            if(status !== 'abort') {
                Deferred.reject(errorMsg.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

// 添加自定义参数配置
let addAjax = null;
exports.addCustomFieldConfig = (data) => {
    const Deferred = $.Deferred();
    addAjax && addAjax.abort();
    addAjax = $.ajax({
        url: '/rest/add/custom/field',
        dataType: 'json',
        type: 'post',
        data: data,
        success: (list) => {
            Deferred.resolve(list);
        },
        error: (errorMsg, status) => {
            if(status !== 'abort') {
                Deferred.reject(errorMsg.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

// 修改自定义参数配置
let updateAjax = null;
exports.updateCustomFieldConfig = (data) => {
    const Deferred = $.Deferred();
    updateAjax && updateAjax.abort();
    updateAjax = $.ajax({
        url: '/rest/update/custom/field',
        dataType: 'json',
        type: 'put',
        data: data,
        success: (list) => {
            Deferred.resolve(list);
        },
        error: (errorMsg, status) => {
            if(status !== 'abort') {
                Deferred.reject(errorMsg.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

// 删除自定义参数配置
let deleteAjax = null;
exports.deleteCustomFieldConfig = (id) => {
    const Deferred = $.Deferred();
    deleteAjax && deleteAjax.abort();
    deleteAjax = $.ajax({
        url: `/rest/delete/custom/field/${id}`,
        dataType: 'json',
        type: 'delete',
        success: (list) => {
            Deferred.resolve(list);
        },
        error: (errorMsg, status) => {
            if(status !== 'abort') {
                Deferred.reject(errorMsg.responseJSON);
            }
        }
    });
    return Deferred.promise();
};