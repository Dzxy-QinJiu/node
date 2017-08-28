/**
 * Created by zhoulianyi on  2016/5/8 16:36.
 */
var RightContent = require("../../../components/privilege/right-content");
var Checker = require("../../../components/privilege/checker");
var Notification = require("../../../modules/notification");


function getChildRoutes() {
    var childRoutes = Checker.getChildRoutes('notification',
        [
            Notification('customer'),
            Notification('applyfor'),
            Notification('system'),
        ]
    );
    return childRoutes;
}


module.exports = {
    path: 'notification',
    //在RightContent中用来做跳转,重要
    routesExports: getChildRoutes(),
    getChildRoutes: function (location, cb) {
        var childRoutes = getChildRoutes();
        cb(null, childRoutes);
    },
    component: RightContent
};
