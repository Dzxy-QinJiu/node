/**
 * Created by zhoulianyi on  2016/5/29 15:37.
 */
var RightContent = require("../../../components/privilege/right-content");
var Checker = require("../../../components/privilege/checker");
//用户在线统计
var UserOnlineAnalysis = require("../../../modules/user_online_analysis");
//用户在线列表
var UserOnlineList = require("../../../modules/user_online_list");


function getChildRoutes() {
    var childRoutes = Checker.getChildRoutes('online',
        [
            UserOnlineAnalysis,
            UserOnlineList
        ]
    );
    return childRoutes;
}

module.exports = {
    path: 'online',
    //在RightContent中用来做跳转,重要
    routesExports: getChildRoutes(),
    getChildRoutes: function (location, cb) {
        var childRoutes = getChildRoutes();
        cb(null, childRoutes);
    },
    component: RightContent
};
