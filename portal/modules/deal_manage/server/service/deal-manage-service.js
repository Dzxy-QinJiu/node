'use strict';
const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);
const _ = require('lodash');
const baseUrl = '/rest/customer/v3/salesopportunity';
const dealUrl = {
    getDealList: `${baseUrl}/range/:type/:page_size/:sort_field/:sort_order`,
    addDeal: baseUrl,
    editDeal: baseUrl,
    editDealStage: `${baseUrl}/property/sale_stage`,
    deleteDeal: `${baseUrl}/:deal_id`
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
    return restUtil.authRest.put({
        url: dealUrl.editDeal,
        req: req,
        res: res
    }, req.body);
};

exports.editDealStage = function(req, res) {
    return restUtil.authRest.put({
        url: dealUrl.editDealStage,
        req: req,
        res: res
    }, req.body);
};

exports.deleteDeal = function(req, res) {
    return restUtil.authRest.del({
        url: dealUrl.deleteDeal.replace(':deal_id', req.params.deal_id),
        req: req,
        res: res
    });
};

    