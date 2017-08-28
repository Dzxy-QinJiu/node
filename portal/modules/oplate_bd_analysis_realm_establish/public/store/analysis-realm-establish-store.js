/**
 * author:周连毅
 * 说明：统计分析-当前安全域-开通个数统计 的store文件，作为mvc中的m
 */
//引入action
var AnalysisRealmEstablishActions = require("../action/analysis-realm-establish-actions");

//定义用alt创建store的类
function AnalysisRealmEstablishStore() {
    //开始时间
    this.startTime = null;
    //结束时间
    this.endTime = null;
    //当前全国安全域开启时间统计
    this.realmEstablishTotalCount = 0;
    //当前全国安全域开启时间列表
    this.realmEstablishAnalysisList = [];
    //当前是否在加载中
    this.isLoading = true;
    //没有数据
    this.noData = false;
    //压根一个安全域也没有
    this.noRealmAtAll = false;
    //右侧排行榜的标题
    this.rankListTitle = Intl.get("oplate_bd_analysis_realm_establish.5", "当前安全域开通总数");
    //默认按照自然日显示
    this.unit = "day";
    //绑定action方法
    this.bindListeners({
        //设置开始时间
        setStartTime : AnalysisRealmEstablishActions.setStartTime,
        //设置结束时间
        setEndTime : AnalysisRealmEstablishActions.setEndTime,
        //设置loading状态
        setLoadingState : AnalysisRealmEstablishActions.setLoadingState,
        //设置是否有数据
        setNoData : AnalysisRealmEstablishActions.setNoData,
        //服务端获取全国安全域数据
        getRealmEstablishAnalysisDataByAjax : AnalysisRealmEstablishActions.getRealmEstablishAnalysisDataByAjax,
        //设置右侧排行榜标题
        setRankListTitle : AnalysisRealmEstablishActions.setRankListTitle
    });
    //绑定view方法
    this.exportPublicMethods({
        //获取总数
        getRealmEstablishTotalCount : this.getRealmEstablishTotalCount,
        //获取开通安全域列表
        getRealmEstablishAnalysisList : this.getRealmEstablishAnalysisList,
        //获取开始时间
        getStartTime : this.getStartTime,
        //获取结束时间
        getEndTime : this.getEndTime,
        //获取loading状态
        getLoadingState : this.getLoadingState,
        //获取是否有数据
        getNoData : this.getNoData,
        //获取是否一个安全域都没有
        getNoRealmAtAll : this.getNoRealmAtAll,
        //获取unit单位
        getUnit : this.getUnit
    });

}

//ToView-获取是否一个安全域也没有
AnalysisRealmEstablishStore.prototype.getNoRealmAtAll = function() {
    return this.getState().noRealmAtAll;
};
//ToView-获取单位单元
AnalysisRealmEstablishStore.prototype.getUnit = function() {
    return this.getState().unit;
};
//ToView-获取noData
AnalysisRealmEstablishStore.prototype.getNoData = function() {
    return this.getState().noData;
};
//ToView-获取加载状态
AnalysisRealmEstablishStore.prototype.getLoadingState = function() {
    return this.getState().isLoading;
};
//ToView-获取全国安全域开通总数
AnalysisRealmEstablishStore.prototype.getRealmEstablishTotalCount = function() {
    return this.getState().realmEstablishTotalCount;
};
//ToView-获取全国安全域开通列表
AnalysisRealmEstablishStore.prototype.getRealmEstablishAnalysisList = function() {
    return this.getState().realmEstablishAnalysisList;
};
//ToView-获取开始时间
AnalysisRealmEstablishStore.prototype.getStartTime = function() {
    return this.getState().startTime;
};
//ToView-获取结束时间
AnalysisRealmEstablishStore.prototype.getEndTime = function() {
    return this.getState().endTime;
};

//FromAction-设置是否有数据
AnalysisRealmEstablishStore.prototype.setNoData = function(noData) {
    this.noData = noData;
};

//FromAction-设置loading状态
AnalysisRealmEstablishStore.prototype.setLoadingState = function(loadingState) {
    this.isLoading = loadingState;
};

//FromAction-设置开始时间
AnalysisRealmEstablishStore.prototype.setStartTime = function(startTime) {
    this.startTime = startTime;
};

//FromAction-设置结束时间
AnalysisRealmEstablishStore.prototype.setEndTime = function(endTime) {
    this.endTime = endTime;
};

//FromAction-从服务器获取当前全国安全域开通总数之后，传递到store，进行数据处理
AnalysisRealmEstablishStore.prototype.getRealmEstablishAnalysisDataByAjax = function(ret) {
    //服务器返回数据
    var realmEstablishAnalysisListByServer = ret.realmEstablishAnalysisListByServer,
    //是否一个安全域都没有
    noRealmAtAll = ret.noRealmAtAll;
    //保存unit
    this.unit = ret.unit;
    //是否一个安全域也没有
    this.noRealmAtAll = noRealmAtAll;
    //设置不loading
    this.setLoadingState(false);
    //确保返回的是个数组
    if(!_.isArray(realmEstablishAnalysisListByServer)) {
        realmEstablishAnalysisListByServer = [];
    }
    //realmEstablishAnalysisList放到store上
    this.realmEstablishAnalysisList = realmEstablishAnalysisListByServer;
    if(!realmEstablishAnalysisListByServer.length) {
        this.noData = true;
    } else {
        this.noData = false;
    }
    //将总数进行计算
    var realmEstablishTotalCount = 0;
    _.each(this.realmEstablishAnalysisList , function(obj) {
        realmEstablishTotalCount += obj.value;
    });
    //将总数放到store上
    this.realmEstablishTotalCount = realmEstablishTotalCount;
};
//设置右侧标题
AnalysisRealmEstablishStore.prototype.setRankListTitle = function(title) {
    this.rankListTitle = title;
};
//使用alt导出store
module.exports = alt.createStore(AnalysisRealmEstablishStore , 'AnalysisRealmEstablishStore');