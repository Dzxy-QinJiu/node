/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/11/26.
 */
/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by xuning on 2018 9.17
 */
var Content = require('../../../components/privilege/content');
const weeklyReport = require('MOD_DIR/weekly_report');
const monthlyReport = require('MOD_DIR/monthly-report');
const salesReport = require('MOD_DIR/sales-report');
const userData = require('../user-data');

function getChildRoutesByPrivilege(menu, fullModuleList) {
    const data = userData.getUserData();
    const subMenus = _.get(data, 'thirdLevelMenus.' + menu);
    let childRoutes = [];
    _.each(subMenus, function(module) {
        var target = _.find(fullModuleList, function(moduleAnother) {
            if ('/' + module.routePath === moduleAnother.path) {
                return true;
            }
        });
        if (target) {
            childRoutes.push(target);
        }
    });
    return childRoutes;
}

function getChildRoutes() {
    var childRoutes = getChildRoutesByPrivilege('REPORT',
        [
            weeklyReport,
            monthlyReport,
            salesReport,
        ]
    );

    return childRoutes;
}

module.exports = {
    path: '/analysis/report',
    //在RightContent中用来做跳转,重要
    routesExports: getChildRoutes(),
    routes: getChildRoutes(),
    component: Content
};
