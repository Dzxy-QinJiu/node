var weeklyReportActions = require("../action/weekly-report-actions");
function weeklyReportStore() {
    this.setInitState();
    this.bindActions(weeklyReportActions);
}
// 通话类型的常量
const CALL_TYPE_OPTION = {
    ALL: 'all',
    PHONE: 'phone',
    APP: 'app'
};
//设置初始化数据
weeklyReportStore.prototype.setInitState = function () {
    //开始时间
    this.start_time = 0;
    //结束时间
    this.end_time = 0;
    this.call_type = CALL_TYPE_OPTION.ALL; // 通话类型
    //电话统计
    this.salesPhone = {
        list: [],
        loading: false,
        errMsg: ""//获取数据失败
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
// 获取团队信息
weeklyReportStore.prototype.getSaleGroupTeams = function (result) {
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
weeklyReportStore.prototype.getSaleMemberList = function (result) {
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
//获取电话统计
weeklyReportStore.prototype.getCallInfo = function (result) {
    this.salesPhone.loading = result.loading;
    var data = result.resData;
    if (data && _.isObject(data)) {
        let salesPhoneList = _.isArray(data.salesPhoneList) ? data.salesPhoneList : [];
        salesPhoneList = salesPhoneList.map((salesPhone) => {
            return {
                averageAnswer: getData(salesPhone.averageAnswer),//日均接通数
                averageTime: getData(salesPhone.averageTime),//日均时长
                // averageTimeDescr: TimeUtil.getFormatTime(salesPhone.averageTime),
                salesName: salesPhone.salesName || "",//销售名称
                totalAnswer: getData(salesPhone.totalAnswer),//本周总接通数
                totalTime: getData(salesPhone.totalTime),//本周总时长
                // totalTimeDescr: TimeUtil.getFormatTime(salesPhone.totalTime),
            };
        });
        this.salesPhone.list = _.isArray(salesPhoneList) ? salesPhoneList : [];
    } else {
        this.salesPhone.list = [];
    }
};
module.exports = alt.createStore(weeklyReportStore, 'weeklyReportStore');