/**
 * Created by wangliping on 2016/2/22.
 * 应用实体
 */
var _ = require('lodash');

exports.toFrontSalesCustomer = function(data) {
    var salesCustomer = {};
    if (data && _.isObject(data)) {
        salesCustomer.salesRole = data.type;
        salesCustomer.saleStageList = data.stage_list;
        salesCustomer.salesCustomerList = [];
        if (_.isArray(data.result) && data.result.length > 0) {
            salesCustomer.salesCustomerList = data.result.map(function(saleObj) {
                var stageList = [];
                if (saleObj && _.isArray(saleObj.sale_stage_views) && saleObj.sale_stage_views.length > 0) {
                    stageList = saleObj.sale_stage_views.map(function(stage) {
                        return {
                            stage: stage.sales_stage_name || '',//销售阶段
                            customerCount: stage.sales_stage_count || 0//客户数
                        };
                    });
                }
                return {
                    salesName: saleObj.name,//销售（团队）
                    saleStages: stageList,//销售阶段-客户数 列表
                    totalCount: saleObj.customer_num//各阶段客户数总计
                };
            });
        }
    }
    return salesCustomer;
};


exports.toFrontSalesUser = function(data) {
    var salesUser = {};
    if (data && _.isObject(data)) {
        salesUser.salesRole = data.type;
        salesUser.salesUserList = [];
        if (_.isArray(data.result) && data.result.length > 0) {
            salesUser.salesUserList = data.result.map(function(saleObj) {
                var appList = [];
                if (saleObj && _.isArray(saleObj.application_views) && saleObj.application_views.length > 0) {
                    appList = saleObj.application_views.map(function(app) {
                        return {
                            appName: app.app_name || '',//应用名称
                            newFormalUser: app.official_num || 0,//新增正式用户
                            newTryUser: app.trial_num || 0,//新增试用用户
                            newTotalUser: (app.official_num || 0) + (app.trial_num || 0)//新增用户的统计
                        };
                    });
                }
                return {
                    salesName: saleObj.name,//销售（团队）
                    appList: appList//销售阶段-客户数 列表
                };
            });
        }
    }

    return salesUser;
};

exports.toFrontSalesPhone = function(data) {
    var salesPhone = {};
    if (data && _.isObject(data)) {
        salesPhone.salesRole = data.type;
        salesPhone.salesPhoneList = [];
        if (_.isArray(data.result) && data.result.length > 0) {
            salesPhone.salesPhoneList = data.result.map(function(salesObj) {
                return {
                    salesName: salesObj.name,//销售名称
                    totalTime: salesObj.total_time,//总时长
                    totalAnswer: salesObj.total_num,//总接通数
                    averageTime: parseInt(salesObj.average_time),//日均时长
                    averageAnswer: parseInt(salesObj.average_num),//日均接通数
                    callinCount: salesObj.total_callin,//呼入次数
                    callinSuccess: salesObj.total_callin_success,//成功呼入
                    callinRate: salesObj.callin_rate,//呼入接通率
                    calloutCount: salesObj.total_callout,//呼出次数
                    calloutSuccess: salesObj.total_callout_success,//成功呼出
                    calloutRate: salesObj.callout_rate,//呼出接通率
                    effectiveCount: salesObj.total_effective,//有效接通数
                    effectiveTime: salesObj.total_effective_time,//有效通话时长
                };
            });
        }
    }
    return salesPhone;
};

//传向前端的过期用户数据
exports.toFrontExpireUser = function(data) {
    var expireUser = {};
    if (_.isObject(data)) {
        _.each(data, function(userLists, timeRange) {
            if (userLists.length !== 0) {
                expireUser[timeRange] = [];
                _.each(userLists, function(userItem) {
                    //非半年的时间类型（今天，本周，本月）只展示试用用户的数量
                    if (timeRange !== 'half_year' && userItem.users.trial) {
                        userItem.user_type = '试用用户';
                        userItem.trialNum = userItem.users.trial;
                        expireUser[timeRange].push(userItem);
                    } else if (timeRange === 'half_year' && userItem.users.formal) {
                        //半年的时间类型只展示正式用户的数量
                        userItem.user_type = '正式用户';
                        userItem.formalNum = userItem.users.formal;
                        expireUser[timeRange].push(userItem);
                    }
                });
            }
        });
        return expireUser;
    }

};
