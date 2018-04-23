/**
 * Created by zhoulianyi on  2016/5/29 15:42 .
 */
require("./css/user_online_analysis.less");
var TopNav = require("../../../components/top-nav");
var url = require("url");
var querystring = require("querystring");
var AnalysisListView = require("./views/list");
var AnalysisChartView = require("./views/chart");
var RightPanel = require("../../../components/rightPanel").RightPanel;
var AnalysisStore = require("./store/user-online-analysis-store");
var insertStyle = require("../../../components/insert-style");

//布局使用的配置
var LAYOUT = {
    NAV_SIDEBAR_WIDTH : 75
};

var UserOnlineAnalysis = React.createClass({
    displayName : 'UserOnlineAnalysis',
    getInitialState : function() {
        return AnalysisStore.getState();
    },
    onStoreChange : function() {
        this.setState(AnalysisStore.getState());
    },
    componentDidMount : function() {
        AnalysisStore.listen(this.onStoreChange);
        $(window).on("resize",this.onStoreChange);
        this.dynamicStyle = insertStyle(`.user_online_analysis_panel.right-pannel-default{
                                            width:auto;
                                            left:75px;
                                            transform:translateX(100%);
                                            -webkit-transform:translateX(100%);
                                            display:block;
                                      }`);
    },
    componentWillUnmount : function() {
        AnalysisStore.unlisten(this.onStoreChange);
        $(window).off("resize",this.onStoreChange);
        this.dynamicStyle.destroy();
    },
    render: function () {
        var view = null;
        if(this.state.isShowRightPanel) {
            view = (<AnalysisChartView />);
        }
        return (
            <div className="user-online-analysis-wrap">
                <TopNav>
                    <TopNav.MenuList />
                </TopNav>
                <div className="user-online-analysis-content">
                    <AnalysisListView/>
                    <RightPanel className="user_online_analysis_panel" showFlag={this.state.isShowRightPanel}>
                        {view}
                    </RightPanel>
                </div>
            </div>
        );
    }
});
module.exports = UserOnlineAnalysis;