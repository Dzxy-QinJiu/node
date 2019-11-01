/**
 * Created by hzl on 2019/7/2.
 */

'use strict';
const cluePoolService = require('../service/clue-pool-service');
const _ = require('lodash');
const methodUtil = require('../../../../lib/utils/common-utils').method;
// 获取线索池列表
exports.getCluePoolList = (req, res) => {
    cluePoolService.getCluePoolList(req, res).on('success', (data) => {
        if(_.get(data, 'result.length')){
            //线索池中，去掉联系方式
            data.result = _.map(data.result, item => {
                return handleRemoveContactWay(item);
            });
        }
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};
//移除线索联系方式的处理
function handleRemoveContactWay(clueItem) {
    delete clueItem.phones;
    if(_.get(clueItem, 'contacts.length')){
        clueItem.contacts = methodUtil.removeContactWay(clueItem.contacts);
    }
    return clueItem;
}
// 获取线索池负责人
exports.getCluePoolLeading = (req, res) => {
    cluePoolService.getCluePoolLeading(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};

// 获取线索池来源
exports.getCluePoolSource = (req, res) => {
    cluePoolService.getCluePoolSource(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};

// 获取线索池接入渠道
exports.getCluePoolChannel = (req, res) => {
    cluePoolService.getCluePoolChannel(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};

// 获取线索池分类
exports.getCluePoolClassify = (req, res) => {
    cluePoolService.getCluePoolClassify(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', function(err) {
        res.status(500).json(err && err.message);
    });
};

// 获取线索池地域
exports.getCluePoolProvince = (req, res) => {
    cluePoolService.getCluePoolProvince(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', function(err) {
        res.status(500).json(err && err.message);
    });
};

// 单个提取线索
exports.extractClueAssignToSale = (req, res) => {
    cluePoolService.extractClueAssignToSale(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};

// 批量提取线索
exports.batchExtractClueAssignToSale = (req, res) => {
    cluePoolService.batchExtractClueAssignToSale(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};

// 根据线索的id获取线索的详情
exports.getClueDetailById = (req, res) => {
    cluePoolService.getClueDetailById(req, res).on('success', (data) => {
        let clueDetail = _.get(data, 'result', {});
        //线索池的线索详情中需要用联系电话去查相似线索、相似客户，所以此处暂时不能去掉联系方式，待后端查相似线索、客户的接口修改成不需要前端传是再放开此处注释
        // clueDetail = handleRemoveContactWay(clueDetail);
        res.status(200).json(clueDetail);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};
