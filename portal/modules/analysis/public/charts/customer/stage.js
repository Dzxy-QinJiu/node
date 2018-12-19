/**
 * 客户阶段统计
 */

import { processCustomerStageData } from 'PUB_DIR/sources/utils/analysis-util';

export function getCustomerStageChart(type = 'total') {
    return {
        title: Intl.get('oplate_customer_analysis.customer_stage', '客户阶段统计'),
        url: '/rest/analysis/customer/stage/label/:auth_type/summary',
        chartType: 'funnel',
        argCallback: (arg) => {
            if (arg.query) {
                arg.query.starttime = 0;

                if (arg.query.end_time) {
                    arg.query.endtime = arg.query.end_time;
                    delete arg.query.end_time;
                }

                if (!arg.query.app_id) {
                    arg.query.app_id = 'all';
                }
            }
        },
        processData: processCustomerStageData,
        customOption: {
            valueField: 'showValue',
            minSize: '5%',
        },
    };
}
