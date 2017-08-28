var RoleFormActions = require("../action/role-form-actions");

function RoleFormStore() {

    this.isSaving = false;//是否正在保存
    this.saveMsg = "";//保存结果的提示信息

    this.bindActions(RoleFormActions);
}

//清空保存结果和提示信息
RoleFormStore.prototype.setSavingFlag = function (flag) {
    this.isSaving = flag;
};

//清空保存结果和提示信息
RoleFormStore.prototype.clearSaveFlags = function () {
    this.saveMsg = "";
};

//保存结果的处理
RoleFormStore.prototype.setSaveFlags = function (result) {
    //去掉正在保存的效果
    this.isSaving = false;
    if (result && _.isString(result)) {
        this.saveMsg = result;
    }
};
//清空保存结果和提示信息
RoleFormStore.prototype.addRole = function (result) {
    this.setSaveFlags(result);
};

//清空保存结果和提示信息
RoleFormStore.prototype.editRole = function (result) {
    this.setSaveFlags(result);
};


module.exports = alt.createStore(RoleFormStore, 'RoleFormStore');