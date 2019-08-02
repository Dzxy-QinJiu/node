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
    }]
};
