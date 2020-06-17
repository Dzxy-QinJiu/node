/**
 * 历史同期数量统计对比
 */

export function getClueHistoricalPeriodComparisionChart() {
    return {
        title: Intl.get('analysis.statistical.comparison.of.quantity.in.the.same.period.of.history', '历史同期数量统计对比'),
        chartType: 'bar',
        url: '/rest/analysis/customer/v2/clue/:data_type/historical/period/comparision',
        argCallback: arg => {
            _.set(arg, 'query.interval', 'month');
        },
        option: {
            yAxis: [{
                //设置成1保证坐标轴分割刻度显示成整数
                minInterval: 1,
            }]
        },
        processOption: (option, chartProps) => {
            const data = chartProps.data;

            function itemMapFunc(item) {
                return {
                    name: moment(item.date_str).month() + 1 + Intl.get('common.time.unit.month', '月'),
                    value: item.num
                };
            }

            //全部数据
            //包含从开始时间到结束时间里每个年份前推3年的数据
            //因为年份可能会重叠，所以有重复数据
            const allData = data.before_last_list.concat(data.last_list).concat(data.current_list);
            //去重后的数据
            const uniqData = _.uniqBy(allData, 'date');
            //将去重后的数据按年份分组
            const groupedData = _.groupBy(uniqData, item => item.date_str.substr(0, 4));
            
            option.series = [];
            option.legend.data = [];

            _.each(groupedData, (value, key) => {
                const year = key + Intl.get('common.time.unit.year', '年');

                option.legend.data.push(year);
                option.series.push({
                    name: year,
                    type: 'bar',
                    data: _.map(value, itemMapFunc),
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
        },
        processCsvData: (chart, option) => {
            const firstSerieData = _.get(option, 'series[0].data');

            if (_.isEmpty(firstSerieData)) {
                return;
            }

            let csvData = [];

            let thead = [''].concat(_.map(firstSerieData, 'name'));

            csvData.push(thead);

            _.each(option.series, (serie, index) => {
                let tr = [serie.name];

                tr = tr.concat(_.map(serie.data, 'value'));

                csvData.push(tr);
            });

            return csvData;
        }
    };
}
