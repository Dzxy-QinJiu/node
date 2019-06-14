
module.exports = {
    module: 'competing_product/server/action/competing-product-controller',
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
