/**
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 * Created by liwenjun on 2016/4/5.
 */

var CommonUtil = require('./common-utils');
var UserDto = {
    //转换成session格式的数据
    toSessionData: function(req, userData) {
        if (userData && ('object' === (typeof userData))) {
            var sessionData = {};
            sessionData['_USER_TOKEN_'] = {
                'access_token': userData.auth ? userData.auth.access_token : null,
                'realm_id': userData.auth ? userData.auth.realm_id : null,
                'client_id': userData.auth ? userData.auth.client_id : null,
                'refresh_token': userData.auth ? userData.auth.refresh_token : null
            };
            //重新组织用户信息
            sessionData.user = {
                'userid': userData.user_id,
                'username': userData.user_name,
                'nickname': userData.nick_name,
                'privileges': userData.privileges,
                'email': userData.email ? userData.email : '',
                'phone': userData.phone ? userData.phone : '',
                'role_infos': userData.role_infos,
                'roles': userData.roles,
                'organization': userData.organization
            };
            //获取客户端信息
            sessionData.clientInfo = {
                ip: CommonUtil.ip.getClientIp(req),
                UserAgent: req.headers['user-agent'],
                resolution: req.cookies && req.cookies['resolution'] ? req.cookies['resolution'] : '',
                loginTime: Date.now(),
                clientId: userData.auth ? userData.auth.client_id : null
            };
            return sessionData;
        }
        else {
            return null;
        }
    },
    //转换成user对象数据
    turnSessionDataToUser: function(sessionData) {
        if (sessionData && ('object' === (typeof sessionData))) {
            var user = {};
            user.auth = {
                'realm_id': sessionData['_USER_TOKEN_'] ? sessionData['_USER_TOKEN_'].realm_id : null,
                'client_id': sessionData['_USER_TOKEN_'] ? sessionData['_USER_TOKEN_'].client_id : null,
                'access_token': sessionData['_USER_TOKEN_'] ? sessionData['_USER_TOKEN_'].access_token : null,
                'refresh_token': sessionData['_USER_TOKEN_'] ? sessionData['_USER_TOKEN_'].refresh_token : null
            };
            user.user_id = sessionData.user ? sessionData.user.userid : '';
            user.nick_name = sessionData.user ? sessionData.user.nickname : '';
            user.user_name = sessionData.user ? sessionData.user.username : '';
            user.privileges = sessionData.user ? sessionData.user.privileges : [];
            user.role_infos = sessionData.user ? sessionData.user.role_infos : [];
            user.organization = sessionData.user ? sessionData.user.organization : {};
            return user;
        } else {
            return null;
        }
    }
};
module.exports = UserDto;