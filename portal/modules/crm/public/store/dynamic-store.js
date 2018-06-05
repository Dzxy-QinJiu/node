var DynamicActions = require('../action/dynamic-action');

function DynamicStore() {
    this.dynamicList = [];
    //绑定action方法
    this.bindListeners({
        //获取动态列表
        'getDynamicList': DynamicActions.getDynamicList
    });
    //绑定view方法
    this.exportPublicMethods({
        getDynamicListFromView: this.getDynamicListFromView
    });

}

//ToView-获取动态列表
DynamicStore.prototype.getDynamicListFromView = function() {
    return this.getState().dynamicList;
};

//获取动态列表
DynamicStore.prototype.getDynamicList = function(list) {
    this.dynamicList = list;
};

module.exports = alt.createStore(DynamicStore , 'DynamicStore');
