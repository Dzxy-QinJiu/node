var trans = $.ajaxTrans();
//获取客户下拉列表
//参数 q 关键词
trans.register('customer_suggest' , {url: '/rest/global/customer_suggest',type: 'get'});

//获取某个客户下的用户列表
trans.register('getUserOfCustomer', {url: '/rest/crm/user_list', type: 'get'});


//获取客户下拉列表
//requestConfig可以指定获取字段列表 比如只获取客户id和客户名称
//getCustomerSuggestListAjax({fields : ["customer_id","customer_name"]})
exports.getCustomerSuggestListAjax = function(requestConfig) {
    return trans.getAjax('customer_suggest',requestConfig);
};
exports.getUserOfCustomer = function(reqParams) {
    return trans.getAjax('getUserOfCustomer', reqParams);
};
