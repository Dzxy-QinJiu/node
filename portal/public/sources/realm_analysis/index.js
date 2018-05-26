var RightContent = require("../../../components/privilege/right-content");
var Checker = require("../../../components/privilege/checker");

var OPLATE_BD_ANALYSIS_REALM_ZONE = require("../../../modules/oplate_bd_analysis_realm_zone");
var OPLATE_BD_ANALYSIS_REALM_INDUSTRY = require("../../../modules/oplate_bd_analysis_realm_industry");
var OPLATE_BD_ANALYSIS_REALM_ESTABLISH = require("../../../modules/oplate_bd_analysis_realm_establish");

function getChildRoutes() {
    var childRoutes = Checker.getChildRoutes('analysis/realm',
        [
            OPLATE_BD_ANALYSIS_REALM_ZONE,
            OPLATE_BD_ANALYSIS_REALM_INDUSTRY,
            OPLATE_BD_ANALYSIS_REALM_ESTABLISH
        ]
    );
    return childRoutes;
}


module.exports = {
    path: 'analysis/realm',
    //在RightContent中用来做跳转,重要
    routesExports: getChildRoutes(),

    getChildRoutes: function(location , cb) {

        var childRoutes = getChildRoutes();
        cb(null , childRoutes);
    },
    component: RightContent
};