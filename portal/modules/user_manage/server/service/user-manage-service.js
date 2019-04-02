/**
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 * Created by liwenjun on 2016/2/1.
 */

'use strict';
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var User = require('../dto/user');
var _ = require('lodash');
var auth = require('../../../../lib/utils/auth');

var userRestApis = {
    //添加用户地址
    addUser: '/rest/base/v1/user',
    //修改用户地址
    modifyUser: '/rest/base/v1/user/member/info',
    //启/停用地址
    updateUserStatus: '/rest/base/v1/user',
    //获取用户列表地址
    getUsers: '/rest/base/v1/user',
    //通过用户id获取用户信息
    getUserById: '/rest/base/v1/user/id',
    //获取用户的操作日志
    getUserLog: '/rest/analysis/auditlog/v1/all',
    //获取角色列表
    getRoleList: '/rest/base/v1/application/role',
    //成员属性唯一性验证的url
    checkOnlyUser: '/rest/base/v1/user/member/:key/:value/unique',
    //修改成员的所属团队
    updateUserTeam: '/rest/base/v1/group/user',
    //修改成员角色
    updateUserRoles: '/rest/base/v1/user/member/roles',
    //查询及添加个人销售目标
    getAndSetSalesGoals: '/rest/contract/v2/goal/users'
};

exports.urls = userRestApis;

//获取用户
exports.getUsers = function(req, res, condition, isGetAllUser) {
    return restUtil.authRest.get(
        {
            url: userRestApis.getUsers,
            req: req,
            res: res
        }, condition, {
            success: function(eventEmitter, data) {
                //处理数据
                var userListObj = data;
                var curUserList = userListObj.data ? userListObj.data : [];
                for (var i = 0, len = curUserList.length; i < len; i++) {
                    if (isGetAllUser) {
                        //获取所有成员列表时，只返回userId、nickName和userName即可
                        curUserList[i] = {
                            userId: curUserList[i].user_id,
                            nickName: curUserList[i].nick_name,
                            userName: curUserList[i].user_name,
                            status: curUserList[i].status
                        };
                    } else {
                        curUserList[i] = User.toFrontObject(curUserList[i]);
                    }
                }
                userListObj.data = curUserList;
                eventEmitter.emit('success', userListObj);
            }
        });
};

//通过用户id获取用户详细信息
exports.getCurUserById = function(req, res, userId) {
    return restUtil.authRest.get(
        {
            url: userRestApis.getUserById + '/' + userId,
            req: req,
            res: res
        }, null, {
            success: function(eventEmitter, data) {
                //处理数据
                if (data) {
                    data = User.toFrontObject(data);
                }
                eventEmitter.emit('success', data);
            }
        });
};


//添加用户
exports.addUser = function(req, res, frontUser) {
    var addUser = User.toRestObject(frontUser);
    addUser.realm_id = auth.getUser(req).auth.realm_id;
    return restUtil.authRest.post(
        {
            url: userRestApis.addUser,
            req: req,
            res: res
        },
        addUser,
        {
            success: function(eventEmitter, data) {
                //处理数据
                if (_.isObject(data)) {
                    frontUser.id = data.user_id;
                    if (_.isArray(data.roles) && data.roles.length) {
                        frontUser.roleIds = _.map(data.roles, 'role_id');
                    } else {
                        frontUser.roleIds = [];
                    }
                    frontUser.teamId = data.team_id;
                    frontUser.status = data.status;
                }
                eventEmitter.emit('success', frontUser);
            }
        });
};

//修改用户
exports.editUser = function(req, res, user) {
    return restUtil.authRest.put(
        {
            url: userRestApis.modifyUser,
            req: req,
            res: res
        }, user);
};

//修改用户所属团队
exports.updateUserTeam = function(req, res, params) {
    return restUtil.authRest.put(
        {
            url: userRestApis.updateUserTeam + '/' + params.user_id + '/' + params.group_id,
            req: req,
            res: res
        }, null);
};
//修改成员角色
exports.updateUserRoles = function(req, res, user) {
    return restUtil.authRest.put(
        {
            url: userRestApis.updateUserRoles,
            req: req,
            res: res
        }, user);
};
//启停用户
exports.updateUserStatus = function(req, res, frontUser) {
    var flag = +frontUser.status === 0 ? 'disable' : 'enable';//成员的启停
    return restUtil.authRest.put(
        {
            url: userRestApis.updateUserStatus + '/' + frontUser.id + '/status/' + flag,
            req: req,
            res: res
        }, null);
};

//获取用户日志
exports.getUserLog = function(req, res, condition) {
    return restUtil.authRest.get(
        {
            url: userRestApis.getUserLog + '/' + condition.user_name + '/' + condition.page_size + '/' + condition.num,
            req: req,
            res: res
        },
        null, {
            success: function(eventEmitter, data) {
                //处理数据
                if (data && data.list) {
                    data.list = data.list.map(function(log) {
                        return {
                            logTime: log.timestamp,
                            logInfo: log.operate
                        };
                    });
                }
                eventEmitter.emit('success', data);
            }
        }
    );
};


//获取角色列表
exports.getRoleList = function(req, res, clientId) {
    return restUtil.authRest.get(
        {
            url: userRestApis.getRoleList + '/' + clientId,
            req: req,
            res: res
        },
        null, {
            success: function(eventEmitter, data) {
                //处理数据
                if (data) {
                    data = data.map(function(role) {
                        return {
                            roleId: role.role_id,
                            roleName: role.role_name
                        };
                    });
                }
                eventEmitter.emit('success', data);
            }
        }
    );
};

//昵称（对应的是姓名）唯一性验证
exports.checkOnlyNickName = function(req, res, nickName) {
    return restUtil.authRest.get(
        {
            url: userRestApis.checkOnlyUser.replace(':key', 'nickname').replace(':value', nickName),
            req: req,
            res: res
        }, null);
};

//用户名唯一性验证
exports.checkOnlyUserName = function(req, res, username) {
    return restUtil.authRest.get(
        {
            url: userRestApis.checkOnlyUser.replace(':key', 'username').replace(':value', username),
            req: req,
            res: res
        }, null);
};

//电话唯一性验证
exports.checkOnlyPhone = function(req, res, phone) {
    return restUtil.authRest.get(
        {
            url: userRestApis.checkOnlyUser.replace(':key', 'phone').replace(':value', phone),
            req: req,
            res: res
        }, null);
};

//邮箱唯一性验证
exports.checkOnlyEmail = function(req, res, email) {
    return restUtil.authRest.get(
        {
            url: userRestApis.checkOnlyUser.replace(':key', 'email').replace(':value', email),
            req: req,
            res: res
        }, null);
};
//查询销售目标和提成比例
exports.getSalesGoals = function(req, res) {
    return restUtil.authRest.get(
        {
            url: userRestApis.getAndSetSalesGoals,
            req: req,
            res: res
        }, req.query);
};
//设置销售目标或提成比例
exports.setSalesGoals = function(req, res) {
    return restUtil.authRest.post(
        {
            url: userRestApis.getAndSetSalesGoals,
            req: req,
            res: res
        }, req.body);
};



