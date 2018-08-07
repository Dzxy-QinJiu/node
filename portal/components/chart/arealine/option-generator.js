/**
 * 选项生成器
 */
var echartsTooltipCssText = require('LIB_DIR/utils/echarts-tooltip-csstext');
//时间格式化格式1
const DATE_FORMAT = oplateConsts.DATE_FORMAT;
//时间格式化格式2
const DATE_FORMAT_WITHOUT_DAY = oplateConsts.DATE_YEAR_MONTH_FORMAT;

export default class AreaLineOptionGenerator {
    constructor(props) {
        this.props = props;
    }

    getCategorys() {
        var items = this.props.list || [];
        if(!items.length) {
            return items;
        }
        items = _.find(items , item => item.datas.length > 0);

        if (!items) return [];
        
        items = items.datas;
        var startMoment = moment(new Date(+items[0].timestamp));
        var endMoment = moment(new Date(+items[items.length - 1].timestamp));
        var biggerThanYear = startMoment.format('YYYY') !== endMoment.format('YYYY');
        var times = items.map(function(obj) {
            if(biggerThanYear) {
                return moment(new Date(+obj.timestamp)).format(oplateConsts.DATE_YEAR_MONTH_FORMAT);
            } else {
                return moment(new Date(+obj.timestamp)).format(oplateConsts.DATE_MONTH_DAY_FORMAT);
            }
        });
        return times;
    }

    getSeries() {
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
    }

    getTooltip() {
        var _this = this;
        return {
            trigger: 'axis',
            axisPointer: {
                lineStyle: {
                    color: '#bdd3e4',
                    width: 1
                }
            },
            position(mousePointer,params,tooltipDom) {
                var chartWidth = _this.props.width;
                var chartHeight = _this.props.height;
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
            formatter(lines) {
                var index = _.findIndex(_this.props.list , (item) => item.datas.length > 0);
                if (index === -1) {
                    return;
                }
                var idx = lines[index].dataIndex;
                var time = _this.props.list[index].datas[idx].timestamp;
                var dateRange = _this.props.dateRange;
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
    }

    getEchartOptions() {
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
    }
}
