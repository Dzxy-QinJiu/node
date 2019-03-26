/**
 * 合格客户数统计
 */

import { CUSTOMER_STAGE } from '../../consts';
import { argCallbackUnderlineTimeToTime, argCallbackMemberIdToMemberIds } from '../../utils';

export function getCustomerNumChart(stage) {
    return {
        title: '合格客户数统计',
        chartType: 'table',
        url: '/rest/analysis/customer/stage/label/:auth_type/summary',
        argCallback: (arg) => {
            //在个人报告里调用时会传member_id，需要改成member_ids
            argCallbackMemberIdToMemberIds(arg);

            argCallbackUnderlineTimeToTime(arg);

            //这个统计是总体累计值，所以要把开始时间置为0
            if (arg.query) {
                arg.query.starttime = 0;
            }

            //app_id为必填参数，若参数中没有，需要设个默认的
            if (!_.get(arg, 'query.app_id')) {
                _.set(arg, 'query.app_id', 'all');
            }

            //按成员查询时，若未传返回类型参数，需要设个默认的，默认按成员返回
            if (_.has(arg, 'query.member_ids') && !_.has(arg, 'query.statistics_type')) {
                _.set(arg, 'query.statistics_type', 'user');
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
