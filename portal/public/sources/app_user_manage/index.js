/**
 * Created by zhoulianyi on  2016/3/14 13:14 .
 */
var RightContent = require("../../../components/privilege/right-content");
var Checker = require("../../../components/privilege/checker");
var UserData = require("../../../public/sources/user-data");
var AppUserManage = require("../../../modules/app_user_manage");
var OrganizationManage = require("../../../modules/organization_manage");
import PositionManage from '../../../modules/position_manage';

function getChildRoutes() {
    var listRoute = AppUserManage('list');
    var logRoute = AppUserManage('log');
    var organizationRoute = OrganizationManage('organization');
    let positionManage = PositionManage('position');
    
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
    path: 'user',
    //在RightContent中用来做跳转,重要
    routesExports: getChildRoutes(),
    getChildRoutes: function(location, cb) {
        var childRoutes = getChildRoutes();
        cb(null, childRoutes);
    },
    component: RightContent
};
