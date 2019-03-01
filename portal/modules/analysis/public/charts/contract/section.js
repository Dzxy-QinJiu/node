/**
 * 合同额分段统计
 */

import { argCallbackUnderlineTimeToTime, argCallbackTeamIdsToTeamId, argCallbackMemberIdsToMemberId } from '../../utils';
import { num as antUtilNum } from 'ant-utils';

export function getContractSectionChart() {
    return {
        title: '合同额分段统计',
        chartType: 'bar',
        url: '/rest/analysis/contract/contract/:data_type/distribution/amount',
        reqType: 'post',
        conditions: [{
            value: getSectionReqData(),
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

                if (dataItem.from && dataItem.to) {
                    name = (dataItem.from / 10000) + '-' + (dataItem.to / 10000) + '万';
                } else if (!dataItem.from && dataItem.to) {
                    name = (dataItem.to / 10000) + '万以下';
                } else if (dataItem.from && !dataItem.to) {
                    name = (dataItem.from / 10000) + '万以上';
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
        customOption: {
            reverse: true,
        },
        processOption: option => {
            //柱子上显示的数值转为百分比
            _.set(option, 'series[0].itemStyle.normal.label.formatter', params => {
                return antUtilNum.decimalToPercent(params.value);
            });

            //横轴刻度值转为百分比
            _.set(option, 'xAxis.axisLabel.formatter', value => {
                return antUtilNum.decimalToPercent(value);
            });
        }
    };
}

function getSectionReqData() {
    let sections = [];

    const spec = 100;
    const step = 5;

    for (let i = 0; i <= spec; i += step) {
        sections.push({
            from: i * 10000,
            to: (i + step) <= spec ? (i + step) * 10000 : 0,
        });
    }

    return sections;
}
