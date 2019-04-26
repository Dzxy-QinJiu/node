var SalesStageActions = require('../action/sales-stage-actions');

var emptySalesStage = {
    id: '',
    name: '',
    index: '',
    description: ''
};

function SalesStageStore() {

    this.salesStageList = [];
    this.loading = true;
    this.getSalesStageListErrMsg = ''; // 获取销售阶段列表失败信息
    this.currentSalesStage = emptySalesStage;
    this.currentSalesStageList = [];
    this.salesStageFormShow = false;
    this.salesStageEditOrder = false;
    this.isSavingSalesStage = false;
    this.isSavingSalesStageHome = false;
    this.saveStageErrMsg = '';
    this.deleteStageErrMsg = '';
    this.bindActions(SalesStageActions);
}

//获取销售阶段列表
SalesStageStore.prototype.getSalesStageList = function(resData) {
    if (resData.loading) {
        this.loading = resData.loading;
        this.getSalesStageListErrMsg = '';
    } else {
        this.loading = false;
        if (resData.error) {
            this.getSalesStageListErrMsg = _.get(resData, 'errorMsg');
        } else {
            this.salesStageList = _.get(resData, 'list', []);
        }
    }
    this.isSavingSalesStage = false;
    this.currentSalesStageList = _.cloneDeep(this.salesStageList); //返回对象的深拷贝
};

//添加销售阶段
SalesStageStore.prototype.addSalesStage = function(result) {
    if(result.loading){
        this.isSavingSalesStage = true;
    } else if (!result.error) {
        let resData = _.get(result, 'resData');
        if (resData.code === 0) {
            this.salesStageList = _.get(resData, 'result');
        }
        this.currentSalesStageList = _.cloneDeep(this.salesStageList); //返回对象的深拷贝
        this.saveStageErrMsg = '';
        this.salesStageFormShow = false;
    }else{
        this.saveStageErrMsg = result.errorMsg;
        this.isSavingSalesStage = false;
    }
};

//修改销售阶段
SalesStageStore.prototype.editSalesStage = function(salesStageModified) {
    var _this = this;
    if(salesStageModified.loading){
        this.isSavingSalesStage = true;
    }else if (!salesStageModified.error) {
        $.each(salesStageModified.value, function(i, salesStage) {
            var target = _.find(_this.salesStageList, item => item.id === salesStage.id);
            if (target) {
                _.extend(target, salesStage);
            }
        });
        this.saveStageErrMsg = '';
        this.salesStageFormShow = false;
    }else {
        this.saveStageErrMsg = salesStageModified.errorMsg;
        this.isSavingSalesStage = false;
    }
    // this.getErrMsg = salesStageModified.errorMsg;
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
    if(salesStage.loading){
        this.isSavingSalesStageHome = true;
    }else if(!salesStage.error) {
        this.salesStageList = _.filter(this.salesStageList,item => item.id !== salesStage.value.id);
        _.each(this.salesStageList, (item, index) => {
            item.index = index + 1;
        });
        this.currentSalesStageList = _.cloneDeep(this.salesStageList); //返回对象的深拷贝
        this.isSavingSalesStageHome = false;
        this.deleteStageErrMsg = '';
        this.salesStageFormShow = false;
    }else {
        this.isSavingSalesStageHome = false;
        this.deleteStageErrMsg = salesStage.errorMsg;

    }
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
        if (parseInt(item.index) === oldIndex) {
            index = (parseInt(item.index) + 1).toString();
        }

        if (parseInt(item.index) === (oldIndex + 1)) {
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
    this.isSavingSalesStage = false;
    this.salesStageFormShow = false;
    this.saveStageErrMsg = '';

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

SalesStageStore.prototype.deleteIsSavingSalesStage = function() {
    this.isSavingSalesStageHome = true;
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