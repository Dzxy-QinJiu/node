/**
 * Created by wangliping on 2016/10/18.
 */
var OrganizationAction = require("../action/organization-actions");
//没有组织时的提示信息
var organizationIsNull = "organization-is-null";
function OrganizationStore() {
    this.organizationList = [];//组织分组列表
    this.organizationListArray = [];//组织分组树形列表
    this.searchOrganizationTree = [];//搜索后的组织树列表
    this.organizationMemberList = [];//组织成员列表
    this.curShowTeamMemberObj = {};//当前展示组织id、name、owner、users对象
    this.isEditMember = false;//是否是编辑成员操作
    this.isAddMember = false;//是否是添加成员操作
    this.deleteGroupItem = {};
    this.showMemberOperationBtn = true;
    this.isLoadingOrganization = false;//正在加载组织
    this.isLoadingTeamMember = false;//正在加载组织成员
    this.teamMemberListTipMsg = "";//获取组织成员列表时，错误/暂无数据的提示
    this.organizationLisTipMsg = "";//获取组织列表时，错误/暂无数据的提示
    this.delOrganizationErrorMsg = "";//删除组织失败时的提示信息
    this.isAddOrganizationRoot = false;//是否是添加根组织
    this.searchContent = "";//搜索内容

    this.bindActions(OrganizationAction);
}

//清空搜索条件时，还原所有组织及组织关系
OrganizationStore.prototype.resetSearchOrganization = function() {
    this.organizationList.forEach(group => {
        delete group.select;
        delete group.isLiSelect;
    });
    this.organizationTree();
};

//搜索内容的设置
OrganizationStore.prototype.setSearchContent = function(searchContent) {
    this.searchContent = searchContent;
};

/**递归遍历组织树，根据组织名查找组织
 * @param groupList 要过滤的组织列表
 * @param name 过滤组织名中包含name的组织
 * @param filterGroupArray 将组织名中包含name的组织存入filterGroupArray中
 */
OrganizationStore.prototype.findGroupListByName = function(groupList, name, filterGroupArray) {
    groupList.forEach(group => {
        if (group.title.indexOf(name) != -1) {
            filterGroupArray.push(group);
        } else if (_.isArray(group.children) && group.children.length > 0) {
            this.findGroupListByName(group.children, name, filterGroupArray);
        }
    });
};
//递归遍历去掉之前选中的组织
OrganizationStore.prototype.delSelectOrganization = function(groupList) {
    groupList.forEach(group => {
        delete group.select;
        delete group.isLiSelect;
        if (_.isArray(group.children) && group.children.length > 0) {
            this.delSelectOrganization(group.children);
        }
    });
};
//根据组织名称搜索组织
OrganizationStore.prototype.filterByOrganizationName = function(groupName) {
    //去掉之前选中的组织
    this.organizationList.forEach(group => {
        delete group.select;
        delete group.isLiSelect;
    });
    this.delSelectOrganization(this.organizationListArray);
    //递归遍历组织树，根据组织名查找组织
    var filterGroupArray = [];
    this.findGroupListByName(this.organizationListArray, groupName, filterGroupArray);
    //默认展示第一个组织的成员
    if (filterGroupArray.length > 0) {
        filterGroupArray[0].select = true;
        filterGroupArray[0].isLiSelect = true;
        //获取第一个组织的成员
        this.setTeamMemberLoading(true);
        OrganizationAction.getOrganizationMemberList(filterGroupArray[0].key);
        this.curShowTeamMemberObj = {
            groupId: filterGroupArray[0].key,
            groupName: filterGroupArray[0].title
        };
    }
    this.searchOrganizationTree = filterGroupArray;
};

/**
 * 递归遍历树形组织列表，根据id找到添加子组织的组织并将新增的子组织加入
 * @param treeGroupList
 * @param parentId
 * @param newGroup
 */
