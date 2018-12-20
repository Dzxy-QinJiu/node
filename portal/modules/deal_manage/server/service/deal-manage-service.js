'use strict';
const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);
const _ = require('lodash');
const baseUrl = '/rest/customer/v3/salesopportunity';
const dealUrl = {
    getDealList: `${baseUrl}/range/:type/:page_size/:sort_field/:sort_order`,
    addDeal: baseUrl,
    editDeal: `${baseUrl}/property/:property`,
    deleteDeal: `${baseUrl}/:deal_id`,
    //各阶段总预算的获取
    getStageTotalBudget: '/rest/analysis/customer/v2/:type/total/stage'
};

exports.getDealList = function(req, res) {
    let url = dealUrl.getDealList.replace(':type', req.params.type)
        .replace(':page_size', req.params.page_size)
        .replace(':sort_field', req.params.sort_field)
        .replace(':sort_order', req.params.sort_order);
    let isFirstKey = true;
    _.each(req.query, (value, key) => {
        //第一个key前面需要加?
        if (isFirstKey) {
            isFirstKey = false;
            url += `?${key}=${value}`;
        } else {
            url += `&${key}=${value}`;
        }
    });
    return restUtil.authRest.post({
        url: url,
        req: req,
        res: res
    }, req.body);
};

exports.addDeal = function(req, res) {
    return restUtil.authRest.post({
        url: dealUrl.addDeal,
        req: req,
        res: res
    }, req.body);
};

exports.editDeal = function(req, res) {
    let bodyData = req.body;
    let property = bodyData.property;
    delete bodyData.property;
    return restUtil.authRest.put({
        url: dealUrl.editDeal.replace(':property', property),
        req: req,
        res: res
    }, bodyData);
};

exports.deleteDeal = function(req, res) {
    return restUtil.authRest.del({
        url: dealUrl.deleteDeal.replace(':deal_id', req.params.deal_id),
        req: req,
        res: res
    });
};
//各阶段总预算的获取
exports.getStageTotalBudget = function(req, res) {
    return restUtil.authRest.get({
        url: dealUrl.getStageTotalBudget.replace(':type', req.params.type),
        req: req,
        res: res
    }, req.query);
};


    