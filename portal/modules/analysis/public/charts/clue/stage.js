/**
 * 线索阶段统计
 */

import { getFunnelWithConvertRateProcessDataFunc, funnelWithConvertRateProcessCsvData } from '../../utils';

import Store from '../../store';

export function getStageChart() {
    return {
        title: Intl.get('clue.stage.statics', '线索阶段统计'),
        chartType: 'funnel',
        url: [
            '/rest/analysis/customer/v2/clue/:data_type/realtime/stage',
            '/rest/analysis/customer/v2/clue/:data_type/statistical/field/access_channel',
            '/rest/analysis/customer/v2/clue/:data_type/statistical/field/clue_source',
        ],
        conditions: [{
            name: 'access_channel',
            value: '',
        }, {
            name: 'clue_source',
            value: '',
        }],
        processData: (data, chart) => {
            //设置渠道筛选器
            setSelector(data, 1, chart, '全部渠道', 'access_channel');

            //设置来源筛选器
            setSelector(data, 2, chart, '全部来源', 'clue_source');

            const stageData = data[0];

            const func = getFunnelWithConvertRateProcessDataFunc([
                {
                    key: 'total',
                    name: Intl.get('common.all', '全部')
                },
                {
                    key: 'vailid',
                    name: Intl.get('clue.analysis.ability', '有效')
                },
                {
                    key: 'information',
                    name: Intl.get('sales.stage.message', '信息')
                },
                {
                    key: 'intention',
                    name: Intl.get('sales.stage.intention', '意向')
                },
                {
                    key: 'trial',
                    name: Intl.get('common.trial', '试用')
                },
                {
                    key: 'sign',
                    name: Intl.get('common.official', '签约')
                }
            ], '', 'STAGE_NAME');

            return func(stageData);
        },
        processCsvData: funnelWithConvertRateProcessCsvData,
        customOption: {
            valueField: 'showValue',
            showConvertRate: true,
        },
    };

    function setSelector(data, dataIndex, chart, itemAllName, conditionName) {
        if (!chart.cardContainer) chart.cardContainer = {selectors: []};

        const selector = _.find(chart.cardContainer.selectors, item => item.conditionName === conditionName);

        if (!selector) {
            //选项数据
            let optionData = _.get(data, `[${dataIndex}].result`);
            //将选项数据按值从小到大排序，以和相应统计中的图例顺序保持一致
            optionData = _.sortBy(optionData, item => _.values(item)[0]);
            //名称列表
            let list = [];
        
            _.each(optionData, item => {
                list = _.concat(list, _.keys(item));
            });
        
            chart.cardContainer.selectors.push({
                optionsCallback: () => {
                    let options = [{
                        name: itemAllName,
                        value: '',
                    }];
        
                    _.map(list, item => {
                        options.push({
                            name: item,
                            value: item
                        });
                    });
        
                    return options;
                },
                activeOption: '',
                conditionName,
            });
        }
    }
}
