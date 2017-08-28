/**
 * author:周连毅
 * 说明：统计分析-当前安全域-开通个数统计 react文件
 */
//控制器
var AnalysisRealmEstablishActions = require("./action/analysis-realm-establish-actions");
//数据中心
var AnalysisRealmEstablishStore = require("./store/analysis-realm-establish-store");
//加载中
var Spinner = require("../../../components/spinner");
//没有数据
var NoData = require("../../../components/analysis-nodata");
//classNames
import classNames from "classnames";
//日期选择器
import DatePicker from "../../../components/datepicker";
//时间线图
var AnalysisLineChartTimeRange = require("../../../components/analysis-linechart-timerange");
//总数统计
var AnalysisRealmCount = require("../../../components/analysis-realm-count");
//顶部导航
var TopNav = require("../../../components/top-nav");
//统计分析菜单
var AnalysisMenu = require("../../../components/analysis_menu");

//css
require("./css/index.scss");

//线图的formatter
function lineFormatter(obj) {
    var dateText = obj.name;
    var num = obj.value;
    return [
        `${Intl.get("user.time.start","开通时间")}：${dateText}`,
        `${Intl.get("user.batch.open.count", "开通个数")}：${num}`
    ].join('<br />');
}

//布局计算使用的常量
var LAYOUT = {
    TOP : 76 + 20,
    BOTTOM : 32
};

