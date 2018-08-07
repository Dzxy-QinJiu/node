/**
 * 使用方法
 *
 * <TimeSeriesBarChart
     dataList={this.state.callGraph.data_list}
     tooltip={this.chartTooltip}
   />
    其中dataList是数组，格式为[{date : 1473393437380,sum:100}]
    tooltip是function，会传出去两个参数
         time   2016/7/6
         sum    个数
    tooltip返回的html会显示在echart的tooltip上。
    function(time,sum) {
        return 'some html here';
    }
 */
var echarts = require('echarts');
import macronsTheme from 'CMP_DIR/echarts-theme/macrons';
var TimeSeriesBarchart = React.createClass({
    getDefaultProps: function() {
        return {
            dataList: [],
            isShowSplitArea: false,
            tooltip: function() {}
        };
    },
    getInitialState: function() {
        return {
            echartListCache: this.props.dataList
        };
    },
    componentDidMount: function() {
        this.drawEchart();
    },
    componentDidUpdate: function() {
        if(this.state.echartListCache !== this.props.dataList) {
            this.state.echartListCache = this.props.dataList;
            this.drawEchart();
        }
    },
    transformDataList: function() {
        var resultList = this.props.dataList.map(function(item) {
            return [
                new Date(item.date),
                item.sum
            ];
        });
        //这里在前面和后面添加了两个点，修复echarts的type为time的时候，boundaryGap不生效的问题 , https://github.com/ecomfe/echarts/issues/4532
        // 增加两个数据点
        if(resultList.length >= 1) {
            var currentDate = resultList[0][0];
            var yesterDay = moment(currentDate).subtract(1, 'day');
            currentDate = resultList[resultList.length - 1][0];
            var tomorrow = moment(currentDate).add(1, 'day');
            resultList.push([
                tomorrow.toDate(),
                0
            ]);
            resultList.unshift([
                yesterDay.toDate(),
                0
            ]);
        }
        return resultList;
    },
    drawEchart: function() {
        var series = this.transformDataList();
        var xInterval = null;
        if (series.length <= 5) {
            xInterval = 24 * 60 * 60 * 1000;
        }
        var xValue = [];
        var yValue = [];
        // 获取所有y轴的刻度值和x轴的时间值
        for (let i = 0; i < series.length; i++) {
            yValue.push(series[i][1]);
            xValue.push(series[i][0].getTime());
        }
        // 获取最大的y轴刻度值
        var yValueMax = _.max(yValue);
        // y轴的最大值
        var yMax = null;
        // y轴的最大值小于等于5时，设置y坐标轴刻度最大值为5
        if (yValueMax <= 5) {
            yMax = 5;
        }
        var _this = this;
        var option = {
            title: null,
            animation: false,
            toolbox: {
                show: false
            },
            calculable: false,
            tooltip: { // 图表中的提示数据信息
                trigger: 'item',
                formatter: function(params) {
                    var timeText = moment(params && params.data && params.data[0] || Date.now()).format(oplateConsts.DATE_FORMAT);
                    var sum = params && params.data && params.data[1] || '0';
                    return _this.props.tooltip(timeText , sum);
                }
            },
            legend: {
                data: ['']
            },
            grid: {
                x: 50,
                y: 20,
                x2: 30,
                y2: 30,
                borderWidth: 0
            },
            xAxis: [
                {
                    interval: xInterval,
                    type: 'time', // 类型为time，时间轴
                    splitLine: false,
                    splitArea: {
                        show: this.props.isShowSplitArea
                    },
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
                        },
                        formatter: function(d, index) { // 显示的刻度值
                            if(series.length <= 5) {
                                if (xValue.length > index){
                                    return moment(xValue[index]).format(oplateConsts.DATE_FORMAT);
                                }else {
                                    return '';
                                }
                            }

                            if(series.length > 5) {
                                if(d === series[0] && series[0][0] && series[0][0].getTime && series[0][0].getTime() ||
                                    d === series[series.length - 1] && series[series.length - 1][0] && series[series.length - 1][0].getTime && series[series.length - 1][0].getTime()) {
                                    return '';
                                }
                            }
                            return moment(d).format(oplateConsts.DATE_FORMAT);
                        }
                    }
                }
            ],
            yAxis: [
                {
                    minInterval: 1,
                    max: yMax,
                    type: 'value',
                    splitLine: false,
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
            series: [
                {
                    name: '',
                    type: 'bar',
                    barMaxWidth: 40,
                    barMinWidth: 4,
                    data: series,
                    itemStyle: {
                        normal: {
                            color: '#4d96d1'
                        }
                    }
                }
            ]
        };
        var chart = echarts.init(this.refs.echart_wrap,macronsTheme);
        chart.setOption(option);
    },
    render: function() {
        return (
            <div className="echart_wrap" ref="echart_wrap" style={{width: '100%',height: '100%'}}></div>
        );
    }
});

module.exports = TimeSeriesBarchart;
