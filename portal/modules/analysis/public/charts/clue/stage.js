/**
 * 线索阶段统计
 */

import { initialTime } from '../../consts';
import Store from '../../store';

export function getStageChart() {
    return {
        title: Intl.get('clue.stage.statics', '线索阶段统计'),
        chartType: 'funnel',
        url: '/rest/customer/v2/clue/:data_type/statistical/customer_label/1000/1',
        reqType: 'post',
        conditions: [{
            type: 'data',
            rangeParamName: 'name',
            value: 'source_time',
        }, {
            type: 'data',
            rangeParamName: 'type',
            value: 'time',
        }, {
            name: 'starttime',
            value: initialTime.start,
            type: 'data',
            rangeParamName: 'from',
        }, {
            name: 'endtime',
            value: initialTime.end,
            type: 'data',
            rangeParamName: 'to',
        }, {
            name: 'access_channel',
            value: '',
            type: 'data',
            inDataQuery: true,
        }, {
            name: 'clue_source',
            value: '',
            type: 'data',
            inDataQuery: true,
        }],
        dataField: 'result',
        processData: processClueStaticsStageData,
        noExportCsv: true,
        customOption: {
            valueField: 'showValue',
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

function processClueStaticsStageData(data) {
    const customerStages = [
        {
            tagName: Intl.get('sales.stage.intention', '意向'),
            tagValue: 'intention',
        },
        {
            tagName: Intl.get('common.trial', '试用'),
            tagValue: 'trial',
        },
        {
            tagName: Intl.get('common.trial.qualified', '试用合格'),
            tagValue: 'qualified',
        },
        {
            tagName: Intl.get('sales.stage.signed', '签约'),
            tagValue: 'signed',
        }
    ];

    let processedData = [];
    let prevStageValue;
    customerStages.forEach(stage => {
        let stageValue = 0;
        _.forEach(data, (item) => {
            _.forEach(item, (value, key) => {
                if (key === stage.tagName) {
                    stageValue = value;
                }
            });
        });
        if (stageValue) {
            //保留原始值，用于在图表上显示
            const showValue = stageValue;

            // 如果下一阶段的值比上一阶段的值大，则将下一阶段的值变得比上一阶段的值小，以便能正确排序
            if (prevStageValue && stageValue > prevStageValue) {
                stageValue = prevStageValue * 0.8;
            }

            //将暂存的上一阶段的值更新为当前阶段的值，以供下一循环中使用
            prevStageValue = stageValue;

            processedData.push({
                name: stage.tagName,
                value: stageValue,
                showValue,
            });
        }
    });

    return processedData;
}
