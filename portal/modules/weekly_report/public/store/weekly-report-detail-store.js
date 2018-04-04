var weeklyReportDetailActions = require("../action/weekly-report-detail-actions");
import {formatRoundingData} from "PUB_DIR/sources/utils/common-method-util";
function weeklyReportDetailStore() {
    this.setInitState();
    this.bindActions(weeklyReportDetailActions);
}
// 通话类型的常量
const CALL_TYPE_OPTION = {
    ALL: 'all',
};
weeklyReportDetailStore.prototype.setInitState = function () {
    //开始时间
    this.start_time = moment().startOf('week').valueOf();
    //结束时间
    this.end_time = moment().endOf('week').valueOf();
    this.call_type = CALL_TYPE_OPTION.ALL; // 通话类型
    //电话统计
    this.salesPhone = {
        list: [],
        loading: false,
        errMsg: ""//获取数据失败
    };
    //合同统计
    this.contractData = {
        list: [],
        loading: false,
        errMsg: ""//获取数据失败
    };
    //回款统计
    this.repaymentData = {
        list: [],
        loading: false,
        errMsg: ""//获取数据失败
    };
    //地域分布统计
    this.regionOverlayData = {
        list: [],
        loading: false,
        errMsg: ""//获取数据失败
    };
    //客户阶段分布统计
    this.customerStageData = {
        list: [],
        loading: false,
        errMsg: ""//获取数据失败
    };
    //保存员工请假信息
    this.addAskForLeave = {
        submitting: false,//正在保存
        errMsg: "" //保存出错
    }

};
//获取电话统计
weeklyReportDetailStore.prototype.getCallInfo = function (result) {
    this.salesPhone.loading = result.loading;
    if (result.error) {
        this.salesPhone.errMsg = result.errMsg;
    } else {
        if (_.isArray(result.resData)) {
            _.each(result.resData, (item) => {
                //日均时长保留一位小数
                item.average_time = formatRoundingData(item.average_time, 1);
                //日接通数保留整数
                item.average_num = formatRoundingData(item.average_num, 0);
            })
        }
        this.salesPhone.list = _.isArray(result.resData) ? result.resData : [];
    }
};
//获取合同信息
weeklyReportDetailStore.prototype.getContractInfo = function (result) {
    this.contractData.loading = result.loading;
    if (result.error) {
        this.contractData.errMsg = result.errMsg;
    } else {
        this.contractData.list = _.isArray(result.resData) ? result.resData : [];
    }
};
//获取回款信息
weeklyReportDetailStore.prototype.getRepaymentInfo = function (result) {
    this.repaymentData.loading = result.loading;
    if (result.error) {
        this.repaymentData.errMsg = result.errMsg;
    } else {
        this.repaymentData.list = _.isArray(result.resData) ? result.resData : [];
    }

};

//获取地域分布信息
weeklyReportDetailStore.prototype.getRegionOverlayInfo = function (result) {
    this.regionOverlayData.loading = result.loading;
    if (result.error) {
        this.regionOverlayData.errMsg = result.errMsg;
    } else {
        this.regionOverlayData.list = _.isArray(result.resData) && result.resData.length ? result.resData[0].res_list : [];
    }
};

//获取客户阶段
weeklyReportDetailStore.prototype.getCustomerStageInfo = function (result) {
    this.customerStageData.loading = result.loading;
    if (result.error) {
        this.customerStageData.errMsg = result.errMsg;
    } else {
        this.customerStageData.list = _.isArray(result.resData) && result.resData.length ? result.resData[0].this_week_sta : [];
    }
};

//保存员工请假信息
weeklyReportDetailStore.prototype.addForLeave = function (result) {
    this.addAskForLeave.submitting = result.submitting;
    if (result.error) {
        this.addAskForLeave.errMsg = result.errMsg;
    }
};
module.exports = alt.createStore(weeklyReportDetailStore, 'weeklyReportDetailStore');