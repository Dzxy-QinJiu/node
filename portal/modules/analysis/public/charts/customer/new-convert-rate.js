/**
 * 新开客户转化率统计
 */

import { processCustomerStageData } from 'PUB_DIR/sources/utils/analysis-util';

export function getNewCustomerConvertRateChart() {
    return {
        title: '新开客户转化率统计',
        url: '/rest/analysis/customer/stage/label/:auth_type/summary',
        chartType: 'funnel',
        processData: processCustomerStageData,
        customOption: {
            valueField: 'showValue',
            minSize: '5%',
        },
    };
}
