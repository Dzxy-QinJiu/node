/**
 * 修改用户应用的action
 */
//用户管理的ajax
var AppUserAjax = require("../ajax/app-user-ajax");
var AppUserUtil = require("../util/app-user-util");

function UserDetailEditAppActions() {
    this.generateActions(
        "changeSubType",//切换tab
        "customRadioValueChange",//更改radio的值
        "submitEditApp",//提交数据
        "timeChange",//更改时间
        "resetState",//重置数据
        'setSelectedApps',//设置选中的应用
        "setEditAppDefaultValue",//设置编辑的默认值
        "radioValueChange",//更改radio的值
        "hideSubmitTip", //隐藏提交的提示
        "showAppError",//显示app错误信息
        "showUserTypeError",//显示开通类型错误
        "hideUserTypeError"//隐藏开通类型错误
    );

    /**
     * 修改用户的单个应用
     */
    this.submitEditApp = function(obj) {
        var _this = this;
        _this.dispatch({loading : true});
        AppUserAjax.addApp(obj.operation , obj.data).then(function(newAppObj) {
            _this.dispatch({error : false, app : newAppObj});
        } , function(errorMsg) {
            _this.dispatch({error : true, errorMsg : errorMsg});
        });
    };

}

module.exports = alt.createActions(UserDetailEditAppActions);