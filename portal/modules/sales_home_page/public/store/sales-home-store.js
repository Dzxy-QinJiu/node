var SalesHomeActions = require("../action/sales-home-actions");
import TimeStampUtil from 'PUB_DIR/sources/utils/time-stamp-util';
var TimeUtil = require("PUB_DIR/sources/utils/time-format-util");
const STATUS = {UNHANDLED: "unhandled", HANDLED: "handled"};
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
            list:[],
            total:""
        }
    };
    //到今日过期的日程
    this.scheduleExpiredTodayObj = {
        loading: true,
        errMsg: '',
        data: {
            list:[],
            total:""
        }
    };
    //关注客户登录
    this.concernCustomerObj = {
        loading: true,
        errMsg: '',
        data: {
            list:[],
            total:""
        }
    };
    //停用客户登录
    this.appIllegalObj = {
        loading: true,
        errMsg: '',
        data: {
            list:[],
            total:""
        }
    };
    //最近登录的客户
    this.recentLoginCustomerObj = {
        loading: true,
        errMsg: '',
        data: {
            list:[],
            total:""
        }
    };
    //重复客户列表
    this.repeatCustomerObj = {
        loading: true,
        errMsg: "",
        data: {
            list:[],
            total:""
        }
    };
    //某个客户下的用户列表
    this.userListsOfCustomer = {
        loading: true,
        errMsg: "",
        data: {}
    };
    //即将到期的签约用户
    this.willExpiredAssignCustomer = {
        loading: true,
        errMsg: "",
        data: {
            list:[],
            total:""
        }
    };
    //即将到期的试用用户
    this.willExpiredTryCustomer = {
        loading: true,
        errMsg: "",
        data: {
            list:[],
            total:""
        }
    };
    this.rangParams = [{//默认展示今天的数据
        from: TimeStampUtil.getTodayTimeStamp().start_time,
        to: TimeStampUtil.getTodayTimeStamp().end_time,
        type: "time",
        name: "last_contact_time"
    }];

    this.page_size = 10;
    this.sorter = {
        field: "last_contact_time",//排序字段
        order: "descend"
    },
        //开始时间
        this.start_time = TimeStampUtil.getTodayTimeStamp().start_time;
    //结束时间
    this.end_time = TimeStampUtil.getTodayTimeStamp().end_time;
    this.status = STATUS.UNHANDLED;//未处理，handled:已处理
    this.selectedCustomerId = "";//选中的客户的id
    this.selectedCustomer = {};//选中客户对象
    this.curApplyType = "";//申请类型
    this.appList = [];
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
SalesHomeStore.prototype.getRecentLoginCustomer = function (result) {
    var recentLoginCustomerObj = this.recentLoginCustomerObj;
    recentLoginCustomerObj.loading = result.loading;
    if (result.error) {
        recentLoginCustomerObj.errMsg = result.errMsg;
    } else if (result.resData) {
        recentLoginCustomerObj.data.result = result.resData;
    }
};
// 获取最近登录的客户数量
SalesHomeStore.prototype.getRecentLoginCustomerCount = function (result) {
    var recentLoginCustomerObj = this.recentLoginCustomerObj;
    // recentLoginCustomerObj.loading = result.loading;
    // if (result.error) {
    //     recentLoginCustomerObj.errMsg = result.errMsg;
    // } else
    if (result.resData) {
        recentLoginCustomerObj.data.total = result.resData;
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
            scheduleExpiredTodayObj.data.list = scheduleExpiredTodayObj.data.list.concat(processScheduleLists(result.resData.list));
            scheduleExpiredTodayObj.data.total = result.resData.total;
            if (_.isArray(scheduleExpiredTodayObj.data.list) && scheduleExpiredTodayObj.data.list.length && !this.selectedCustomerId){
                this.selectedCustomer = scheduleExpiredTodayObj.data.list[0];
                this.selectedCustomerId = scheduleExpiredTodayObj.data.list[0].customer_id;
            }
        }
    } else {
        //获取今天的日程列表
        var scheduleTodayObj = this.scheduleTodayObj;
        scheduleTodayObj.loading = result.loading;
        if (result.error) {
            scheduleTodayObj.errMsg = result.errMsg;
        } else if (result.resData) {
            scheduleTodayObj.data.list = scheduleTodayObj.data.list.concat(processScheduleLists(result.resData.list));
            if (_.isArray(scheduleTodayObj.data.list) && scheduleTodayObj.data.list.length){
                this.selectedCustomer = scheduleTodayObj.data.list[0];
                this.selectedCustomerId = scheduleTodayObj.data.list[0].customer_id;
            }
            scheduleTodayObj.data.total = result.resData.total;
        }
    }
};
// 对日程进行整理
function processScheduleLists(list) {
    _.each(list, (item) => {
        if (item.end_time - item.start_time === 24 * 60 * 60 * 1000 - 1000) {
            item.allDay = true;
        }
    });
    // //状态是已完成的日程
    // var hasFinishedList = _.filter(list, (item) => {
    //     return item.status == "handle";
    // });
    // //未完成的日程
    // var notFinishedList = _.filter(list, (item) => {
    //     return item.status == "false";
    // });
    //不是全天日程
    // var notFulldaylist = _.filter(list, (item) => {
    //     return !item.allDay;
    // });
    // //全天的日程
    // var Fulldaylist = _.filter(list, (item) => {
    //     return item.allDay;
    // });
    // //对日程数据进行排序，把全天的放在最上面，已完成的放在最下面
    // var sortedList = _.flatten([Fulldaylist, notFulldaylist]);
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
            _.each(result.resData.list,(item)=>{
                item.id = item.customer_id;
            });
            concernCustomerObj.data.list = concernCustomerObj.data.list.concat(result.resData.list);
            concernCustomerObj.data.total = result.resData.total;
            if (_.isArray(concernCustomerObj.data.list) && concernCustomerObj.data.list.length && !this.selectedCustomerId){
                this.selectedCustomer = concernCustomerObj.data.list[0];
                this.selectedCustomerId = concernCustomerObj.data.list[0].customer_id;
            }
        }
    } else if (result.type === "appIllegal") {
        //获取今天的日程列表
        var appIllegalObj = this.appIllegalObj;
        appIllegalObj.loading = result.loading;
        if (result.error) {
            appIllegalObj.errMsg = result.errMsg;
        } else if (result.resData) {
            _.each(result.resData.list,(item)=>{
                item.id = item.customer_id;
            });
            appIllegalObj.data.list = appIllegalObj.data.list.concat(result.resData.list);
            appIllegalObj.data.total = result.resData.total;
            if (_.isArray(appIllegalObj.data.list) && appIllegalObj.data.list.length && !this.selectedCustomerId){
                this.selectedCustomer = appIllegalObj.data.list[0];
                this.selectedCustomerId = appIllegalObj.data.list[0].customer_id;
            }
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
        } else if (result.resData) {
            willExpiredAssignCustomer.data.list = willExpiredAssignCustomer.data.list.concat(result.resData.result.day);
            willExpiredAssignCustomer.data.total = result.resData.result.day_tatol;
            if (_.isArray(willExpiredAssignCustomer.data.list) && willExpiredAssignCustomer.data.list.length && !this.selectedCustomerId){
                this.selectedCustomer = willExpiredAssignCustomer.data.list[0];
                this.selectedCustomerId = willExpiredAssignCustomer.data.list[0].customer_id;
            }
        }
    } else if (result.type === "试用用户") {
        //获取即将到期的试用用户
        var willExpiredTryCustomer = this.willExpiredTryCustomer;
        willExpiredTryCustomer.loading = result.loading;
        if (result.error) {
            willExpiredTryCustomer.errMsg = result.errMsg;
        } else if (result.resData) {
            willExpiredTryCustomer.data.list = willExpiredTryCustomer.data.list.concat(result.resData.result.day);
            willExpiredTryCustomer.data.total = result.resData.result.day_tatol;
            if (_.isArray(willExpiredTryCustomer.data.list) && willExpiredTryCustomer.data.list.length && !this.selectedCustomerId){
                this.selectedCustomer = willExpiredTryCustomer.data.list[0];
                this.selectedCustomerId = willExpiredTryCustomer.data.list[0].customer_id;
            }
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
        if (_.isArray(repeatCustomerObj.data.result) && repeatCustomerObj.data.result.length && !this.selectedCustomerId){
            this.selectedCustomer = repeatCustomerObj.data.result[0];
            this.selectedCustomerId = repeatCustomerObj.data.result[0].id;
        }
    }
};
//获取某个客户下的用户列表
SalesHomeStore.prototype.getCrmUserList = function (result) {
    var userListsOfCustomer = this.userListsOfCustomer;
    userListsOfCustomer.loading = result.loading;
    if (result.error) {
        userListsOfCustomer.errMsg = result.errMsg;
    } else if (result.resData) {
        userListsOfCustomer.data = result.resData;
    }
};

