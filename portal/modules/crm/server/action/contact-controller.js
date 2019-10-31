var contactService = require('../service/contact-service');
const _ = require('lodash');
exports.getContactList = function(req, res) {
    contactService.getContactList(req, res)
        .on('success', function(data) {
            let hideContactWay = req.body.hideContactWay;
            let contactList = _.get(data, '[0]') ? data : [];
            if (hideContactWay) {
                contactList = _.map(contactList, item => {
                    //隐藏联系方式的情况下需要把联系方式去掉（例如：客户池中不展示联系方式）
                    delete item.phone;
                    delete item.qq;
                    delete item.email;
                    delete item.weChat;
                    return item;
                });
            }
            res.status(200).json({
                result: contactList,
                total: _.get(data, 'length', 0)
            });
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};


/**
 * 删除联系人
 */
exports.deleteContact = function(req, res) {
    contactService.deleteContact(req, res, req.params.contactId)
        .on('success', function(data) {
            res.json(data);
        }).on('error', function(err) {
            res.json(err.message);
        });
};

/**
 * 添加联系人
 */
exports.addContact = function(req, res) {
    contactService.addContact(req, res, req.body)
        .on('success', function(data) {
            res.json(data);
        }).on('error', function(err) {
            res.status(500).json(err.message);
        });
};

/**
 * 修改联系人
 */
exports.editContact = function(req, res) {
    contactService.editContact(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(err) {
        res.status(500).json(err.message);
    });
};
/*
* 整体修改联系人的信息
* 小程序中使用*/

exports.editContactEntirety = function(req, res) {
    contactService.editContactEntirety(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(err) {
        res.status(500).json(err.message);
    });
};


/**
 * 设置默认联系人
 */
exports.setDefault = function(req, res) {
    var contactId = req.params.contactId;
    contactService.setDefault(req, res, contactId)
        .on('success', function(data) {
            res.json(data);
        }).on('error', function(err) {
            res.json(err.message);
        });
};
