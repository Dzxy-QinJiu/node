var OplateCustomerAnalysisActions = require('../action/oplate-customer-analysis.action');
var DateSelectorUtils = require('antc/lib/components/datepicker/utils');
//客户分析
function OplateCustomerAnalysisStore() {
    //初始化state数据
    this.resetState();
    //绑定action
    this.bindActions(OplateCustomerAnalysisActions);
}

//设置store的初始值
OplateCustomerAnalysisStore.prototype.resetState = function() {
    //默认查看总客户
    this.currentTab = 'total';
    //选中的app
    this.selectedApp = '';
    //是否选中了综合
    this.isComposite = true;
    //时间对象（true:本周截止到今天为止）
    var timeObj = DateSelectorUtils.getThisWeekTime(true);
    //开始时间
    this.startTime = DateSelectorUtils.getMilliseconds(timeObj.start_time);
    //结束时间
    this.endTime = DateSelectorUtils.getMilliseconds(timeObj.end_time, true);
    //重置图表数据
    this.resetChartData('loading');
    //当前用户类型
    this.userType = ['sales'];
    //销售阶段列表
    this.salesStageList = [];
    //是否需要发请求
    this.sendRequest = true;
    //展示销售阶段漏斗图的max属性
    this.renderStageMax = 0;
    //客户详情面板相关变量
    this.showRightPanel = false;
    this.selectedCustomerId = '';
    this.selectedCustomerIndex = '';
    this.CustomerInfoOfCurrUser = {};
    //迁出客户数据
    this.transferCustomers = {
        loading: false,
        data: [],
        errorMsg: '',
        lastId: '',
        listenScrollBottom: true,
        showNoMoreDataTip: false,
        sorter: {
            field: 'time',
            order: 'descend'
        }
    };
    //客户阶段变更数据
    this.customerStage = {
        loading: false,
        data: [],
        errorMsg: ''
    },
    //点击客户阶段数字进入的客户列表所需的参数
    this.selectedCustomerStage = {
        type: '',//阶段标签 
        time: ''
    };
    //是否展示客户阶段点击数字打开的客户列表
    this.isShowCustomerStageTable = false;
    //客户阶段变更的客户列表数据
    this.stageChangedCustomerList = {
        data: [],
        errorMsg: '',
        loading: false,
        lastId: '',
        sorter: {
            field: 'time',
            order: 'descend'
        },
        listenScrollBottom: true
    };
    //各行业试用客户覆盖率
    this.industryCustomerOverlay = {
        paramObj: {
            industry: ''
        },
        data: [],
        errorMsg: '',
        loading: false
    };
    //获取销售新开客户数
    this.newCustomerCount = {
        data: [],
        errorMsg: '',
        loading: false
    };
    //当前选中的团队id
    this.currentTeamId = '';
    //当前选中的销售人员id
    this.currentMemberId = '';
};
//重置图表数据
OplateCustomerAnalysisStore.prototype.resetChartData = function(type) {
    //总数、新增客户数、过期客户数、新增过期客户数
    this.summaryNumbers = {
        resultType: type || '',
        errorMsg: '',
        data: type === 'loading' ? {} : {
            'added': 0,
            'tried': 0,//试用
            'projected': 0,//立项
            'negotiated': 0,//谈判
            'dealed': 0,
            'executed': 0,
            'total': 0
        }
    };
    //趋势统计
    this.trendAnalysis = {
        resultType: type || '',
        errorMsg: '',
        data: []
    };
    //团队统计
    this.teamAnalysis = {
        resultType: type || '',
        errorMsg: '',
        data: []
    };
    //活跃客户的统计
    this.activeCustomerAnalysis = {
        resultType: type || '',
        errorMsg: '',
        data: []
    };
    //团队成员统计
    this.team_memberAnalysis = {
        resultType: type || '',
        errorMsg: '',
        data: []
    };
    //地域统计
    this.zoneAnalysis = {
        resultType: type || '',
        errorMsg: '',
        data: []
    };
    //行业统计
    this.industryAnalysis = {
        resultType: type || '',
        errorMsg: '',
        data: []
    };
    //销售阶段统计
    this.stageAnalysis = {
        resultType: type || '',
        errorMsg: '',
        data: []
    };
    //客户阶段统计点击的参数
    this.selectedCustomerStage = {
        type: '',
        date: ''
    };
};

