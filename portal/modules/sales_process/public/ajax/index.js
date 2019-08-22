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

// 获取客户阶段的销售行为
exports.getCustomerStageSaleBehavior = () => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/get/customer/stage/sale/behavior',
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

// 添加客户阶段的销售行为
exports.addCustomerStageSaleBehavior = (addSaleBehaviorArray, paramsObj) => {
    let saleProcessId = paramsObj.saleProcessId;
    let stageId = paramsObj.stageId;
    let Deferred = $.Deferred();
    addSalesProcessAjax = $.ajax({
        url: `/rest/add/customer/stage/sale/behavior/${saleProcessId}/${stageId}`,
        dataType: 'json',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify(addSaleBehaviorArray),
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

// 获取客户阶段的自动变更条件
exports.getCustomerStageAutoConditions = () => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/get/customer/stage/auto/change/conditions',
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

// 编辑客户阶段的自动变更条件（添加或是更新）
exports.editCustomerStageAutoConditions = (atuoChangArray, paramsObj) => {
    const saleProcessId = paramsObj.saleProcessId;
    const stageId = paramsObj.stageId;
    const Deferred = $.Deferred();
    $.ajax({
        url: `/rest/edit/customer/stage/auto/change/conditions/${saleProcessId}/${stageId}`,
        dataType: 'json',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify(atuoChangArray),
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

// 启/停用自动化条件
exports.changeAutoConditionsStatus = (statusObj,paramsObj) => {
    const saleProcessId = paramsObj.saleProcessId;
    const stageId = paramsObj.stageId;
    const status = paramsObj.status;
    const Deferred = $.Deferred();
    $.ajax({
        url: `/rest/change/auto/change/conditions/${saleProcessId}/${stageId}/${status}`,
        dataType: 'json',
        type: 'put',
        data: statusObj,
        success: (result) => {
            Deferred.resolve(result);
        }, error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};