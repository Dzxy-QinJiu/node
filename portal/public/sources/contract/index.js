var RightContent = require("../../../components/privilege/right-content");
var Checker = require("../../../components/privilege/checker");
//合同列表
var Contract = require("../../../modules/contract");
//合同仪表盘
var ContractDashboard = require("../../../modules/contract/dashboard-index");

function getChildRoutes() {
    var childRoutes = Checker.getChildRoutes('contract',
        [
            Contract,
            ContractDashboard,
        ]
    );
    return childRoutes;
}

module.exports = {
    path: 'contract',
    //在RightContent中用来做跳转,重要
    routesExports: getChildRoutes(),
    getChildRoutes: function (location, cb) {
        var childRoutes = getChildRoutes();
        cb(null, childRoutes);
    },
    component: RightContent
};
