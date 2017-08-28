var AppUserUtil = require("../util/app-user-util");
import UserDetailEditAppActions from "../action/user-detail-edit-app-actions";
var userData = require("../../../../public/sources/user-data");
var AppUserPanelSwitchAction = require("../action/app-user-panelswitch-actions");
var AppUserDetailAction = require("../action/app-user-detail-actions");
var AppUserAction = require("../action/app-user-actions");

//用户详情修改应用的store
function UserDetailEditAppStore() {
    //初始化state数据
    this.resetState();
    //绑定action
    this.bindActions(UserDetailEditAppActions);
}

var FORMAT = oplateConsts.DATE_FORMAT;

//重置store的值
UserDetailEditAppStore.prototype.resetState = function() {

    //默认选中一年的数据
    var range = 12;
    var end_time = moment().add(12,'month').format(FORMAT);
    var start_time = moment().format(FORMAT);

    //子菜单类型
    this.subType = 'grant_application';
    //表单字段
    this.formData = {
        //选中的应用列表
        selected_apps : [],
        //开户类型
        user_type : "1",
        //开通周期
        range : "12",
        //开通时间
        start_time : start_time,
        //到期时间
        end_time : end_time,
        //到期停用
        over_draft : "1",
        //账号状态
        user_status : "1",
    };
    //提交状态("",success,error,loading)
    this.submitResult = '';
    //错误提示
    this.submitErrorMsg = '';
    //显示app错误信息
    this.show_app_error = false;
    //显示用户类型错误
    this.show_user_type_error = false;
};
//显示用户类型错误
UserDetailEditAppStore.prototype.showUserTypeError = function() {
    this.show_user_type_error = true;
};
//隐藏用户类型错误
UserDetailEditAppStore.prototype.hideUserTypeError = function() {
    this.show_user_type_error = false;
};
//修改应用
UserDetailEditAppStore.prototype.submitEditApp = function(result) {
    var _this = this;
    if(result.error) {
        this.submitResult = "error";
        this.submitErrorMsg = result.errorMsg;
    } else {
        this.submitErrorMsg = "";
        if(result.loading) {
            this.submitResult = "loading";
        } else {
            this.submitResult = "success";
            setTimeout(function() {
                _this.resetState();
                if(result.multiple) {
                    AppUserAction.closeRightPanel();
                } else {
                    AppUserPanelSwitchAction.resetState();
                    AppUserDetailAction.editAppSuccess(result.app);
                }
            } , 500);
        }
    }
};
//切换type
UserDetailEditAppStore.prototype.changeSubType = function(type) {
    this.subType = type;
};
//更改时间
UserDetailEditAppStore.prototype.timeChange = function({field,date}) {
    var dateStr = moment(date).format(FORMAT);
    this.formData[field] = dateStr;
    if(/^\d+$/.test(this.formData.range)) {
        if(field === 'start_time') {
            this.formData.end_time = moment(date).add(this.formData.range , 'month').format(FORMAT);
        } else {
            this.formData.start_time = moment(date).subtract(this.formData.range,'month').format(FORMAT);
        }
    }
};
//设置表单的默认值
UserDetailEditAppStore.prototype.setEditAppDefaultValue = function(appInfo) {
    //将appInfo保存到formData的selectedApp
    this.formData.selected_apps = [appInfo];
    this.formData.user_status = (appInfo.is_disabled === true || appInfo.is_disabled === 'true') ? '0':'1' ;
    this.formData.user_type = appInfo.account_type;
    if(appInfo.end_time === '0' || appInfo.end_time === 0) {
        this.formData.start_time = Intl.get("common.time.forever", "永久");
        this.formData.end_time = Intl.get("common.time.forever", "永久");
        this.formData.range = 'forever';
    } else {
        var startMoment = moment(new Date(+appInfo.start_time));
        var endMoment = moment(new Date(+appInfo.end_time));
        startMoment.hours(0).minutes(0).seconds(0).milliseconds(0);
        endMoment.hours(0).minutes(0).seconds(0).milliseconds(0);
        this.formData.start_time = startMoment.format(FORMAT);
        this.formData.end_time = endMoment.format(FORMAT);
        var range = endMoment.diff(startMoment , "months") + '';
        if(["1","6","12"].indexOf(range) >= 0) {
            this.formData.range = range;
        } else {
            this.formData.range = 'custom';
        }
    }
    if(/^[01]$/.test(appInfo.over_draft + '') ) {
        this.formData.over_draft = appInfo.over_draft;
    }
};
//设置选中的应用
UserDetailEditAppStore.prototype.setSelectedApps = function(selected_apps) {
    this.formData.selected_apps = selected_apps;
    if(_.isArray(selected_apps) && selected_apps[0] && selected_apps[0].roles && selected_apps[0].roles.length) {
        this.show_app_error = false;
    }
};
//更改radio的值
UserDetailEditAppStore.prototype.customRadioValueChange = function({field,value}) {
    if(field === 'range') {
        var oldRange = this.formData.range;
        var newRange = value;
        if(newRange === 'forever') {
            this.formData.start_time = this.formData.end_time = Intl.get("common.time.forever", "永久");
        } else if(newRange === 'custom') {
            var now = moment().format(FORMAT);
            if(this.formData.start_time ===Intl.get("common.time.forever", "永久")) {
                this.formData.start_time = now;
            }
            if(this.formData.end_time ===Intl.get("common.time.forever", "永久")) {
                this.formData.end_time = moment().add("1","year").format(FORMAT);
            }
        } else {
            var start_time = moment().format(FORMAT);
            var end_time = moment().add(newRange,"month").format(FORMAT);
            this.formData.start_time = start_time;
            this.formData.end_time = end_time;
        }
        this.formData.range = newRange;
    } else {
        this.formData[field] = value;
    }
};

//更改radio的值
UserDetailEditAppStore.prototype.radioValueChange = function({field,value}) {
    this.formData[field] = value;
};

//隐藏提交提示
UserDetailEditAppStore.prototype.hideSubmitTip = function() {
    this.submitResult = '';
};

//显示app错误提示
UserDetailEditAppStore.prototype.showAppError = function() {
    this.show_app_error = true;
};

//使用alt导出store
module.exports = alt.createStore(UserDetailEditAppStore , 'UserDetailEditAppStore');