OrganizationStore.prototype.findGroupByIdAddGroup = function(treeGroupList, parentId, newGroup) {
    //some:一旦找到符合条件的元素返回真值后，便中断list的遍历
    _.some(treeGroupList, group => {
        //找到要添加子组织的组织
        if (group.key == parentId) {
            //有子组织时，直接push即可
            if (group.children && _.isArray(group.children)) {
                group.children.push(newGroup);
            } else {
                //没有子组织时，新建子组织
                group.children = [newGroup];
            }
            return true;//中断list的遍历
        } else if (_.isArray(group.children) && group.children.length > 0) {
            //没找到，则查找其子组织中有没有要添加子组织的组织
            this.findGroupByIdAddGroup(group.children, parentId, newGroup);
        }
    });
};
//添加后刷新组织列表
OrganizationStore.prototype.refreshGroupListAfterAdd = function(addGroup) {
    //新组织所有者的处理,新增组织时，返回的负责人为“null”,
    // “null”是后台接口避免免组织负责人为当前添加组织的成员设置的值（解决一人存在多个组织中的问题）
    if (addGroup.owner_id && addGroup.owner_id == "null") {
        delete addGroup.owner_id;
    }
    this.organizationList.push(addGroup);
    let newGroup = {
        title: addGroup.group_name,
        key: addGroup.group_id,
        userIds: addGroup.user_ids,
        ownerId: addGroup.owner_id,
        managerIds: addGroup.manager_ids,
        category: addGroup.category
    };
    //添加子组织
    if (addGroup.parent_group) {
        newGroup.parent_group = addGroup.parent_group;
        this.findGroupByIdAddGroup(this.organizationListArray, newGroup.parent_group, newGroup);
    } else {
        //添加根组织
        this.organizationListArray.push(newGroup);
    }

};

//修改组织名称后更新列表中对应组织的名称
OrganizationStore.prototype.updateOrganizationNameAfterEdit = function(editOrganization) {
    let organization = _.find(this.organizationList, team => team.group_id == editOrganization.key);
    organization.group_name = editOrganization.title;
    //递归遍历树形团队列表，根据id找团队并修改名称
    this.findGroupByIdEditName(this.organizationListArray, editOrganization);
};
/**
 * 递归遍历树形组织列表，根据id找组织并修改名称
 * @param treeGroupList
 * @param editOrganization
 */
OrganizationStore.prototype.findGroupByIdEditName = function(treeGroupList, editGroup) {
    //some:一旦找到符合条件的元素返回真值后，便中断list的遍历
    _.some(treeGroupList, group => {
        //找到要修改名称的组织
        if (group.key == editGroup.key) {
            group.title = editGroup.title;
            return true;//中断list的遍历
        } else if (_.isArray(group.children) && group.children.length > 0) {
            //没找到，则查找其子组织中有没有要修改名称的组织
            this.findGroupByIdEditName(group.children, editGroup);
        }
    });
};

//设置正在加载组织的标志
OrganizationStore.prototype.setOrganizationLoading = function(flag) {
    this.isLoadingOrganization = flag;
    this.organizationLisTipMsg = "";
};

//获取组织分组列表
OrganizationStore.prototype.getOrganizationList = function(resultData) {
    this.isLoadingOrganization = false;
    this.deleteGroupItem = {};
    if (_.isString(resultData)) {
        this.organizationLisTipMsg = resultData;
    } else {
        if (_.isArray(resultData) && resultData.length > 0) {
            this.showMemberOperationBtn = false;
            this.organizationLisTipMsg = "";
            this.organizationList = resultData;
            this.organizationTree();
        } else {
            this.organizationList = [];
            this.showMemberOperationBtn = true;
            this.isAddMember = false;
            this.isEditMember = false;
            this.curShowTeamMemberObj = {};
            this.organizationLisTipMsg = organizationIsNull;
        }
    }

};

//设置正在获取组织成员的标志
OrganizationStore.prototype.setTeamMemberLoading = function(flag) {
    this.isLoadingTeamMember = flag;
    this.teamMemberListTipMsg = "";
};

//修改组织成员成功后的处理
OrganizationStore.prototype.afterEditMember = function(data) {
    if (data) {
        this.isEditMember = false;
        //当前展示组的信息
        var curTeamId = data.groupId;
        var curShowTeam = _.find(this.organizationList, function(team) {
            if (team.group_id == curTeamId) {
                return true;
            }
        });
        let useIds = data.userIds ? JSON.parse(data.userIds) : [];
        if (data.operate == "exchange") {
            //修改
            if (data.type == "user") {
                //成员设为管理员
                if (_.isArray(curShowTeam.manager_ids) && curShowTeam.manager_ids.length) {
                    curShowTeam.manager_ids = curShowTeam.manager_ids.concat(useIds);
                } else {
                    curShowTeam.manager_ids = useIds;
                }
                curShowTeam.user_ids = _.difference(curShowTeam.user_ids, useIds);
            } else {
                //管理员设为成员
                if (_.isArray(curShowTeam.user_ids) && curShowTeam.user_ids.length) {
                    curShowTeam.user_ids = curShowTeam.user_ids.concat(useIds);
                } else {
                    curShowTeam.user_ids = useIds;
                }
                curShowTeam.manager_ids = _.difference(curShowTeam.manager_ids, useIds);
            }
        } else {
            //删除
            if (data.type == "user") {
                //成员
                curShowTeam.user_ids = _.difference(curShowTeam.user_ids, useIds);
            } else {
                //管理员
                curShowTeam.manager_ids = _.difference(curShowTeam.manager_ids, useIds);
            }
        }
        //更新左侧组织树中对应组织的成员信息
        this.organizationTree(true);
    }
};

