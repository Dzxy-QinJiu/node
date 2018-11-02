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
        if (_.get(dealList, '[0]')) {
            dealList = _.map(dealList, deal => {
                return {
                    ...deal,
                    //预计成交时间，将long类型的时间转成界面上展示的格式YYYY-MM-DD
                    predict_finish_text: deal.predict_finish_time ? moment(deal.predict_finish_time).format(oplateConsts.DATE_FORMAT) : '',
                    //创建时间，将long类型的时间转成界面上展示的格式YYYY-MM-DD
                    time_text: deal.time ? moment(deal.time).format(oplateConsts.DATE_FORMAT) : '',
                };
            });
        }
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

dealManageStore.prototype.addOneDeal = function(deal) {
    this.dealListObj.list.unshift(deal);
};

export default alt.createStore(dealManageStore, 'dealManageStore');
