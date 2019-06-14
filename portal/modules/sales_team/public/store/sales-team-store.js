/**
 * Created by xiaojinfeng on 2016/04/08.
 */
var SalesTeamActions = require('../action/sales-team-actions');
//没有团队时的提示信息
var salesTeamIsNull = 'sales-team-is-null';
function SalesTeamStore() {
    this.salesTeamList = [];//团队分组列表
    this.salesTeamListArray = [];//团队分组树形列表
    this.searchSalesTeamTree = [];//搜索后的团队树列表
    this.salesTeamMemberList = [];//团队成员列表 x
    this.curShowTeamMemberObj = {};//当前展示团队id、name、owner、managers、users对象
    this.addMemberList = [];//添加成员时成员列表
    this.isEditMember = false;//是否是编辑成员操作
    this.isAddMember = false;//是否是添加成员操作
    this.deleteGroupItem = {};
    this.showMemberOperationBtn = true;
    this.isLoadingSalesTeam = false;//正在加载销售团队
    this.isLoadingTeamMember = false;//正在加载销售团队成员
    this.teamMemberListTipMsg = '';//获取团队成员列表时，错误/暂无数据的提示
    this.addMemberListTipMsg = '';//获取可添加成员列表时，错误/暂无数据的提示
    this.salesTeamLisTipMsg = '';//获取销售团队列表时，错误/暂无数据的提示
    this.searchContent = '';//搜索内容
    this.delTeamErrorMsg = '';//删除团队失败的错误提示
    this.isAddSalesTeamRoot = false;//是否是添加根团队
    this.isLoadingSalesGoal = false;//正在获取销售目标
    this.getSalesGoalErrMsg = '';//获取销售目标出错
    this.salesGoals = {};//销售目标
    this.teamMemberCountList = [];//统计团队内成员个数的列表
    this.userInfoShow = false;
    this.userFormShow = false;
    this.rightPanelShow = false;
    this.isEditGroupFlag = false; // 是否编辑部门，默认false
    this.selectedRowIndex = -1; // 点击的行索引， 默认不选中
    this.curEditGroup = {}; // 当前编辑的部门
    this.bindActions(SalesTeamActions);
}
SalesTeamStore.prototype.showUserInfoPanel = function(index) {
    this.userInfoShow = true;
    this.userFormShow = false;
    this.rightPanelShow = true;
    this.selectedRowIndex = index;
};
SalesTeamStore.prototype.closeRightPanel = function() {
    this.rightPanelShow = false;
    this.userInfoShow = false;
    this.selectedRowIndex = -1;
};
//获取统计团队内成员个数的列表
SalesTeamStore.prototype.getTeamMemberCountList = function(list) {
    this.teamMemberCountList = _.isArray(list) ? list : [];
};
//获取销售目标
SalesTeamStore.prototype.getSalesGoals = function(reqObj) {
    if (reqObj.loading){
        this.isLoadingSalesGoal = true;
        this.getSalesGoalErrMsg = '';
    }else if (reqObj.error){
        this.isLoadingSalesGoal = false;
        this.getSalesGoalErrMsg = reqObj.errorMsg;
    }else{
        this.isLoadingSalesGoal = false;
        this.getSalesGoalErrMsg = '';
        var salesGoals = reqObj.result;
        this.salesGoals = _.isObject(salesGoals) ? salesGoals : {};
        //将个人的销售目标默认没有值
        this.salesGoals.member_goal = '';
    }

};
//更新销售目标
SalesTeamStore.prototype.updateSalesGoals = function(updateObj) {
    let salesGoals = updateObj.salesGoals;
    if (updateObj.type === 'member') {
        //个人销售目标
        this.salesGoals.users = salesGoals.users;
        //将第一个成员的销售目标作为个人销售目标放到外层，便于界面上的处理
        if (_.isArray(salesGoals.users) && salesGoals.users.length) {
            let userGoal = salesGoals.users[0];
            this.salesGoals.member_goal = userGoal ? userGoal.goal : '';
        } else {
            this.salesGoals.member_goal = '';
        }
    } else if (updateObj.type === 'team') {
        //团队销售目标
        this.salesGoals.id = salesGoals.id;
        this.salesGoals.goal = salesGoals.goal;
    }
};
//清空根据团队名称进行搜索的搜索条件时，还原所有团队及团队关系
SalesTeamStore.prototype.resetSearchSalesTeam = function() {
    this.salesTeamLisTipMsg = '';//清空搜索时，清空没有符合条件的团队的提示
    this.salesTeamList.forEach(team => {
        delete team.select;
        delete team.isLiSelect;
    });
    this.salesTeamTree();
};

