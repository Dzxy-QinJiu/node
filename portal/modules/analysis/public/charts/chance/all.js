/**
 * 团队或成员所有机会统计
 */

import { argCallbackTimeMember } from '../../utils';

export function getAllChanceChart() {
    return {
        title: '团队或成员所有机会统计',
        chartType: 'table',
        url: '/rest/analysis/customer/v2/sales_opportunity/:data_type/apply/opportunity/statistics',
        argCallback: argCallbackTimeMember,
        dataField: 'list',
        option: {
            columns: [
                {
                    title: '团队',
                    dataIndex: 'sales_team',
                    width: '20%',
                }, {
                    title: '成员',
                    dataIndex: 'nick_name',
                    width: '20%',
                }, {
                    title: '成交数',
                    dataIndex: 'deal',
                    width: '20%',
                }
            ],
        },
        processOption: (option, chartProps) => {
            const firstDataItem = _.get(chartProps.data, '[0]');

            if (!firstDataItem.nick_name) {
                const memberNameColumnIndex = _.find(option.columns, column => column.dataIndex === 'nick_name');

                if (memberNameColumnIndex) {
                    option.columns.splice(memberNameColumnIndex, 1);
                }
            }
        },
    };
}
