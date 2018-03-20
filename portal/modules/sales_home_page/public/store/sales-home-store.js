var SalesHomeActions = require("../action/sales-home-actions");
import TimeStampUtil from 'PUB_DIR/sources/utils/time-stamp-util';
var TimeUtil = require("PUB_DIR/sources/utils/time-format-util");
const STATUS = {UNHANDLED: "unhandled", HANDLED: "handled"};
import {ALL_LISTS_TYPE} from "PUB_DIR/sources/utils/consts";
function SalesHomeStore() {
    this.setInitState();
    this.bindActions(SalesHomeActions);
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
//设置初始化数据
SalesHomeStore.prototype.setInitState = function () {
    //电话统计数据
    this.phoneTotalObj = {
        loading: true,
        errMsg: '',
        data: {}
    };
    //新增客户统计
    this.customerTotalObj = {
        loading: true,
        errMsg: '',
        data: {}
    };
    //今日联系的客户
    this.customerContactTodayObj = {
        loading: true,
        errMsg: '',
        data: {}
    };
    //今日要联系的日程
    this.scheduleTodayObj = {
        loading: true,
        errMsg: '',
        data: {
            list: [],
            total: ""
        }
    };
    //到今日过期的日程
    this.scheduleExpiredTodayObj = {
        loading: true,
        errMsg: '',
        curPage: 1,
        data: {
            list: [],
            total: ""
        }
    };
    //关注客户登录
    this.concernCustomerObj = {
        loading: true,
        errMsg: '',
        curPage: 1,
        data: {
            list: [],
            total: ""
        }
    };
    //停用客户登录
    this.appIllegalObj = {
        loading: true,
        errMsg: '',
        curPage: 1,
        data: {
            list: [],
            total: ""
        }
    };
    //最近登录的客户
    this.recentLoginCustomerObj = {
        loading: true,
        errMsg: '',
        data: {
            list: [],
            total: ""
        }
    };
    //重复客户列表
    this.repeatCustomerObj = {
        loading: true,
        errMsg: "",
        data: {
            list: [],
            total: ""
        }
    };
    //即将到期的签约用户
    this.willExpiredAssignCustomer = {
        loading: true,
        errMsg: "",
        data: {
            list: [],
            total: ""
        }
    };
    //即将到期的试用用户
    this.willExpiredTryCustomer = {
        loading: true,
        errMsg: "",
        data: {
            list: [],
            total: ""
        }
    };
    //新分配的客户
    this.newDistributeCustomer = {
        loading: true,
        errMsg: "",
        data: {
            list: [],
            total: ""
        }
    };
    this.rangParams = [{//默认展示今天的数据
        from: TimeStampUtil.getTodayTimeStamp().start_time,
        to: TimeStampUtil.getTodayTimeStamp().end_time,
        type: "time",
        name: "last_contact_time"
    }];
    //最近7天登录的客户
    this.rangParamsLogin = [{//默认展示今天的数据
        from: TimeStampUtil.getTodayTimeStamp().start_time - 7 * oplateConsts.ONE_DAY_TIME_RANGE,
        to: TimeStampUtil.getTodayTimeStamp().end_time,
        type: "time",
        name: "last_login_time"
    }];
    //最近登录的客户
    this.sorterLogin = {
        field: "last_login_time",//排序字段
        order: "descend"
    };
    this.page_size = 10;
    this.sorter = {
        field: "last_contact_time",//排序字段
        order: "descend"
    };
    //开始时间
    this.start_time = TimeStampUtil.getTodayTimeStamp().start_time;
    //结束时间
    this.end_time = TimeStampUtil.getTodayTimeStamp().end_time;
    this.status = STATUS.UNHANDLED;//未处理，handled:已处理
    this.selectedCustomerPanel = ALL_LISTS_TYPE.SCHEDULE_TODAY;//选中客户所在的模块
    this.listenScrollBottom = true;//是否监听滚动
};
//获取今日通话数量和时长
SalesHomeStore.prototype.getphoneTotal = function (result) {
    this.phoneTotalObj.loading = result.loading;
    if (result.error) {
        this.phoneTotalObj.errMsg = result.errMsg;
    } else if (result.resData) {
        let salesPhoneList = result.resData && _.isArray(result.resData.salesPhoneList) ? result.resData.salesPhoneList : [];
        salesPhoneList = salesPhoneList.map((salesPhone) => {
            return {
                averageAnswer: getData(salesPhone.averageAnswer),//日均接通数
                averageTime: getData(salesPhone.averageTime),//日均时长
                averageTimeDescr: TimeUtil.getFormatTime(salesPhone.averageTime),
                salesName: salesPhone.salesName || "",//销售名称
                totalAnswer: getData(salesPhone.totalAnswer),//总接通数
                totalTime: getData(salesPhone.totalTime),//总时长
                totalTimeDescr: TimeUtil.getFormatTime(salesPhone.totalTime),
                callinCount: getData(salesPhone.callinCount),//呼入次数
                callinSuccess: getData(salesPhone.callinSuccess),//成功呼入
                callinRate: formatData(salesPhone.callinRate),//呼入接通率
                calloutCount: getData(salesPhone.calloutCount),//呼出次数
                calloutSuccess: getData(salesPhone.calloutSuccess),//成功呼出
                calloutRate: formatData(salesPhone.calloutRate),//呼出接通率
                billingTime: getBillingTime(salesPhone.totalTime)//计费时长
            };
        });
        let totalTime = 0, totalCount = 0;
        salesPhoneList.forEach((phone) => {
            totalCount += phone.totalAnswer || 0;
            totalTime += phone.totalTime || 0;
        });
        this.phoneTotalObj.data = {
            'totalTime': totalTime,
            'totalCount': totalCount
        };
    }
};
//获取客户统计总数
SalesHomeStore.prototype.getCustomerTotal = function (result) {
    var customerTotalObj = this.customerTotalObj;
    customerTotalObj.loading = result.loading;
    if (result.error) {
        customerTotalObj.errMsg = result.errMsg;
    } else if (result.resData) {
        customerTotalObj.data = result.resData;
        if (!_.isObject(customerTotalObj.data)) {
            customerTotalObj.data = {
                "added": 0,
                "dealed": 0,
                "executed": 0,
                "total": 0
            };
        }
    }
};
//获取今日联系的客户列表
SalesHomeStore.prototype.getTodayContactCustomer = function (result) {
    var customerContactTodayObj = this.customerContactTodayObj;
    customerContactTodayObj.loading = result.loading;

    if (result.error) {
        customerContactTodayObj.errMsg = result.errMsg;
    } else if (result.resData) {
        customerContactTodayObj.data = result.resData;
    }
};
//获取最近登录的客户列表
SalesHomeStore.prototype.getRecentLoginCustomers = function (result) {
    var recentLoginCustomerObj = this.recentLoginCustomerObj;
    recentLoginCustomerObj.loading = result.loading;
    if (result.error) {
        recentLoginCustomerObj.errMsg = result.errMsg;
    } else if (result.resData) {
        recentLoginCustomerObj.data.list = recentLoginCustomerObj.data.list.concat(result.resData.result);
        recentLoginCustomerObj.data.total = result.resData.total;
    }
};
//获取新分配的客户列表
SalesHomeStore.prototype.getNewDistributeCustomer = function (result) {
    var newDistributeCustomer = this.newDistributeCustomer;
    newDistributeCustomer.loading = result.loading;
    if (result.error) {
        newDistributeCustomer.errMsg = result.errMsg;
    } else if (result.resData) {
        newDistributeCustomer.data.list = result.resData.result;
        newDistributeCustomer.data.total = result.resData.total;
    }
};
//获取日程列表
SalesHomeStore.prototype.getScheduleList = function (result) {
    if (result.type === "expired") {
        //获取的过期日程列表
        var scheduleExpiredTodayObj = this.scheduleExpiredTodayObj;
        scheduleExpiredTodayObj.loading = result.loading;
        if (result.error) {
            scheduleExpiredTodayObj.errMsg = result.errMsg;
        } else if (result.resData) {
            scheduleExpiredTodayObj.data.list = scheduleExpiredTodayObj.data.list.concat(processScheduleLists(result.resData.list,false));
            scheduleExpiredTodayObj.data.total = result.resData.total;

            scheduleExpiredTodayObj.curPage++;
        }
    } else {
        //获取今天的日程列表
        var scheduleTodayObj = this.scheduleTodayObj;
        scheduleTodayObj.loading = result.loading;
        if (result.error) {
            scheduleTodayObj.errMsg = result.errMsg;
        } else if (result.resData) {
            scheduleTodayObj.data.list = processScheduleLists(result.resData.list,true);
            scheduleTodayObj.data.total = result.resData.total;
        }
    }
};
// 对日程进行整理
function processScheduleLists(list,isSort) {
    if (!_.isArray(list)) {
        list = [];
    }
    _.each(list, (item) => {
        if (item.end_time - item.start_time === 24 * 60 * 60 * 1000 - 1000) {
            item.allDay = true;
        }
    });
    if (isSort){
        //不是全天日程
        var notFulldaylist = _.filter(list, (item) => {
            return !item.allDay;
        });
        //全天的日程
        var Fulldaylist = _.filter(list, (item) => {
            return item.allDay;
        });
        //对日程数据进行排序，把全天的放在最上面，已完成的放在最下面
        var list = _.flatten([notFulldaylist, Fulldaylist,]);
    }

    return list;
}
//获取关注客户登录或者是停用客户登录
SalesHomeStore.prototype.getSystemNotices = function (result) {
    if (result.type === "concerCustomerLogin") {
        //获取的过期日程列表
        var concernCustomerObj = this.concernCustomerObj;
        concernCustomerObj.loading = result.loading;
        if (result.error) {
            concernCustomerObj.errMsg = result.errMsg;
        } else if (result.resData) {
            concernCustomerObj.data.list = concernCustomerObj.data.list.concat(result.resData.list);
            concernCustomerObj.data.total = result.resData.total;
            concernCustomerObj.curPage++;
        }
    } else if (result.type === "appIllegal") {
        //获取今天的日程列表
        var appIllegalObj = this.appIllegalObj;
        appIllegalObj.loading = result.loading;
        if (result.error) {
            appIllegalObj.errMsg = result.errMsg;
        } else if (result.resData) {
            appIllegalObj.data.list = appIllegalObj.data.list.concat(result.resData.list);
            appIllegalObj.data.total = result.resData.total;
            appIllegalObj.curPage++;
        }
    }
};
//获取即将到期的客户
SalesHomeStore.prototype.getWillExpireCustomer = function (result) {
    //签约用户
    if (result.type === "正式用户") {
        //获取的过期日程列表
        var willExpiredAssignCustomer = this.willExpiredAssignCustomer;
        willExpiredAssignCustomer.loading = result.loading;
        if (result.error) {
            willExpiredAssignCustomer.errMsg = result.errMsg;
        } else if (result.resData && _.isArray(result.resData.result) && result.resData.result.length) {
            var willExpiredAssignCustomerLists = result.resData.result[0];
            willExpiredAssignCustomer.data.list = willExpiredAssignCustomerLists.day_list;
            willExpiredAssignCustomer.data.total = willExpiredAssignCustomerLists.customer_tags_total;

        }
    } else if (result.type === "试用用户") {
        //获取即将到期的试用用户
        var willExpiredTryCustomer = this.willExpiredTryCustomer;
        willExpiredTryCustomer.loading = result.loading;
        if (result.error) {
            willExpiredTryCustomer.errMsg = result.errMsg;
        } else if (result.resData && _.isArray(result.resData.result) && result.resData.result.length) {
            var willExpiredTryCustomerLists = result.resData.result[0];
            willExpiredTryCustomer.data.list = willExpiredTryCustomerLists.day_list;
            willExpiredTryCustomer.data.total = willExpiredTryCustomerLists.customer_tags_total;
        }
    }
};

//获取重复客户列表
SalesHomeStore.prototype.getRepeatCustomerList = function (result) {
    var repeatCustomerObj = this.repeatCustomerObj;
    repeatCustomerObj.loading = result.loading;
    if (result.error) {
        repeatCustomerObj.errMsg = result.errMsg;
    } else if (result.resData) {
        repeatCustomerObj.data.list = repeatCustomerObj.data.list.concat(result.resData.result);
        repeatCustomerObj.data.total = result.resData.total;
    }
};

//修改某个提醒的状态
SalesHomeStore.prototype.afterHandleStatus = function (newStatusObj) {
    //如果是今日的日程
    if (newStatusObj.type === ALL_LISTS_TYPE.SCHEDULE_TODAY) {
        //如果是过期的日程
        this.scheduleTodayObj.data.list = _.filter(this.scheduleTodayObj.data.list, (schedule) => {
            return schedule.id !== newStatusObj.id;
        });
        this.scheduleTodayObj.data.total--;
    } else if (newStatusObj.type === ALL_LISTS_TYPE.WILL_EXPIRED_SCHEDULE_TODAY) {
        this.scheduleExpiredTodayObj.data.list = _.filter(this.scheduleExpiredTodayObj.data.list, (schedule) => {
            return schedule.id !== newStatusObj.id;
        });
    }
};

// 设置要选中的客户的id
SalesHomeStore.prototype.setSelectedCustomer = function (Item) {
    // this.selectedCustomer = Item.selectedObj;
    // this.selectedCustomerId = Item.selectedObj.customer_id || Item.selectedObj.id;
    // this.selectedCustomerPanel = Item.selectedPanel;
};
module.exports = alt.createStore(SalesHomeStore, 'SalesHomeStore');
