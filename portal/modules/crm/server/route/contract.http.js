/**
 * 请求路径 - contact
 */

module.exports = {
    module: 'crm/server/action/contract-controller',
    routes: [{
        // 根据客户id获取合同信息
        'method': 'post', 
        'path': '/rest/crm/contract/:page_size/:sort_field/:order',
        'handler': 'getContractByCustomerId',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }]
};
