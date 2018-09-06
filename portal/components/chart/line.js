/**
 * 线图
 */
import {AntcChart} from 'antc';
require('./style.less');
var echartsTooltipCssText = require('../../lib/utils/echarts-tooltip-csstext');
var COLORSINGLE = '#1790cf';
import { XAXIS_COLOR } from './consts';
import Trace from 'LIB_DIR/trace';
import PropTypes from 'prop-types'; 

class LineChart extends React.Component {
    static defaultProps = {
        chartData: [],
        height: 214,
        resultType: 'loading',
        legend: null
    };

    static propTypes = {
        chartData: PropTypes.array,
        height: PropTypes.number,
        resultType: PropTypes.string,
        legend: PropTypes.array,
        dataField: PropTypes.string,
        dataField2: PropTypes.string,
        showLabel: PropTypes.bool,
        labelFormatter: PropTypes.func,
        name: PropTypes.string,
        valueField: PropTypes.string,
    }

    getLegend = () => {
        if(!this.props.legend) {
            return {
                show: false,
                data: []
            };
        }
        var legend = _.map(this.props.legend , 'name');
        return {
            show: true,
            data: legend
        };
    };

    getCategorys = () => {
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

    };

    getLabel = () => {
        return {
            normal: {
                show: this.props.showLabel || false,
                position: 'top',
                formatter: this.props.labelFormatter || '{c}'
            }
        };
    };

    getSeries = () => {
        var _this = this;
        var series = [];

        if (this.props.valueField) {
            const dataField = this.props.dataField;
            const dataField2 = this.props.dataField2;
            let list = dataField !== undefined ? this.props.chartData[dataField] : this.props.chartData;

            if (list && dataField2 !== undefined) list = list[dataField2];

            series.push({
                symbol: 'circle',
                showAllSymbol: true,
                name: this.props.name,
                type: 'line',
                label: this.getLabel(),
                data: _.map(list , this.props.valueField),
                itemStyle: {
                    normal: {
                        color: COLORSINGLE
                    }
                }
            });
        } else {
            _.each(this.props.legend , function(legendInfo,idx) {
                var bar = {
                    name: legendInfo.name,
                    type: 'bar',
                    stack: 'stack',
                    barMinWidth: 4,
                    barMaxWidth: 40,
                    data: _.map(_this.props.chartData , legendInfo.key),
                    itemStyle: {
                        normal: {
                            color: COLORSINGLE
                        }
                    }
                };
                series.push(bar);
            });
            //添加折线图，能够体现出趋势
            var line = {
                name: Intl.get('app_operation.1', '用户总数'),
                type: 'line',
                symbol: 'none',
                smooth: true,
                label: this.getLabel(),
                data: _.map(_this.props.chartData , 'total')
            };
            series.push(line);
        }

        return series;
    };

    getEchartOptions = () => {
        var _this = this;
        var option = {
            title: null,
            animation: false,
            tooltip: {
                trigger: 'axis',
                show: true,
                extraCssText: echartsTooltipCssText,
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
                    data: this.getCategorys(),
                    splitLine: {
                        lineStyle: {
                            color: '#f2f2f2'
                        }
                    },
                    splitArea: false,
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
                            color: XAXIS_COLOR,
                            align: 'center'
                        }
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    splitLine: {
                        lineStyle: {
                            color: '#f2f2f2'
                        }
                    },
                    splitArea: false,
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
    };

    render() {
        return (
            <AntcChart
                option={this.getEchartOptions()}
                resultType={this.props.resultType}
                height={this.props.height}
            />
        );
    }
}

module.exports = LineChart;

