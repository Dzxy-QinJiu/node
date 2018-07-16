// 根据客户id获取合同信息
let getContractByCustomerIdAjax = null;
exports.getContractByCustomerId = function(reqData, reqBody) {
    getContractByCustomerIdAjax && getContractByCustomerIdAjax.abort();
    let url = '/rest/crm/contract/' + reqData.pageSize + '/' + reqData.sortField + '/' + reqData.order;
    const Deferred = $.Deferred();
    getContractByCustomerIdAjax = $.ajax({
        url: url,
        dataType: 'json',
        type: 'post',
        data: {rangParams: JSON.stringify(reqBody)},
        success: (data) => {
            Deferred.resolve(data);
        },
        error: (xhr, textStatus) => {
            if (textStatus !== 'abort') {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};