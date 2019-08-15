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
    //修改完用户密码之后值为 true 用来清空文本框
    this.userInfoFormPwdShow = false;
    //用户信息
    this.userInfo = emptyUserInfo;
    //登录日志
    this.logList = [];
    //日志总条数
    this.logTotal = 0;
    //正在获取登录日志列表
    this.logLoading = true;
    //提交成功
    this.submitResult = '';
    //错误提示
    this.submitErrorMsg = '';
    // 当前数据最后一条数据的id
    this.sortId = '';
    // 每次加载的日志条数
    this.loadSize = 20;
    // 下拉加载
    this.listenScrollBottom = true;
    //获取操作记录失败的提示
    this.logErrorMsg = '';
    //正在获取个人资料
    this.userInfoLoading = false;
    //获取个人资料失败的提示
    this.userInfoErrorMsg = '';
    
    this.bindActions(UserInfoActions);
}

UserInfoStore.prototype.getLogList = function(logListObj) {
    if (logListObj.isLoading){
        this.logLoading = true;
    }else if (_.isString(logListObj)) {
        //获取操作记录失败
        this.logErrorMsg = logListObj;
        this.logList = [];
        this.logTotal = 0;
        this.listenScrollBottom = false;
        this.logLoading = false;
    } else if (logListObj && _.isObject(logListObj)) {
        this.logTotal = logListObj.total || 0;
        this.logLoading = false;
        if (_.isArray(logListObj.list) && logListObj.list.length > 0) {
            var processedLogList = logListObj.list.map(function(log) {
                return {
                    loginTime: log.timestamp ? moment(parseInt(log.timestamp)).format(oplateConsts.DATE_TIME_FORMAT) : '',
                    loginAddress: (log.country && log.country !== 'null' ? log.country : '') + (log.province && log.province !== 'null' ? log.province : '') + (log.city && log.city !== 'null' ? log.city : ''),
                    loginIP: log.ip && log.ip !== 'null' ? log.ip : '',
                    loginBrowser: log.browser && log.browser !== 'null' ? log.browser : '',
                    loginEquipment: log.device && log.device !== 'null' ? log.device : '',
                    loginMessage: log.operate && log.operate !== 'null' ? log.operate : '',
                    lastId: log.sortValuse || ''
                };
            });
            this.logList = this.logList.concat(processedLogList);
            var length = this.logList.length;
            this.sortId = length > 0 ? this.logList[length - 1].lastId : ''; // 获取最后一条提成的id
            // 若本次加载提成条数小于应该加载提成条数（loadSize=20），说明数据已加载完
            if (logListObj.list.length < this.loadSize) {
                this.listenScrollBottom = false;
            }
        } else {
            this.logList = [];
            this.listenScrollBottom = false;
        }
    } else {
        this.logLoading = false;
        this.listenScrollBottom = false;
        this.logList = [];
        this.logTotal = 0;
    }
};
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
UserInfoStore.prototype.editUserInfoPwd = function(result) {

    if (result.error) {
        this.submitResult = 'error';
        this.submitErrorMsg = result.errorMsg;
    } else {
        this.submitErrorMsg = '';
        if (result.loading) {
            this.submitResult = 'loading';
        } else {
            if (result.editFlag) {
                this.submitResult = 'success';
            } else {
                this.submitResult = 'error';
                this.submitErrorMsg = Intl.get('user.info.edit.password.failed','密码修改失败');
            }
        }
    }

    this.userInfoFormPwdShow = true;
};

//隐藏提交提示
UserInfoStore.prototype.hideSubmitTip = function() {
    this.submitErrorMsg = '';
    this.submitResult = '';
};

module.exports = alt.createStore(UserInfoStore, 'UserInfoStore');