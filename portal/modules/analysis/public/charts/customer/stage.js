/**
 * 客户阶段统计
 */

import { processCustomerStageData } from 'PUB_DIR/sources/utils/analysis-util';

export function getCustomerStageChart(type = 'total') {
    return {
        title: Intl.get('oplate_customer_analysis.customer_stage', '客户阶段统计'),
        url: '/rest/analysis/customer/stage/label/:auth_type/summary',
        chartType: 'funnel',
        processData: processCustomerStageData,
        customOption: {
            valueField: 'showValue',
            minSize: '5%',
        },
    };
}
