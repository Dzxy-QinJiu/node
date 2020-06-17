/**
 * 合格客户数统计
 */

import { CUSTOMER_STAGE } from '../../consts';
import { argCallbackUnderlineTimeToTime, argCallbackMemberIdToMemberIds } from '../../utils';

export function getCustomerNumChart(paramsObj = {}) {
    const stage = paramsObj.stage;

    return {
        title: paramsObj.title || Intl.get('analysis.number.of.customers.statistics', '客户数统计'),
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
            let columns = [{dataIndex: 'value'}];
            let dataSource = [];
            let data = chartProps.data;

            if (_.isObject(data)) {
                if (stage) {
                    const title = CUSTOMER_STAGE[stage] + Intl.get('contract.169', '客户数');

                    dataSource = [{
                        value: title + ': ' + data[stage]
                    }];
                } else {
                    const titleTotal = Intl.get('analysis.total.customers', '总客户数');
                    const titleSigned = Intl.get('common.number.of.contracted.customers', '签约客户数');
                    const total = data.message + data.intention + data.trial + data.signed + data.unknown;

                    dataSource = [{
                        value: titleTotal + ': ' + total
                    }, {
                        value: titleSigned + ': ' + data.signed
                    }];
                }
            }

            //因为列数较少，按表格形式展示不太好看，所以把表头隐去，让展示上就像普通的文本行一样
            option.showHeader = false;

            option.columns = columns;
            option.dataSource = dataSource;
        },
        processCsvData: (chart, option) => {
            return _.map(option.dataSource, item => {
                return [item.value];
            });
        }
    };
}
