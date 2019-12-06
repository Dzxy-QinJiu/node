/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/9/21.
 */
import production_manager_privilegeConfig from '../../public/privilege-config';
require('../action/production-manage-controller');
module.exports = {
    module: 'production-manage/server/action/production-manage-controller',
    routes: [{
        'method': 'get',
        'path': '/rest/product',
        'handler': 'getProduct',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            production_manager_privilegeConfig.PRODUCTS_MANAGE
        ]
    },{
        'method': 'get',
        'path': '/rest/product/:client_id',
        'handler': 'getProductById',
        'passport': {
            'needLogin': true
        },
        'privileges': [production_manager_privilegeConfig.PRODUCTS_MANAGE]
    },{
        'method': 'post',
        'path': '/rest/product',
        'handler': 'addProduct',
        'passport': {
            'needLogin': true
        },
        'privileges': [production_manager_privilegeConfig.PRODUCTS_MANAGE]
    }, {
        'method': 'delete',
        'path': '/rest/product/:product',
        'handler': 'deleteProduct',
        'passport': {
            'needLogin': true
        },
        'privileges': [production_manager_privilegeConfig.PRODUCTS_MANAGE]
    }, {
        'method': 'put',
        'path': '/rest/product',
        'handler': 'updateProduct',
        'passport': {
            'needLogin': true
        },
        'privileges': [production_manager_privilegeConfig.PRODUCTS_MANAGE]
    }, {
        'method': 'post',
        'path': '/rest/product/uem',
        'handler': 'addUemProduct',
        'passport': {
            'needLogin': true
        },
        'privileges': [production_manager_privilegeConfig.PRODUCTS_MANAGE]
    }, {
        'method': 'get',
        'path': '/rest/product/uem/test',
        'handler': 'testUemProduct',
        'passport': {
            'needLogin': true
        },
        'privileges': [production_manager_privilegeConfig.PRODUCTS_MANAGE]
    }, {//获取oplate\matomo的产品列表
        'method': 'get',
        'path': '/rest/product_list/:integration_type',
        'handler': 'getProductList',
        'passport': {
            'needLogin': true
        },
        'privileges': [production_manager_privilegeConfig.PRODUCTS_MANAGE]
    }, {//集成oplate\matomo产品
        'method': 'post',
        'path': '/rest/product/:integration_type',
        'handler': 'integrateProduct',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }, {//集成配置（matomo\oplate）
        'method': 'post',
        'path': '/rest/integration/config',
        'handler': 'integrationConfig',
        'passport': {
            'needLogin': true
        },
        'privileges': [production_manager_privilegeConfig.PRODUCTS_MANAGE]
    }, {// 获取产品过滤IP
        'method': 'get',
        'path': '/rest/product/get/filter/ip/:product_id',
        'handler': 'productionGetFilterIP',
        'passport': {
            'needLogin': true
        },
        'privileges': [production_manager_privilegeConfig.PRODUCTS_MANAGE]
    }, { // 产品添加过滤IP
        'method': 'post',
        'path': '/rest/product/add/filter/ip',
        'handler': 'productionAddFilterIP',
        'passport': {
            'needLogin': true
        },
        'privileges': [production_manager_privilegeConfig.PRODUCTS_MANAGE]
    }, { // 产品删除过滤IP
        'method': 'delete',
        'path': '/rest/product/delete/filter/ip/:product_id/:ips',
        'handler': 'productionDeleteFilterIP',
        'passport': {
            'needLogin': true
        },
        'privileges': [production_manager_privilegeConfig.PRODUCTS_MANAGE]
    }]
};
