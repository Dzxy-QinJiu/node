/**
 * Created by wangliping on 2016/4/20.
 */
var AppFormActions = require('../action/app-form-actions');


function AppFormStore() {
    //是否正在保存应用
    this.isSaving = false;
    //是否保存成功,error:失败，success:成功
    this.saveResult = '';
    //保存后的提示信息
    this.saveMsg = '';
    //应用所有者列表
    this.appOwnerList = [];
    //应用管理员
    this.appManagerList = [];
    //所有的应用列表
    this.allAppList = [];
    //是否正在获取所有者列表
    this.isLoadingOwnerList = false;
    //是否正在获取管理员列表
    this.isLoadingManagerList = false;
    //是否正在获取应用列表
    this.isLoadingAllAppList = false;

    this.bindActions(AppFormActions);
}

//设置是否正在获取所有者列表
AppFormStore.prototype.setOwnerListLoading = function(flag) {
    this.isLoadingOwnerList = flag;
};
//设置是否正在获取成员列表
AppFormStore.prototype.setManagerListLoading = function(flag) {
    this.isLoadingManagerList = flag;
};
//设置是否正在获取应用列表
AppFormStore.prototype.setAllAppListLoading = function(flag) {
    this.isLoadingAllAppList = flag;
};

//获取应用所有者列表
AppFormStore.prototype.getAppOwnerList = function(ownerList) {
    this.isLoadingOwnerList = false;
    if (_.isArray(ownerList) && ownerList.length > 0) {
        this.appOwnerList = ownerList;
    } else {
        this.appOwnerList = [];
    }
};
//获取应用管理员列表
AppFormStore.prototype.getAppManagerList = function(managerList) {
    this.isLoadingManagerList = false;
    if (_.isArray(managerList) && managerList.length > 0) {
        this.appManagerList = managerList;
    } else {
        this.appManagerList = [];
    }
};

//获取所有APP列表
AppFormStore.prototype.getAllAppList = function(appListObj) {
    this.isLoadingAllAppList = false;
    var appListData = appListObj.data;
    if (_.isArray(appListData) && appListData.length > 0) {
        this.allAppList = appListData;
    } else {
        this.allAppList = [];
    }
};

//正在保存的属性设置
AppFormStore.prototype.setSaveFlag = function(flag) {
    this.isSaving = flag;
};
//保存后的处理
AppFormStore.prototype.afterSave = function(resultObj) {
    //去掉正在保存的效果
    this.isSaving = false;
    this.saveResult = resultObj.saveResult;
    this.saveMsg = resultObj.saveMsg;
};
//保存后的处理
AppFormStore.prototype.addApp = function(resultObj) {
    this.afterSave(resultObj);
};

//保存后的处理
AppFormStore.prototype.editApp = function(resultObj) {
    this.afterSave(resultObj);
};

//清空保存的提示信息
AppFormStore.prototype.resetSaveResult = function() {
    this.saveMsg = '';
    this.saveResult = '';
};
module.exports = alt.createStore(AppFormStore, 'AppFormStore');

