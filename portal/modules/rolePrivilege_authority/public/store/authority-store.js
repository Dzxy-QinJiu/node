var AuthorityActions = require('../action/authority-actions');

var emptyAuthority = {
    permissionId: '',
    permissionName: '',
    permissionDefine: '',
    permissionApis: '',
    permissionApisKey: '',
    permissionApisVal: 'PUT',
    classifyName: ''
};
var emptyAuthorityGroupInfo = {
    classifyName: '',
    authorityIDs: []
};
var emptyAuthorityList = [];

function AuthorityStore() {
    //在 编辑/添加 状态的时候authorityFormShow为true
    this.authorityFormShow = false;
    this.showAuthorityInfoFlag = false;
    this.isEditAuthority = false;
    this.isAddAuthorityGroup = true;
    this.authorityList = emptyAuthorityList;
    this.authListIsLoadding = true;//是否正正在加载权限列表
    this.showAuthorityInfo = emptyAuthority;
    this.authorityGroupInfo = emptyAuthorityGroupInfo;
    this.currentAuthorityList = emptyAuthorityList;

    this.authorityGroupList = [];//权限分组列表
    //展示右侧修改权限组的面板
    this.authorityGroupFormShow = false;
    //要编辑的权限组
    this.editAuthorityGroup = {};
    //获取权限列表的错误、无数据时的提示信息
    this.listTipMsg = '';
    this.delAuthGroupErrorMsg = '';//删除权限组失败的提示信息
    this.delAuthGroupName = '';//要删除权限组的名称
    this.delAuthErrorMsg = '';//删除权限失败的提示信息
    this.searchContent = '',//搜索服务地址内容

    this.bindActions(AuthorityActions);
}

//权限分组数据的重构，由map格式改为list
AuthorityStore.prototype.refactorAuthorityGroups = function(authorityGroupsObj) {
    var authorityGroupList = [];//转换后的权限组列表
    var _this = this;
    for (var key in authorityGroupsObj) {
        if (key) {
            var authorityList = authorityGroupsObj[key] || [];
            //遍历权限列表，将权限的服务地址map拆成对应的key和vaule组成的对象
            _.each(authorityList, function(obj, i) {
                obj.permissionApiArray = [];
                if (obj.permissionApis) {
                    //遍历权限服务地址对象{url:method,...}
                    $.each(obj.permissionApis, function(key, value) {
                        //将权限服务地址的url和method对象存入数组中
                        _this.handlePermissionApis(obj.permissionApiArray, key, value);
                    });
                    obj.permissionApiArray = _.sortBy(obj.permissionApiArray, 'permissionApiUrl');
                }
            });
            //权限组名和组下的权限列表组成的权限组列表
            authorityGroupList.push({
                permissionGroupName: key,//权限组名
                permissionList: authorityList
            });
        }
    }
    authorityGroupList.sort((group1, group2) => group1.permissionGroupName.localeCompare(group2.permissionGroupName));
    return authorityGroupList;
};

AuthorityStore.prototype.setAuthListLoading = function(flag) {
    this.authListIsLoadding = flag;
};
//获取权限列表
AuthorityStore.prototype.getAuthorityList = function(authorityGroupsObj) {
    this.authListIsLoadding = false;
    if (_.isString(authorityGroupsObj)) {
        //获取权限列表失败的提示
        this.listTipMsg = authorityGroupsObj;
    } else {
        this.authorityGroupList = this.refactorAuthorityGroups(authorityGroupsObj);
        if (this.authorityGroupList.length == 0) {
            this.listTipMsg = Intl.get('authority.no.auth.list', '暂无权限列表！');
        } else {
            this.listTipMsg = '';
        }
    }
};

//成功添加权限后的处理
AuthorityStore.prototype.afterAddAuthority = function(authorityArray) {
    this.isAddAuthorityGroup = false;
    if (_.isArray(authorityArray) && authorityArray[0]) {
        var authorityAdd = authorityArray[0];
        var permissionApiArray = [];
        if (authorityAdd.permissionApis) {
            //遍历权限服务地址对象{url:method,...}
            $.each(authorityAdd.permissionApis, function(key, value) {
                //将权限服务地址的url和method对象存入数组中
                if (value && _.isString(value)) {
                    //一个url对应一个或多个请求方式的处理
                    value.split(',').forEach(function(method) {
                        permissionApiArray.unshift({
                            permissionApiUrl: key,
                            permissionApiMethod: method
                        });
                    });
                }
            });
            authorityAdd.permissionApiArray = permissionApiArray;
        }
        var editAuthorityGroup = this.editAuthorityGroup;
        //刷新编辑的权限组
        editAuthorityGroup.permissionList.unshift(authorityAdd);
        //刷新权限组列表
        if (_.isArray(this.authorityGroupList) && this.authorityGroupList.length > 0) {
            this.authorityGroupList.forEach(function(authorityGroup) {
                if (authorityGroup.permissionGroupName == editAuthorityGroup.permissionGroupName) {
                    authorityGroup = editAuthorityGroup;
                }
            });
        }
    }
};
//权限服务地址的处理key:url,value:method
AuthorityStore.prototype.handlePermissionApis = function(permissionApiArray, key, value) {
    //一个url只对应一个或多个请求方式的处理
    if (value && _.isString(value)) {
        value.split(',').forEach(function(method) {
            permissionApiArray.push({
                permissionApiUrl: key,
                permissionApiMethod: method
            });
        });
    }
};

