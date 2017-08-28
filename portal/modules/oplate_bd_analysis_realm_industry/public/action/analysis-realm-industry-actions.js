/**
 * author:周连毅
 * 说明：统计分析-安全域分析-当前安全域行业分析 的action文件
 */
//使用ajax获取数据
var AnalysisRealmIndustryAjax = require("../ajax/analysis-realm-industry-ajax");
//使用alt创建action的类
function AnalysisRealmIndustryActions() {

    this.generateActions({
        //从服务器获取安全域行业开通总数
        'getRealmIndustryAnalysisDataByAjax':'getRealmIndustryAnalysisDataByAjax',
        //设置开始时间
        'setStartTime' : 'setStartTime',
        //设置结束时间
        'setEndTime' : 'setEndTime',
        //设置加载状态
        'setLoadingState' : 'setLoadingState',
        //是否noData
        'setNoData': 'setNoData',
        //设置右侧标题
        'setRankListTitle':'setRankListTitle'
    });

    /**
     *从服务器获取安全域行业开通总数
     * @param startTime 开始时间
     * @param endTime   结束时间
     */
    this.getRealmIndustryAnalysisDataByAjax = function(startTime,endTime) {
        var _this = this;
        AnalysisRealmIndustryAjax.getRealmIndustryAnalysisData(startTime , endTime).then(function(realmIndustryAnalysisListByServer, noIndustryAtAll) {

            _this.dispatch({
                //服务器返回数据
                realmIndustryAnalysisListByServer:realmIndustryAnalysisListByServer,
                //是否一个安全域都没有
                noIndustryAtAll:noIndustryAtAll
            });

        });
    };
    /**
     *设置开始时间
     * @param startTime 开始时间
     */
    this.setStartTime = function(startTime) {
        this.dispatch(startTime);
    };

    /**
     * 设置结束时间
     * @param endTime 结束时间
     */
    this.setEndTime = function(endTime) {
        this.dispatch(endTime);
    };

    /**
     * 设置加载状态
     */
    this.setLoadingState = function(state) {
        this.dispatch(state);
    };

    /**
     * 设置noData
     */
    this.setNoData = function(noData) {
        this.dispatch(noData);
    };

    //设置右侧标题
    this.setRankListTitle = function(title) {
        this.dispatch(title);
    };

}
//使用alt导出单例的action实例
module.exports = alt.createActions(AnalysisRealmIndustryActions);