//获取统计总数
OplateCustomerAnalysisStore.prototype.getSummaryNumbers = function(result) {
    var summaryNumbers = this.summaryNumbers;
    if (result.loading) {
        summaryNumbers.resultType = 'loading';
        summaryNumbers.errorMsg = '';
    } else if (result.error) {
        summaryNumbers.resultType = 'error';
        summaryNumbers.errorMsg = result.errorMsg;
    } else {
        summaryNumbers.resultType = '';
        summaryNumbers.errorMsg = '';
        summaryNumbers.data = result.resData;
        if (!_.isObject(summaryNumbers.data)) {
            summaryNumbers.data = {
                'added': 0,
                'tried': 0,//试用
                'projected': 0,//立项
                'negotiated': 0,//谈判
                'dealed': 0,
                'executed': 0,
                'total': 0
            };
        }
    }
};

//获取具体统计数据
OplateCustomerAnalysisStore.prototype.getAnalysisData = function(result) {
    var analysis = this[result.reqData.customerProperty + 'Analysis'];
    if (result.reqData.customerProperty === 'active_customer') {
        analysis = this.activeCustomerAnalysis;
    }
    if (result.loading) {
        analysis.resultType = 'loading';
        analysis.errorMsg = '';
        analysis.data = [];
    } else if (result.error) {
        analysis.resultType = 'error';
        analysis.errorMsg = result.errorMsg || Intl.get('contract.111', '获取数据失败');
        analysis.data = [];
    } else {
        analysis.resultType = '';
        analysis.errorMsg = '';
        analysis.data = result.resData;
    }
};

//更换查询时间
OplateCustomerAnalysisStore.prototype.changeSearchTime = function({ startTime, endTime }) {
    this.startTime = startTime;
    this.endTime = endTime;
};

//更换选中应用
OplateCustomerAnalysisStore.prototype.changeSelectedApp = function(selectedApp) {
    this.isComposite = /all/.test(selectedApp);
    //为app重新赋值
    this.selectedApp = selectedApp;
};
//更换当前tab页
OplateCustomerAnalysisStore.prototype.changeCurrentTab = function(tabName) {
    this.currentTab = tabName;
};
//显示没有数据
OplateCustomerAnalysisStore.prototype.showNoData = function() {
    this.resetChartData();
};
//获取用户类型
OplateCustomerAnalysisStore.prototype.getUserType = function(userType) {
    this.userType = userType;
};
//获取销售阶段列表
OplateCustomerAnalysisStore.prototype.getSalesStageList = function(list) {
    if (_.isArray(list)) this.salesStageList = list;
};


/**
 * 函数外取不到state执行环境，所以传字符串
 * resultString[string]: 用于存放loading和errorMsg的对象名
 * fn: 请求成功触发的回调，会传入响应结果result，包含{ errorMsg, loading, data, paramObj }
*/
const resultHandler = function(resultString, fn) {
    return function(result) {
        if (!this[resultString]) {
            return;
        }
        const { loading, errorMsg } = result;
        if (loading) {
            this[resultString].loading = true;
            this[resultString].errorMsg = '';
        }
        else if (errorMsg) {
            this[resultString].loading = false;
            this[resultString].errorMsg = errorMsg;
            this[resultString].data = [];
        }
        else {
            this[resultString].loading = false;
            this[resultString].errorMsg = '';
            fn.call(this, result);
        }
    };
};

//查询迁出客户
OplateCustomerAnalysisStore.prototype.getTransferCustomers = resultHandler('transferCustomers', function({ loading, errorMsg, data, paramObj }) {
    let customers = [];
    if (data.result && data.result.length > 0) {
        customers = data.result.map(item => {
            return {
                ...item,
                time: item.time ? moment(item.time).format(oplateConsts.DATE_FORMAT) : ''
            };
        });
        this.transferCustomers.lastId = customers[customers.length - 1].id;
    }
    if (paramObj.isFirst) {
        this.transferCustomers.data = customers;
    } else {
        this.transferCustomers.data = this.transferCustomers.data.concat(customers);
    }

    //默认不显示“没有更多数据”的提示
    this.transferCustomers.showNoMoreDataTip = false;

    //总数等于前端数组长度时，不监听下拉加载
    if (data.total === this.transferCustomers.data.length) {
        this.transferCustomers.listenScrollBottom = false;
        //若非首次请求，说明是下拉加载之后获取到了全部数据，此时显示“没有更多数据”的提示
        if (!paramObj.isFirst) {
            this.transferCustomers.showNoMoreDataTip = true;
        }
    } else {
        this.transferCustomers.listenScrollBottom = true;
    }
});

//获取客户阶段变更数据
OplateCustomerAnalysisStore.prototype.getStageChangeCustomers = resultHandler('customerStage', function({ loading, errorMsg, data }) {
    data = data.result;

    if (data && data.length) {
        this.customerStage.data = data.map(x => {
            x.date = x.date ? moment(x.date).format(oplateConsts.DATE_FORMAT) : '';
            return x;
        });
    }
});

