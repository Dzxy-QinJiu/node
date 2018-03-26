/**
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 * Created by 肖金峰 on 2016/2/3.
 */

"use strict";
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("ant-auth-request").restUtil(restLogger);
var salesStageRestApis = {
    getSalesStageList: "/rest/customer/v2/salestage",
    addSalesStage: "/rest/customer/v2/salestage",
    editSalesStage: "/rest/customer/v2/salestage",
    deleteSalesStage: "/rest/customer/v2/salestage"
};
exports.urls = salesStageRestApis;

exports.getSalesStageList = function (req, res) {
    return restUtil.authRest.get(
        {
            url: salesStageRestApis.getSalesStageList,
            req: req,
            res: res
        });
};

exports.addSalesStage = function (req, res, salesStage) {
    return restUtil.authRest.post(
        {
            url: salesStageRestApis.addSalesStage,
            req: req,
            res: res
        },
        salesStage,
        {
            success: function (eventEmitter, data) {
                //处理数据
                eventEmitter.emit("success", data);
            }
        });
};

exports.editSalesStage = function (req, res, salesStageArray) {
    return restUtil.authRest.put(
        {
            url: salesStageRestApis.editSalesStage,
            req: req,
            res: res
        },
        salesStageArray,
        {
            success: function (eventEmitter, data) {
                //处理数据
                eventEmitter.emit("success", data);
            }
        });
};

exports.deleteSalesStage = function (req, res, idsArray) {
    return restUtil.authRest.del(
        {
            url: salesStageRestApis.deleteSalesStage,
            req: req,
            res: res
        },
        idsArray, {
            success: function (eventEmitter, data) {
                //处理数据
                eventEmitter.emit("success", data);
            }
        }
    );
};
