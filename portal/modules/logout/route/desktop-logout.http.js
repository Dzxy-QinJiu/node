/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

'use strict';

/**
 * 请求路径 - logout
 */

module.exports = {
    module: 'logout/action/desktop-logout-controller',
    routes: [{
        'method': 'get',
        'path': '/logout',
        'handler': 'logout',
        'passport': {
            'needLogin': false
        }
    }]
};