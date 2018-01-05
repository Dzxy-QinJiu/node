import AppUserAjax from '../../ajax/app-user-ajax';
import AppUserUtil from '../../util/app-user-util';
class UserDetailEditAppActions {
    constructor() {
        this.generateActions(
            'resetState',//重置store
            'hideSubmitTip',//隐藏提交提示信息
            'setInitialData'//设置表单初始值
        );
    }
    editUserApps(submitData, changeAppInfo, successCallback) {
        this.dispatch({error : false , loading:true});
        AppUserAjax.editApp(submitData).then((flag) => {
            this.dispatch({error : false , apps: [changeAppInfo]});
            _.isFunction(successCallback) && successCallback([changeAppInfo]);
        } , (errorMsg) => {
            this.dispatch({error : true , errorMsg : errorMsg});
        });
    }
}

export default alt.createActions(UserDetailEditAppActions);