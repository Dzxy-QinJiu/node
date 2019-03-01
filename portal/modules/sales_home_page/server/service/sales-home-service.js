/**
 * Created by wangliping on 2016/9/6.
 */
'use strict';
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var salesObj = require('../dto/salesObj');
var EventEmitter = require('events').EventEmitter;
var Promise = require('bluebird');
var _ = require('lodash');
import querystring from 'querystring';
var restApis = {
    //获取销售-客户列表
    getSalesCustomer: '/rest/base/v1/view/customer',
    //获取销售-电话列表
    getSalesPhone: '/rest/callrecord/v2/callrecord/query/:type/call_record/view',
    //获取销售-用户列表
    getSalesUser: '/rest/base/v1/view/user',
    //获取销售-合同列表
    getSalesContract: '/rest/base/v1/view/contract',
    //获取即将过期用户列表
    getExpireUser: '/rest/base/v1/view/expireuser',
    //获取网站个性化配置 或对网站进行个性化设置
    websiteConfig: '/rest/base/v1/user/website/config',
    //获取各销售对应的通话状态
    getSalesCallStatus: '/rest/customer/v2/phone/phone/status/:user_ids',
    // 获取全部和客户电话的列表（团队）
    callRecordListUrl: '/rest/callrecord/v2/callrecord/query/trace/call_date/:start_time/:end_time/:page_size/:sort_field/:sort_order',
    // 获取全部和客户电话的列表（所有的，包括不在团队里的数据）
    managerCallRcordListUrl: '/rest/callrecord/v2/callrecord/query/manager/trace/call_date/:start_time/:end_time/:page_size/:sort_field/:sort_order',
    //获取个人资料中邮箱是否激活
    getUserInfo: '/rest/base/v1/user/id',
};
exports.restUrls = restApis;

//获取各销售对应的通话状态
exports.getSalesCallStatus = function(req, res, queryObj) {
    return restUtil.authRest.get(
        {
            url: restApis.getSalesCallStatus.replace(':user_ids', queryObj.user_ids),
            req: req,
            res: res
        }, null);
};
//获取销售-客户列表
exports.getSalesCustomer = function(req, res, timeRange) {
    return restUtil.authRest.get(
        {
            url: restApis.getSalesCustomer,
            req: req,
            res: res
        }, timeRange, {
            success: function(eventEmitter, data) {
                //处理数据
                var salesCustomer = salesObj.toFrontSalesCustomer(data);
                eventEmitter.emit('success', salesCustomer);
            }
        });
};

//获取销售-电话列表
exports.getSalesPhone = function(req, res, reqData, type) {
    return restUtil.authRest.get(
        {
            url: restApis.getSalesPhone.replace(':type', type),
            req: req,
            res: res
        }, reqData, {
            success: function(eventEmitter, data) {
                //处理数据
                var salesPhone = salesObj.toFrontSalesPhone(data);
                eventEmitter.emit('success', salesPhone);
            }
        });
};

//获取销售-用户列表
exports.getSalesUser = function(req, res, timeRange) {
    return restUtil.authRest.get(
        {
            url: restApis.getSalesUser,
            req: req,
            res: res
        }, timeRange, {
            success: function(eventEmitter, data) {
                //处理数据
                var salesUser = salesObj.toFrontSalesUser(data);
                eventEmitter.emit('success', salesUser);
            }
        });
};

//获取销售-合同列表
exports.getSalesContract = function(req, res, timeRange) {
    return restUtil.authRest.get(
        {
            url: restApis.getSalesContract,
            req: req,
            res: res
        }, timeRange);
};

//获取过期用户列表
exports.getExpireUser = function(req, res) {
    var queryObj = req.query;
    var url = restApis.getExpireUser;
    if (!_.isEmpty(queryObj)){
        if (queryObj.team_id){
            url += '?team_id=' + queryObj.team_id;
        }
        if (queryObj.member_id){
            url += '?member_id=' + queryObj.member_id;
        }
    }
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, null, {
            success: function(eventEmitter, data) {
                //处理数据
                var expireUser = salesObj.toFrontExpireUser(data);
                eventEmitter.emit('success', expireUser);
            }
        });
};

