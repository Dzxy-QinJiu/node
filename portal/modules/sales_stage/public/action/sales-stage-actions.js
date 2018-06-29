var salesStageAjax = require('../ajax/sales-stage-ajax');
var userData = require('../../../../public/sources/user-data');
function SalesStageActions() {
    this.generateActions({
        'getSalesStageList': 'getSalesStageList',
        'addSalesStage': 'addSalesStage',
        'editSalesStage': 'editSalesStage',
        'deleteSalesStage': 'deleteSalesStage',
        'saveSalesStageOrder': 'saveSalesStageOrder',
        'showSalesStageForm': 'showSalesStageForm',
        'hideSalesStageeForm': 'hideSalesStageeForm',
        'showSalesStageModalDialog': 'showSalesStageModalDialog',
        'hideSalesStageModalDialog': 'hideSalesStageModalDialog',
        'showSalesStageEditOrder': 'showSalesStageEditOrder',
        'hideSalesStageEditOrder': 'hideSalesStageEditOrder',
        'salesStageOrderUp': 'salesStageOrderUp',
        'salesStageOrderDown': 'salesStageOrderDown',
        'changeIsSavingSalesStage': 'changeIsSavingSalesStage'
    });

    //获取销售阶段列表
    this.getSalesStageList = function() {
        var _this = this;
        salesStageAjax.getSalesStageList().then(function(salesStageList) {
            _this.dispatch(salesStageList.result);
        });
    };

    //添加销售阶段
    this.addSalesStage = function(salesStage) {
        var _this = this;
        var salesStageArray = [];
        salesStageArray.push(salesStage);
        salesStageAjax.addSalesStage(salesStageArray).then(function(salesStageCreated) {
            _this.dispatch(salesStageCreated.result);
        });
    };

    //修改销售阶段
    this.editSalesStage = function(salesStage) {
        var _this = this;
        var salesStageArray = [];
        salesStageArray.push(salesStage);
        salesStageAjax.editSalesStage(salesStageArray).then(function(salesStageModified) {
            _this.dispatch(salesStageModified.result);
        });
    };

    //销售阶段排序
    this.saveSalesStageOrder = function(salesStageList) {
        var _this = this;
        salesStageAjax.editSalesStage(salesStageList).then(function(salesStageModified) {
            _this.dispatch(salesStageModified.result);
        });
    };

    //删除销售阶段
    this.deleteSalesStage = function(salesStage) {
        var _this = this;
        var idArray = [];
        idArray.push(salesStage.id);
        salesStageAjax.deleteSalesStage(idArray).then(function() {
            _this.dispatch(salesStage);
        });
    };

    //展示右侧编辑面板
    this.showSalesStageForm = function(salesStage) {
        this.dispatch(salesStage);
    };

    //隐藏右侧编辑面板
    this.hideSalesStageeForm = function() {
        this.dispatch();
    };

    //展示删除销售阶段提示
    this.showSalesStageModalDialog = function(salesStage) {
        this.dispatch(salesStage);

    };

    //隐藏删除销售阶段提示
    this.hideSalesStageModalDialog = function(salesStage) {
        this.dispatch(salesStage);
    };

    //编辑销售阶段顺序
    this.showSalesStageEditOrder = function() {
        this.dispatch();
    };

    //取消编辑销售阶段顺序
    this.hideSalesStageEditOrder = function() {
        this.dispatch();
    };

    this.salesStageOrderUp = function(salesStage) {
        this.dispatch(salesStage);
    };

    this.salesStageOrderDown = function(salesStage) {
        this.dispatch(salesStage);
    };

    this.changeIsSavingSalesStage = function() {
        this.dispatch();
    };

}

module.exports = alt.createActions(SalesStageActions);