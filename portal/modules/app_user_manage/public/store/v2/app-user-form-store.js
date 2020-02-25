import AppUserFormActions from '../../action/v2/app-user-form-actions';
import AppUserUtil from '../../util/app-user-util';
import UserData from '../../../../../public/sources/user-data';
import {getHalfAMonthTime,getMilliseconds, getMillisecondsYesterdayEnd} from 'CMP_DIR/date-selector/utils';
import DateSelectorPicker from 'CMP_DIR/date-selector/utils';
class AppUserFormStore {
    constructor(){
        this.resetState();
        this.bindActions(AppUserFormActions);
    }
    //重置store的值
    resetState() {
        //当前处在第一步 ， 用来控制上一步，下一步  Carousel使用
        this.step = 0;
        //上一步还是下一步，Carousel使用
        this.stepDirection = 'next';
        //当前安全域下的应用列表
        this.currentRealmApps = [];
        //选中的组织
        this.organization = '';
        //应用列表获取状态
        this.currentRealmAppsResult = 'loading';
        //第三步应用的特殊配置，保存在这个map里
        this.appsSetting = {};
        this.appsDefaultSetting = {}; // 应用的默认配置
        //时间
        var timeObj = getHalfAMonthTime();
        //表单数据
        this.formData = {
            //用户名
            user_name: '',
            //昵称
            nick_name: '',
            //邮箱
            email: '',
            //手机号
            phone: '',
            //个数
            count_number: '1',
            //客户id
            customer_id: '',
            //客户名
            customer_name: '',
            //销售团队
            sales_team: {
                id: '',
                name: ''
            },
            //销售
            sales: {
                id: '',
                name: ''
            },
            //正式、试用
            user_type: AppUserUtil.USER_TYPE_VALUE_MAP.TRIAL_USER,
            //开始时间
            start_time: getMilliseconds(timeObj.start_time),
            //结束时间
            end_time: getMillisecondsYesterdayEnd(getMilliseconds(timeObj.end_time)),
            //多人登录
            multilogin: '0',
            //开通周期 默认选中半个月
            range: '0.5m',
            //到期停用，默认不变， '0':不变，'1': 停用，'2': 降级
            over_draft: '0',
            //二步认证
            is_two_factor: '0',
            //备注
            description: ''
        };
        //表单校验
        this.status = {
            //用户名
            user_name: {},
            //邮箱
            email: {},
            //手机号
            phone: {},
            //昵称
            nick_name: {}
        };
        //是否需要显示客户的错误提示
        this.isShowCustomerError = false;
        // 是否显示开通时间的错误提示， 默认为false
        this.isShowOpenTimeErrorTips = false;
        //选中的应用列表的数组
        this.selectedApps = [];
        //是否显示至少选择一个应用
        this.isSelectedAppsError = false;
        // 添加应用时，没有选择角色的错误提示
        this.appSelectRoleError = '';
        //提交结果
        this.submitResult = '';
        //提交错误信息
        this.submitErrorMsg = '';
        //提交人
        this.operator = _.get(UserData.getUserData(),'nick_name');
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
    //显示客户错误提示，当客户输入框有值，但是没选中的时候为true
    showCustomerError() {
        this.isShowCustomerError = true;
    }
    //隐藏客户错误提示
    hideCustomerError() {
        this.isShowCustomerError = false;
    }
    //选中客户的回调
    customerChoosen(resultObj) {
        this.formData.sales_team = {
            id: _.get(resultObj,'sales_team.id',''),
            name: _.get(resultObj,'sales_team.name','')
        };
        this.formData.sales = {
            id: _.get(resultObj,'sales.id',''),
            name: _.get(resultObj,'sales.name','')
        };
        this.formData.customer_name = _.get(resultObj,'customer.name','');
        this.formData.customer_id = _.get(resultObj,'customer.id','');
    }
    //获取当前安全域下的应用
    getCurrentRealmApps(result) {
        this.currentRealmAppsResult = result.loading ? 'loading' : (result.error ? 'error' : '');
        let resultList = result.list;
        if(!_.isArray(resultList) || !resultList[0]) {
            resultList = [];
        }
        this.currentRealmApps = _.filter(resultList, app => app.status);
    }
    setSelectedOrganization(organization) {
        this.organization = organization;
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
    // 获取所选应用的默认配置信息
    getSelectedAppsDefault(appsDefaultConfig) {
        if (!_.isEmpty(appsDefaultConfig)) {
            let appIds = _.get(appsDefaultConfig, 'appIds');
            let dataList = _.get(appsDefaultConfig, 'dataList'); // 应用的默认配置
            _.each(appIds, appId => {
                const formData = this.formData;
                let userType = _.get(formData, 'user_type');
                //找到该应用对应用户类型的配置信息
                let defaultConfig = _.find(dataList, data => data.client_id === appId && userType === data.user_type);
                if (defaultConfig) {
                    this.appsDefaultSetting[appId] = {
                        time: {
                            start_time: DateSelectorPicker.getMilliseconds(moment().format(oplateConsts.DATE_FORMAT)),
                            end_time: DateSelectorPicker.getMilliseconds(moment().format(oplateConsts.DATE_FORMAT)) + defaultConfig.valid_period,
                            range: DateSelectorPicker.getDateRange(defaultConfig.valid_period),
                        },
                        over_draft: defaultConfig.over_draft,
                        is_two_factor: defaultConfig.is_two_factor,
                        multilogin: defaultConfig.mutilogin
                    };
                }
            });

        }
    }
    
    //显示选中的应用错误
    showSelectedAppsError() {
        this.isSelectedAppsError = true;
    }
    //添加用户
    addAppUser(result) {
        if(result.error) {
            this.submitResult = 'error';
            this.submitErrorMsg = result.errorMsg;
        } else {
            this.submitErrorMsg = '';
            if(result.loading) {
                this.submitResult = 'loading';
            } else {
                this.submitResult = 'success';
            }
        }
    }
    //隐藏添加用户成功提示
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
        appInfo.multilogin.setted = false;

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
        this.submitResult = 'selectRoleError';
        this.submitErrorMsg = error;
    }
    // 开通时间的错误提示
    showOpenTimeErrorTips(flag) {
        this.isShowOpenTimeErrorTips = flag;
    }
}

//使用alt导出store
export default alt.createStore(AppUserFormStore , 'AppUserFormStoreV2');