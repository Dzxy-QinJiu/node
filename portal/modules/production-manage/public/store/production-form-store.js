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
    this.bindActions(ProductionFormActions);
}
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

//编辑
ProductionFormStore.prototype.editProduction = function(resultObj) {
    this.savedProduction = resultObj.value;
    this.afterSave(resultObj);
};


module.exports = alt.createStore(ProductionFormStore, 'ProductionFormStore');