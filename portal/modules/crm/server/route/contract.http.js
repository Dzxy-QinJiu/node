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
    }, {
        // 添加合同
        'method': 'post',
        'path': '/rest/crm/add/contract/:type',
        'handler': 'addContract',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    },{
        // 删除待审合同
        'method': 'delete',
        'path': '/rest/crm/delete/contract/:id',
        'handler': 'deletePendingContract',
        'passport': {
            'needLogin': true
        }
    },{
        // 编辑待审合同
        'method': 'put',
        'path': '/rest/crm/edit/contract/:type/:property',
        'handler': 'editPendingContract',
        'passport': {
            'needLogin': true
        }
    }]
};
