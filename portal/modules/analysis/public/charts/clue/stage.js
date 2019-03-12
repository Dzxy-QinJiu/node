/**
 * 线索阶段统计
 */

import Store from '../../store';

export function getStageChart() {
    return {
        title: Intl.get('clue.stage.statics', '线索阶段统计'),
        chartType: 'funnel',
        url: '/rest/analysis/customer/v2/clue/:data_type/statistical/field/customer_label',
        conditions: [{
            name: 'access_channel',
            value: '',
        }, {
            name: 'clue_source',
            value: '',
        }],
        dataField: 'result',
        processData: data => {
            return _.map(data, item => {
                return {
                    name: _.keys(item)[0],
                    value: _.values(item)[0]
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
