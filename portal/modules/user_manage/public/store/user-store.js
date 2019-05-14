var UserActions = require('../action/user-actions');
var UserFormStore = require('../store/user-form-store');
var userData = require('../../../../public/sources/user-data');
var userInfoEmitter = require('../../../../public/sources/utils/emitters').userInfoEmitter;
var emptyUser = {
    id: '',
    name: '',
    userName: '',
    image: '',
    password: '',
    rePassword: '',
    phone: '',
    email: '',
    role: [],
    phoneOrder: ''
};

function UserStore() {
    //在 编辑/添加 状态的时候userFormShow为true
    this.userFormShow = false;
    //列表
    this.userListSize = 0;
    //当前要展示的用户列表
    this.curUserList = [];
    // 编辑/添加 状态时，需要提交的域对象
    this.currentUser = emptyUser;
    //当前选择的安全域
    this.selectUsers = [];
    //当前正在展示的是第几页的数据
    this.curPage = 1;
    //一页可显示的安全域的个数
    this.pageSize = 0;
    //用户的个人日志
    this.logList = [];
    //个人日志总数
    this.logTotal = 0;
    //个人日志展示第几页
    this.logNum = 1;
    //查询内容
    this.searchContent = '';
    //查询时间
    this.startTime = '';
    this.endTime = '';
    //加载数据中。。。
    this.isLoading = true;
    //右侧面板的开关
    this.rightPanelShow = false;
    //获取用户详情中。。。
    this.userIsLoading = false;
    //表单的类型：添加/修改
    this.formType = 'add';
    //获取成员列表时，错误/暂无（符合条件的）数据的提示
    this.userListTipMsg = '';
    //是否展示筛选面板
    this.isFilterPanelShow = false;
    //已选过滤角色
    this.selectRole = '';
    //所有成员的总长度
    this.allUserTotal = 0;
    //筛选面板下的成员的角色列表
    this.userRoleList = [];
    //获取成员详情失败的错误提示
    this.getUserDetailError = '';
    this.isContinueAddButtonShow = false;
    this.resultType = '';
    this.errorMsg = '';
    this.bindActions(UserActions);

}
//关闭右侧详情后，将数据置为
UserStore.prototype.setInitialData = function() {
    this.currentUser = emptyUser;
};
//过滤角色的设置
UserStore.prototype.setSelectRole = function(role) {
    //搜索框和角色不能联合查询
    this.selectRole = role;
    this.searchContent = '';
};
//过滤面板是否展示的设置
UserStore.prototype.toggleFilterPanel = function() {
    this.isFilterPanelShow = !this.isFilterPanelShow;
};


//修改成员所属团队
UserStore.prototype.updateUserTeam = function(team) {
    if (this.currentUser) {
        this.currentUser.teamId = team.group_id;
        this.currentUser.teamName = team.group_name;
    }
};
//更新成员的启用或者禁用状态
UserStore.prototype.updateCurrentUserStatus = function(status) {
    if(this.currentUser){
        this.currentUser.status = status;
    }
};
UserStore.prototype.updateUserRoles = function(roleObj) {
    if (this.currentUser) {
        //更新筛选面板下对应角色的数量
        updateRoleCount(this.currentUser.roleNames, roleObj.roleNames, this.userRoleList);
        this.currentUser.roleIds = roleObj.roleIds;
        this.currentUser.roleNames = roleObj.roleNames;
    }
};
//公开方法，获取当前展示的列表
UserStore.prototype.getCurUserList = function(userListObj) {
    this.isLoading = false;

    if (_.isString(userListObj)) {
        //错误提示的赋值
        this.userListTipMsg = userListObj;
        this.curUserList = [];
        this.userListSize = 0;
        this.allUserTotal = 0;
        this.userRoleList = [];
    } else if (userListObj && _.isObject(userListObj)) {
        var curUserList = userListObj.data;
        this.userListSize = userListObj.list_size;
        //成员角色列表
        this.userRoleList = userListObj.roles;
        //全部成员的个数
        if (!this.searchContent && !this.selectRole) {
            this.allUserTotal = userListObj.list_size;
        }
        //确保返回的是个数组
        if (!_.isArray(curUserList)) {
            curUserList = [];
        }
        if (curUserList.length > 0) {
            //清空提示
            this.userListTipMsg = '';
        } else {
            //无数据时的处理
            if (this.searchContent || this.selectRole) {
                this.userListTipMsg = Intl.get('member.no.suitable.member', '没有符合条件的成员!');
            } else {
                this.userListTipMsg = Intl.get('common.no.member', '暂无成员') + '!';
            }
        }

        if (this.curPage === 1) {
            this.curUserList = [];
        }
        // 每次加载数据的长度
        var getCurUserListLength = curUserList.length;
        // 已经加载的数据长度
        var getTotalUserListLength = this.curUserList.length;
        // 去重
        if (getTotalUserListLength < (this.pageSize)) {
            this.curUserList = curUserList;
        } else {
            var rest = getTotalUserListLength % (this.pageSize);
            if (rest === 0) {
                this.curUserList = this.curUserList.concat(curUserList);
            } else {
                for (var j = rest; j < getCurUserListLength; j++) {
                    this.curUserList = this.curUserList.concat(curUserList[j]);
                }
            }
        }
    }
};

