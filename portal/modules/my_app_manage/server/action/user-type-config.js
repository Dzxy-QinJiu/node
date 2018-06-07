/**
 * Created by zhshj on 2017/2/14.
 */

'use strict';

var userTypeConfig = require('../service/user-type-config-service');

exports.getUserTypeConfig = function(req, res) {
    var clientID = req.query.client_id;
    var pageSize = req.query.page_size;
    var obj = {
        client_id: clientID,
        page_size: pageSize
    };

    if(req.query && req.query.user_type){
        obj.user_type = req.query.user_type;
    }

    userTypeConfig.getUserTypeConfig(req, res, obj).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.addUserTypeConfig = function(req, res) {

    userTypeConfig.addUserTypeConfig(req, res, req.body).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.updateUserTypeConfig = function(req, res) {

    userTypeConfig.updateUserTypeConfig(req, res, req.body).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};



