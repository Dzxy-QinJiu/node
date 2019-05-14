var userAjax = require('../ajax/user-ajax');
var scrollBarEmitter = require('../../../../public/sources/utils/emitters').scrollBarEmitter;
function UserActions() {
    this.generateActions(
        'setInitialData',
        'getCurUserList',
        'addUser',
        'editUser',
        'showUserForm',
        'updateCurPage',
        'updatePageSize',
        'showUserInfoPanel',
        'closeRightPanel',
        'showContinueAddButton',
        'hideContinueAddButton',
        'returnInfoPanel',
        'getLogList',
        'updateSearchContent',
        'afterEditUser',
        'closeAddPanel',
        'setCurUser',
        'toggleFilterPanel',
        'setSelectRole',
        'updateUserTeam',
        'setUserLoading',
        'updateUserRoles',
        'updateCurrentUserStatus'
    );
    this.getCurUserList = function(searchObj) {
        var _this = this;
        userAjax.getCurUserList(searchObj).then(function(listObj) {
            _this.dispatch(listObj);
            scrollBarEmitter.emit(scrollBarEmitter.STOP_LOADED_DATA);
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
        }, function(errorMsg) {
            _this.dispatch(errorMsg);
            scrollBarEmitter.emit(scrollBarEmitter.STOP_LOADED_DATA);
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
        });
    };

    this.getCurUserById = function(userId) {
        var _this = this;
        userAjax.getCurUserById(userId).then(function(userObj) {
            if (_.isObject(userObj)) {
                _this.dispatch(userObj);
            } else {
                _this.dispatch( Intl.get('member.get.detail.failed', '获取成员的详情失败!'));
            }
        }, function(errorMsg) {
            _this.dispatch(errorMsg || Intl.get('member.get.detail.failed', '获取成员的详情失败!'));
        });
    };

    this.updateUserStatus = function(user) {
        userAjax.updateUserStatus(user).then( (data) => {
            if (data) {
                this.dispatch(user);
            } else {
                this.dispatch(Intl.get('common.edit.failed', '修改失败'));
            }
        }, (errorMsg) => {
            this.dispatch(errorMsg || Intl.get('common.edit.failed', '修改失败'));
        });
    };

}

module.exports = alt.createActions(UserActions);
