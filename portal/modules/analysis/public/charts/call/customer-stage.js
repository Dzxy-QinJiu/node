/**
 * 客户阶段统计
 */

export function getCallCustomerStageChart() {
    return {
        title: '客户阶段统计',
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
        dataField: 'customer_label_sum',
    };
}
