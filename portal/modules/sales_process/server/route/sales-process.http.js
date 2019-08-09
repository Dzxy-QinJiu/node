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
        'path': '/rest/change/customer/stage/order/:id',
        'handler': 'changeCustomerStageOrder',
        'passport': {
            'needLogin': true
        }
    }]
};
