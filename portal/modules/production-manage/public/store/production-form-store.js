/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/10/31.
 */

var ProductionFormActions = require('../action/production-form-actions');


function ProductionFormStore() {
    //是否正在保存成员
    this.isSaving = false;
    //是否保存成功,error:失败，success:成功
    this.saveResult = '';
    //保存后的提示信息
    this.saveMsg = '';
    this.userNameExist = false;//用户名是否已存在
    this.emailExist = false;//邮箱是否已存在
    this.userNameError = false;//用户名唯一性验证出错
    this.emailError = false;//邮件唯一性验证出错
    this.savedProduction = {};//添加用户成功后返回的用户信息
    //角色列表
    this.roleList = [];
    //正在获取角色列表
    this.isLoadingRoleList = false;
    //团队列表
    this.userTeamList = [];
    //正在获取团队列表
    this.isLoadingTeamList = false;

    this.bindActions(ProductionFormActions);
}

//获取团队列表
ProductionFormStore.prototype.getProductionTeamList = function(teamList) {
    this.isLoadingTeamList = false;
    this.userTeamList = _.isArray(teamList) ? teamList : [];
};

//设置是否正在获取团队列表
ProductionFormStore.prototype.setTeamListLoading = function(flag) {
    this.isLoadingTeamList = flag;
};

//设置是否正在获取角色列表
ProductionFormStore.prototype.setRoleListLoading = function(flag) {
    this.isLoadingRoleList = flag;
};
//获取角色列表
ProductionFormStore.prototype.getRoleList = function(roleList) {
    this.isLoadingRoleList = false;
    this.roleList = _.isArray(roleList) ? roleList : [];
};

//正在保存的属性设置
ProductionFormStore.prototype.setSaveFlag = function(flag) {
    this.isSaving = flag;
};
//保存后的处理
ProductionFormStore.prototype.afterSave = function(resultObj) {
    //去掉正在保存的效果
    this.isSaving = false;
    this.saveResult = resultObj.saveResult;
    this.saveMsg = resultObj.saveMsg;
};
//保存后的处理
ProductionFormStore.prototype.addProduction = function(resultObj) {
    if (resultObj.value) {
        this.savedProduction = resultObj.value;
    }
    this.afterSave(resultObj);
};

//保存后的处理
ProductionFormStore.prototype.editProduction = function(resultObj) {
    this.savedProduction = resultObj.value;
    this.afterSave(resultObj);
};

//清空保存的提示信息
ProductionFormStore.prototype.resetSaveResult = function() {
    this.saveMsg = '';
    this.saveResult = '';
};

//用户名唯一性的验证
ProductionFormStore.prototype.checkOnlyProductionName = function(result) {
    if (_.isString(result)) {
        //验证出错！
        this.userNameError = true;
    } else {
        //不存在该用户名！
        this.userNameExist = result;
    }
};

//重置用户验证的标志
ProductionFormStore.prototype.resetProductionNameFlags = function() {
    this.userNameExist = false;
    this.userNameError = false;
};


module.exports = alt.createStore(ProductionFormStore, 'ProductionFormStore');