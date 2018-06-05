/**
 * Created by zhoulianyi on  2016/5/30 12:19
 */
//用户在线分析的ajax文件
var UserOnlineAnalysisAjax = require('../ajax/user-online-analysis-ajax');
var history = require('../../../../public/sources/history');
//用户在线分析的action
function UserOnlineAnalysisAction() {
    //生成下面这些action
    this.generateActions(
        //一个应用为一个卡片，分页展示各个应用的用户在线统计数据
        'getUserOnlineAnalysisList',
        //查看具体一个应用的用户统计数据,在右侧面板中显示这些数据
        'viewUserOnlineAnalysisByAppId',
        //统计概括信息翻页
        'analysisSummaryPaginationChange',
        //获取某个应用的浏览器统计
        'getOnlineBrowserByApp',
        //隐藏右侧面板
        'hideRightPanel'
    );
    //一个应用为一个卡片，分页展示各个应用的用户在线统计数据
    this.getUserOnlineAnalysisList = function(queryObj) {
        var _this = this;
        this.dispatch({loading: true,error: false});
        UserOnlineAnalysisAjax.getUserOnlineAnalysisList(queryObj).then(function(data) {
            _this.dispatch({loading: false,error: false,data: data});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };
    //获取某个应用的浏览器统计
    this.getOnlineBrowserByApp = function(queryObj) {
        var _this = this;
        this.dispatch({loading: true,error: false});
        UserOnlineAnalysisAjax.getOnlineBrowserByApp(queryObj).then(function(data) {
            _this.dispatch({loading: false,error: false,data: data});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };
    //获取某个应用的地域信息统计
    this.getOnlineZoneByApp = function(queryObj) {
        var _this = this;
        this.dispatch({loading: true,error: false});
        UserOnlineAnalysisAjax.getOnlineZoneByApp(queryObj).then(function(data) {
            _this.dispatch({loading: false,error: false,data: data});
        } , function(errorMsg) {
            _this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };
}
//导出action
module.exports = alt.createActions(UserOnlineAnalysisAction);