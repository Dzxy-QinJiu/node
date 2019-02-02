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
