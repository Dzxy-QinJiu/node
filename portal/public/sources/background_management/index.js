var RightContent = require('../../../components/privilege/right-content');
var Checker = require('../../../components/privilege/checker');
var userManage = require('../../../modules/user_manage');
var salesStage = require('../../../modules/sales_stage');
var salesTeam = require('../../../modules/sales_team');
var ConfigManage = require('../../../modules/config_manage');
const appOpenManage = require('MOD_DIR/app_open_manage');

function getChildRoutes() {
    var childRoutes = Checker.getChildRoutes('background_management',
        [
            userManage,
            salesStage,
            salesTeam,
            ConfigManage,
            appOpenManage
        ]
    );
    return childRoutes;
}

module.exports = {
    path: '/background_management',
    //在RightContent中用来做跳转,重要
    routesExports: getChildRoutes(),
    routes: getChildRoutes(),
    component: RightContent
};