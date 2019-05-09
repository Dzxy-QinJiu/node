/**
 * 联系客户间隔统计
 */

import { argCallbackMemberIdsToMemberId } from '../../utils';

export function getContactCustomerIntervalChart(intervals) {
    intervals = intervals || [{
        name: '1-3天',
        min: 1,
        max: 3,
        unit: 'day'
    }, {
        name: '3-7天',
        min: 3,
        max: 7,
        unit: 'day'
    }, {
        name: '7-15天',
        min: 7,
        max: 15,
        unit: 'day'
    }, {
        name: '15天-1个月',
        min: 15,
        max: 30,
        unit: 'day'
    }, {
        name: '3个月-半年',
        min: 1,
        max: 3,
        unit: 'month'
    }, {
        name: '半年-1年',
        min: 6,
        max: 12,
        unit: 'month'
    }, {
        name: '1年及以上',
        min: 1,
        max: Infinity,
        unit: 'year'
    }];

    //将落在各时间区间里的客户数的默认值设为0
    _.each(intervals, interval => {
        interval.count = 0;
    });

    //设置落在各时间区间里的客户数
    function setIntervalCount(unit, num) {
        let interval = _.find(intervals, item => {
            if (item.unit === unit && num >= item.min && num < item.max) {
                return true;
            } else {
                return false;
            }
        });

        if (interval) {
            interval.count++;
        }
    }

    return {
        title: '联系客户间隔统计',
        chartType: 'bar',
        url: '/rest/analysis/customer/v2/customertrace/sale/contact/interval/statistics',
        argCallback: argCallbackMemberIdsToMemberId,
        processData: data => data,
        processOption: (option, chartProps) => {
            //平均时间间隔数据
            const avgData = _.get(chartProps, 'data.result.avg_data');

            //如果平均时间间隔数据不是数组，说明数据有问题，无需继续处理
            if (!_.isArray(avgData)) return;

            _.each(avgData, dataItem => {
                const duration = moment.duration(dataItem);
                const yearCount = duration.years();

                if (yearCount) {
                    setIntervalCount('year', yearCount);
                } else {
                    const monthCount = duration.months();

                    if (monthCount) {
                        setIntervalCount('month', monthCount);
                    } else {
                        const dayCount = duration.days();

                        if (dayCount) {
                            setIntervalCount('day', dayCount);
                        }
                    }
                }
            });

            //x轴标签数据
            let xAxisData = [];
            //系列数据
            let seriesData = [];

            _.each(intervals, interval => {
                xAxisData.push(interval.name);
                seriesData.push(interval.count);
            });

            option.xAxis[0].data = xAxisData;
            option.series[0].data = seriesData;
        },
        processCsvData: (chart, option) => {
            let csvData = [];

            const thead = _.get(option, 'xAxis[0].data');
            const tbody = _.get(option, 'series[0].data');

            csvData.push(thead);
            csvData.push(tbody);

            return csvData;
        }
    };
}
