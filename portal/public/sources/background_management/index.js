const RightContent = require('../../../components/privilege/right-content');
const Checker = require('../../../components/privilege/checker');
const userManage = require('../../../modules/user_manage');
const salesStage = require('../../../modules/sales_stage');
const salesTeam = require('../../../modules/sales_team');
const configManage = require('../../../modules/config_manage');
const appOpenManage = require('MOD_DIR/app_open_manage');
const productionManage = require('MOD_DIR/production-manage');

function getChildRoutes() {
    var childRoutes = Checker.getChildRoutes('background_management',
        [
            userManage,
            salesStage,
            salesTeam,
            configManage,
            appOpenManage,
            productionManage
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