//修改权限后的处理
AuthorityStore.prototype.afterEditAuthority = function(authorityModified) {
    var permissionApiArray = [], _this = this;
    if (authorityModified.permissionApis) {
        //遍历权限服务地址对象{url:method,...}
        $.each(authorityModified.permissionApis, function(key, value) {
            //将权限服务地址的url和method对象存入数组中
            _this.handlePermissionApis(permissionApiArray, key, value);
        });
        authorityModified.permissionApiArray = _.sortBy(permissionApiArray, 'permissionApiUrl');
    }
    var editAuthorityGroup = this.editAuthorityGroup;
    //刷新编辑的权限组
    if (_.isArray(editAuthorityGroup.permissionList) && editAuthorityGroup.permissionList.length > 0) {
        editAuthorityGroup.permissionList.forEach(function(authority) {
            if (authority.permissionId == authorityModified.permissionId) {
                authority = _.extend(authority, authorityModified);
            }
        });
    }
    //刷新权限组列表
    if (_.isArray(this.authorityGroupList) && this.authorityGroupList.length > 0) {
        this.authorityGroupList.forEach(function(authorityGroup) {
            if (authorityGroup.permissionGroupName == editAuthorityGroup.permissionGroupName) {
                authorityGroup = editAuthorityGroup;
            }
        });
    }
};

//删除权限
AuthorityStore.prototype.deleteAuthority = function(delResultObj) {
    if (delResultObj.delResult) {
        //删除成功
        //刷新当前编辑的权限分组
        var authorityIds = delResultObj.authorityIds;
        var editAuthorityGroup = this.editAuthorityGroup;
        if (_.isArray(editAuthorityGroup.permissionList) && editAuthorityGroup.permissionList.length > 0) {
            editAuthorityGroup.permissionList = _.filter(editAuthorityGroup.permissionList, function(permission) {
                if (authorityIds.indexOf(permission.permissionId) < 0) {
                    return true;
                }

            });
        }
        //刷新权限组列表
        if (_.isArray(this.authorityGroupList) && this.authorityGroupList.length > 0) {
            var _this = this;
            this.authorityGroupList = _.filter(this.authorityGroupList, function(authorityGroup) {
                if (authorityGroup.permissionGroupName == editAuthorityGroup.permissionGroupName) {
                    authorityGroup = editAuthorityGroup;
                    //该权限组没有权限时，删除该组
                    if (authorityGroup.permissionList.length == 0) {
                        _this.authorityGroupFormShow = false;//关闭修改面板
                        _this.editAuthorityGroup = {};
                        return false;
                    }
                }
                return true;
            });
        }
    } else {
        //删除失败
        this.delAuthErrorMsg = delResultObj.delAuthMsg;
    }
};
AuthorityStore.prototype.clearDelAuthErrorMsg = function() {
    this.delAuthErrorMsg = '';
};


//删除权限组
AuthorityStore.prototype.deleteAuthorityGroup = function(delResultObj) {
    if (!delResultObj.delResult) {
        //删除失败
        this.delAuthGroupErrorMsg = delResultObj.delAuthGroupMsg;
        this.delAuthGroupName = delResultObj.delAuthGroupName;
    }
};

AuthorityStore.prototype.clearDelAuthGroupErrorMsg = function() {
    this.delAuthGroupErrorMsg = '';
    this.delAuthGroupName = '';
};

//展示右侧编辑权限组面板
AuthorityStore.prototype.showAuthorityGroupForm = function(authorityGroup) {
    this.authorityGroupFormShow = true;
    this.editAuthorityGroup = authorityGroup;
};

//关闭右侧编辑权限组面板
AuthorityStore.prototype.closeAuthorityGroupForm = function() {
    this.authorityGroupFormShow = false;
    this.editAuthorityGroup = {};
    this.searchContent = '';
};

//展示右侧编辑面板
AuthorityStore.prototype.showAuthorityForm = function(obj) {
    this.authorityFormShow = true;//展示form表单
    this.showAuthorityInfoFlag = false;//隐藏权限具体信息标签
    this.isEditAuthority = false;//不是编辑权限具体信息 隐藏返回按钮
    this.showAuthorityInfo = emptyAuthority;//添加时权限信息为空
    if (obj.authorityGroup) {
        this.authorityGroupInfo = obj.authorityGroup;
    } else {
        this.authorityGroupInfo = emptyAuthorityGroupInfo;
    }

    if (obj.flag == 'addAuthorityGroup') {
        this.isAddAuthorityGroup = true;
    } else {
        this.isAddAuthorityGroup = false;
    }
};

