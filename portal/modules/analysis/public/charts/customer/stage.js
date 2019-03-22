/**
 * 客户阶段统计
 */

import { processCustomerStageData } from 'PUB_DIR/sources/utils/analysis-util';
import { argCallbackMemberIdToMemberIds, argCallbackUnderlineTimeToTime } from '../../utils';

export function getCustomerStageChart(paramObj = {}) {
    return {
        title: Intl.get('oplate_customer_analysis.customer_stage', '客户阶段统计'),
        url: '/rest/analysis/customer/stage/label/:auth_type/summary',
        chartType: 'funnel',
        argCallback: (arg) => {
            //在个人报告里调用时会传member_id，需要改成member_ids
            argCallbackMemberIdToMemberIds(arg);

            //如果有页面级的统一处理，用统一处理
            if (_.isFunction(paramObj.argCallback)) {
                paramObj.argCallback(arg);
            //否则单独处理
            } else {
                argCallbackUnderlineTimeToTime(arg);
            }

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
        processData: processCustomerStageData,
        customOption: {
            valueField: 'showValue',
            minSize: '5%',
        },
        csvOption: {
            //导出的csv数据的取值从showValue字段中取而非从默认的value中取
            //因为为了显示效果需要，value有可能已不是真实的数据值，showValue才是
            valueField: 'showValue',
        },
    };
}
