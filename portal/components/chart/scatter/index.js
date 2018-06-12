/**
 * 散点统计图（周、小时、数据）
 */
require('./index.less');
var echarts = require('echarts-eefung');
var immutable = require('immutable');
var Spinner = require('CMP_DIR/spinner');
var echartsTooltipCssText = require('LIB_DIR/utils/echarts-tooltip-csstext');
import macronsTheme from 'CMP_DIR/echarts-theme/macrons';
import timeUtil from 'PUB_DIR/sources/utils/time-format-util';
import { packageTry } from 'LIB_DIR/func';


var ScatterChart = React.createClass({
    echartInstance: null,
    getDefaultProps: function() {
        return {
            list: [],
            width: '100%',
            height: 300,
            title: '',//图表标题
            resultType: '',//loading:加载效果
            dataName: '',//数据名称（tooltip中用）
            dataType: ''//time:时间的需要转换
        };
    },
    renderChart: function() {
        var hours = _.range(24);
        var days = [Intl.get('user.time.sunday', '周日'), Intl.get('user.time.monday', '周一'), Intl.get('user.time.tuesday', '周二'), Intl.get('user.time.wednesday', '周三'), Intl.get('user.time.thursday', '周四'), Intl.get('user.time.friday', '周五'), Intl.get('user.time.saturday', '周六')];
        var data = this.props.list;
        var dataMax = _.maxBy(data, (item) => this.props.dataType === 'time' ? item.time : item.count);
        var countMax = this.props.dataType === 'time' ? dataMax.time : dataMax.count;
        var _this = this;
        if (this.echartInstance) {
            packageTry(() => {
                this.echartInstance.dispose();
            });
        }
        if (this.props.resultType === 'loading') {
            return;
        }
        this.echartInstance = echarts.init(this.refs.chart, macronsTheme);
        var option = {
            tooltip: {
                extraCssText: echartsTooltipCssText,
                formatter: function(obj) {
                    var weekdaysIndex = obj.seriesIndex;
                    var hour = obj.value[0];
                    var data = obj.value[1];
                    if (_this.props.dataType === 'time') {
                        //时间格式的需要将秒数转成x小时x分x秒
                        let timeObj = timeUtil.secondsToHourMinuteSecond(data);
                        data = timeObj.timeDescr;
                    }
                    return `${days[weekdaysIndex]}${hour}${Intl.get('crm.75', '点')}
                         <br/>
                         ${_this.props.dataName}：${data}`;
                }
            },
            title: [],
            singleAxis: [],
            series: []
        };

        echarts.util.each(days, function(day, idx) {
            option.title.push({
                textBaseline: 'middle',
                top: (idx + 0.5) * 100 / 10 + '%',
                text: day,
                textStyle: {
                    fontSize: 12,
                    color: '#62696f',
                    fontStyle: 'normal',
                    fontWeight: 'normal'
                }
            });
            option.singleAxis.push({
                left: 50,
                type: 'category',
                boundaryGap: false,
                axisLine: {
                    lineStyle: {
                        color: '#C0C0C0',
                        width: 0.5
                    }
                },
                axisTick: {
                    lineStyle: {
                        color: '#C0C0C0',
                        width: 0.5
                    }
                },
                axisLabel: {
                    show: day === Intl.get('user.time.saturday', '周六') ? true : false,
                    margin: 16,
                    textStyle: {
                        fontSize: 12,
                        color: '#62696f',
                        fontStyle: 'normal',
                        fontWeight: 'normal'
                    }
                },
                data: hours,
                top: (idx * 100 / 10 + 5) + '%',
                height: (100 / 10 - 10) + '%'
            });
            option.series.push({
                singleAxisIndex: idx,
                coordinateSystem: 'singleAxis',
                type: 'scatter',
                data: [],
                symbolSize: function(dataItem) {
                    if (countMax === 0) {
                        return dataItem[1];
                    }
                    return dataItem[1] * (30 / countMax);
                }
            });

        });

        echarts.util.each(data, (dataItem) => {
            let value = this.props.dataType === 'time' ? dataItem.time : dataItem.count;
            option.series[dataItem.week].data.push([dataItem.hour, value]);
        });
        this.echartInstance.setOption(option);

        if (!data.length) {
            if (this.echartInstance) {
                packageTry(() => {
                    this.echartInstance.dispose();
                });
                
            }
            $(this.refs.chart).html(`<div class='nodata'>${Intl.get('common.no.data', '暂无数据')}</div>`);
        } else {
            $(this.refs.chart).find('.nodata').remove();
        }
    },

    componentDidMount: function() {
        this.renderChart();
    },

    componentDidUpdate: function(prevProps) {
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

    render: function() {
        return (
            <div className="analysis_timerange_bar_chart" ref="wrap">
                {this.props.resultType === 'loading' ?
                    (
                        <div className="loadwrap" style={{height: this.props.height}}>
                            <Spinner/>
                        </div>
                    ) : (
                        <div>
                            <div ref="chart"
                                style={{width: this.props.width, height: this.props.height}}
                                className="chart"
                                data-title={this.props.title}>
                            </div>
                        </div>
                    )
                }
            </div>
        );
    }
});

module.exports = ScatterChart;