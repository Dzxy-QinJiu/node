var CallAnalysisActions = require("../action/call-analysis-action");
import DateSelectorUtils from "CMP_DIR/datepicker/utils";
import TimeUtil from "PUB_DIR/sources/utils/time-format-util";
import userData from 'PUB_DIR/sources/user-data';
import {formatRoundingPercentData} from "PUB_DIR/sources/utils/common-method-util";
function CallAnalysisStore() {
    this.setInitState();
    this.bindActions(CallAnalysisActions);
}

//设置初始化数据
CallAnalysisStore.prototype.setInitState = function () {
    this.loading = false; // 通话信息的loading
    //默认展示今天的时间
    this.timeType = "day";
    var timeRange = DateSelectorUtils.getTodayTime();
    //开始时间
    this.start_time = DateSelectorUtils.getMilliseconds(timeRange.start_time);
    //结束时间
    this.end_time = DateSelectorUtils.getMilliseconds(timeRange.end_time, true);
    // 获取通话时长TOP10的数据
    this.callDurList = {
        loading: false, // loading
        data: [], //数据列表
        errMsg: ''  // 获取失败的提示
    };
    // 获取通话总次数TOP10的数据
    this.callTotalCountObj = {
        loading: false,
        data: [],
        errMsg: ''
    };
    // 获取通话总时长TOP10的数据
    this.callTotalTimeObj = {
        loading: false,
        data: [],
        errMsg: ''
    };
    // 获取通话数量和通话时长趋势图统计
    this.callList = {
        loading: false, // loading
        count: [],  //通话数量
        duration: [],  // 通话时长
        errMsg: ''   // 获取失败的提示
    };
    //单独获取每个团队的通话数量和通话时长趋势图统计数据
    this.eachTeamCallList = {
       loading: false,//loading
       list: [],
       errMsg: '' //获取失败的提示
    };
    // 通话信息
    this.salesPhoneList = [];

    this.callRateList = {
        // 获取114占比的数据
        "114": {
            loading: false, // loading
            list: [],
            errMsg: ''  // 获取失败的提示
        },
        // 获取客服电话的数据
        "service": {
            loading: false, // loading
            list: [],
            errMsg: ''  // 获取失败的提示
        }
    };
    //通话时段（数量和时长）的数据
    this.callIntervalData = {
        loading: false, // loading
        timeList: [],//时长的列表
        countList: [],//数量的列表
        errMsg: ''  // 获取失败的提示
    };

    // 团队数据
    this.teamList = {
        list: [],
        errMsg: ''  // 获取失败的提示
    };
    // 成员数据
    this.memberList = {
        list: [],
        errMsg: '' // 获取失败的提示
    };
};

//  获取通话时长为TOP10的列表
CallAnalysisStore.prototype.getCallDurTopTen = function (result) {
    var callDurList = this.callDurList;
    callDurList.loading = result.loading;
    if (result.error) {
        callDurList.errMsg = result.errMsg || Intl.get("call.record.top.failed", "获取通话时长TOP10失败");
    } else {
        callDurList.errMsg = '';
        if (result.resData) {
            var data = result.resData.result;
            if (!_.isArray(data)) {
                data = [];
            }
            callDurList.data = data;
        }
    }
};
// 获取通话总次数TOP10的数据
CallAnalysisStore.prototype.getCallTotalList = function (dataObj) {
    let callTotalCountObj = this.callTotalCountObj;
    let callTotalTimeObj = this.callTotalTimeObj;
    callTotalCountObj.loading = dataObj.loading;
    callTotalTimeObj.loading = dataObj.loading;
    if (dataObj.error) {
        callTotalCountObj.errMsg = dataObj.errMsg || Intl.get("call.analysis.total.count.failed", "获取通话总次数TOP10失败");
        callTotalTimeObj.errMsg = dataObj.errMsg || Intl.get("call.analysis.total.time.failed", "获取通话总时长TOP10失败");
    } else {
        callTotalCountObj.errMsg = '';
        callTotalTimeObj.errMsg = '';
        if (dataObj.resData) {
            let data = dataObj.resData.list;
            if (_.isObject(data)) {
                //总时长
                if (_.isArray(data.sum) && data.sum.length) {
                    callTotalTimeObj.data = data.sum;
                } else {
                    callTotalTimeObj.data = [];
                }
                //总次数
                if (_.isArray(data.count) && data.count.length) {
                    callTotalCountObj.data = data.count;
                } else {
                    callTotalCountObj.data = [];
                }
            }
        }
    }
};

