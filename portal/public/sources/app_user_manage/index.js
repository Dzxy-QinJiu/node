/**
 * Created by zhoulianyi on  2016/3/14 13:14 .
 */
var RightContent = require('../../../components/privilege/right-content');
var Checker = require('../../../components/privilege/checker');
var UserData = require('../../../public/sources/user-data');
var AppUserManage = require('../../../modules/app_user_manage');
var OrganizationManage = require('../../../modules/organization_manage');
var PositionManage = require('../../../modules/position_manage');

function getChildRoutes() {
    var listRoute = AppUserManage('/user/list');
    var logRoute = AppUserManage('/user/log');
    var organizationRoute = OrganizationManage('/user/organization');
    let positionManage = PositionManage('/user/position');

    var childRoutes = Checker.getChildRoutes('user',
        [
            listRoute,
            logRoute,
            organizationRoute,
            positionManage
        ]
    );
    return childRoutes;
}


module.exports = {
    path: '/user',
    //在RightContent中用来做跳转,重要
    routesExports: getChildRoutes(),
    routes: getChildRoutes(),
    component: RightContent
};