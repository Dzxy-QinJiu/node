/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

'use strict';

/**
 * 请求路径 - login
 */
var UserManageController = require('../action/realm-manage-controller');

module.exports = {
    module: 'realm_manage/server/action/realm-manage-controller',
    routes: [{
        'method': 'get',
        'path': '/rest/realm',
        'handler': 'getCurRealmList',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'REALM_MANAGE_LIST_REALMS'
        ]
    }, {
        'method': 'get',
        'path': '/rest/realm/:realm_id',
        'handler': 'getCurRealmById',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'REALM_MANAGE_LIST_REALMS'
        ]
    }, {
        'method': 'post',
        'path': '/rest/realm',
        'handler': 'addRealm',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'REALM_MANAGE_ADD_REALM'
        ]
    }, {
        'method': 'post',
        'path': '/rest/realm/owner',
        'handler': 'addOwner',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'REALM_MANAGE_ADD_REALM'
        ]
    }, {
        'method': 'put',
        'path': '/rest/realm',
        'handler': 'editRealm',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'REALM_MANAGE_EDIT_REALM'
        ]
    }, {
        'method': 'put',
        'path': '/rest/realm/status',
        'handler': 'updateRealmStatus',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'REALM_MANAGE_EDIT_REALM'
        ]
    }, { // 修改邮箱服务器设置信息
        'method': 'post',
        'path': '/rest/realm/set/email/server/:realm_id',
        'handler': 'setEmailServer',
        'passport': {
            'needLogin': true
        }
    }, { // 修改安全域短信服务器配置信息
        'method': 'post',
        'path': '/rest/realm/set/sms/server/:realm_id',
        'handler': 'setSmsServer',
        'passport': {
            'needLogin': true
        }
    }, { // 修改安全域微信配置信息
        'method': 'post',
        'path': '/rest/realm/set/wechat/:realm_id',
        'handler': 'setWeChat',
        'passport': {
            'needLogin': true
        }
    }]
};