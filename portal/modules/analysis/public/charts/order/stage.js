/**
 * 订单阶段统计
 */

import { processOrderStageData } from 'PUB_DIR/sources/utils/analysis-util';
import Store from '../../store';
import { argCallbackUnderlineTimeToTime, argCallbackMemberIdToMemberIds } from '../../utils';

export function getOrderStageChart(paramObj = {}) {
    const layout = paramObj.layout || {sm: 12};

    return {
        title: Intl.get('oplate_customer_analysis.11', '订单阶段统计'),
        url: [
            '/rest/customer/v2/salestage',
            '/rest/analysis/customer/v1/:auth_type/total/stage',
        ],
        argCallback: arg => {
            argCallbackUnderlineTimeToTime(arg);
            argCallbackMemberIdToMemberIds(arg);

            if (!_.get(arg, 'query.app_id')) {
                _.set(arg, 'query.app_id', 'all');
            }


            if (_.get(arg, 'query.member_ids')) {
                _.set(arg, 'query.statistics_type', 'user');
            }
        },
        chartType: 'horizontalStage',
        layout,
        processData: (data) => {
            const stageList = _.get(data, '[0].result', []);
            const stageData = _.get(data, '[1]', []);

            return processOrderStageData(stageList, stageData);
        },
    };
}
