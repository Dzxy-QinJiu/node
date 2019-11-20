var AppUserUtil = require('../util/app-user-util');
import UserDetailAddAppActions from '../action/user-detail-add-app-actions';
var userData = require('../../../../public/sources/user-data');
var AppUserAction = require('../action/app-user-actions');
var DateSelectorUtils = require('../../../../components/date-selector/utils');

//用户详情添加应用的store
function UserDetailAddAppStore() {
    //初始化state数据
    this.resetState();
    //绑定action
    this.bindActions(UserDetailAddAppActions);
}

UserDetailAddAppStore.prototype.resetState = function() {
    //账号所属人
    this.accountHolder = _.get(userData.getUserData(),'nick_name');
    //选中的应用列表
    this.app_list = [];
    //显示未选择应用的错误提示
    this.show_app_error = false;
    //显示客户的错误提示
    this.show_customer_error = false;
    //提交成功
    this.submitResult = '';
    //错误提示
    this.submitErrorMsg = '';
    //显示选择app的错误提示
    this.show_app_error = false;

    //如果是批量变更的话，具体是做什么变更
    //默认是开通产品
    /*
        开通产品 add-app
        密码修改 change-password
        开通类型 change-account-type
        开通状态 change-status
        开通周期 change-time-range
        申请延期 grant_delay (只有销售有这个，也只能看到这个)
     */
    this.multipleSubType = 'grant_application';

    //表单验证使用
    this.status = {
        password: {},
        repassword: {}
    };

    var timeObj = DateSelectorUtils.getHalfAMonthTime();

    //表单数据
    this.formData = {
        //选中的应用列表'(批量开通新应用)
        selected_apps: [],
        //开户类型
        user_type: AppUserUtil.USER_TYPE_VALUE_MAP.TRIAL_USER,
        //开通周期
        range: '0.5m',
        //开通时间
        start_time: DateSelectorUtils.getMilliseconds(timeObj.start_time),
        //到期时间
        end_time: DateSelectorUtils.getMilliseconds(timeObj.end_time),
        //到期不变
        over_draft: '0',
        //账号状态
        user_status: '1',
        //密码
        password: '',
        //确认密码
        repassword: '',
        //角色
        roles: [],
        // 角色相关的信息
        rolesInfo: [],
        //权限
        permissions: [],
        //要更改的客户对象
        choosen_customer: {
            id: '',
            name: ''
        },
        //要更改的客户对象，对应的销售
        choosen_customer_sales: {
            id: '',
            name: ''
        },
        //延迟时间输入框，默认是1
        delayTimeNumber: 1,
        //延期时间范围，默认是天
        delayTimeRange: 'days',
        // 到期时间(选择到期时间)
        delayDeadlineTime: moment().add(1, 'days').valueOf(),
        //销售申请的备注
        remark: {
            //延期备注
            delayRemark: '',
            //启用、停用备注
            statusRemark: '',
            //修改密码备注
            passwordRemark: ''
        },
        //批量审批选中的应用列表
        batchSelectedApps: [],
        //权限设置的应用
        rolePermissionApp: ''
    };
    //密码强度
    this.passBarShow = false;//是否显示密码强度
    this.passStrength = 'L';//密码强度
    //提交的时候，批量操作没有选择应用，则提示错误
    this.batchSelectedAppError = false;
    // 提交时，批量变更权限设置，若没有选择角色，则提示错误
    this.batchSelectRoleError = '';
    //提交的时候，角色权限没有选择应用，则提示错误
    this.roleSelectedAppError = false;
};

//延期时间改变
UserDetailAddAppStore.prototype.delayTimeChange = function(delayTimeRange) {
    this.formData.delayTimeRange = delayTimeRange;
};

//radio的值改变
UserDetailAddAppStore.prototype.radioValueChange = function({field,value}) {
    this.formData[field] = value;
};
//自定义radio的值改变
UserDetailAddAppStore.prototype.customRadioValueChange = function({field,value}) {
    this.formData[field] = value;
};

//获取应用列表
UserDetailAddAppStore.prototype.getApps = function(result) {
    if(result.error) {
        this.app_list = [];
    } else {
        this.app_list = result.list;
    }
};
//设置选中的应用
UserDetailAddAppStore.prototype.setSelectedApps = function(selected_apps) {
    this.formData.selected_apps = selected_apps;
    if(!selected_apps.length) {
        this.show_app_error = true;
    } else {
        this.show_app_error = false;
    }
};
//设置时间
UserDetailAddAppStore.prototype.timeChange = function({start_time,end_time,range}) {
    this.formData.range = range;
    this.formData.start_time = start_time;
    this.formData.end_time = end_time;
};

