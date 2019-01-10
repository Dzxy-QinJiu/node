/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/12.
 */
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var EventEmitter = require('events').EventEmitter;
var Promise = require('bluebird');
var _ = require('lodash');
var urls = {
    addAppFeedback: '/rest/base/v1/notice/customer/application/feedback'
};

//添加产品反馈
exports.addAppFeedback = function(req, res, reqBody) {
    // reqBody.product = JSON.parse(reqBody.product);
    var emitter = new EventEmitter();
    let promiseList = [];
    // if (_.isArray(reqBody.product) && reqBody.product.length){
    //     reqBody.product.forEach((appId)=> {
    //         var feedbackObj = {
    //             app_id:appId,
    //             topic:reqBody.topic,
    //             content:reqBody.content
    //         };
    //         promiseList.push(addFeedbackPromise(req, res, feedbackObj));
    //     });
    // }
    var feedbackObj = {
        app_id: reqBody.product,
        topic: reqBody.topic,
        content: reqBody.content
    };
    promiseList.push(addFeedbackPromise(req, res, feedbackObj));
    Promise.all(promiseList).then(function(result) {
        emitter.emit('success', result);
    }, function(errorMsg) {
        emitter.emit('error', errorMsg);
    });
    return emitter;
};
function addFeedbackPromise(req, res, reqBody) {
    return new Promise((resolve, reject) => {
        return restUtil.authRest.post(
            {
                url: urls.addAppFeedback,
                req: req,
                res: res
            }, reqBody, {
                success: function(eventEmitter, result) {
                    resolve(result);
                },
                error: function(eventEmitter, errorDesc) {
                    reject(errorDesc.message);
                }
            });
    });
}