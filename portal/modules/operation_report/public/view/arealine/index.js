/**
 * 线图
 */
var echarts = require("echarts-eefung");
require("./index.less");
import {Icon,Radio} from "antd";
//各种颜色
var colors = require("../../../../oplate_user_analysis/public/utils/colors");
var Color = require("color");
var Spinner = require("../../../../../components/spinner");
var immutable = require("immutable");
var echartsTooltipCssText = require("../../../../../lib/utils/echarts-tooltip-csstext");
var RadioGroup = Radio.Group;
//macrons主题
import macronsTheme from "CMP_DIR/echarts-theme/macrons";

//时间格式化格式1
const DATE_FORMAT = oplateConsts.DATE_FORMAT;
//时间格式化格式2
const DATE_FORMAT_WITHOUT_DAY = oplateConsts.DATE_YEAR_MONTH_FORMAT;
//布局使用的常量
var LAYOUT = {
    //单个元素的高度
    SINGLE_ITEM_HEIGHT: 29,
    //图例的宽度
    LEGEND_WIDTH: 88
};

var AreaLineChart = React.createClass({
    echartInstance: null,
    //开始、结束时间不在同一年
    isBiggerThanYear: false,
    //滚动条的scrollTop
    scrollTop: 0,
    getDefaultProps: function () {
        return {
            list: [],
            title: Intl.get("operation.report.activity", "活跃度"),
            width: '100%',
            height: 214,
            resultType: 'loading',
            //日活、周活、月活
            dataRange: '',
            //时间范围改变的回调函数
            onDataRangeChange: function () {
            },
            //开始查询时间
            startTime: new Date().getTime(),
            //结束查询时间
            endTime: new Date().getTime()
        };

    },
    getInitialState: function () {
        return {
            dataRange: this.props.dataRange,
            topIconEnable: false,
            bottomIconEnable: true
        };
    },
    componentWillReceiveProps: function (nextProps) {
        if (this.state.dataRange !== nextProps.dataRange) {
            this.setState({
                dataRange: nextProps.dataRange
            });
        }
    },
    getCategorys: function () {
        var items = this.props.list || [];
        if (!items.length) {
            return items;
        }
        items = _.find(items, (item) => item.datas.length > 0);
        items = items.datas;
        var startMoment = moment(new Date(+items[0].timestamp));
        var endMoment = moment(new Date(+items[items.length - 1].timestamp));
        var biggerThanYear = startMoment.format("YYYY") != endMoment.format("YYYY");
        if (biggerThanYear) {
            this.isBiggerThanYear = true;
        }
        var times = items.map(function (obj) {
            if (biggerThanYear) {
                return moment(new Date(+obj.timestamp)).format(oplateConsts.DATE_YEAR_MONTH_FORMAT);
            } else {
                return moment(new Date(+obj.timestamp)).format(oplateConsts.DATE_MONTH_DAY_FORMAT);
            }
        });
        return times;
    },
    getLabel: function() {
        return {
            normal: {
                show: typeof this.props.showLabel === "boolean"? this.props.showLabel : false,
                position: "top",
                formatter: this.props.labelFormatter || "{c}"
            }
        };
    },
    getSeries: function () {
        var _this = this;
        //普通线
        function getLine(name, list, color) {
            return {
                symbol: "circle",
                showAllSymbol: true,
                name: name,
                type: 'line',
                label: _this.getLabel(),
                itemStyle: {
                    normal: {
                        color: color
                    },
                    emphasis: {
                        color: color
                    }
                },
                data: _.pluck(list, "active")
            };
        }

        var series = [], colorIdx = 0;
        _.each(_this.props.list, function (line) {
            var color = colors[colorIdx++];
            if (!color) {
                colorIdx = 0;
                color = colors[colorIdx++];
            }
            series.push(getLine(line.appName, line.datas, color));
        });
        return series;
    },
    getTooltip: function () {
        var _this = this;
        return {
            trigger: 'axis',
            axisPointer: {
                lineStyle: {
                    color: '#bdd3e4',
                    width: 1
                }
            },
            position: function (mousePointer, params, tooltipDom) {
                var chartWidth = $(_this.refs.chart).width();
                var chartHeight = $(_this.refs.chart).height();
                var tooltipDomWidth = $(tooltipDom).width();
                var tooltipDomHeight = $(tooltipDom).height();
                var xPos = mousePointer[0] - Math.floor(tooltipDomWidth / 2);
                if (xPos < 0) {
                    xPos = 0;
                } else if ((xPos + tooltipDomWidth) > chartWidth) {
                    xPos = chartWidth - tooltipDomWidth - 10;
                }
                return [
                    xPos,
                    Math.floor((chartHeight - tooltipDomHeight) / 2) - 20,
                ];
            },
            formatter: function (lines) {
                var index = _.findIndex(_this.props.list, (item) => item.datas.length > 0);
                var idx = lines[index].dataIndex;
                var time = _this.props.list[index].datas[idx].timestamp;
                var dataRange = _this.state.dataRange;
                var timeStr = '';
                if (dataRange === 'daily') {
                    timeStr = moment(new Date(time)).format(DATE_FORMAT);
                } else if (dataRange === 'monthly') {
                    timeStr = moment(new Date(time)).format(DATE_FORMAT_WITHOUT_DAY);
                } else {
                    var weekStartText, weekEndText;
                    var startTime = _this.props.startTime;
                    var endTime = _this.props.endTime;
                    if (idx === (_this.props.list.length - 1) && endTime !== time) {
                        weekStartText = moment(new Date(time)).format(DATE_FORMAT);
                        weekEndText = moment(new Date(+endTime)).format(DATE_FORMAT);
                    } else {
                        weekStartText = moment(new Date(time)).format(DATE_FORMAT);
                        weekEndText = moment(new Date(time)).add(7, "days").format(DATE_FORMAT);
                    }
                    timeStr = `${weekStartText} ${Intl.get("common.time.connector","至")} ${weekEndText}`;
                }
                var tableHtmlList = [];
                tableHtmlList.push(`<div class="activation_tooltip custom-scrollbar">`);
                tableHtmlList.push(`<p class="title">${timeStr}</p>`);
                tableHtmlList.push(`<table class="table">
                                        <thead>
                                            <tr>`);
                tableHtmlList.push(`
                            <th>${Intl.get("common.definition", "名称")}</th>
                            <th>${Intl.get("operation.report.active.num", "活跃数(个)")}</th>
                            <th>${Intl.get("operation.report.total.count", "总数(个)")}</th>
                            <th>${Intl.get("operation.report.activity.unit", "活跃度(%)")}</th>
                        </tr>
                    </thead>
              `);
                tableHtmlList.push(`<tbody>`);
                _this.props.list.map(function (line) {
                    tableHtmlList.push(`<tr>`);
                    var active = line.datas[idx] && line.datas[idx].active || 0;
                    var total = line.datas[idx] && line.datas[idx].total || 0;
                    var percent = line.datas[idx] && line.datas[idx].percent || 0;
                    tableHtmlList.push(`<td>${line.appName}</td>
                        <td class="number_text">${active}</td>
                        <td class="number_text">${total}</td>
                        <td class="number_text">${(percent * 100).toFixed(2)}</td>
                    </tr>`);
                });
                tableHtmlList.push(`</tbody></table></div>`);
                return tableHtmlList.join('');
            },
            extraCssText: echartsTooltipCssText
        };
    },
    getEchartOptions: function () {
        var _this = this;
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
                    type: "category",
                    splitLine: {
                        lineStyle: {
                            color: '#f2f2f2'
                        }
                    },
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
                    type: "value",
                    name: Intl.get("operation.report.user.count", "用户数"),
                    position: 'left',
                    splitLine: {
                        lineStyle: {
                            color: '#f2f2f2'
                        }
                    },
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
                    type: "value",
                    position: 'right',
                    name: Intl.get("operation.report.active", "活跃率"),
                    min: 0,
                    max: 100,
                    splitLine: {
                        lineStyle: {
                            color: '#f2f2f2'
                        }
                    },
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
    renderChart: function () {
        var _this = this;
        if (this.echartInstance) {
            try {
                _this.echartInstance.dispose()
            } catch (e) {
            }
        }
        if (this.props.resultType === 'loading') {
            return;
        }
        var isNoData = false;
        if (!this.props.list.length) {
            isNoData = true;
        } else {
            isNoData = _.every(this.props.list, (item) => item.datas.length === 0);
        }
        if (isNoData) {
            if (this.echartInstance) {
                try {
                    _this.echartInstance.dispose()
                } catch (e) {
                }
            }
            $(this.refs.chart).html(`<div class='nodata'>${Intl.get("common.no.data", "暂无数据")}</div>`);
        } else {
            $(this.refs.chart).find(".nodata").remove();
            this.echartInstance = echarts.init(this.refs.chart, macronsTheme);
            var options = this.getEchartOptions();
            this.echartInstance.setOption(options, true);
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
            try {
                this.echartInstance.dispose()
            } catch (e) {
            }
            this.echartInstance = null;
        }
    },
    onDataRangeChange: function (event) {
        this.setState({
            dataRange: event.target.value
        });
        this.props.onDataRangeChange(event.target.value);
    },
    //处理向上滚动
    handleScrollUp: function () {
        //scrollTop减去某个值
        this.scrollTop -= LAYOUT.SINGLE_ITEM_HEIGHT;
        //默认认为顶部的方向按钮能用
        var topIconEnable = true;
        //滚动边界处理
        if (this.scrollTop <= 0) {
            this.scrollTop = 0;
            topIconEnable = false;
        }
        //对dom的scrollTop进行赋值
        this.refs.legendWrap.scrollTop = this.scrollTop;
        this.setState({
            topIconEnable: topIconEnable,
            bottomIconEnable: true
        });
    },
    //处理向下滚动
    handleScrollDown: function () {
        //获取最大滚动高度
        var maxScrollHeight = this.refs.legendWrap.scrollHeight - $(this.refs.legendWrap).height();
        //滚动高度增加
        this.scrollTop += LAYOUT.SINGLE_ITEM_HEIGHT;
        var bottomIconEnable = true;
        //进行临界判断
        if (this.scrollTop >= maxScrollHeight) {
            this.scrollTop = maxScrollHeight;
            bottomIconEnable = false;
        }
        this.refs.legendWrap.scrollTop = this.scrollTop;
        //设置按钮可用状态
        this.setState({
            topIconEnable: true,
            bottomIconEnable: bottomIconEnable
        });
    },
    onMouseWheel: function (event) {
        event.preventDefault();
        if (event.deltaY > 0) {
            this.handleScrollDown();
        } else {
            this.handleScrollUp();
        }
    },
    legendMouseTimeout: null,
    legendMouseenter: function (obj, idx, event) {
        clearTimeout(this.legendMouseTimeout);
        var _this = this;
        this.legendMouseTimeout = setTimeout(function () {
            var options = _this.getEchartOptions();
            var series = options.series[idx];
            var oldColor = series.itemStyle.normal.color;
            var newColor = Color(oldColor).darken(0.3).hexString();
            series.itemStyle.normal.color = newColor;
            _this.echartInstance.clear();
            _this.echartInstance.setOption(options);
        }, 300);
    },
    legendMouseleave: function (obj, idx, event) {
        clearTimeout(this.legendMouseTimeout);
        var _this = this;
        this.legendMouseTimeout = setTimeout(function () {
            var options = _this.getEchartOptions();
            _this.echartInstance.clear();
            _this.echartInstance.setOption(options);
        }, 300);
    },
    renderLegend: function () {
        var _this = this;
        var colorIdx = 0;
        if (!this.props.list.length) {
            return null;
        }
        return (
            <div ref="legend" className="legend">
                <Icon type="caret-up" style={{visibility:this.state.topIconEnable ? 'visible' : 'hidden'}}
                      onClick={this.handleScrollUp}/>
                <ul className="list-unstyled" ref="legendWrap" onWheel={this.onMouseWheel}>
                    {
                        this.props.list.map(function (obj, idx) {
                            var color = colors[colorIdx++];
                            if (!color) {
                                colorIdx = 0;
                                color = colors[colorIdx++];
                            }
                            return (
                                <li
                                    key={obj.appName}
                                    onMouseEnter={_this.legendMouseenter.bind(_this,obj,idx)}
                                    onMouseLeave={_this.legendMouseleave.bind(_this,obj,idx)}
                                >
                                    <em style={{background:color}}></em>
                                    <span title={obj.appName}>{obj.appName}</span>
                                </li>
                            );
                        })
                    }
                </ul>
                <Icon type="caret-down" style={{visibility:this.state.bottomIconEnable ? 'visible' : 'hidden'}}
                      onClick={this.handleScrollDown}/>
            </div>
        );
    },
    render: function () {
        //宽度需要减去“图例”的宽度
        var chartWidth = (this.props.width || $(this.refs.wrap).width()) - LAYOUT.LEGEND_WIDTH;
        return (
            <div>
                <div className="title">
                    {this.props.title}
                    <div style={{float:'right'}}>
                        <RadioGroup value={this.state.dataRange} onChange={this.onDataRangeChange}>
                            <Radio value="daily" key="daily"><ReactIntl.FormattedMessage
                                id="operation.report.day.active" defaultMessage="日活"/></Radio>
                            <Radio value="weekly" key="weekly"><ReactIntl.FormattedMessage
                                id="operation.report.week.active" defaultMessage="周活"/></Radio>
                            <Radio value="monthly" key="monthly"><ReactIntl.FormattedMessage
                                id="operation.report.month.active" defaultMessage="月活"/></Radio>
                        </RadioGroup>
                    </div>
                </div>
                <div className="analysis_active_arealine_chart" ref="wrap">
                    {this.props.resultType === 'loading' ?
                        (
                            <div className="loadwrap" style={{height:this.props.height}}>
                                <Spinner/>
                            </div>
                        ) :
                        (
                            <div>
                                <div ref="chart" style={{width:chartWidth,height:this.props.height}}
                                     className="chart" data-title={this.props.title}></div>
                                {this.renderLegend()}
                            </div>
                        )
                    }
                </div>
            </div>
        );
    }
});

module.exports = AreaLineChart;