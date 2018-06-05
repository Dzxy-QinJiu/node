var RightContent = require('../../../components/privilege/right-content');
var Checker = require('../../../components/privilege/checker');
var role = require('../../../modules/rolePrivilege_role');
var authority = require('../../../modules/rolePrivilege_authority');
var userManage = require('../../../modules/user_manage');
var salesStage = require('../../../modules/sales_stage');
var salesTeam = require('../../../modules/sales_team');
var ConfigManage = require('../../../modules/config_manage');

function getChildRoutes() {
    var childRoutes = Checker.getChildRoutes('background_management',
        [
            role,
            authority,
            userManage,
            salesStage,
            salesTeam,
            ConfigManage
        ]
    );
    return childRoutes;
}


module.exports = {
    path: 'background_management',
    //在RightContent中用来做跳转,重要
    routesExports: getChildRoutes(),
    getChildRoutes: function(location, cb) {

        var childRoutes = getChildRoutes();
        cb(null, childRoutes);
    },
    component: RightContent
};