//获取个人资料邮箱是否存在及激活状态
function getUserInfoEmail(req, res) {
    //用户的id
    var userId = req.params.userId;
    return new Promise((resolve, reject) => {
        restUtil.authRest.get(
            {
                url: restApis.getUserInfo + '/' + userId,
                req: req,
                res: res
            }, null, {
                success: function(eventEmitter, data) {
                    resolve(data);
                },
                error: function(eventEmitter, errorObj) {
                    reject(errorObj && errorObj.message);
                }
            });
    });
}

//获取个人配置
function getWebsiteConfig(req, res, responseObj) {
    return new Promise((resolve, reject) => {
        return restUtil.authRest.get(
            {
                url: restApis.websiteConfig,
                req: req,
                res: res
            }, null, {
                success: function(eventEmitter, data) {
                    //有数据,并且设置了不提醒
                    if (data){
                        if (!(_.get(data, 'setting_notice_ignore') === 'yes')){
                            responseObj.isShowActiveEmail = true;
                        }
                        if (!(_.get(data, 'personnel_setting.setting_client_notice_ignore') === 'yes')){
                            responseObj.isShowSetClient = true;
                        }
                        resolve(responseObj);
                    }else{
                        responseObj.isShowSetClient = true;
                        responseObj.isShowActiveEmail = true;
                        resolve(responseObj);
                    }
                },
                error: function(eventEmitter, errorObj) {
                    reject(errorObj && errorObj.message);
                }
            });
    });
}


//获取是否需要展示激活邮箱提示
exports.getShowActiveEmailObj = function(req, res) {
    var emitter = new EventEmitter();
    getUserInfoEmail(req, res).then((data) => {
        var responseObj = {
            isShowActiveEmail: false,//是否展示激活邮箱的提示
            isShowAddEmail: false,//是否展示添加邮箱的提示，不能仅用是否有email字段进行判断，原因是如果数据获取慢的时候，也会在页面上展示出添加邮箱的提示
            isShowSetClient: false,//是否展示设置坐席号的提示
        };
        //有邮箱
        if (data.email) {
            responseObj.email = data.email;
            //有邮箱且邮箱未激活
            if (!data.email_enable) {
                //获取个人配置
                getWebsiteConfig(req, res, responseObj).then((responseObj) => {
                    emitter.emit('success', responseObj);
                }).catch((errorMsg) => {
                    emitter.emit('error', errorMsg);
                });
            } else {
                //有邮箱且邮箱已经激活，不提示
                emitter.emit('success', responseObj);
            }
        } else {
            //用户没有邮箱，提示添加邮箱
            responseObj.isShowAddEmail = true;
            emitter.emit('success', responseObj);
        }
    }).catch(function(errorMsg) {
        emitter.emit('error', errorMsg);
    });
    return emitter;

};

//对网站进行个性化设置
exports.setWebsiteConfig = function(req, res ,reqObj) {
    return restUtil.authRest.post(
        {
            url: restApis.websiteConfig,
            req: req,
            res: res
        }, reqObj);
};

//获取回访列表
exports.getCallBack = function(req, res, params, filterObj, queryObj) {
    let url = params.type === 'manager' ? restApis.managerCallRcordListUrl : restApis.callRecordListUrl;
    delete params.type;
    let paramsKeyArray = Object.keys(params);
    for (let i = 0; i < paramsKeyArray.length; i++) {
        url = url.replace(':' + paramsKeyArray[i], params[paramsKeyArray]);
    }
    if (queryObj) {
        url += '?';
        if (queryObj.id) {
            url += querystring.stringify({id: queryObj.id, filter_phone: queryObj.filter_phone, filter_invalid_phone: queryObj.filter_phone}); // 是否过滤114电话号码和无效的电话号码（客服电话）
        } else {
            url += querystring.stringify({filter_phone: queryObj.filter_phone, filter_invalid_phone: queryObj.filter_phone}); // 是否过滤114电话号码和无效的电话号码（客服电话）
        }   
    }

    return restUtil.authRest.post(
        {
            url: url,
            req: req,
            res: res
        }, filterObj);
};
