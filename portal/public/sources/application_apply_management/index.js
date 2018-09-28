/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/27.
 */
var RightContent = require('../../../components/privilege/right-content');
var Checker = require('../../../components/privilege/checker');

var bussinessApply = require('../../../modules/bussiness-apply');
var salesOppotunity = require('../../../modules/sales_opportunity');
var leaveApply = require('../../../modules/leave-apply');


function getChildRoutes() {
    // var bussinessApply = ApplicationApply('/application/business_apply');
    // var salesOppotunity = ApplicationApply('/application/sales_oppotunity');
    // var leaveApply = ApplicationApply('/application/leave_apply');
    var childRoutes = Checker.getChildRoutes('application',
        [
            bussinessApply,
            salesOppotunity,
            leaveApply,
        ]
    );
    return childRoutes;
}

module.exports = {
    path: '/application',
    //在RightContent中用来做跳转,重要
    routesExports: getChildRoutes(),
    routes: getChildRoutes(),
    component: RightContent
};