//点击成员查看详情时，先设置已有的详情信息
UserStore.prototype.setCurUser = function(userId) {
    var curUser = _.find(this.curUserList, function(user) {
        if (user.id === userId) {
            return true;
        }
    });
    this.currentUser = curUser || emptyUser;
};
//获取成员详情后，重新赋值详情信息
UserStore.prototype.getCurUserById = function(user) {
    this.userIsLoading = false;
    this.resultType = '';
    this.errorMsg = '';
    if (_.isString(user)) {
        this.getUserDetailError = user;
    } else {
        this.getUserDetailError = '';
        this.currentUser = user;
        let curUser = _.find(this.curUserList, curUser => curUser.id === user.id);
        if (curUser){
            curUser.roleIds = user.roleIds;
            curUser.roleNames = user.roleNames;
            curUser.teamName = user.teamName;
            curUser.teamId = user.teamId;
            curUser.phoneOrder = user.phoneOrder;
            //获取成员详情中没有创建时间，所以用列表中获取的创建时间
            user.createDate = curUser.createDate;
        }
        this.currentUser = user;
    }
};

UserStore.prototype.closeAddPanel = function() {
    this.userFormShow = false;
    this.rightPanelShow = false;
};
//启停用成员
UserStore.prototype.updateUserStatus = function(modifiedUser) {
    if (_.isObject(modifiedUser)) {
        this.resultType = '';
        this.errorMsg = '';
        var curUserList = this.curUserList;
        for (var j = 0, rLen = curUserList.length; j < rLen; j++) {
            if (curUserList[j].id === modifiedUser.id) {
                this.curUserList[j].status = modifiedUser.status;
                break;
            }
        }
    } else {
        this.resultType = 'error';
        this.errorMsg = modifiedUser || Intl.get('common.edit.failed', '修改失败');
    }
};

