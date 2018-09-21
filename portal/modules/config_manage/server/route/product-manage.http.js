/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/9/21.
 */
require('../action/product-manage-controller');
module.exports = {
    module: 'config_manage/server/action/product-manage-controller',
    routes: [{
        'method': 'get',
        'path': '/rest/product',
        'handler': 'getProduct',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'PRODUCTS_MANAGE','GET_PRODUCTS_LIST'
        ]
    },{
        'method': 'post',
        'path': '/rest/product',
        'handler': 'addProduct',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'PRODUCTS_MANAGE'
        ]
    },{
        'method': 'delete',
        'path': '/rest/product/:product',
        'handler': 'deleteProduct',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'PRODUCTS_MANAGE'
        ]
    }
    ]
};