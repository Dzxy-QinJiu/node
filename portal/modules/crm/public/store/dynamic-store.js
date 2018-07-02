var DynamicActions = require('../action/dynamic-action');

function DynamicStore() {
    this.isLoading = false;//正在获取动态列表
    this.dynamicList = [];
    this.errorMsg = '';//获取动态列表错误提示
    //绑定action方法
    this.bindActions(DynamicActions);
}

//获取动态列表
DynamicStore.prototype.getDynamicList = function(data) {
    if (data.loading) {
        this.isLoading = true;
        this.errorMsg = '';
    } else if (data.errorMsg) {
        this.isLoading = false;
        this.errorMsg = data.errorMsg;
    } else {
        this.isLoading = false;
        this.errorMsg = '';
        this.dynamicList = _.get(data, 'data.list[0]') ? data.list : [];
    }
};

module.exports = alt.createStore(DynamicStore, 'DynamicStore');
