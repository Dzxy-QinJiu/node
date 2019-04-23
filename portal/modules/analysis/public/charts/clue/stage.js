/**
 * 线索阶段统计
 */

import { getFunnelWithConvertRateProcessDataFunc } from '../../utils';

import Store from '../../store';

export function getStageChart() {
    return {
        title: Intl.get('clue.stage.statics', '线索阶段统计'),
        chartType: 'funnel',
        url: '/rest/analysis/customer/v2/clue/:data_type/realtime/stage',
        conditions: [{
            name: 'access_channel',
            value: '',
        }, {
            name: 'clue_source',
            value: '',
        }],
        processData: getFunnelWithConvertRateProcessDataFunc([
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
        ], ': ', '', 'STAGE_NAME'),
        noExportCsv: true,
        customOption: {
            valueField: 'showValue',
            showConvertRate: true,
        },
        cardContainer: {
            selectors: [{
                optionsCallback: () => {
                    let options = [{
                        name: '全部渠道',
                        value: '',
                    }];

                    _.map(Store.clueChannelList, item => {
                        options.push({
                            name: item,
                            value: item
                        });
                    });

                    return options;
                },
                activeOption: '',
                conditionName: 'access_channel',
            }, {
                optionsCallback: () => {
                    let options = [{
                        name: '全部来源',
                        value: '',
                    }];

                    _.map(Store.clueSourceList, item => {
                        options.push({
                            name: item,
                            value: item
                        });
                    });

                    return options;
                },
                activeOption: '',
                conditionName: 'clue_source',
            }],
        },
    };
}
