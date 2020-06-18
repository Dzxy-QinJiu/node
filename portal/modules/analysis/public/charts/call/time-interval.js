/**
 * 通话时段统计
 */

import timeUtil from 'PUB_DIR/sources/utils/time-format-util';
import { Radio } from 'antd';
const RadioGroup = Radio.Group;

//分段数，即将整个绘图区域划分成几段
//因为最后一个轴线下面要显示小时数，所以让分段数比实际的轴线数多出一个
//以防止小时数显示不全
//实际的轴线数是7，分段数就是8
const SEGMENT_COUNT = 8;

//轴线标题的垂直方向偏移比
const TITLE_VERTICAL_OFFSET_PERCENT = 8;

//轴线的垂直方向偏移比
const AXIS_VERTICAL_OFFSET_PERCENT = 10;

//轴线上的图形的垂直方向偏移比
const SYMBOL_VERTICAL_OFFSET_PERCENT = 13;

const hours = _.range(24);
const days = [Intl.get('user.time.sunday', '周日'), Intl.get('user.time.monday', '周一'), Intl.get('user.time.tuesday', '周二'), Intl.get('user.time.wednesday', '周三'), Intl.get('user.time.thursday', '周四'), Intl.get('user.time.friday', '周五'), Intl.get('user.time.saturday', '周六')];

export function getCallTimeIntervalChart() {
    return {
        title: Intl.get('call.record.interval', '通话时段统计'),
        chartType: 'scatter',
        //数据显示类型，是数量还是时长
        dataType: 'count',
        url: '/rest/analysis/callrecord/v1/callrecord/statistics/sum/count',
        conditions: [{
            name: 'filter_phone',
            value: false 
        }, {
            name: 'filter_invalid_phone',
            value: false 
        }],
        dataField: 'list',
        processData: (data, chart, analysisInstance) => {
            _.set(chart, 'cardContainer.props.subTitle', renderSwitch(chart, analysisInstance));

            return _.filter(data, item => item.count > 0);
        },
        processCsvData: (chart, option) => {
            let csvData = [];

            let thead = _.get(option, 'singleAxis[0].data', []);
            thead = _.map(thead, item => item + Intl.get('crm.75', '点'));
            thead.unshift('');

            csvData.push(thead);

            //数据类型：数量/时长
            let dataTypeText;

            if (chart.dataType === 'count') {
                dataTypeText = Intl.get('common.app.count', '数量');
            } else {
                dataTypeText = Intl.get('user.duration', '时长');

            }

            _.each(option.title, (item, index) => {
                let tr = [];

                const rowTitle = item.text + '(' + dataTypeText + ')';

                tr.push(rowTitle);

                const serie = option.series[index];

                _.each(serie.data, item => {
                    tr.push(item[1]);
                });

                csvData.push(tr);
            });

            return csvData;
        },
        option: getOption(),
        yAxisLabels: days,
        xAxisLabels: hours,
    };

    //渲染切换按钮
    function renderSwitch(chart, analysisInstance) {
        return (
            <RadioGroup defaultValue='count' onChange={handleRadioChange.bind(this, chart, analysisInstance)}>
                <Radio value="count">{Intl.get('sales.home.call.cout', '通话数量')}</Radio>
                <Radio value="duration">{Intl.get('call.record.call.duration', '通话时长')}</Radio>
            </RadioGroup>
        );
    }

    //通话数量、通话时长按钮变化处理函数
    function handleRadioChange(chart, analysisInstance, e) {
        const value = e.target.value;

        if (value === 'count') {
            _.each(chart.data, item => {
                item.count = item.countBak;
            });
        } else {
            _.each(chart.data, item => {
                item.countBak = item.count;
                item.count = item.billsec_sum;
            });
        }

        const formatter = getTooltipFormatter(value);

        _.set(chart, 'option.tooltip.formatter', formatter);
        //设置数据显示类型，是数量还是时长
        _.set(chart, 'dataType', value);

        const charts = analysisInstance.state.charts;

        analysisInstance.setState({charts});
    }

    //获取tooltip格式化函数
    function getTooltipFormatter(type) {
        return function(params) {
            const weekdaysIndex = params.seriesIndex;
            const hour = params.value[0];
            let data = params.value[1];

            let dataName;

            if (type === 'count') {
                dataName = Intl.get('sales.home.call.cout', '通话数量');
            } else {
                dataName = Intl.get('call.record.call.duration', '通话时长');
                //时间格式的需要将秒数转成x小时x分x秒
                data = timeUtil.secondsToHourMinuteSecond(data).timeDescr;
            }

            return `${days[weekdaysIndex]}${hour}${Intl.get('crm.75', '点')}
                 <br/>
                 ${dataName}：${data}`;
        };
    }

    function getOption() {
        var options = {
            tooltip: {
                formatter: getTooltipFormatter('count')
            },
            singleAxis: [],
            title: [],
        };

        _.each(days, (label, idx) => {
            options.title.push({
                top: (idx * 100 / SEGMENT_COUNT + TITLE_VERTICAL_OFFSET_PERCENT) + '%',
            });

            options.singleAxis.push({
                axisLabel: {
                    show: label === Intl.get('user.time.saturday', '周六') ? true : false,
                },
                top: (idx * 100 / SEGMENT_COUNT + AXIS_VERTICAL_OFFSET_PERCENT) + '%',
                height: (100 / SEGMENT_COUNT - SYMBOL_VERTICAL_OFFSET_PERCENT) + '%'
            });
        });

        return options;
    }
}
