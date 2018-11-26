/**
 * 历史同期数量统计对比
 */

import { argCallbackTimeMember } from '../../utils';

export function getClueHistoricalPeriodComparisionChart() {
    return {
        title: '历史同期数量统计对比',
        chartType: 'bar',
        url: '/rest/analysis/customer/v2/clue/:data_type/historical/period/comparision',
        argCallback: argCallbackTimeMember,
        processOption: (option, chartProps) => {
            const data = chartProps.data;

            function itemMapFunc(item) {
                return {
                    name: moment(item.date_str).month() + 1 + Intl.get('common.time.unit.month', '月'),
                    value: item.num
                };
            }

            const dataArr = [
                data.before_last_list,
                data.last_list,
                data.current_list
            ];
            
            option.series = [];
            option.legend.data = [];

            _.each(dataArr, dataArrItem => {
                const dateStr = _.get(dataArrItem, '[0].date_str');
                const year = moment(dateStr).year() + Intl.get('common.time.unit.year', '年');

                option.legend.data.push(year);
                option.series.push({
                    name: year,
                    type: 'bar',
                    data: _.map(dataArrItem, itemMapFunc),
                    itemStyle: {
                        normal: {
                            label: {
                                show: true,
                                position: 'top',
                            }
                        }
                    }
                });

            });

            option.xAxis[0].data = _.map(option.series[0].data, item => item.name);
        }
    };
}
