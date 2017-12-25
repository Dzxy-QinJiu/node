/**
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

"use strict";
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("../../../../lib/rest/rest-util")(restLogger);
var EventEmitter = require("events").EventEmitter;
const v2Url = "/rest/customer/v2/contacts";

//获取联系人列表
exports.getContactList = function (req, res, reqBody) {
    return restUtil.authRest.post(
        {
            url: v2Url + "/query/" + req.params.type + "/all/10",
            req: req,
            res: res
        }, reqBody);
};

//设置默认联系人
exports.setDefault = function (req, res, id) {
    return restUtil.authRest.post(
        {
            url: v2Url + "/default/" + id,
            req: req,
            res: res
        }, null);
};

//修改联系人
exports.updateContact = function (req, res, newContact) {
    let emitter = new EventEmitter();
    let promiseList = [updateContact(req, res, newContact), updateContactPhone(req, res, newContact)];
    Promise.all(promiseList).then(function (resultList) {
        emitter.emit("success", resultList);
    }, function (errorMsg) {
        emitter.emit("error", errorMsg);
    });
    return emitter;
};

//更新联系人
function updateContact(req, res, newContact) {
    let contactObj= JSON.parse(JSON.stringify(newContact));
    delete contactObj.phone;
    return new Promise((resolve, reject) => {
        restUtil.authRest.put(
            {
                url: v2Url,
                req: req,
                res: res
            }, contactObj, {
                success: function (eventEmitter, result) {
                    resolve(result);
                },
                error: function (eventEmitter, errorDesc) {
                    reject(errorDesc.message);
                }
            });
    });
}

//更新联系人电话
function updateContactPhone(req, res, newContact) {
    let phoneContact = {
        customer_id: newContact.customer_id,
        id: newContact.id,
        phone: newContact.phone
    };
    return new Promise((resolve, reject) => {
        restUtil.authRest.put(
            {
                url: v2Url + "/phone",
                req: req,
                res: res
            }, phoneContact, {
                success: function (eventEmitter, result) {
                    resolve(result);
                },
                error: function (eventEmitter, errorDesc) {
                    reject(errorDesc.message);
                }
            });
    });
}

//添加联系人
exports.addContact = function (req, res, newContact) {
    return restUtil.authRest.post(
        {
            url: v2Url,
            req: req,
            res: res
        }, newContact);
};

//删除联系人
exports.deleteContact = function (req, res, ids) {
    return restUtil.authRest.del(
        {
            url: v2Url + "/" + ids,
            req: req,
            res: res
        }, null);
};
