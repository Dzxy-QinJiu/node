/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/5/11.
 */
var UserDetailChangeRecordAction = require('../action/user-detail-change-record-actions');
function UserDetailChangeRecordStore(){
    //初始化state数据
    this.resetState();
    //绑定action
    this.bindActions(UserDetailChangeRecordAction);
}
UserDetailChangeRecordStore.prototype.resetState = function() {
    this.changeRecord =[];//变更记录展示的列表
    this.changeRecordLoading = true;//是否正在加载变更记录
    this.changeRecordErrMsg = '';//加载错误后的提示信息
    this.page_size = 200;//加载记录每页的条数
    this.app='';//默认显示的app名称
    this.getAppErrorMsg='';//加载app列表出错
    this.getAppLoading = true;//正在加载app列表
    this.appLists = [];//app列表
};
UserDetailChangeRecordStore.prototype.getUserDetailChangeRecord = function (result) {
    if (result.loading){
        this.changeRecordLoading = true;
    } else if (result.error){
        this.changeRecordLoading = false;
        this.changeRecordErrMsg = result.errorMsg || Intl.get('fail.to.get.record','获取用户变更记录失败');
        this.changeRecord = [];
    } else {
        this.changeRecordLoading = false;
        this.changeRecordErrMsg = "";
        this.changeRecord = result.data || [];
    }
};
UserDetailChangeRecordStore.prototype.getUserApp = function (result) {
    if (result.loading){
        this.getAppLoading = true;
    }else if (result.error){
        this.getAppErrorMsg = result.errorMsg;
        this.getAppLoading = false;
    } else {
        this.getAppLoading = false;
        this.getAppErrorMsg = '';
        this.appLists = result.dataObj.data;
        this.app = result.dataObj.app_name;
    }
};
UserDetailChangeRecordStore.prototype.setApp = function (app) {
    this.app = app;
};

//使用alt导出store
module.exports = alt.createStore(UserDetailChangeRecordStore , 'UserDetailChangeRecordStore');