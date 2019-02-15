/**
 * 业绩同比增长情况
 */

import { argCallbackUnderlineTimeToTime, argCallbackTeamIdsToTeamId, argCallbackMemberIdsToMemberId } from '../../utils';

export function getContractGrowthChart() {
    return {
        title: '业绩同比增长情况',
        chartType: 'bar',
        url: '/rest/analysis/contract/contract/:data_type/repay/trend',
        conditions: [{
            name: 'year',
            value: 3
        }, {
            name: 'interval',
            value: 'year'
        }],
        argCallback: arg => {
            argCallbackUnderlineTimeToTime(arg);
            argCallbackTeamIdsToTeamId(arg),
            argCallbackMemberIdsToMemberId(arg);

            arg.query.starttime = moment().startOf('year').valueOf();
            arg.query.endtime = moment().endOf('year').valueOf();
        },
        processData: data => {
            return _.map(data, dataItem => {
                let unit = Intl.get('common.time.unit.year', '年');

                if (dataItem.interval === 'first_half_year') {
                    unit = '上半年';
                } else if (dataItem.interval === 'second_half_year') {
                    unit = '下半年';
                }

                return {
                    name: moment(dataItem.timestamp).year() + unit,
                    value: dataItem.timePoints[0].value
                };
            });
        },
        option: {
            grid: {
                left: 80
            }
        },
        cardContainer: {
            selectors: [{
                options: [{
                    name: '统计区间：年',
                    value: 'year',
                }, {
                    name: '统计区间：上半年',
                    value: 'first_half_year',
                }, {
                    name: '统计区间：下半年',
                    value: 'second_half_year',
                }],
                activeOption: 'year',
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
