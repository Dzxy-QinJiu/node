var CRMActions = require("../action/basic-actions");

function CRMStore() {
    //基本资料
    this.basicData = {};
    //加载数据中。。。
    this.basicIsLoading = true;
    //是否展示编辑基本资料页面的标志
    this.editShowFlag = false;
    //销售团队、销售人员列表对象
    this.salesObj = {};

    this.bindActions(CRMActions);

    this.exportPublicMethods({
        getBasicState: this.getBasicState,
        getBasicInfo: this.getBasicInfo,
        getSalesObj: this.getSalesObj

    });

}

//公开方法，获取客户的基本资料
CRMStore.prototype.getBasicInfo = function () {
    return this.getState().basicData;
};

CRMStore.prototype.getBasicState = function () {
    return this.getState().basicIsLoading;
};

CRMStore.prototype.getEditShowFlag = function () {
    return this.getState().editShowFlag;
};

CRMStore.prototype.getSalesObj = function () {
    return this.getState().salesObj;
};

//监听Actions的方法处理
CRMStore.prototype.getBasicData = function (basicData) {
    this.basicData = basicData;
    this.basicIsLoading = false;
};

CRMStore.prototype.setBasicState = function (state) {
    this.basicIsLoading = state;
};

CRMStore.prototype.submitBaiscForm = function (newBasicData) {
    //如果当前展示的是要修改的客户资料，则更新，否则，不更新
    if (newBasicData.id == this.basicData.id) {
        this.basicData = newBasicData;
    }
    this.editShowFlag = false;
};

module.exports = alt.createStore(CRMStore, 'CRMStore');