//搜索内容的设置
SalesTeamStore.prototype.setSearchContent = function(searchContent) {
    this.searchContent = searchContent;
};
/**递归遍历树，根据团队名查找团队
 * @param groupList 要过滤的团队列表
 * @param name 过滤团队名中包含name的团队
 * @param filterGroupArray 将团队名中包含name的团队存入filterGroupArray中
 * @param delSelect 是否删除团队的选中标识
 */
SalesTeamStore.prototype.findGroupListByName = function(groupList, name, filterGroupArray) {
    groupList.forEach(group => {
        if (group.title.indexOf(name) !== -1) {
            filterGroupArray.push(group);
        } else if (_.isArray(group.children) && group.children.length > 0) {
            this.findGroupListByName(group.children, name, filterGroupArray);
        }
    });
};

//递归遍历去掉之前选中的团队
SalesTeamStore.prototype.delSelectSalesTeam = function(groupList) {
    groupList.forEach(group => {
        delete group.select;
        delete group.isLiSelect;
        if (_.isArray(group.children) && group.children.length > 0) {
            this.delSelectSalesTeam(group.children);
        }
    });
};

//根据团队名称搜索团队
SalesTeamStore.prototype.filterByTeamName = function(teamName) {
    //去掉之前选中的组织
    this.salesTeamList.forEach(group => {
        delete group.select;
        delete group.isLiSelect;
    });
    this.delSelectSalesTeam(this.salesTeamListArray);
    //递归遍历组织树，根据组织名查找组织
    let filterTeamArray = [];
    this.findGroupListByName(this.salesTeamListArray, teamName, filterTeamArray);
    //默认展示第一个团队的成员
    if (filterTeamArray.length > 0) {
        filterTeamArray[0].select = true;
        filterTeamArray[0].isLiSelect = true;
        //获取第一个团队的成员
        this.setTeamMemberLoading(true);
        //第一个团队的销售目标
        setTimeout(() => {
            SalesTeamActions.getSalesGoals(filterTeamArray[0].key);
        });
        SalesTeamActions.getSalesTeamMemberList(filterTeamArray[0].key);
        this.curShowTeamMemberObj = {
            groupId: filterTeamArray[0].key,
            groupName: filterTeamArray[0].title
        };
    }
    this.searchSalesTeamTree = filterTeamArray;
};

//根据成员昵称、用户名搜索团队
SalesTeamStore.prototype.filterByUserName = function(filterTeamList) {
    var filterTeamArray = [];
    if (_.isArray(filterTeamList) && filterTeamList.length > 0) {
        filterTeamArray = filterTeamList.map(function(team) {
            return {
                title: team.group_name,
                key: team.group_id,
                userIds: team.user_ids,
                ownerId: team.owner_id,
                managerIds: team.manager_ids,
                availableNum: team.available_num
            };
        });
    }

    //默认展示第一个团队的成员
    if (filterTeamArray.length > 0) {
        filterTeamArray[0].select = true;
        filterTeamArray[0].isLiSelect = true;
        //获取第一个团队的成员
        this.setTeamMemberLoading(true);
        //第一个团队的销售目标
        setTimeout(() => {
            SalesTeamActions.getSalesGoals(filterTeamArray[0].key);
        });
        SalesTeamActions.getSalesTeamMemberList(filterTeamArray[0].key);
        this.curShowTeamMemberObj = {
            groupId: filterTeamArray[0].key,
            groupName: filterTeamArray[0].title
        };
    } else {
        this.curShowTeamMemberObj = {};
        this.salesTeamLisTipMsg = Intl.get('sales.team.no.filtered.sale.team', '暂无符合条件销售团队');
    }
    this.salesTeamListArray = filterTeamArray;
};
/**
 * 递归遍历树形团队列表，根据id找到添加子团队的团队并将新增的子团队加入
 * @param treeGroupList
 * @param parentId
 * @param newTeam
 */
