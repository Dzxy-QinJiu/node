/**
 * Created by wangliping on 2018/3/1.
 */
'use strict';
const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);
const Promise = require('bluebird');
const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');

const salesRoleRestApis = {
    getSalesRoleList: '/rest/base/v1/group/teamroles',
    addSalesRole: '/rest/base/v1/group/teamrole',
    deleteSalesRole: '/rest/base/v1/group/teamrole/:role_id',
    setDefaultRole: '/rest/base/v1/group/teamrole/default/:role_id',
    changeSalesRole: '/rest/base/v1/user/member/teamrole',
    resetSalesRole: '/rest/base/v1/user/member/teamrole/:salesUserId',
    getSalesRoleByMemberId: '/rest/base/v1/user/member/teamrole',
    setSalesRoleGoal: '/rest/base/v1/group/teamrole/customernum',//设置某个角色的客户容量
    setSalesRoleName: '/rest/base/v1/group/teamrole/name' // 修改角色的名称
};

//获取销售角色列表
exports.getSalesRoleList = function(req, res) {
    return restUtil.authRest.get({
        url: salesRoleRestApis.getSalesRoleList,
        req: req,
        res: res
    }, null);
};
//添加销售角色
exports.addSalesRole = function(req, res, role) {
    return restUtil.authRest.post({
        url: salesRoleRestApis.addSalesRole,
        req: req,
        res: res
    }, role);
};
//设置默认角色
exports.setDefaultRole = function(req, res, role_id) {
    return restUtil.authRest.put({
        url: salesRoleRestApis.setDefaultRole.replace(':role_id', role_id),
        req: req,
        res: res
    }, null);
};
//删除销售角色
exports.deleteSalesRole = function(req, res, role_id) {
    return restUtil.authRest.del({
        url: salesRoleRestApis.deleteSalesRole.replace(':role_id', role_id),
        req: req,
        res: res
    }, null);
};

//清空销售角色
exports.resetSalesRole = function(req, res) {
    return restUtil.authRest.del({
        url: salesRoleRestApis.resetSalesRole.replace(':salesUserId', req.params.salesUserId),
        req: req,
        res: res
    }, null);
};
//修改销售的角色
exports.changeSalesRole = function(req, res, obj) {
    return restUtil.authRest.post({
        url: salesRoleRestApis.changeSalesRole,
        req: req,
        res: res
    }, obj);
};
exports.getSalesRoleByMemberId = function(req, res, quryObj) {
    return restUtil.authRest.get({
        url: salesRoleRestApis.getSalesRoleByMemberId,
        req: req,
        res: res
    }, quryObj);
};
//设置某个角色的客户容量
exports.setSalesRoleGoal = function(req, res) {
    return restUtil.authRest.put({
        url: salesRoleRestApis.setSalesRoleGoal,
        req: req,
        res: res
    }, req.body);
};

//设置某个角色的客户容量/名称
function setSalesRole(req, res, obj, url) {
    return new Promise((resolve, reject) => {
        return restUtil.authRest.put({
            url: url,
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

// 编辑职务
exports.editPosition = (req, res) => {
    let emitter = new EventEmitter();
    let reqData = req.body;
    let isEditNum = _.get(reqData, 'isEditNum', false);
    let isEditName = _.get(reqData, 'isEditName', false);
    if (isEditNum && !isEditName) {
        let obj = {id: reqData.id, customer_num: reqData.customer_num};
        let url = salesRoleRestApis.setSalesRoleGoal;
        setSalesRole(req, res, obj, url).then((data) => {
            emitter.emit('success', data);
        }).catch((errorMsg) => {
            emitter.emit('error', errorMsg);
        });
        return emitter;
    } else if (isEditName && !isEditNum) {
        let obj = {id: reqData.id, name: reqData.name};
        let url = salesRoleRestApis.setSalesRoleName;
        setSalesRole(req, res, obj, url).then((data) => {
            emitter.emit('success', data);
        }).catch((errorMsg) => {
            emitter.emit('error', errorMsg);
        });
        return emitter;
    } else if(isEditName && isEditNum){
        let editNameObj = {id: reqData.id, name: reqData.name};
        let nameUrl = salesRoleRestApis.setSalesRoleName;
        let editNumObj = {id: reqData.id, customer_num: reqData.customer_num};
        let numUrl = salesRoleRestApis.setSalesRoleGoal;
        let promiseList = [setSalesRole(req, res, editNameObj, nameUrl), setSalesRole(req, res, editNumObj, numUrl)];
        Promise.all(promiseList).then(data => {
            emitter.emit('success', true);
        }).catch(errorMsg => {
            emitter.emit('error', errorMsg);
        });
        return emitter;
    }
};