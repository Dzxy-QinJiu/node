/**
 * 说明：统计分析-客户分析
 */
//顶部导航
require("./css/oplate-customer-analysis.less");
var TopNav = require("../../../components/top-nav");
var AnalysisMenu = require("../../../components/analysis_menu");
var GeminiScrollbar = require("../../../components/react-gemini-scrollbar");
var AnalysisLayout = require("./utils/analysis-layout");
var OplateCustomerAnalysisAction = require("./action/oplate-customer-analysis.action");
var OplateCustomerAnalysisStore = require("./store/oplate-customer-analysis.store");
var emitter = require("./utils/emitter");
import Analysis from "CMP_DIR/analysis";
import { processCustomerStageChartData, processOrderStageChartData } from "CMP_DIR/analysis/utils";
import AnalysisFilter from "../../../components/analysis/filter";
import {hasPrivilege, getDataAuthType} from "CMP_DIR/privilege/checker";
import SummaryNumber from "CMP_DIR/analysis-summary-number";
import {Row, Col} from "antd";
import { AntcCardContainer } from "antc"; 
const localStorageAppIdKey = "customer_analysis_stored_app_id";
var classnames = require("classnames");
const CHART_HEIGHT=240;
const BOX_CHARTTYPE = 86;//头部数字区域的高度
//客户分析
var OPLATE_CUSTOMER_ANALYSIS = React.createClass({
    onStateChange : function() {
        this.setState(OplateCustomerAnalysisStore.getState());
    },
    getInitialState : function() {
        return OplateCustomerAnalysisStore.getState();
    },
    //缩放延时，避免页面卡顿
    resizeTimeout : null,
    //窗口缩放时候的处理函数
    windowResize : function() {
        clearTimeout(this.resizeTimeout);
        var _this = this;
        this.resizeTimeout = setTimeout(function() {
            //窗口缩放的时候，调用setState，重新走render逻辑渲染
            _this.setState(OplateCustomerAnalysisStore.getState());
        } , 300);
    },
    componentDidMount : function() {
        OplateCustomerAnalysisStore.listen(this.onStateChange);
        OplateCustomerAnalysisAction.getUserType();
        OplateCustomerAnalysisAction.getSalesStageList();
        $('body').css('overflow','hidden');
        //绑定window的resize，进行缩放处理
        $(window).on('resize',this.windowResize);
    },
    componentWillUnmount : function() {
        OplateCustomerAnalysisStore.unlisten(this.onStateChange);
        $('body').css('overflow','visible');
        //组件销毁时，清除缩放的延时
        clearTimeout(this.resizeTimeout);
        //解除window上绑定的resize函数
        $(window).off('resize',this.windowResize);
    },
    getComponent(component, props) {
        if (!props) props = {};
        props.height = (props.height ? props.height :214);
        props.localStorageAppIdKey = localStorageAppIdKey;

        props.ref = (ref) => {this.refs[props.refName] = ref};

        return React.createElement(component, props, null);
    },
    /**
     * @param appId 应用id
     * @param isChoosenAll  是否选中的是“全部应用”
     * @param hasAll 是否含有“全部应用”选项
     * @param list 应用列表的list
     */
    processTrendChartData:function (trendData) {
        if (trendData[0] && trendData[0].data){
            trendData = trendData[0].data;
        }else{
            _.map(trendData, trend => trend.count = trend.total)
        }
        return trendData;
    },
    //趋势统计
    getCustomerChart : function() {
        return (
            this.getComponent(Analysis, {
                refName: "qu_shi_tong_ji",
                chartType: "line",
                target: "Customer"+getDataAuthType(),
                type: this.state.currentTab,
                height: CHART_HEIGHT,
                property: "trend",
                valueField: "count",
                showLabel:false,
                legend: false,
                processData: this.processTrendChartData,
                name:Intl.get("oplate_customer_analysis.1", "趋势统计"),
                jumpProps: {
                    url: "/crm",
                    query: {
                        analysis_filter_field: "trend",
                        customerType:this.state.currentTab
                    },
                },
                query:{
                    customerType:this.state.currentTab,
                    customerProperty:"trend"
                }
            })
        );

    },
    //地域统计
    getZoneChart : function() {
        // var endDate = this.getEndDateText();
        var legend = [{name:Intl.get("oplate_customer_analysis.2", "总数"),key:"total"}];
        return (
            this.getComponent(Analysis, {
                refName: "di_yu_tong_ji",
                chartType: "bar",
                target: "Customer"+getDataAuthType(),
                type: this.state.currentTab,
                property: "zone",
                valueField: "total",
                height: CHART_HEIGHT,
                gridY2:30,
                legend: false,
                name:Intl.get("oplate_customer_analysis.2", "总数"),
                showLabel:false,
                jumpProps: {
                    url: "/crm",
                    query: {
                        analysis_filter_field: "zone",
                        customerType:this.state.currentTab
                    },
                },
                query:{
                    customerType:this.state.currentTab,
                    customerProperty:"zone"
                }
            })
        );
    },
    //团队统计
    getTeamChart : function() {
        var userType = "team";
        //基层销售主管或舆情秘书看到的是其团队成员的统计数据
        if (this.state.userType && (this.state.userType.indexOf("salesmanager") > -1 || this.state.userType.indexOf("salesleader") > -1)) {
            userType = "team_member";
        }
        return (
            this.getComponent(Analysis, {
                refName: "tuan_dui_tong_ji",
                chartType: "bar",
                target: "Customer"+getDataAuthType(),
                type: this.state.currentTab,
                property: userType,
                valueField: "total",
                height: CHART_HEIGHT,
                gridY2:30,
                showLabel:false,
                name:Intl.get("oplate_customer_analysis.2", "总数"),
                isGetDataOnMount:true,
                jumpProps: {
                    url: "/crm",
                    query: {
                        analysis_filter_field: userType,
                        customerType:this.state.currentTab,
                    },
                },
                query:{
                    customerType:this.state.currentTab,
                    customerProperty:userType
                }

            })
        );
    },
    getIndustryChart : function() {
        return (
            this.getComponent(Analysis, {
                refName: "hang_ye_tong_ji",
                chartType: "bar",
                target: "Customer"+getDataAuthType(),
                type: this.state.currentTab,
                property: "industry",
                valueField: "total",
                height: CHART_HEIGHT,
                legend: false,
                name:Intl.get("oplate_customer_analysis.2", "总数"),
                showLabel:false,
                gridY2:30,
                reverseChart:true,
                jumpProps: {
                    url: "/crm",
                    query: {
                        analysis_filter_field: "industry",
                        customerType:this.state.currentTab
                    },
                },
                query:{
                    customerType:this.state.currentTab,
                    customerProperty:"industry"
                }
            })
        );
    },
    //获取客户阶段统计图
    getCustomerStageChart : function() {
        return (
            this.getComponent(Analysis, {
                refName: "ke_hu_jie_duan_tong_ji",
                handler: "getCustomerStageAnalysis",
                type: getDataAuthType().toLowerCase(),
                chartType: "funnel",
                isGetDataOnMount: true,
                processData: processCustomerStageChartData,
                valueField: "showValue",
                sendRequest:this.state.sendRequest,
                showLabel:false,
                width:this.chartWidth,
                height: CHART_HEIGHT,
                minSize:"5%",
            })
        );
    },
    //处理订单阶段数据
    processOrderStageData(data) {
        return processOrderStageChartData(this.state.salesStageList, data);
    },
    //获取订单阶段统计图
    getOrderStageChart : function() {
        return (
            this.getComponent(Analysis, {
                refName: "ding_dan_jie_duan_tong_ji",
                target: "Customer"+getDataAuthType(),
                chartType: "horizontalStage",
                type: this.state.currentTab,
                sendRequest:this.state.sendRequest,
                property: "stage",
                width:this.chartWidth,
                height: CHART_HEIGHT,
                chartHeight: 100,
                processData: this.processOrderStageData,
            })
        );
    },
    changeCurrentTab : function(tabName , event) {
        OplateCustomerAnalysisAction.changeCurrentTab(tabName);
        var sendRequest = ["total", "added"].indexOf(tabName) > -1 ? true : false;
        this.setState({
            currentTab : tabName,
            sendRequest : sendRequest,
        });

    },
    processSummaryNumberData:function (data, resultType) {
        this.state.summaryNumbers.data = data;
        this.state.summaryNumbers.resultType = resultType;
        return data;
    },
    renderSummaryCountBoxContent:function () {
        return (
            <Row>
                <Col xs={24} sm={8} md={4}>
                    <SummaryNumber
                        resultType={this.state.summaryNumbers.resultType}
                        desp={Intl.get("oplate_customer_analysis.7", "总客户")}
                        num={this.state.summaryNumbers.data.total}
                        active={this.state.currentTab === 'total'}
                        onClick={this.changeCurrentTab.bind(this , 'total')}/>
                </Col>
                <Col xs={24} sm={8} md={4}>
                    <SummaryNumber
                        resultType={this.state.summaryNumbers.resultType}
                        desp={Intl.get("oplate_customer_analysis.8", "新增客户")}
                        num={this.state.summaryNumbers.data.added}
                        active={this.state.currentTab === 'added'}
                        onClick={this.changeCurrentTab.bind(this , 'added')}/>
                </Col>
                <Col xs={24} sm={8} md={3}>
                    <SummaryNumber
                        resultType={this.state.summaryNumbers.resultType}
                        desp={Intl.get("oplate_customer_analysis.tried", "试用阶段客户")}
                        num={this.state.summaryNumbers.data.tried}
                        active={this.state.currentTab === 'tried'}
                        onClick={this.changeCurrentTab.bind(this , 'tried')}/>
                </Col>
                <Col xs={24} sm={6} md={4}>
                    <SummaryNumber
                        resultType={this.state.summaryNumbers.resultType}
                        desp={Intl.get("oplate_customer_analysis.projected", "立项报价阶段客户")}
                        num={this.state.summaryNumbers.data.projected}
                        active={this.state.currentTab === 'projected'}
                        onClick={this.changeCurrentTab.bind(this , 'projected')}/>
                </Col>
                <Col xs={24} sm={6} md={3}>
                    <SummaryNumber
                        resultType={this.state.summaryNumbers.resultType}
                        desp={Intl.get("oplate_customer_analysis.negotiated", "谈判阶段客户")}
                        num={this.state.summaryNumbers.data.negotiated}
                        active={this.state.currentTab === 'negotiated'}
                        onClick={this.changeCurrentTab.bind(this , 'negotiated')}/>
                </Col>
                <Col xs={24} sm={6} md={3}>
                    <SummaryNumber
                        resultType={this.state.summaryNumbers.resultType}
                        desp={Intl.get("oplate_customer_analysis.9", "成交阶段客户")}
                        num={this.state.summaryNumbers.data.dealed}
                        active={this.state.currentTab === 'dealed'}
                        onClick={this.changeCurrentTab.bind(this , 'dealed')}/>
                </Col>
                <Col xs={24} sm={6} md={3}>
                    <SummaryNumber
                        resultType={this.state.summaryNumbers.resultType}
                        desp={Intl.get("oplate_customer_analysis.10", "执行阶段客户")}
                        num={this.state.summaryNumbers.data.executed}
                        active={this.state.currentTab === 'executed'}
                        onClick={this.changeCurrentTab.bind(this , 'executed')}/>
                </Col>
            </Row>
        )
    },
    getCharts : function() {
        return [{
            title: Intl.get("oplate_customer_analysis.1", "趋势统计"),
            content: this.getCustomerChart(),
        }, {
            title: Intl.get("oplate_customer_analysis.3", "地域统计"),
            content: this.getZoneChart(),
        }, {
            title: Intl.get("oplate_customer_analysis.5", "行业统计"),
            content: this.getIndustryChart(),
        }, {
            title: Intl.get("oplate_customer_analysis.4", "团队统计"),
            content: this.getTeamChart(),
        }, {
            title: Intl.get("oplate_customer_analysis.customer_stage", "客户阶段统计"),
            content: this.getCustomerStageChart(),
            hide: this.state.currentTab !== "total",
        }, {
            title: Intl.get("oplate_customer_analysis.11", "订单阶段统计"),
            content: this.getOrderStageChart(),
            hide: this.state.currentTab !== "total",
        }];
    },
    render : function() {
        var chartListHeight = $(window).height() - AnalysisLayout.LAYOUTS.TOP;
        var windowWidth = $(window).width();
        if(windowWidth >= Oplate.layout['screen-md']) {
            this.chartWidth = Math.floor(($(window).width() - AnalysisLayout.LAYOUTS.LEFT_NAVBAR - AnalysisLayout.LAYOUTS.CHART_LIST_PADDING * 2 - AnalysisLayout.LAYOUTS.CHART_PADDING * 4) / 2);
        } else {
            this.chartWidth = Math.floor($(window).width() - AnalysisLayout.LAYOUTS.LEFT_NAVBAR - AnalysisLayout.LAYOUTS.CHART_LIST_PADDING * 2 - AnalysisLayout.LAYOUTS.CHART_PADDING * 2);
        }

        var leftSpace = AnalysisLayout.LAYOUTS.LEFT_NAVBAR + AnalysisLayout.LAYOUTS.ANALYSIS_MENU;
        var rightSpace = AnalysisLayout.LAYOUTS.RIGHT_PADDING + AnalysisLayout.LAYOUTS.TIME_RANGE_WIDTH;

        var appSelectorMaxWidth = $(window).width() - leftSpace - rightSpace;
        const storedAppId = localStorage[localStorageAppIdKey];

        const charts = this.getCharts();

        return (
            <div className="oplate_customer_analysis" data-tracename="客户分析">
                <TopNav>
                    <AnalysisMenu/>
                    <div className="analysis-selector-wrap">
                        <AnalysisFilter isSelectFirstApp={!storedAppId} selectedApp={storedAppId} />
                    </div>

                </TopNav>
                <div className="summary-numbers">
                    {
                        this.getComponent(Analysis, {
                                chartType: "box",
                                target: "Customer"+getDataAuthType(),
                                type: "summary",
                                valueField: "total",
                                legend: false,
                                height:BOX_CHARTTYPE,
                                errAndRightBothShow:true,//出错后的提示和正确时的展示都显示出来
                                notShowLoading: true,//不需要展示loading效果
                                processData : this.processSummaryNumberData,
                                renderContent: this.renderSummaryCountBoxContent.bind(this,{
                                    type: "contract",
                                }),
                            }
                        )
                    }

                </div>
                <div ref="chart_list" style={{height:chartListHeight}}>
                        <GeminiScrollbar>
                            <div className="chart_list">
                                {charts.map(chart => {
                                    const props = chart.content.props;
                                    const refName = props.refName;
                                    const ref = this.refs[refName];
                                    const exportData = () => {
                                        if (!ref) return;
    
                                        return ref.getProcessedData();
                                    }
                                    return chart.hide? null : (
                                        <div className="analysis_chart col-md-6 col-sm-12" data-title={chart.title}>
                                            <div className="chart-holder" ref="chartWidthDom" data-tracename={chart.title}>
                                                <AntcCardContainer
                                                    title={chart.title}
                                                    csvFileName={refName + ".csv"}
                                                    exportData={exportData.bind(this)}
                                                >
                                                    {chart.content}
                                                </AntcCardContainer>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </GeminiScrollbar>
                </div>
            </div>
        );
    }
});
//返回react对象
module.exports = OPLATE_CUSTOMER_ANALYSIS;
