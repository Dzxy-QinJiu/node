/**
 * 通话时段统计
 */

import timeUtil from 'PUB_DIR/sources/utils/time-format-util';

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
        processData: data => {
            return _.map(data, item => {
                return {
                    week: item.week,
                    hour: item.hour,
                    count: item.count
                };
            });
        },
        option: getOption('通话数量'),
        yAxisLabels: days,
        xAxisLabels: hours,
    };
}

function getOption(dataName, dataType) {
    var options = {
        tooltip: {
            formatter: function(obj) {
                var weekdaysIndex = obj.seriesIndex;
                var hour = obj.value[0];
                var data = obj.value[1];
                if (dataType === 'time') {
                    //时间格式的需要将秒数转成x小时x分x秒
                    let timeObj = timeUtil.secondsToHourMinuteSecond(data);
                    data = timeObj.timeDescr;
                }
                return `${days[weekdaysIndex]}${hour}${Intl.get('crm.75', '点')}
                     <br/>
                     ${dataName}：${data}`;
            }
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
