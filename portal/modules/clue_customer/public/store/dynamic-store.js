/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/8.
 */
var DynamicActions = require('../action/dynamic-action');

function DynamicStore() {
    this.setInitialData();
    //绑定action方法
    this.bindActions(DynamicActions);
}
//设置数据的初始值
DynamicStore.prototype.setInitialData = function() {
    this.pageSize = '100';//每页获取的数据
    this.isLoading = false;//正在获取动态列表
    this.dynamicList = [];
    this.errorMsg = '';//获取动态列表错误提示
},

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
        this.dynamicList = _.get(data, 'list[0]') ? data.list : [];
    }
};

module.exports = alt.createStore(DynamicStore, 'DynamicStore');
