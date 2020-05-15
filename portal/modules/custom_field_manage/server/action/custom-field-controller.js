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
