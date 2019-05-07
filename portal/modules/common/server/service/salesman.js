var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
const _ = require('lodash');
var urls = {
    //获取我所在团队及下级团队的人员列表（管理员获取所有团队下的人员列表）
    getMyTeamTreeMemberList: '/rest/base/v1/group/team/members/:type'
};
//获取销售人员列表
exports.getSalesmanList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: '/rest/base/v1/group/childgroupusers',
            req: req,
            res: res
        }, req.query);
};

//获取团队中所有的成员列表
exports.getMyTeamTreeMemberList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: urls.getMyTeamTreeMemberList.replace(':type',req.params.type),
            req: req,
            res: res
        }, null);
};