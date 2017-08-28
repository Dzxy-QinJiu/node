/**
 * 不同模块调用的公共方法
 * Created by wangliping on 2017/5/25.
 */
//获取递归遍历计算树形团队内的成员个数
exports.getTeamMemberCount = function (salesTeam) {
    let teamMemberCount = 0;
    if (salesTeam.ownerId) {
        teamMemberCount++;
    }
    if ( _.isArray(salesTeam.managerIds) && salesTeam.managerIds.length > 0) {
        teamMemberCount += salesTeam.managerIds.length;
    }
    if (_.isArray(salesTeam.userIds) && salesTeam.userIds.length > 0) {
        teamMemberCount += salesTeam.userIds.length;
    }
    //递归遍历子团队，加上子团队的人数
    if (_.isArray(salesTeam.children) && salesTeam.children.length > 0) {
        salesTeam.children.forEach(team=> {
            teamMemberCount += this.getTeamMemberCount(team);
        });
    }
    return teamMemberCount;
};