//地域分析-安全域开通时间
var OPLATE_BD_ANALYSIS_REALM_ESTABLISH = React.createClass({
    //获取state中使用的数据
    getStateData : function() {
        return {
            //开始时间
            startTime : AnalysisRealmEstablishStore.getStartTime(),
            //结束时间
            endTime  : AnalysisRealmEstablishStore.getEndTime(),
            //当前安全域开通总数
            realmEstablishTotalCount : AnalysisRealmEstablishStore.getRealmEstablishTotalCount(),
            //当前全国安全域开通列表
            realmEstablishAnalysisList : AnalysisRealmEstablishStore.getRealmEstablishAnalysisList(),
            //右侧标题
            rankListTitle : AnalysisRealmEstablishStore.getState().rankListTitle,
            //窗口宽度
            windowWidth : $(window).width(),
            //当前loading状态
            isLoading : AnalysisRealmEstablishStore.getLoadingState(),
            //是否没有数据
            noData : AnalysisRealmEstablishStore.getNoData(),
            //是否一个安全域都没有
            noRealmAtAll : AnalysisRealmEstablishStore.getNoRealmAtAll(),
            //获取unit
            unit : AnalysisRealmEstablishStore.getUnit()
        };
    },
    //store变化的时候重新render
    onChange : function() {
        var stateData = this.getStateData();
        this.setState(stateData);
    },
    //获取图表的尺寸
    getChartDimension:function() {
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();
        if(!this.refs.chart) {
            return {
                //图的宽度
                chartWidth : 0,
                //图的高度
                chartHeight : 0
            };
        }
        var chartWidth = $(this.refs.chart).width() , chartHeight;
        //小于992的时候
        if(windowWidth < Oplate.layout['screen-md']) {
            //小于520的时候，宽与高相同
            if(windowWidth < 520) {
                chartHeight = chartWidth;
            } else {
            //大于520的时候，高是宽的0.7倍
                chartHeight = Math.floor(chartWidth * 0.7);
            }

        } else {
            //大于992的时候，高度为窗口高度-上下margin
            chartHeight = windowHeight - LAYOUT.TOP - LAYOUT.BOTTOM - $(this.refs.timepicker).height() - 25;
        }
        return {
            //地图的宽度
            chartWidth : chartWidth,
            //地图的高度
            chartHeight : chartHeight - 60
        };
    },
    //获取初始状态
    getInitialState : function() {
        return this.getStateData();
    },
    //resize的延迟
    resizeTimeout : null,
    //resize的时候重新render
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
    //组件装载完毕的时候
    //1.绑定store
    //2.通过action获取数据
    //3.绑定window的resize
    componentDidMount : function() {
        AnalysisRealmEstablishStore.listen(this.onChange);
        AnalysisRealmEstablishActions.getRealmEstablishAnalysisDataByAjax(
            this.state.startTime,
            this.state.endTime
        );
        $(window).on('resize' , this.resizeWindow);
    },
    //组件卸载的时候
    //1.store重置
    //2.解绑store
    //3.解绑window的resize
    //4.清除timeout
    componentWillUnmount : function() {
        AnalysisRealmEstablishStore.unlisten(this.onChange);
        $(window).off('resize' , this.resizeWindow);
        clearTimeout(this.resizeTimeout);
    },
    //时间改变的时候触发
    onSelectDate : function(startTime , endTime,range , label) {
        if(range === 'all') {
            AnalysisRealmEstablishActions.setRankListTitle(Intl.get("oplate_bd_analysis_realm_establish.5", "当前安全域开通总数"));
        } else if(range === 'custom') {
            AnalysisRealmEstablishActions.setRankListTitle(Intl.get("oplate_bd_analysis_realm_establish.6", "安全域开通总数"));
        } else {
            AnalysisRealmEstablishActions.setRankListTitle(label + Intl.get("oplate_bd_analysis_realm_establish.6","安全域开通总数"));
        }
        //设置开始时间
        AnalysisRealmEstablishActions.setStartTime(startTime);
        //设置结束时间
        AnalysisRealmEstablishActions.setEndTime(endTime);
        //设置loading为false
        AnalysisRealmEstablishActions.setLoadingState(true);
        //设置nodata为false
        AnalysisRealmEstablishActions.setNoData(false);
        //重新查询
        AnalysisRealmEstablishActions.getRealmEstablishAnalysisDataByAjax(
            startTime,
            endTime
        );
    },
    //react的render函数
    render : function() {
        //div的高度
        var divHeight = 'auto';
        //如果小于992，body有滚动条
        if($(window).width() < Oplate.layout['screen-md']) {
            $('body').css({
                'overflow-x':'visible',
                'overflow-y':'visible'
            });
        } else {
            //如果大于992，body没有滚动条
            $('body').css({
                'overflow-x':'hidden',
                'overflow-y':'hidden'
            });
            //计算div的高度为窗口的高度-上下margin
            divHeight = $(window).height() - LAYOUT.TOP - LAYOUT.BOTTOM;
        }

        //图标信息
        var chartInfo = this.getChartDimension();
        //地图的宽度
        var chartWidth = chartInfo.chartWidth;
        //地图的高度
        var chartHeight = chartInfo.chartHeight;
        //样式判断
        var outerClass = classNames({
            analysis_realm_establish:true,
            clearfix : true,
            analysis_realm_establish_nodata : this.state.noRealmAtAll
        });
        //设置外层的class
        return (
            <div className="analysis_realm_establish_content" data-tracename="安全域分析">
                <div className={outerClass} data-tracename="开启时间统计">
                <TopNav>
                    <AnalysisMenu />
                    <TopNav.MenuList />
                </TopNav>
                {/*没有数据的时候显示nodata*/}
                <NoData />
                {/*图表外层容器，设置高度*/}
                <div className="chartwrap" ref="chart" style={{height:divHeight}}>
                    {/*时间选择器和计数*/}
                    <div className="timepicker" ref="timepicker">
                            {/*时间选择器*/}
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
                            {/*计数*/}
                            <AnalysisRealmCount title={this.state.rankListTitle} total={this.state.realmEstablishTotalCount}/>
                        </div>
                        {/*非loading的时候，显示图表
                        *AnalysisLineChartTimeRange组件使用的属性
                        * width 宽度
                        * height 高度
                        * dataList 开通数据列表
                        * formatter 格式化函数
                        * noData 是否没有数据
                        */}
                        {
                            this.state.isLoading ?
                                (null):
                                (<div className="chartcontainer">
                                    <AnalysisLineChartTimeRange
                                        width={chartWidth}
                                        height={chartHeight}
                                        dataList={this.state.realmEstablishAnalysisList}
                                        formatter={lineFormatter}
                                        noData={this.state.noData}
                                        unit={this.state.unit}
                                    />
                                </div>)
                        }
                        {/*loading状态的时候，显示loading状态*/}
                        {
                            this.state.isLoading ?
                                (<Spinner className="isloading"/>):
                                (null)
                        }
                </div>
            </div>
            </div>
        );
    }
});
//返回react对象
module.exports = OPLATE_BD_ANALYSIS_REALM_ESTABLISH;