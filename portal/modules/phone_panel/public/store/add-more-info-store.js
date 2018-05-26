/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/12.
 */
var addMoreInfoAction = require("../action/add-more-info-action");
function AddMoreInfoStore() {
    //初始化state数据
    this.resetState();
    //绑定action
    this.bindActions(addMoreInfoAction);
}
AddMoreInfoStore.prototype.resetState = function () {
    //正在获取应用列表
    this.isGettingAppLists = false;
    //获取应用列表失败
    this.getAppListsErrMsg = "";
    //应用列表
    this.appLists = [];
};
//获取应用列表
AddMoreInfoStore.prototype.getAppList = function (result) {
    if (result.loading){
        this.isGettingAppLists = true;
        this.getAppListsErrMsg = "";
        this.appLists = [];
    }else if (result.error){
        this.getAppListsErrMsg = result.errMsg;
        this.isGettingAppLists = false;
        this.appLists = [];
    }else {
        this.isGettingAppLists = false;
        this.getAppListsErrMsg = "";
        this.appLists = result.lists;
    }
};
module.exports = alt.createStore(AddMoreInfoStore , 'AddMoreInfoStore');