//添加用户
UserDetailAddAppStore.prototype.submitAddApp = function(result) {
    var _this = this;
    if(result.error) {
        this.submitResult = 'error';
        this.submitErrorMsg = result.errorMsg;
    } else {
        this.submitErrorMsg = '';
        if(result.loading) {
            this.submitResult = 'loading';
        } else {
            this.submitResult = 'success';
            setTimeout(function() {
                _this.resetState();
                AppUserAction.closeRightPanel();
            } , 500);
        }
    }
};

//延期、开通状态申请（多应用）
UserDetailAddAppStore.prototype.applyDelayMultiApp = function(result) {
    var _this = this;
    if(result.error) {
        this.submitResult = 'error';
        this.submitErrorMsg = result.errorMsg;
    } else {
        this.submitErrorMsg = '';
        if(result.loading) {
            this.submitResult = 'loading';
        } else {
            this.submitResult = 'success';
            setTimeout(function() {
                _this.resetState();
                AppUserAction.closeRightPanel();
            } , 500);
        }
    }
};

//隐藏提交提示
UserDetailAddAppStore.prototype.hideSubmitTip = function() {
    this.submitErrorMsg = '';
    this.submitResult = '';
};
//显示app错误提示
UserDetailAddAppStore.prototype.showAppError = function() {
    this.show_app_error = true;
};
//隐藏app错误提示
UserDetailAddAppStore.prototype.hideAppError = function() {
    this.show_app_error = false;
};

//更换批量操作tab类型
UserDetailAddAppStore.prototype.changeMultipleSubType = function(subType) {
    this.multipleSubType = subType;
};

//批量为用户重新设置客户时，调用此方法
UserDetailAddAppStore.prototype.onCustomerChoosen = function(resultObj) {
    this.formData.choosen_customer = resultObj.customer;
    this.formData.choosen_customer_sales = resultObj.sales;
};

//显示客户错误提示
UserDetailAddAppStore.prototype.showCustomerError = function() {
    this.show_customer_error = true;
};

//隐藏客户错误提示
UserDetailAddAppStore.prototype.hideCustomerError = function() {
    this.show_customer_error = false;
};

//角色权限发生变化
UserDetailAddAppStore.prototype.rolesPermissionsChange = function({roles,permissions,rolesInfo}) {
    this.formData.roles = roles.slice();
    this.formData.permissions = permissions.slice();
    this.formData.rolesInfo = _.clone(rolesInfo);
};

//延期备注改变
UserDetailAddAppStore.prototype.remarkChange = function({field,value}) {
    this.formData.remark[field] = value;
};
//延期时间数字
UserDetailAddAppStore.prototype.delayTimeNumberChange = function(val) {
    this.formData.delayTimeNumber = val;
};
//延期时间范围
UserDetailAddAppStore.prototype.delayTimeRangeChange = function(val) {
    this.formData.delayTimeRange = val;
};

// 将延期时间设置为截止时间（具体到xx年xx月xx日）
UserDetailAddAppStore.prototype.setDelayDeadlineTime = function(val) {
    this.formData.delayDeadlineTime = val;
};

//批量操作的应用改变
UserDetailAddAppStore.prototype.batchAppChange = function(appIds) {
    this.formData.batchSelectedApps = appIds;
    if(appIds.length) {
        this.batchSelectedAppError = false;
    } else {
        this.batchSelectedAppError = Intl.get('user.product.select.please','请选择产品');
    }
    //单独处理权限设置的选中
    //如果刚才选中的权限，在列表中不存在了，则将选中的应用置空，同时清空权限和角色
    if(this.formData.rolePermissionApp && _.indexOf(appIds , this.formData.rolePermissionApp) < 0) {
        this.formData.rolePermissionApp = '';
        this.formData.roles = [];
        this.formData.permissions = [];
    }
};
//设置批量应用选择错误
UserDetailAddAppStore.prototype.setBatchSelectedAppError = function(error) {
    this.batchSelectedAppError = error;
};

//权限设置的应用改变
UserDetailAddAppStore.prototype.rolePermissionAppChange = function(appId) {
    this.formData.rolePermissionApp = appId;
    this.roleSelectedAppError = false;
    this.formData.roles = [];
    this.formData.permissions = [];
};

//设置权限角色设置应用选择错误
UserDetailAddAppStore.prototype.setRolePermissionSelectedAppError = function(error) {
    this.roleSelectedAppError = error;
};

//设置批量操作默认选中的应用
UserDetailAddAppStore.prototype.setDefaultBatchSelectedApps = function(apps) {
    var app_list = _.isArray(apps) ? apps : [];
    this.formData.batchSelectedApps = _.map(app_list , 'app_id');
    this.formData.rolePermissionApp = this.formData.batchSelectedApps[0] || '';
};

// 批量变更权限没有选择角色错误
UserDetailAddAppStore.prototype.batchChangePermissionNoSelectRoleError = function(error) {
    this.batchSelectRoleError = error;
};

//使用alt导出store
module.exports = alt.createStore(UserDetailAddAppStore , 'UserDetailAddAppStore');