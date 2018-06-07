/**
 * Created by wangliping on 2016/4/13.
 */
var RealmFormActions = require('../action/realm-form-actions');


function RealmFormStore() {
    //是否正在保存安全域
    this.isSaving = false;
    //是否保存成功,error:失败，success:成功
    this.saveResult = '';
    //保存后的提示信息
    this.saveMsg = '';
    this.userNameExit = false;//用户名是否已存在
    this.phoneExit = false;//电话是否已存在
    this.emailExit = false;//邮箱是否已存在
    this.userNameError = false;//用户名唯一性验证出错
    this.phoneError = false;//电话唯一性验证出错
    this.emailError = false;//邮件唯一性验证出错
    this.savedRealm = {};

    this.bindActions(RealmFormActions);
}

//正在保存的属性设置
RealmFormStore.prototype.setSaveFlag = function(flag) {
    this.isSaving = flag;
};
//保存后的处理
RealmFormStore.prototype.afterSave = function(resultObj) {
    //去掉正在保存的效果
    this.isSaving = false;
    this.saveResult = resultObj.saveResult;
    this.saveMsg = resultObj.saveMsg;
    this.savedRealm = resultObj.realm;
};
//保存后的处理
RealmFormStore.prototype.addRealm = function(resultObj) {
    this.afterSave(resultObj);
};
RealmFormStore.prototype.addOwner = function(resultObj) {
    this.isSaving = false;
    this.saveResult = resultObj.saveResult;
    this.saveMsg = resultObj.saveMsg;
};

//保存后的处理
RealmFormStore.prototype.editRealm = function(resultObj) {
    this.afterSave(resultObj);
};

//清空保存的提示信息
RealmFormStore.prototype.resetSaveResult = function() {
    this.saveMsg = '';
    this.saveResult = '';
};

//用户名唯一性的验证
RealmFormStore.prototype.checkOnlyUserName = function(result) {
    if (_.isString(result)) {
        //验证出错！
        this.userNameError = true;
    } else {
        //不存在该用户名！
        this.userNameExit = result;
    }

};

//邮箱唯一性的验证
RealmFormStore.prototype.checkOnlyOwnerEmail = function(result) {
    if (_.isString(result)) {
        //验证出错！
        this.emailError = true;
    } else {
        //该邮箱存不存在！
        this.emailExit = result;
    }
};

//电话唯一性的验证
RealmFormStore.prototype.checkOnlyOwnerPhone = function(result) {
    if (_.isString(result)) {
        //验证出错！
        this.phoneError = true;
    } else {
        this.phoneExit = result;
    }
};

//重置用户验证的标志
RealmFormStore.prototype.resetUserNameFlags = function() {
    this.userNameExit = false;
    this.userNameError = false;
};

//重置电话验证的标志
RealmFormStore.prototype.resetPhoneFlags = function() {
    this.phoneExit = false;
    this.phoneError = false;
};

//重置邮箱验证的标志
RealmFormStore.prototype.resetEmailFlags = function() {
    this.emailExit = false;
    this.emailError = false;
};

module.exports = alt.createStore(RealmFormStore, 'RealmFormStore');
