var UserInfoActions = require('../action/user-info-actions');
var userInfoEmitter = require('../../../../public/sources/utils/emitters').userInfoEmitter;
var emptyUserInfo = {
    userId: '',
    userName: '',
    nickName: '',
    password: '',
    rePasswd: '',
    newPasswd: '',
    phone: '',
    email: '',
    roles: '',
    rolesName: '',
    reject: ''
};

function UserInfoStore() {
    //在 编辑 状态的时候userInfoFormShow为true
    this.userInfoFormShow = false;
    //用户信息
    this.userInfo = emptyUserInfo;
    //正在获取个人资料
    this.userInfoLoading = false;
    //获取个人资料失败的提示
    this.userInfoErrorMsg = '';
    
    this.bindActions(UserInfoActions);
}

UserInfoStore.prototype.getUserInfo = function(result) {
    if (result.error){
        this.userInfoErrorMsg = result.errorMsg;
        this.userInfo = emptyUserInfo;
        this.userInfoLoading = false;
    }else{
        this.userInfoErrorMsg = '';
        if (result.loading){
            this.userInfoLoading = true;
        }else{
            this.userInfo = result.userInfo;
            this.userInfoLoading = false;
        }
    }

};

UserInfoStore.prototype.showUserInfoForm = function() {
    this.userInfoFormShow = true;
};

UserInfoStore.prototype.hideUserInfoForm = function() {
    this.userInfoFormShow = false;
};
//修改个人资料后的处理
UserInfoStore.prototype.editUserInfo = function(modifiedUser) {
    if (_.isObject(modifiedUser)) {
        if(_.has(modifiedUser, 'nick_name')) {
            _.extend(this.userInfo, {nickName: modifiedUser.nick_name});
            userInfoEmitter.emit(userInfoEmitter.CHANGE_USER_LOGO, {
                nickName: modifiedUser.nick_name,
            });
        }else if(_.has(modifiedUser, 'user_logo')) {
            _.extend(this.userInfo, {userLogo: modifiedUser.user_logo});
            userInfoEmitter.emit(userInfoEmitter.CHANGE_USER_LOGO, {
                userLogo: modifiedUser.user_logo,
            });
        } else {
            _.extend(this.userInfo, modifiedUser);
        }
    }
    this.userInfoFormShow = false;
};

module.exports = alt.createStore(UserInfoStore, 'UserInfoStore');