var roleAjax = require("../ajax/role-ajax");
var userData = require("../../../../public/sources/user-data");
var RoleActions = require("./role-actions");

//获取权限id
function getAuhorityIds(role) {
    var authorityIds = [];
    if (role && _.isArray(role.permissionGroups) && role.permissionGroups.length > 0) {
        role.permissionGroups.forEach(function (permisssionGroup) {
            if (_.isArray(permisssionGroup.permissionList) && permisssionGroup.permissionList.length > 0) {
                permisssionGroup.permissionList.forEach(function (permission) {
                    if (permission.status) {
                        authorityIds.push(permission.permissionId);
                    }
                });
            }
        });
    }
    return authorityIds;
}

function RoleFormActions() {
    this.generateActions(
        'setSavingFlag',//是否正在报错角色的标识设置
        'clearSaveFlags'//清空保存时的标识
    );

    //添加角色
    this.addRole = function (role, clientId, type) {
        var _this = this;
        var authorityIds = getAuhorityIds(role);
        var addRole = {
            roleName: role.roleName,
            authorityIds: authorityIds.join(',')
        };
        addRole.clientId = clientId ? clientId : userData.getUserData().auth.client_id;
        addRole.realmId = userData.getUserData().auth.realm_id;
        roleAjax.addRole(addRole, type).then(function (roleCreated) {
            if (roleCreated) {
                role.roleId = roleCreated.role_id;
                RoleActions.afterAddRole(role);
                _this.dispatch();
            } else {
                _this.dispatch( Intl.get("role.add.role.failed", "添加角色失败"));
            }
        }, function (errorMsg) {
            _this.dispatch(errorMsg || Intl.get("role.add.role.failed", "添加角色失败"));
        });
    };

    //修改角色
    this.editRole = function (role, clientId, type) {
        var _this = this;
        var authorityIds = getAuhorityIds(role);
        var editRole = {
            roleId: role.roleId,
            roleName: role.roleName,
            authorityIds: authorityIds.join(',')
        };
        editRole.clientId = clientId ? clientId : userData.getUserData().auth.client_id;
        roleAjax.editRole(editRole, type).then(function (data) {
            if (data) {
                RoleActions.afterEditRole(role);
                _this.dispatch();
            } else {
                _this.dispatch( Intl.get("role.edit.role.failed", "修改角色失败"));
            }
        }, function (errorMsg) {
            _this.dispatch(errorMsg || Intl.get("role.edit.role.failed", "修改角色失败"));
        });
    };
}

module.exports = alt.createActions(RoleFormActions);