//添加组织内的成员成功后的处理
OrganizationStore.prototype.afterAddMember = function(data) {
    //关闭添加面板
    this.isAddMember = false;
    if (data) {
        //当前展示组的信息
        var curTeamId = data.groupId;
        var curShowTeam = _.find(this.organizationList, function(team) {
            if (team.group_id == curTeamId) {
                return true;
            }
        });

        //添加成员后
        var userIds = JSON.parse(data.userIds);
        if (_.isArray(userIds) && userIds.length) {
            //if (_.isArray(this.organizationList) && this.organizationList.length) {
            //    //从其他组织中，过滤掉添加成员组织里新加入的成员（避免一个人存在多个组织中）
            //    userIds.forEach(userId=> {
            //        //更新组织列表中组织的人数
            //        _.each(this.organizationList, organization=> {
            //            if (organization.group_id != curShowTeam.group_id) {
            //                if (organization.owner_id && organization.owner_id == userId) {
            //                    //如果新增成员中，有一个是该组织的负责人，则删除
            //                    delete organization.owner_id;
            //                } else if (_.isArray(organization.user_ids) && organization.user_ids.length) {
            //                    //成员列表的过滤
            //                    organization.user_ids = _.filter(organization.user_ids, id=> id != userId);
            //                }
            //            }
            //        });
            //    });
            //}
            //该组织中原来就有成员则加入新增成员，原来无成员则新建成员列表
            if (_.isArray(curShowTeam.user_ids) && curShowTeam.user_ids.length > 0) {
                curShowTeam.user_ids = _.union(curShowTeam.user_ids, userIds);
            } else {
                curShowTeam.user_ids = userIds;
            }
        }
        //更新左侧组织树中对应组织的成员信息
        this.organizationTree(true);
    }
};

//获取当前组织的成员列表
OrganizationStore.prototype.getOrganizationMemberList = function(resultData) {
    this.isLoadingTeamMember = false;
    if (_.isString(resultData)) {
        //获取失败、出错的提示信息
        this.teamMemberListTipMsg = resultData;
    } else {
        if (_.isArray(resultData) && resultData.length > 0) {
            this.organizationMemberList = resultData;
            this.teamMemberListTipMsg = "";
            var _this = this;
            //当前展示组的信息
            var curTeamId = _this.curShowTeamMemberObj.groupId;
            var curShowTeam = _.find(_this.organizationList, function(team) {
                if (team.group_id == curTeamId) {
                    return true;
                }
            });
            //负责人
            if (curShowTeam.owner_id) {
                this.curShowTeamMemberObj.owner = _.find(_this.organizationMemberList, function(member) {
                    if (curShowTeam.owner_id == member.userId) {
                        return true;
                    }
                });
            } else {
                delete this.curShowTeamMemberObj.owner;
            }
            //管理员
            if (curShowTeam.manager_ids) {
                var managers = [];
                curShowTeam.manager_ids.forEach(function(id) {
                    var manager = _.find(_this.organizationMemberList, function(member) {
                        if (id == member.userId) {
                            return true;
                        }
                    });
                    if (manager) {
                        managers.push(manager);
                    }
                });
                this.curShowTeamMemberObj.managers = managers;
            }
            //成员
            if (curShowTeam.user_ids) {
                var users = [];
                curShowTeam.user_ids.forEach(function(id) {
                    var user = _.find(_this.organizationMemberList, function(member) {
                        if (id == member.userId) {
                            return true;
                        }
                    });
                    if (user) {
                        users.push(user);
                    }
                });
                this.curShowTeamMemberObj.users = users;
            }
        } else {
            //暂无数据的提示
            this.teamMemberListTipMsg = Intl.get("common.no.member");
            this.organizationMemberList = [];
        }
    }
    this.isAddMember = false;
    this.isEditMember = false;
};

