var AuthorityFormActions = require('../action/authority-form-actions');

var saveTipTimer = null;
function AuthorityFormStore() {

    this.isGroupSaving = false;//是否正在保存
    this.saveGroupMsg = '';//保存结果的提示信息
    this.saveGroupResult = '';//error、success

    //添加、修改权限的标识
    this.isAuthoritySaving = false;
    this.saveAuthorityMsg = '';

    this.bindActions(AuthorityFormActions);
}

/**
 * 添加/修改权限的标识设置
 */
//清空保存结果和提示信息
AuthorityFormStore.prototype.clearSaveAuthorityFlags = function() {
    this.saveAuthorityMsg = '';
};

//保存结果的处理
AuthorityFormStore.prototype.setAuthoritySaveFlags = function(result) {
    //去掉正在保存的效果
    this.isAuthoritySaving = false;
    if (result && _.isString(result)) {
        this.saveAuthorityMsg = result;
    }
};

//清空保存结果和提示信息
AuthorityFormStore.prototype.addAuthority = function(result) {
    this.setAuthoritySaveFlags(result);
};

//清空保存结果和提示信息
AuthorityFormStore.prototype.editAuthority = function(result) {
    this.setAuthoritySaveFlags(result);
};

//设置正在保存权限的标识
AuthorityFormStore.prototype.setAuthoritySavingFlag = function(flag) {
    this.isAuthoritySaving = flag;
};

/**
 * 添加权限组的标识设置
 */
//设置正在保存权限组的标识
AuthorityFormStore.prototype.setGroupSavingFlag = function(flag) {
    this.isGroupSaving = flag;
};

//清空保存结果和提示信息
AuthorityFormStore.prototype.clearSaveFlags = function() {
    this.saveGroupMsg = '';
    this.saveGroupResult = '';
};

//保存结果的处理
AuthorityFormStore.prototype.setGroupSaveFlags = function(resultObj) {
    //去掉正在保存的效果
    this.isGroupSaving = false;
    this.saveGroupMsg = resultObj.saveMsg;
    this.saveGroupResult = resultObj.saveResult;
};
//清空保存结果和提示信息
AuthorityFormStore.prototype.addAuthorityGroup = function(resultObj) {
    this.setGroupSaveFlags(resultObj);
};


module.exports = alt.createStore(AuthorityFormStore, 'AuthorityFormStore');