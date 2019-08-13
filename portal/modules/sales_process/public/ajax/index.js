/**
 * Created by hzl on 2019/8/1.
 */

// 获取销售流程
let salesProcessAjax = null;
exports.getSalesProcess = () => {
    salesProcessAjax && salesProcessAjax.abort();
    let Deferred = $.Deferred();
    salesProcessAjax = $.ajax({
        url: '/rest/get/sales/process',
        dataType: 'json',
        type: 'get',
        success: (result) => {
            Deferred.resolve(result);
        },
        error: (xhr, textStatus) => {
            if ('abort' !== textStatus) {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

// 添加销售流程
let addSalesProcessAjax = null;
exports.addSalesProcess = (addProcessObj) => {
    addSalesProcessAjax && addSalesProcessAjax.abort();
    let Deferred = $.Deferred();
    addSalesProcessAjax = $.ajax({
        url: '/rest/add/sales/process',
        dataType: 'json',
        type: 'post',
        data: addProcessObj,
        success: (result) => {
            Deferred.resolve(result);
        },
        error: (xhr, textStatus) => {
            if ('abort' !== textStatus) {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

// 更新销售流程
exports.updateSalesProcess = (upDateProcessObj) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/update/sales/process',
        dataType: 'json',
        type: 'put',
        data: upDateProcessObj,
        success: (result) => {
            Deferred.resolve(result);
        }, error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

// 删除销售流程
exports.deleteSalesProcess = (id) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: `/rest/delete/sales/process/${id}`,
        dataType: 'json',
        type: 'delete',
        success: (result) => {
            Deferred.resolve(result);
        }, error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

// 根据销售流程id获取客户阶段
exports.getCustomerStageBySaleProcessId = (id) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: `/rest/get/sales/process/customer/stage/${id}`,
        dataType: 'json',
        type: 'get',
        success: (result) => {
            Deferred.resolve(result);
        },
        error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

// 添加客户阶段
exports.addCustomerStage = (addStage, saleProcessId) => {
    let Deferred = $.Deferred();
    addSalesProcessAjax = $.ajax({
        url: `/rest/add/customer/stage/${saleProcessId}`,
        dataType: 'json',
        type: 'post',
        data: addStage,
        success: (result) => {
            Deferred.resolve(result);
        },
        error: (xhr, textStatus) => {
            if ('abort' !== textStatus) {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

// 编辑客户阶段
exports.editCustomerStage = (editStage,saleProcessId) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: `/rest/edit/customer/stage/${saleProcessId}`,
        dataType: 'json',
        type: 'put',
        data: editStage,
        success: (result) => {
            Deferred.resolve(result);
        }, error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

// 删除客户阶段
exports.deleteCustomerStage = (id) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: `/rest/delete/customer/stage/${id}`,
        dataType: 'json',
        type: 'delete',
        success: (result) => {
            Deferred.resolve(result);
        }, error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

// 变更客户阶段顺序
exports.changeCustomerStageOrder = (stageList) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/change/customer/stage/order',
        dataType: 'json',
        contentType: 'application/json',
        type: 'put',
        data: JSON.stringify(stageList),
        success: (result) => {
            Deferred.resolve(result);
        }, error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};