/**
 *   通话记录中， 114占比，柱状图展示
 * */
var echarts = require("echarts-eefung");
var moment = require("moment");
import echartsTooltipCssText from "LIB_DIR/utils/echarts-tooltip-csstext";
var immutable = require("immutable");
//macrons主题
import macronsTheme from "CMP_DIR/echarts-theme/macrons";
import { packageTry } from 'LIB_DIR/func';
var RateBarChart = React.createClass({
    echartInstance: null,

    getDefaultProps: function () {
        return {
            dataList: [],
            height: 410,
            xAxisInterval: 'auto',//x轴坐标label间隔的控制,默认：自动调整，（0：所有label全部展示）
            xAxisLabelAlign: 'center',//x轴坐标label位置，默认：剧中（居左、右）
            xAxisRotate: 0//x轴坐标label倾斜的角度（避免重叠时设置）
        };
    },
    componentDidMount: function () {
        this.renderChart();
    },
    componentWillUnmount: function () {
        if (this.echartInstance) {
            var _this = this;
            packageTry(() => {
                _this.echartInstance.dispose();
            });
            this.echartInstance = null;
        }
    },
    componentDidUpdate: function (prevProps) {
        if (
            this.props.dataList &&
            prevProps.dataList &&
            immutable.is(this.props.dataList, prevProps.dataList)
        ) {
            return;
        }
        this.renderChart();
    },

    getTooltip: function () {
        return {
            show: true,
            extraCssText: echartsTooltipCssText,
            formatter: function (obj) {
                let name = obj.name;
                return `<div>
                           <span>${(obj.data[0])}</span>  
                           <br/>  
                           <span>数量:${(obj.data[1])}</span>  
                           <br/>  
                           <span>占比:${(obj.value[2]).toFixed(2) + '%'}</span>
                        </div>`;
            }
        };
    },

    renderChart: function () {
        var _this = this;
        if (this.echartInstance) {
            packageTry(() => {
                _this.echartInstance.clear();
            });
        }
        this.echartInstance = echarts.init(this.refs.chart, macronsTheme);
        var options = this.getEchartOptions();
        this.echartInstance.setOption(options, true);
    },

    getEchartOptions: function () {
        return {
            animation: false,
            tooltip: this.getTooltip(),
            legend: {
                show: true
            },
            toolbox: {
                show: false
            },
            calculable: false,
            color: ['#3398DB'],
            grid: {
                x: 50,
                y: 20,
                x2: 30,
                y2: 30
            },
            xAxis: [
                {
                    type: 'category',
                    data: _.pluck(this.props.dataList, 'name'),
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
                        textStyle: {
                            color: '#939393',
                            align: this.props.xAxisLabelAlign
                        },
                        interval: this.props.xAxisInterval,
                        rotate: this.props.xAxisRotate
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
                        show: true,
                        interval: 'auto',
                        formatter: '{value}',
                        textStyle: {
                            color: '#939393'
                        }
                    }
                }
            ],
            series: [
                {
                    type: 'bar',
                    barMaxWidth: 40,
                    barMinWidth: 4,
                    data: this.props.dataList.map(x => {
                        return [x.name,x.num,x.rate];
                    })
                }
            ]
        };
    },
    render: function () {
        return (
            <div className="echart_wrap" ref="chart" style={{ width: '100%', height: this.props.height }}></div>
        );
    }
});

module.exports = RateBarChart;