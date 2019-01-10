var CustomerDynamicActions = require('../action/customer-dynamic-action');

function CustomerDynamicStore() {
    this.isLoading = false;//正在获取动态列表
    this.dynamicList = [];
    this.errorMsg = '';//获取动态列表错误提示
    //绑定action方法
    this.bindActions(CustomerDynamicActions);
}

//获取动态列表
CustomerDynamicStore.prototype.getDynamicList = function(data) {
    if (data.loading) {
        this.isLoading = true;
        this.errorMsg = '';
    } else if (data.errorMsg) {
        this.isLoading = false;
        this.errorMsg = data.errorMsg;
    } else {
        this.isLoading = false;
        this.errorMsg = '';
        this.dynamicList = _.get(data, 'list[0]') ? data.list : [];
    }
};

module.exports = alt.createStore(CustomerDynamicStore, 'CustomerDynamicStore');
