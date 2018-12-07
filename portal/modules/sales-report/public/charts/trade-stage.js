/**
 * 订单阶段统计
 */

import { processOrderStageData } from 'PUB_DIR/sources/utils/analysis-util';

export function getOrderStageChart(stageList) {
    return {
        title: Intl.get('oplate_customer_analysis.11', '订单阶段统计'),
        chartType: 'horizontalStage',
        url: '/rest/analysis/customer/v2/:auth_type/total/stage',
        argCallback: args => {
            args.query.starttime = args.query.start_time;
            args.query.endtime = args.query.end_time;
            args.query.app_id = 'all';

            delete args.query.start_time;
            delete args.query.end_time;
        },
        processData: (data) => {
            return processOrderStageData(stageList, data);
        },
    };
}
