/** Created by 2019-07-26 11:36 */
//获取客套商品列表
let getGoodsListAjax = null;
exports.getGoodsList = function(queryObj) {
    var Deferred = $.Deferred();
    getGoodsListAjax && getGoodsListAjax.abort();
    getGoodsListAjax = $.ajax({
        url: '/rest/goods/curtao/list',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg, statusText) {
            if(statusText !== 'abort') {
                Deferred.reject(errorMsg.responseJSON || Intl.get('clues.get.goods.faild', '获取商品失败'));
            }
        }
    });
    return Deferred.promise();
};

//商品交易(注意，传goods_id时，是创建订单，只传order_id和type(是根据支付方式查询当前订单的二维码))
let goodsTradeAjax = null;
exports.goodsTrade = function(reqData) {
    var Deferred = $.Deferred();
    goodsTradeAjax && goodsTradeAjax.abort();
    goodsTradeAjax = $.ajax({
        url: '/rest/goods/curtao/trade',
        dataType: 'json',
        type: 'post',
        data: reqData,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg, statusText) {
            if(statusText !== 'abort') {
                Deferred.reject(errorMsg.responseJSON);
            }
        }
    });
    return Deferred.promise();
};

//订单交易状态
exports.getOrderStatus = function(queryObj) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/trade/order/status',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

//获取支付渠道信息
let getPaymentModeAjax = null;
exports.getPaymentMode = function(queryObj) {
    var Deferred = $.Deferred();
    getPaymentModeAjax && getPaymentModeAjax.abort();
    getPaymentModeAjax = $.ajax({
        url: '/rest/trade/management/paychannels',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg, statusText) {
            if(statusText !== 'abort') {
                Deferred.reject(errorMsg.responseJSON || Intl.get('payment.get.payment.mode.faild', '获取支付渠道失败'));
            }
        }
    });
    return Deferred.promise();
};

//获取商品折扣信息
let getGoodsDiscountListAjax = null;
exports.getGoodsDiscountList = function(queryObj) {
    var Deferred = $.Deferred();
    getGoodsDiscountListAjax && getGoodsDiscountListAjax.abort();
    getGoodsDiscountListAjax = $.ajax({
        url: '/rest/goods/discount/list',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(errorMsg, statusText) {
            if(statusText !== 'abort') {
                Deferred.reject(errorMsg.responseJSON || Intl.get('payment.get.discount.faild', '获取商品折扣信息失败'));
            }
        }
    });
    return Deferred.promise();
};