var salesStageAjax = require('../ajax/sales-stage-ajax');

function SalesStageActions() {
    this.generateActions(
        'getSalesStageList',
        'addSalesStage',
        'editSalesStage',
        'deleteSalesStage',
        'saveSalesStageOrder',
        'showSalesStageForm',
        'hideSalesStageeForm',
        'showSalesStageModalDialog',
        'hideSalesStageModalDialog',
        'showSalesStageEditOrder',
        'hideSalesStageEditOrder',
        'salesStageOrderUp',
        'salesStageOrderDown',
        'changeIsSavingSalesStage',
        'deleteIsSavingSalesStage'
    );

    //获取销售阶段列表
    this.getSalesStageList = function() {
        this.dispatch({loading: true, error: false});
        salesStageAjax.getSalesStageList().then( (salesStageList) => {
            this.dispatch({loading: false, error: false, list: _.get(salesStageList, 'result')});
        },(errorMsg) => {
            this.dispatch({loading: false,error: true, errorMsg: errorMsg});
        });
    };

    //添加销售阶段
    this.addSalesStage = function(salesStage, callback) {
        this.dispatch({loading: true, error: false});
        salesStageAjax.addSalesStage(salesStage).then( (resData) => {
            _.isFunction(callback) && callback();
            this.dispatch({loading: false, error: false, resData: resData});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };

    //修改销售阶段
    this.editSalesStage = function(salesStage, callback) {
        var _this = this;
        var salesStageArray = [];
        salesStageArray.push(salesStage);
        _this.dispatch({loading: true, error: false});
        salesStageAjax.editSalesStage(salesStageArray).then(function(salesStageModified) {
            _.isFunction(callback) && callback();
            _this.dispatch({loading: false, error: false, value: salesStageModified.result});
        }, function(errorMsg) {
            _this.dispatch({loading: false, error: true, errorMsg: errorMsg});
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
    this.deleteSalesStage = function(salesStage, callback) {
        var _this = this;
        var idArray = [];
        idArray.push(salesStage.id);
        _this.dispatch({loading: true, error: false});
        salesStageAjax.deleteSalesStage(idArray).then(function() {
            _this.dispatch({loading: false, error: false, value: salesStage});
            _.isFunction(callback) && callback({error: false});
        }, function(errorMsg) {
            _this.dispatch({loading: false, error: true, errorMsg: errorMsg});
            _.isFunction(callback) && callback({error: true});

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

    this.deleteIsSavingSalesStage = function() {
        this.dispatch();
    };

}

module.exports = alt.createActions(SalesStageActions);