// 设置要选中的客户的id
SalesHomeStore.prototype.setSelectedCustomer = function (selectedObj) {
    this.selectedCustomer = selectedObj;
    this.selectedCustomerId = selectedObj.customer_id || selectedObj.id;
};


//（取消）选择用户时，（取消）选择用户下的所有应用
SalesHomeStore.prototype.onChangeUserCheckBox = function (checkObj) {
    var crmUserList = this.userListsOfCustomer.data.data;
    if (_.isArray(crmUserList)) {
        let userObj = _.find(crmUserList, (obj) => obj.user.user_id === checkObj.userId);
        if (userObj) {
            //用户的（取消）选择处理
            userObj.user.checked = checkObj.checked;
            //用户下应用的（取消）选择处理
            if (_.isArray(userObj.apps) && userObj.apps.length) {
                _.each(userObj.apps, app => {
                    app.checked = checkObj.checked;
                });
            }
        }
    }
};

//（取消）选择应用时的处理
SalesHomeStore.prototype.onChangeAppCheckBox = function (checkObj) {
    var crmUserList = this.userListsOfCustomer.data.data;
    if (_.isArray(crmUserList)) {
        let userObj = _.find(crmUserList, (obj) => obj.user.user_id === checkObj.userId);
        if (userObj) {
            //应用的（取消）选择处理
            if (_.isArray(userObj.apps) && userObj.apps.length) {
                let app = _.find(userObj.apps, app => app.app_id === checkObj.appId);
                if (app) {
                    app.checked = checkObj.checked;
                }
            }
            //用户的（取消）选择处理
            if (checkObj.checked) {//选中时
                let notCheckedApp = _.find(userObj.apps, app => !app.checked);
                //该用户下没有未选中的应用时，将用户的checked设为选中
                if (!notCheckedApp) {
                    userObj.user.checked = checkObj.checked;
                }
            } else {//取消选中时
                delete userObj.user.checked;
            }
        }
    }
};
//申请类型的修改
SalesHomeStore.prototype.onChangeApplyType = function (curApplyType) {
    this.curApplyType = curApplyType;
};
SalesHomeStore.prototype.getAppList = function (result) {
    this.appList = _.isArray(result) ? result : [];
};


module.exports = alt.createStore(SalesHomeStore, 'SalesHomeStore');
