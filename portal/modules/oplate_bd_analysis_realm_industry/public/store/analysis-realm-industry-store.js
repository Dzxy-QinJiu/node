/**
 * author:周连毅
 * 说明：统计分析-安全域分析-当前安全域行业分析 的store定义，作为mvc中的m
 */
//引入alt的action
var AnalysisRealmIndustryActions = require("../action/analysis-realm-industry-actions");

/*使用alt导出的store的类*/
function AnalysisRealmIndustryStore() {
    //开始时间
    this.startTime = null;
    //结束时间
    this.endTime = null;
    //当前安全域行业开通总数
    this.realmIndustryTotalCount = 0;
    //当前安全域行业开通列表
    this.realmIndustryAnalysisList = [];
    //当前是否在加载中
    this.isLoading = true;
    //没有数据
    this.noData = false;
    //压根一个安全域也没有
    this.noIndustryAtAll = false;
    //右侧排行榜的标题
    this.rankListTitle = Intl.get("oplate_bd_analysis_realm_establish.5", "当前安全域开通总数");
    //绑定action方法
    this.bindListeners({
        //设置开始时间
        setStartTime: AnalysisRealmIndustryActions.setStartTime,
        //设置结束时间
        setEndTime: AnalysisRealmIndustryActions.setEndTime,
        //设置loading状态
        setLoadingState: AnalysisRealmIndustryActions.setLoadingState,
        //设置是否有数据
        setNoData: AnalysisRealmIndustryActions.setNoData,
        //服务端获取安全域行业数据
        getRealmIndustryAnalysisDataByAjax: AnalysisRealmIndustryActions.getRealmIndustryAnalysisDataByAjax,
        //设置右侧排行榜标题
        setRankListTitle: AnalysisRealmIndustryActions.setRankListTitle
    });
    //绑定view方法
    this.exportPublicMethods({
        //获取安全域总数
        getRealmIndustryTotalCount: this.getRealmIndustryTotalCount,
        //按照行业分组，获取安全域列表数据
        getRealmIndustryAnalysisList: this.getRealmIndustryAnalysisList,
        //获取开始时间
        getStartTime: this.getStartTime,
        //获取结束时间
        getEndTime: this.getEndTime,
        //获取loading状态
        getLoadingState: this.getLoadingState,
        //获取当前查询条件是否没有数据
        getNoData: this.getNoData,
        //获取是否一个安全域都没有
        getNoIndustryAtAll: this.getNoIndustryAtAll
    });

}

//ToView-获取是否一个安全域也没有
AnalysisRealmIndustryStore.prototype.getNoIndustryAtAll = function() {
    return this.getState().noIndustryAtAll;
};
//ToView-获取noData
AnalysisRealmIndustryStore.prototype.getNoData = function() {
    return this.getState().noData;
};
//ToView-获取加载状态
AnalysisRealmIndustryStore.prototype.getLoadingState = function() {
    return this.getState().isLoading;
};
//ToView-获取安全域行业开通总数
AnalysisRealmIndustryStore.prototype.getRealmIndustryTotalCount = function() {
    return this.getState().realmIndustryTotalCount;
};
//ToView-获取安全域行业开通列表
AnalysisRealmIndustryStore.prototype.getRealmIndustryAnalysisList = function() {
    return this.getState().realmIndustryAnalysisList;
};
//ToView-获取开始时间
AnalysisRealmIndustryStore.prototype.getStartTime = function() {
    return this.getState().startTime;
};
//ToView-获取结束时间
AnalysisRealmIndustryStore.prototype.getEndTime = function() {
    return this.getState().endTime;
};
//FromAction-设置是否有数据
AnalysisRealmIndustryStore.prototype.setNoData = function(noData) {
    this.noData = noData;
};
//FromAction-设置loading状态
AnalysisRealmIndustryStore.prototype.setLoadingState = function(loadingState) {
    this.isLoading = loadingState;
};
//FromAction-设置开始时间
AnalysisRealmIndustryStore.prototype.setStartTime = function(startTime) {
    this.startTime = startTime;
};

//FromAction-设置结束时间
AnalysisRealmIndustryStore.prototype.setEndTime = function(endTime) {
    this.endTime = endTime;
};

//FromAction-从服务器获取当前安全域行业开通总数之后，传递到store，进行数据处理
AnalysisRealmIndustryStore.prototype.getRealmIndustryAnalysisDataByAjax = function(ret) {
    var RealmIndustryAnalysisListByServer = ret.realmIndustryAnalysisListByServer,
        //是否一个安全域都没有
        noIndustryAtAll = ret.noIndustryAtAll;
    //是否一个安全域也没有
    this.noIndustryAtAll = noIndustryAtAll;

    this.setLoadingState(false);
    //确保返回的是个数组
    if(!_.isArray(RealmIndustryAnalysisListByServer)) {
        RealmIndustryAnalysisListByServer = [];
    }
    //过滤服务器数据，只要name和value属性，name非空
    var realmIndustryAnalysisList = [];
    _.each(RealmIndustryAnalysisListByServer , function(obj) {
        if(obj && obj.name) {
            var value = obj.value || 0;
            value = parseInt(value);
            if(isNaN(value)) {
                value = 0;
            }
            realmIndustryAnalysisList.push({
                name: obj.name,
                value: value
            });
        }
    });
    //对行业排行数据进行排序，降序排列
    realmIndustryAnalysisList.sort(function(industry1,industry2) {
        return industry2.value - industry1.value;
    });
    //realmIndustryAnalysisList放到store上
    this.realmIndustryAnalysisList = realmIndustryAnalysisList;
    if(!realmIndustryAnalysisList.length) {
        this.noData = true;
    } else {
        this.noData = false;
    }
    //将总数进行计算
    var realmIndustryTotalCount = 0;
    _.each(this.realmIndustryAnalysisList , function(obj) {
        realmIndustryTotalCount += obj.value;
    });
    //将总数放到store上
    this.realmIndustryTotalCount = realmIndustryTotalCount;
};
//设置右侧标题
AnalysisRealmIndustryStore.prototype.setRankListTitle = function(title) {
    this.rankListTitle = title;
};
//使用alt导出单例的store
module.exports = alt.createStore(AnalysisRealmIndustryStore , 'AnalysisRealmIndustryStore');