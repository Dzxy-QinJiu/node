require('./index.less');
var RightContent = require('../../../components/privilege/right-content');
var Checker = require('../../../components/privilege/checker');

var OPLATE_USER_ANALYSIS_SUMMARY = require('../../../modules/oplate_user_analysis_summary');
var OPLATE_USER_ANALYSIS_ZONE = require('../../../modules/oplate_user_analysis_zone');
var OPLATE_USER_ANALYSIS_INDUSTRY = require('../../../modules/oplate_user_analysis_industry');
var OPLATE_USER_ANALYSIS_ACTIVE = require('../../../modules/oplate_user_analysis_active');

function getChildRoutes() {
    var childRoutes = Checker.getChildRoutes('analysis/user',
        [
            OPLATE_USER_ANALYSIS_SUMMARY,
            OPLATE_USER_ANALYSIS_ZONE,
            OPLATE_USER_ANALYSIS_INDUSTRY,
            OPLATE_USER_ANALYSIS_ACTIVE
        ]
    );
    return childRoutes;
}


module.exports = {
    path: 'analysis/user',
    //在RightContent中用来做跳转,重要
    routesExports: getChildRoutes(),

    getChildRoutes: function(location , cb) {

        var childRoutes = getChildRoutes();
        cb(null , childRoutes);
    },
    component: RightContent
};