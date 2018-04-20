var userInfoAjax = require("../ajax/user-info-ajax");
var userData = require("../../../../public/sources/user-data");
function UserInfoActions() {
    this.generateActions(
        'showUserInfoForm',//展示修改用户面板
        'hideUserInfoForm',//隐藏修改用户面板
        'hideSubmitTip',//隐藏保存提示
        'setLogNum',//设置当前操作记录的展示页
    );

    //获取用户信息
    this.getUserInfo = function () {
        var _this = this;
        var user_id = userData.getUserData().user_id;
        _this.dispatch({error: false,loading: true});
        userInfoAjax.getUserInfo(user_id).then(function (userInfo) {
            _this.dispatch({error: false,loading: false,userInfo:userInfo});
        },function (errorMsg) {
            _this.dispatch({error: true,loading: false,errorMsg: errorMsg || Intl.get("user.info.get.user.info.failed","获取用户信息失败")})
        });
    };

    //获取所管理的安全域信息
    this.getManagedRealm = function () {
        var _this = this;
        _this.dispatch({error: false,loading: true});
        userInfoAjax.getManagedRealm().then(function (realmInfo) {
            _this.dispatch({error: false,loading: false,realmInfo: realmInfo});
        },function (errorMsg) {
            _this.dispatch({error: true,loading: false,errorMsg: errorMsg || Intl.get("user.info.get.managed.realm.failed","获取安全域信息失败")})
        });
    };
    //获取登录日志
    this.getLogList = function (params) {
        var _this = this;
        userInfoAjax.getLogList(params).then(function (logList) {
            _this.dispatch(logList);
        }, function (errorMsg) {
            _this.dispatch(errorMsg || Intl.get("user.info.get.log.list.failed","获取个人操作记录失败"));
        });
    };
    //设置邮箱订阅提醒功能
    this.setSubscribeEmail = function (configObj, callback) {
        userInfoAjax.setSubscribeEmail(configObj).then(function (data) {
            if (callback){
                if (data){
                    callback({error: false, data:Intl.get("user.info.setting.succeess","设置成功！")})
                }else{
                    callback({error: true,errorMsg: errorMsg || Intl.get("user.info.setting.failed","设置失败，请重新设置")})
                }

            }
        },function (errorMsg) {
            if (callback){
                callback({error: true,errorMsg: errorMsg || Intl.get("user.info.setting.failed","设置失败，请重新设置")})
            }
        });
    };
    //邮箱激活
    this.activeUserEmail = function (callback) {
        userInfoAjax.activeUserEmail().then(function (data) {
            if (callback) {
                if (data) {
                    callback({error: false, data: data});
                } else {
                    callback({error: true, errorMsg: Intl.get("user.info.active.user.email.failed","激活失败")});
                }
            }
        }, function (errorMsg) {
            if (callback) {
                callback({error: true, errorMsg: errorMsg || Intl.get("user.info.active.user.email.failed","激活失败")});
            }
        });
    };

    //修改用户信息
    this.editUserInfo = function (userInfo, callback) {
        var _this = this;
        userInfoAjax.editUserInfo(userInfo).then(function (data) {
            // let errorMsg = "修改失败";
            let errorMsg = Intl.get("common.edit.failed","修改失败");
            if (data) {
                _this.dispatch(userInfo);
                errorMsg = "";
            }
            if (typeof callback === 'function') {
                callback(errorMsg);
            }
        }, function (errorMsg) {
            if (typeof callback === 'function') {
                callback(errorMsg || Intl.get("common.edit.failed","修改失败"));
            }
        });
    };

    //修改用户密码
    this.editUserInfoPwd = function (userInfo) {
        var _this = this;
        _this.dispatch({error: false, loading: true});
        userInfoAjax.editUserInfoPwd(userInfo).then(function (editFlag) {
            _this.dispatch({error: false, editFlag: editFlag});
        }, function (errorMsg) {
            _this.dispatch({error: true, errorMsg: errorMsg});
        });
    };
    
}

module.exports = alt.createActions(UserInfoActions);