function updateRoleCount(oldRoles, newRoles, userRoleList) {

    //将原角色对应的数量减一
    oldRoles.forEach(function(roleName) {
        _.some(userRoleList, function(role) {
            if (roleName === role.role_name) {
                role.num--;
            }
        });
    });
    //将新角色对应的数量加一
    newRoles.forEach(function(roleName) {
        _.some(userRoleList, function(role) {
            if (roleName === role.role_name) {
                role.num++;
            }
        });
    });
}
UserStore.prototype.afterEditUser = function(modifiedUser) {
    if (_.isObject(modifiedUser)) {
        var curUserList = this.curUserList;
        for (var j = 0, rLen = curUserList.length; j < rLen; j++) {
            if (curUserList[j].id === modifiedUser.user_id) {
                if (modifiedUser.status) {
                    this.curUserList[j].status = modifiedUser.status;
                } else {
                    if (modifiedUser.nick_name) {
                        this.curUserList[j].name = modifiedUser.nick_name;
                        if (userData.getUserData().user_id === modifiedUser.user_id) {
                            //如果修改当前登录的用户时 修改完成后刷新左下角用户头像(没有头像的是通过昵称的第一个字来代替头像)
                            userInfoEmitter.emit(userInfoEmitter.CHANGE_USER_LOGO, {
                                nickName: modifiedUser.name
                            });
                        }
                    }
                    if (modifiedUser.user_logo) {
                        this.curUserList[j].image = modifiedUser.user_logo;
                        if (userData.getUserData().user_id === modifiedUser.user_id) {
                            //如果修改当前登录的用户时 修改完成后刷新左下角用户头像
                            userInfoEmitter.emit(userInfoEmitter.CHANGE_USER_LOGO, {
                                userLogo: modifiedUser.user_logo
                            });
                        }
                    }
                    if (modifiedUser.phone) {
                        this.curUserList[j].phone = modifiedUser.phone;
                    }
                    if (modifiedUser.email) {
                        if (modifiedUser.email !== this.curUserList[j].email) {
                            //修改邮箱后，邮箱的激活状态改为未激活
                            this.curUserList[j].emailEnable = false;
                        }
                        this.curUserList[j].email = modifiedUser.email;
                    }
                    this.currentUser = this.curUserList[j];
                }
                break;
            }
        }
    }
};

UserStore.prototype.showUserForm = function(type) {
    if (type === 'add') {
        this.currentUser = emptyUser;
    }
    this.formType = type;
    this.userInfoShow = false;
    this.userFormShow = true;
    this.rightPanelShow = true;
};



UserStore.prototype.updateCurPage = function(curPage) {
    this.curPage = curPage;
};

UserStore.prototype.updatePageSize = function(pageSize) {
    this.pageSize = pageSize;
};
UserStore.prototype.setUserLoading = function(flag) {
    this.userIsLoading = flag;
    if (flag) {
        //重新获取详情时，清空之前的错误提示
        this.getUserDetailError = '';
    }
};

UserStore.prototype.showUserInfoPanel = function() {
    this.userInfoShow = true;
    this.userFormShow = false;
    this.rightPanelShow = true;
};

UserStore.prototype.updateSearchContent = function(searchContent) {
    //搜索框和角色不能联合查询
    this.searchContent = searchContent;
    this.selectRole = '';

};
UserStore.prototype.closeRightPanel = function() {
    this.rightPanelShow = false;
    this.userInfoShow = false;
    this.userFormShow = false;
};

UserStore.prototype.showContinueAddButton = function() {
    this.isContinueAddButtonShow = true;
};

UserStore.prototype.hideContinueAddButton = function() {
    this.isContinueAddButtonShow = false;
};

UserStore.prototype.returnInfoPanel = function(newAddUser) {
    if (newAddUser && newAddUser.id) {
        //添加完成员返回详情页的处理
        if (_.isArray(newAddUser.roleIds) && newAddUser.roleIds.length > 0) {
            //角色的处理
            let roleList = UserFormStore.getState().roleList;
            if (_.isArray(roleList) && roleList.length) {
                let role = _.filter(roleList, role => newAddUser.roleIds.indexOf(role.roleId) !== -1);
                if (_.isArray(role) && role.length) {
                    newAddUser.roleNames = _.map(role, 'roleName');
                }
            }
        }
        //获取团队名称
        if (newAddUser.teamId) {
            let userTeamList = UserFormStore.getState().userTeamList, userTeam;
            if (_.isArray(userTeamList) && userTeamList.length) {
                userTeam = _.find(userTeamList, team => team.group_id === newAddUser.teamId);
            }
            newAddUser.teamName = userTeam ? userTeam.group_name : '';
        }
        if (newAddUser.emailEnable === 'false') {
            newAddUser.emailEnable = false;
        }
        this.currentUser = newAddUser;
    }
    this.userInfoShow = true;
    this.userFormShow = false;
};




module.exports = alt.createStore(UserStore, 'UserStore');
