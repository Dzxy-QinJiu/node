/**
 * 团队或成员新机会统计
 */

import { argCallbackTimeMember } from '../../utils';

export function getNewChanceChart() {
    return {
        title: '团队或成员新机会统计',
        chartType: 'funnel',
        url: '/rest/analysis/customer/v2/sales_opportunity/:data_type/apply/opportunity/rate',
        argCallback: argCallbackTimeMember,
        customOption: {
            valueField: 'showValue',
            minSize: '5%',
        },
        dataField: 'result',
        processData: data => {
            const stages = [
                {
                    tagName: '提交数',
                    tagValue: 'total',
                },
                {
                    tagName: '通过数',
                    tagValue: 'pass',
                },
                {
                    tagName: '成交数',
                    tagValue: 'deal',
                }
            ];

            let processedData = [];
            let prevStageValue;

            stages.forEach(stage => {
                let stageValue = data[stage.tagValue];

                if (stageValue) {
                    //保留原始值，用于在图表上显示
                    const showValue = stage.tagName + '\n\n' + stageValue;

                    //转化率
                    let convertRate = '';
                    let convertTitle = '';

                    if (stage.tagValue === 'pass') {
                        convertRate = data['pass_rate'];
                        convertTitle = '通过率';
                    } else if (stage.tagValue === 'deal') {
                        convertRate = data['deal_rate'];
                        convertTitle = '成交率';
                    }

                    if (convertRate) {
                        convertRate = convertTitle + ': ' + (convertRate * 100) + '%';
                    }

                    processedData.push({
                        name: convertRate,
                        value: stageValue,
                        showValue,
                    });
                }
            });

            return processedData;
        }
    };
}
