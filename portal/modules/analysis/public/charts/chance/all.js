/**
 * 所有机会统计
 */

import { argCallbackTimeMember } from '../../utils';

export function getAllChanceChart() {
    return {
        title: '所有机会统计',
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
            //接口返回数据中的第一条记录
            const firstDataItem = _.get(chartProps.data, '[0]');

            //如果接口返回数据中的第一条记录中不包含昵称字段，说明返回的是团队数据，需要把列定义中的成员列移除掉
            if (!_.has(firstDataItem, 'nick_name')) {
                const memberNameColumnIndex = _.findIndex(option.columns, column => column.dataIndex === 'nick_name');

                if (memberNameColumnIndex > -1) {
                    option.columns.splice(memberNameColumnIndex, 1);
                }
            }
        },
    };
}
