// // 获取产品过滤IP
exports.productionGetFilterIP = (productionId) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: `/rest/product/get/filter/ip/${productionId}`,
        type: 'get',
        dataType: 'json',
        success: (result) => {
            Deferred.resolve(result);
        }, error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

// 产品配置中增加过滤ip
exports.productionAddFilterIP = (filterIp) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/product/add/filter/ip',
        type: 'post',
        dataType: 'json',
        data: filterIp,
        success: (result) => {
            Deferred.resolve(result);
        }, error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

// 产品配置中删除过滤ip
exports.productionDeleteFilterIP = (deleteIpObj) => {
    let productId = deleteIpObj.productId;
    let ip = deleteIpObj.ip;
    let Deferred = $.Deferred();
    $.ajax({
        url: `/rest/product/delete/filter/ip/${productId}/${ip}`,
        type: 'delete',
        dataType: 'json',
        success: (result) => {
            Deferred.resolve(result);
        }, error: (errorInfo) => {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

// 校验产品名称
let checkProductNameAjax = null;
exports.checkProductName = (query) => {
    const Deferred = $.Deferred();
    checkProductNameAjax && checkProductNameAjax.abort();
    checkProductNameAjax = $.ajax({
        url: '/rest/check/product/name',
        type: 'get',
        dataType: 'json',
        data: query,
        success: (data) => {
            Deferred.resolve(data);
        },
        error: (xhr, textStatus) => {
            if ('abort' !== textStatus) {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

//获取当前页的用户列表
exports.getProductions = function(query) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/product',
        type: 'get',
        dataType: 'json',
        data: query,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr, textStatus) {
            if ('abort' !== textStatus) {
                Deferred.reject(xhr.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

//添加
exports.addProduction = function(production) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/product',
        type: 'post',
        dataType: 'json',
        data: production,
        success: function(result) {
            Deferred.resolve(result);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

//修改
exports.editProduction = function(production) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/product',
        dataType: 'json',
        type: 'put',
        data: production,
        success: function(data) {
            Deferred.resolve(data);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};
//删除
exports.deleteItemById = (itemId) => {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/product/' + itemId,
        type: 'delete',
        dataType: 'json',
        success: function(result) {
            if(result){
                Deferred.resolve(itemId);
            }else{
                Deferred.reject('');
            }
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};

exports.getProductById = (itemId) => {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/product/' + itemId,
        type: 'get',
        dataType: 'json',
        success: function(result) {
            Deferred.resolve(result);
        }, error: function(errorInfo) {
            Deferred.reject(errorInfo.responseJSON);
        }
    });
    return Deferred.promise();
};