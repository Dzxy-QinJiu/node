/**
 * 将客户字段进行转换
 */
exports.toRestObject = function(list) {
    list = list || [];
    var result = [];
    list.forEach(function(item) {
        result.push({
            value : item.id,
            name : item.name,
            sales_id : item.user_id,
            sales_name : item.user_name,
            sales_team_id : item.sales_team_id,
            sales_team_name : item.sales_team
        });
    });

    return result;
};