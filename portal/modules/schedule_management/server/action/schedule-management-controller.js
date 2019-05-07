var scheduleService = require('../service/schedule-management-service');

exports.getScheduleList = function(req, res) {
    scheduleService.getScheduleList(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

exports.handleScheduleStatus = function(req, res) {
    scheduleService.handleScheduleStatus(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};
exports.addSchedule = function(req, res) {
    scheduleService.addSchedule(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};

exports.editSchedule = function(req, res) {
    scheduleService.editSchedule(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};

exports.deleteSchedule = function(req, res) {
    scheduleService.deleteSchedule(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};



