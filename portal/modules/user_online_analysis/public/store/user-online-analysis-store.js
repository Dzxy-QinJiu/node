//用户在线统计的action
var UserOnlineAnalysisAction = require("../action/user-online-analysis-action");

//app用户的store
function UserOnlineAnalysisStore() {
    this.resetState();
    this.bindActions(UserOnlineAnalysisAction);
}

//FromAction-获取用户在线分析各个应用的数据
UserOnlineAnalysisStore.prototype.getUserOnlineAnalysisList = function(obj) {
    if(obj.loading) {
        this.analysisSummary.resultType = 'loading';
        this.analysisSummary.errorMsg = '';
    } else if(obj.error) {
        this.analysisSummary.firstLoading = false;
        this.analysisSummary.resultType = 'error';
        this.analysisSummary.list = [];
        this.analysisSummary.total = 0;
        this.analysisSummary.errorMsg = obj.errorMsg;
    } else {
        this.analysisSummary.firstLoading = false;
        this.analysisSummary.resultType = '';
        this.analysisSummary.list = obj.data.list || [];
        this.analysisSummary.total = obj.data.total;
        this.analysisSummary.errorMsg = '';
        if(!_.isArray(this.analysisSummary.list)) {
            this.analysisSummary.list = [];
            this.analysisSummary.total = 0;
        }
    }
};

//内部使用-重置store数据
UserOnlineAnalysisStore.prototype.resetState = function() {
    //用户在线分析各个应用的数据
    this.analysisSummary = {
        //是否是第一次加载
        firstLoading : true,
        //数据总数
        total : 0,
        //当前第几页
        currentPage : 1,
        //数据列表
        list : [],
        //错误信息
        errorMsg : '',
        //loading,error,状态
        resultType : 'loading'
    };
    //选中的app，选中后，在右侧面板中展示
    this.selectedApp = {
        app_id : '',
        app_name : ''
    };
    //是否显示右侧面板
    this.isShowRightPanel = false;
    //浏览器统计信息
    this.browserAnalysis = {
        resultType: "loading",
        errorMsg: "",
        list : [],
        total : 0
    };
    //地域统计信息
    this.zoneAnalysis = {
        resultType: "loading",
        errorMsg: "",
        list : [],
        total : 0
    };
};

//用户在线统计的列表翻页
UserOnlineAnalysisStore.prototype.analysisSummaryPaginationChange = function(page) {
    this.analysisSummary.currentPage = page;
};

//查看某一个应用的详情
UserOnlineAnalysisStore.prototype.viewUserOnlineAnalysisByAppId = function(queryObj) {
    var app_id = queryObj.app_id;
    var app_name = queryObj.app_name;
    this.selectedApp = {
        app_id : app_id,
        app_name : app_name
    };
    this.isShowRightPanel = true;
};

//隐藏右侧面板
UserOnlineAnalysisStore.prototype.hideRightPanel = function() {
    this.isShowRightPanel = false;
};

//获取某个应用的浏览器统计
UserOnlineAnalysisStore.prototype.getOnlineBrowserByApp = function(result) {
    var browserAnalysis = this.browserAnalysis;
    if(result.loading) {
        browserAnalysis.resultType = 'loading';
        browserAnalysis.errorMsg = '';
        browserAnalysis.total = 0;
        browserAnalysis.list = [];
    } else if(result.error) {
        browserAnalysis.resultType = 'error';
        browserAnalysis.errorMsg = result.errorMsg;
        browserAnalysis.total = 0;
        browserAnalysis.list = [];
    } else {
        browserAnalysis.resultType = '';
        browserAnalysis.errorMsg = '';
        browserAnalysis.total = _.isNumber(result.data && result.data.total) && result.data.total >= 0 ? result.data.total : 0;
        browserAnalysis.list = _.isArray(result.data && result.data.list) ? result.data.list : [];
        if(!browserAnalysis.list.length) {
            browserAnalysis.total = 0;
        }
    }
};


//获取某个应用的地域统计
UserOnlineAnalysisStore.prototype.getOnlineZoneByApp = function(result) {
    var zoneAnalysis = this.zoneAnalysis;
    if(result.loading) {
        zoneAnalysis.resultType = 'loading';
        zoneAnalysis.errorMsg = '';
        zoneAnalysis.list = [];
        zoneAnalysis.total = 0;
    } else if(result.error) {
        zoneAnalysis.resultType = 'error';
        zoneAnalysis.errorMsg = result.errorMsg;
        zoneAnalysis.list = [];
        zoneAnalysis.total = 0;
    } else {
        zoneAnalysis.resultType = '';
        zoneAnalysis.errorMsg = '';
        zoneAnalysis.list = _.isArray(result.data && result.data.list) ? result.data.list : [];
        zoneAnalysis.total = _.isNumber(result.data && result.data.total) && result.data.total > 0 ? result.data.total : 0;
    }
};



//使用alt导出store
module.exports = alt.createStore(UserOnlineAnalysisStore , 'UserOnlineAnalysisStore');