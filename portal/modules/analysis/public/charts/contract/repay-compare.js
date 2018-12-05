/**
 * 回款同期对比
 */

import { argCallbackTeamId } from '../../utils';

export function getContractRepayCompareChart() {
    return {
        title: '回款同期对比',
        chartType: 'line',
        url: '/rest/analysis/contract/contract/:data_type/repay/trend',
        conditions: [{
            name: 'year',
            value: 3
        }],
        argCallback: argCallbackTeamId,
        processData: data => data,
        processOption: (option, chartProps) => {
            //设置纵轴左边距，以便能完整显示金额数值
            option.grid.left = 80;

            //数值第一项中的时间点列表
            const timePoints = _.get(chartProps.data, '[0].timePoints');

            //将横轴标签设置为时间点中的月
            option.xAxis[0].data = _.map(timePoints, timePoint => {
                return moment(timePoint.timestamp).month() + 1 + Intl.get('common.time.unit.month', '月');
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
    };
}