OrganizationStore.prototype.deleteGroup = function(deleteGroupItem) {
    deleteGroupItem.modalDialogFlag = true;
    this.deleteGroupItem = deleteGroupItem;
};

OrganizationStore.prototype.hideModalDialog = function(deleteGroupItem) {
    deleteGroupItem.modalDialogFlag = false;
};

//编辑成员
OrganizationStore.prototype.getIsEditMember = function() {
    this.isAddMember = false;
    this.isEditMember = true;
};

//取消编辑成员
OrganizationStore.prototype.cancelEditMember = function() {
    this.isEditMember = false;
};

//添加成员
OrganizationStore.prototype.getIsAddMember = function() {
    this.isEditMember = false;
    this.isAddMember = true;

};

//取消添加成员
OrganizationStore.prototype.cancelAddMember = function() {
    this.isAddMember = false;

};


//当前查看的组织组ID
OrganizationStore.prototype.setSelectOrganizationGroup = function(selectOrganizationGroupId) {
    this.curShowTeamMemberObj = {groupId: selectOrganizationGroupId};
    var curOrganization = _.find(this.organizationList, function(team) {
        if (team.group_id == selectOrganizationGroupId) {
            return true;
        }
    });
    this.curShowTeamMemberObj.groupName = curOrganization ? curOrganization.group_name : "";
};

//是否展示组编辑菜单
OrganizationStore.prototype.showOperationArea = function(item) {
    if (item.isShowOperationArea) {
        item.isShowOperationArea = false;
    } else {
        item.isShowOperationArea = true;
    }
};

//隐藏所有展示组编辑菜单
OrganizationStore.prototype.hideAllOperationArea = function() {
    (this.organizationList).map(function(item, key) {
        if (item.isShowOperationArea) {
            item.isShowOperationArea = false;
        }
    });
    this.organizationTree(true);
};

//删除组织后的处理
OrganizationStore.prototype.saveDeleteGroup = function(result) {
    if (result.success) {
        //删除组织成功，过滤掉删除的组织
        this.organizationList = _.filter(this.organizationList, team => team.group_id != result.groupId);
        //刷新组织树
        this.organizationList.forEach(group => {
            delete group.select;
            delete group.isLiSelect;
        });
        this.organizationTree();
    } else {
        //删除组织失败
        this.delOrganizationErrorMsg = result.errorMsg;
    }
};

//清楚删除失败的提示信息
OrganizationStore.prototype.clearDelGroupErrorMsg = function() {
    this.delOrganizationErrorMsg = "";
};

OrganizationStore.prototype.addOrganizationRoot = function() {
    this.isAddOrganizationRoot = true;
};
//展示组修改表单
OrganizationStore.prototype.editGroup = function(item) {
    item.isEditGroup = true;
    item.isShowOperationArea = false;
};

//取消展示组修改表单
OrganizationStore.prototype.cancelEditGroup = function(item) {
    item.isEditGroup = false;
};

//展示组添加表单
OrganizationStore.prototype.addGroup = function(item) {
    item.isAddGroup = true;
    item.isShowOperationArea = false;
};

//取消展示组添加表单
OrganizationStore.prototype.cancelAddGroup = function(item) {
    if (item) {
        //关闭添加该组织添加子组织的面板
        item.isAddGroup = false;
    } else {
        //关闭根组织添加面板
        this.isAddOrganizationRoot = false;
    }
};

OrganizationStore.prototype.selectTree = function(groupId) {
    var parentGroup = "";
    this.organizationList.map(function(item, key) {
        if (item.group_id == groupId) {
            item.select = true;
            if (!item.isLiSelect) {
                //点击展开该组织下的子组织
                item.isLiSelect = true;
                if (item.parent_group) {
                    parentGroup = item.parent_group;
                }
            }
        } else {
            item.select = false;
        }
    });
    //展开该组织下的子组织
    if (parentGroup) {
        this.checkIsLiSelect(parentGroup);
    }
    this.organizationTree(true);
};

OrganizationStore.prototype.toggleGroupTree = function(groupId) {
    var parentGroup = "";
    this.organizationList.map(function(item, key) {
        if (item.group_id == groupId) {
            item.isLiSelect = !item.isLiSelect;
            if (item.parent_group) {
                parentGroup = item.parent_group;
            }
        }
    });

    if (parentGroup) {
        this.checkIsLiSelect(parentGroup);
    }
    this.organizationTree(true);
};
//搜索条件下，搜索后组织树的设置
OrganizationStore.prototype.setSearchOrganizationTree = function() {
    if (this.searchContent) {
        let filterGroupArray = [];
        this.findGroupListByName(this.organizationListArray, this.searchContent, filterGroupArray);
        this.searchOrganizationTree = filterGroupArray;
    }
};

