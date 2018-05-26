var authorityAjax = require("../ajax/authority-ajax");
var AuthorityActions = require("./authority-actions");


function AuthorityFormActions() {
    this.generateActions(
        'setGroupSavingFlag',//是否正在保存权限分组的标识设置
        'setAuthoritySavingFlag',//是否正在保存权限
        'clearSaveAuthorityFlags'//清空保存权限的标识
    );

    //添加权限
    this.addAuthority = function(authorityArray, type) {
        var _this = this;
        authorityAjax.addAuthority(authorityArray, type).then(function(authorityAddArray) {
            if (_.isArray(authorityArray) && authorityArray[0]) {
                AuthorityActions.afterAddAuthority(authorityAddArray);
                _this.dispatch();
            } else {
                _this.dispatch( Intl.get("authority.add.auth.failed", "添加权限失败"));
            }
        }, function(errorMsg) {
            _this.dispatch(errorMsg || Intl.get("authority.add.auth.failed", "添加权限失败"));
        });
    };

    //修改权限
    this.editAuthority = function(authority, type) {
        var _this = this;
        authorityAjax.editAuthority(authority, type).then(function(authorityModified) {
            if (authorityModified) {
                AuthorityActions.afterEditAuthority(authorityModified);
                _this.dispatch();
            } else {
                _this.dispatch( Intl.get("authority.edit.auth.failed", "修改权限失败"));
            }
        }, function(errorMsg) {
            _this.dispatch(errorMsg || Intl.get("authority.edit.auth.failed", "修改权限失败"));
        });
    };

    //添加权限组
    this.addAuthorityGroup = function(authorityArray, clientId, type) {
        var _this = this;
        authorityAjax.addAuthority(authorityArray, type).then(function(data) {
            if (data) {
                _this.dispatch({saveResult: "success", saveMsg: Intl.get("common.save.success", "保存成功")});

            } else {
                _this.dispatch({saveResult: "error", saveMsg: Intl.get("common.save.failed", "保存失败")});
            }
        }, function(errorMsg) {
            //保存失败后的处理
            _this.dispatch({saveResult: "error", saveMsg: errorMsg || Intl.get("common.save.failed", "保存失败")});
        });
    };

    //清空保存时的标识
    this.clearSaveFlags = function(addResult, clientId, type) {
        //添加成功后
        if (addResult == "success") {
            AuthorityActions.hideAuthorityForm();
            //刷新权限分组列表
            AuthorityActions.getAuthorityList(clientId, type);
        }
        this.dispatch();
    };
}

module.exports = alt.createActions(AuthorityFormActions);