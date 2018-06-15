/**
 * 线图
 */
var echarts = require('echarts-eefung');
require('./index.less');
//各种颜色
const Spinner = require('../../spinner');
var immutable = require('immutable');
var echartsTooltipCssText = require('../../../lib/utils/echarts-tooltip-csstext');
//macrons主题
import macronsTheme from 'CMP_DIR/echarts-theme/macrons';
//时间格式化格式1
const DATE_FORMAT = oplateConsts.DATE_FORMAT;
//时间格式化格式2
const DATE_FORMAT_WITHOUT_DAY = oplateConsts.DATE_YEAR_MONTH_FORMAT;
import { packageTry } from 'LIB_DIR/func';

var AreaLine = React.createClass({
    echartInstance: null,
    //开始、结束时间不在同一年
    isBiggerThanYear: false,
    getDefaultProps: function() {
        return {
            list: [],
            title: Intl.get('operation.report.activity', '活跃度'),
            width: '100%',
            height: 240,
            resultType: 'loading',
            //日活、周活、月活
            dateRange: '',
            //时间范围改变的回调函数
            onDataRangeChange: function(){},
            //开始查询时间
            startTime: new Date().getTime(),
            //结束查询时间
            endTime: new Date().getTime()
        };

    },
    getInitialState: function() {
        return {
            dateRange: this.props.dateRange
        };
    },
    componentWillReceiveProps: function(nextProps) {
        if(this.state.dateRange !== nextProps.dateRange) {
            this.setState({
                dateRange: nextProps.dateRange
            });
        }
    },
    getCategorys: function() {
        var items = this.props.list || [];
        if(!items.length) {
            return items;
        }
        items = _.find(items , (item) => item.datas.length > 0);
        items = items.datas;
        var startMoment = moment(new Date(+items[0].timestamp));
        var endMoment = moment(new Date(+items[items.length - 1].timestamp));
        var biggerThanYear = startMoment.format('YYYY') !== endMoment.format('YYYY');
        if(biggerThanYear) {
            this.isBiggerThanYear = true;
        }
        var times = items.map(function(obj) {
            if(biggerThanYear) {
                return moment(new Date(+obj.timestamp)).format(oplateConsts.DATE_YEAR_MONTH_FORMAT);
            } else {
                return moment(new Date(+obj.timestamp)).format(oplateConsts.DATE_MONTH_DAY_FORMAT);
            }
        });
        return times;
    },
    getSeries: function() {
        var _this = this;
        //普通线
        function getLine(name,list) {
            return {
                symbol: 'circle',
                showAllSymbol: true,
                name: name,
                type: 'line',
                data: _.map(list , 'active')
            };
        }
        var series = [];
        _.each(_this.props.list , function(line) {
            series.push(getLine(line.userName,line.datas));
        });
        return series;
    },
    getTooltip: function() {
        var _this = this;
        return {
            trigger: 'axis',
            axisPointer: {
                lineStyle: {
                    color: '#bdd3e4',
                    width: 1
                }
            },
            position: function(mousePointer,params,tooltipDom) {
                var chartWidth = $(_this.refs.chart).width();
                var chartHeight = $(_this.refs.chart).height();
                var tooltipDomWidth = $(tooltipDom).width();
                var tooltipDomHeight = $(tooltipDom).height();
                var xPos = mousePointer[0] - Math.floor(tooltipDomWidth / 2);
                if(xPos < 0) {
                    xPos = 0;
                } else if((xPos + tooltipDomWidth) > chartWidth) {
                    xPos = chartWidth - tooltipDomWidth - 10;
                }
                return [
                    xPos,
                    Math.floor((chartHeight - tooltipDomHeight) / 2) - 20,
                ];
            },
            formatter: function(lines) {
                var index = _.findIndex(_this.props.list , (item) => item.datas.length > 0);
                var idx = lines[index].dataIndex;
                var time = _this.props.list[index].datas[idx].timestamp;
                var dateRange = _this.state.dateRange;
                var timeStr = '';
                if(dateRange === 'daily') {
                    timeStr = moment(new Date(time)).format(DATE_FORMAT);
                } else if(dateRange === 'monthly') {
                    timeStr = moment(new Date(time)).format(DATE_FORMAT_WITHOUT_DAY);
                } else {
                    var weekStartText, weekEndText;
                    var startTime = _this.props.startTime;
                    var endTime = _this.props.endTime;
                    if(idx === (_this.props.list.length - 1) && endTime !== time) {
                        weekStartText = moment(new Date(time)).format(DATE_FORMAT);
                        weekEndText = moment(new Date(+endTime)).format(DATE_FORMAT);
                    } else {
                        weekStartText = moment(new Date(time)).format(DATE_FORMAT);
                        weekEndText = moment(new Date(time)).add(7,'days').format(DATE_FORMAT);
                    }
                    timeStr = `${weekStartText} - ${weekEndText}`;
                }
                var tableHtmlList = [];
                tableHtmlList.push('<div class="activation_tooltip custom-scrollbar">');
                tableHtmlList.push(`<p class="title">${timeStr}</p>`);
                tableHtmlList.push(`<table class="table">
                                        <thead>
                                            <tr>`);
                if(lines.length > 1) {
                    tableHtmlList.push(`<th>${Intl.get('common.definition', '名称')}</th>`);
                }


                tableHtmlList.push(`
                           <th>${Intl.get('operation.report.active.num', '活跃数(个)')}</th>
                           <th>${Intl.get('operation.report.total.count', '总数(个)')}</th>
                           <th>${Intl.get('operation.report.activity.unit', '活跃度(%)')}</th>
                        </tr>
                    </thead>
              `);
                tableHtmlList.push('<tbody>');
                _this.props.list.map(function(line) {
                    tableHtmlList.push('<tr>');
                    if(lines.length > 1) {
                        tableHtmlList.push(`<td>${line.userName}</td>`);
                    }
                    var active = line.datas[idx] && line.datas[idx].active || 0;
                    var total = line.datas[idx] && line.datas[idx].total || 0;
                    var percent = line.datas[idx] && line.datas[idx].percent || 0;
                    tableHtmlList.push(`<td class="number_text">${active}</td>
                        <td class="number_text">${total}</td>
                        <td class="number_text">${(percent * 100).toFixed(2)}</td>
                    </tr>`);
                });
                tableHtmlList.push('</tbody></table></div>');
                return tableHtmlList.join('');
            },
            extraCssText: echartsTooltipCssText
        };
    },
    getEchartOptions: function() {
        var _this = this;
        let series = this.getSeries();
        let data = series[0] && series[0].data || [];
        let yMax = 0, max = null;
        let yInterval = null;
        if (data.length) {
            yMax = _.max(data);
        }
        // 避免y轴上出现小数
        if (yMax <= 5) {
            yInterval = 1;
            max = 5;
        }
        var options = {
            animation: false,
            title: null,
            legend: null,
            grid: {
                x: 50,
                y: 35,
                x2: 40,
                borderWidth: 0
            },
            xAxis: [
                {
                    type: 'category',
                    splitArea: {
                        show: false
                    },
                    splitLine: false,
                    axisLine: {
                        lineStyle: {
                            width: 1,
                            color: '#c4cacf'
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
                    },
                    data: this.getCategorys()
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    interval: yInterval,
                    max: max,
                    name: Intl.get('operation.report.user.count', '用户数'),
                    position: 'left',
                    splitArea: {
                        show: false
                    },
                    splitLine: false,
                    axisLine: {
                        lineStyle: {
                            width: 1,
                            color: '#bec5cb'
                        }
                    },
                    axisLabel: {
                        textStyle: {
                            color: '#939393'
                        }
                    }
                },
                {
                    type: 'value',
                    position: 'right',
                    name: Intl.get('operation.report.active', '活跃率'),
                    min: 0,
                    max: 100,
                    splitArea: {
                        show: false
                    },
                    splitLine: false,
                    splitNumber: 1,
                    axisLine: {
                        lineStyle: {
                            width: 1,
                            color: '#bec5cb'
                        }
                    },
                    axisLabel: {
                        textStyle: {
                            color: '#939393'
                        }
                    }
                }
            ],
            tooltip: _this.getTooltip(),
            toolbox: {
                show: false
            },
            calculable: false,
            series: this.getSeries()
        };
        return options;
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

        var isNoData = false;
        if(!this.props.list.length) {
            isNoData = true;
        } else {
            isNoData = _.every(this.props.list , (item) => item.datas.length === 0);
        }
        if(isNoData) {
            if (this.echartInstance) {
                packageTry(() => {
                    this.echartInstance.dispose();
                });
            }
            $(this.refs.chart).html(`<div class='nodata'>${Intl.get('common.no.data','暂无数据')}</div>`);
        } else {
            $(this.refs.chart).find('.nodata').remove();
            this.echartInstance = echarts.init(this.refs.chart, macronsTheme);
            var options = this.getEchartOptions();
            this.echartInstance.setOption(options,true);
        }
    },
    windowResize: function() {
        clearTimeout(this.resizeTimeout);
        var _this = this;
        this.resizeTimeout = setTimeout(() => {
            this.renderChart();
        });
    },

    componentDidMount: function() {
        this.renderChart();
        $(window).on('resize', this.windowResize);
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
        $(window).off('resize', this.windowResize);
        if(this.echartInstance) {
            packageTry(() => {
                this.echartInstance.dispose();
            });
            this.echartInstance = null;
        }
    },
    onDataRangeChange: function(event) {
        this.setState({
            dateRange: event.target.value
        });
        this.props.onDataRangeChange(event.target.value);
    },
    render: function() {
        var _this = this;
        return (
            <div>
                <div className="arealine-chart" ref="wrap">
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
            </div>
        );
    }
});

module.exports = AreaLine;