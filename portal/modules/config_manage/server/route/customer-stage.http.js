/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/9/20.
 */
require('../action/customer-stage-controller');
module.exports = {
    module: 'config_manage/server/action/customer-stage-controller',
    routes: [{
        'method': 'get',
        'path': '/rest/customer_stage',
        'handler': 'getCustomerStage',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'CRM_CUSTOMER_CONF_LABEL'
        ]
    }, {
        'method': 'post',
        'path': '/rest/customer_stage',
        'handler': 'addCustomerStage',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'CRM_CUSTOMER_CONF_LABEL'
        ]
    }, {
        'method': 'delete',
        'path': '/rest/customer_stage/:product',
        'handler': 'deleteCustomerStage',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'CRM_CUSTOMER_CONF_LABEL'
        ]
    }
    ]
};