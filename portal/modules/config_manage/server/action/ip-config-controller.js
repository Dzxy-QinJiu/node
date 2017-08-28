/**
 * IP配置的action
 * */

'use strict';
import IpConfig from '../service/ip-config-service';
// 获取IP配置
exports.getIpConfigList = function(req, res){
    var queryObj = {
        page_size: req.query.page_size
    };
    IpConfig.getIpConfigList(req, res, queryObj).on('success',function(resData){
        res.status(200).json(resData);
    }).on('error', function(codeMessage){
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 添加IP配置
exports.addIpConfigItem = function(req, res){
    IpConfig.addIpConfigItem(req, res, req.body).on('success', function(data){
        res.status(200).json(data);
    }).on('error', function(codeMessage){
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 删除IP配置
exports.deleteIpConfigItem = function(req, res){
    var id = req.params.id;
    IpConfig.deleteIpConfigItem(req, res, id).on('success', function(data){
        res.status(200).json(data);
    }).on('error', function(codeMessage){
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 添加安全域过滤内网网段
exports.filterIp = function(req, res){
    IpConfig.filterIp(req, res, req.body).on('success', function(data){
        res.status(200).json(data);
    }).on('error', function(codeMessage){
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 获取安全域过滤内网网段
exports.getFilterIp = function(req, res){
    IpConfig.getFilterIp(req, res).on('success', function(data){
        res.status(200).json(data);
    }).on('error', function(codeMessage){
        res.status(500).json(codeMessage && codeMessage.message);
    });
};