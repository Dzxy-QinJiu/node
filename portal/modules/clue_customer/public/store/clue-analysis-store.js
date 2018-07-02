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
    this.clueAnalysisList = [];//线索分析列表
    this.getClueAnalysisLoading = false;//正在获取线索分析
    this.getClueAnalysisErrMsg = false;//获取线索分析失败
    this.customersList = [];//要展示的客户
    this.getCustomersLoading = false;//正在获取客户
    this.getCustomersErrMsg = '';//获取客户失败
    //开始时间
    this.source_start_time = moment().startOf('year').valueOf();
    //结束时间
    this.source_end_time = moment().valueOf();
    this.selectedAccess = Intl.get('common.all', '全部');
    this.selectedSource = Intl.get('common.all', '全部');
    //获取线索统计的相关参数
    this.staticsPageSize = 20;
    //获取线索统计的页码
    this.staticsNum = 1;
    this.staticsFiled = 'clue_source';
    this.clueStaticsList = [];//线索统计列表
    this.getClueStaticsLoading = false;//正在获取线索统计
    this.getClueStaticsErrMsg = '';//获取线索统计失败

};
ClueAnalysisStore.prototype.changeSearchTime = function(timeObj) {
    this.source_start_time = timeObj.sourceStartTime;
    this.source_end_time = timeObj.sourceEndTime;
};

ClueAnalysisStore.prototype.changeAccess = function(access) {
    this.selectedAccess = access;
};

ClueAnalysisStore.prototype.changeSource = function(source) {
    this.selectedSource = source;
};
ClueAnalysisStore.prototype.getClueAnalysis = function(result) {
    if (result.loading) {
        this.getClueAnalysisLoading = true;
        this.getClueAnalysisErrMsg = '';
    } else if (result.error) {
        this.getClueAnalysisLoading = false;
        this.getClueAnalysisErrMsg = result.errorMsg;
    } else {
        this.getClueAnalysisLoading = false;
        this.getClueAnalysisErrMsg = '';
        this.clueAnalysisList = result.data;
    }
};
ClueAnalysisStore.prototype.getClueStatics = function(result) {
    if (result.loading) {
        this.getClueStaticsLoading = true;
        this.getClueStaticsErrMsg = '';
    } else if (result.error) {
        this.getClueStaticsLoading = false;
        this.getClueStaticsErrMsg = result.errorMsg;
    } else {
        this.getClueStaticsLoading = false;
        this.getClueStaticsErrMsg = '';
        this.clueStaticsList = this.clueStaticsList.concat(result.data);
        this.staticsNum++;
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