SalesTeamStore.prototype.findGroupByIdAddTeam = function(treeGroupList, parentId, newTeam) {
    //some:一旦找到符合条件的元素返回真值后，便中断list的遍历
    _.some(treeGroupList, group => {
        //找到要添加子团队的团队
        if (group.key === parentId) {
            //有子团队时，直接push即可
            if (group.children && _.isArray(group.children)) {
                group.children.push(newTeam);
            } else {
                //没有子团队时，新建子团队
                group.children = [newTeam];
            }
            return true;//中断list的遍历
        } else if (_.isArray(group.children) && group.children.length > 0) {
            //没找到，则查找其子团队中有没有要添加子团队的团队
            this.findGroupByIdAddTeam(group.children, parentId, newTeam);
        }
    });
};
//添加后刷新团队列表
SalesTeamStore.prototype.refreshTeamListAfterAdd = function(addTeam) {
    this.salesTeamList.push(addTeam);
    let newTeam = {
        title: addTeam.group_name,
        key: addTeam.group_id,
        userIds: addTeam.user_ids,
        ownerId: addTeam.owner_id,
        managerIds: addTeam.manager_ids,
        availableNum: addTeam.available_num
    };
    //添加子团队
    if (addTeam.parent_group) {
        newTeam.parent_group = addTeam.parent_group;
        this.findGroupByIdAddTeam(this.salesTeamListArray, newTeam.parent_group, newTeam);
    } else {
        //添加根团队
        this.salesTeamListArray.push(newTeam);
    }

};
//修改团队名称后更新列表中对应团队的名称
SalesTeamStore.prototype.updateTeamNameAfterEdit = function(editTeam) {
    let team = _.find(this.salesTeamList, team => team.group_id === editTeam.key);
    team.group_name = editTeam.title;
    //递归遍历树形团队列表，根据id找团队并修改名称
    this.findGroupByIdEditName(this.salesTeamListArray, editTeam);
};
/**
 * 递归遍历树形团队列表，根据id找团队并修改名称
 * @param treeGroupList
 * @param editTeam
 */
SalesTeamStore.prototype.findGroupByIdEditName = function(treeGroupList, editTeam) {
    //some:一旦找到符合条件的元素返回真值后，便中断list的遍历
    _.some(treeGroupList, group => {
        //找到要修改名称的团队
        if (group.key === editTeam.key) {
            group.title = editTeam.title;
            return true;//中断list的遍历
        } else if (_.isArray(group.children) && group.children.length > 0) {
            //没找到，则查找其子团队中有没有要修改名称的团队
            this.findGroupByIdEditName(group.children, editTeam);
        }
    });
};

//设置正在加载销售团队的标志
SalesTeamStore.prototype.setSalesTeamLoading = function(flag) {
    this.isLoadingSalesTeam = flag;
    this.salesTeamLisTipMsg = '';
};

//获取团队分组列表
SalesTeamStore.prototype.getSalesTeamList = function(resultData) {
    this.isLoadingSalesTeam = false;
    this.deleteGroupItem = {};
    if (_.isString(resultData)) {
        this.salesTeamLisTipMsg = resultData;
    } else {
        if (_.isArray(resultData) && resultData.length > 0) {
            this.showMemberOperationBtn = false;
            this.salesTeamLisTipMsg = '';
            this.salesTeamList = resultData;
            this.salesTeamTree();
        } else {
            this.salesTeamList = [];
            this.showMemberOperationBtn = true;
            this.isAddMember = false;
            this.isEditMember = false;
            this.curShowTeamMemberObj = {};
            this.salesTeamLisTipMsg = salesTeamIsNull;
        }
    }

};

//添加成员时获取不属于任何团队的成员列表
SalesTeamStore.prototype.getMemberList = function(resultData) {
    if (_.isString(resultData)) {
        this.addMemberListTipMsg = resultData;
    } else {
        if (_.isArray(resultData) && resultData.length > 0) {
            this.addMemberList = resultData;
            this.addMemberListTipMsg = '';
        } else {
            this.addMemberList = [];
            this.addMemberListTipMsg = Intl.get('common.no.add.member', '暂无可添加成员');
        }
    }
};

//设置正在获取团队成员的标志
SalesTeamStore.prototype.setTeamMemberLoading = function(flag) {
    this.isLoadingTeamMember = flag;
    this.teamMemberListTipMsg = '';
};

