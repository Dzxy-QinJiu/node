'use strict';
const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);
const Member = require('../dto/member');
const _ = require('lodash');
const auth = require('../../../../lib/utils/auth');
const Promise = require('bluebird');
const EventEmitter = require('events').EventEmitter;

const memberRestApis = {
    //获取用户列表地址
    getUsers: '/rest/base/v1/user',
    //添加用户地址
    addUser: '/rest/base/v1/user',
    //修改用户地址
    modifyUser: '/rest/base/v1/user/member/info',
    //启/停用地址
    updateUserStatus: '/rest/base/v1/user',
    //通过用户id获取用户信息
    getUserById: '/rest/base/v1/user/id',
    //获取用户的操作日志
    getUserLog: '/rest/analysis/auditlog/v1/all',
    //获取角色列表
    getRoleList: '/rest/base/v1/application/roles',
    //成员属性唯一性验证的url
    checkOnlyUser: '/rest/base/v1/user/member/:key/:value/unique',
    //修改成员的所属团队
    updateUserTeam: '/rest/base/v1/group/user',
    // 清空成员的部门
    clearMemberDepartment: '/rest/base/v1/group/user/:user_id',
    //修改成员角色
    updateUserRoles: '/rest/base/v1/user/member/roles',
    //查询及添加个人销售目标
    getAndSetSalesGoals: '/rest/contract/v2/goal/users',
    // 获取成员的职务
    getMemberPosition: '/rest/base/v1/user/member/teamrole',
    // 成员分配职务
    setMemberPosition: '/rest/base/v1/user/member/teamrole',
    // 获取成员变动记录
    getMemberChangeRecord: '/rest/base/v1/user/member/timeline',
    // 获取成员的组织信息
    getMemberOrganization: '/rest/base/v1/user/member/organization'
};

exports.urls = memberRestApis;


// 获取成员的组织信息
exports.getMemberOrganization = (req, res) => {
    return restUtil.authRest.get(
        {
            url: memberRestApis.getMemberOrganization,
            req: req,
            res: res
        }, null);
};

function getUserLists(req, res, condition, isGetAllUser, teamrole_id) {
    let url = memberRestApis.getUsers + '?with_extentions=' + true;
    if (teamrole_id) {
        url += '&teamrole_id=' + teamrole_id;
    }
    return new Promise( (resolve, reject) => {
        return restUtil.authRest.get(
            {
                url: url,
                req: req,
                res: res
            }, condition, {
                success: (eventEmitter, data) => {
                    //处理数据
                    let memberListObj = _.clone(data);
                    let curMemberList = _.get(memberListObj, 'data', []);
                    _.forEach(curMemberList,(item,i) => {
                        if (isGetAllUser) {
                            //获取所有成员列表时，只返回userId、nickName和userName即可
                            curMemberList[i] = {
                                userId: curMemberList[i].user_id,
                                nickName: curMemberList[i].nick_name,
                                userName: curMemberList[i].user_name,
                                status: curMemberList[i].status
                            };
                        } else {
                            curMemberList[i] = {
                                id: curMemberList[i].user_id, // 成员id
                                name: curMemberList[i].nick_name, // 昵称
                                userName: curMemberList[i].user_name, // 账号
                                status: curMemberList[i].status, // 状态
                                positionName: curMemberList[i].teamrole_name, // 职务
                                teamName: curMemberList[i].team_name,
                                phone: curMemberList[i].phone // 手机
                            };
                        }
                    });
                    memberListObj.data = curMemberList;
                    resolve(memberListObj);
                },
                error: (eventEmitter, errorDesc) => {
                    reject(errorDesc.message);
                }
            });
    });
}

// 获取成员列表
exports.getMemberList = (req, res, condition, isGetAllUser, teamrole_id) => {
    var emitter = new EventEmitter();
    Promise.all([getUserLists(req, res, condition, isGetAllUser, teamrole_id)]).then( (result) => {
        emitter.emit('success', result[0]);
    }, (errorMsg) => {
        emitter.emit('error', errorMsg);
    });
    return emitter;
};