OrganizationStore.prototype.checkIsLiSelect = function(parentGroup) {
    var nowParentGroup = "";
    (this.organizationList).map(function(item, key) {
        if (item.group_id == parentGroup) {
            item.isLiSelect = true;
            if (item.parent_group) {
                nowParentGroup = item.parent_group;
            }
        }
    });

    if (nowParentGroup) {
        this.checkIsLiSelect(nowParentGroup);
    }
};

//判断当前是否有选中的组织
OrganizationStore.prototype.checkSelectTree = function() {
    var selectObj = {
        isFirstSelect: true,//是否是第一次渲染组织的成员展示
        isFirstLiSelect: true//是否是第一次展开组织
    };
    (this.organizationList).map(function(item, kry) {
        if (item.select != undefined) {
            //有展示过则不是第一次
            selectObj.isFirstSelect = false;
        }
        if (item.isLiSelect != undefined) {
            //有展开过则不是第一次
            selectObj.isFirstLiSelect = false;
        }
    });
    return selectObj;
};

OrganizationStore.prototype.organizationTree = function(flag) {
    var isSelectObj = this.checkSelectTree();
    var organizationList = this.organizationList;
    var organizationArray = [];
    var newOrganizationList = [];
    for (var i = 0; i < organizationList.length; i++) {
        var organization = organizationList[i];
        if (!organization.parent_group) {
            organizationArray.push({
                title: organization.group_name,
                key: organization.group_id,
                select: organization.select,
                isLiSelect: organization.isLiSelect,
                userIds: organization.user_ids,
                managerIds: organization.manager_ids,
                ownerId: organization.owner_id,
                category: organization.category
            });
        } else {
            newOrganizationList.push(organization);
        }
    }
    this.organizationChildrenTree(newOrganizationList, organizationArray);

    if (organizationArray.length > 0 && (isSelectObj.isFirstSelect || isSelectObj.isFirstLiSelect)) {
        if (isSelectObj.isFirstSelect) {
            //没有展示过成员的组织，没有默认展示第一个组织的成员
            organizationArray[0].select = true;
        }
        if (isSelectObj.isFirstLiSelect) {
            //没有展开过组织，默认展开第一个组织
            organizationArray[0].isLiSelect = true;
        }
        for (var j = 0, len = this.organizationList.length; j < len; j++) {
            var item = this.organizationList[j];
            if (item.group_id == organizationArray[0].key) {
                item.select = organizationArray[0].select;
                item.isLiSelect = organizationArray[0].isLiSelect;
                break;
            }
        }
    }

    this.organizationListArray = organizationArray;

    if (organizationArray.length > 0 && !flag) {
        this.setTeamMemberLoading(true);
        OrganizationAction.getOrganizationMemberList(organizationArray[0].key);
        this.curShowTeamMemberObj = {
            groupId: organizationArray[0].key,
            groupName: organizationArray[0].title
        };
    }
    this.setSearchOrganizationTree();
};

OrganizationStore.prototype.organizationChildrenTree = function(organizationList, organizationArray) {
    var newOrganizationList = [];
    for (var i = 0; i < organizationList.length; i++) {
        var organization = organizationList[i];
        var flag = false;

        for (var j = 0; j < organizationArray.length; j++) {
            if (organization.parent_group == organizationArray[j].key) {
                organizationArray[j].children = organizationArray[j].children ? organizationArray[j].children : [];
                organizationArray[j].children.push({
                    title: organization.group_name,
                    key: organization.group_id,
                    select: organization.select,
                    isLiSelect: organization.isLiSelect,
                    ownerId: organization.owner_id,
                    managerIds: organization.manager_ids,
                    userIds: organization.user_ids,
                    category: organization.category,
                    superiorTeam: organizationArray[j].key//上级组织的id
                });
                flag = false;
                break;
            } else {
                flag = true;
            }
        }
        if (flag) {
            newOrganizationList.push(organization);
        }
    }
    if (newOrganizationList.length > 0) {
        for (var k = 0; k < organizationArray.length; k++) {
            if (organizationArray[k].children) {
                this.organizationChildrenTree(newOrganizationList, organizationArray[k].children);
            }
        }
    }
};

module.exports = alt.createStore(OrganizationStore, 'OrganizationStore');