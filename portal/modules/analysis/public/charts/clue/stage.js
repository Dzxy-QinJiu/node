/**
 * 线索阶段统计
 */

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
        processData: data => {
            const stages = [
                {
                    enName: 'total',
                    cnName: '全部'
                },
                {
                    enName: 'vailid',
                    cnName: '有效'
                },
                {
                    enName: 'information',
                    cnName: '信息'
                },
                {
                    enName: 'intention',
                    cnName: '意向'
                },
                {
                    enName: 'trial',
                    cnName: '试用'
                },
                {
                    enName: 'sign',
                    cnName: '签约'
                }
            ];

            return _.map(stages, stage => {
                return {
                    name: stage.cnName,
                    value: data[stage.enName] || 0
                };
            });
        },
        noExportCsv: true,
        customOption: {
            minSize: '5%',
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
