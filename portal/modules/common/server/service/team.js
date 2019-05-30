/**
 * Created by wangliping on 2017/4/13.
 */
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
let _ = require('lodash');

/**
 * 根据团队id获取团队下的成员列表
 *queryObj 过滤参数可以传入的值有
 *{
 *  filter_manager:true（过滤掉舆情秘书）
 *  filter_owner:true(过滤掉主管)
 *  filter_member:true（过滤掉成员）
 * }
 * 需要过滤哪个传哪个，不传代表不过滤
 **/
exports.getSalesTeamMemberList = function(req, res, groupId, queryObj) {
    return restUtil.authRest.get(
        {
            url: '/rest/base/v1/group/member/' + groupId,
            req: req,
            res: res
        }, queryObj, {
            success: function(eventEmitter, data) {
                data = turnToFrontMember(data);
                eventEmitter.emit('success', data);
            }
        });
};

//获取统计团队内成员个数的列表
exports.getTeamMemberCountList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: '/rest/base/v1/group/team/available/statistic',
            req: req,
            res: res
        }, null);
};

//获取销售所在团队及其子团队列表
exports.getSalesTeamList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: '/rest/base/v1/group/myteam',
            req: req,
            res: res
        }, null, {
            success: function(eventEmitter, data) {
                //处理数据
                if (data && data.length > 0) {
                    data = data.map(salesTeam => {
                        return {
                            groupId: salesTeam.group_id,
                            groupName: salesTeam.group_name
                        };
                    });
                }
                eventEmitter.emit('success', data);
            }
        });
};

//获取我能看的团队树列表
exports.getMyteamTreeList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: '/rest/base/v1/group/teams/tree/' + req.query.type,
            req: req,
            res: res
        }, null);
};

//转换为界面上所需的数据格式
function turnToFrontMember(data) {
    let frontMemberList = [];
    if (data && data.length > 0) {
        frontMemberList = data.map(member => {
            return {
                userId: member.user_id,
                nickName: member.nick_name,
                realmId: member.realm_id,
                status: member.status,
                userName: member.user_name,
                userLogo: member.user_logo,
                teamRoleId: member.teamrole_id,
                teamRoleName: member.teamrole_name,
                teamRoleColor: member.teamrole_color,
                phone: _.get(member, 'phone'),
            };
        });
    }
    return frontMemberList;
}
