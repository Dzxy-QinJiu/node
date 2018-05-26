/**
 * 线图
 */
var echarts = require("echarts-eefung");
require("./index.less");
var emitter = require("../../utils/emitter");
var Spinner = require("../../../../../components/spinner");
var immutable = require("immutable");
import macronsTheme from "CMP_DIR/echarts-theme/macrons";
var echartsTooltipCssText = require("../../../../../lib/utils/echarts-tooltip-csstext");
let chartUtil = require("../../utils/chart-util");
import { packageTry } from 'LIB_DIR/func';
var SingleLineChart = React.createClass({
    echartInstance: null,
    getDefaultProps: function() {
        return {
            list: [],
            title: Intl.get("user.analysis.total", "用户统计"),
            width: '100%',
            height: 234,
            resultType: 'loading',
            /**
             * [
             *  {name : Intl.get("user.analysis.formal", "正式"),key : 'formal'}
             * ]
             */
            legend: null,
            isShowSplitLine: false,
            isShowSplitArea: false
        };
    },
    getLegend: function() {
        if(!this.props.legend) {
            return {
                show: false,
                data: []
            };
        }
        return {
            show: true
        };
    },
    getCategorys: function() {
        return _.map(this.props.list , function(obj) {
            var m = moment(new Date(+obj.timestamp));
            return m.format(oplateConsts.DATE_FORMAT);
        });
    },
    getSeries: function() {
        var _this = this;
        var series = [];
        _.each(this.props.legend , function(legendInfo,idx) {
            var bar = {
                name: legendInfo.name,
                type: 'bar',
                stack: 'stack',
                barMinWidth: 4,
                barMaxWidth: 40,
                data: _.pluck(_this.props.list , legendInfo.key),
            };
            series.push(bar);
        });        
        return series;
    },
    getEchartOptions: function() {
        var _this = this;
        var option = {
            title: null,
            animation: false,
            tooltip: {
                trigger: "axis",
                show: true,
                extraCssText: echartsTooltipCssText,
                position: function(mousePointer, params, tooltipDom) {
                    return chartUtil.getTooltipPosition(_this, mousePointer, params, tooltipDom);
                }
            },
            legend: this.getLegend(),
            toolbox: {
                show: false
            },
            calculable: false,
            grid: {
                x: 50,
                y: 20,
                x2: 30,
                y2: 30,
                borderWidth: 0
            },
            xAxis: [
                {
                    type: 'category',
                    splitArea: {
                        show: this.props.isShowSplitArea
                    },
                    data: this.getCategorys(),
                    splitLine: this.props.isShowSplitLine,
                    axisLine: {
                        lineStyle: {
                            width: 1,
                            color: '#d1d1d1'
                        }
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        textStyle: {
                            color: '#939393',
                            align: 'center'
                        }
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    splitLine: this.props.isShowSplitLine,
                    splitArea: {
                        show: this.props.isShowSplitArea
                    },
                    axisLine: {
                        lineStyle: {
                            width: 1,
                            color: '#d1d1d1'
                        }
                    },
                    axisLabel: {
                        textStyle: {
                            color: '#939393'
                        }
                    }
                }
            ],
            series: this.getSeries()
        };
        return option;
    },
    renderChart: function() {
        if(this.echartInstance) {
            packageTry(() => {
                this.echartInstance.dispose();
            });
        }
        if(this.props.resultType === 'loading') {
            return;
        }
        this.echartInstance = echarts.init(this.refs.chart, macronsTheme);
        var options = this.getEchartOptions();
        this.echartInstance.setOption(options,true);
        if(!this.props.list.length) {
            if(this.echartInstance) {
                packageTry(() => {
                    this.echartInstance.dispose();
                });
            }
            $(this.refs.chart).html(`<div class='nodata'>${Intl.get("common.no.data","暂无数据")}</div>`);
        } else {
            $(this.refs.chart).find(".nodata").remove();
        }
    },
    componentDidMount: function() {
        this.renderChart();
    },
    componentDidUpdate: function(prevProps) {
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
    componentWillUnmount: function() {
        if(this.echartInstance) {
            packageTry(() => {
                this.echartInstance.dispose();
            });
            this.echartInstance = null;
        }
    },
    render: function() {
        var _this = this;
        return (
            <div className="analysis_single_line_chart" ref="wrap">
                {this.props.resultType === 'loading' ?
                    (
                        <div className="loadwrap" style={{height: this.props.height}}>
                            <Spinner/>
                        </div>
                    ) :
                    (
                        <div>
                            <div ref="chart" style={{width: this.props.width,height: this.props.height}} className="chart" data-title={this.props.title}></div>
                        </div>
                    )
                }
            </div>
        );
    }
});

module.exports = SingleLineChart;