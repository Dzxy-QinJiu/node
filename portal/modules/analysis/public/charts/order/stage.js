/**
 * 订单阶段统计
 */

import { processOrderStageData } from 'PUB_DIR/sources/utils/analysis-util';
import Store from '../../store';

export function getOrderStageChart() {
    return {
        title: Intl.get('oplate_customer_analysis.11', '订单阶段统计'),
        url: '/rest/analysis/customer/v1/:auth_type/:tab/stage',
        chartType: 'horizontalStage',
        layout: {sm: 24},
        processData: (data) => {
            return processOrderStageData(Store.stageList, data);
        },
    };
}
