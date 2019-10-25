/**
 * Created by hzl on 2019/10/17.
 */

'use strict';

import IpFilterService from '../service/ip-filter-service';

// 获取IP列表
exports.getIpList = (req, res) => {
    IpFilterService.getIpList(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 添加IP
exports.addIp = (req, res) => {
    IpFilterService.addIp(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 删除IP
exports.deleteIp = (req, res) => {
    IpFilterService.deleteIp(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 获取安全域过滤内网网段
exports.getFilterPrivateIp = (req, res) => {
    IpFilterService.getFilterPrivateIp(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 设置全域过滤内网网段
exports.setFilterPrivateIp = (req, res) => {
    IpFilterService.setFilterPrivateIp(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};