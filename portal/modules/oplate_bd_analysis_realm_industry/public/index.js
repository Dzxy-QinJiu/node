/**
 * author:周连毅
 * 说明：统计分析-安全域分析-当前安全域行业分析 的react文件
 */
//控制器
var AnalysisRealmIndustryActions = require("./action/analysis-realm-industry-actions");
//数据中心
var AnalysisRealmIndustryStore = require("./store/analysis-realm-industry-store");
//横向柱状图
var AnalysisEchartBarHorizontal = require("../../../components/analysis-echart-bar-horizontal");
//排行榜
var AnalysisRankList = require("../../../components/analysis-rank-list");
//滚动条
var GeminiScrollbar = require('../../../components/react-gemini-scrollbar');
//加载中
var Spinner = require("../../../components/spinner");
//没有数据
var NoData = require("../../../components/analysis-nodata");
//classNames
import classNames from "classnames";
//日期选择器
import DatePicker from "../../../components/datepicker";
//顶部导航
var TopNav = require("../../../components/top-nav");
//统计分析的菜单
var AnalysisMenu = require("../../../components/analysis_menu");
//css
require("./css/index.less");
//布局使用的计算的常量
var LAYOUT = {
    TOP : 76 + 20,
    BOTTOM : 32
};

//行业分析-安全域开通
var OPLATE_BD_ANALYSIS_REALM_INDUSTRY = React.createClass({
    //获取state中使用的数据
    getStateData : function() {
        return {
            //开始时间
            startTime : AnalysisRealmIndustryStore.getStartTime(),
            //结束时间
            endTime  : AnalysisRealmIndustryStore.getEndTime(),
            //当前安全域行业开通总数
            realmIndustryTotalCount : AnalysisRealmIndustryStore.getRealmIndustryTotalCount(),
            //当前安全域行业开通列表
            realmIndustryAnalysisList : AnalysisRealmIndustryStore.getRealmIndustryAnalysisList(),
            //右侧标题
            rankListTitle : AnalysisRealmIndustryStore.getState().rankListTitle,
            //窗口宽度
            windowWidth : $(window).width(),
            //当前loading状态
            isLoading : AnalysisRealmIndustryStore.getLoadingState(),
            //是否没有数据
            noData : AnalysisRealmIndustryStore.getNoData(),
            //是否一个安全域都没有
            noIndustryAtAll : AnalysisRealmIndustryStore.getNoIndustryAtAll()
        };
    },
    //store变化的时候重新渲染
    onChange : function() {
        var stateData = this.getStateData();
        this.setState(stateData);
    },
    //计算获取图表大小
    getChartDimension:function() {
        //不渲染的时候返回0
        if(!this.refs.chart) {
            return {
                //柱状图的宽度
                chartWidth : 0,
                //柱状图的高度
                chartHeight : 0
            };
        }
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();
        var chartWidth = $(this.refs.chart).width();
        var chartHeight ;
        //小于992的时候，宽度和高度相同
        if(windowWidth < Oplate.layout['screen-md']) {
            chartHeight = chartWidth;
        } else {
            //大于992的时候，高度为窗口高度减去固定margin，再减去日期选择器高度
            chartHeight = windowHeight - LAYOUT.TOP - LAYOUT.BOTTOM - $(this.refs.timepicker).height();
        }
        return {
            //图的宽度
            chartWidth : chartWidth,
            //图的高度
            chartHeight : chartHeight
        };
    },
    //柱状图的formatter
    BarChartFormatter : function(obj) {
        var percent = ((obj.value / obj.total) * 100).toFixed(1);
        if(percent === 'NaN' || percent === '0.0') {
            percent = '0%';
        }
        return [
            Intl.get("realm.industry","行业")+'：' + obj.name ,
            Intl.get("oplate_bd_analysis_realm_industry.6","个数")+'：' + (isNaN(obj.value) ? 0 : obj.value),
            Intl.get("oplate_bd_analysis_realm_industry.7","占比")+'：' + (isNaN(obj.value) ? '0%' : percent + '%')
        ].join('<br/>');
    },
    //获取初始state
    getInitialState : function() {
        return this.getStateData();
    },
    //resize的延迟
    resizeTimeout : null,
    //窗口resize的处理函数
    resizeWindow : function() {
        clearTimeout(this.resizeTimeout);
        var _this = this;
        this.resizeTimeout = setTimeout(function() {
            _this.setState({
                //窗口的宽度
                windowWidth : $(window).width()
            });
        } , Oplate.layout['sidebar-transition-time']);
    },
    //组件初始化完毕的时候
    //绑定store
    //使用action获取安全域行业数据
    //绑定window的resize事件
    componentDidMount : function() {
        AnalysisRealmIndustryStore.listen(this.onChange);
        AnalysisRealmIndustryActions.getRealmIndustryAnalysisDataByAjax(
            this.state.startTime,
            this.state.endTime
        );
        $(window).on('resize' , this.resizeWindow);
    },
    //组件将要销毁的时候
    //store重置
    //解绑store
    //解除window的resize事件
    //body有滚动条
    componentWillUnmount : function() {
        AnalysisRealmIndustryStore.unlisten(this.onChange);
        $(window).off('resize' , this.resizeWindow);
        $('body').css({
            'overflow-x':'visible',
            'overflow-y':'visible'
        });
    },
    /*当日期更改的时候的操作*/
    onSelectDate : function(startTime , endTime, range,label) {
        if(range === 'all') {
            AnalysisRealmIndustryActions.setRankListTitle(Intl.get("oplate_bd_analysis_realm_establish.5", "当前安全域开通总数"));
        } else if(range === 'custom') {
            AnalysisRealmIndustryActions.setRankListTitle(Intl.get("oplate_bd_analysis_realm_establish.6", "安全域开通总数"));
        } else {
            AnalysisRealmIndustryActions.setRankListTitle(label + Intl.get("oplate_bd_analysis_realm_establish.6","安全域开通总数"));
        }
        //设置开始时间
        AnalysisRealmIndustryActions.setStartTime(startTime);
        //设置结束时间
        AnalysisRealmIndustryActions.setEndTime(endTime);
        //设置loading状态
        AnalysisRealmIndustryActions.setLoadingState(true);
        //设置为有数据
        AnalysisRealmIndustryActions.setNoData(false);
        //使用ajax获取数据
        AnalysisRealmIndustryActions.getRealmIndustryAnalysisDataByAjax(
            startTime,
            endTime
        );
    },
    //render函数，渲染的逻辑写在这里
    render : function() {
        //定义div高度
        //定义是否有滚动条
        var divHeight = 'auto' , GeminiScrollbarEnabled = false;
        //宽屏不出现滚动条
        if($(window).width() < Oplate.layout['screen-md']) {
            $('body').css({
                'overflow-x':'visible',
                'overflow-y':'visible'
            });
        //窄屏出现滚动条
        } else {
            $('body').css({
                'overflow-x':'hidden',
                'overflow-y':'hidden'
            });
            //div高度为屏幕高度减去margin
            divHeight = $(window).height() - LAYOUT.TOP - LAYOUT.BOTTOM;
            GeminiScrollbarEnabled = true;
        }

        //图标信息
        var chartInfo = this.getChartDimension();
        //图的宽度
        var chartWidth = chartInfo.chartWidth;
        //图的高度
        var chartHeight = chartInfo.chartHeight;
        //样式判断
        var outerClass = classNames({
            analysis_realm_industry:true,
            clearfix : true,
            analysis_realm_industry_nodata : this.state.noIndustryAtAll
        });
        //定义外层样式
        return (
            <div className="analysis_realm_industry_content" data-tracename="安全域分析">
                <div className={outerClass} data-tracename="行业分析">
                    <TopNav>
                        <AnalysisMenu />
                        <TopNav.MenuList />
                    </TopNav>
                    {/*没有数据的标签*/}
                    <NoData />
                    {/*图表外层区域*/}
                    <div className="col-md-8 chartindustrywrap" style={{height:divHeight}}>
                        {/*图表区域*/}
                        <div ref="chart" className="chart">
                            {/*时间选择器区域*/}
                            <div className="timepicker" ref="timepicker">
                                <DatePicker
                                    disableDateAfterToday={true}
                                    range="all"
                                    onSelect={this.onSelectDate}>
                                    <DatePicker.Option value="all">{Intl.get("user.time.all","全部时间")}</DatePicker.Option>
                                    <DatePicker.Option value="week">{Intl.get("common.time.unit.week","周")}</DatePicker.Option>
                                    <DatePicker.Option value="month">{Intl.get("common.time.unit.month","月")}</DatePicker.Option>
                                    <DatePicker.Option value="quarter">{Intl.get("common.time.unit.quarter", "季度")}</DatePicker.Option>
                                    <DatePicker.Option value="year">{Intl.get("common.time.unit.year","年")}</DatePicker.Option>
                                    <DatePicker.Option value="custom">{Intl.get("user.time.custom","自定义")}</DatePicker.Option>
                                </DatePicker>
                            </div>
                            {/*loading状态下显示loading
                             *非loading状态下显示图表
                             * 图表的属性
                             * width 宽度
                             * height 高度
                             * dataList 行业数据
                             * formatter tooltip的formatter
                             * style 样式配置
                             * noData 是否没有数据
                             */}
                            {
                                this.state.isLoading ?
                                    (<Spinner className="isloading"/>):
                                    (<AnalysisEchartBarHorizontal width={chartWidth} height={chartHeight} dataList={this.state.realmIndustryAnalysisList} formatter={this.BarChartFormatter} style={{marginLeft:'-25px',marginTop:'-25px'}} noData={this.state.noData}/>)
                            }

                        </div>
                    </div>
                    {/*排行榜外层区域*/}
                    <div className="col-md-4 ranklistwrap">
                        {/*使用GeminiScrollbar外层div需要限定一个高度*/}
                        <div className="scrollwrap" style={{height:divHeight}}>
                            {/*
                             *当处于loading状态，显示loading
                             *非loading状态时，显示排行榜
                             *排行榜组件使用的属性
                             * title 显示的标题
                             * total 安全域总数
                             * dataList 安全域行业数据
                             * noData 是否没有数据
                             */}
                            {
                                this.state.isLoading ?
                                    (<Spinner className="isloading"/>):
                                    (
                                        <GeminiScrollbar enabled={GeminiScrollbarEnabled}>
                                            <div className="ranklist">
                                                <AnalysisRankList title={this.state.rankListTitle} total={this.state.realmIndustryTotalCount} dataList={this.state.realmIndustryAnalysisList} noData={this.state.noData}/>
                                            </div>
                                        </GeminiScrollbar>
                                    )
                            }

                        </div>
                    </div>
                </div>
            </div>
        );
    }
});
//导出react组件
module.exports = OPLATE_BD_ANALYSIS_REALM_INDUSTRY;
