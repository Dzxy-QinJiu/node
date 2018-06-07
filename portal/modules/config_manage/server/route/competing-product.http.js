/**
 * Created by wangliping on 2018/1/8.
 */
require('../action/competing-product-controller');
module.exports = {
    module: 'config_manage/server/action/competing-product-controller',
    routes: [{
        'method': 'get',
        'path': '/rest/competing_product',
        'handler': 'getCompetingProduct',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'CRM_COMPETING_PRODUCT'
        ]
    },{
        'method': 'post',
        'path': '/rest/competing_product',
        'handler': 'addCompetingProduct',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'CRM_COMPETING_PRODUCT'
        ]
    },{
        'method': 'delete',
        'path': '/rest/competing_product/:product',
        'handler': 'deleteCompetingProduct',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'CRM_COMPETING_PRODUCT'
        ]
    }
    ]
};