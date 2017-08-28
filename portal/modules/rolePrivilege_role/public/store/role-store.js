var RoleActions = require("../action/role-actions");
var emptyRole = {
    roleId: '',
    roleName: '',
    permissionGroups: []
};


function RoleStore() {
    //在 编辑/添加 状态的时候roleFormShow为true
    this.roleFormShow = false;
    //角色列表
    this.roleList = [];
    this.roleListIsLoading = true;//是否正在加载角色列表
    //所有权限组及权限列表
    this.permissionGroups = [];
    // 编辑/添加 状态时，需要提交的对象
    this.currentRole = emptyRole;
    //当前是添加还是编辑面板
    this.formType = "add";
    //获取角色列表的错误、无数据时的提示信息
    this.listTipMsg = "";
    this.delRoleErrorMsg = "";//删除角色错误的提示信息
    this.delRoleId = "";//要删除角色的id
    this.bindActions(RoleActions);
    this.setDefaulting = false;//设置默认角色加载状态    
}

RoleStore.prototype.setRoleListLoading = function (flag) {
    this.roleListIsLoading = flag;
};
RoleStore.prototype.setDefaulting = function (flag) {
    this.setDefaulting = flag;
};
RoleStore.prototype.setRoleNumber = function () {
    _.each(this.roleList.roleList, function (obj, i) {
        obj.number = i + 1;
    });
};

RoleStore.prototype.changeAuthorityGroupObject = function () {
    var authorityGroupListObj = [];
    _.each(this.roleList.authorityGroupList, function (obj, i) {
        var group = {
            classifyName: obj,
            authorityIDs: []
        };
        authorityGroupListObj.push(group);
    });
    this.roleList.authorityGroupList = authorityGroupListObj;
};

//重构角色下的权限组列表，permissionGroups：所有的权限分组及权限列表map
RoleStore.prototype.refactorPermissionGroups = function (permissionGroups) {
    var authorityGroups = [];//转换后的权限组列表
    for (var key in permissionGroups) {
        if (key) {
            authorityGroups.push({
                permissionGroupName: key,//权限组名
                isShow: true,//展开、收起该组权限的标识
                permissionList: permissionGroups[key] || []
            });
        }
    }
    return authorityGroups;
};

//获取角色列表
RoleStore.prototype.getRoleList = function (roleListObj) {   
    if (_.isString(roleListObj)) {
        //获取角色列表失败的提示
        this.listTipMsg = roleListObj;
    } else {
        if (roleListObj.permissions) {
            this.permissionGroups = this.refactorPermissionGroups(roleListObj.permissions);
        }
        if (_.isArray(roleListObj.roles) && roleListObj.roles.length > 0) {
            this.refactorRoleList(roleListObj.roles);
            this.listTipMsg = "";
        } else {
            this.roleList = [];
            this.listTipMsg = Intl.get("role.no.role.list", "暂无角色列表！");
        }
    }
};

//重构角色列表的数据
RoleStore.prototype.refactorRoleList = function (roles) {
    var _this = this;
    this.roleList = roles.map(function (role) {
        var rolePermissionGroups = _this.getRolePermissionGroups(role.permissionIds);
        return {
            roleId: role.roleId,
            roleName: role.roleName,
            permissionGroups: rolePermissionGroups,
            isDefault: "0"
        }
    });
};

//获取角色下的权限组及组下权限列表的数据
RoleStore.prototype.getRolePermissionGroups = function (permissionIds) {
    var rolePermissionGroups = $.extend(true, [], this.permissionGroups);
    //遍历权限组列表
    if (_.isArray(rolePermissionGroups) && rolePermissionGroups.length > 0) {
        rolePermissionGroups.forEach(function (permissionGroup) {
            //遍历权限组下的权限列表
            if (permissionGroup && _.isArray(permissionGroup.permissionList)) {
                permissionGroup.permissionList.forEach(function (permission) {
                    if (permission) {
                        permission.status = false;
                        //遍历该角色所持有的权限的id,找到对应的权限设置为true(选中状态)
                        if (_.isArray(permissionIds) && permissionIds.length > 0) {
                            permissionIds.forEach(function (permissionId) {
                                if (permission.permissionId == permissionId) {
                                    permission.status = true;
                                }
                            });
                        }
                    }
                });
            }
        });
    }
    return rolePermissionGroups;
};

