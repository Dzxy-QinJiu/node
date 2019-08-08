'use strict';
const customerScoreService = require('../service/customer-score-service');

exports.getCustomerScoreRules = (req, res) => {
    customerScoreService.getCustomerScoreRules(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};
exports.getCustomerScoreLevel = (req, res) => {
    customerScoreService.getCustomerScoreLevel(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};
exports.getCustomerScoreIndicator = (req, res) => {
    customerScoreService.getCustomerScoreIndicator(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};
exports.saveCustomerRules = (req, res) => {
    customerScoreService.saveCustomerRules(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};




