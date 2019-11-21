/**
 * 请求路径 - contact
 * 合同管理
 */
var crmPrivilegeCons = require('../../public/privilege-const');

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
        'privileges': [crmPrivilegeCons.CRM_CONTRACT_COMMON_BASE]
    }, {
        // 添加合同
        'method': 'post',
        'path': '/rest/crm/add/contract/:type',
        'handler': 'addContract',
        'passport': {
            'needLogin': true
        },
        'privileges': [crmPrivilegeCons.CRM_CONTRACT_COMMON_BASE]
    },{
        // 删除待审合同
        'method': 'delete',
        'path': '/rest/crm/delete/contract/:id',
        'handler': 'deletePendingContract',
        'passport': {
            'needLogin': true
        },
        'privileges': [crmPrivilegeCons.CRM_CONTRACT_COMMON_BASE]
    },{
        // 编辑待审合同
        'method': 'put',
        'path': '/rest/crm/edit/contract/:type/:property',
        'handler': 'editPendingContract',
        'passport': {
            'needLogin': true
        },
        'privileges': [crmPrivilegeCons.CRM_CONTRACT_COMMON_BASE]
    }]
};
