//客户下拉联想接口
//实际获取的客户的实体，然后进行一个转换
exports.CustomerSuggest = function(originCustomer) {
    var obj = {
        customer_id: originCustomer.id,
        customer_name: originCustomer.name,
        sales_id: originCustomer.user_id,
        sales_name: originCustomer.user_name,
        sales_team_id: originCustomer.sales_team_id,
        sales_team_name: originCustomer.sales_team
    };
    return obj;
};