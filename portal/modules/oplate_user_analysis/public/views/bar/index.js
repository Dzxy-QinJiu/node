/**
 * 线图
 */
var echarts = require("echarts-eefung");
require("./index.less");
var Color = require("color");
var emitter = require("../../utils/emitter");
var Spinner = require("../../../../../components/spinner");
import macronsTheme from "CMP_DIR/echarts-theme/macrons";
var echartsTooltipCssText = require("../../../../../lib/utils/echarts-tooltip-csstext");
var immutable = require("immutable");
const querystring = require("querystring");
import { packageTry } from 'LIB_DIR/func';

var BarChart = React.createClass({
    echartInstance: null,
    getDefaultProps: function() {
        return {
            list: [],
            title: Intl.get("user.analysis.team", "团队统计"),
            width: '100%',
            height: 234,
            legendRight: 'auto',
            resultType: 'loading',
            isShowSplitLine: false,
            isShowSplitArea: false,
            startDate: '',
            endDate: '',
            xAxisInterval: 'auto',//x轴坐标label间隔的控制,默认：自动调整，（0：所有label全部展示）
            xAxisLabelAlign: 'center',//x轴坐标label位置，默认：剧中（居左、右）
            xAxisRotate: 0,//x轴坐标label倾斜的角度（避免重叠时设置）
            /**
             * [
             *  {name : Intl.get("user.analysis.formal", "正式"),key : 'formal'}
             * ]
             */
            legend: [{name: Intl.get("user.analysis.formal", "正式"),key: 'formal'}]
        };
    },
    getLegend: function() {
        return {
            show: true,
            right: this.props.legendRight,
            data: _.pluck(this.props.legend , 'name')
        };
    },
    getCategorys: function() {
        return _.pluck(this.props.list , 'name');
    },
    getSeries: function() {
        var _this = this;
        var series = [];
        _.each(this.props.legend , function(legendInfo,idx) {
            var line = {
                name: legendInfo.name,
                type: 'bar',
                stack: 'stack',
                barMaxWidth: 40,
                barMinWidth: 4,
                data: _.pluck(_this.props.list , legendInfo.key)
            };
            series.push(line);
        });
        return series;
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
                y: 50,
                x2: 30,
                y2: 30,
                borderWidth: 0
            },
            xAxis: [
                {
                    type: 'category',
                    data: this.getCategorys(),
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
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        textStyle: {
                            color: '#939393',
                            align: this.props.xAxisLabelAlign
                        },
                        interval: this.props.xAxisInterval,
                        rotate: this.props.xAxisRotate,
                        formatter: function(text) {
                            if(text === 'unknown') {
                                text = Intl.get("user.unknown", "未知");
                            } else if(!text) {
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
                    splitLine: this.props.isShowSplitLine,
                    splitArea: {
                        show: false
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
    getTooltip: function() {
        var _this = this;
        return {
            show: true,
            extraCssText: echartsTooltipCssText,
            formatter: function(obj) {
                var name = obj.name;
                if(!name) {
                    name = 'null';
                } else if(name === 'unknown') {
                    name = Intl.get("user.unknown", "未知");
                }
                var seriesName = obj.seriesName;
                let timeDesc = Intl.get("operation.report.time.duration","至{time}为止",{time: _this.props.endDate});
                if(_this.props.startDate){
                    if(_this.props.startDate == _this.props.endDate) {
                        timeDesc = _this.props.startDate;
                    }else{
                        timeDesc = _this.props.startDate + Intl.get("common.time.connector","至") + _this.props.endDate;
                    }
                }
                return `<div class="echarts-tooltip">
                            <div class="title">${timeDesc}<span>${name}</span></div>
                            <div>
                                ${seriesName}:<span>${obj.value}</span>
                            </div>
                        </div>`;
            }
        };
    },
    renderChart: function() {
        var _this = this;
        if(this.echartInstance) {
            packageTry(() => {
                this.echartInstance.dispose();
            });
        }
        if(this.props.resultType === 'loading') {
            return;
        }
        this.echartInstance = echarts.init(this.refs.chart,macronsTheme);
        if(!this.props.list.length) {
            if(this.echartInstance) {
                packageTry(() => {
                    this.echartInstance.dispose();
                });
            }
            $(this.refs.chart).html(`<div class='nodata'>${Intl.get("common.no.data","暂无数据")}</div>`);
        } else {
            $(this.refs.chart).find(".nodata").remove();
            var options = this.getEchartOptions();
            this.echartInstance.setOption(options,true);
            const startTime = this.props.startTime, endTime = this.props.endTime;
            if (_this.props.getJumpProps) {
                this.echartInstance.on("click", params => {
                    const jumpProps = _this.props.getJumpProps();
                    let filterVal = params.name;
                    if(jumpProps && jumpProps.query && jumpProps.query.analysis_filter_field == "sales_id"){
                        filterVal = _this.props.getSaleIdByName(params.name);
                    }
                    let query = {
                        start_date: startTime,
                        end_date: endTime,
                        analysis_filter_value: filterVal || ""
                    };
                    if (jumpProps.query) _.extend(query, jumpProps.query);
                    //跳转到用户列表
                    window.open(jumpProps.url + "?" + querystring.stringify(query));
                });
            }
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
