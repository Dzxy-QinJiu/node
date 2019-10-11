'use strict';
const customerScoreService = require('../service/domain-application-service');

exports.checkDomainExist = (req, res) => {
    customerScoreService.checkDomainExist(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};



