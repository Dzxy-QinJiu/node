/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

"use strict";

/**
 * 请求路径 - login
 */

module.exports = {
    module: "sales_stage/server/action/sales-stage-manage-controller",
    routes: [{
        "method": "get",
        "path": "/rest/sales_stage_list",
        "handler": "getSalesStageList",
        "passport": {
            "needLogin": true
        }
    }, {
        "method": "post",
        "path": "/rest/sales_stage",
        "handler": "addSalesStage",
        "passport": {
            "needLogin": true
        }
    }, {
        "method": "put",
        "path": "/rest/sales_stage",
        "handler": "editSalesStage",
        "passport": {
            "needLogin": true
        }
    }, {
        "method": "delete",
        "path": "/rest/sales_stage",
        "handler": "deleteSalesStage",
        "passport": {
            "needLogin": true
        }
    }]
};