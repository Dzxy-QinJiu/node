var SalesStageActions = require('../action/sales-stage-actions');

var emptySalesStage = {
    id: '',
    name: '',
    index: '',
    description: ''
};

function SalesStageStore() {

    this.salesStageList = [];
    this.currentSalesStage = emptySalesStage;
    this.currentSalesStageList = [];
    this.salesStageFormShow = false;
    this.salesStageEditOrder = false;
    this.isSavingSalesStage = false;

    this.bindListeners({
        getSalesStageList: SalesStageActions.getSalesStageList,
        addSalesStage: SalesStageActions.addSalesStage,
        editSalesStage: SalesStageActions.editSalesStage,
        saveSalesStageOrder: SalesStageActions.saveSalesStageOrder,
        deleteSalesStage: SalesStageActions.deleteSalesStage,
        showSalesStageForm: SalesStageActions.showSalesStageForm,
        hideSalesStageeForm: SalesStageActions.hideSalesStageeForm,
        showSalesStageModalDialog: SalesStageActions.showSalesStageModalDialog,
        hideSalesStageModalDialog: SalesStageActions.hideSalesStageModalDialog,
        showSalesStageEditOrder: SalesStageActions.showSalesStageEditOrder,
        hideSalesStageEditOrder: SalesStageActions.hideSalesStageEditOrder,
        salesStageOrderUp: SalesStageActions.salesStageOrderUp,
        changeIsSavingSalesStage: SalesStageActions.changeIsSavingSalesStage,
        salesStageOrderDown: SalesStageActions.salesStageOrderDown
    });

    this.exportPublicMethods({
        getSalesStageListData: this.getSalesStageListData,
        getIsSavingSalesStage: this.getIsSavingSalesStage,
        getCurrentSalesStageData: this.getCurrentSalesStageData,
        getCurrentSalesStageListData: this.getCurrentSalesStageListData,
        isFormShowFnc: this.isFormShowFnc,
        isEditOrderFnc: this.isEditOrderFnc
    });
}

SalesStageStore.prototype.getSalesStageListData = function() {
    return this.getState().salesStageList;
};
SalesStageStore.prototype.getIsSavingSalesStage = function() {
    return this.getState().isSavingSalesStage;
};

SalesStageStore.prototype.getCurrentSalesStageData = function() {
    return this.getState().currentSalesStage;
};

SalesStageStore.prototype.isFormShowFnc = function() {
    return this.getState().salesStageFormShow;
};

SalesStageStore.prototype.isEditOrderFnc = function() {
    return this.getState().salesStageEditOrder;
};

SalesStageStore.prototype.getCurrentSalesStageListData = function() {
    return this.getState().currentSalesStageList;
};

//获取销售阶段列表
SalesStageStore.prototype.getSalesStageList = function(salesStageList) {
    this.salesStageList = salesStageList;
    this.isSavingSalesStage = false;

    this.currentSalesStageList = $.map(salesStageList, function(obj) {
        return $.extend(true, {}, obj);//返回对象的深拷贝
    });
};

//添加销售阶段
SalesStageStore.prototype.addSalesStage = function(salesStageCreated) {
    var _this = this;
    if (typeof salesStageCreated !== 'string') {
        $.each(salesStageCreated, function(i, salesStage) {
            _this.salesStageList.push(salesStage);
        });
    }
    this.salesStageFormShow = false;
};

//修改销售阶段
SalesStageStore.prototype.editSalesStage = function(salesStageModified) {

    var _this = this;
    if (typeof salesStageModified !== 'string') {
        $.each(salesStageModified, function(i, salesStage) {
            var target = _.find(_this.salesStageList, function(item) {
                if (item.id === salesStage.id) {
                    return true;
                }
            });
            if (target) {
                _.extend(target, salesStage);
            }
        });
    }

    this.salesStageFormShow = false;
};

SalesStageStore.prototype.saveSalesStageOrder = function(salesStageModified) {

    if (typeof salesStageModified !== 'string') {
        this.salesStageList = salesStageModified;
    }

    this.salesStageEditOrder = false;
    this.isSavingSalesStage = false;
};

//删除销售阶段
SalesStageStore.prototype.deleteSalesStage = function(salesStage) {
    this.salesStageList = _.filter(this.salesStageList, function(item) {
        if (item.id !== salesStage.id) {
            return true;
        }
    });
};

SalesStageStore.prototype.salesStageOrderUp = function(salesStage) {
    var oldIndex = parseInt(salesStage.index);
    this.salesStageList = _.filter(this.salesStageList, function(item) {
        var index = item.index;
        if (parseInt(item.index) === oldIndex) {
            index = (parseInt(item.index) - 1).toString();
        }

        if (parseInt(item.index) === (oldIndex - 1)) {
            index = (parseInt(item.index) + 1).toString();
        }

        item.index = index;
        return true;
    });

    this.salesStageList = this.salesStageList.sort(function(item1, item2) {
        return item1.index - item2.index;
    });
};

SalesStageStore.prototype.salesStageOrderDown = function(salesStage) {
    var oldIndex = parseInt(salesStage.index);
    this.salesStageList = _.filter(this.salesStageList, function(item) {
        var index = item.index;
        if (parseInt(item.index) == oldIndex) {
            index = (parseInt(item.index) + 1).toString();
        }

        if (parseInt(item.index) == (oldIndex + 1)) {
            index = (parseInt(item.index) - 1).toString();
        }
        item.index = index;
        return true;
    });

    this.salesStageList = this.salesStageList.sort(function(item1, item2) {
        return item1.index - item2.index;
    });

};


//展示右侧编辑面板
SalesStageStore.prototype.showSalesStageForm = function(salesStage) {
    this.salesStageFormShow = true;
    if (salesStage === 'addSalesStage') {
        this.currentSalesStage = emptySalesStage;
    } else {
        this.currentSalesStage = salesStage;
    }
};

//隐藏右侧编辑面板
SalesStageStore.prototype.hideSalesStageeForm = function() {
    this.salesStageFormShow = false;
};

//展示删除销售阶段提示
SalesStageStore.prototype.showSalesStageModalDialog = function(salesStage) {
    salesStage.modalDialogFlag = true;
};

//隐藏删除销售阶段提示
SalesStageStore.prototype.hideSalesStageModalDialog = function(salesStage) {
    salesStage.modalDialogFlag = false;
};

//编辑销售阶段顺序
SalesStageStore.prototype.showSalesStageEditOrder = function() {
    this.salesStageEditOrder = true;
};

SalesStageStore.prototype.changeIsSavingSalesStage = function() {
    this.isSavingSalesStage = true;
};

//取消编辑销售阶段顺序
SalesStageStore.prototype.hideSalesStageEditOrder = function() {
    this.salesStageEditOrder = false;
    this.currentSalesStageList = this.currentSalesStageList.sort(function(item1, item2) {
        return item1.index - item2.index;
    });
    this.salesStageList = $.map(this.currentSalesStageList, function(obj) {
        return $.extend(true, {}, obj);//返回对象的深拷贝
    });
};

module.exports = alt.createStore(SalesStageStore, 'SalesStageStore');