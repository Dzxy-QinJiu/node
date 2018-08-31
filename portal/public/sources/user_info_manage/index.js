/**
 * Created by xiaojinfeng on  2016/1/14 9:19 .
 */

require('./index.less');
var RightContent = require('../../../components/privilege/right-content');
var Checker = require('../../../components/privilege/checker');
var userInfo = require('../../../modules/user_info');
var userPwd = require('../../../modules/user_password');

function getChildRoutes() {
    var childRoutes = Checker.getChildRoutes('user_info_manage',
        [
            userInfo,
            userPwd
        ]
    );
    return childRoutes;
}

module.exports = {
    path: '/user_info_manage',
    //在RightContent中用来做跳转,重要
    routesExports: getChildRoutes(),
    routes: getChildRoutes(),
    component: RightContent
};