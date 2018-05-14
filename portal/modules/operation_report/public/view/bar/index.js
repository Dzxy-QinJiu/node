/**
 * 线图
 */
var echarts = require("echarts-eefung");
require("./index.less");
var Color = require("color");
var Spinner = require("../../../../../components/spinner/index");
var echartsTooltipCssText = require("../../../../../lib/utils/echarts-tooltip-csstext");
var immutable = require("immutable");
var COLORSINGLE = '#1790cf';
var COLORMULTIPLE = ['#1790cf', '#1bb2d8'];
//macrons主题
import macronsTheme from "CMP_DIR/echarts-theme/macrons";
import { packageTry } from 'LIB_DIR/func';

var BarChart = React.createClass({
    echartInstance: null,
    getDefaultProps: function () {
        return {
            list: [],
            title: Intl.get("operation.report.app.login.statistic", "各应用登录统计"),
            width: '100%',
            height: 214,
            resultType: 'loading',
            startDate: '',
            endDate: '',
            /**
             * [
             *  {name : Intl.get("user.login.times", "登录次数"),key : 'count'}
             * ]
             */
            legend: null

        };
    },
    getLegend: function () {
        if (!this.props.legend) {
            return {
                show: false,
                data: []
            };
        }
        return {
            show: false,
            data: _.pluck(this.props.legend, 'name')
        };
    },
    getCategorys: function () {
        return _.pluck(this.props.list, 'appName');
    },
    getSeries: function () {
        var _this = this;
        var series = [];
        _.each(this.props.legend, function (legendInfo, idx) {
            var currentColor = COLORMULTIPLE[idx];
            var line = {
                name: legendInfo.name,
                type: 'bar',
                barMaxWidth: 40,
                barMinWidth: 4,
                stack: 'stack',
                data: _.pluck(_this.props.list, legendInfo.key),
                itemStyle: {
                    normal: {
                        color: currentColor,
                        label: {show: true, position: 'top'}
                    }
                }
            };
            series.push(line);
        });
        return series;
    },
    getTooltip: function () {
        var _this = this;
        return {
            trigger: 'item',
            enterable: true,
            extraCssText: echartsTooltipCssText,
            formatter: function (obj) {
                var value = obj.value;
                var name = obj.name;

                var target = _.find(_this.props.list, function (obj) {
                    return name === obj.appName;
                });

                var list = [];

                var currentTotal = 0, colorList;
                _this.props.legend.map(function (legendInfo, idx) {
                    var value = target[legendInfo.key];
                    colorList = COLORMULTIPLE;
                    var color = colorList[idx];
                    currentTotal += value;
                    list.push(`<li><span style="background:${color}"></span><i>${legendInfo.name}</i><i class="number_text">${value}</i></li>`);
                });
                if (_this.props.legend && _this.props.legend.length > 1) {
                    list.unshift(`<li><span style="background:${colorList[0]}"><b style="background:${colorList[1]}"></b></span><i><ReactIntl.FormattedMessage id="operation.report.total.num" defaultMessage="总数" /></i><i class="number_text">${currentTotal}</i></li>`);
                }

                var displayName = name;
                if (!name) {
                    displayName = 'null';
                } else if (name === 'unknown') {
                    displayName = Intl.get("user.unknown", "未知");
                }

                let timeDesc = Intl.get("operation.report.time.duration", "至{time}为止", {time: _this.props.endDate});
                if (_this.props.startDate) {
                    if (_this.props.startDate == _this.props.endDate) {
                        timeDesc = _this.props.startDate;
                    } else {
                        timeDesc = _this.props.startDate + Intl.get("common.time.connector", "至") + _this.props.endDate;
                    }
                }
                return `<div class="echarts-tooltip">
                            <div class="title">${timeDesc}<span>${displayName}</span></div>
                            <ul class="list-unstyled">
                                ${list.join('')}
                            </ul>
                        </div>`;
            }
        };
    },
    getEchartOptions: function () {
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
                y2: 30,
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
                        textStyle: {
                            color: '#939393',
                            align: 'center'
                        },
                        formatter: function (text) {
                            if (text === 'unknown') {
                                text = Intl.get("user.unknown", "未知");
                            } else if (!text) {
                                text = 'null';
                            }
                            return text;
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
    renderChart: function () {
        if (this.echartInstance) {
            packageTry(() => {
                _this.echartInstance.dispose();
            });
            
        }
        if (this.props.resultType === 'loading') {
            return;
        }
        var _this = this;
        this.echartInstance = echarts.init(this.refs.chart, macronsTheme);
        var options = this.getEchartOptions();
        this.echartInstance.setOption(options, true);
        if (!this.props.list.length) {
            if (this.echartInstance) {
                packageTry(() => {
                    _this.echartInstance.dispose();
                });
            }
            $(this.refs.chart).html(`<div class='nodata'>${Intl.get("common.no.data", "暂无数据")} </div>`);
        } else {
            $(this.refs.chart).find(".nodata").remove();
        }
    },
    componentDidMount: function () {
        this.renderChart();
    },
    componentDidUpdate: function (prevProps) {
        if (
            this.props.list.length &&
            prevProps.list.length &&
            immutable.is(this.props.list, prevProps.list) &&
            this.props.width === prevProps.width
        ) {
            return;
        }
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
    render: function () {
        var _this = this;
        return (
            <div className="analysis_bar_chart" ref="wrap">
                {this.props.resultType === 'loading' ?
                    (
                        <div className="loadwrap" style={{height:this.props.height}}>
                            <Spinner/>
                        </div>
                    ) :
                    (
                        <div>
                            <div ref="chart" style={{width:this.props.width,height:this.props.height}} className="chart"
                                 data-title={this.props.title}></div>
                        </div>
                    )
                }
            </div>
        );
    }
});

module.exports = BarChart;