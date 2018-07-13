/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/5/24.
 */
var ClueAnalysisAction = require('../action/clue-analysis-action');
import DateSelectorUtils from 'CMP_DIR/datepicker/utils';
function ClueAnalysisStore() {
    //初始化state数据
    this.setInitState();
    this.bindActions(ClueAnalysisAction);
}
ClueAnalysisStore.prototype.setInitState = function() {
    this.customersList = [];//要展示的客户
    this.getCustomersLoading = false;//正在获取客户
    this.getCustomersErrMsg = '';//获取客户失败
    //开始时间
    this.start_time = moment().startOf('year').valueOf();
    //结束时间
    this.end_time = moment().valueOf();
    this.selectedAccess = Intl.get('common.all', '全部');
    this.selectedSource = Intl.get('common.all', '全部');
    //获取线索统计的相关参数
    this.staticsPageSize = 1000;//一次取出
    //获取线索统计的页码
    this.staticsNum = 1;
    //线索阶段统计
    this.clueStageList = {
        loading: false,
        errMsg: '',
        list: []
    };
    //线索来源统计
    this.clueSourceList = {
        loading: false,
        errMsg: '',
        list: []
    };
    //线索接入渠道
    this.clueAccessChannelList = {
        loading: false,
        errMsg: '',
        list: []
    };
    //线索分类
    this.clueClassifyList = {
        loading: false,
        errMsg: '',
        list: []
    };
    //线索有效性统计
    this.clueAvailability = {
        loading: false,
        errMsg: '',
        list: []
    };
    //线索来源趋势统计
    this.clueSourceTrendList = {
        loading: false,
        errMsg: '',
        list: []
    };
    //线索渠道趋势统计
    this.clueChannelTrendList = {
        loading: false,
        errMsg: '',
        list: []
    };
    //线索分类趋势统计
    this.clueClassiftyTrendList = {
        loading: false,
        errMsg: '',
        list: []
    };
    //线索有效性趋势统计
    this.clueAvaibilityTrendList = {
        loading: false,
        errMsg: '',
        list: []
    };
    //线索签约趋势统计
    this.clueAssignedTrendList = {
        loading: false,
        errMsg: '',
        list: []
    };
    //线索分类统计
    this.rangeParams = [{
        from: this.start_time,
        to: this.end_time,
        type: 'time',
        name: 'source_time'
    }];
};
ClueAnalysisStore.prototype.changeSearchTime = function(timeObj) {
    this.start_time = timeObj.startTime;
    this.end_time = timeObj.endTime;
    this.rangeParams[0].from = this.start_time;
    this.rangeParams[0].to = this.end_time;
};

ClueAnalysisStore.prototype.changeAccess = function(access) {
    this.selectedAccess = access;
};

ClueAnalysisStore.prototype.changeSource = function(source) {
    this.selectedSource = source;
};
ClueAnalysisStore.prototype.getClueStatics = function(result) {
    var dataObj = {};
    if (result.loading) {
        dataObj.loading = true;
        dataObj.errMsg = '';
    } else if (result.error) {
        dataObj.loading = false;
        dataObj.errMsg = result.errorMsg;
    } else {
        dataObj.loading = false;
        dataObj.errMsg = '';
        dataObj.list = result.data.result;
    }
    switch (result.type) {
        case 'customer_label':
            this.clueStageList = dataObj;
            break;
        case 'clue_source':
            this.clueSourceList = dataObj;
            break;
        case 'access_channel':
            this.clueAccessChannelList = dataObj;
            break;
        case 'clue_classify':
            this.clueClassifyList = dataObj;
            break;
        case 'availability':
            this.clueAvailability = dataObj;
    }
};
ClueAnalysisStore.prototype.getClueTrendStatics = function(result) {
    var dataObj = {};
    if (result.loading) {
        dataObj.loading = true;
        dataObj.errMsg = '';
    } else if (result.error) {
        dataObj.loading = false;
        dataObj.errMsg = result.errorMsg;
    } else {
        dataObj.loading = false;
        dataObj.errMsg = '';
        dataObj.list = result.data.list;
    }
    switch (result.type) {
        case 'customer_label':
            this.clueAssignedTrendList = dataObj;
            break;
        case 'clue_source':
            this.clueSourceTrendList = dataObj;
            break;
        case 'access_channel':
            this.clueChannelTrendList = dataObj;
            break;
        case 'clue_classify':
            this.clueClassiftyTrendList = dataObj;
            break;
        case 'availability':
            this.clueAvaibilityTrendList = dataObj;
    }
};
ClueAnalysisStore.prototype.getCustomerById = function(result) {
    if (result.loading) {
        this.getCustomersLoading = true;
        this.getCustomersErrMsg = '';
    } else if (result.error) {
        this.getCustomersLoading = false;
        this.getCustomersErrMsg = result.errorMsg;
    } else {
        this.getCustomersLoading = false;
        this.getCustomersErrMsg = '';
        if (_.isArray(result.data.result)){
            this.customersList = result.data.result;
            _.each(this.customersList,(item) => {
                item.customer_name = item.name;
                item.customer_id = item.id;
                if (result.label){
                    item.label = result.label;
                }
            });
        }
    }
};

module.exports = alt.createStore(ClueAnalysisStore, 'ClueAnalysisStore');