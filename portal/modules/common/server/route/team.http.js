/**
 * Created by wangliping on 2017/4/13.
 */

"use strict";

module.exports = {
    module: "common/server/action/team",
    routes: [{
        "method": "get",
        "path": "/rest/sales_team_member_list/:group_id",
        "handler": "getSalesTeamMemberList",
        "passport": {
            "needLogin": true
        }
    }, {
        "method": "get",
        "path": "/rest/team/sales_team_list",
        "handler": "getSalesTeamList",
        "passport": {
            "needLogin": true
        },
        "privileges": []
    }]
};