//  获取通话数量和通话时长趋势图统计
CallAnalysisStore.prototype.getCallCountAndDur = function (result) {
    var callList = this.callList;
    callList.loading = result.loading;
    if (result.error) {
        callList.errMsg = result.errMsg || Intl.get("call.record.trend.failed", '获取通话数量和通话时长数据失败！');
    } else {
        callList.errMsg = '';
        if (result.resData) {
            let resData = result.resData.result;
            let durationArray = [];
            let countArray = [];
            if (_.isArray(resData) && resData.length > 0) {
                _.each(resData, (item) => {
                    durationArray.push({timestamp: item.date, count: item.sum});
                    countArray.push({timestamp: item.date, count: item.docments});
                });
            }
            callList.duration = durationArray;
            callList.count = countArray;
        }
    }
};
//分别获取不同团队的通话数量
CallAnalysisStore.prototype.getCallCountAndDurSeparately = function (result) {
    var eachTeamCallList = this.eachTeamCallList;
    eachTeamCallList.loading = result.loading;
    if (result.error) {
        eachTeamCallList.errMsg = result.errMsg || Intl.get("call.record.trend.failed", '获取通话数量和通话时长数据失败！');
    } else {
        eachTeamCallList.errMsg = '';
        if (result.resData) {
            let resData = result.resData;
            if (_.isArray(resData) && resData.length > 0) {
                var callListData = [];
                _.each(resData, (item) => {
                    let durationArray = [];
                    let countArray = [];
                    var teamObj = _.find(this.teamList.list, (team)=> team.id == item.teamId);
                    if (teamObj && teamObj.name){
                        item.teamName = teamObj.name;
                    }
                    _.each(item.teamData,(dataItem)=>{
                        durationArray.push({timestamp: dataItem.date, count: dataItem.sum});
                        countArray.push({timestamp: dataItem.date, count: dataItem.docments});
                    });
                    item.duration = durationArray;
                    item.count = countArray;
                    var cloneItem = _.clone(item);
                    delete cloneItem.teamData
                    callListData.push(cloneItem)
                });
            }
            eachTeamCallList.list = callListData;
        }
    }
};

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

CallAnalysisStore.prototype.getCallInfo = function (result) {
    this.loading = result.loading;
    var data = result.resData;
    if (data && _.isObject(data)) {
        let salesPhoneList = _.isArray(data.salesPhoneList) ? data.salesPhoneList : [];
        salesPhoneList = salesPhoneList.map((salesPhone) => {
            var memberTotal = salesPhone.memberTotal;
            return {
                averageAnswer: getData(salesPhone.averageAnswer),//日均接通数
                averageTime: getData(salesPhone.averageTime),//日均时长
                averageTimeFormated: TimeUtil.getFormatTime(salesPhone.averageTime),
                name: salesPhone.name || "",//销售或者团队的名称
                totalAnswer: getData(salesPhone.totalAnswer),//总接通数
                totalTime: getData(salesPhone.totalTime),//总时长
                totalTimeFormated: TimeUtil.getFormatTime(salesPhone.totalTime),
                callinCount: getData(salesPhone.callinCount),//呼入次数
                callinSuccess: getData(salesPhone.callinSuccess),//成功呼入
                callinRate: formatRoundingPercentData(salesPhone.callinRate),//呼入接通率
                calloutCount: getData(salesPhone.calloutCount),//呼出次数
                calloutSuccess: getData(salesPhone.calloutSuccess),//成功呼出
                calloutRate: formatRoundingPercentData(salesPhone.calloutRate),//呼出接通率
                billingTime: getBillingTime(salesPhone.totalTime),//计费时长
                personAverageAnswer: (getData(salesPhone.calloutSuccess)/memberTotal).toFixed(), //人均接通数
                personAverageTime: (getData(salesPhone.totalTime)/memberTotal).toFixed(),//人均通话时长
                personAverageTimeFormated: TimeUtil.getFormatTime((getData(salesPhone.totalTime)/memberTotal).toFixed())//人均通话时长页面上展示的样式，转换成XX:XX:XX格式
            };
        });
        this.salesPhoneList = _.isArray(salesPhoneList) ? salesPhoneList : [];
    } else {
        this.salesPhoneList = [];
    }
};

