/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/10/31.
 */
import dealManageAction from '../action';

function dealManageStore() {
    this.setInitData();
    this.bindActions(dealManageAction);
}
//设置初始值
dealManageStore.prototype.setInitData = function() {
    this.dealListObj = {
        isLoading: false,
        errorMsg: '',
        list: [],
        total: 0,
        lastId: '',//用来处理下拉加载的id
        listenScrollBottom: true,//是否监听下拉加载
    };
};
//获取订单列表
dealManageStore.prototype.getDealList = function(resultObj) {
    if (resultObj.loading) {
        this.dealListObj.isLoading = true;
        this.dealListObj.errorMsg = '';
    } else if (resultObj.errorMsg) {
        this.dealListObj.isLoading = false;
        this.dealListObj.errorMsg = resultObj.errorMsg;
    } else {
        this.dealListObj.isLoading = false;
        this.dealListObj.errorMsg = '';
        let dealList = _.get(resultObj, 'data.result', []);
        if (this.dealListObj.lastId) {
            this.dealListObj.list = this.dealListObj.list.concat(dealList);
        } else {
            this.dealListObj.list = dealList;
        }
        this.dealListObj.total = _.get(resultObj, 'data.total', 0);
        let curListLength = _.get(this.dealListObj, 'list.length');
        this.dealListObj.lastId = _.get(this.dealListObj, `list[${curListLength - 1}].id`, '');
        if (curListLength >= this.dealListObj.total) {
            this.dealListObj.listenScrollBottom = false;
        }
    }
};

dealManageStore.prototype.setLastDealId = function(id) {
    this.dealListObj.lastId = id;
};

dealManageStore.prototype.addOneDeal = function(deal) {
    this.dealListObj.list.unshift(deal);
};

//删除订单成功后，删除列表中对应的订单
dealManageStore.prototype.afterDeleteDeal = function(dealId) {
    //过滤掉删除的订单
    this.dealListObj.list = _.filter(this.dealListObj.list, deal => deal.id !== dealId);
    this.dealListObj.total -= 1;
};

//修改订单成功后，更新列表中对应的内容（newDeal:修改了哪些属性，传哪些属性和订单id）
dealManageStore.prototype.updateDeal = function(newDeal) {
    let editDeal = _.find(this.dealListObj.list, deal => deal.id === newDeal.id);
    if (editDeal) {
        _.each(newDeal, (value, key) => {
            editDeal[key] = value;
        });
    }
};

export default alt.createStore(dealManageStore, 'dealManageStore');
