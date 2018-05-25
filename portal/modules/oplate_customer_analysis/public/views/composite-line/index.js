/**
 * 线图
 */
require("./index.less");
var echarts = require("echarts-eefung");
//各种颜色
var colors = require("../../utils/colors");
var Color = require("color");
var emitter = require("../../utils/emitter");
var Spinner = require("../../../../../components/spinner");
var immutable = require("immutable");
var Icon = require("antd").Icon;
var echartsTooltipCssText = require("../../../../../lib/utils/echarts-tooltip-csstext");
import macronsTheme from "CMP_DIR/echarts-theme/macrons";
import { packageTry } from 'LIB_DIR/func';

//布局使用的常量
var LAYOUT = {
    //单个元素的高度
    SINGLE_ITEM_HEIGHT : 29,
    //图例的宽度
    LEGEND_WIDTH : 88
};

var LineChart = React.createClass({
    echartInstance : null,
    lastHoverIdx : -1,
    //滚动条的scrollTop
    scrollTop : 0,
    //开始、结束时间不在同一年
    isBiggerThanYear : false,
    //获取初始化的状态
    getInitialState : function() {
        return {
            topIconEnable : false,
            bottomIconEnable : true
        };
    },
    getDefaultProps : function() {
        return {
            list : [],
            title : Intl.get("oplate_customer_analysis.8", "新增客户"),
            height:214,
            resultType : 'loading'
        };
    },
    getLegend : function() {
        var list = _.pluck(this.props.list , 'app_name');
        return list;
    },
    getCategorys : function() {
        var items = (this.props.list[0] || {}).data || [];
        if(!items.length) {
            return items;
        }
        var startMoment = moment(new Date(+items[0].timestamp));
        var endMoment = moment(new Date(+items[items.length - 1].timestamp));
        var biggerThanYear = startMoment.format("YYYY") != endMoment.format("YYYY");
        if(biggerThanYear) {
            this.isBiggerThanYear = true;
        }
        var times = items.map(function(pointObj) {
            if(biggerThanYear) {
                return moment(new Date(+pointObj.timestamp)).format(oplateConsts.DATE_YEAR_MONTH_FORMAT);
            }  else {
                return moment(new Date(+pointObj.timestamp)).format(oplateConsts.DATE_MONTH_DAY_FORMAT);
            }
        });
        return times;
    },
    getSeries : function() {
        var colorIdx = 0;
        return this.props.list.map(function(obj ,idx) {
            var color = colors[colorIdx++];
            if(!color) {
                colorIdx = 0;
                color = colors[colorIdx++];
            }
            var list = obj.data || [];
            //“综合”的app_name为空，突出显示“综合”
            var numbers = list.map(function(pointObj) {
                return {
                    value : pointObj.count
                };
            });
            return {
                smooth : true,
                name : obj.app_name,
                type : 'line',
                data : numbers,
                itemStyle : {
                    normal : {
                        color : color
                    },
                    emphasis : {
                        color : color
                    }
                }
            };
        });
    },
    getTooltip : function() {
        var _this = this;
        return {
            trigger : 'axis',
            axisPointer : {
                lineStyle : {
                    color : '#9fc4e1',
                    width:1
                }
            },
            extraCssText : echartsTooltipCssText,
            formatter : function(list) {
                var dataIndex = list[0].dataIndex;
                var time = _this.props.list[0].data[dataIndex].timestamp;
                var timeStr = moment(new Date(time)).format(oplateConsts.DATE_FORMAT);
                var items = list.map(function(obj,idx) {
                    var color = obj.color;
                    return `<div class="pull-left col-xs-6"><em style="background:${color}"></em><span>${obj.seriesName} ${obj.value}</span></div>`;
                });

                return `<div class="echarts-tooltip">
                                <div class="title">${timeStr}<span>${_this.props.title}</span></div>
                                <div class="content clearfix">
                                    ${items.join('')}
                                </div>
                            </div>`;
            }
        };
    },
    getEchartOptions : function() {
        var _this = this;
        return {
            animation:false,
            title: null,
            legend: {
                show : false,
                data: this.getLegend()
            },
            grid : {
                x : 50,
                y : 20,
                x2 : 30,
                y2 : 30,
                borderWidth : 0
            },
            xAxis: [
                {
                    type: "category",
                    splitLine : {
                        lineStyle : {
                            color:'#f2f2f2'
                        }
                    },
                    axisLine : {
                        lineStyle : {
                            width:1,
                            color:'#d1d1d1'
                        }
                    },
                    axisTick : {
                        show : false
                    },
                    axisLabel : {
                        textStyle : {
                            color:'#939393',
                            align:'center'
                        }
                    },
                    data: this.getCategorys()
                }
            ],
            yAxis: [
                {
                    type: "value",
                    splitLine : {
                        lineStyle : {
                            color:'#f2f2f2'
                        }
                    },
                    axisLine : {
                        lineStyle : {
                            width:1,
                            color:'#d1d1d1'
                        }
                    },
                    axisLabel : {
                        textStyle : {
                            color:'#939393'
                        }
                    }
                }
            ],
            tooltip : _this.getTooltip(),
            toolbox: {
                show: false
            },
            calculable: false,
            series: this.getSeries()
        };
    },
    renderChart : function() {
        if(this.echartInstance) {
            packageTry(() => {
                this.echartInstance.clear();
            });
        }
        if(this.props.resultType === 'loading') {
            return;
        }
        this.echartInstance = echarts.init(this.refs.chart,macronsTheme);
        var options = this.getEchartOptions();
        this.echartInstance.setOption(options,true);
        if(!options.series.length) {
            if(this.echartInstance) {
                packageTry(() => {
                    this.echartInstance.dispose();
                });
                this.echartInstance = null;
            }
            $(this.refs.chart).html("<div class='nodata'>" + Intl.get("common.no.data", "暂无数据") + "</div>");
        } else {
            $(this.refs.chart).find(".nodata").remove();
        }
    },
    legendMouseenter : function(obj,idx,event) {
        clearTimeout(this.legendMouseTimeout);
        var _this = this;
        this.legendMouseTimeout = setTimeout(function() {
            var options = _this.getEchartOptions();
            var series = options.series[idx];
            var oldColor = series.itemStyle.normal.color;
            var newColor = Color(oldColor).darken(0.3).hexString();
            series.itemStyle.normal.color = newColor;
            _this.echartInstance.clear();
            _this.echartInstance.setOption(options);
        } , 300);
    },
    legendMouseleave : function(obj,idx,event) {
        clearTimeout(this.legendMouseTimeout);
        var _this = this;
        this.legendMouseTimeout = setTimeout(function() {
            var options = _this.getEchartOptions();
            _this.echartInstance.clear();
            _this.echartInstance.setOption(options);
        } , 300);
    },
    componentDidMount : function() {
        this.renderChart();
    },
    componentDidUpdate : function(prevProps) {
        if(
            this.props.list.length &&
            prevProps.list.length &&
            immutable.is(this.props.list , prevProps.list) &&
                this.props.width === prevProps.width
        ) {
            return;
        }
        this.renderChart();
    },
    componentWillUnmount : function() {
        if(this.echartInstance) {
            packageTry(() => {
                this.echartInstance.dispose();
            });
            this.echartInstance = null;
        }
    },
    //处理向上滚动
    handleScrollUp : function() {
        //scrollTop减去某个值
        this.scrollTop -= LAYOUT.SINGLE_ITEM_HEIGHT;
        //默认认为顶部的方向按钮能用
        var topIconEnable = true;
        //滚动边界处理
        if(this.scrollTop <= 0) {
            this.scrollTop = 0;
            topIconEnable = false;
        }
        //对dom的scrollTop进行赋值
        this.refs.legendWrap.scrollTop = this.scrollTop;
        this.setState({
            topIconEnable : topIconEnable,
            bottomIconEnable : true
        });
    },
    //处理向下滚动
    handleScrollDown : function() {
        //获取最大滚动高度
        var maxScrollHeight = this.refs.legendWrap.scrollHeight - $(this.refs.legendWrap).height();
        //滚动高度增加
        this.scrollTop += LAYOUT.SINGLE_ITEM_HEIGHT;
        var bottomIconEnable = true;
        //进行临界判断
        if(this.scrollTop >= maxScrollHeight) {
            this.scrollTop = maxScrollHeight;
            bottomIconEnable = false;
        }
        this.refs.legendWrap.scrollTop = this.scrollTop;
        //设置按钮可用状态
        this.setState({
            topIconEnable : true,
            bottomIconEnable : bottomIconEnable
        });
    },
    onMouseWheel : function(event) {
        event.preventDefault();
        if(event.deltaY > 0) {
            this.handleScrollDown();
        } else {
            this.handleScrollUp();
        }
    },
    renderLegend : function() {
        var _this = this;
        var colorIdx = 0;
        if(!this.props.list.length) {
            return null;
        }
        return (
            <div ref="legend" className="legend">
                <Icon type="caret-up" style={{visibility:this.state.topIconEnable ? 'visible' : 'hidden'}} onClick={this.handleScrollUp}/>
                <ul className="list-unstyled" ref="legendWrap" onWheel={this.onMouseWheel}>
                    {
                        this.props.list.map(function(obj , idx) {
                            var color = colors[colorIdx++];
                            if(!color) {
                                colorIdx = 0;
                                color = colors[colorIdx++];
                            }
                            return (
                                <li
                                    key={obj.app_name}
                                    onMouseEnter={_this.legendMouseenter.bind(_this,obj,idx)}
                                    onMouseLeave={_this.legendMouseleave.bind(_this,obj,idx)}
                                >
                                    <em style={{background:color}}></em>
                                    <span title={obj.app_name}>{obj.app_name}</span>
                                </li>
                            );
                        })
                    }
                </ul>
                <Icon type="caret-down" style={{visibility:this.state.bottomIconEnable ? 'visible' : 'hidden'}} onClick={this.handleScrollDown}/>
            </div>
        );
    },
    render : function() {
        var chartWidth = (this.props.width || $(this.refs.wrap).width());
        return (
            <div className="analysis_composite_line_chart" ref="wrap">
                    {this.props.resultType === 'loading'?
                        (
                            <div className="loadwrap" style={{height:this.props.height}}>
                                <Spinner/>
                            </div>
                        ):
                        (
                        <div>
                            <div ref="chart" style={{width:chartWidth,height:this.props.height}} className="chart" data-title={this.props.title}></div>
                        </div>
                        )
                    }
            </div>
        );
    }
});

module.exports = LineChart;