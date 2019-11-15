/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2019/10/28.
 */
var urls = {
    //获取客套商品列表
    getCurtaoGoodsList: '/pay/goods/curtao/list',
    //商品交易
    goodsTrade: '/pay/goods/curtao/trade',
    //订单交易状态
    getOrderStatus: '/pay/trade/order/status',
    //获取支付渠道信息
    getPaymentMode: '/pay/management/curtao/paychannels',
    //获取商品折扣信息
    getGoodsDiscountList: '/pay/goods/curtao/discount/list',
    // 获取组织的通话费用
    getOrganizationCallFee: '/charging/phone/charging/organization/fee',
};
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var _ = require('lodash');
//获取客套商品列表
exports.getCurtaoGoodsList = function(req,res) {
    return restUtil.authRest.get({
        url: urls.getCurtaoGoodsList,
        req: req,
        res: res
    }, req.query, {
        success: function(emitter , data) {
            //status: 商品状态（0：停用，1：启用）
            data.list = _.filter(_.get(data,'list', []),list => list.status === 1);
            emitter.emit('success' , data);
        }
    });
};

//商品交易(下单)
exports.goodsTrade = function(req,res) {
    let body = req.body;
    if(body.num) {
        body.num = parseInt(body.num);
    }
    return restUtil.authRest.post({
        url: urls.goodsTrade,
        req: req,
        res: res
    }, body);
};

//订单交易状态
exports.getOrderStatus = function(req,res) {
    return restUtil.authRest.get({
        url: urls.getOrderStatus,
        req: req,
        res: res
    }, req.query);
};

//获取支付渠道信息
exports.getPaymentMode = function(req,res) {
    return restUtil.authRest.get({
        url: urls.getPaymentMode,
        req: req,
        res: res
    }, req.query);
};

//获取商品折扣信息
exports.getGoodsDiscountList = function(req,res) {
    return restUtil.authRest.get({
        url: urls.getGoodsDiscountList,
        req: req,
        res: res
    }, req.query);
};

// 获取组织的通话费用
exports.getOrganizationCallFee = (req, res) =>{
    return restUtil.authRest.get({
        url: urls.getOrganizationCallFee,
        req: req,
        res: res
    }, req.query);
};