//添加角色
RoleStore.prototype.afterAddRole = function (roleCreated) {
    var addRoleArray = [roleCreated];
    this.roleList = addRoleArray.concat(this.roleList);
    this.roleFormShow = false;
    if (this.roleList.length > 0) {
        this.listTipMsg = "";
    }
};

//修改角色
RoleStore.prototype.afterEditRole = function (roleModified) {
    this.roleFormShow = false;
    var target = _.find(this.roleList, function (item) {
        if (item.roleId === roleModified.roleId) {
            return true;
        }
    });

    if (target) {
        _.extend(target, roleModified);
    }
};

//删除角色
RoleStore.prototype.deleteRole = function (delResultObj) {
    if (delResultObj.delResult) {
        //删除成功
        this.roleList = _.filter(this.roleList, function (item) {
            if (item.roleId !== delResultObj.delRoleId) {
                return true;
            }
        });
        if (this.roleList.length == 0) {
            this.listTipMsg = Intl.get("role.no.role.list", "暂无角色列表！");
        } else {
            this.listTipMsg = "";
        }
    } else {
        //删除失败
        this.delRoleErrorMsg = delResultObj.delRoleMsg;
        this.delRoleId = delResultObj.delRoleId;
    }
};

RoleStore.prototype.clearDelErrorMsg = function () {
    this.delRoleErrorMsg = "";
    this.delRoleId = "";
};

//展示添加修改角色面板
RoleStore.prototype.showRoleForm = function (role) {
    this.roleFormShow = true;
    if (role) {
        this.currentRole = role;
        this.formType = "edit";
    } else {
        this.currentRole = emptyRole;
        this.formType = "add";
    }
};

//隐藏添加修改角色面板
RoleStore.prototype.hideRoleForm = function () {
    this.roleFormShow = false;
};

//判断当前权限是否选中
RoleStore.prototype.roleAuthority = function (authority, role) {
    var flag = false;
    if (authority && role) {
        var authorityIds = role.authorityIds;
        if (authorityIds) {
            for (var i = 0; i < authorityIds.length; i++) {
                if (authority.permissionId == authorityIds[i]) {
                    flag = true;
                    continue;
                }
            }
        }
    }
    return flag;
};

//展示删除角色时的提示框
RoleStore.prototype.showModalDialog = function (role) {
    role.modalDialogFlag = true;
};

//隐藏删除角色时的提示框
RoleStore.prototype.hideModalDialog = function (role) {
    role.modalDialogFlag = false;
};

//设置默认角色
RoleStore.prototype.setDefaultRole = function (obj) {
    this.setDefaulting = false;
    if (obj.setResult) {   
        this.roleList.forEach(x => {
            if (x.roleId == obj.setRoleId) {
                x.isDefault = "1";
            }
            else {
                x.isDefault = "0";
            }
        })
    }    
};

//获取默认角色
RoleStore.prototype.getDefaultRole = function (obj) {
    //默认角色加载完成后再显示角色列表
    this.roleListIsLoading = false;
    if (obj.result) {
        this.roleList.forEach(x => {
            if (x.roleId == obj.result.role_id) {
                x.isDefault = "1";
            }
            else {
                x.isDefault = "0";
            }
        });
    }   
};

//删除默认角色
RoleStore.prototype.delDefaultRole = function (data) {
    if(data.delResult) {
        this.roleList.forEach(x => x.isDefault = "0");
    }
};


module.exports = alt.createStore(RoleStore, 'RoleStore');