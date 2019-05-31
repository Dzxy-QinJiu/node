/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/1/8.
 */
import routeList from '../../modules/common/route';
import ajax from '../../modules/common/ajax';

//获取无效电话
exports.getInvalidPhone = function(onSuccess, onError) {
    const route = _.find(routeList, route => route.handler === 'getInvalidPhone');
    const arg = {
        url: route.path,
        type: route.method,
    };
    ajax(arg).then(result => {
        if (_.isFunction(onSuccess)) {
            onSuccess(result);
        }
    }, err => {
        if (_.isFunction(onError)) {
            onError(err);
        }
    });
};
//添加为无效电话
exports.addInvalidPhone = function(data, onSuccess, onError) {
    const route = _.find(routeList, route => route.handler === 'addInvalidPhoneV2');
    const arg = {
        url: route.path,
        type: route.method,
        data
    };
    ajax(arg).then(result => {
        if (_.isFunction(onSuccess)) {
            onSuccess(result);
        }
    }, err => {
        if (_.isFunction(onError)) {
            onError(err);
        }
    });
};

