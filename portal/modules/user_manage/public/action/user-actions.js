var userAjax = require("../ajax/user-ajax");
var scrollBarEmitter = require("../../../../public/sources/utils/emitters").scrollBarEmitter;
function UserActions() {
    this.generateActions(
        'setInitialData',
        'getCurUserList',
        'addUser',
        'editUser',
        'showUserForm',
        'showModalDialog',
        'hideModalDialog',
        'updateCurPage',
        'updatePageSize',
        'showUserInfoPanel',
        'closeRightPanel',
        'showContinueAddButton',
        'hideContinueAddButton',
        'returnInfoPanel',
        'getLogList',
        'updateSearchContent',
        'setLogLoading',
        'afterEditUser',
        'closeAddPanel',
        'changeLogNum',
        'setCurUser',
        'toggleFilterPanel',
        'setSelectRole',
        'updateUserTeam',
        'setUserLoading',
        'updateUserRoles'
    );

    this.getLogList = function (condition) {
        var _this = this;
        userAjax.getLogList(condition).then(function (logListObj) {
            if (_.isObject(logListObj)) {
                _this.dispatch(logListObj);
            } else {
                _this.dispatch( Intl.get("member.get.log.failed", "获取成员日志失败!"));
            }
        }, function (errorMsg) {
            _this.dispatch(errorMsg || Intl.get("member.get.log.failed", "获取成员日志失败!"));
        });
    };

    this.getCurUserList = function (searchObj) {
        var _this = this;
        userAjax.getCurUserList(searchObj).then(function (listObj) {
            _this.dispatch(listObj);
            scrollBarEmitter.emit(scrollBarEmitter.STOP_LOADED_DATA);
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
        }, function (errorMsg) {
            _this.dispatch(errorMsg);
            scrollBarEmitter.emit(scrollBarEmitter.STOP_LOADED_DATA);
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
        });
    };

    this.getCurUserById = function (userId) {
        var _this = this;
        userAjax.getCurUserById(userId).then(function (userObj) {
            if (_.isObject(userObj)) {
                _this.dispatch(userObj);
            } else {
                _this.dispatch( Intl.get("member.get.detail.failed", "获取成员的详情失败!"));
            }
        }, function (errorMsg) {
            _this.dispatch(errorMsg || Intl.get("member.get.detail.failed", "获取成员的详情失败!"));
        });
    };

    this.updateUserStatus = function (user) {
        var _this = this;
        userAjax.updateUserStatus(user).then(function (data) {
            if (data) {
                _this.dispatch(user);
            }
        }, function (errorMsg) {
            _this.dispatch(errorMsg);
        });
    };
    //获取销售目标和提成比例
    this.getSalesGoals = function (userId) {
        this.dispatch({loading:true, error:false});
        userAjax.getSalesGoals(userId).then((data) => {
           this.dispatch({loading:false,error:false, data: data});
        },(errorMsg) => {
            this.dispatch({loading:false, error:true, errorMsg: errorMsg});
        });
    };
    //设置销售目标或者提成比例
    this.setSalesGoals = function (user) {
        this.dispatch({loading:true, error:false});
        userAjax.setSalesGoals(user).then((data) => {
            this.dispatch({loading:false, error:false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading:false, error:true, errorMsg: errorMsg});
        });
    };
}

module.exports = alt.createActions(UserActions);
