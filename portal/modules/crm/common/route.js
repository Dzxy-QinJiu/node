const crmPrivilegeConst = require('../public/privilege-const').default;
const orderPrivilegeConst = require('../../deal_manage/public/privilege-const').default;
const orderUrl = '/rest/customer/v3/salesopportunity';
//获取全部销售阶段，包括系统设置的和导入的旧数据中的
const stageUrl = '/rest/customer/v2/salesopportunity/term/sale_stages';
//获取系统设置的销售阶段
const sysStageUrl = '/rest/customer/v2/salestage';
//新添加的用户审批
const applyUserUrl = '/rest/base/v1/workflow/newuser';
const queryCustomerUrl = '/rest/customer/v2/customer/query';
//添加销售线索
const addSalesClueUrl = '/rest/clue/v2/add';

module.exports = [{
    'method': 'post',
    'path': orderUrl + '/range/:type/10/1/time/descend',
    'handler': 'getOrderList',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'post',
    'path': orderUrl,
    'handler': 'addOrder',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        orderPrivilegeConst.SALESOPPORTUNITY_ADD
    ]
}, {
    'method': 'put',
    'path': orderUrl + '/property/:property',
    'handler': 'editOrder',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        orderPrivilegeConst.SALESOPPORTUNITY_UPDATE
    ]
}, {
    'method': 'delete',
    'path': orderUrl + '/:id',
    'handler': 'deleteOrder',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        orderPrivilegeConst.SALESOPPORTUNITY_UPDATE
    ]
}, {
    'method': 'post',
    'path': orderUrl + '/contract/:id',
    'handler': 'generateContract',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'post',
    'path': applyUserUrl,
    'handler': 'applyUser',
    'passport': {
        'needLogin': true
    },
    privileges: [crmPrivilegeConst.USER_APPLY_APPROVE]
}, {
    'method': 'post',
    'path': stageUrl,
    'handler': 'getStageList',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        orderPrivilegeConst.SALESOPPORTUNITY_QUERY,
        orderPrivilegeConst.CRM_MANAGER_LIST_SALESOPPORTUNITY
    ]
}, {
    'method': 'get',
    'path': sysStageUrl,
    'handler': 'getSysStageList',
    'passport': {
        'needLogin': true
    }
}, {
    //todo 后端没有这个接口
    method: 'get',
    path: queryCustomerUrl,
    handler: 'getCustomerById',
    passport: {
        needLogin: true
    },
    privileges: [
        // 'CRM_LIST_CUSTOMERS'
    ]
}, {
    'method': 'post',
    'path': addSalesClueUrl,
    'handler': 'addSalesClue',
    'passport': {
        'needLogin': true
    },
    privileges: [
        crmPrivilegeConst.CURTAO_CRM_LEAD_ADD
    ]
}];