//根据不同的角色获取不同的用户列表
exports.getMemberListByRoles = (req, res, condition, isGetAllUser, teamrole_id) => {
    var emitter = new EventEmitter();
    //根据不同角色获取不同的列表
    var rolesType = _.get(condition,'role_id',[]);
    var promiseLists = [];
    _.forEach(rolesType, roleItem => {
        condition.role_id = roleItem;
        promiseLists.push(getUserLists(req, res, condition, isGetAllUser, teamrole_id));
    });
    Promise.all(promiseLists).then( (result) => {
        var lists = [];
        _.forEach(result, item => {
            lists = _.concat(lists, _.get(item, 'data'));
        });
        _.uniqBy(lists, 'userId');
        emitter.emit('success', lists);
    }, (errorMsg) => {
        emitter.emit('error', errorMsg);
    });
    return emitter;
};

// 获取成员的职务
function getMemberPosition(req, res, memberId) {
    return new Promise((resolve, reject) => {
        return restUtil.authRest.get({
            url: memberRestApis.getMemberPosition + '?member_id=' + memberId,
            req: req,
            res: res
        }, null, {
            success: (emitter, data) => {
                resolve(data);
            },
            error: (eventEmitter, errorDesc) => {
                reject(errorDesc);
            }
        });
    });
}

// 获取成员详细信息
function getMemberDetail(req, res, memberId) {
    return new Promise((resolve, reject) => {
        return restUtil.authRest.get({
            url: memberRestApis.getUserById + '/' + memberId,
            req: req,
            res: res
        }, null, {
            success: (emitter, data) => {
                resolve(data);
            },
            error: (eventEmitter, errorDesc) => {
                reject(errorDesc);
            }
        });
    });
}

// 通过用户id获取用户详细信息
exports.getCurUserById = function(req, res, memberId) {
    let emitter = new EventEmitter();
    let promiseList = [getMemberPosition(req, res, memberId), getMemberDetail(req, res, memberId)];
    Promise.all(promiseList).then(data => {
        let positionObj = _.get(data, '[0]');
        let detailObj = _.get(data, '[1]');
        if (positionObj) {
            detailObj = {...detailObj,
                teamrole_name: _.get(positionObj, 'teamrole_name'),
                teamrole_id: _.get(positionObj, 'teamrole_id')
            };
        }
        if (detailObj) {
            detailObj = Member.toFrontObject(detailObj);
        }
        emitter.emit('success', detailObj);
    }).catch(errorMsg => {
        emitter.emit('error', errorMsg);
    });
    return emitter;
};

// 添加成员
function addMember(req, res, obj) {
    return new Promise((resolve, reject) => {
        return restUtil.authRest.post({
            url: memberRestApis.addUser,
            req: req,
            res: res
        }, obj, {
            success: (emitter, data) => {
                resolve(data);
            },
            error: (eventEmitter, errorDesc) => {
                reject(errorDesc);
            }
        });
    });
}

// 给成员分配职务
function setMemberPosition(req, res, obj) {
    return new Promise((resolve, reject) => {
        return restUtil.authRest.post({
            url: memberRestApis.setMemberPosition,
            req: req,
            res: res
        }, obj, {
            success: (emitter, data) => {
                resolve(data);
            },
            error: (eventEmitter, errorDesc) => {
                reject(errorDesc);
            }
        });
    });
}

