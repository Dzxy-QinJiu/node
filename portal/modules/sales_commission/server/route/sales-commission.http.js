
module.exports = {
    module: 'sales_commission/server/action/sales-commission-controller',
    routes: [{
        'method': 'post',
        'path': '/rest/sales/commission/list/:page_size/:sort_field/:order',
        'handler': 'getSalesCommissionList', // 销售提成列表
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post',
        'path': '/rest/update/sale/commission',
        'handler': 'updateSaleCommission', // 更新销售提成
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'get',
        'path': '/rest/recalculate/sale/commission',
        'handler': 'recalculateSaleCommission', // 重新计算提成
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post',
        'path': '/rest/sale/commission/detail/:page_size/:sort_field/:order/:user_id',
        'handler': 'getSaleCommissionDetail', // 销售提成明细
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post',
        'path': '/rest/contract/detail/:num',
        'handler': 'getContractDetail', // 合同详情
        'passport': {
            'needLogin': true
        }
    }]
};