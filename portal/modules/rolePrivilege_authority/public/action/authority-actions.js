var authorityAjax = require('../ajax/authority-ajax');
var userData = require('../../../../public/sources/user-data');

function AuthorityActions() {
    this.generateActions(
        'hideAuthorityForm',//关闭添加权限组的面板
        'showModalDialog',
        'hideModalDialog',
        'showEditClassifyNameInput',
        'hideEditClassifyNameInput',
        'showAuthorityModalDialog',
        'hideAuthorityModalDialog',
        'showAuthorityInfoFnc',
        'hideAuthorityInfoFnc',
        'authorityInfo',
        'showAuthorityGroupForm', //展示右侧编辑权限组的面板
        'closeAuthorityGroupForm',
        'clearDelAuthGroupErrorMsg',//清除删除权限组失败的提示内容
        'clearDelAuthErrorMsg',//清除删除权限失败的提示内容
        'afterAddAuthority',//添加权限后的处理
        'afterEditAuthority',//编辑权限后的处理
        'setAuthListLoading',
        'setSearchContent',
        'beforeEditAuthority'
    );

    //获取权限列表
    this.getAuthorityList = function(clientId, type) {
        var _this = this;
        var clientID = '';
        if (clientId) {
            clientID = clientId;
        } else {
            clientID = userData.getUserData().auth.client_id;
        }
        authorityAjax.getAuthorityList(clientID, type).then(function(authorityGroupsObj) {
            _this.dispatch(authorityGroupsObj);
        }, function(errorMsg) {
            _this.dispatch(errorMsg);
        });
    };

    //修改权限分组名
    this.editAuthorityGroupName = function(authorityGroup, type, callback) {
        var _this = this;
        authorityAjax.editAuthorityGroupName(authorityGroup, type).then(function(data) {
            _this.dispatch(authorityGroup);
            if (callback) {
                callback.call(_this, {saveResult: 'success', saveMsg: Intl.get('common.save.success', '保存成功')});
            }
        }, function(errorMsg) {
            if (callback) {
                callback.call(_this, {saveResult: 'success', saveMsg: errorMsg || Intl.get('common.save.failed', '保存失败')});
            }
        });
    };

    //删除权限
    this.deleteAuthority = function(authorityIds, type) {
        var _this = this;
        authorityAjax.deleteAuthority(authorityIds, type).then(function(data) {
            if (data) {
                _this.dispatch({
                    delResult: true,//删除成功
                    authorityIds: authorityIds//被删除的权限id
                });
            } else {
                _this.dispatch({
                    delResult: false,//删除失败
                    delAuthMsg: Intl.get('authority.del.auth.failed', '删除权限失败')
                });
            }
        }, function(errorMsg) {
            _this.dispatch({
                delResult: false,//删除失败
                delAuthMsg: errorMsg || Intl.get('authority.del.auth.failed', '删除权限失败')
            });
        });
    };

    //删除权限组
    this.deleteAuthorityGroup = function(authorityIds, groupName, clientId, type) {
        var _this = this;
        authorityAjax.deleteAuthority(authorityIds, type).then(function(data) {
            if (data) {
                //删除成功刷新权限组列表
                _this.actions.getAuthorityList(clientId, type);
            } else {
                _this.dispatch({
                    delResult: false,//删除失败
                    delAuthGroupName: groupName,//删除权限组的组名
                    delAuthGroupMsg: Intl.get('authority.del.group.failed', '删除权限组失败')
                });
            }
        }, function(errorMsg) {
            _this.dispatch({
                delResult: false,//删除失败
                delAuthGroupName: groupName,//删除权限组的组名
                delAuthGroupMsg: errorMsg || Intl.get('authority.del.group.failed', '删除权限组失败')
            });
        });
    };

    //展示右侧编辑面板
    this.showAuthorityForm = function(authorityGroup, flag) {
        this.dispatch({
            authorityGroup: authorityGroup,
            flag: flag
        });
    };

}

module.exports = alt.createActions(AuthorityActions);