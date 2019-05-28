/**
 * 通话时段统计
 */

import timeUtil from 'PUB_DIR/sources/utils/time-format-util';
import { Radio } from 'antd';
const RadioGroup = Radio.Group;

const hours = _.range(24);
const days = [Intl.get('user.time.sunday', '周日'), Intl.get('user.time.monday', '周一'), Intl.get('user.time.tuesday', '周二'), Intl.get('user.time.wednesday', '周三'), Intl.get('user.time.thursday', '周四'), Intl.get('user.time.friday', '周五'), Intl.get('user.time.saturday', '周六')];

export function getCallTimeIntervalChart() {
    return {
        title: '通话时段统计',
        chartType: 'scatter',
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

            const thead = [''].concat(_.get(option, 'singleAxis[0].data', []));

            csvData.push(thead);

            _.each(option.title, (item, index) => {
                let tr = [];

                tr.push(item.text);

                const serie = option.series[index];

                _.each(serie.data, item => {
                    tr.push(item[1]);
                });

                csvData.push(tr);
            });

            return csvData;
        },
        option: getOption('通话数量'),
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

    function getOption(dataName, dataType) {
        var options = {
            tooltip: {
                formatter: getTooltipFormatter('count')
            },
            singleAxis: [],
            title: [],
        };

        _.each(days, (label, idx) => {
            options.title.push({
                top: (idx + 0.5) * 100 / 10 + '%'
            });

            options.singleAxis.push({
                axisLabel: {
                    show: label === Intl.get('user.time.saturday', '周六') ? true : false,
                },
                top: (idx * 100 / 10 + 5) + '%',
                height: (100 / 10 - 10) + '%'
            });
        });

        return options;
    }
}
