/**
 * Created by wangliping on 2016/4/13.
 */
var SalesTeamFormActions = require('../action/sales-team-form-actions');

function SalesTeamFormStore() {
    //添加销售团队保存时的标志
    this.addTeamResult = '';
    this.addTeamMsg = '';
    this.isTeamAdding = false;

    //编辑销售团队名称及上级团队保存时的标志
    this.editTeamResult = '';
    this.editTeamMsg = '';
    this.isTeamEditing = false;

    this.bindActions(SalesTeamFormActions);
}

//正在添加销售团队的标志设置
SalesTeamFormStore.prototype.setTeamAddingFlag = function(flag) {
    this.isTeamAdding = flag;
};

//正在添加销售团队的标志设置
SalesTeamFormStore.prototype.resetTeamAddFlag = function() {
    this.addTeamResult = '';
    this.addTeamMsg = '';
};

//添加销售团队后的返回结果
SalesTeamFormStore.prototype.saveAddGroup = function(resultObj) {
    if (resultObj.saveResult == 'success') {
        this.isTeamEditing = false;
    } else {
        this.afterSaveGroup(resultObj);
    }
};

//正在编辑销售团队的标志设置
SalesTeamFormStore.prototype.setTeamEditingFlag = function(flag) {
    this.isTeamEditing = flag;
};

//正在编辑销售团队的标志设置
SalesTeamFormStore.prototype.resetTeamEditFlag = function() {
    this.editTeamResult = '';
    this.editTeamMsg = '';
};

SalesTeamFormStore.prototype.afterSaveGroup = function(resultObj) {
    this.editTeamResult = resultObj.saveResult;
    this.editTeamMsg = resultObj.saveMsg;
    this.isTeamEditing = false;
};

//编辑销售团队后的返回结果
SalesTeamFormStore.prototype.saveEditGroup = function(resultObj) {
    this.afterSaveGroup(resultObj);
};

module.exports = alt.createStore(SalesTeamFormStore, 'SalesTeamFormStore');
