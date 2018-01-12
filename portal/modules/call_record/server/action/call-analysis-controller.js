"use strict";

//通话分析
var callAnalysisService = require("../service/call-analysis-service");
var _ = require("underscore");
let BackendIntl = require("../../../../lib/utils/backend_intl");

var callRateData = [];

// 获取单次通话时长为top10的数据
exports.getCallDurTopTen = function (req, res) {
    callAnalysisService.getCallDurTopTen(req, res, req.params, req.body).on("success", (data) => {
        res.status(200).json(data);
    }).on("error", (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// 获取通话总次数、总时长为top10的数据
exports.getCallTotalList = function (req, res) {
    callAnalysisService.getCallTotalList(req, res, req.query).on("success", (data) => {
        res.status(200).json(data);
    }).on("error", (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 获取通话数量和通话时长趋势图统计
exports.getCallCountAndDur = function (req, res) {
    callAnalysisService.getCallCountAndDur(req, res, req.params, req.body).on("success", (data) => {
        res.status(200).json(data);
    }).on("error", (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 获取电话的接通情况
exports.getCallInfo = function (req, res) {
    callAnalysisService.getCallInfo(req, res, req.params, req.body).on("success", function (data) {
        callRateData = data;
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 通话记录中，114占比
exports.getCallRate = function (req, res) {
    callAnalysisService.getCallRate(req, res, req.params, req.body).on("success", (data) => {
        res.status(200).json(data);
    }).on("error", (codeMessage) => {
        res.json(codeMessage && codeMessage.message);
    });
};

//获取通话时段（数量和时长）的统计数据
exports.getCallIntervalData = function (req, res) {
    callAnalysisService.getCallIntervalData(req, res, req.query).on("success", (data) => {
        res.status(200).json(data);
    }).on("error", (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 获取团队信息
exports.getSaleGroupTeams = function (req, res) {
    callAnalysisService.getSaleGroupTeams(req, res, req.params).on("success", (data) => {
        res.status(200).json(data);
    }).on("error", (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 获取成员信息
exports.getSaleMemberList = function (req, res) {
    callAnalysisService.getSaleMemberList(req, res, req.params).on("success", (data) => {
        res.status(200).json(data);
    }).on("error", (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//呼入呼出数据格式化
function formatData(data) {
    if (isNaN(data)) {
        return "-";
    } else {
        //小数格式转化为百分比
        data = data * 100;
        //均保留两位小数
        return data.toFixed(2);
    }
}

//数据判断
function getData(data) {
    if (isNaN(data)) {
        return "-";
    } else {
        return data;
    }
}
//获取计费时长
function getBillingTime(seconds) {
    if (isNaN(seconds)) {
        return "-";
    } else {
        return Math.ceil(seconds / 60);
    }
}

// 导出数据转换成和界面上一致的数据
function transCallData() {
    let callRateList = _.isArray(callRateData.salesPhoneList) ? callRateData.salesPhoneList : [];
    callRateList = _.map(callRateList, (callRateItem) => {
        return {
            salesName: callRateItem.salesName || "",//销售名称
            totalTime: getData(callRateItem.totalTime),//总时长
            totalAnswer: getData(callRateItem.calloutSuccess),//总接通数
            averageTime: getData(callRateItem.averageTime),//日均时长
            averageAnswer: getData(callRateItem.averageAnswer),//日均接通数
            callinCount: getData(callRateItem.callinCount),//呼入次数
            callinSuccess: getData(callRateItem.callinSuccess),//成功呼入
            callinRate: formatData(callRateItem.callinRate),//呼入接通率
            calloutCount: getData(callRateItem.calloutCount),//呼出次数
            calloutRate: formatData(callRateItem.calloutRate),//呼出接通率
            billingTime: getBillingTime(callRateItem.totalTime)//计费时长
        };
    });
    return callRateList;
}

function exportCallData(callType, req) {
    let callRateDataArray = transCallData();
    let backendIntl = new BackendIntl(req);
    let titleName = {
        salesName: backendIntl.get("sales.home.sales", "销售"),
        totalTime: backendIntl.get("sales.home.total.duration", "总时长") + '(' + backendIntl.get("user.time.second", "秒") + ')',
        totalAnswer: backendIntl.get("sales.home.total.connected", "总接通数"),
        averageTime: backendIntl.get("sales.home.average.duration", "日均时长") + '(' + backendIntl.get("user.time.second", "秒") + ')',
        averageAnswer: backendIntl.get("sales.home.average.connected", "日均接通数"),
        callinCount: backendIntl.get("sales.home.phone.callin", "呼入次数"),
        callinSuccess: backendIntl.get("sales.home.phone.callin.success", "成功呼入"),
        callinRate: backendIntl.get("sales.home.phone.callin.rate", "呼入接通率"),
        calloutCount: backendIntl.get("sales.home.phone.callout", "呼出次数"),
        calloutRate: backendIntl.get("sales.home.phone.callout.rate", "呼出接通率")
    };
    let tempArray = []; // 通话类型和呼叫中心类型的数据，临时保存的时长数组
    let exportCallDataArray = [];
    if (callType != 'app') {
        tempArray = _.chain(callRateDataArray).map((item) => _.omit(item, 'billingTime')).value();
        tempArray.unshift(titleName);
        exportCallDataArray = tempArray.map((item) => {
            return _.values(item);
        });
    } else if (callType == 'app') { // 通话类型是app时，显示计费时长(分钟)列
        titleName.billingTime = backendIntl.get("sales.home.phone.billing.time", "计费时长(分钟)");
        callRateDataArray.unshift(titleName);
        exportCallDataArray = callRateDataArray.map((item) => {
            return _.values(item);
        });
    }
    return exportCallDataArray;
}

function templateFile(res, exportCallData, filename) {
    var exportCallData = Buffer.concat([new Buffer("\xEF\xBB\xBF", "binary"), new Buffer(exportCallData)]);
    res.setHeader("Content-disposition", "attachement; filename=" + filename);
    res.setHeader("Content-Type", "application/csv");
    res.write(exportCallData);
    res.end();
}

// 导出通话率文件
exports.getCallRateFile = function (req, res) {
    let callType = req.params.call_type;
    let filename = "call_rate.csv";
    let exportCallDataArray = exportCallData(callType, req);
    templateFile(res, exportCallDataArray.join('\n'), filename);
};