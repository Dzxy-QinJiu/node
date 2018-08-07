/**
 * 散点图选项生成器
 */
var echartsTooltipCssText = require('LIB_DIR/utils/echarts-tooltip-csstext');
import timeUtil from 'PUB_DIR/sources/utils/time-format-util';
const extend = require('extend');

export default class ScatterOptionGenerator {
    constructor(props) {
        const defaultProps = {
            dataName: '',//数据名称（tooltip中用）
            dataType: ''//time:时间的需要转换
        };

        props = extend(true, {}, defaultProps, props);

        this.props = props;
    }

    getEchartOptions() {
        var hours = _.range(24);
        var days = [Intl.get('user.time.sunday', '周日'), Intl.get('user.time.monday', '周一'), Intl.get('user.time.tuesday', '周二'), Intl.get('user.time.wednesday', '周三'), Intl.get('user.time.thursday', '周四'), Intl.get('user.time.friday', '周五'), Intl.get('user.time.saturday', '周六')];
        var data = this.props.list;
        var dataMax = _.maxBy(data, (item) => this.props.dataType === 'time' ? item.time : item.count);
        var countMax = 0;
        if (dataMax) {
            countMax = this.props.dataType === 'time' ? dataMax.time : dataMax.count;
        }
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

        _.each(days, function(day, idx) {
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

        _.each(data, (dataItem) => {
            let value = this.props.dataType === 'time' ? dataItem.time : dataItem.count;
            option.series[dataItem.week].data.push([dataItem.hour, value]);
        });
        return option;
    }
}
