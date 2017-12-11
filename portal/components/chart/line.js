/**
 * 线图
 */
var echarts = require("echarts-eefung");
require("./style.less");
var Spinner = require("../spinner");
var macronsTheme = require("./theme-macrons");
var echartsTooltipCssText = require("../../lib/utils/echarts-tooltip-csstext");
var immutable = require("immutable");
var COLORSINGLE = '#1790cf';
const querystring = require("querystring");
import { XAXIS_COLOR } from "./consts";
import Trace from "LIB_DIR/trace";

var LineChart = React.createClass({
    echartInstance : null,
    getDefaultProps : function() {
        return {
            chartData : [],
            width:'100%',
            height:214,
            resultType : 'loading',
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
        return {
            show : true,
            data : legend
        };
    },
    getCategorys : function() {
        let chartData = this.props.chartData;

        if (this.props.dataField !== undefined) {
            chartData = chartData[this.props.dataField];
            if (chartData && this.props.dataField2 !== undefined) {
                chartData = chartData[this.props.dataField2];
            }
        }

        return _.map(chartData , function(obj) {
            var m = moment(new Date(+obj.timestamp));
            return m.format(oplateConsts.DATE_FORMAT);
        });

    },
    getLabel: function() {
        return {
            normal: {
                show: this.props.showLabel || false,
                position: "top",
                formatter: this.props.labelFormatter || "{c}"
            }
        };
    },
    getSeries : function() {
        var _this = this;
        var series = [];

        if (this.props.valueField) {
            const dataField = this.props.dataField;
            const dataField2 = this.props.dataField2;
            let list = dataField !==undefined? this.props.chartData[dataField] : this.props.chartData;

            if (list && dataField2 !== undefined) list = list[dataField2];

            series.push({
                symbol : "circle",
                showAllSymbol: true,
                name : this.props.name,
                type : 'line',
                label : this.getLabel(),
                data : _.pluck(list , this.props.valueField),
                itemStyle : {
                    normal : {
                        color : COLORSINGLE
                    }
                }
            });
        } else {
            _.each(this.props.legend , function(legendInfo,idx) {
                var bar = {
                    name : legendInfo.name,
                    type : 'bar',
                    stack : 'stack',
                    barMinWidth : 4,
                    barMaxWidth : 40,
                    data : _.pluck(_this.props.chartData , legendInfo.key),
                    itemStyle : {
                        normal : {
                            color : COLORSINGLE
                        }
                    }
                };
                series.push(bar);
            });
            //添加折线图，能够体现出趋势
            var line = {
                name : Intl.get("app_operation.1", "用户总数"),
                type : "line",
                symbol:'none',
                smooth: true,
                label : this.getLabel(),
                data : _.pluck(_this.props.chartData , 'total')
            };
            series.push(line);
        }

        return series;
    },
    getEchartOptions : function() {
        var _this = this;
        var option = {
            title:null,
            animation : false,
            tooltip : {
                trigger : "axis",
                show : true,
                extraCssText : echartsTooltipCssText,
            },
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
                    splitLine : {
                        lineStyle : {
                            color:'#f2f2f2'
                        }
                    },
                    splitArea : false,
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
                            color: XAXIS_COLOR,
                            align:'center'
                        }
                    }
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    splitLine : {
                        lineStyle : {
                            color:'#f2f2f2'
                        }
                    },
                    splitArea : false,
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
        if(this.echartInstance) {
            try {_this.echartInstance.dispose()} catch(e){};
        }
        if(this.props.resultType === 'loading') {
            return;
        }
        var _this = this;
        this.echartInstance = echarts.init(this.refs.chart , macronsTheme);
        var options = this.getEchartOptions();
        if (this.props.tooltipFormatter) {
            options.tooltip.formatter = this.props.tooltipFormatter;
        }
        if (this.props.yAxisLabelFormatter) {
            options.yAxis[0].axisLabel.formatter = this.props.yAxisLabelFormatter;
        }
        this.echartInstance.setOption(options,true);

        const dataField = this.props.dataField;
        const dataField2 = this.props.dataField2;
        let chartData = dataField !==undefined? this.props.chartData[dataField] : this.props.chartData;

        if (chartData && dataField2 !== undefined) chartData = chartData[dataField2];

        if (_.isEmpty(chartData)) {
            if(this.echartInstance) {
                try {_this.echartInstance.dispose()} catch(e){};
            }
            $(this.refs.chart).html(`<div class='nodata'>${Intl.get("common.no.data","暂无数据")}</div>`);
        } else {
            $(this.refs.chart).find(".nodata").remove();
            const jumpProps = this.props.jumpProps;
            if (jumpProps) {
                this.echartInstance.on("click", params => {
                    Trace.traceEvent(params.event.event,"跳转到'" + params.name + "'用户列表");
                    let query = {
                        app_id: this.props.app_id,
                        login_begin_date: this.props.startTime,
                        login_end_date: this.props.endTime,
                        analysis_filter_value: params.name,
                        current_date_timestamp:Date.parse(new Date(params.name)),
                    };

                    if (jumpProps.query) _.extend(query, jumpProps.query);

                    //跳转到用户列表
                    window.open(jumpProps.url + "?" + querystring.stringify(query));
                });
            }
        }
    },
    componentDidMount : function() {
        this.renderChart();
    },
    componentDidUpdate : function(prevProps) {
        if(
            this.props.chartData.length &&
            prevProps.chartData.length &&
            immutable.is(this.props.chartData , prevProps.chartData) &&
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
            <div className="analysis-chart">
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

module.exports = LineChart;
