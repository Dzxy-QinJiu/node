/**
 * author:周连毅
 * 说明：统计分析-安全域分析-当前安全域地域分析界面
 */
//控制器
var AnalysisRealmZoneActions = require("./action/analysis-realm-zone-actions");
//数据中心
var AnalysisRealmZoneStore = require("./store/analysis-realm-zone-store");
//中国地图
var ChinaMap = require("../../../components/china-map");
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



//地图的formatter
function mapFormatter(obj) {
    var percent = ((obj.value / obj.total) * 100).toFixed(1);
    if(percent === 'NaN' || percent === '0.0') {
        percent = '0%';
    }
    return [
        Intl.get("oplate_bd_analysis_realm_zone.1","省份")+'：' + obj.name ,
        Intl.get("oplate_bd_analysis_realm_industry.6","个数")+'：' + (isNaN(obj.value) ? 0 : obj.value),
        Intl.get("oplate_bd_analysis_realm_industry.7","占比")+'：' + (isNaN(obj.value) ? '0%' : percent + '%')
    ].join('<br/>');
}

//进行布局计算使用的常量
var LAYOUT = {
    TOP : 65 + 20,
    BOTTOM : 32
};


//地域分析-全国安全域开通
var OPLATE_BD_ANALYSIS_REALM_ZONE = React.createClass({
    //获取state中使用的数据
    getStateData : function() {
        return {
            //开始时间
            startTime : AnalysisRealmZoneStore.getStartTime(),
            //结束时间
            endTime  : AnalysisRealmZoneStore.getEndTime(),
            //当前全国安全域开通总数
            realmZoneTotalCount : AnalysisRealmZoneStore.getRealmZoneTotalCount(),
            //当前全国安全域开通列表
            realmZoneAnalysisList : AnalysisRealmZoneStore.getRealmZoneAnalysisList(),
            //右侧标题
            rankListTitle : AnalysisRealmZoneStore.getState().rankListTitle,
            //窗口宽度
            windowWidth : $(window).width(),
            //当前loading状态
            isLoading : AnalysisRealmZoneStore.getLoadingState(),
            //是否没有数据
            noData : AnalysisRealmZoneStore.getNoData(),
            //是否一个安全域都没有
            noRealmAtAll : AnalysisRealmZoneStore.getNoRealmAtAll()
        };
    },
    //store变化的时候，调用setState重新渲染
    onChange : function() {
        var stateData = this.getStateData();
        this.setState(stateData);
    },
    //计算图表的尺寸
    getChartDimension:function() {
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();
        if(!this.refs.chartmap) {
            return {
                //地图的宽度
                chinaMapWidth : 0,
                //地图的高度
                chinaMapHeight : 0
            };
        }
        var chinaMapWidth = $(this.refs.chartmap).width();
        var chinaMapHeight ;
        //小于992px，宽与高相同
        if(windowWidth < Oplate.layout['screen-md']) {
            chinaMapHeight = chinaMapWidth;
        } else {
        //大于992px，高度为窗口高度-上下边距
            chinaMapHeight = windowHeight - LAYOUT.TOP - LAYOUT.BOTTOM - $(this.refs.timepicker).height();
        }
        return {
            //地图的宽度
            chinaMapWidth : chinaMapWidth,
            //地图的高度
            chinaMapHeight : chinaMapHeight
        };
    },
    //获取初始状态
    getInitialState : function() {
        return this.getStateData();
    },
    //resize的延迟
    resizeTimeout : null,
    //窗口resize的处理
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
    //组件ready之后的操作
    //绑定store
    //通过action获取数据
    //绑定window的resize事件
    componentDidMount : function() {
        AnalysisRealmZoneStore.listen(this.onChange);
        AnalysisRealmZoneActions.getRealmZoneAnalysisDataByAjax(
            this.state.startTime,
            this.state.endTime
        );
        $(window).on('resize' , this.resizeWindow);
    },
    //组件销毁的操作
    //store恢复默认状态
    //store解绑
    //解绑window的resize事件
    //恢复body的滚动条
    componentWillUnmount : function() {
        AnalysisRealmZoneStore.unlisten(this.onChange);
        $(window).off('resize' , this.resizeWindow);
        clearTimeout(this.resizeTimeout);
        $('body').css({
            'overflow-x':'visible',
            'overflow-y':'visible'
        });
    },
    //时间改变的时候，触发重新查询
    onSelectDate : function(startTime , endTime , range , label) {
        if(range === 'all') {
            AnalysisRealmZoneActions.setRankListTitle(Intl.get("oplate_bd_analysis_realm_establish.5", "当前安全域开通总数"));
        } else if(range === 'custom'){
            AnalysisRealmZoneActions.setRankListTitle(Intl.get("oplate_bd_analysis_realm_establish.6", "安全域开通总数"));
        } else {
            AnalysisRealmZoneActions.setRankListTitle(label + Intl.get("oplate_bd_analysis_realm_establish.6","安全域开通总数"));
        }
        //更改store里的开始时间
        AnalysisRealmZoneActions.setStartTime(startTime);
        //更改store里的结束时间
        AnalysisRealmZoneActions.setEndTime(endTime);
        //更改加载状态
        AnalysisRealmZoneActions.setLoadingState(true);
        //不是没有数据
        AnalysisRealmZoneActions.setNoData(false);
        //ajax查询
        AnalysisRealmZoneActions.getRealmZoneAnalysisDataByAjax(
            startTime,
            endTime
        );
    },
    //渲染界面
    render : function() {
        //计算div高度，右侧列表是否显示滚动条
        var divHeight = 'auto' , GeminiScrollbarEnabled = false;
        //判断是否屏蔽窗口的滚动条
        if($(window).width() < Oplate.layout['screen-md']) {
            $('body').css({
                'overflow-x':'visible',
                'overflow-y':'visible'
            });
        } else {
            $('body').css({
                'overflow-x':'hidden',
                'overflow-y':'hidden'
            });
            divHeight = $(window).height() - LAYOUT.TOP - LAYOUT.BOTTOM;
            GeminiScrollbarEnabled = true;
        }
        //图表信息
        var chartInfo = this.getChartDimension();
        //地图的宽度
        var chinaMapWidth = chartInfo.chinaMapWidth;
        //地图的高度
        var chinaMapHeight = chartInfo.chinaMapHeight;
        //样式判断
        var outerClass = classNames({
            analysis_realm_zone:true,
            clearfix : true,
            //是否没有数据的class
            analysis_realm_zone_nodata : this.state.noRealmAtAll
        });

        return (
            <div className="analysis_realm_zone_content" data-tracename="安全域分析">
                <div className={outerClass} data-tracename="地域分析">
                    <TopNav>
                        <AnalysisMenu />
                        <TopNav.MenuList />
                    </TopNav>
                    {/*没有数据，一个安全域没有的时候才显示出来，通过outerClass的analysis_realm_zone_nodata控制*/}
                    <NoData />
                    {/*左侧的大div节点，在宽屏下固定高度*/}
                    <div className="col-md-8 chartmapwrap" style={{height:divHeight}}>
                        {/*地图组件所在的div节点*/}
                        <div ref="chartmap" className="chartmap">
                            {/*时间选择组件外层div*/}
                            <div className="timepicker" ref="timepicker">
                                {/*时间范围选择器，当日期改变的时候触发onSelectDate*/}
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
                            {/*如果处于loading状态，不显示地图,非loading状态，显示地图*/}
                            {/*地图组件传入
                             宽度、width
                             高度、height
                             数据、dataList
                             tooltip格式化函数、formatter
                             样式 style
                             */}
                            {
                                this.state.isLoading ?
                                    (null):
                                    (<ChinaMap width={chinaMapWidth} height={chinaMapHeight} dataList={this.state.realmZoneAnalysisList} formatter={mapFormatter} style={{marginLeft:'-25px',marginTop:'-25px'}}/>)
                            }
                        </div>
                        {/*loading状态显示一个转圈的组件*/}
                        {
                            this.state.isLoading ?
                                (<Spinner className="isloading"/>):
                                (null)
                        }
                    </div>
                    {/*右侧的安全域排行列表*/}
                    <div className="col-md-4 ranklistwrap">
                        {/*geminiscrollbar要求外层容器限制高度*/}
                        <div className="scrollwrap" style={{height:divHeight}}>
                            {
                                /*loading状态显示一个转圈的组件*/
                                /*非loading状态显示排行榜*/
                                /*GeminiScrollbar 需要传入是否启用的标识*/
                                /*
                                 * 安全域排行榜列表需要传入
                                 * title 标题
                                 * total 总数
                                 * dataList 排行数据
                                 * noData 是否是排行榜没有数据
                                 */
                            }
                            {
                                this.state.isLoading ?
                                    (<Spinner className="isloading"/>):
                                    (
                                        <GeminiScrollbar enabled={GeminiScrollbarEnabled}>
                                            <div className="ranklist">
                                                <AnalysisRankList title={this.state.rankListTitle} total={this.state.realmZoneTotalCount} dataList={this.state.realmZoneAnalysisList} noData={this.state.noData}/>
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
//导出一个react组件
module.exports = OPLATE_BD_ANALYSIS_REALM_ZONE;