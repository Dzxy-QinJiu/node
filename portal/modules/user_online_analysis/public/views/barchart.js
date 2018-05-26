/**
 * 线图
 */
var echarts = require("echarts-eefung");
//各种颜色
var colors = require("../utils/colors");
var Color = require("color");
var Spinner = require("../../../../components/spinner");
var immutable = require("immutable");
import macronsTheme from "CMP_DIR/echarts-theme/macrons";
import { packageTry } from 'LIB_DIR/func';

var BarChart = React.createClass({
    displayName: 'UserOnelineAnalysisBarChart',
    echartInstance: null,
    getDefaultProps: function() {
        return {
            list: [],
            width: '100%',
            height: 300,
            resultType: 'loading'
        };
    },
    getLegend: function() {
        return {
            show: false,
            data: []
        };
    },
    getCategorys: function() {
        return _.pluck(this.props.list , 'province');
    },
    getSeries: function() {
        return [{
            name: '',
            type: 'bar',
            barWidth: 4,
            data: _.pluck(this.props.list , 'count'),
            itemStyle: {
                normal: {
                    color: colors.barChartColor
                }
            }
        }];
    },
    getTooltip: function() {
        var _this = this;
        return {
            trigger: 'item',
            formatter: function(obj) {
                var value = obj.value;
                var name = obj.name;
                var nameText = name === 'unknown' ? '未知' : name;
                var percent = (value * 100 / _this.props.total).toFixed(2);

                return `<div class="analysis_tooltip">
                            <div class="tooltip-title"><em style="background:${colors.barChartColor}"></em><span>${nameText}</span></div>
                            <div class="content">
                                ${value} 占比${percent}%
                            </div>
                        </div>`;
            }
        };
    },
    getEchartOptions: function() {
        var option = {
            title: null,
            animation: false,
            tooltip: this.getTooltip(),
            legend: this.getLegend(),
            toolbox: {
                show: false
            },
            calculable: false,
            grid: {
                x: 50,
                y: 20,
                x2: 30,
                y2: 50,
                borderWidth: 0
            },
            xAxis: [
                {
                    type: 'category',
                    data: this.getCategorys(),
                    splitLine: false,
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
                        interval: 0,
                        textStyle: {
                            color: '#939393',
                            align: 'center'
                        },
                        formatter: function(text) {
                            if(text === 'unknown') {
                                text = '未知';
                            }
                            return text.split('').join('\n');
                        }
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    splitLine: false,
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
        this.echartInstance = echarts.init(this.refs.chart,macronsTheme);
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
            <div className="analysis_bar_chart" ref="wrap">
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

module.exports = BarChart;