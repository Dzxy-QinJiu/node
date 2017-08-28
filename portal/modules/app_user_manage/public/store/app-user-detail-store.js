var AppUserUtil = require("../util/app-user-util");
var AppUserDetailActions = require("../action/app-user-detail-actions");

//app用户详情的store
function AppUserDetailStore() {
    //初始化state数据
    this.resetState();
    //绑定action
    this.bindActions(AppUserDetailActions);
}

AppUserDetailStore.prototype.resetState = function() {
    //默认loading状态
    this.isLoading = true;
    //获取用户详情失败的错误提示
    this.getDetailErrorMsg = '';
    //初始状态的user对象
    this.initialUser = {};
    //输入框
    this.editFields = {
        user_name : {
            showInput : false,
            status : {},
            formData : {},
            isSubmiting : false,
            submitErrorMsg : ''
        },
        email : {
            showInput : false,
            status : {},
            formData : {},
            isSubmiting : false,
            submitErrorMsg : ''
        },
        phone : {
            showInput : false,
            status : {},
            formData : {},
            isSubmiting : false,
            submitErrorMsg : ''
        },
        password : {
            showInput : false,
            status : {},
            formData : {},
            isSubmiting : false,
            submitErrorMsg : ''
        },
        customer_form : {
            showInput : false,
            status : {},
            formData : {},
            isSubmiting : false,
            submitErrorMsg : ''
        }
    };
    //modal状态
    this.modalStatus = {
        disable_all : {
            loading : false,
            showModal : false,
            success : false,
            errorMsg : ''
        }
    };
    this.customer_id = '';
    this.customer_name = '';
};

//恢复默认状态
AppUserDetailStore.prototype.dismiss = function() {
    this.resetState();
};

//获取用户详情
AppUserDetailStore.prototype.getUserDetail = function(result) {
    this.isLoading = false;
    if(result.error) {
        this.getDetailErrorMsg = result.userDetailErrorMsg;
        this.initialUser = {};
    } else {
        this.getDetailErrorMsg = '';
        this.initialUser = result.userDetail;
        //用户所属字段赋值
        this.customer_id = result.userDetail.customer.customer_id || '';
        this.customer_name = result.userDetail.customer.customer_name || '';
    }
};

//禁用全部应用
AppUserDetailStore.prototype.showDisableAllAppsModal = function() {
    this.modalStatus.disable_all.showModal = true;
};

//取消显示全部禁用
AppUserDetailStore.prototype.cancelAllAppsModal = function() {
    this.modalStatus.disable_all.showModal = false;
};
//停用全部应用
AppUserDetailStore.prototype.submitDisableAllApps = function(obj) {
    this.modalStatus.disable_all.showModal = false;
    this.modalStatus.disable_all.success = false;
    if(obj.loading) {
        this.modalStatus.disable_all.loading = true;
    } else {
        this.modalStatus.disable_all.loading = false;
        if(obj.error) {
            this.modalStatus.disable_all.errorMsg = obj.errorMsg;
        } else {
            this.modalStatus.disable_all.success = true;
            this.modalStatus.disable_all.errorMsg = "";
            //修改成功后，重置“开通产品”状态
            this.initialUser.apps.forEach(function(item) {
                item.is_disabled = 'true';
            });
        }
    }
};
//隐藏停用成功提示
AppUserDetailStore.prototype.hideDisableSuccessMsg = function() {
    this.modalStatus.disable_all.success = false;
};

//添加应用成功
AppUserDetailStore.prototype.addAppSuccess = function(apps) {
    this.initialUser.apps = apps.concat(this.initialUser.apps).slice();
};

//修改应用成功
AppUserDetailStore.prototype.editAppSuccess = function(apps) {
    if(!_.isArray(apps)) {
        apps = [apps];
    }
    if(!apps[0]) {
        return;
    }
    var _this = this;
    (this.initialUser.apps || []).forEach(function(obj ,i) {
        if(obj.app_id === apps[0].app_id) {
            _this.initialUser.apps[i] = apps[0];
        }
    });
};

//修改(昵称，备注)成功
AppUserDetailStore.prototype.changeUserFieldSuccess = function(userObj) {
    //覆盖用户信息
    $.extend(this.initialUser.user , userObj);
};

//修改用户组织
AppUserDetailStore.prototype.changeUserOrganization = function (userObj) {
    //覆盖用户信息
    $.extend(this.initialUser.user , userObj);
};

//修改客户，以便于在界面上看到“销售阶段”和“销售”
AppUserDetailStore.prototype.changeCustomer = function(customerObj) {
    this.customer_id = customerObj.customer_id;
    this.customer_name = customerObj.customer_name;
    this.initialUser.sales.sales_id = customerObj.sales_id;
    this.initialUser.sales.sales_name = customerObj.sales_name;
    this.initialUser.sales_team.sales_team_id = customerObj.sales_team_id;
    this.initialUser.sales_team.sales_team_name = customerObj.sales_team_name;
    this.initialUser.customer.customer_id = customerObj.customer_id;
    this.initialUser.customer.customer_name = customerObj.customer_name;
};

//修改应用的单个字段成功后，同步右侧面板用户详情中的数据
AppUserDetailStore.prototype.changeAppFieldSuccess = function(result) {
    //修改的字段
    var appFields = [
        "status",
        "is_two_factor",
        "multilogin",
        "over_draft"
    ];
    //遍历数组
    if(_.isArray(this.initialUser.apps)) {
        //找到修改的应用
        var targetApp = _.find(this.initialUser.apps , (obj) => obj.app_id === result.client_id);
        if(targetApp) {
            for(var i = 0, len = appFields.length ; i < len ; i++) {
                var key = appFields[i];
                //如果存在，则修改
                if(key in result) {
                    //开通状态字段特殊处理
                    if(key === 'status') {
                        targetApp.is_disabled = result[key] == '1' ? 'false' : 'true';
                    } else {
                    //其他字段直接赋值
                        targetApp[key] = result[key];
                    }
                    break;
                }
            }
        }
    }
};

//使用alt导出store
module.exports = alt.createStore(AppUserDetailStore , 'AppUserDetailStore');