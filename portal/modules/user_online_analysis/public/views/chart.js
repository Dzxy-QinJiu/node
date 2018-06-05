require('../css/chart.less');
var RightPanelClose = require('../../../../components/rightPanel').RightPanelClose;
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var AnalysisStore = require('../store/user-online-analysis-store');
var AnalysisAction = require('../action/user-online-analysis-action');
var PieChart = require('./piechart');
var BarChart = require('./barchart');

var LAYOUT = {
    //右侧面板顶部标题恒定高度(鹰击：更多在线统计)
    TOP: 54,
    //左侧菜单宽度
    LEFT_MENU_WIDTH: 75,
    //右侧面板右侧padding
    RIGHT_PANEL_PADDING_RIGHT: 32,
    //右侧面板左侧padding
    RIGHT_PANEL_PADDING_LEFT: 43,
    //柱状图右侧margin
    BARCHART_MARGIN_RIGHT: 20
};
var AnalysisChartView = React.createClass({
    displayName: 'AnalysisChartView',
    getInitialState: function() {
        return AnalysisStore.getState();
    },
    onStoreChange: function() {
        this.setState(AnalysisStore.getState());
    },
    componentDidMount: function() {
        AnalysisStore.listen(this.onStoreChange);
        AnalysisAction.getOnlineBrowserByApp({
            app_id: this.state.selectedApp.app_id
        });
        AnalysisAction.getOnlineZoneByApp({
            app_id: this.state.selectedApp.app_id
        });
    },
    componentWillUnmount: function() {
        AnalysisStore.unlisten(this.onStoreChange);
    },
    //隐藏右侧面板
    hideRightPanel: function() {
        AnalysisAction.hideRightPanel();
    },
    render: function() {
        var fixedHeight = $(window).height() - LAYOUT.TOP;
        var barChartWidth = $(window).width() -
                                LAYOUT.LEFT_MENU_WIDTH -
                                LAYOUT.RIGHT_PANEL_PADDING_LEFT -
                                LAYOUT.RIGHT_PANEL_PADDING_RIGHT -
                                LAYOUT.BARCHART_MARGIN_RIGHT;
        return (
            <div className="user_online_analysis_chart">
                <header className="clearfix">
                    <p className="pull-left">{this.state.selectedApp.app_name}：更多在线统计</p>
                    <RightPanelClose onClick={this.hideRightPanel}/>
                </header>
                <div style={{height: fixedHeight}}>
                    <GeminiScrollbar>
                        <section className="chart_section">
                            <p>在线用户客户端统计</p>
                            <PieChart
                                resultType={this.state.browserAnalysis.resultType}
                                list={this.state.browserAnalysis.list}
                                total={this.state.browserAnalysis.total}
                            />
                        </section>
                        <section className="chart_section">
                            <p>在线用户地域统计</p>
                            <BarChart
                                resultType={this.state.zoneAnalysis.resultType}
                                list={this.state.zoneAnalysis.list}
                                total={this.state.zoneAnalysis.total}
                                width={barChartWidth}
                            />
                        </section>
                    </GeminiScrollbar>
                </div>
            </div>
        );
    }
});

module.exports = AnalysisChartView;