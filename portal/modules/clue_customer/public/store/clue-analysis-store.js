/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/5/24.
 */
var ClueAnalysisAction = require("../action/clue-analysis-action");
import DateSelectorUtils from "CMP_DIR/datepicker/utils";
function ClueAnalysisStore() {
    //初始化state数据
    this.getState();
    this.bindActions(ClueAnalysisAction);
}
ClueAnalysisStore.prototype.getState = function () {
    this.clueAnalysisList = [];//线索分析列表
    this.getClueAnalysisLoading = false;//正在获取线索分析
    this.getClueAnalysisErrMsg = false;//获取线索分析失败
    this.timeType = "week";//默认显示周
    //时间对象（true:本周截止到今天为止）
    var timeObj = DateSelectorUtils.getThisWeekTime(true);
    //开始时间
    this.startTime = DateSelectorUtils.getMilliseconds(timeObj.start_time);
    //结束时间
    this.endTime = DateSelectorUtils.getMilliseconds(timeObj.end_time, true);
    //关联开始时间
    this.relation_start_time = "";
    //关联结束时间
    this.relation_end_time = "";
    //
    this.selectedAccess = Intl.get("common.all", "全部");
    this.selectedSource = Intl.get("common.all", "全部");

};
ClueAnalysisStore.prototype.changeSearchTime = function (timeObj) {
    this.startTime = timeObj.startTime;
    this.endTime = timeObj.endTime;
    this.timeType = timeObj.timeType;
};
ClueAnalysisStore.prototype.getClueAnalysis = function (result) {
    if (result.loading) {
        this.getClueAnalysisLoading = true;
        this.getClueAnalysisErrMsg = "";
    } else if (result.error) {
        this.getClueAnalysisLoading = false;
        this.getClueAnalysisErrMsg = result.errorMsg;
    } else {
        this.getClueAnalysisLoading = false;
        this.getClueAnalysisErrMsg = "";
        this.clueAnalysisList = result.data;
    }
};

module.exports = alt.createStore(ClueAnalysisStore, 'ClueAnalysisStore');