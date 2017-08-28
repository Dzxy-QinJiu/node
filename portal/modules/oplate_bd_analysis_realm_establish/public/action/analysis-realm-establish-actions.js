/**
 * author:周连毅
 * 说明：统计分析-当前安全域-开通个数统计 action文件，作为MVC里的c
 */
//ajax请求文件
var AnalysisRealmEstablishAjax = require("../ajax/analysis-realm-establish-ajax");
var DateSelectorUtils = require("../../../../components/date-selector/utils");
//使用alt创建action的类
function AnalysisRealmEstablishActions() {

    this.generateActions({
        //从服务器获取全国安全域开启时间统计
        'getRealmEstablishAnalysisDataByAjax':'getRealmEstablishAnalysisDataByAjax',
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
     *从服务器获取全国安全域开启时间统计
     * @param startTime 开始时间
     * @param endTime   结束时间
     */
    this.getRealmEstablishAnalysisDataByAjax = function(startTime,endTime) {
        var _this = this;
        var unit = DateSelectorUtils.getNatureUnit(startTime,endTime);
        AnalysisRealmEstablishAjax.getRealmEstablishAnalysisData(startTime , endTime , unit).then(function(realmEstablishAnalysisListByServer , noRealmAtAll) {
            _this.dispatch({
                //服务器返回数据
                realmEstablishAnalysisListByServer:realmEstablishAnalysisListByServer,
                //是否一个安全域都没有
                noRealmAtAll:noRealmAtAll,
                //按照 自然日、自然周、自然月 的显示单位
                unit : unit
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
module.exports = alt.createActions(AnalysisRealmEstablishActions);