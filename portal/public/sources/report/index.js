var RightContent = require("../../../components/privilege/right-content");
var Checker = require("../../../components/privilege/checker");

var OPERATION_REPORT = require("../../../modules/operation_report");

var APP_OPERATION_REPORT = require("../../../modules/report/app_operation");

function getChildRoutes() {
    var childRoutes = Checker.getChildRoutes('report',
        [
            OPERATION_REPORT,
            APP_OPERATION_REPORT
        ]
    );
    return childRoutes;
}


module.exports = {
    path: 'report',
    //在RightContent中用来做跳转,重要
    routesExports : getChildRoutes(),

    getChildRoutes : function(location , cb) {

        var childRoutes = getChildRoutes();
        cb(null , childRoutes);
    },
    component : RightContent
};