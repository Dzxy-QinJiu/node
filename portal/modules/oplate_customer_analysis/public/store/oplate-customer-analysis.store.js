var OplateCustomerAnalysisActions = require("../action/oplate-customer-analysis.action");
var DateSelectorUtils = require("../../../../components/datepicker/utils");
//客户分析
function OplateCustomerAnalysisStore() {
    //初始化state数据
    this.resetState();
    //绑定action
    this.bindActions(OplateCustomerAnalysisActions);
}

//设置store的初始值
OplateCustomerAnalysisStore.prototype.resetState = function () {
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
    this.resetChartData("loading");
    //当前用户类型
    this.userType = ["sales"];
    //销售阶段列表
    this.salesStageList = [];
    //是否需要发请求
    this.sendRequest = true;
    //展示销售阶段漏斗图的max属性
    this.renderStageMax = 0;
    //客户阶段变更数据
    this.customerStage = {
        loading: false,
        data: [],
        errorMsg: ""
    },
    //点击客户阶段数字进入的客户列表所需的参数
    this.customerStageParams = {}
};
//重置图表数据
OplateCustomerAnalysisStore.prototype.resetChartData = function (type) {
    //总数、新增客户数、过期客户数、新增过期客户数
    this.summaryNumbers = {
        resultType: type || "",
        errorMsg: "",
        data: type === 'loading' ? {} : {
            "added": 0,
            "tried": 0,//试用
            "projected": 0,//立项
            "negotiated": 0,//谈判
            "dealed": 0,
            "executed": 0,
            "total": 0
        }
    };
    //趋势统计
    this.trendAnalysis = {
        resultType: type || "",
        errorMsg: "",
        data: []
    };
    //团队统计
    this.teamAnalysis = {
        resultType: type || "",
        errorMsg: "",
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
        resultType: type || "",
        errorMsg: "",
        data: []
    };
    //地域统计
    this.zoneAnalysis = {
        resultType: type || "",
        errorMsg: "",
        data: []
    };
    //行业统计
    this.industryAnalysis = {
        resultType: type || "",
        errorMsg: "",
        data: []
    };
    //销售阶段统计
    this.stageAnalysis = {
        resultType: type || "",
        errorMsg: "",
        data: []
    };
    //客户阶段统计点击的参数
    this.selectedCustomerStage = {
        type: "",
        date: ""
    };
};

//获取统计总数
OplateCustomerAnalysisStore.prototype.getSummaryNumbers = function (result) {
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
                "added": 0,
                "tried": 0,//试用
                "projected": 0,//立项
                "negotiated": 0,//谈判
                "dealed": 0,
                "executed": 0,
                "total": 0
            };
        }
    }
};

//获取具体统计数据
OplateCustomerAnalysisStore.prototype.getAnalysisData = function (result) {
    var analysis = this[result.reqData.customerProperty + "Analysis"];
    if (result.reqData.customerProperty == "active_customer") {
        analysis = this.activeCustomerAnalysis;
    }
    if (result.loading) {
        analysis.resultType = 'loading';
        analysis.errorMsg = '';
        analysis.data = [];
    } else if (result.error) {
        analysis.resultType = 'error';
        analysis.errorMsg = result.errorMsg || Intl.get("contract.111", "获取数据失败");
        analysis.data = [];
    } else {
        analysis.resultType = '';
        analysis.errorMsg = '';
        analysis.data = result.resData;
    }
};

//更换查询时间
OplateCustomerAnalysisStore.prototype.changeSearchTime = function ({ startTime, endTime }) {
    this.startTime = startTime;
    this.endTime = endTime;
};

//更换选中应用
OplateCustomerAnalysisStore.prototype.changeSelectedApp = function (selectedApp) {
    this.isComposite = /all/.test(selectedApp);
    //为app重新赋值
    this.selectedApp = selectedApp;
};
//更换当前tab页
OplateCustomerAnalysisStore.prototype.changeCurrentTab = function (tabName) {
    this.currentTab = tabName;
};
//显示没有数据
OplateCustomerAnalysisStore.prototype.showNoData = function () {
    this.resetChartData();
};
//获取用户类型
OplateCustomerAnalysisStore.prototype.getUserType = function (userType) {
    this.userType = userType;
};
//获取销售阶段列表
OplateCustomerAnalysisStore.prototype.getSalesStageList = function (list) {
    if (_.isArray(list)) this.salesStageList = list;
};

//获取客户阶段变更数据
OplateCustomerAnalysisStore.prototype.getCustomerStageData = function ({ loading, errorMsg, data }) {
    if (loading) {
        this.customerStage.loading = true;
        this.customerStage.errorMsg = '';
        this.customerStage.data = [];
    } else if (errorMsg) {
        this.customerStage.loading = false;
        this.customerStage.errorMsg = errorMsg;
        this.customerStage.data = [];
        
    } else {
        this.customerStage.loading = false;
        this.customerStage.errorMsg = '';
        // this.customerStage.data = data;
        var temp = [
            {
                qualified: "4",
                trial: "3",
                signed: "2",
                intention: "1",
                info: "5",
                date: 1522219137036,
                sales: "test1",
                team: "test_zone"
            },{
                qualified: "2",
                trial: "4",
                signed: "2",
                intention: "1",
                info: "5",
                date: 1522219137036,
                sales: "test2",
                team: "test_zone"
            },{
                qualified: "5",
                trial: "1",
                signed: "9",
                intention: "1",
                info: "5",
                date: 1522219137036,
                sales: "test3",
                team: "test_zone"
            }
        ];
        this.customerStage.data = temp.map(x => {
            let obj = x;
            obj.date = moment(x.date).format(oplateConsts.DATE_YEAR_MONTH_FORMAT);
            return obj;
        })
    }
}

//导出 客户分析-客户构成 的store
module.exports = alt.createStore(OplateCustomerAnalysisStore, 'OplateCustomerAnalysisStore');
