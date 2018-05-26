/**
 * author:周连毅
 * 说明：统计分析-安全域统计-当前安全域地域统计的 action文件 MVC中的C
 */
//引入ajax
var AnalysisRealmZoneAjax = require("../ajax/analysis-realm-zone-ajax");
//安全域地域统计的action
function AnalysisRealmZoneActions() {

    this.generateActions({
        //从服务器获取全国安全域开通总数
        'getRealmZoneAnalysisDataByAjax': 'getRealmZoneAnalysisDataByAjax',
        //设置开始时间
        'setStartTime': 'setStartTime',
        //设置结束时间
        'setEndTime': 'setEndTime',
        //设置加载状态
        'setLoadingState': 'setLoadingState',
        //是否noData
        'setNoData': 'setNoData',
        //设置右侧标题
        'setRankListTitle': 'setRankListTitle'
    });

    /**
     *从服务器获取全国安全域开通总数
     * @param startTime 开始时间
     * @param endTime   结束时间
     */
    this.getRealmZoneAnalysisDataByAjax = function(startTime,endTime) {
        var _this = this;
        AnalysisRealmZoneAjax.getRealmZoneAnalysisData(startTime , endTime).then(function(realmZoneAnalysisListByServer , noRealmAtAll) {
            _this.dispatch({
                //服务器返回数据
                realmZoneAnalysisListByServer: realmZoneAnalysisListByServer,
                //是否一个安全域都没有
                noRealmAtAll: noRealmAtAll
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
//使用alt导出一个action
module.exports = alt.createActions(AnalysisRealmZoneActions);