//修改团队成员成功后的处理
SalesTeamStore.prototype.afterEditMember = function(data) {
    if (data) {
        this.isEditMember = false;
        //当前展示组的信息
        var curTeamId = data.group_id;
        var curShowTeam = _.find(this.salesTeamList, function(team) {
            if (team.group_id === curTeamId) {
                return true;
            }
        });
        if (data.user_ids) {
            data.user_ids = JSON.parse(data.user_ids);
        }
        if (data.type === 'owner') {//所有者的处理
            //删除所有者
            delete curShowTeam.owner_id;
            if (data.operate === 'move_manager') {//将所有者设为管理员
                if (_.isArray(curShowTeam.manager_ids) && curShowTeam.manager_ids.length) {
                    curShowTeam.manager_ids.push(data.owner_id);
                } else {
                    curShowTeam.manager_ids = [data.owner_id];
                }
            } else if (data.operate === 'move_member') {//将所有者设为普通成员
                if (_.isArray(curShowTeam.user_ids) && curShowTeam.user_ids.length) {
                    curShowTeam.user_ids.push(data.owner_id);
                } else {
                    curShowTeam.user_ids = [data.owner_id];
                }
            } else {//删除所有者后，将团队的人数减一
                this.delTeamMemberCount(curTeamId, [data.owner_id], 'owner');
            }
        } else if (data.type === 'manager') {//管理员的处理
            //删除选中的管理员
            curShowTeam.manager_ids = _.difference(curShowTeam.manager_ids, data.user_ids);
            if (data.operate === 'exchange_owner') {//将管理员设为所有者
                //将原所有者加到普通成员里
                if(curShowTeam.owner_id){
                    if (_.isEmpty(curShowTeam.user_ids)) {
                        curShowTeam.user_ids = [curShowTeam.owner_id];
                    } else {
                        curShowTeam.user_ids.push(curShowTeam.owner_id);
                    }
                }
                //团队所有者的更新
                curShowTeam.owner_id = data.user_ids[0];
            } else if (data.operate === 'exchange') {//将管理员设为普通成员
                if (_.isArray(curShowTeam.user_ids) && curShowTeam.user_ids.length) {
                    curShowTeam.user_ids = curShowTeam.user_ids.concat(data.user_ids);
                } else {
                    curShowTeam.user_ids = data.user_ids;
                }
            } else {//删除管理员后，将团队的人数统计减去删除的管理员的个数
                this.delTeamMemberCount(curTeamId, data.user_ids, 'manager');
            }
        } else if (data.type === 'user') {//普通成员的处理
            //删除选中的普通成员
            curShowTeam.user_ids = _.difference(curShowTeam.user_ids, data.user_ids);
            if (data.operate === 'exchange_owner') {//将普通成员设为所有者
                //将原所有者加到普通成员里
                if (_.isEmpty(curShowTeam.user_ids)) {
                    curShowTeam.user_ids = [curShowTeam.owner_id];
                } else {
                    curShowTeam.user_ids.push(curShowTeam.owner_id);
                }
                //团队所有者的更新
                curShowTeam.owner_id = data.user_ids[0];
            } else if (data.operate === 'exchange') {//将普通成员设为管理员
                if (_.isArray(curShowTeam.manager_ids) && curShowTeam.manager_ids.length) {
                    curShowTeam.manager_ids = curShowTeam.manager_ids.concat(data.user_ids);
                } else {
                    curShowTeam.manager_ids = data.user_ids;
                }
            } else {//删除成员后，将团队的人数统计减去删除的成员的个数
                this.delTeamMemberCount(curTeamId, data.user_ids, 'user');
            }
        }
        //更新左侧团队树中对应团队的成员信息
        this.salesTeamTree(true);
    }
};
/**
 * 删除团队的人数
 * @param curTeamId 删除成员的团队id
 * @param userIds:删除的成员id列表
 * @param memberType: 删除的是owner、manager还是user
 */
SalesTeamStore.prototype.delTeamMemberCount = function(curTeamId, userIds, memberType) {
    //删除的启用状态成员个数
    let delAvailableMemberCount = 0;
    _.each(userIds, userId => {
        let member = null;
        if (memberType === 'owner') {//所有者
            member = this.curShowTeamMemberObj.owner;
        } else {//manager、user
            member = _.find(this.curShowTeamMemberObj[memberType + 's'], member => member.userId === userId);
        }
        if (member && member.status === 1) {
            delAvailableMemberCount++;
        }
    });
    //删除后，将团队的人数统计删除对应个数
    let curTeamMemberCountObj = _.find(this.teamMemberCountList, item => item.team_id === curTeamId);
    if (curTeamMemberCountObj) {
        curTeamMemberCountObj.available[memberType] -= delAvailableMemberCount;
        curTeamMemberCountObj.total -= userIds.length;
    }
};

