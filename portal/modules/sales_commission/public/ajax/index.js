// 销售提成列表
let salesCommissionListAjax = null;
exports.getSalesCommissionList = function(params, queryObj) {
    let Deferred = $.Deferred();
    salesCommissionListAjax && salesCommissionListAjax.abort();
    let url = '/rest/sales/commission/list/' + params.page_size + '/' + params.sort_field + '/' + params.order;
    if (params.id) {
        url += '?id=' + params.id;
    }
    salesCommissionListAjax = $.ajax({
        url: url,
        dataType: 'json',
        type: 'post',
        data: queryObj,
        success: (list) => {
            Deferred.resolve(list);
        },
        error: (xhr, textStatus) => {
            if ('abort' !== textStatus) {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

// 更新销售提成
let updateSaleCommissionAjax = null;
exports.updateSaleCommission = function(queryObj) {
    let Deferred = $.Deferred();
    updateSaleCommissionAjax && updateSaleCommissionAjax.abort();
    updateSaleCommissionAjax = $.ajax({
        url: '/rest/update/sale/commission',
        dataType: 'json',
        type: 'post',
        data: queryObj,
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

// 重新计算提成
let recalculateSaleCommissionAjax = null;
exports.recalculateSaleCommission = function(queryObj) {
    let Deferred = $.Deferred();
    recalculateSaleCommissionAjax && recalculateSaleCommissionAjax.abort();
    recalculateSaleCommissionAjax = $.ajax({
        url: '/rest/recalculate/sale/commission',
        dataType: 'json',
        type: 'get',
        data: queryObj,
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

// 单个的销售提成明细
let saleCommissionDetailAjax = null;
exports.getSaleCommissionDetail = function(params, queryObj) {
    let Deferred = $.Deferred();
    saleCommissionDetailAjax && saleCommissionDetailAjax.abort();
    let url = '/rest/sale/commission/detail/' + params.page_size + '/' + params.sort_field + '/' + params.order + '/' + params.user_id;
    saleCommissionDetailAjax = $.ajax({
        url: url,
        dataType: 'json',
        type: 'post',
        data: queryObj,
        success: (list) => {
            Deferred.resolve(list);
        },
        error: (xhr, textStatus) => {
            if ('abort' !== textStatus) {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

// 合同详情
let getContractDetailAjax = null;
exports.getContractDetail = function(contractNum) {
    let Deferred = $.Deferred();
    getContractDetailAjax && getContractDetailAjax.abort();
    let url = '/rest/contract/detail/' + contractNum;
    getContractDetailAjax = $.ajax({
        url: url,
        dataType: 'json',
        type: 'post',
        success: (list) => {
            Deferred.resolve(list);
        },
        error: (xhr, textStatus) => {
            if ('abort' !== textStatus) {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};