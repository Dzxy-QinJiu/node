/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/4/11.
 */
var UserInfoActions = require("../action/user-info-action");
var CONSTANTS = {
    LOG_PAGE_SIZE: 11//个人操作日志一页展示的条数
};
function UserInfoStore() {
    this.setInitialData();
    this.bindActions(UserInfoActions);
}

//关闭右侧详情后，将数据置为
UserInfoStore.prototype.setInitialData = function() {
    //是否展示确认删除的模态框
    this.modalDialogShow = false;
    //销售提成和提成比例
    this.saleGoalsAndCommissionRadio = {};
    //加载操作日志中。。。
    this.logIsLoading = false;
    //获取操作日志失败的提示信息
    this.getLogErrorMsg = "";
    //用户的个人日志
    this.logList = [];
    //个人日志总数
    this.logTotal = 0;
    //个人日志展示第几页
    this.logNum = 1;
    this.getUserDetailError = "";
    this.page_size = CONSTANTS.LOG_PAGE_SIZE;
};
UserInfoStore.prototype.changeLogNum = function(num) {
    this.logNum = num;
};
UserInfoStore.prototype.getSalesGoals = function(result) {
    if (!result.loading && !result.error){
        this.saleGoalsAndCommissionRadio = result.data;
    }
};
UserInfoStore.prototype.showModalDialog = function() {
    this.modalDialogShow = true;
};

UserInfoStore.prototype.hideModalDialog = function() {
    this.modalDialogShow = false;
};
UserInfoStore.prototype.setLogLoading = function(loadingState) {
    this.logIsLoading = loadingState;
    if (loadingState) {
        //重新获取日志时，清空错误提示，重置获取控制翻页的参数
        this.getLogErrorMsg = "";
        this.logNum = 1;
        this.logTotal = 0;
    }
};
UserInfoStore.prototype.getLogList = function(resObj) {
    var logListObj = resObj.logListObj;
    var condition = resObj.condition;
    this.logIsLoading = false;
    if (_.isString(logListObj)) {
        this.getLogErrorMsg = logListObj;
    } else {
        this.getLogErrorMsg = "";
        this.logTotal = logListObj.total || 0;
        var curUserName = condition.user_name;
        if (_.isArray(logListObj.list)) {
            this.logList = logListObj.list.map(function(log) {
                log.userName = curUserName;
                return log;
            });
        }
    }
};
module.exports = alt.createStore(UserInfoStore, 'UserInfoStore');