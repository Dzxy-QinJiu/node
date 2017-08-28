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
    editUserApps(submitData,successCallback) {
        this.dispatch({error : false , loading:true});
        AppUserAjax.editApp(submitData).then((apps) => {
            this.dispatch({error : false , apps:apps});
            _.isFunction(successCallback) && successCallback(apps);
        } , (errorMsg) => {
            this.dispatch({error : true , errorMsg : errorMsg});
        });
    }
}

export default alt.createActions(UserDetailEditAppActions);