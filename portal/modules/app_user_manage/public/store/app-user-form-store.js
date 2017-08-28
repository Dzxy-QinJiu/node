var AppUserUtil = require("../util/app-user-util");
import AppUserFormActions from "../action/app-user-form-actions";
var userData = require("../../../../public/sources/user-data");


//app用户详情的store
function AppUserFormStore() {
    //初始化state数据
    this.resetState();
    //绑定action
    this.bindActions(AppUserFormActions);
}

const FORMAT = oplateConsts.DATE_FORMAT;

AppUserFormStore.prototype.resetState = function() {

    var range = 12;

    var end_time = moment().add(12,'month').format(FORMAT);
    var start_time = moment().format(FORMAT);

    this.accountHolder =  userData.getUserData().nick_name;

    this.app_list = [];

    //提交成功
    this.submitResult = "";
    //错误提示
    this.submitErrorMsg = '';

    //显示选择app的错误提示
    this.show_app_error = false;
    //显示选择客户的错误
    this.show_customer_error = false;
    //表单数据
    this.formData = {
        //用户名
        user_name : "",
        //选中的应用列表'
        selected_apps : [],
        //客户
        customer_id:"",
        //客户名称
        customer_name : "",
        //开户类型
        user_type : "1",
        //开通套数
        count_number : 1,
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
        //销售团队
        sales_team : {
            id : '',
            name : ''
        },
        //销售
        sales : {
            id : '',
            name : ''
        }
    };
    this.status = {
        user_name: {},
        count_number : {}
    };

};

//radio的值改变
AppUserFormStore.prototype.radioValueChange = function({field,value}) {
    this.formData[field] = value;
};
//自定义radio的值改变
AppUserFormStore.prototype.customRadioValueChange = function({field,value}) {
    if(field === 'range') {
        var oldRange = this.formData.range;
        var newRange = value;
        if(newRange === 'forever') {
            this.formData.start_time = this.formData.end_time = Intl.get("common.time.forever", "永久");
        } else if(newRange === 'custom') {
            var now = moment().format(FORMAT);
            if(this.formData.start_time ===Intl.get("common.time.forever", "永久")){
                this.formData.start_time = now;
            }
            if(this.formData.end_time ===Intl.get("common.time.forever", "永久")){
                this.formData.end_time = moment().add("1","year").format(FORMAT);
            }
        } else {
            var start_time = moment().format(FORMAT);
            var end_time = moment().add(newRange,"month").format(FORMAT);
            this.formData.start_time = start_time;
            this.formData.end_time = end_time;
        }
    }

    this.formData[field] = value;

};
//选中客户
AppUserFormStore.prototype.customerChoosen = function(resultObj) {
    this.formData.sales_team = {
        id : resultObj.sales_team.id || '',
        name : resultObj.sales_team.name || ''
    };
    this.formData.sales = {
        id : resultObj.sales.id || '',
        name : resultObj.sales.name || ''
    };
    this.formData.customer_name = resultObj.customer.name || '';
    this.formData.customer_id = resultObj.customer.id || '';
};

//获取应用列表
AppUserFormStore.prototype.getApps = function(result) {
    if(result.error) {
        this.app_list = [];
    } else {
        this.app_list = result.list;
    }
};

//添加应用
AppUserFormStore.prototype.setSelectedApps = function(selected_apps) {
    this.formData.selected_apps = selected_apps;
    if(!selected_apps.length) {
        this.show_app_error = true;
    } else {
        this.show_app_error = false;
    }

};
//设置时间
AppUserFormStore.prototype.timeChange = function({field,date}) {
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

//设置输入框的值
AppUserFormStore.prototype.setInputField = function({field,value}) {
    this.formData[field] = value;
};

//添加用户
AppUserFormStore.prototype.addAppUser = function(result) {
    if(result.error) {
        this.submitResult = "error";
        this.submitErrorMsg = result.errorMsg;
    } else {
        this.submitErrorMsg = "";
        if(result.loading) {
            this.submitResult = "loading";
        } else {
            this.submitResult = "success";
        }
    }
};

//隐藏提交提示
AppUserFormStore.prototype.hideSubmitTip = function() {
    this.submitErrorMsg = "";
    this.submitResult = "";
};
//显示app错误提示
AppUserFormStore.prototype.showAppError = function() {
    this.show_app_error = true;
};
//隐藏app错误提示
AppUserFormStore.prototype.hideAppError = function() {
    this.show_app_error = false;
};

//显示客户错误提示
AppUserFormStore.prototype.showCustomerError = function() {
    this.show_customer_error = true;
};
//隐藏客户错误提示
AppUserFormStore.prototype.hideCustomerError = function() {
    this.show_customer_error = false;
};

//使用alt导出store
module.exports = alt.createStore(AppUserFormStore , 'AppUserFormStore');