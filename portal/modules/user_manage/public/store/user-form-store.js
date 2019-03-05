/**
 * Created by wangliping on 2016/4/18.
 */
var UserFormActions = require('../action/user-form-actions');


function UserFormStore() {
    //是否正在保存成员
    this.isSaving = false;
    //是否保存成功,error:失败，success:成功
    this.saveResult = '';
    //保存后的提示信息
    this.saveMsg = '';
    this.nickNameExist = false; // 昵称是否已存在
    this.nickNameError = false; // 昵称唯一性验证出错
    this.userNameExist = false;//用户名是否已存在
    this.emailExist = false;//邮箱是否已存在
    this.userNameError = false;//用户名唯一性验证出错
    this.emailError = false;//邮件唯一性验证出错
    this.savedUser = {};//添加用户成功后返回的用户信息
    //角色列表
    this.roleList = [];
    //正在获取角色列表
    this.isLoadingRoleList = false;
    //团队列表
    this.userTeamList = [];
    //正在获取团队列表
    this.isLoadingTeamList = false;

    this.bindActions(UserFormActions);
}

//获取团队列表
UserFormStore.prototype.getUserTeamList = function(teamList) {
    this.isLoadingTeamList = false;
    this.userTeamList = _.isArray(teamList) ? teamList : [];
};

//设置是否正在获取团队列表
UserFormStore.prototype.setTeamListLoading = function(flag) {
    this.isLoadingTeamList = flag;
};

//设置是否正在获取角色列表
UserFormStore.prototype.setRoleListLoading = function(flag) {
    this.isLoadingRoleList = flag;
};
//获取角色列表
UserFormStore.prototype.getRoleList = function(roleList) {
    this.isLoadingRoleList = false;
    this.roleList = _.isArray(roleList) ? roleList : [];
};

//正在保存的属性设置
UserFormStore.prototype.setSaveFlag = function(flag) {
    this.isSaving = flag;
};
//保存后的处理
UserFormStore.prototype.afterSave = function(resultObj) {
    //去掉正在保存的效果
    this.isSaving = false;
    this.saveResult = resultObj.saveResult;
    this.saveMsg = resultObj.saveMsg;
};
//保存后的处理
UserFormStore.prototype.addUser = function(resultObj) {
    if (resultObj.savedUser) {
        this.savedUser = resultObj.savedUser;
    }

    this.afterSave(resultObj);
};

//保存后的处理
UserFormStore.prototype.editUser = function(resultObj) {
    this.afterSave(resultObj);
};

//清空保存的提示信息
UserFormStore.prototype.resetSaveResult = function() {
    this.saveMsg = '';
    this.saveResult = '';
};

// 昵称（对应的是姓名）唯一性的验证
UserFormStore.prototype.checkOnlyNickName = function(result) {
    if (_.isString(result)) {
        //验证出错！
        this.nickNameError = true;
    } else {
        this.nickNameExist = result;
    }
};

//用户名唯一性的验证
UserFormStore.prototype.checkOnlyUserName = function(result) {
    if (_.isString(result)) {
        //验证出错！
        this.userNameError = true;
    } else {
        //不存在该用户名！
        this.userNameExist = result;
    }
};

//邮箱唯一性的验证
UserFormStore.prototype.checkOnlyEmail = function(result) {
    if (_.isString(result)) {
        //验证出错！
        this.emailError = true;
    } else {
        //该邮箱存不存在！
        this.emailExist = result;
    }
};

// 重置昵称（对应的是姓名）验证的标志
UserFormStore.prototype.resetNickNameFlags = function() {
    this.userNameExist = false;
    this.userNameError = false;
};

//重置用户验证的标志
UserFormStore.prototype.resetUserNameFlags = function() {
    this.userNameExist = false;
    this.userNameError = false;
};

//重置邮箱验证的标志
UserFormStore.prototype.resetEmailFlags = function() {
    this.emailExist = false;
    this.emailError = false;
};

module.exports = alt.createStore(UserFormStore, 'UserFormStore');

