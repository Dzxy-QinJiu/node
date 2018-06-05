var AppUserUtil = require('../util/app-user-util');
var AppUserPanelSwitchActions = require('../action/app-user-panelswitch-actions');

//用户管理右侧面板切换使用的store
function AppUserPanelSwitchStore() {
    //初始化state数据
    this.resetState();
    //绑定action
    this.bindActions(AppUserPanelSwitchActions);
}

//初始化数据
AppUserPanelSwitchStore.prototype.resetState = function() {
    //默认是基本资料
    this.panel_switch_currentView = '';
    //添加应用的数据
    this.panel_switch_appToAdd = null;
    //修改应用的数据
    this.panel_switch_appToEdit = null;
    // 第三方应用的信息
    this.thirdApp = {
        userId: '',
        appId: ''
    };
};

//切换到添加应用面板
AppUserPanelSwitchStore.prototype.switchToAddAppPanel = function() {
    this.panel_switch_currentView = 'app';
};
//取消添加应用
AppUserPanelSwitchStore.prototype.cancelAddAppPanel = function() {
    this.panel_switch_currentView = '';
    this.panel_switch_appToAdd = null;
};
//切换到第三方应用面板
AppUserPanelSwitchStore.prototype.switchToThirdAppPanel = function(thirdObj) {
    this.panel_switch_currentView = 'thirdapp';
    this.thirdApp = thirdObj;
};
//提交添加应用
AppUserPanelSwitchStore.prototype.submitAddAppPanel = function(appInfo) {
    this.panel_switch_appToAdd = appInfo;
};

//切换到单个应用编辑
AppUserPanelSwitchStore.prototype.switchToEditAppPanel = function(app) {
    this.panel_switch_currentView = 'editapp';
    this.panel_switch_appToEdit = app;
};
//取消单个应用编辑
AppUserPanelSwitchStore.prototype.cancelEditAppPanel = function() {
    this.panel_switch_currentView = '';
    this.panel_switch_appToEdit = null;
};
//提交单个应用编辑
AppUserPanelSwitchStore.prototype.submitEditAppPanel = function(appInfo) {
    this.panel_switch_appToEdit = appInfo;
};

//使用alt导出store
module.exports = alt.createStore(AppUserPanelSwitchStore , 'AppUserPanelSwitchStore');