/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2019/10/28.
 */
module.exports = {
    module: 'common/server/action/pay',
    routes: [{
        //获取客套商品列表
        'method': 'get',
        'path': '/rest/goods/curtao/list',
        'handler': 'getCurtaoGoodsList',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }, {
        //商品交易
        'method': 'post',
        'path': '/rest/goods/curtao/trade',
        'handler': 'goodsTrade',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }, {
        //订单交易状态
        'method': 'get',
        'path': '/rest/trade/order/status',
        'handler': 'getOrderStatus',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }, {
        //获取支付渠道信息
        'method': 'get',
        'path': '/rest/trade/management/paychannels',
        'handler': 'getPaymentMode',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }, {
        //获取商品折扣信息
        'method': 'get',
        'path': '/rest/goods/discount/list',
        'handler': 'getGoodsDiscountList',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }, {
        // 获取组织的通话费用
        'method': 'get',
        'path': '/rest/get/organization/phone/fee',
        'handler': 'getOrganizationCallFee',
        'passport': {
            'needLogin': true
        }
    }]
};