//更换查询时间
CallAnalysisStore.prototype.changeSearchTime = function (timeObj) {
    this.start_time = timeObj.startTime;
    this.end_time = timeObj.endTime;
    this.timeType = timeObj.timeType;
};

// 114占比&客服电话
CallAnalysisStore.prototype.getCallRate = function (result) {
    const nameMap = {
        "service": Intl.get("call.record.service.phone", '客服电话'),
        "114": Intl.get("call.record.service.phone", '114电话')
    }
    // 根据返回的字段，判断是团队还是成员
    this.callRateList[result.type].loading = result.loading;
    if (result.error) {
        this.callRateList[result.type].errMsg = result.errMsg || Intl.get("call.record.service.phone.failed", '获取114占比失败！');

    } else if (result.resData) {
        if (result.resData.code == 0) {
            this.callRateList[result.type].errMsg = '';
            let resData = result.resData.list;
            if (_.isArray(resData) && resData.length) {
                if (resData.length == 1 && userData.getUserData().user_id == resData[0].user_id) { // 普通销售
                    const list = [
                        {
                            name: Intl.get("call.record.valid.phone", '有效电话'),
                            count: resData[0].valid_docs
                        },
                        {
                            name: nameMap[result.type],
                            count: resData[0].invalid_docs
                        }
                    ]
                    this.callRateList[result.type].list = list;
                }
                else {
                    // nick_name 成员 sales_team是团队数据
                    let filterData = _.filter(resData, (item) => item.rate != 0);
                    const list = _.map(filterData, (item) => {
                        return {
                            name: item.nick_name || item.sales_team,
                            rate: (item.docs_rate * 100),
                            num: item.invalid_docs
                        }
                    });
                    this.callRateList[result.type].list = list;
                }
            }
        } else if (result.resData.code == 1) {
            this.callRateList[result.type].errMsg = result.resData.msg;
        }
    }
};

//获取通话时段（数量\时长）的统计数据
CallAnalysisStore.prototype.getCallIntervalData = function (result) {
    this.callIntervalData.loading = result.loading;
    if (result.error) {
        this.callIntervalData.errMsg = result.errMsg || Intl.get("call.record.count.failed", "获取通话数量失败");
        this.callIntervalData.timeList = [];
        this.callIntervalData.countList = [];
    } else {
        this.callIntervalData.errMsg = '';
        let data = result.resData, timeList = [], countList = [];
        _.each(data, item => {
            timeList.push({week: item.week, hour: item.hour, time: item.billsec_sum});
            countList.push({week: item.week, hour: item.hour, count: item.count});
        });
        this.callIntervalData.timeList = timeList;
        this.callIntervalData.countList = countList;
    }
};

// 获取团队信息
CallAnalysisStore.prototype.getSaleGroupTeams = function (result) {
    if (result.error) {
        this.teamList.errMsg = result.errMsg;
    } else if (result.resData) {
        this.teamList.errMsg = '';
        let resData = result.resData;
        if (_.isArray(resData) && resData.length) {
            this.teamList.list = _.map(resData, (item) => {
                return {
                    name: item.group_name,
                    id: item.group_id
                }
            });
        }
    }
};

// 获取成员信息
CallAnalysisStore.prototype.getSaleMemberList = function (result) {
    if (result.error) {
        this.memberList.errMsg = result.errMsg;
    } else if (result.resData) {
        this.memberList.errMsg = '';
        let resData = result.resData;
        let memberList = [];
        if (_.isArray(resData) && resData.length) {
            _.each(resData, (item) => {
                if (item.status) {
                    memberList.push({name: item.nick_name, id: item.user_id, user_name: item.user_name});
                }
            });
        }
        this.memberList.list = memberList;
    }
};

module.exports = alt.createStore(CallAnalysisStore, 'CallAnalysisStore');