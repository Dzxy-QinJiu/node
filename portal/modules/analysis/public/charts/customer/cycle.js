/**
 * 成交周期分析
 */

import { argCallbackUnderlineTimeToTime, argCallbackTeamIdsToTeamId, argCallbackMemberIdsToMemberId } from '../../utils';

export function getContractCycleChart() {
    return {
        title: Intl.get('analysis.trial.to.the.signing.period', '试用到签约周期'),
        chartType: 'bar',
        customOption: {
            showValueAsPercent: true,
            showYaxisLabelAsPercent: true
        },
        url: '/rest/analysis/contract/contract/:data_type/customer/cycle',
        reqType: 'post',
        conditions: [{
            value: getCycleReqData(),
            type: 'data',
        }],
        argCallback: arg => {
            argCallbackUnderlineTimeToTime(arg);
            argCallbackTeamIdsToTeamId(arg);
            argCallbackMemberIdsToMemberId(arg);
        },
        processData: data => {
            return _.map(data, dataItem => {
                let name;

                if (dataItem.to === 0.5) {
                    name = '6个月内';
                } else if (dataItem.to === 1) {
                    name = '6-12个月';
                } else if (dataItem.from >= 1 && dataItem.to) {
                    name = dataItem.from + '-' + dataItem.to + '年';
                } else if (dataItem.from && !dataItem.to) {
                    name = dataItem.from + '年以上';
                } else {
                    name = '';
                }

                const value = dataItem.percent;

                return {
                    name,
                    value
                };
            });
        },
    };
}

function getCycleReqData() {
    let cycles = [];

    const spec = 2;
    const step = 0.5;

    for (let i = 0; i <= spec; i += step) {
        cycles.push({
            from: i,
            to: (i + step) <= spec ? (i + step) : 0,
        });
    }

    return cycles;
}
