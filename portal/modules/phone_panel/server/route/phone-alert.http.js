/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/12.
 */
'use strict';
module.exports = {
    module: 'phone_panel/server/action/phone-alert-controller',
    routes: [{
        // 增加产品反馈
        'method': 'post',
        'path': '/rest/base/add/appfeedback',
        'handler': 'addAppFeedback',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'CREATE_CUSTOMER_APP_FEEDBACK'
        ]
    }]
};