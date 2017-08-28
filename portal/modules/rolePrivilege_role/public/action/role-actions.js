var roleAjax = require("../ajax/role-ajax");
//var authorityAjax = require("../../../rolePrivilege_authority/public/ajax/authority-ajax");
var userData = require("../../../../public/sources/user-data");
var userInfo = userData.getUserData();
var PrivilegeUtil = require("../../../../components/privilege/checker");
var hasPrivilege = PrivilegeUtil.hasPrivilege;
import {message} from "antd";
function RoleActions() {
    this.generateActions(
        'showRoleForm',//展示增加/修改角色 面板
        'hideRoleForm', //隐藏增加/修改角色 面板
        'showModalDialog',//展示删除角色时提示框
        'hideModalDialog',//隐藏删除角色时提示框
        'clearDelErrorMsg',//清除删除失败的提示内容
        'afterAddRole',//添加成功后的处理
        'afterEditRole',//编辑成功后的处理
        'setRoleListLoading',
        'setDefaulting'//设置默认角色加载状态handler
    );

    //获取角色列表
    this.getRoleList = function (clientId, type) {
        var _this = this;
        var clientID = "";
        if (clientId) {
            clientID = clientId;
        } else {
            clientID = userData.getUserData().auth.client_id;
        }
        roleAjax.getRoleList(clientID, type).then(function (roleListObj) {
            //拿到角色列表后查询默认角色
            _this.actions.getDefaultRole(clientID);
            _this.dispatch(roleListObj);

        }, function (errorMsg) {
            _this.dispatch(errorMsg || Intl.get("role.get.role.list.failed", "获取角色列表失败"));
        });
    };
    
    //删除角色
    this.deleteRole = function (role, type) {
        var _this = this;
        roleAjax.deleteRole(role.roleId, type).then(function (data) {
            var delResultObj = {
                delResult: data,//true:删除成功，false:删除失败
                delRoleId: role.roleId
            };
            if (!data) {
                delResultObj.delRoleMsg = Intl.get("role.del.role.failed", "删除角色失败");
            }
            _this.dispatch(delResultObj);
        }, function (errorMsg) {
            _this.dispatch({
                delResult: false,
                delRoleId: role.roleId,
                delRoleMsg: errorMsg || Intl.get("role.del.role.failed", "删除角色失败")
            });
        });
    };

    //设置默认角色
    this.setDefaultRole = function (param) {
        var _this = this;
        roleAjax.setDefaultRole(param).then(function (data) {
            var setResultObj = {
                setResult: data,//true:设置成功，false:设置失败
                setRoleId: param.base_role
            };
            if (!data) {
                message.error(Intl.get("role.default.set.failed", "设置默认角色失败"));               
            }
            _this.dispatch(setResultObj);
        }, function (errorMsg) {
            message.error(Intl.get("role.default.set.failed", "设置默认角色失败"));
            _this.dispatch({
                setResult: false,
                setRoleId: param.base_role              
            });
        });
    };

     //查询默认角色
    this.getDefaultRole = function (clientId) {
        var _this = this;
        const ROLE = "GET_APPLICATION_BASE_ROLE";//查询默认角色的权限
        //没有权限不发出请求
        if(!hasPrivilege(ROLE)) {
            _this.dispatch({
                result: false
            });
            return ;
        }
        roleAjax.getDefaultRole({app_id:clientId}).then(function (data) {              
            var getResultObj = {
                result: data
            };            
            _this.dispatch(getResultObj);
        }, function (errorMsg) {
            _this.dispatch({
                result: false
            });
            if(errorMsg.status!=200) {
                message.error(Intl.get("role.default.get.failed", "获取默认角色失败"));
            }
        });
    };

    //删除默认角色
    this.delDefaultRole = function (param) {
        var _this = this;
        roleAjax.delDefaultRole(param).then(function (data) {
            var delResultObj = {
                delResult: data//true:删除成功，false:删除失败
            };
            if (!data) {
                message.error(Intl.get("role.default.del.failed", "取消默认角色失败"));                
            }
            _this.dispatch(delResultObj);
        }, function (errorMsg) {
            message.error(Intl.get("role.default.del.failed", "取消默认角色失败"));
            _this.dispatch({
                delResult: false
            });
        });
    };

}

module.exports = alt.createActions(RoleActions);