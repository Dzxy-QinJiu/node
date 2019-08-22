/**
 * Created by hzl on 2019/8/2.
 */
// 请求路径
module.exports = {
    module: 'sales_process/server/action/sales-process-controller',
    routes: [{
        'method': 'get', // 获取销售流程
        'path': '/rest/get/sales/process',
        'handler': 'getSalesProcess',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post', // 添加销售流程
        'path': '/rest/add/sales/process',
        'handler': 'addSalesProcess',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'put', // 更新销售流程
        'path': '/rest/update/sales/process',
        'handler': 'updateSalesProcess',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'delete', // 删除销售流程
        'path': '/rest/delete/sales/process/:id',
        'handler': 'deleteSalesProcess',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'get', // 根据销售流程id获取客户阶段
        'path': '/rest/get/sales/process/customer/stage/:id',
        'handler': 'getCustomerStageBySaleProcessId',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post', // 添加客户阶段
        'path': '/rest/add/customer/stage/:id',
        'handler': 'addCustomerStage',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'put', // 编辑客户阶段
        'path': '/rest/edit/customer/stage/:id',
        'handler': 'editCustomerStage',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'delete', // 删除客户阶段
        'path': '/rest/delete/customer/stage/:id',
        'handler': 'deleteCustomerStage',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'put', // 变更客户阶段顺序
        'path': '/rest/change/customer/stage/order',
        'handler': 'changeCustomerStageOrder',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'get', // 获取客户阶段的销售行为
        'path': '/rest/get/customer/stage/sale/behavior',
        'handler': 'getCustomerStageSaleBehavior',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post', // 添加客户阶段的销售行为
        'path': '/rest/add/customer/stage/sale/behavior/:processId/:stageId',
        'handler': 'addCustomerStageSaleBehavior',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'get', // 获取客户阶段的自动变更条件
        'path': '/rest/get/customer/stage/auto/change/conditions',
        'handler': 'getCustomerStageAutoConditions',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post', // 编辑客户阶段的自动变更条件（添加或是更新）
        'path': '/rest/edit/customer/stage/auto/change/conditions/:processId/:stageId',
        'handler': 'editCustomerStageAutoConditions',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'put', // 启/停用自动化条件
        'path': '/rest/change/auto/change/conditions/:processId/:stageId/:status',
        'handler': 'changeAutoConditionsStatus',
        'passport': {
            'needLogin': true
        }
    },]
};