//隐藏右侧编辑面板
AuthorityStore.prototype.hideAuthorityForm = function() {
    this.authorityFormShow = false;
};

//展示删除角色时的提示框
AuthorityStore.prototype.showModalDialog = function(authorityGroup) {
    authorityGroup.modalDialogFlag = true;
};

//隐藏删除角色时的提示框
AuthorityStore.prototype.hideModalDialog = function(authorityGroup) {
    authorityGroup.modalDialogFlag = false;
};

//展示修改组名的文本框
AuthorityStore.prototype.showEditClassifyNameInput = function(authorityGroup) {
    authorityGroup.isShowEditInput = true;
};

//隐藏右侧编辑面板
AuthorityStore.prototype.hideEditClassifyNameInput = function(authorityGroup) {
    authorityGroup.isShowEditInput = false;
};

//展示删除权限组的提示框
AuthorityStore.prototype.showAuthorityModalDialog = function(authority) {
    authority.modalDialogFlag = true;
};

//隐藏删除权限组的提示框
AuthorityStore.prototype.hideAuthorityModalDialog = function(authority) {
    authority.modalDialogFlag = false;
};

//查看权限的具体信息（展示右侧面板）
AuthorityStore.prototype.showAuthorityInfoFnc = function(authority) {
    this.showAuthorityInfoFlag = true;
    this.showAuthorityInfo = authority;
    this.authorityInfo(authority);
};

//编辑权限的具体信息（隐藏具体信息展示form表单）
AuthorityStore.prototype.hideAuthorityInfoFnc = function(authority) {
    this.showAuthorityInfoFlag = false;
    this.isEditAuthority = true;
    this.showAuthorityInfo = authority;
    this.authorityInfo(authority);
};

//获取需要展示的权限信息
AuthorityStore.prototype.authorityInfo = function(authority) {
    if (authority) {
        this.showAuthorityInfo = authority;
    } else {
        this.showAuthorityInfo = emptyAuthority;
    }
};

//修改权限组名后的处理
AuthorityStore.prototype.editAuthorityGroupName = function(authorityGroup) {
    var editAuthorityGroup = this.editAuthorityGroup;
    if (authorityGroup.type != 'turn') {
        //修改组名
        if (_.isArray(this.authorityGroupList) && this.authorityGroupList.length > 0) {
            this.authorityGroupList.forEach(function(group) {
                if (group.permissionGroupName == editAuthorityGroup.permissionGroupName) {
                    //修改列表中对应组的组名
                    group.permissionGroupName = authorityGroup.permissionGroupName;
                }
            });
        }
        //修改当前正在展示的编辑组的组名
        editAuthorityGroup.permissionGroupName = authorityGroup.classifyName;
    } else {
        //转移权限到其他组
        var turnIds = authorityGroup.authorityIDs.split(',') || [];
        var turnAuthorityList = [];
        if (turnIds.length > 0) {
            //把编辑权限组中转移走的权限去掉
            if (_.isArray(editAuthorityGroup.permissionList) && editAuthorityGroup.permissionList.length > 0) {
                editAuthorityGroup.permissionList = _.filter(editAuthorityGroup.permissionList, function(permission) {
                    if (turnIds.indexOf(permission.permissionId) < 0) {
                        return true;
                    } else {
                        turnAuthorityList.push(permission);
                    }
                });
            }
            // 权限组列表的刷新
            if (_.isArray(this.authorityGroupList) && this.authorityGroupList.length > 0) {

                var _this = this;
                this.authorityGroupList = _.filter(this.authorityGroupList, function(group) {

                    if (group.permissionGroupName == authorityGroup.classifyName) {
                        // 移入权限
                        if (turnAuthorityList.length > 0) {
                            turnAuthorityList.forEach(function(authority) {
                                group.permissionList.push(authority);
                            });
                        }
                    }

                    if (group.permissionGroupName == editAuthorityGroup.permissionGroupName) {
                        // 重置被移除权限的分组
                        group = editAuthorityGroup;
                        //该权限组没有权限时，删除该组
                        if (group.permissionList.length == 0) {
                            _this.authorityGroupFormShow = false;//关闭修改面板
                            _this.editAuthorityGroup = {};
                            return false;
                        }
                    }
                    return true;
                });
            }

        }
    }
};
//设置状态seacrhContent
AuthorityStore.prototype.setSearchContent = function(inputContent) {
    this.searchContent = inputContent;
};
//点击编辑按钮，判断是否要设置搜索框中的内容为空
AuthorityStore.prototype.beforeEditAuthority = function(authorityGroup) {
    if (authorityGroup.permissionGroupName !== this.editAuthorityGroup.permissionGroupName){
        this.setSearchContent('');
    }
};

module.exports = alt.createStore(AuthorityStore, 'AuthorityStore');