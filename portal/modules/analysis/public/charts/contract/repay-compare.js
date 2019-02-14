/**
 * 回款同期对比
 */

import { argCallbackTeamIdsToTeamId } from '../../utils';

export function getContractRepayCompareChart() {
    return {
        title: '回款同期对比',
        chartType: 'line',
        url: '/rest/analysis/contract/contract/:data_type/repay/trend',
        conditions: [{
            name: 'year',
            value: 3
        }, {
            name: 'interval',
            value: 'month'
        }],
        argCallback: args => {
            argCallbackTeamIdsToTeamId(args),

            args.query.starttime = moment().startOf('year').valueOf();
            args.query.endtime = moment().endOf('year').valueOf();
        },
        processData: data => data,
        processOption: (option, chartProps) => {
            //设置纵轴左边距，以便能完整显示金额数值
            option.grid.left = 80;

            //数值第一项
            const firstDataItem = _.get(chartProps.data, '[0]');

            //时间点列表
            const timePoints = _.get(firstDataItem, 'timePoints');

            //统计时间区间
            const interval = _.get(firstDataItem, 'interval');

            //设置横轴标签
            option.xAxis[0].data = _.map(timePoints, timePoint => {
                let label = '';

                if (interval === 'month') {
                    label = moment(timePoint.timestamp).month() + 1 + Intl.get('common.time.unit.month', '月');
                } else if (interval === 'quarter') {
                    label = moment(timePoint.timestamp).quarter() + Intl.get('common.time.unit.quarter', '季度');
                }

                return label;
            });

            //图表组件生成的默认系列
            let defaultSerie = option.series[0];
            //去掉默认系列中的数据，只保留配置部分
            delete defaultSerie.data;
            //用处理后的默认系列生成基础系列
            const baseSerie = _.cloneDeep(defaultSerie);

            //图表系列数组
            option.series = [];
            //图表图例数据数组
            option.legend.data = [];

            _.each(chartProps.data, dataItem => {
                const legendDataItem = moment(dataItem.timestamp).year() + Intl.get('common.time.unit.year', '年');
                //将返回数据中的年作为图例值填充到图例数据数组
                option.legend.data.push(legendDataItem); 

                //用基础系列生成当前系列
                let serie = _.cloneDeep(baseSerie);

                //设置系列名
                serie.name = legendDataItem; 
                //设置系列数值
                serie.data = _.map(dataItem.timePoints, 'value');

                //将当前系列加入图表系列数组
                option.series.push(serie);
            });
        },
        cardContainer: {
            selectors: [{
                options: [{
                    name: '统计区间：月',
                    value: 'month',
                }, {
                    name: '统计区间：季度',
                    value: 'quarter',
                }],
                activeOption: 'month',
                conditionName: 'interval',
            }, {
                optionsCallback: () => {
                    let options = [];

                    for (let i = 2; i <= 10; i++) {
                        options.push({
                            name: `统计范围：近${i}年`,
                            value: i,
                        });
                    }

                    return options;
                },
                activeOption: 3,
                conditionName: 'year',
            }],
        },
    };
}