//添加团队内的成员成功后的处理
SalesTeamStore.prototype.afterAddMember = function(data) {
    if (data) {
        this.isAddFormShow = false;
        //当前展示组的信息
        var curTeamId = data.groupId;
        var curShowTeam = _.find(this.salesTeamList, function(team) {
            if (team.group_id === curTeamId) {
                return true;
            }
        });
        //添加成员后
        var userIds = JSON.parse(data.userIds);
        //添加的所有成员个数
        let addUserCount = _.isArray(userIds) ? userIds.length : 0;
        if (addUserCount) {
            //该团队中原来就有成员则加入新增成员，原来无成员则新建成员列表
            if (_.isArray(curShowTeam.user_ids) && curShowTeam.user_ids.length > 0) {
                userIds.forEach(function(id) {
                    curShowTeam.user_ids.push(id);
                });
            } else {
                curShowTeam.user_ids = userIds;
            }
            //添加成员后，将团队的人数统计加上新加的成员个数
            this.addTeamMemberCount(curTeamId, userIds);
        }
        //更新左侧团队树中对应团队的成员信息
        this.salesTeamTree(true);
    }
};
/**
 * 添加团队的人数
 * @param curTeamId 添加成员的团队id
 * @param userIds:添加的成员id列表
 */
SalesTeamStore.prototype.addTeamMemberCount = function(curTeamId, userIds) {
    let addUserCount = userIds.length;
    //添加的启用状态成员个数
    let addAvailableUserCount = 0;
    _.each(userIds, userId => {
        let user = _.find(this.addMemberList, member => member.userId === userId);
        if (user && user.status === 1) {
            addAvailableUserCount++;
        }
    });
    //添加成员后，将团队的人数统计加上新加的成员个数
    let curTeamMemberCountObj = _.find(this.teamMemberCountList, item => item.team_id === curTeamId);
    if (curTeamMemberCountObj) {
        curTeamMemberCountObj.available.user += addAvailableUserCount;
        curTeamMemberCountObj.total += addUserCount;
    } else {//给新加的团队添加成员时
        let newTeamCountObj = {
            available: {owner: 0, manager: 0, user: addAvailableUserCount},
            team_id: curTeamId,
            total: addUserCount
        };
        this.teamMemberCountList.push(newTeamCountObj);
    }
};
//获取当前团队的成员列表
SalesTeamStore.prototype.getSalesTeamMemberList = function(resultData) {
    this.isLoadingTeamMember = false;
    if (_.isString(resultData)) {
        //获取失败、出错的提示信息
        this.teamMemberListTipMsg = resultData;
    } else {
        if (_.isArray(resultData) && resultData.length > 0) {
            let salesTeamMemberList = resultData;
            this.salesTeamMemberList = resultData;
            this.teamMemberListTipMsg = '';
            //当前展示组的信息
            let curTeamId = _.get(this.curShowTeamMemberObj, 'groupId');
            let curShowTeam = _.find(this.salesTeamList, team => team.group_id === curTeamId);
            // 负责人
            let ownerId = _.get(curShowTeam, 'owner_id');
            if (ownerId) {
                this.curShowTeamMemberObj.owner = _.find(salesTeamMemberList, member => ownerId === member.userId);
                this.curShowTeamMemberObj.owner.role = 'owner';
            }
            // 秘书
            let managerIds = _.get(curShowTeam, 'manager_ids');
            if (managerIds) {
                let managers = [];
                _.each(managerIds, (id) => {
                    let manager = _.find(salesTeamMemberList, member => id === member.userId);
                    if (manager) {
                        manager.role = 'manager';
                        managers.push(manager);
                    }
                });
                this.curShowTeamMemberObj.managers = sortTeamMembers(managers);
            }
            //成员
            let userIds = _.get(curShowTeam, 'user_ids');
            if (userIds) {
                let users = [];
                _.each(userIds, (id) => {
                    let user = _.find(salesTeamMemberList, item => id === item.userId);
                    if (user) {
                        user.role = 'user';
                        users.push(user);
                    }
                });
                this.curShowTeamMemberObj.users = sortTeamMembers(users);
            }
        } else {
            this.salesTeamMemberList = [];
        }
    }
    this.isAddMember = false;
    this.isEditMember = false;
};
//将停用的成员排后面
function sortTeamMembers(list) {
    return list.sort(function(a, b) {
        return b.status - a.status;
    });
}
SalesTeamStore.prototype.deleteGroup = function(deleteGroupItem) {
    deleteGroupItem.isDeleteGroup = true;
    this.deleteGroupItem = deleteGroupItem;
};

SalesTeamStore.prototype.hideModalDialog = function(deleteGroupItem) {
    deleteGroupItem.isDeleteGroup = false;
};

SalesTeamStore.prototype.handleCancelDeleteGroup = function(item) {
    item.isDeleteGroup = false;
};

