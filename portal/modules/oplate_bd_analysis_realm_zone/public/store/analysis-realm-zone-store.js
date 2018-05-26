/**
 * author:周连毅
 * 说明：统计分析-安全域分析-地域分析-Store MVC中的M
 */
//引入Action
var AnalysisRealmZoneActions = require("../action/analysis-realm-zone-actions");

//Store的class
function AnalysisRealmZoneStore() {
    //开始时间
    this.startTime = null;
    //结束时间
    this.endTime = null;
    //当前全国安全域开通总数
    this.realmZoneTotalCount = 0;
    //当前全国安全域开通列表
    this.realmZoneAnalysisList = [];
    //当前是否在加载中
    this.isLoading = true;
    //没有数据
    this.noData = false;
    //压根一个安全域也没有
    this.noRealmAtAll = false;
    //右侧排行榜的标题
    this.rankListTitle = Intl.get("oplate_bd_analysis_realm_establish.5", "当前安全域开通总数");
    //绑定action方法
    this.bindListeners({
        //设置开始时间
        setStartTime : AnalysisRealmZoneActions.setStartTime,
        //设置结束时间
        setEndTime : AnalysisRealmZoneActions.setEndTime,
        //设置loading状态
        setLoadingState : AnalysisRealmZoneActions.setLoadingState,
        //设置是否有数据
        setNoData : AnalysisRealmZoneActions.setNoData,
        //服务端获取全国安全域数据
        getRealmZoneAnalysisDataByAjax : AnalysisRealmZoneActions.getRealmZoneAnalysisDataByAjax,
        //设置右侧排行榜标题
        setRankListTitle : AnalysisRealmZoneActions.setRankListTitle
    });
    //绑定view方法
    this.exportPublicMethods({
        //获取安全域总数
        getRealmZoneTotalCount : this.getRealmZoneTotalCount,
        //获取安全域列表
        getRealmZoneAnalysisList : this.getRealmZoneAnalysisList,
        //获取查询开始时间
        getStartTime : this.getStartTime,
        //获取查询结束时间
        getEndTime : this.getEndTime,
        //获取是否是loading状态
        getLoadingState : this.getLoadingState,
        //获取是否没有数据
        getNoData : this.getNoData,
        //获取是否一个安全域也没有
        getNoRealmAtAll : this.getNoRealmAtAll
    });

}

//ToView-获取是否一个安全域也没有
AnalysisRealmZoneStore.prototype.getNoRealmAtAll = function() {
    return this.getState().noRealmAtAll;
};
//ToView-获取noData
AnalysisRealmZoneStore.prototype.getNoData = function() {
    return this.getState().noData;
};
//ToView-获取加载状态
AnalysisRealmZoneStore.prototype.getLoadingState = function() {
    return this.getState().isLoading;
};
//ToView-获取全国安全域开通总数
AnalysisRealmZoneStore.prototype.getRealmZoneTotalCount = function() {
    return this.getState().realmZoneTotalCount;
};
//ToView-获取全国安全域开通列表
AnalysisRealmZoneStore.prototype.getRealmZoneAnalysisList = function() {
    return this.getState().realmZoneAnalysisList;
};
//ToView-获取开始时间
AnalysisRealmZoneStore.prototype.getStartTime = function() {
    return this.getState().startTime;
};
//ToView-获取结束时间
AnalysisRealmZoneStore.prototype.getEndTime = function() {
    return this.getState().endTime;
};

//FromAction-设置是否有数据
AnalysisRealmZoneStore.prototype.setNoData = function(noData) {
    this.noData = noData;
};

//FromAction-设置loading状态
AnalysisRealmZoneStore.prototype.setLoadingState = function(loadingState) {
    this.isLoading = loadingState;
};

//FromAction-设置开始时间
AnalysisRealmZoneStore.prototype.setStartTime = function(startTime) {
    this.startTime = startTime;
};

//FromAction-设置结束时间
AnalysisRealmZoneStore.prototype.setEndTime = function(endTime) {
    this.endTime = endTime;
};

//FromAction-从服务器获取当前全国安全域开通总数之后，传递到store，进行数据处理
AnalysisRealmZoneStore.prototype.getRealmZoneAnalysisDataByAjax = function(ret) {
    //服务器返回数据
    var realmZoneAnalysisListByServer = ret.realmZoneAnalysisListByServer,
        //是否一个安全域都没有
        noRealmAtAll = ret.noRealmAtAll;
    //是否一个安全域也没有
    this.noRealmAtAll = noRealmAtAll;
    //设置不loading
    this.setLoadingState(false);
    //确保返回的是个数组
    if(!_.isArray(realmZoneAnalysisListByServer)) {
        realmZoneAnalysisListByServer = [];
    }
    //过滤服务器数据，只要name和value属性，name非空
    var realmZoneAnalysisList = [];
    _.each(realmZoneAnalysisListByServer , function(obj) {
        if(obj && obj.name) {
            var value = obj.value || 0;
            value = parseInt(value);
            if(isNaN(value)) {
                value = 0;
            }
            realmZoneAnalysisList.push({
                name : obj.name,
                value : value
            });
        }
    });
    //对服务器返回的数据进行排序，保证是降序排列
    realmZoneAnalysisList.sort(function(zone1,zone2) {
        return zone2.value - zone1.value;
    });
    //realmZoneAnalysisList放到store上
    this.realmZoneAnalysisList = realmZoneAnalysisList;
    if(!realmZoneAnalysisList.length) {
        this.noData = true;
    } else {
        this.noData = false;
    }
    //将总数进行计算
    var realmZoneTotalCount = 0;
    _.each(this.realmZoneAnalysisList , function(obj) {
        realmZoneTotalCount += obj.value;
    });
    //将总数放到store上
    this.realmZoneTotalCount = realmZoneTotalCount;
};

//设置右侧标题
AnalysisRealmZoneStore.prototype.setRankListTitle = function(title) {
    this.rankListTitle = title;
};

//使用alt导出store
module.exports = alt.createStore(AnalysisRealmZoneStore , 'AnalysisRealmZoneStore');