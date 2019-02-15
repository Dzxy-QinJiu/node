/**
 * 合格客户数统计
 */

import { CUSTOMER_STAGE } from '../../consts';
import { argCallbackUnderlineTimeToTime, argCallbackMemberIdsToMemberId } from '../../utils';

export function getCustomerNumChart(stage) {
    return {
        title: '合格客户数统计',
        chartType: 'table',
        url: '/rest/analysis/customer/stage/label/:auth_type/summary',
        argCallback: arg => {
            argCallbackMemberIdsToMemberId(arg);
            argCallbackUnderlineTimeToTime(arg);

            if (arg.query) {
                arg.query.starttime = 0;

                if (!arg.query.app_id) {
                    arg.query.app_id = 'all';
                }
            }
        },
        processOption: (option, chartProps) => {
            let columns = [];
            let dataSource = [];
            let data = chartProps.data;

            if (_.isObject(data)) {
                if (stage) {
                    columns.push({
                        title: CUSTOMER_STAGE[stage] + '客户数',
                        dataIndex: stage,
                    });
                } else {
                    data.total = data.message + data.intention + data.trial + data.signed + data.unknown;

                    columns.push({
                        title: '总客户数',
                        dataIndex: 'total',
                        width: '50%',
                    }, {
                        title: '签约客户数',
                        dataIndex: 'signed',
                        width: '50%',
                    });
                }

                dataSource.push(data);
            }

            option.columns = columns;
            option.dataSource = dataSource;
        }
    };
}
