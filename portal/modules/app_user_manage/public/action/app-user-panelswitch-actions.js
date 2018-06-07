/**
 * 应用用户的右侧面板切换的action
 */
function AppUserPanelSwitchActions() {
    this.generateActions(
        //添加应用
        'switchToAddAppPanel',
        'cancelAddAppPanel',
        'submitAddAppPanel',
        //修改应用
        'switchToEditAppPanel',
        'cancelEditAppPanel',
        'submitEditAppPanel',
        // 第三方应用配置
        'switchToThirdAppPanel',
        //重置
        'resetState'
    );
}

module.exports = alt.createActions(AppUserPanelSwitchActions);