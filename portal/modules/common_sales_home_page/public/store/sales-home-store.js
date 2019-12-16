var SalesHomeActions = require('../action/sales-home-actions');
import TimeStampUtil from 'PUB_DIR/sources/utils/time-stamp-util';
const STATUS = {UNHANDLED: 'unhandled', HANDLED: 'handled'};
import {ALL_LISTS_TYPE} from 'PUB_DIR/sources/utils/consts';

function SalesHomeStore() {
    this.setInitState();
    this.bindActions(SalesHomeActions);
}
//数据判断
function getData(data) {
    if (isNaN(data)) {
        return '-';
    } else {
        return data;
    }
}
//设置初始化数据
SalesHomeStore.prototype.setInitState = function() {
    //电话统计数据
    this.phoneTotalObj = {
        loading: true,
        errMsg: '',
        data: {}
    };
    //到期合同提醒数据
    this.contractExpireRemind = {
        loading: true,
        errMsg: '',
        total: 0,
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
        curPage: 1,
        data: {
            list: [],
            total: ''
        }
    };
    //到今日过期的日程
    this.scheduleExpiredTodayObj = {
        loading: true,
        errMsg: '',
        curPage: 1,
        data: {
            list: [],
            total: ''
        }
    };
    //拨入未接通的
    this.missCallObj = {
        loading: true,
        errMsg: '',
        curPage: 1,
        data: {
            list: [],
            total: ''
        }
    };
    //关注客户登录
    this.concernCustomerObj = {
        loading: true,
        errMsg: '',
        curPage: 1,
        data: {
            list: [],
            total: ''
        }
    };
    //停用客户登录
    this.appIllegalObj = {
        loading: true,
        errMsg: '',
        curPage: 1,
        data: {
            list: [],
            total: ''
        }
    };
    //客户登录失败的通知
    this.loginFailedObj = {
        loading: true,
        errMsg: '',
        curPage: 1,
        data: {
            list: [],
            total: ''
        }
    };
    //最近登录的客户
    this.recentLoginCustomerObj = {
        loading: true,
        errMsg: '',
        curPage: 1,
        data: {
            list: [],
            total: ''
        }
    };
    //重复客户列表
    this.repeatCustomerObj = {
        loading: true,
        errMsg: '',
        curPage: 1,
        data: {
            list: [],
            total: ''
        }
    };
    //即将到期的签约用户
    this.willExpiredAssignCustomer = {
        loading: true,
        errMsg: '',
        curPage: 1,
        data: {
            list: [],
            total: ''
        }
    };
    //已到期的试用客户
    this.hasExpiredTryCustomer = {
        loading: true,
        errMsg: '',
        curPage: 1,
        data: {
            list: [],
            total: ''
        }
    };
    //即将到期的试用用户
    this.willExpiredTryCustomer = {
        loading: true,
        errMsg: '',
        curPage: 1,
        data: {
            list: [],
            total: ''
        }
    };
    //新分配的客户
    this.newDistributeCustomer = {
        loading: true,
        errMsg: '',
        curPage: 1,
        data: {
            list: [],
            total: ''
        }
    };
    //销售线索
    this.salesClueObj = {
        loading: false,
        errMsg: '',
        curPage: 1,
        data: {
            list: [],
            total: ''
        }
    };
    //最近登录的客户
    this.sorterLogin = {
        field: 'last_login_time',//排序字段
        order: 'descend'
    };
    //最近分配的客户
    this.sorterDistribute = {
        field: 'allot_time',
        order: 'descend'
    };
    this.page_size = 20;
    this.sorter = {
        field: 'last_contact_time',//排序字段
        order: 'descend'
    };
    this.sorterSalesClue = {
        field: 'start_time',
        order: 'descend'
    };
    //availability 查询有效线索  有效 '0' 无效线索 '1'
    //status 线索的类型 待分配 '0 ' 已分配 '1' 已跟进 '2'
    this.salesClueTypeFilter = {status: '1,2',availability: '0'};
    this.status = STATUS.UNHANDLED;//未处理，handled:已处理
    this.selectedCustomerPanel = ALL_LISTS_TYPE.SCHEDULE_TODAY;//选中客户所在的模块
    this.listenScrollBottom = true;//是否监听滚动
    this.emailShowObj = {
        isShowActiveEmail: false, //是否展示邮箱激活提示
        isShowAddEmail: false, //是否展示添加邮箱的提示, 不能仅用是否有email字段进行判断，原因是如果数据获取慢的时候，也会在页面上展示出添加邮箱的提示
        isShowSetClient: false//是否展示设置电话系统的提示

    };
    this.setWebConfigStatus = '';//设置个人配置的状态
};
//设置个人信息配置
SalesHomeStore.prototype.setWebsiteConfig = function(userInfo) {
    if (userInfo.emailLoading) {
        this.setWebConfigStatus = 'loading';
    }
};
SalesHomeStore.prototype.removeClueItem = function(removeItem) {
    var clueData = _.get(this,'salesClueObj.data.list');
    this.salesClueObj.data.list = _.filter(clueData, item => item.id !== removeItem.id);
    this.salesClueObj.data.total = _.get(this, 'salesClueObj.data.list.length');
};
//获取今日通话数量和时长
SalesHomeStore.prototype.getPhoneTotal = function(result) {
    this.phoneTotalObj.loading = result.loading;
    if (result.error) {
        this.phoneTotalObj.errMsg = result.errMsg;
    } else if (result.resData) {
        let salesPhoneList = result.resData && _.isArray(result.resData.salesPhoneList) ? result.resData.salesPhoneList : [];
        salesPhoneList = salesPhoneList.map((salesPhone) => {
            return {
                totalTime: getData(salesPhone.totalTime),//总时长
                calloutSuccess: getData(salesPhone.calloutSuccess),//成功呼出
            };
        });
        let totalTime = 0, totalCount = 0;
        salesPhoneList.forEach((phone) => {
            totalCount += phone.calloutSuccess || 0;
            totalTime += phone.totalTime || 0;
        });
        this.phoneTotalObj.data = {
            'totalTime': totalTime,
            'totalCount': totalCount
        };
    }
};
//是否展示邮箱激活的提示
SalesHomeStore.prototype.getShowActiveEmailOrClientConfig = function(result) {
    if (_.isObject(result)){
        this.emailShowObj = result;
    }
};
//获取客户统计总数
SalesHomeStore.prototype.getCustomerTotal = function(result) {
    var customerTotalObj = this.customerTotalObj;
    customerTotalObj.loading = result.loading;
    if (result.error) {
        customerTotalObj.errMsg = result.errMsg;
    } else if (result.resData) {
        customerTotalObj.data = result.resData;
        if (!_.isObject(customerTotalObj.data)) {
            customerTotalObj.data = {
                'added': 0,
                'dealed': 0,
                'executed': 0,
                'total': 0
            };
        }
    }
};
//获取今日联系的客户列表
SalesHomeStore.prototype.getTodayContactCustomer = function(result) {
    var customerContactTodayObj = this.customerContactTodayObj;
    customerContactTodayObj.loading = result.loading;

    if (result.error) {
        customerContactTodayObj.errMsg = result.errMsg;
    } else if (result.resData) {
        customerContactTodayObj.data = result.resData;
    }
};
//获取最近登录的客户列表
SalesHomeStore.prototype.getRecentLoginCustomers = function(result) {
    var recentLoginCustomerObj = this.recentLoginCustomerObj;
    recentLoginCustomerObj.loading = result.loading;
    if (result.error) {
        recentLoginCustomerObj.errMsg = result.errMsg;
    } else if (result.resData) {
        //把客户的id加到联系人中，这样在拨打电话时，可以用客户的id查询客户的详情
        if (_.isArray(result.resData.result) && result.resData.result.length) {
            _.each(result.resData.result, (customerItem) => {
                if (_.get(customerItem, 'contacts[0]')) {
                    _.map(customerItem.contacts, (contactItem) => {
                        contactItem.customer_id = customerItem.id;
                    });
                }
            });
            recentLoginCustomerObj.curPage++;
        }
        recentLoginCustomerObj.data.list = recentLoginCustomerObj.data.list.concat(result.resData.result);
        recentLoginCustomerObj.data.total = result.resData.total;
    }
};
//获取新分配的客户列表
SalesHomeStore.prototype.getNewDistributeCustomer = function(result) {
    var newDistributeCustomer = this.newDistributeCustomer;
    newDistributeCustomer.loading = result.loading;
    if (result.error) {
        newDistributeCustomer.errMsg = result.errMsg;
    } else if (result.resData) {
        newDistributeCustomer.data.list = newDistributeCustomer.data.list.concat(result.resData.result);
        newDistributeCustomer.curPage++;
        newDistributeCustomer.data.total = result.resData.total;
    }
};
//获取日程列表
SalesHomeStore.prototype.getScheduleList = function(result) {
    if (result.type === 'expired') {
        //获取的过期日程列表
        var scheduleExpiredTodayObj = this.scheduleExpiredTodayObj;
        scheduleExpiredTodayObj.loading = result.loading;
        if (result.error) {
            scheduleExpiredTodayObj.errMsg = result.errMsg;
        } else if (result.resData) {
            scheduleExpiredTodayObj.data.list = scheduleExpiredTodayObj.data.list.concat(processScheduleLists(result.resData.list, false));
            scheduleExpiredTodayObj.data.total = result.resData.total;
            scheduleExpiredTodayObj.curPage++;
        }
    } else if (result.type === 'missed_call') {
        //获取拨入未接通的电话
        var missCallObj = this.missCallObj;
        missCallObj.loading = result.loading;
        if (result.error) {
            missCallObj.errMsg = result.errMsg;
        } else if (result.resData) {
            missCallObj.data.list = missCallObj.data.list.concat(result.resData.list);
            missCallObj.data.total = result.resData.total;
            missCallObj.curPage++;
        }
    } else if (result.type === 'today') {
        //获取今天的日程列表
        var scheduleTodayObj = this.scheduleTodayObj;
        scheduleTodayObj.loading = result.loading;
        if (result.error) {
            scheduleTodayObj.errMsg = result.errMsg;
        } else if (result.resData) {
            scheduleTodayObj.data.list = processScheduleLists(result.resData.list, true);
            scheduleTodayObj.data.total = result.resData.total;
        }
    }
};
// 对日程进行整理
function processScheduleLists(list, isSort) {
    if (!_.isArray(list)) {
        list = [];
    }
    _.each(list, (item) => {
        if (item.end_time - item.start_time === oplateConsts.ONE_DAY_TIME_RANGE - 1000) {
            item.allDay = true;
        }
    });
    if (isSort) {
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
SalesHomeStore.prototype.getSystemNotices = function(result) {
    if (result.type === ALL_LISTS_TYPE.CONCERNED_CUSTOMER_LOGIN) {
        //关注的客户登录
        var concernCustomerObj = this.concernCustomerObj;
        concernCustomerObj.loading = result.loading;
        if (result.error) {
            concernCustomerObj.errMsg = result.errMsg;
        } else if (result.resData) {
            concernCustomerObj.data.list = concernCustomerObj.data.list.concat(result.resData.list);
            concernCustomerObj.data.total = result.resData.total;
            concernCustomerObj.curPage++;
        }
    } else if (result.type === ALL_LISTS_TYPE.APP_ILLEAGE_LOGIN) {
        //停用客户登录
        var appIllegalObj = this.appIllegalObj;
        appIllegalObj.loading = result.loading;
        if (result.error) {
            appIllegalObj.errMsg = result.errMsg;
        } else if (result.resData) {
            appIllegalObj.data.list = appIllegalObj.data.list.concat(result.resData.list);
            appIllegalObj.data.total = result.resData.total;
            appIllegalObj.curPage++;
        }
    } else if (result.type === ALL_LISTS_TYPE.LOGIN_FAILED) {
        //客户登录失败的通知
        var loginFailedObj = this.loginFailedObj;
        loginFailedObj.loading = result.loading;
        if (result.error) {
            loginFailedObj.errMsg = result.errMsg;
        } else if (result.resData) {
            loginFailedObj.data.list = loginFailedObj.data.list.concat(result.resData.list);
            loginFailedObj.data.total = result.resData.total;
            loginFailedObj.curPage++;
        }
    }
};
function getExpireCustomerData(stateData, resultData) {
    stateData.loading = resultData.loading;
    if (resultData.error) {
        stateData.errMsg = resultData.errMsg;
    } else if (resultData.resData && _.isArray(resultData.resData.result)) {
        if (resultData.resData.result.length) {
            var willExpiredAssignCustomerLists = resultData.resData.result[0];
            stateData.data.list = willExpiredAssignCustomerLists.day_list;
            stateData.data.total = willExpiredAssignCustomerLists.customer_tags_total;
        } else {
            stateData.data.list = [];
            stateData.data.total = 0;
        }
    }
}
//获取即将到期的客户
SalesHomeStore.prototype.getExpireCustomer = function(result) {
    if (result.type === ALL_LISTS_TYPE.WILL_EXPIRED_ASSIGN_CUSTOMER) {
        //获取即将到期的签约客户
        getExpireCustomerData(this.willExpiredAssignCustomer, result);
    } else if (result.type === ALL_LISTS_TYPE.WILL_EXPIRED_TRY_CUSTOMER) {
        //获取即将到期的试用客户
        getExpireCustomerData(this.willExpiredTryCustomer, result);
    } else if (result.type === ALL_LISTS_TYPE.HAS_EXPIRED_TRY_CUSTOMER) {
        //获取过期十天已经过期的试用客户
        getExpireCustomerData(this.hasExpiredTryCustomer, result);
        //将数据进行颠倒，昨天的数据要排在最上面
        this.hasExpiredTryCustomer.data.list.reverse();
    }
};

//获取重复客户列表
SalesHomeStore.prototype.getRepeatCustomerList = function(result) {
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
SalesHomeStore.prototype.afterHandleStatus = function(newStatusObj) {
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
        this.scheduleExpiredTodayObj.data.total--;
    }
};
SalesHomeStore.prototype.afterHandleMessage = function(messageObj) {
    //关注客户登录
    var data = [];
    if (messageObj.noticeType === ALL_LISTS_TYPE.CONCERNED_CUSTOMER_LOGIN) {
        data = this.concernCustomerObj.data.list;
        this.concernCustomerObj.data.list = _.filter(data, item => item.id !== messageObj.noticeId);
        this.concernCustomerObj.data.total = this.concernCustomerObj.data.total - 1;

    } else if (messageObj.noticeType === ALL_LISTS_TYPE.APP_ILLEAGE_LOGIN) {
        data = this.appIllegalObj.data.list;
        this.appIllegalObj.data.list = _.filter(data, item => item.id !== messageObj.noticeId);
        this.appIllegalObj.data.total = this.appIllegalObj.data.total - 1;
    } else if (messageObj.noticeType === ALL_LISTS_TYPE.LOGIN_FAILED) {
        data = this.loginFailedObj.data.list;
        this.loginFailedObj.data.list = _.filter(data, item => item.id !== messageObj.noticeId);
        this.loginFailedObj.data.total = this.appIllegalObj.data.total - 1;
    }
};
SalesHomeStore.prototype.getClueCustomerList = function(clueCustomers) {
    var salesClue = this.salesClueObj;
    if (clueCustomers.loading) {
        salesClue.loading = true;
        salesClue.errMsg = '';
    } else if (clueCustomers.error) {
        salesClue.loading = false;
        salesClue.errMsg = clueCustomers.errorMsg;
    } else {
        salesClue.loading = false;
        salesClue.errMsg = '';
        let data = clueCustomers.clueCustomerObj.result;
        salesClue.data.list = _.isArray(data) ? salesClue.data.list.concat(data) : [];
        salesClue.data.total = clueCustomers.clueCustomerObj.total;
    }
};
//处理线索无效后在列表中删除该线索
SalesHomeStore.prototype.afterRemarkClue = function(updateItem) {
    this.salesClueObj.data.list = _.filter(this.salesClueObj.data.list, (item) => {
        return item.id !== updateItem.id;
    });
    this.salesClueObj.data.total--;
};

SalesHomeStore.prototype.getContractExpireRemind = function(result) {
    if (result.loading) {
        this.contractExpireRemind.loading = true;
        this.contractExpireRemind.errMsg = '';
    } else if (result.error) {
        this.contractExpireRemind.loading = false;
        this.contractExpireRemind.errMsg = result.errorMsg;
    } else {
        this.contractExpireRemind.loading = false;
        this.contractExpireRemind.errMsg = '';
        this.contractExpireRemind.data = result.resData;
        this.contractExpireRemind.total = result.resData.total;
    }
};
SalesHomeStore.prototype.updatePageNewDistributeCustomer = function(customer_id){
    const newDistributeCustomer = this.newDistributeCustomer;
    newDistributeCustomer.data.total--;
    newDistributeCustomer.data.list = _.filter(newDistributeCustomer.data.list, item => item.id !== customer_id);
    this.customerContactTodayObj.data.total++;
};

module.exports = alt.createStore(SalesHomeStore, 'SalesHomeStore');