//编辑成员
SalesTeamStore.prototype.getIsEditMember = function() {
    this.isAddMember = false;
    this.isEditMember = true;
};

//取消编辑成员
SalesTeamStore.prototype.cancelEditMember = function() {
    this.isEditMember = false;
};

//添加成员
SalesTeamStore.prototype.getIsAddMember = function() {
    this.isEditMember = false;
    this.isAddMember = true;
};

//取消添加成员
SalesTeamStore.prototype.cancelAddMember = function() {
    this.isAddMember = false;

};

//当前查看的团队组ID
SalesTeamStore.prototype.setSelectSalesTeamGroup = function(selectSalesTeamGroupId) {
    this.curShowTeamMemberObj = {groupId: selectSalesTeamGroupId};
    var curSalesTeam = _.find(this.salesTeamList, function(team) {
        if (team.group_id === selectSalesTeamGroupId) {
            return true;
        }
    });
    this.curShowTeamMemberObj.groupName = curSalesTeam ? curSalesTeam.group_name : '';
};

//是否展示组编辑菜单
SalesTeamStore.prototype.showOperationArea = function(item) {
    if (item.isShowOperationArea) {
        item.isShowOperationArea = false;
    } else {
        item.isShowOperationArea = true;
    }
};

//隐藏所有展示组编辑菜单
SalesTeamStore.prototype.hideAllOperationArea = function() {
    (this.salesTeamList).map(function(item, key) {
        if (item.isShowOperationArea) {
            item.isShowOperationArea = false;
        }
    });
    this.salesTeamTree(true);
};

//删除团队后的处理
SalesTeamStore.prototype.saveDeleteGroup = function(result) {
    if (result.success) {
        //删除团队成功，过滤掉删除的团队
        this.salesTeamList = _.filter(this.salesTeamList, team => team.group_id !== result.groupId);
        //刷新团队树
        this.salesTeamList.forEach(team => {
            delete team.select;
            delete team.isLiSelect;
        });
        this.salesTeamTree();
    }
    //删除团队失败
    this.delTeamErrorMsg = result.errorMsg;
};
//清空删除团队失败的错误提示
SalesTeamStore.prototype.clearDelTeamErrorMsg = function() {
    this.delTeamErrorMsg = '';

};
//添加跟组织的标识设置
SalesTeamStore.prototype.addSalesTeamRoot = function() {
    this.isAddSalesTeamRoot = true;
};

//展示组修改表单
SalesTeamStore.prototype.editGroup = function(item) {
    this.curEditGroup = item;
    this.isEditGroupFlag = true;
    item.isEditGroup = true;
    item.isShowOperationArea = false;
};

//取消展示组修改表单
SalesTeamStore.prototype.cancelEditGroup = function(item) {
    item.isEditGroup = false;
    this.isEditGroupFlag = false;
    this.curEditGroup = {};
};

//展示组添加表单
SalesTeamStore.prototype.addGroup = function(item) {
    item.isAddGroup = true;
    item.isShowOperationArea = false;
};

//取消展示组添加表单
SalesTeamStore.prototype.cancelAddGroup = function(item) {
    if (item) {
        //关闭添加该组织添加子组织的面板
        item.isAddGroup = false;
    } else {
        //关闭根组织添加面板
        this.isAddSalesTeamRoot = false;
    }
};

SalesTeamStore.prototype.selectTree = function(groupId) {
    var parentGroup = '';
    this.salesTeamList.map(function(item, key) {
        if (item.group_id === groupId) {
            item.select = true;
            if (!item.isLiSelect) {
                //点击展开该团队下的子团队
                item.isLiSelect = true;
                if (item.parent_group) {
                    parentGroup = item.parent_group;
                }
            }
        } else {
            item.select = false;
        }
    });
    //展开该团队下的子团队
    if (parentGroup) {
        this.checkIsLiSelect(parentGroup);
    }
    this.salesTeamTree(true);
};

SalesTeamStore.prototype.toggleGroupTree = function(groupId) {
    var parentGroup = '';
    this.salesTeamList.map(function(item, key) {
        if (item.group_id === groupId) {
            item.isLiSelect = !item.isLiSelect;
            if (item.parent_group) {
                parentGroup = item.parent_group;
            }
        }
    });

    if (parentGroup) {
        this.checkIsLiSelect(parentGroup);
    }
    this.salesTeamTree(true);
};

//搜索条件下，搜索后组织树的设置
SalesTeamStore.prototype.setSearchSalesTeamTree = function() {
    if (this.searchContent) {
        let filterGroupArray = [];
        this.findGroupListByName(this.salesTeamListArray, this.searchContent, filterGroupArray);
        this.searchSalesTeamTree = filterGroupArray;
    }
};

