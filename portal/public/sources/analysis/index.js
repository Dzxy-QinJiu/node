/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by xuning on 2018 9.17
 */
var RightContent = require('../../../components/privilege/right-content');
var Checker = require('../../../components/privilege/checker');
const analysis = require('MOD_DIR/analysis');

function getChildRoutes() {
    var childRoutes = Checker.getChildRoutes('analysis',
        [
            analysis,
            require('./report')
        ]
    );
    return childRoutes;
}

module.exports = {
    path: '/analysis',
    //在RightContent中用来做跳转,重要
    routesExports: getChildRoutes(),
    routes: getChildRoutes(),
    component: RightContent
};
