var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
const _ = require('lodash');
var urls = {
    //获取团队中所有的成员列表
    getTeamAllMembersLists: '/rest/base/v1/group/team/members/:type'
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
exports.getTeamAllMembersLists = function(req, res) {
    return restUtil.authRest.get(
        {
            url: urls.getTeamAllMembersLists.replace(':type',req.params.type),
            req: req,
            res: res
        }, null,{
            success: (emitter, data) => {
                //是否需要过滤掉禁用的成员
                if (_.get(req, 'query.filter_disabled') === 'true'){
                    data = _.filter(data, item => item.status === 1);
                }
                emitter.emit('success', data);
            }
        });
};