SalesTeamStore.prototype.checkIsLiSelect = function(parentGroup) {
    var nowParentGroup = '';
    (this.salesTeamList).map(function(item, key) {
        if (item.group_id === parentGroup) {
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

//判断当前是否有选中的团队
SalesTeamStore.prototype.checkSelectTree = function() {
    var selectObj = {
        isFirstSelect: true,//是否是第一次渲染销售团队的成员展示
        isFirstLiSelect: true//是否是第一次展开销售团队
    };
    (this.salesTeamList).map(function(item, kry) {
        if (item.select !== undefined) {
            //有展示过则不是第一次
            selectObj.isFirstSelect = false;
        }
        if (item.isLiSelect !== undefined) {
            //有展开过则不是第一次
            selectObj.isFirstLiSelect = false;
        }
    });
    return selectObj;
};
//查找列表中修改的成员
function findEditMember(memberList, editUserId) {
    return _.find(memberList, userItem => userItem.userId === editUserId);
}
//列表中是否有修改的成员
function hasEditMember(memberList, editUserId) {
    return _.some(memberList, userItem => userItem.userId === editUserId);
}
//修改用户详情后，更改列表中的数据
SalesTeamStore.prototype.updateCurShowTeamMemberObj = function(user) {
    var teamMemberObj = this.curShowTeamMemberObj;
    //修改用户的昵称
    if (user.nick_name) {
        if (teamMemberObj.owner && teamMemberObj.owner.userId === user.user_id) {
            teamMemberObj.owner.nickName = user.nick_name;
        } else {
            let updateObj = findEditMember(teamMemberObj.managers, user.user_id);
            //修改舆情秘书的昵称
            if (updateObj) {
                updateObj.nickName = user.nick_name;
            } else {
                updateObj = findEditMember(teamMemberObj.users, user.user_id);
                //修改普通成员的昵称
                if (updateObj) {
                    updateObj.nickName = user.nick_name;
                }
            }
        }
    } else if (_.has(user, 'status')) {
        //需要更新成员个数的团队
        let updateMemberCountTeam = _.find(this.teamMemberCountList, item => item.team_id === teamMemberObj.groupId);
        //修改用户的状态
        if (teamMemberObj.owner && teamMemberObj.owner.userId === user.id) {
            teamMemberObj.owner.status = user.status;
            if (_.has(updateMemberCountTeam, 'available.owner')) {
                if (user.status === 1) {
                    updateMemberCountTeam.available.owner += 1;
                } else {
                    updateMemberCountTeam.available.owner -= 1;
                }
            }
        } else {
            let updateObj = findEditMember(teamMemberObj.managers, user.id);
            //修改舆情秘书的状态
            if (updateObj) {
                updateObj.status = user.status;
                if (_.has(updateMemberCountTeam, 'available.manager')) {
                    if (user.status === 1) {
                        updateMemberCountTeam.available.manager += 1;
                    } else {
                        updateMemberCountTeam.available.manager -= 1;
                    }
                }
            } else {
                updateObj = findEditMember(teamMemberObj.users, user.id);
                //修改普通成员的状态
                if (updateObj) {
                    updateObj.status = user.status;
                    if (_.has(updateMemberCountTeam, 'available.user')) {
                        if (user.status === 1) {
                            updateMemberCountTeam.available.user += 1;
                        } else {
                            updateMemberCountTeam.available.user -= 1;
                        }
                    }
                }
            }
        }
    } else if (user.team) {
        //修改用户所在的团队
        if (user.team !== teamMemberObj.groupId) {
            let oldTeam = _.find(this.salesTeamList, item => item.group_id === user.team);
            //改的负责人的团队
            if (teamMemberObj.owner && teamMemberObj.owner.userId === user.id) {
                delete teamMemberObj.owner;
                delete oldTeam.owner_id;
            } else if (hasEditMember(teamMemberObj.managers, user.id)) {//改的舆情秘书的团队
                teamMemberObj.managers = _.filter(teamMemberObj.managers, userItem => userItem.userId !== user.id);
                oldTeam.manager_ids = _.filter(oldTeam.manager_ids, id => id !== user.id);
            } else if (hasEditMember(teamMemberObj.users, user.id)) {//改的成员的团队
                teamMemberObj.users = _.filter(teamMemberObj.users, userItem => userItem.userId !== user.id);
                oldTeam.user_ids = _.filter(oldTeam.user_ids, id => id !== user.id);
            }
        }
        //将成员加入新团队中
        let addInTeam = _.find(this.salesTeamList, item => item.group_id === user.team);
        if (_.get(addInTeam, 'user_ids.length')) {
            addInTeam.user_ids.push(user.id);
        } else if (addInTeam) {
            addInTeam.user_ids = [user.id];
        }
    }
};

SalesTeamStore.prototype.salesTeamTree = function(flag) {
    var isSelectObj = this.checkSelectTree();
    var salesTeamList = this.salesTeamList;
    var salesTeamArray = [];//所有根团队
    var newSalesTeamList = [];//所有子团队
    for (var i = 0; i < salesTeamList.length; i++) {
        var salesTeam = salesTeamList[i];
        if (!salesTeam.parent_group) {
            salesTeamArray.push({
                title: salesTeam.group_name,
                key: salesTeam.group_id,
                select: salesTeam.select,
                isLiSelect: salesTeam.isLiSelect,
                userIds: salesTeam.user_ids,
                ownerId: salesTeam.owner_id,
                managerIds: salesTeam.manager_ids,
                availableNum: salesTeam.available_num
            });
        } else {
            newSalesTeamList.push(salesTeam);
        }
    }
    this.salesTeamChildrenTree(newSalesTeamList, salesTeamArray);

    if (salesTeamArray.length > 0 && (isSelectObj.isFirstSelect || isSelectObj.isFirstLiSelect)) {
        if (isSelectObj.isFirstSelect) {
            //没有展示过成员的销售团队，没有默认展示第一个销售团队的成员
            salesTeamArray[0].select = true;
        }
        if (isSelectObj.isFirstLiSelect) {
            //没有展开过销售团队，默认展开第一个销售团队
            salesTeamArray[0].isLiSelect = true;
        }
        for (var j = 0, len = this.salesTeamList.length; j < len; j++) {
            var item = this.salesTeamList[j];
            if (item.group_id === salesTeamArray[0].key) {
                item.select = salesTeamArray[0].select;
                item.isLiSelect = salesTeamArray[0].isLiSelect;
                break;
            }
        }
    }

    this.salesTeamListArray = salesTeamArray;

    if (salesTeamArray.length > 0 && !flag) {
        this.setTeamMemberLoading(true);
        //第一个团队的销售目标
        setTimeout(() => {
            SalesTeamActions.getSalesGoals(salesTeamArray[0].key);
        });
        SalesTeamActions.getSalesTeamMemberList(salesTeamArray[0].key);
        this.curShowTeamMemberObj = {
            groupId: salesTeamArray[0].key,
            groupName: salesTeamArray[0].title
        };
    }
    this.setSearchSalesTeamTree();
};
//salesTeamList:子团队列表，salesTeamArray:根团队列表
SalesTeamStore.prototype.salesTeamChildrenTree = function(salesTeamList, salesTeamArray) {
    var newSalesTeamList = [];//二级子团队的列表
    //遍历子团队
    for (var i = 0; i < salesTeamList.length; i++) {
        var salesTeam = salesTeamList[i];
        var flag = false;//是否找到根团队
        //遍历根团队
        for (var j = 0; j < salesTeamArray.length; j++) {
            //找到该子团队的父团队，将该团队设为父团队的children
            if (salesTeam.parent_group === salesTeamArray[j].key) {
                salesTeamArray[j].children = salesTeamArray[j].children ? salesTeamArray[j].children : [];
                //一级子团队
                salesTeamArray[j].children.push({
                    title: salesTeam.group_name,
                    key: salesTeam.group_id,
                    select: salesTeam.select,
                    isLiSelect: salesTeam.isLiSelect,
                    ownerId: salesTeam.owner_id,
                    userIds: salesTeam.user_ids,
                    managerIds: salesTeam.manager_ids,
                    superiorTeam: salesTeamArray[j].key,//上级团队的id
                    availableNum: salesTeam.available_num
                });
                flag = false;
                break;
            } else {
                //未找到，说明是二级子团队
                flag = true;
            }
        }
        if (flag) {
            newSalesTeamList.push(salesTeam);
        }
    }
    if (newSalesTeamList.length > 0) {
        for (var k = 0; k < salesTeamArray.length; k++) {
            if (salesTeamArray[k].children) {
                //递归遍历设置二级子团队
                this.salesTeamChildrenTree(newSalesTeamList, salesTeamArray[k].children);
            }
        }
    }
};

module.exports = alt.createStore(SalesTeamStore, 'SalesTeamStore');