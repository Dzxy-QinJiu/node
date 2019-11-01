/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

'use strict';

/**
 * 请求路径 - login
 */

module.exports = {
    module: 'user_info/server/action/user-info-manage-controller',
    routes: [{
        'method': 'get',
        'path': '/rest/user_info/:user_id',
        'handler': 'getUserInfo',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'get',
        'path': '/rest/log_list',
        'handler': 'getLogList',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post',
        'path': '/rest/user_email/active',
        'handler': 'activeUserEmail',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'put',
        'path': '/rest/user_info',
        'handler': 'editUserInfo',
        'passport': {
            'needLogin': true
        }
    },{
        'method': 'post',
        'path': '/rest/user_lang',
        'handler': 'setUserLanguage',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'put',
        'path': '/rest/user_info_pwd',
        'handler': 'editUserInfoPwd',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'get',
        'path': '/rest/user_info_pwd',
        'handler': 'checkUserInfoPwd',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'get',
        'path': '/rest/get_managed_realm',
        'handler': 'getManagedRealm',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'GET_MANAGED_REALM', 'GET_MEMBER_SELF_INFO'
        ]
    },{
        'method': 'post',
        'path': '/rest/info_email/subscribe',
        'handler': 'setSubscribeEmail',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'MEMBER_APPLY_EMAIL_REJECTION'
        ]
    },{
        'method': 'get',
        'path': '/rest/phone_code',
        'handler': 'getUserInfoPhoneCode',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'USER_PHONE_BINDING'
        ]
    },{
        'method': 'put',
        'path': '/rest/bind/phone',
        'handler': 'bindUserInfoPhone',
        'passport': {
            'needLogin': true
        }
    }, {
        // 获取用户交易记录
        'method': 'get',
        'path': '/rest/get/user/trade/record',
        'handler': 'getUserTradeRecord',
        'passport': {
            'needLogin': true
        }
    }]
};