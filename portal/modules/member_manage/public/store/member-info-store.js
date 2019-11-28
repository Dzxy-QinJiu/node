/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/4/11.
 */
import MemberInfoActions from '../action/member-info-action';

const CONSTANTS = {
    LOG_PAGE_SIZE: 11//个人操作日志一页展示的条数
};
function MemberInfoStore() {
    this.setInitialData();
    this.bindActions(MemberInfoActions);
}

//关闭右侧详情后，将数据置为
MemberInfoStore.prototype.setInitialData = function() {
    //是否展示确认删除的模态框
    this.modalDialogShow = false;
    //销售提成和提成比例
    this.saleGoalsAndCommissionRadio = {};
    //加载操作日志中。。。
    this.logIsLoading = false;
    //获取操作日志失败的提示信息
    this.getLogErrorMsg = '';
    //用户的个人日志
    this.logList = [];
    //个人日志总数
    this.logTotal = 0;
    //个人日志展示第几页
    this.logNum = 1;
    this.getUserDetailError = '';
    this.page_size = CONSTANTS.LOG_PAGE_SIZE;
    //是否监听下拉加载的标识
    this.listenScrollBottom = true;
};
MemberInfoStore.prototype.changeLogNum = function(num) {
    this.logNum = num;
};
MemberInfoStore.prototype.getSalesGoals = function(result) {
    if (!result.loading && !result.error) {
        this.saleGoalsAndCommissionRadio = result.data;
    }
};
MemberInfoStore.prototype.showModalDialog = function() {
    this.modalDialogShow = true;
};

MemberInfoStore.prototype.hideModalDialog = function() {
    this.modalDialogShow = false;
};
MemberInfoStore.prototype.setLogLoading = function(loadingState) {
    this.logIsLoading = loadingState;
    if (loadingState) {
        //重新获取日志时，清空错误提示，重置获取控制翻页的参数
        this.getLogErrorMsg = '';
        this.logNum = 1;
        this.logTotal = 0;
        this.listenScrollBottom = true;
    }
};
MemberInfoStore.prototype.getLogList = function(resObj) {
    this.logIsLoading = false;
    if (_.isString(resObj)) {
        this.getLogErrorMsg = resObj;
    } else {
        this.getLogErrorMsg = '';
        let logListObj = _.get(resObj, 'logListObj');
        this.logTotal = _.get(logListObj, 'total') || 0;
        let list = _.get(logListObj, 'list');
        if (_.isArray(list)) {
            if (this.logNum === 1) {
                this.logList = list;
            } else {
                this.logList = this.logList.concat(list);
            }
            this.logNum++;
        }
        //下拉加载标识
        if (this.logList.length >= this.logTotal) {
            this.listenScrollBottom = false;
        }
    }
};
module.exports = alt.createStore(MemberInfoStore, 'MemberInfoStore');