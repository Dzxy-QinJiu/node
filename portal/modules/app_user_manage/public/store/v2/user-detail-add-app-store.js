import UserDetailAddAppActions from '../../action/v2/user-detail-add-app-actions';
import AppUserPanelSwitchAction from '../../action/app-user-panelswitch-actions';
import AppUserDetailAction from '../../action/app-user-detail-actions';
import UserData from '../../../../../public/sources/user-data';
import AppUserDetailStore from '../../store/app-user-detail-store';
import DateSelectorUtils from '../../../../../components/date-selector/utils';
import AppUserUtils from '../../util/app-user-util';

class UserDetailAddAppStore {
    constructor(){
        this.resetState();
        this.bindActions(UserDetailAddAppActions);
    }
    //重置store的值
    resetState() {
        //当前处在第一步 ， 用来控制上一步，下一步  Carousel使用
        this.step = 0;
        //上一步还是下一步，Carousel使用
        this.stepDirection = 'next';
        //获取安全域下的所有应用，是否在加载中
        this.currentRealmAppsResult = 'loading';
        //当前安全域下的应用列表
        this.currentRealmApps = [];
        //第三步应用的特殊配置，保存在这个map里
        this.appsSetting = {};
        //时间
        var timeObj = DateSelectorUtils.getHalfAMonthTime();
        //表单数据
        this.formData = {
            //正式、试用
            user_type : AppUserUtils.USER_TYPE_VALUE_MAP.TRIAL_USER,
            //开始时间
            start_time : DateSelectorUtils.getMilliseconds(timeObj.start_time),
            //结束时间
            end_time : DateSelectorUtils.getMilliseconds(timeObj.end_time),
            //开通周期
            range : "0.5m",
            //到期停用
            over_draft : "1",
            //二步认证
            is_two_factor : "0",
            //多人登录
            multilogin:"0"
        };
        //选中的应用列表的数组
        this.selectedApps = [];
        //是否显示至少选择一个应用
        this.isSelectedAppsError = false;
        // 添加应用时，没有选择角色的错误提示
        this.appSelectRoleError = false;
        //提交结果
        this.submitResult = '';
        //提交错误信息
        this.submitErrorMsg = '';
        //提交人
        this.operator = UserData.getUserData().nick_name;
    }
    //上一步、下一步
    turnStep(direction) {
        this.stepDirection = direction;
        if(direction === 'next') {
            this.step++;
        } else {
            this.step--;
        }
    }
    //获取当前安全域下的应用
    getCurrentRealmApps(result) {
        if(result.loading) {
            this.currentRealmAppsResult = 'loading';
        } else if(result.error){
            this.currentRealmAppsResult = 'error';
        } else {
            this.currentRealmAppsResult = '';
            let resultList = result.list;
            if(!_.isArray(resultList) || !resultList[0]) {
                resultList = [];
            }
            //用户详情对象
            const detailUser = AppUserDetailStore.getState().initialUser || {};
            //已经开通的应用
            const existApps = detailUser.apps || [];
            //已经选中的应用的map，用来过滤
            var selected_map = _.groupBy(existApps , 'app_id');
            //去掉用户已经拥有的应用
            this.currentRealmApps = _.filter(resultList , function(app) {
                if(!selected_map[app.app_id]) {
                    return true;
                }
            });
        }
    }
    //选中的应用列表发生变化
    setSelectedApps(apps) {
        this.selectedApps = apps;
        if(_.isArray(this.selectedApps) && this.selectedApps[0]) {
            this.isSelectedAppsError = false;
        } else {
            this.isSelectedAppsError = true;
        }
    }
    //显示选中的应用错误
    showSelectedAppsError() {
        this.isSelectedAppsError = true;
    }
    //为用户添加应用
    addUserApps(result) {
        if(result.error) {
            this.submitResult = "error";
            this.submitErrorMsg = result.errorMsg;
        } else {
            this.submitErrorMsg = "";
            if(result.loading) {
                this.submitResult = "loading";
            } else {
                this.submitResult = "success";
                setTimeout(() => {
                    this.resetState();
                    AppUserPanelSwitchAction.resetState();
                    AppUserDetailAction.addAppSuccess(result.apps);
                } , 500);
            }
        }
    }
    //隐藏添加应用提示
    hideSubmitTip() {
        this.submitResult = '';
    }
    //保存各个应用的特殊配置
    saveAppsSetting(appsSetting) {
        this.appsSetting = appsSetting;
    }
    //将应用的特殊设置同步到全局设置
    syncCustomAppSettingToGlobalSetting() {
        const app_id = _.keys(this.appsSetting)[0];
        const appInfo = this.appsSetting[app_id];
        //将特殊配置置成false
        appInfo.time.setted = false;
        appInfo.over_draft.setted = false;
        appInfo.is_two_factor.setted = false;

        const syncAppInfo = {};
        //开通周期
        syncAppInfo.start_time = appInfo.time.start_time;
        syncAppInfo.end_time = appInfo.time.end_time;
        syncAppInfo.range = appInfo.time.range;
        //到期停用
        syncAppInfo.over_draft = appInfo.over_draft.value;
        //二步认证
        syncAppInfo.is_two_factor = appInfo.is_two_factor.value;
        //多人登录
        syncAppInfo.multilogin = appInfo.multilogin.value;
        //通用配置
        const formData = this.formData;
        //开始时间
        formData.start_time = syncAppInfo.start_time;
        //结束时间
        formData.end_time = syncAppInfo.end_time;
        //范围
        formData.range = syncAppInfo.range;
        //到期停用
        formData.over_draft = syncAppInfo.over_draft;
        //二步认证
        formData.is_two_factor = syncAppInfo.is_two_factor;
        //多人登录
        formData.multilogin = syncAppInfo.multilogin;
    }
    // 添加应用时，没有选择角色的错误提示
    noSelectRoleError(error) {
        this.appSelectRoleError = error;
    }
    // 添加多个应用时，有应用没有选择角色的错误提示
    someAppsNoSelectRoleError(error) {
        this.submitResult = "selectRoleError";
        this.submitErrorMsg = error;
    }
}

//使用alt导出store
export default alt.createStore(UserDetailAddAppStore , "UserDetailAddAppStoreV2");