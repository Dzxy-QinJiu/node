/**
 * Created by zhl on 2020/5/15.
 */

'use strict';

const customFieldService = require('../service/custom-field-service');

// 获取自定义参数配置
exports.getCustomFieldConfig = (req, res) => {
    customFieldService.getCustomFieldConfig(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};

//  添加自定义参数配置
exports.addCustomFieldConfig = (req, res) => {
    customFieldService.addCustomFieldConfig(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};

// 修改自定义参数配置
exports.updateCustomFieldConfig = (req, res) => {
    customFieldService.updateCustomFieldConfig(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};

// 删除自定义参数配置
exports.deleteCustomFieldConfig = (req, res) => {
    customFieldService.deleteCustomFieldConfig(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};

//  添加一条自定义参数配置
exports.addItemCustomField = (req, res) => {
    customFieldService.addItemCustomField(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};

// 修改一条自定义参数配置
exports.updateItemCustomField = (req, res) => {
    customFieldService.updateItemCustomField(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};

// 删除一条自定义参数配置
exports.deleteItemCustomField = (req, res) => {
    customFieldService.deleteItemCustomField(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};