//添加用户
exports.addUser = function(req, res, frontUser) {
    let emitter = new EventEmitter();
    let addUser = Member.toRestObject(frontUser);
    addUser.realm_id = auth.getUser(req).auth.realm_id;

    addMember(req, res, addUser).then((data) => {
        if (_.isObject(data)) {
            let obj = {
                member_id: _.get(data, 'user_id'),
                teamrole_id: _.get(frontUser, 'position')
            };
            frontUser.id = data.user_id;
            if (_.isArray(data.roles) && data.roles.length) {
                frontUser.roleIds = _.map(data.roles, 'role_id');
            } else {
                frontUser.roleIds = [];
            }
            frontUser.teamId = data.team_id;
            frontUser.status = data.status;
            setMemberPosition(req, res, obj).then( (positionData) => {
                frontUser.positionName = _.get(positionData, 'teamrole_name');
                frontUser.positionId = _.get(positionData, 'teamrole_id');
                eventEmitter.emit('success', frontUser);
            } ).catch( () => {
                emitter.emit('success', frontUser);
            });
        }
    }).catch((errorObj) => {
        emitter.emit('error', errorObj);
    });
    return emitter;
};

//修改用户
exports.editUser = function(req, res, user) {
    return restUtil.authRest.put(
        {
            url: memberRestApis.modifyUser,
            req: req,
            res: res
        }, user);
};

//修改用户所属团队
exports.updateUserTeam = function(req, res, params) {
    return restUtil.authRest.put(
        {
            url: memberRestApis.updateUserTeam + '/' + params.user_id + '/' + params.group_id,
            req: req,
            res: res
        }, null);
};

// 清空成员的部门
exports.clearMemberDepartment = (req, res) => {
    return restUtil.authRest.del({
        url: memberRestApis.clearMemberDepartment.replace(':user_id', req.params.memberId),
        req: req,
        res: res
    }, null);
};


//修改成员角色
exports.updateUserRoles = function(req, res, user) {
    return restUtil.authRest.put(
        {
            url: memberRestApis.updateUserRoles,
            req: req,
            res: res
        }, user);
};
//启停用户
exports.updateUserStatus = function(req, res, frontUser) {
    let flag = +frontUser.status === 0 ? 'disable' : 'enable';//成员的启停
    return restUtil.authRest.put(
        {
            url: memberRestApis.updateUserStatus + '/' + frontUser.id + '/status/' + flag,
            req: req,
            res: res
        }, null);
};

//获取用户日志
exports.getUserLog = function(req, res, condition) {
    return restUtil.authRest.get(
        {
            url: memberRestApis.getUserLog + '/' + condition.user_name + '/' + condition.page_size + '/' + condition.num,
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
exports.getRoleList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: memberRestApis.getRoleList,
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
exports.checkOnlyNickName = (req, res, nickName) => {
    return restUtil.authRest.get(
        {
            url: memberRestApis.checkOnlyUser.replace(':key', 'nickname').replace(':value', nickName),
            req: req,
            res: res
        }, null);
};

//用户名唯一性验证
exports.checkOnlyUserName = function(req, res, username) {
    return restUtil.authRest.get(
        {
            url: memberRestApis.checkOnlyUser.replace(':key', 'username').replace(':value', username),
            req: req,
            res: res
        }, null);
};

//电话唯一性验证
exports.checkOnlyPhone = function(req, res, phone) {
    return restUtil.authRest.get(
        {
            url: memberRestApis.checkOnlyUser.replace(':key', 'phone').replace(':value', phone),
            req: req,
            res: res
        }, null);
};

//邮箱唯一性验证
exports.checkOnlyEmail = function(req, res, email) {
    return restUtil.authRest.get(
        {
            url: memberRestApis.checkOnlyUser.replace(':key', 'email').replace(':value', email),
            req: req,
            res: res
        }, null);
};
//查询销售目标和提成比例
exports.getSalesGoals = function(req, res) {
    return restUtil.authRest.get(
        {
            url: memberRestApis.getAndSetSalesGoals,
            req: req,
            res: res
        }, req.query);
};
//设置销售目标或提成比例
exports.setSalesGoals = function(req, res) {
    return restUtil.authRest.post(
        {
            url: memberRestApis.getAndSetSalesGoals,
            req: req,
            res: res
        }, req.body);
};

// 获取成员变动记录
exports.getMemberChangeRecord = (req, res) => {
    return restUtil.authRest.get(
        {
            url: memberRestApis.getMemberChangeRecord,
            req: req,
            res: res
        }, req.query);
};
