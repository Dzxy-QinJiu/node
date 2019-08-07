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
        'path': '/rest/add/customer/stage',
        'handler': 'addCustomerStage',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'put', // 更新客户阶段
        'path': '/rest/update/customer/stage',
        'handler': 'updateCustomerStage',
        'passport': {
            'needLogin': true
        }
    }]
};
