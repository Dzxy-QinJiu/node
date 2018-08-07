
module.exports = {
    module: 'commission_payment/server/action/commission-payment-controller',
    routes: [{
        'method': 'post',
        'path': '/rest/commission/payment/list/:page_size/:sort_field/:order',
        'handler': 'getCommissionPaymentList', // 提成发放列表
        'passport': {
            'needLogin': true
        }
    }]
};