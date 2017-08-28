var alertService = require("../service/alert-service");

exports.getAlertList = function (req, res) {
    alertService.getAlertList(req, res)
        .on("success", function (data) {
            res.json(data);
        }).on("error", function (err) {
        res.json(err.message);
    });
};

exports.addAlert = function (req, res) {
    alertService.addAlert(req, res)
        .on("success", function (data) {
            res.json(data);
        }).on("error", function (err) {
        res.json(err.message);
    });
};

exports.editAlert = function (req, res) {
    alertService.editAlert(req, res)
        .on("success", function (data) {
            res.json(data);
        }).on("error", function (err) {
        res.json(err.message);
    });
};

exports.deleteAlert = function (req, res) {
    alertService.deleteAlert(req, res)
        .on("success", function (data) {
            res.json(data);
        }).on("error", function (err) {
        res.json(err.message);
    });
};

