// 提成发放列表
let commissionPaymentListAjax = null;
exports.getCommissionPaymentList = function(params, queryObj) {
    let Deferred = $.Deferred();
    commissionPaymentListAjax && commissionPaymentListAjax.abort();
    let url = '/rest/commission/payment/list/' + params.page_size + '/' + params.sort_field + '/' + params.order;
    if (params.id) {
        url += '?id=' + params.id;
    }
    commissionPaymentListAjax = $.ajax({
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