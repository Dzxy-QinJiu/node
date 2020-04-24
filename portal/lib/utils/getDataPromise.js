/**
 * Copyright (c) 2018-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/4/24.
 */
var restLogger = require('./logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
//获取数据的promise
export const getDataPromise = function(req, res, url, pathParams, queryObj) {
    //url中的参数处理
    if (pathParams) {
        for (let key in pathParams) {
            url += '/' + pathParams[key];
        }
    }
    let resultObj = {errorData: null, successData: null};
    return new Promise((resolve, reject) => {
        return restUtil.authRest.get(
            {
                url: url,
                req: req,
                res: res
            }, queryObj, {
                success: function(eventEmitter, data) {
                    resultObj.successData = data;
                    resolve(resultObj);
                },
                error: function(eventEmitter, errorObj) {
                    resultObj.errorData = errorObj;
                    resolve(resultObj);
                }
            });
    });
};