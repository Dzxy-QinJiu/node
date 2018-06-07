/**
 * Created by wangliping on 2016/4/20.
 */
var AppFormActions = require('../action/app-form-actions');

var SUCCESS = 'success';
function AppFormStore() {
    //是否正在保存应用
    this.isSaving = false;
    //是否保存成功,error:失败，success:成功
    this.saveResult = '';
    //保存后的提示信息
    this.saveMsg = '';
    //是否是应用权限编辑界面
    this.isEditAppAuth = false;
    //是否正在获取管理员列表
    this.isLoadingManagerList = false;
    //应用管理员列表
    this.appManagerList = [];
    //是否正在获取应用列表
    this.isLoadingAllAppList = false;
    //应用列表
    this.allAppList = [];

    this.bindActions(AppFormActions);
}
//设置是否正在获取成员列表
AppFormStore.prototype.setManagerListLoading = function(flag) {
    this.isLoadingManagerList = flag;
};
//获取成员列表
AppFormStore.prototype.getAppManagerList = function(managerList) {
    this.isLoadingManagerList = false;
    if (_.isArray(managerList) && managerList.length > 0) {
        this.appManagerList = managerList;
    } else {
        this.appManagerList = [];
    }
};

//设置是否正在获取应用列表
AppFormStore.prototype.setAllAppListLoading = function(flag) {
    this.isLoadingAllAppList = flag;
};

//获取所有APP列表
AppFormStore.prototype.getAllAppList = function(appList) {
    this.isLoadingAllAppList = false;
    if (_.isArray(appList) && appList.length > 0) {
        this.allAppList = appList.map(function(app) {
            return {id: app.app_id, name: app.app_name};
        });
    } else {
        this.allAppList = [];
    }
};

AppFormStore.prototype.setEditAppAuthFlag = function(flag) {
    this.isEditAppAuth = flag;
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
    if (this.saveResult == SUCCESS) {
        this.isEditAppAuth = false;
    }
    this.saveMsg = '';
    this.saveResult = '';
};
module.exports = alt.createStore(AppFormStore, 'MyAppFormStore');

