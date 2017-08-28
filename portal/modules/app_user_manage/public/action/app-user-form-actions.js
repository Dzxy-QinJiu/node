/**
 * 添加用户的action
 */
//用户管理的ajax
var AppUserAjax = require("../ajax/app-user-ajax");
var AppUserUtil = require("../util/app-user-util");

function AppUserFormAction() {
    this.generateActions(
        //input的值改变
        "setInputField",
        //radio的值改变
        "radioValueChange",
        //自定义radio的值改变
        "customRadioValueChange",
        //选中客户
        "customerChoosen",
        //设置时间
        "timeChange",
        //获取应用列表
        "getApps",
        //设置选中的应用
        'setSelectedApps',
        //重置
        "resetState",
        //添加用户
        "addAppUser",
        //隐藏提交提示
        "hideSubmitTip",
        //显示选择app的错误
        "showAppError",
        //不显示选择app的错误
        "hideAppError",
        //显示客户错误
        "showCustomerError",
        //隐藏客户错误
        "hideCustomerError"
    );
    /**
     * 获取应用列表
     */
    this.getApps = function() {
        var _this = this;
        AppUserAjax.getApps().then(function(list) {
            _this.dispatch({error : false, list : list});
        } , function(errorMsg) {
            _this.dispatch({error : true, errorMsg : errorMsg});
        });
    };
    /**
     *  添加用户
     */
    this.addAppUser = function(user) {
        var _this = this;
        _this.dispatch({error : false , loading:true});
        AppUserAjax.addAppUser(user).then(function(user) {
            _this.dispatch({error : false , user:user});
        } , function(errorMsg){
            _this.dispatch({error : true , errorMsg : errorMsg});
        });
    };

}

module.exports = alt.createActions(AppUserFormAction);