const orderUrl = '/rest/customer/v3/salesopportunity';
//获取全部销售阶段，包括系统设置的和导入的旧数据中的
const stageUrl = '/rest/customer/v2/salesopportunity/term/sale_stages';
//获取系统设置的销售阶段
const sysStageUrl = '/rest/customer/v2/salestage';
const applyUserUrl = '/rest/base/v1/user/apply_users';
const queryCustomerUrl = '/rest/customer/v2/customer/query';
//添加销售线索
const addSalesClueUrl = '/rest/clue/v1/add';

module.exports = [{
    'method': 'post',
    'path': orderUrl + '/range/:type/10/time/descend',
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
    }
}, {
    'method': 'put',
    'path': orderUrl,
    'handler': 'editOrder',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'put',
    'path': orderUrl + '/property/sale_stage',
    'handler': 'editOrderStage',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'delete',
    'path': orderUrl + '/:id',
    'handler': 'deleteOrder',
    'passport': {
        'needLogin': true
    }
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
    }
}, {
    'method': 'post',
    'path': stageUrl,
    'handler': 'getStageList',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'get',
    'path': sysStageUrl,
    'handler': 'getSysStageList',
    'passport': {
        'needLogin': true
    }
}, {
    method: 'get',
    path: queryCustomerUrl,
    handler: 'getCustomerById',
    passport: {
        needLogin: true
    },
    privileges: [
        'CRM_LIST_CUSTOMERS'
    ]
}, {
    'method': 'post',
    'path': addSalesClueUrl,
    'handler': 'addSalesClue',
    'passport': {
        'needLogin': true
    }
}];
