/**
 * 客户阶段统计
 */

import { processCustomerStageData } from 'PUB_DIR/sources/utils/analysis-util';

export const customerStageChart = {
    title: Intl.get('oplate_customer_analysis.customer_stage', '客户阶段统计'),
    chartType: 'funnel',
    url: '/rest/analysis/customer/stage/label/:auth_type/summary',
    conditions: [{
        name: 'app_id',
        value: 'all'
    }],
    argCallback: arg => {
        arg.query.starttime = arg.query.start_time;
        arg.query.endtime = arg.query.end_time;
        delete arg.query.start_time;
        delete arg.query.end_time;
    },
    processData: processCustomerStageData,
    customOption: {
        valueField: 'showValue',
        minSize: '5%',
    },
};