//获取客户阶段变更对应的客户列表数据
OplateCustomerAnalysisStore.prototype.getStageChangeCustomerList = resultHandler('stageChangedCustomerList', function({ loading, errorMsg, data, paramObj }) {
    if (paramObj.isFirst) {
        this.stageChangedCustomerList.data = data.list;
    } else {
        this.stageChangedCustomerList.data = this.stageChangedCustomerList.data.concat(data.list);
    }
    if (data.list && data.list.length > 0) {
        this.stageChangedCustomerList.lastId = data.list[data.list.length - 1].id;
    }
    //总数等于前端数组长度时，不监听下拉加载
    if (data.total === this.stageChangedCustomerList.data.length) {
        this.stageChangedCustomerList.listenScrollBottom = false;
    }
});

//显示隐藏客户阶段的客户列表面板
OplateCustomerAnalysisStore.prototype.toggleStageCustomerList = function() {
    this.isShowCustomerStageTable = !this.isShowCustomerStageTable;
};

//获取各行业试用客户覆盖率
OplateCustomerAnalysisStore.prototype.getIndustryCustomerOverlay = resultHandler('industryCustomerOverlay', function({ loading, errorMsg, data, paramObj }) {
    let tempData = [];
    let list = [];
    if (data.result) {
        _.each(data.result, (value, key) => {
            tempData.push({
                team_name: key, team_result: value
            });
        });
        tempData.forEach(teamItem => {
            teamItem.team_result.forEach(sale => {
                sale.team_name = teamItem.team_name;
                //list中已有当前数据的团队名，不展示对应单元格(rowSpan==0)
                if (list.find(item => item.team_name === teamItem.team_name)) {
                    sale.rowSpan = 0;
                } else {
                    //为第一条存在团队名的数据设置列合并(rowSpan)
                    sale.rowSpan = teamItem.team_result.length;
                }
                list.push(sale);
            });
        });
    }
    this.industryCustomerOverlay.data = list;
});

//销售新开客户数
/**
 * 接口返回数据
 * {
 *      list: [
 *          {
 *              team_name: "",
 *              team_result: [
 *                  {
 *                      user_name,
 *                      customer_login,
 *                      tatol_newly_users,
 *                      newly_customer                    
 *                  }
 *              ],
 *              team_total: {
 *                      customer_login,
 *                      tatol_newly_users,
 *                      newly_customer   
 *              }
 *          }
 *      ],
 *      total: {
 *           customer_login,
 *           tatol_newly_users,
 *           newly_customer      
 *      },
 *      code: 0,
 *      msg: "获取成功"
 * }
 * view层使用的数据结构
 * [
 *  {
 *      team_name: "",
 *      user_name: "",
 *      rowSpan: 0//控制是否合并行的属性
 *      customer_login,
 *      tatol_newly_users,
 *      newly_customer  
 *  }
 * ]
 */
OplateCustomerAnalysisStore.prototype.getNewCustomerCount = resultHandler('newCustomerCount', function({ loading, errorMsg, data, paramObj }) {
    let list = [];
    if (data.list && data.list.length > 0) {
        data.list.forEach(teamItem => {
            teamItem.team_result.forEach((sale, index) => {
                sale.team_name = teamItem.team_name;
                if (list.find(item => item.team_name === teamItem.team_name)) {
                    sale.rowSpan = 0;
                } else {
                    sale.rowSpan = teamItem.team_result.length;
                }
                list.push(sale);
                //在每个团队最后一个销售的数据后加上合计
                if (index === teamItem.team_result.length - 1) {
                    list.push($.extend({}, teamItem.team_total, {
                        user_name: Intl.get('sales.home.total.compute', '总计')
                    }));
                }
            });
        });
        //在数据最后添加总的合计
        if (data.total) {
            list.push($.extend({}, data.total, {
                team_name: Intl.get('sales.home.total.compute', '总计')
            }));
        }
    }
    this.newCustomerCount.data = list;
});

OplateCustomerAnalysisStore.prototype.teamChange = function(teamId) {
    this.currentTeamId = teamId;
    //持久化的团队id，在选择成员时不会被置空，用于请求参数中同时需要团队id和成员id的情况
    this.currentTeamIdPersisted = teamId;
};
OplateCustomerAnalysisStore.prototype.memberChange = function(memberId) {
    this.currentTeamId = '';
    this.currentMemberId = memberId;
};

//导出 客户分析-客户构成 的store
module.exports = alt.createStore(OplateCustomerAnalysisStore, 'OplateCustomerAnalysisStore');
