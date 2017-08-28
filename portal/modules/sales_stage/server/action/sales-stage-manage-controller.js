"use strict";

var SalesStageManageServic = require("../service/sales-stage-manage-service");

exports.getSalesStageList = function (req, res) {
    SalesStageManageServic.getSalesStageList(req, res)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (codeMessage) {
        res.json(codeMessage && codeMessage.message);
    });
};

exports.addSalesStage = function (req, res) {

    SalesStageManageServic.addSalesStage(req, res, req.body)
        .on("success", function (data) {
            res.json(data);
        }).on("error", function (codeMessage) {
            res.json(codeMessage && codeMessage.message);
        }
    );
};

exports.editSalesStage = function (req, res) {

    SalesStageManageServic.editSalesStage(req, res, req.body)
        .on("success", function (data) {
            res.json(data);
        }).on("error", function (codeMessage) {
            res.json(codeMessage && codeMessage.message);
        }
    );
};

exports.deleteSalesStage = function (req, res) {
    SalesStageManageServic.deleteSalesStage(req, res, req.body)
        .on("success", function (data) {
            res.json(data);
        }).on("error", function (codeMessage) {
            res.json(codeMessage && codeMessage.message);
        }
    );
};
