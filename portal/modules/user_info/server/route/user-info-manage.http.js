/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

'use strict';

import privilegeConst_user_info from '../../public/privilege-config';

/**
 * 请求路径 - login
 */

module.exports = {
    module: 'user_info/server/action/user-info-manage-controller',
    routes: [{
        'method': 'get',
        'path': '/rest/user_info',
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
        },
        'privileges': []
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
        },
        'privileges': [privilegeConst_user_info.CURTAO_USER_CONFIG]
    }, {
        'method': 'put',
        'path': '/rest/user_info_pwd',
        'handler': 'editUserInfoPwd',
        'passport': {
            'needLogin': true
        },
        'privileges': [privilegeConst_user_info.USER_INFO_UPDATE]
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
            privilegeConst_user_info.BASE_QUERY_PERMISSION_ORGANIZATION
        ]
    },{
        'method': 'post',
        'path': '/rest/info_email/subscribe',
        'handler': 'setSubscribeEmail',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            privilegeConst_user_info.CURTAO_USER_CONFIG
        ]
    },{
        'method': 'get',
        'path': '/rest/phone_code',
        'handler': 'getUserInfoPhoneCode',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            privilegeConst_user_info.USER_INFO_UPDATE
        ]
    },{
        'method': 'put',
        'path': '/rest/bind/phone',
        'handler': 'bindUserInfoPhone',
        'passport': {
            'needLogin': true
        },
        privileges: [privilegeConst_user_info.USER_INFO_UPDATE]
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