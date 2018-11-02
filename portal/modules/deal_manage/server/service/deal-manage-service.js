'use strict';
const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);
const _ = require('lodash');
const dealUrl = {
    getDealList: '/rest/customer/v2/salesopportunity/range/:type/:page_size/:sort_field/:sort_order',
    addDeal: '/rest/customer/v2/salesopportunity',
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

    