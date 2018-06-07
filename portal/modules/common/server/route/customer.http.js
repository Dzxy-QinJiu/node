module.exports = {
    module: 'common/server/action/customer',
    routes: [{
        //获取客户联想列表
        'method': 'get',
        'path': '/rest/global/customer_suggest',
        'handler': 'getCustomerSuggest',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }]
};