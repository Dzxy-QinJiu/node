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
                Deferred.reject(xhr.responseJSON || xhr.responseText);
            }
        }
    });
    return Deferred.promise();
};

//获取当前用户的详细信息
exports.getCurUserById = function(userId) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/user/id/' + userId,
        dataType: 'json',
        type: 'get',
        success: function(userObj) {
            Deferred.resolve(userObj);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON);
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