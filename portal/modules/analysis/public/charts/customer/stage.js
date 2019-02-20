/**
 * 客户阶段统计
 */

import { processCustomerStageData } from 'PUB_DIR/sources/utils/analysis-util';

export function getCustomerStageChart(paramObj = {}) {
    return {
        title: Intl.get('oplate_customer_analysis.customer_stage', '客户阶段统计'),
        url: '/rest/analysis/customer/stage/label/:auth_type/summary',
        chartType: 'funnel',
        argCallback: (arg) => {
            if (arg.query) {
                arg.query.starttime = 0;

                //在个人报告里调用时会传member_id，需要改成member_ids
                if (arg.query.member_id) {
                    arg.query.member_ids = arg.query.member_id;
                    delete arg.query.member_id;
                }
            }

            if (_.isFunction(paramObj.argCallback)) {
                paramObj.argCallback(arg);
            }
        },
        processData: processCustomerStageData,
        customOption: {
            valueField: 'showValue',
            minSize: '5%',
        },
    };
}
