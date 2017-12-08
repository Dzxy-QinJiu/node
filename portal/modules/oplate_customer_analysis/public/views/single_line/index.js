/**
 * 线图
 */
var echarts = require("echarts-eefung");
require("./index.less");
var Color = require("color");
var emitter = require("../../utils/emitter");
var Spinner = require("../../../../../components/spinner");
var immutable = require("immutable");
var COLORMULTIPLE = ['#1790cf','#1bb2d8'];
var echartsTooltipCssText = require("../../../../../lib/utils/echarts-tooltip-csstext");
import macronsTheme from "CMP_DIR/echarts-theme/macrons";

var SingleLineChart = React.createClass({
    echartInstance : null,
    getDefaultProps : function() {
        return {
            list : [],
            title : Intl.get("oplate_customer_analysis.14", "客户统计"),
            width:'100%',
            height:214,
            resultType : 'loading',
            endDate : '',
            /**
             * [
             *  {name : '正式',key : 'formal'}
             * ]
             */
            legend : null
        };
    },
    getLegend : function() {
        if(!this.props.legend) {
            return {
                show : false,
                data :[]
            };
        }
        var legend = _.pluck(this.props.legend , 'name');
        legend.push( Intl.get("oplate_customer_analysis.15", "客户总数"));
        return {
            show : false,
            data : legend
        };
    },
    getCategorys : function() {
        return _.map(this.props.list , function(obj) {
            var m = moment(new Date(+obj.timestamp));
            return m.format(oplateConsts.DATE_FORMAT);
        });
    },
    getSeries : function() {
        var _this = this;
        var series = [];
        _.each(this.props.legend , function(legendInfo,idx) {
            var currentColor = COLORMULTIPLE[idx];
            var bar = {
                name : legendInfo.name,
                type : 'line',
                smooth : true,
                data : _.pluck(_this.props.list , legendInfo.key),
                itemStyle : {
                    normal : {
                        color :currentColor
                    }
                }
            };
            series.push(bar);
        });
        return series;
    },
    getTooltip : function() {
        var _this = this;
        return {
            trigger: 'axis',
            axisPointer : {
                lineStyle : {
                    color : '#9fc4e1',
                    width:1
                }
            },
            extraCssText : echartsTooltipCssText,
            formatter : function(args) {
                var name = args[0].name;
                var target = _this.props.list[args[0].dataIndex];
                var list = [];

                var currentTotal = 0 , colorList;
                _this.props.legend.map(function(legendInfo,idx) {
                    var value = target[legendInfo.key];
                    colorList = COLORMULTIPLE;
                    var color = colorList[idx];
                    currentTotal += value;
                    list.push(`<li><span style="background:${color}"></span><i>${legendInfo.name}</i><i>${value}</i></li>`);
                });

                var displayName = name;

                return `<div class="echarts-tooltip">
                            <div class="title"><span>${displayName}</span></div>
                            <ul class="list-unstyled">
                                ${list.join('')}
                            </ul>
                        </div>`;
            }
        };
    },
    getEchartOptions : function() {
        var option = {
            title:null,
            animation : false,
            tooltip : this.getTooltip(),
            legend: this.getLegend(),
            toolbox: {
                show : false
            },
            calculable : false,
            grid : {
                x : 50,
                y : 20,
                x2 : 30,
                y2 : 30,
                borderWidth : 0
            },
            xAxis : [
                {
                    type : 'category',
                    data : this.getCategorys(),
                    splitLine : false,
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
                    }
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    splitLine : false,
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
            series : this.getSeries()
        };
        return option;
    },
    renderChart : function() {
        var _this = this;
        if(this.echartInstance) {
            try {_this.echartInstance.clear();} catch(e){}
        }
        if(this.props.resultType === 'loading') {
            return;
        }
        this.echartInstance = echarts.init(this.refs.chart,macronsTheme);
        var options = this.getEchartOptions();
        this.echartInstance.setOption(options,true);
        if(!this.props.list.length) {
            if(this.echartInstance) {
                try {_this.echartInstance.dispose();} catch(e){}
                this.echartInstance = null;
            }
            $(this.refs.chart).html("<div class='nodata'>" + Intl.get("common.no.data", "暂无数据") + "</div>");
        } else {
            $(this.refs.chart).find(".nodata").remove();
        }
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
            var _this = this;
            try {_this.echartInstance.dispose();}catch(e){}
            this.echartInstance = null;
        }
    },
    render : function() {
        var _this = this;
        return (
            <div className="analysis_single_line_chart" ref="wrap">
                {this.props.resultType === 'loading'?
                    (
                        <div className="loadwrap" style={{height:this.props.height}}>
                            <Spinner/>
                        </div>
                    ):
                    (
                        <div>
                            <div ref="chart" style={{width:this.props.width,height:this.props.height}} className="chart" data-title={this.props.title}></div>
                        </div>
                    )
                }
            </div>
        );
    }
});

module.exports = SingleLineChart;