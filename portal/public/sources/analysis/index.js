/**
* Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
* 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
* Created by xuning on 2018 9.17
*/
var history = require('../history');
var RightContent = require('../../../components/privilege/right-content');
var Checker = require('../../../components/privilege/checker');
const analysis = require('MOD_DIR/analysis');
const weeklyReport = require('MOD_DIR/weekly_report');
const monthlyReport = require('MOD_DIR/monthly-report');

class ReportIndexRoute extends React.Component {
    componentWillMount() {
        history.replace('weekly_report');
    }

    render() {
        return null;
    }
}

function getChildRoutes() {
    var childRoutes = Checker.getChildRoutes('analysis',
        [
            analysis,
            {
                path: '/analysis/report',
                component: ReportIndexRoute
            }
        ]
    );

    childRoutes = childRoutes.concat([
        weeklyReport,
        monthlyReport,
    ]);

    return childRoutes;
}

module.exports = {
    path: '/analysis',
    //在RightContent中用来做跳转,重要
    routesExports: getChildRoutes(),
    routes: getChildRoutes(),
    component: RightContent
};
