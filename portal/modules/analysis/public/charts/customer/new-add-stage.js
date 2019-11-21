/**
 * 线索阶段统计
 */

import {
    argCallbackMemberIdToMemberIds,
    argCallbackUnderlineTimeToTime,
    funnelWithConvertRateProcessCsvData,
    getFunnelWithConvertRateProcessDataFunc
} from '../../utils';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import analysisPrivilegeConst from 'MOD_DIR/analysis/public/privilege-const';
export function getCustomerNewAddStageChart(paramObj = {}) {
    let type = hasPrivilege(analysisPrivilegeConst.CURTAO_CRM_CUSTOMER_ANALYSIS_ALL) ? 'all' : 'self';
    return {
        title: Intl.get('oplate_customer_analysis.customer_stage', '客户阶段统计'),
        url: `/rest/analysis/customer/v3/${type}/customer/realtime/stage`,
        chartType: 'funnel',
        argCallback: (arg) => {
            //在个人报告里调用时会传member_id，需要改成member_ids
            argCallbackMemberIdToMemberIds(arg);

            //app_id为必填参数，若参数中没有，需要设个默认的
            if (!_.get(arg, 'query.app_id')) {
                _.set(arg, 'query.app_id', 'all');
            }

            //按成员查询时，若未传返回类型参数，需要设个默认的，默认按成员返回
            if (_.has(arg, 'query.member_ids') && !_.has(arg, 'query.statistics_type')) {
                _.set(arg, 'query.statistics_type', 'user');
            }
        },
        processData: getFunnelWithConvertRateProcessDataFunc([
            {
                name: Intl.get('sales.stage.message', '信息'),
                key: 'information',
            },
            {
                name: Intl.get('sales.stage.intention', '意向'),
                key: 'intention',
            },
            {
                name: Intl.get('common.trial', '试用'),
                key: 'trial',
            },
            {
                name: Intl.get('common.chance', '机会'),
                key: 'chance',
            },
            {
                name: Intl.get('sales.stage.signed', '签约'),
                key: 'sign',
            },
        ], '', 'STAGE_NAME'),
        processCsvData: funnelWithConvertRateProcessCsvData,
        customOption: {
            valueField: 'showValue',
            minSize: '5%',
            showConvertRate: true,
        },
        csvOption: {
            //导出的csv数据的取值从showValue字段中取而非从默认的value中取
            //因为为了显示效果需要，value有可能已不是真实的数据值，showValue才是
            valueField: 'showValue',
        },
    };
}
