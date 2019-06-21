/**
 * Created by xiaojinfeng on 2016/04/08.
 */
'use strict';
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var salesTeamRestApis = {
    filterSalesTeamList: '/rest/base/v1/group',
    getMemberList: '/rest/base/v1/group/nonmember',
    addMember: '/rest/base/v1/group/members',
    deleteMember: '/rest/base/v1/group/users',
    editOwner: '/rest/base/v1/group/owner/exchange',
    editManager: '/rest/base/v1/group/manager/exchange',
    editUser: '/rest/base/v1/group/user/exchange',
    deleteGroup: '/rest/base/v1/group',
    editGroup: '/rest/base/v1/group',
    addGroup: '/rest/base/v1/group',
    getSalesGoals: '/rest/contract/v2/goal',
    saveSalesGoals: '/rest/contract/v2/goal'
};
exports.urls = salesTeamRestApis;

exports.getSalesGoals = function(req, res, team_id) {
    return restUtil.authRest.get(
        {
            url: salesTeamRestApis.getSalesGoals,
            req: req,
            res: res
        }, {sales_team_id: team_id});
};
exports.saveSalesGoals = function(req, res, salesGoals) {
    return restUtil.authRest.post(
        {
            url: salesTeamRestApis.saveSalesGoals,
            req: req,
            res: res
        }, salesGoals);
};
exports.filterSalesTeamList = function(req, res, userName) {
    return restUtil.authRest.get(
        {
            url: salesTeamRestApis.filterSalesTeamList + '/' + userName + '/username',
            req: req,
            res: res
        });
};
//转换为界面上所需的数据格式
function turnToFrontMember(data) {
    let frontMemberList = [];
    if (data && data.length > 0) {
        data.forEach(function(member) {
            if (member) {
                frontMemberList.push({
                    userId: member.user_id,
                    nickName: member.nick_name,
                    realmId: member.realm_id,
                    status: member.status,
                    userName: member.user_name,
                    userLogo: member.user_logo,
                    phone: member.phone
                });
            }
        });
    }
    return frontMemberList;
}
exports.getMemberList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: salesTeamRestApis.getMemberList,
            req: req,
            res: res
        },
        null,
        {
            success: function(eventEmitter, data) {
                data = turnToFrontMember(data);
                eventEmitter.emit('success', data);
            }
        });
};
exports.addMember = function(req, res, obj) {
    return restUtil.authRest.post(
        {
            url: salesTeamRestApis.addMember,
            req: req,
            res: res
        },
        obj);
};

exports.editMember = function(req, res, obj) {
    let editObj = {
        group_id: obj.group_id,
        operate: obj.operate
    };
    let url = '';
    if (obj.type === 'owner') {
        url = salesTeamRestApis.editOwner;
        editObj.owner_id = obj.owner_id;
    } else if (obj.type === 'manager') {
        url = salesTeamRestApis.editManager;
        editObj.user_ids = JSON.parse(obj.user_ids);
    } else if (obj.type === 'user') {
        url = salesTeamRestApis.editUser;
        editObj.user_ids = JSON.parse(obj.user_ids);
    }
    return restUtil.authRest.put(
        {
            url: url,
            req: req,
            res: res
        }, editObj);
};

exports.deleteGroup = function(req, res, groupId) {
    return restUtil.authRest.del(
        {
            url: salesTeamRestApis.deleteGroup + '/' + groupId,
            req: req,
            res: res
        });
};

exports.editGroup = function(req, res, salesTeam) {
    return restUtil.authRest.put(
        {
            url: salesTeamRestApis.editGroup,
            req: req,
            res: res
        },
        salesTeam);
};

exports.addGroup = function(req, res, salesTeam) {
    return restUtil.authRest.post(
        {
            url: salesTeamRestApis.addGroup,
            req: req,
            res: res
        },
        salesTeam);
};


