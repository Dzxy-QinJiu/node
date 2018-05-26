import AppUserAjax from '../../ajax/app-user-ajax';
class UserDetailAddAppActions {
    constructor() {
        this.generateActions(
            'turnStep',
            'resetState',
            'setSelectedApps',
            'showSelectedAppsError',
            'hideSubmitTip',
            'noSelectRoleError', // 添加应用时，没有选择角色的错误提示
            'someAppsNoSelectRoleError', // 添加多个应用时，有应用没有选择角色的错误提示
            //保存应用的特殊配置
            "saveAppsSetting",
            //将应用的特殊配置同步到全局配置
            "syncCustomAppSettingToGlobalSetting"
        );
    }
    getCurrentRealmApps() {
        this.dispatch({loading: true});
        AppUserAjax.getApps().then((list) => {
            this.dispatch({list: list});
        },() => {
            this.dispatch({error: true});
        });
    }
    addUserApps(submitData,successCallback) {
        this.dispatch({error: false , loading: true});
        AppUserAjax.addApp(submitData).then((apps) => {
            this.dispatch({error: false , apps: apps});
            _.isFunction(successCallback) && successCallback(apps);
        } , (errorMsg) => {
            this.dispatch({error: true , errorMsg: errorMsg});
        });
    }
}

export default alt.createActions(UserDetailAddAppActions);