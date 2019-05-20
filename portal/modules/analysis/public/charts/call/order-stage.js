/**
 * 订单阶段统计
 */

import Store from '../../store';

export function getCallOrderStageChart() {
    return {
        title: '订单阶段统计',
        chartType: 'pie',
        url: '/rest/callrecord/v2/callrecord/query/:data_type/call_record/region/stage/statistic',
        argCallback: arg => {
            let query = arg.query;

            if (query) {
                query.filter_phone = false,
                query.effective_phone = false,
                query.device_type = 'all';
            }
        },
        dataField: 'opp_stage_sum',
        processData: data => {
            const stageList = Store.stageList;

            _.each(data, dataItem => {
                const stage = _.find(stageList, stageItem => stageItem.index === dataItem.name);

                if (stage) {
                    dataItem.name = stage.name;
                    dataItem.value = dataItem.count;
                }
            });

            return data;
        }
    };
}
