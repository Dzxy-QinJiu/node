/**
 * 安全域密码策略的action
 * */

'use strict';
import RealmConfigService from '../service/realm-config-service';
// 获取安全域密码策略
exports.getRealmStrategy = function(req, res){   
    RealmConfigService.getRealmStrategy(req, res).on('success',function(resData){
        res.status(200).json(resData);
    }).on('error', function(codeMessage){
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 添加安全域密码策略
exports.setRealmStrategy = function(req, res){
    RealmConfigService.setRealmStrategy(req, res, req.body).on('success', function(data){
        res.status(200).json(data);
    }).on('error', function(codeMessage){
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 获取集成线索
exports.getIntegrationList = function(req, res){
    RealmConfigService.getIntegrationList(req, res).on('success',function(resData){
        res.status(200).json(resData);
    }).on('error', function(codeMessage){
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

