/**
 * IP配置的action
 * */

'use strict';
import TeleConfig from '../service/tele-config-service';

exports.addTele = function(req, res){
    var param = {
        phone: req.body.phone
    };
    TeleConfig.addTele(req, res, param).on('success',function(resData){
        res.status(200).json(resData);
    }).on('error', function(codeMessage){
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

exports.delTele = function(req, res){
    var param = {
        phone: req.body.phone
    };
    TeleConfig.delTele(req, res, param).on('success',function(resData){
        res.status(200).json(resData);
    }).on('error', function(codeMessage){
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

exports.getTele = function(req, res){
    var param = {
        id: req.body.id
    };
    TeleConfig.getTele(req, res, param).on('success',function(resData){
        res.status(200).json(resData);
    }).on('error', function(codeMessage){
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
